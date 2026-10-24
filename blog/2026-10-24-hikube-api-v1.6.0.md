---
title: Hikube API v1.6.0
authors: [hikube]
tags: [release]
---

L'API gagne un service de sauvegarde et de restauration pour PostgreSQL, MariaDB, les VM et les disques, avec la restauration PostgreSQL à un instant précis. Les bases managées peuvent être redémarrées, et une VM renvoie désormais à part son adresse interne et son adresse publique. Les requêtes `PATCH` deviennent de vraies mises à jour partielles : un champ absent du corps garde sa valeur.

<!-- truncate -->

## Ajouté

- **Sauvegardes** — Un nouveau service sauvegarde et restaure les clusters PostgreSQL et MariaDB, les VM et les disques. Les autres services (MongoDB, Redis, RabbitMQ, Kubernetes, buckets) ne sont pas pris en charge : une demande les concernant est refusée avec le code `180107`.

- **Sauvegardes : destinations** — Une destination associe un bucket du projet, l'utilisateur de bucket dont elle utilise les identifiants, et une rétention en jours. Les archives sont écrites dans votre bucket et occupent son stockage : il n'y a ni stockage fourni par la plateforme, ni quota de sauvegarde à part. Sur un bucket verrouillé (WORM), la rétention ne peut pas être plus courte que le verrou (`180218`). Une destination ne peut pas être supprimée tant qu'un plan, une sauvegarde en cours ou une restauration l'utilise. Sa suppression ne touche pas aux archives déjà écrites dans le bucket.

- **Sauvegardes : plans et sauvegardes à la demande** — Un plan programme une sauvegarde récurrente avec une expression cron à cinq champs, ou `@hourly`, `@daily`, `@weekly`, `@monthly` et `@yearly`. L'horaire est interprété en UTC, et le champ `nextRunAt` donne la prochaine exécution. Une programmation plus fréquente qu'une fois par heure est refusée (`180106`), tout comme `@every` et les préfixes de fuseau horaire (`180105`). Une sauvegarde peut aussi être lancée à la demande, puis annulée tant qu'elle n'est pas terminée.

- **Sauvegardes : archives** — Chaque archive indique si elle est restaurable. Si elle ne l'est pas, `notRestorableCause` donne la raison sous forme de valeur fermée (`not_ready`, `destination_removed`, `destination_tearing_down`, `destination_replaced`, `destination_unverified`, `stored_archive_gone`), et `notRestorableReason` la phrase à afficher. Une destination recréée sous le même nom ne rend pas restaurables les archives écrites avant sa création. Une fois leur rétention dépassée, les archives sont retirées automatiquement. L'archive restaurable la plus récente de chaque application est toujours conservée, quel que soit son âge.

- **Sauvegardes : suppression d'une archive** — Pour PostgreSQL et MariaDB, supprimer une archive retire seulement sa fiche : les données restent dans votre bucket. Pour une VM ou un disque, les données sont détruites de façon irréversible. La requête doit alors porter `confirm_destructive=true`, et la réponse l'indique dans `archiveDeleted`. Une archive verrouillée par un bucket WORM ne peut pas être supprimée avant la fin du verrou (`180217`).

- **Sauvegardes : restauration** — Une archive se restaure sur l'application d'origine, ou, pour PostgreSQL et MariaDB, sur une autre application du même type. Toute restauration qui écrase des données demande `confirmDestructive`. Une archive PostgreSQL ne se restaure que sur une base de la même version majeure (`180224`). Pendant une restauration, l'application refuse les sauvegardes à la demande (`180205`).

- **Sauvegardes : restauration PostgreSQL à un instant** — Une archive PostgreSQL se restaure dans l'état exact de la sauvegarde (`restorePoint: backup`, par défaut), dans l'état le plus récent archivé (`latest`), ou à un instant choisi (`recoveryTime`). La fenêtre de restauration de chaque archive (`recoveryWindow`) donne les bornes à respecter, à la microseconde. Renvoyez-les telles quelles, sans les recalculer. Un instant hors de la fenêtre est refusé (`180214`).

- **Sauvegardes : restauration d'une VM** — Les disques actuels de la VM sont remplacés par ceux de l'archive. Avec `originalDisks: discard` (par défaut), leur ancien contenu est supprimé une fois la restauration réussie. Avec `keep`, il est conservé dans un disque à part, nommé `<disque>-orig-<id>`, détaché. Une restauration qui échoue ou qui est annulée ne supprime rien. Avant de passer à `succeeded`, la restauration vérifie que chaque disque de l'archive a bien été réécrit. Une restauration de VM qui ne se termine pas peut être annulée. Un disque ne se restaure pas par-dessus lui-même tant qu'il existe (`180225`) : restaurez une sauvegarde de la VM qui le porte. Une VM ou un disque supprimé puis recréé sous le même nom depuis la sauvegarde est refusé (`180222`).

- **Bases de données managées** — Les clusters PostgreSQL, MariaDB, MongoDB, RabbitMQ et Redis peuvent être redémarrés (`POST .../clusters/{name}/restart`). PostgreSQL redémarre ses instances l'une après l'autre. Les autres services redémarrent toutes leurs instances, ce qui interrompt brièvement le service. Les données sont conservées.

- **Redis** — Le nouveau champ `restartRequired` indique qu'un changement d'authentification ou une rotation de mot de passe attend un redémarrage du cluster pour s'appliquer.

- **Compute** — Le champ `network.internalIp` donne l'adresse de la VM sur le réseau de son projet, avec ou sans IP publique. Elle est joignable depuis les autres ressources du projet, sous réserve du pare-feu du système invité. Elle est renvoyée par la lecture et la liste des VM, et vide tant que la VM est arrêtée. Le champ `network.publicIp` donne l'adresse publique, quand `publicIpv4` est activé. Elle peut appartenir à une plage privée : ne la déduisez pas de sa plage.

- **Mises à jour partielles** — Chaque requête de mise à jour accepte un champ facultatif `updateMask`. Si vous ne l'envoyez pas, il est déduit des clés du corps JSON. Un chemin qui ne désigne aucun champ modifiable, ou une seule clé d'une collection (comme `nodeGroups.workers`), est refusé avec le code `10006`. La spécification OpenAPI liste les chemins modifiables de chaque ressource.

- **Codes d'erreur** — Les nouveaux refus ont chacun leur code. Tous sont renvoyés en HTTP 400, sauf `10005`, renvoyé en 403 ou en 400 selon la règle.

| Code | Service | Signification |
| --- | --- | --- |
| `10005` | Tous | Refus d'une règle de la plateforme : le message nomme le champ refusé, `details` la règle et sa raison |
| `10006` | Tous | `updateMask` invalide : chemin inconnu, ou clé d'une collection |
| `20115` | Compute | Le UserData d'une VM Windows est généré par la plateforme et ne peut pas être modifié |
| `40202` | Projets | Le quota demandé dépasse ce qu'il reste à l'organisation |
| `80205` / `110205` / `120205` / `140205` / `150205` | PostgreSQL / MariaDB / Redis / RabbitMQ / MongoDB | Le cluster est encore en création : rien à redémarrer pour l'instant |
| `120206` | Redis | Rotation du mot de passe refusée : l'authentification est désactivée |
| `120207` | Redis | Rotation du mot de passe refusée : l'authentification vient d'être activée, réessayez dans quelques secondes |
| `180001` à `180227` | Sauvegardes | Refus du service de sauvegarde, chacun avec un message qui dit quoi faire. La liste complète figure dans la spécification OpenAPI |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Mises à jour partielles** — Un `PATCH` ne modifie plus que les champs présents dans le corps : un champ absent garde sa valeur enregistrée. Les champs qui étaient obligatoires à la mise à jour, comme `version`, `instanceType` ou `disks`, ne le sont plus : `{"external": true}` suffit pour activer l'accès externe d'une base. Un corps vide (`{}`) ne modifie rien et renvoie la ressource telle qu'elle est enregistrée. Les autres règles :
  - une liste envoyée vide est vidée : `gpus`, `sshKeys`, `network.vpcs`, `allowedInboundPorts`, les groupes d'un utilisateur IAM, les extensions d'une base PostgreSQL, les droits d'un utilisateur ;
  - un sous-objet envoyé vide, comme `"config": {}`, désigne tous ses champs, qui sont remis à leur valeur par défaut. Pour ne changer qu'un champ, envoyez seulement ce champ ;
  - `null` équivaut à un champ absent, sauf pour une surcharge de configuration libre (Cilium, CoreDNS, Vertical Pod Autoscaler et surcharges des addons d'un cluster Kubernetes), où `null` retire la surcharge ;
  - une surcharge de configuration libre envoyée remplace la surcharge enregistrée, au lieu de s'y ajouter ;
  - un champ envoyé est validé avec les règles de la création, même à zéro : `replicas: 0` est refusé, alors qu'il valait « pas de changement », et un quota de projet à 0 est refusé (`40103` à `40105`).

- **Compute** — `userData: ""` retire le UserData d'une VM Linux. Sur une VM Windows, un UserData envoyé à la mise à jour est refusé (`20115`), et une chaîne vide est ignorée.

- **Compute** — La liste `network.ips` ne contient plus l'adresse interne de la VM, renvoyée à part dans `internalIp`. L'adresse publique y figure toujours, et aussi dans `publicIp`.

- **Unités** — Les tailles de l'API (disques, mémoire, stockage, quotas) sont exprimées en GiB : 1 GiB vaut 1 024 Mio. La spécification et les messages d'erreur disaient « GB », et un client qui calculait en GB sous-estimait la taille réelle. Dans le détail `quotaFloor` du refus `40201`, `unit` vaut désormais `" GiB"` au lieu de `"Gi"`.

- **Refus des règles de la plateforme** — Une requête refusée par une règle de la plateforme reçoit le code `10005`, avec le champ en cause. Elle recevait jusqu'ici le code d'une autre erreur, par exemple `40002` (« le projet existe déjà »).

- **Redis** — La rotation du mot de passe génère un nouveau mot de passe de 32 caractères, appliqué après un redémarrage du cluster. Elle est refusée si l'authentification est désactivée (`120206`).

## Corrigé

- **Mises à jour partielles** — Une mise à jour ne réinitialise plus les champs qu'elle ne mentionne pas. Jusqu'ici, un corps sans ces champs :
  - désactivait l'IP publique d'une VM et réécrivait sa politique de redémarrage ;
  - désactivait les addons d'un cluster Kubernetes absents du corps ;
  - désactivait l'accès externe d'un cluster MariaDB, RabbitMQ ou Redis, et l'authentification d'un cluster Redis ;
  - désactivait le sharding d'un cluster MongoDB et remettait à zéro le quorum d'un cluster PostgreSQL ;
  - remettait à zéro la limite de connexions d'un utilisateur MariaDB et le privilège de réplication d'un utilisateur PostgreSQL ;
  - retirait un utilisateur RabbitMQ de tous ses vhosts.

- **Projets** — Un quota de projet qui dépasse ce qu'il reste à l'organisation est refusé avec le code `40202` et le quota en cause. Il était refusé avec le code `40001` (projet introuvable) ou `40002` (projet déjà existant).

- **Messages d'erreur** — Le nom d'un type de ressource n'est plus tronqué de sa première lettre dans les messages d'erreur.

- **IAM** — Les modifications d'un utilisateur créé par l'API (nom, groupes) et sa suppression sont désormais appliquées à son compte de connexion, retrouvé par son adresse e-mail. Jusqu'ici, seule sa création l'était.

- **Listes** — Les listes de ressources, en particulier celle des VM, répondent plus vite. Une liste de VM pouvait prendre plusieurs secondes.

## Sécurité

- **Redis** — La rotation du mot de passe d'un cluster Redis renvoyait l'ancien mot de passe au lieu d'en générer un nouveau. Si vous avez fait une rotation avant cette version, refaites-la, puis redémarrez le cluster.

:::warning Limite connue
Une sauvegarde programmée peut démarrer pendant la restauration en place d'un cluster PostgreSQL et la faire échouer. Avant une telle restauration, vérifiez le `nextRunAt` des plans de l'application : si une exécution est prévue dans les 30 minutes, attendez qu'elle se termine.
:::
