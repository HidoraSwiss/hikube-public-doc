---
title: Hikube API v1.5.0
authors: [hikube]
tags: [release]
---

L'API renvoie désormais l'adresse interne des bases de données managées, les membres d'un replica set MongoDB exposé et la rétention des buckets WORM. Elle refuse dès la requête les modifications que la plateforme ne peut pas appliquer, comme une version inférieure ou un stockage réduit, et réserve le kubeconfig aux administrateurs du projet.

<!-- truncate -->

## Ajouté

- **Bases de données managées** — Le nouveau champ `internalHost` donne l'adresse interne de chaque cluster PostgreSQL, MariaDB, MongoDB, Redis et RabbitMQ, même sans accès externe. Elle est joignable depuis les VM et les clusters Kubernetes du même projet, sur le port par défaut du moteur. Si une VM Debian ne résout pas cette adresse, suivez [Comment résoudre le DNS .local dans les VMs](/services/compute/how-to/fix-dns-local/).

- **MongoDB** — Un replica set avec accès externe renvoie l'adresse de chacun de ses membres dans `hosts`, et le nom du replica set dans `replicaSet`. Le champ `host` reste vide pour un replica set, qui n'a pas de point d'entrée unique. Depuis l'extérieur, connectez-vous à un membre avec `directConnection=true`.

- **Storage S3** — Un bucket verrouillé (WORM) renvoie sa rétention dans `retention` : durée en jours, mode (`compliance`) et conservation des objets à la suppression du bucket.

- **Compute** — Le champ `restartRequired` d'une VM indique qu'une modification attend un redémarrage pour s'appliquer, par exemple un UserData rechargé ou un disque détaché.

- **Spécification OpenAPI** — Les descriptions de champs reprennent les règles que l'API applique réellement : longueur et format des noms, nom d'image attendu, rôles autorisés. La spécification décrit aussi le corps des erreurs (`requestId`, `code`, `message`, `details`) et la liste complète des codes d'erreur.

- **Codes d'erreur** — Les nouveaux refus ont chacun leur code. Tous sont renvoyés en HTTP 400.

| Code | Service | Signification |
| --- | --- | --- |
| `30200` | Disques | La taille d'un disque ne peut pas être réduite |
| `70205` | Kubernetes | L'environnement Kubernetes du projet est en préparation : réessayez dans quelques minutes |
| `70206` | Kubernetes | Retour à une version inférieure refusé |
| `70207` | Kubernetes | La configuration du projet ne permet pas de créer un cluster : ne réessayez pas, contactez le support |
| `70208` | Kubernetes | La préparation de l'environnement Kubernetes du projet a échoué : ne réessayez pas, contactez le support |
| `80203` / `80204` | PostgreSQL | Version inférieure refusée / stockage qui ne peut pas être réduit |
| `110203` / `110204` | MariaDB | Version inférieure refusée / stockage qui ne peut pas être réduit |
| `120203` / `120204` | Redis | Version inférieure refusée / stockage qui ne peut pas être réduit |
| `140203` / `140204` | RabbitMQ | Version inférieure refusée / stockage qui ne peut pas être réduit |
| `150203` / `150204` | MongoDB | Version inférieure refusée / stockage qui ne peut pas être réduit |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Bases de données managées et Kubernetes** — Une mise à jour qui demande une version inférieure, ou un stockage plus petit que l'actuel, est refusée avant d'atteindre la plateforme. Jusqu'ici, elle était acceptée, puis échouait sur la plateforme, et la ressource restait bloquée en création. Pour Kubernetes, seule la version est contrôlée : réduire le disque des nœuds reste possible, car les nœuds sont remplacés. Si votre dernière modification a échoué, revenir aux valeurs en service reste permis.

- **Disques** — La taille d'un disque ne peut plus être réduite, ni directement, ni par la mise à jour de la VM qui l'utilise (code `30200`).

- **Statut des ressources** — Un VPC, un projet ou une application managée dont la dernière modification n'a pas pu être appliquée passe au statut `error`. Ces ressources restaient auparavant en `provisioning` sans limite de temps. Une ressource dont la modification a échoué peut continuer à fonctionner avec sa configuration précédente.

- **Kubernetes** — Le kubeconfig d'un cluster donne un accès administrateur : son téléchargement est désormais réservé aux administrateurs du projet. Les autres membres reçoivent une erreur 403.

- **Compute** — Le rôle `use` d'un projet permet maintenant de démarrer, d'arrêter et de redémarrer les VM. Ces actions demandaient auparavant le rôle administrateur.

- **Kubernetes** — La création du premier cluster d'un projet ne démarre plus avant que l'environnement Kubernetes du projet soit prêt. Pendant ces quelques minutes, l'API répond `70205` sans rien créer. Renvoyez la même requête plus tard. Un cluster suivant peut recevoir ce code brièvement, pendant une modification du projet comme un changement de quota.

- **MariaDB et MongoDB** — Les bases système ne peuvent plus être la cible d'un rôle ni être créées : `mysql`, `information_schema`, `performance_schema` et `sys` pour MariaDB, `admin`, `local` et `config` pour MongoDB. Si un utilisateur existant a encore un rôle sur une base système, retirez-le lors de sa prochaine mise à jour, sinon elle sera refusée.

- **Autorisations** — Un projet inexistant et un projet existant mais interdit reçoivent désormais la même erreur 403, avec le même code et le même message. Ces cas renvoyaient auparavant 400 ou 404 selon la ressource.

- **Projets** — Le nom de projet `super` est réservé.

## Corrigé

- **Kubernetes** — Le premier cluster d'un projet ne reste plus une vingtaine de minutes en échec au démarrage, et ses modules complémentaires ne restent plus en erreur.

- **Compute** — La mise à jour d'une VM ne renvoie plus d'erreur 500 quand un de ses disques existants est plus petit que le minimum de création (20 Go). Un refus portant sur un disque est renvoyé avec son propre code et le disque concerné (`disks[1]: …`). Les disques traités avant le disque refusé restent modifiés.

- **Compute** — Une même adresse IP n'apparaît plus plusieurs fois dans la liste des adresses d'une VM.

- **Bases de données et disques** — Un volume de 1 Tio ou plus est rapporté avec sa taille réelle (`1024` pour 1 Tio) au lieu de `1`.

- **MariaDB** — Un serveur MariaDB unique avec accès externe renvoie son adresse externe dans `host`.

- **Storage S3** — Un utilisateur de bucket en lecture seule peut être repassé en lecture-écriture. La réponse renvoie l'utilisateur tel qu'il est enregistré. Envoyez toujours `readonly` explicitement : `"config": {}` le passe en lecture-écriture.

- **Plateforme** — Une requête qui provoque une erreur interne reçoit une réponse 500 et n'interrompt plus le service pour les autres requêtes.

## Sécurité

- **Kubernetes** — Un membre du projet sans rôle administrateur pouvait télécharger le kubeconfig, qui donne un accès administrateur au cluster. Ce téléchargement est désormais réservé aux administrateurs du projet.

- **Autorisations** — Les réponses d'erreur ne permettent plus de savoir si un projet auquel vous n'avez pas accès existe.

- **Événements temps réel** — L'accès au flux d'événements est vérifié pour chaque type de ressource demandé, y compris les quotas. Une demande qui ne précise aucun type est refusée (400).
