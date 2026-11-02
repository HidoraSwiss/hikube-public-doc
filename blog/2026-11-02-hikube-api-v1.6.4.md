---
title: Hikube API v1.6.4
authors: [hikube]
tags: [release]
---

Cette version garde visible une ressource en cours de suppression, pagine les listes d'instances et de disques, et liste en un appel les sous-réseaux de tout un projet. Elle protège aussi le disque système d'une VM allumée, et refuse d'emblée un disque que le quota de stockage du projet ne peut pas loger. Les ajouts ne retirent rien au contrat existant.

**Changement de comportement** : une ressource supprimée ne disparaît plus aussitôt de l'API. Elle reste lisible avec le statut `deleting` jusqu'à sa suppression effective (voir *Modifié*).

<!-- truncate -->

## Ajouté

- **Réseau : sous-réseaux d'un projet** — `GET /network/v1alpha1/projects/{project_id}/subnets` renvoie en un seul appel les sous-réseaux de tous les VPC du projet, au lieu d'un appel par VPC.

- **Compute et disques : pagination** — `GET .../instances` et `GET .../disks` acceptent `pageSize` (500 au plus ; une valeur plus grande est servie comme 500) et `pageToken`, le `nextPageToken` de la réponse précédente. Les éléments sont triés par nom, et `totalCount` donne la taille de toute la collection sur chaque page. `nextPageToken` est vide sur la dernière page. Sans ces paramètres, la liste est renvoyée en entier, comme avant.

- **Codes d'erreur** — Ils sont renvoyés en HTTP 400. Le format des erreurs est décrit dans [Erreurs](/api/errors/).

| Code | Service | Signification |
| --- | --- | --- |
| `10009` | Tous | Demande de page invalide : `pageSize` négatif, ou `pageToken` qui ne vient pas de cette liste |
| `10010` | Tous | La ressource est en cours de suppression : elle se lit, mais ne se modifie plus, et son nom ne peut pas être réutilisé avant sa disparition |
| `20208` | Compute | Le disque système d'une VM ne se remplace, ne se détache et ne se déplace que VM arrêtée : arrêtez-la d'abord |
| `20209` | Compute | La VM ne peut pas encore démarrer : sa dernière modification est en cours d'application (environ 30 secondes). Réessayez |
| `20210` | Compute | Les disques que la création ou la modification ajoute ou agrandit ne tiennent pas dans le quota de stockage restant du projet |
| `30202` | Disques | Le disque à créer, ou sa nouvelle taille, ne tient pas dans le quota de stockage restant du projet |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Toutes les ressources** — Après sa suppression, une ressource reste lisible et listée avec le statut `deleting`, jusqu'à ce qu'elle ait réellement disparu ; un `GET` répond alors 404. Pendant ce temps, toute modification de la ressource ou de ses sous-ressources, et toute création sous le même nom, sont refusées avec le code `10010`. Une nouvelle demande de suppression reste acceptée. Avant, la ressource renvoyait 404 dès la demande, alors qu'elle existait encore. En temps réel, la console reçoit `status_changed` avec `deleting`, puis `deleted`.

- **Compute** — Le disque système d'une VM (`disks[0]`) ne peut être remplacé, détaché ou déplacé que si la VM est arrêtée (`stopped`). Sinon, la modification est refusée avec le code `20208` et rien n'est changé.

- **Compute** — Juste après une modification, le démarrage d'une VM est refusé avec le code `20209` tant que la modification n'est pas appliquée, soit environ 30 secondes. Démarrer plus tôt pouvait faire démarrer la VM sur son ancienne configuration, par exemple sur un disque système qui venait d'être remplacé. Ce refus peut aussi survenir quelques secondes après l'arrêt d'une VM : réessayez.

- **Disques et compute** — Un disque à créer ou à agrandir est vérifié par rapport au quota de stockage restant du projet. S'il ne tient pas, la demande est refusée avec le code `30202` (disques) ou `20210` (création ou modification d'une VM), et rien n'est créé. `details.storageQuota` donne la taille demandée et la place restante. Avant, le disque était accepté, puis restait bloqué faute de place.

- **Quotas** — Pour un projet qui a des sous-projets, le quota affiché et vérifié est celui qui reste vraiment au projet, une fois déduite la part donnée à ses sous-projets. C'est ce quota qui s'applique aux nouvelles ressources, au contrôle de taille du control plane Kubernetes (`70209`) et aux mises à jour en temps réel de la console.

## Corrigé

- **Compute** — Une VM arrêtée reste arrêtée quand vous la modifiez ou lors d'une maintenance de la plateforme. Elle pouvait redémarrer d'elle-même.

- **MariaDB** — La création d'un utilisateur était refusée avec une erreur d'autorisation depuis la v1.6.3. Elle fonctionne de nouveau.
