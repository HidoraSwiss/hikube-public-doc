---
title: Hikube API v1.6.3
authors: [hikube]
tags: [release]
---

Cette version dit pourquoi une ressource n'est pas prête, grâce au nouveau champ `statusDetail`, et donne l'état du control plane d'un cluster Kubernetes. Chaque service annonce son preset par défaut. Elle corrige aussi l'ajout de clés SSH sur une VM Windows, qui remplaçait son mot de passe, et la rotation des identifiants d'un utilisateur de bucket. Les ajouts ne retirent rien au contrat existant.

**Changement de comportement** : la rotation du mot de passe d'un utilisateur MariaDB ou RabbitMQ est désormais refusée, car elle n'était jamais appliquée (voir *Sécurité*).

<!-- truncate -->

## Ajouté

- **État détaillé** — Les projets, les VPC, les buckets, les clusters Kubernetes et les clusters PostgreSQL, MariaDB, MongoDB, Redis et RabbitMQ renvoient un champ `statusDetail`, qui donne la cause derrière `status`. Son champ `reason` prend l'une des valeurs `install_failed` (la ressource n'a pas pu être créée), `update_failed` (la dernière modification n'a pas pu être appliquée ; la ressource peut encore fonctionner avec sa configuration précédente), `workloads_not_ready` (la ressource est appliquée, mais certains de ses composants ne fonctionnent pas), et, pour un cluster Kubernetes seulement, `quota_exceeded` (des nœuds ne peuvent pas démarrer faute de quota dans le projet) ou `node_failed` (un nœud est en erreur). `reason` est vide quand il n'y a rien à signaler. `message` donne une phrase en anglais à afficher, et `since` le moment où la cause s'applique. Fondez vos décisions sur `reason` : le texte de `message` peut changer. D'autres valeurs pourront s'ajouter : traitez une valeur inconnue comme un échec générique.

- **Kubernetes : état du control plane** — `GET /kubernetes/v1alpha1/projects/{project_id}/clusters/{name}/control-plane/status` renvoie l'état du control plane d'un cluster : `healthy`, `degraded` ou `critical`, avec sa raison, par exemple `replicas_not_ready`, `out_of_memory` ou `memory_near_limit`. La réponse détaille chaque réplica (état, redémarrages et cause du dernier, mémoire et CPU utilisés par rapport à la limite), ainsi que l'état de l'etcd du cluster. Cet état se lit à la demande : il ne figure pas dans la ressource du cluster.

- **Presets par défaut** — `GET /{service}/v1alpha1/presets` renvoie aussi `default`, le preset à proposer quand rien n'oriente le choix, pour Kubernetes, PostgreSQL, MariaDB, MongoDB, Redis et RabbitMQ. C'est toujours l'un des presets de la liste. L'API n'applique pas ce défaut d'elle-même : une création sans preset reste refusée.

- **Codes d'erreur** — Ils sont renvoyés en HTTP 400. Le format des erreurs est décrit dans [Erreurs](/api/errors/).

| Code | Service | Signification |
| --- | --- | --- |
| `70209` | Kubernetes | Le quota du projet ne laisse pas la place de mener à terme le changement de taille ou de réplicas du control plane : relevez le quota |
| `110206` | MariaDB | Rotation du mot de passe d'un utilisateur pas encore disponible : le nouveau mot de passe ne serait pas appliqué |
| `110207` | MariaDB | Cluster tout juste créé : réessayez la création de l'utilisateur dans quelques secondes |
| `140206` | RabbitMQ | Rotation du mot de passe d'un utilisateur pas encore disponible : le nouveau mot de passe ne serait pas appliqué |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Kubernetes** — Un changement de taille ou de nombre de réplicas du control plane est vérifié avant d'être appliqué. Pendant le remplacement progressif, le control plane réserve plus de ressources sur le quota du projet. Si le quota ne le permet pas, la mise à jour est refusée avec le code `70209` et rien n'est modifié. Le message indique, pour chaque ressource, de combien relever le quota, et `details.quotaShortfall` donne la même information au format JSON.

- **MariaDB et RabbitMQ** — `POST .../clusters/{cluster}/users/{user}/rotate-password` est refusé avec le code `110206` (MariaDB) ou `140206` (RabbitMQ), sans toucher au mot de passe. La rotation sera rouverte quand elle pourra être appliquée.

- **MariaDB** — Le mot de passe d'un nouvel utilisateur est enregistré avant la création de son compte, ce qui garantit que le mot de passe renvoyé est bien celui du compte. Sur un cluster tout juste créé, la création d'un utilisateur peut être refusée avec le code `110207` : réessayez quelques secondes plus tard.

## Corrigé

- **Compute** — Sur une VM Windows, ajouter ou retirer une clé SSH ne remplace plus le mot de passe administrateur donné à la création. Les clés s'appliquent au prochain démarrage de la VM (redémarrage, ou arrêt puis démarrage), ce que signale `restartRequired` dans la réponse de la mise à jour. Une clé ajoutée depuis Windows est conservée. Le rechargement du UserData (`reload-userdata`) remet le mot de passe de la création au lieu de le perdre.

- **Buckets** — La création d'un utilisateur de bucket et la rotation de ses identifiants n'échouent plus après une attente d'environ deux minutes quand les clés tardent à être émises. Une rotation renvoie toujours des clés différentes des précédentes.

- **Bases de données managées** — L'adresse (`host`) d'une base exposée n'apparaît plus vide dans les mises à jour en temps réel de la console. Les réponses de l'API n'étaient pas concernées.

## Sécurité

- **MariaDB et RabbitMQ** — La rotation du mot de passe d'un utilisateur renvoyait un nouveau mot de passe qui n'était jamais appliqué : l'ancien restait valide. Si vous avez fait une rotation avant cette version, le mot de passe du compte est toujours l'ancien. Si vous le pensez compromis, contactez le support.

- **Buckets** — Une rotation des identifiants d'un utilisateur de bucket pouvait renvoyer les anciennes clés comme si elles étaient nouvelles, sans les révoquer. Si une rotation faite avant cette version vous a rendu les mêmes clés qu'avant, refaites-la.

:::warning VM Windows créées avant cette version
Pour que les changements de clés SSH s'appliquent au redémarrage, rechargez une fois le UserData de la VM. Ce rechargement remet le mot de passe administrateur donné à la création : si vous l'avez changé dans Windows, changez-le de nouveau ensuite.
:::
