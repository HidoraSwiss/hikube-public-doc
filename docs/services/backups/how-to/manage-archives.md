---
title: "Comment consulter et supprimer des archives"
sidebar_position: 7
description: "Consultez les archives de sauvegarde Hikube d'une ressource ou de tout le projet, comprenez pourquoi une archive n'est pas restaurable, et supprimez des archives."
---

# Comment consulter et supprimer des archives

Ce guide montre où trouver les archives de sauvegarde dans la [console Hikube](https://console.hikube.cloud), comment savoir si elles sont restaurables, et comment les supprimer.

## Consulter les archives

- **Pour une ressource** : onglet **Sauvegardes** de la base, de la VM ou du disque. La liste d'un disque contient aussi les archives de la VM qui le porte.
- **Pour tout le projet** : **Sauvegardes** > **Archives**. Cette vue liste aussi les archives des ressources supprimées (**Application supprimée**), d'où elles peuvent être recréées.

Pour chaque archive, la console affiche l'**Archive**, sa **Date**, sa **Durée**, son **Statut**, son **Origine** (le nom de la programmation, ou **À la demande**) et sa **Destination**. La colonne **Taille** reste vide : la taille des archives n'est pas mesurée aujourd'hui.

## Savoir si une archive est restaurable

Une archive **Prête** se restaure avec le bouton **Restaurer**. Quand elle ne peut pas l'être, la console affiche **Restauration impossible :** suivi de la raison :

| Raison | Que faire |
|--------|-----------|
| L'archive n'est pas prête | Attendez la fin de l'écriture, ou choisissez une autre archive si la sauvegarde a échoué. |
| Sa destination a été supprimée | L'archive ne redeviendra pas restaurable, même en recréant une destination du même nom. Choisissez une archive plus récente. |
| Sa destination est en cours de suppression | Choisissez une autre archive. |
| La destination de ce nom a été recréée après la sauvegarde | Ce n'est plus la destination où l'archive a été écrite. Choisissez une archive prise depuis. |
| Les destinations n'ont pas pu être lues | Réessayez dans un moment. |
| Les données de l'archive ne sont plus stockées | VM et disques : l'archive a été effacée, par exemple en fin de rétention. Choisissez une autre archive. |

## Supprimer une archive

1. Sur la ligne de l'archive, cliquez sur **Supprimer**.
2. Confirmez :
   - **PostgreSQL, MariaDB** : la fiche est retirée ; **l'archive reste dans votre bucket**. Pour libérer la place, videz le bucket vous-même.
   - **VM, disque** : **l'archive stockée est détruite avec la fiche**. C'est irréversible : saisissez le nom de l'archive pour confirmer.

Pour supprimer plusieurs archives d'une même ressource, sélectionnez-les puis cliquez sur **Supprimer N archives**. La console demande de saisir le nombre d'archives sélectionnées pour confirmer.

Une suppression est refusée dans deux cas :

- l'archive est en cours de lecture par une restauration : attendez la fin de la restauration ;
- l'archive est sur une destination **WORM** et son verrou court encore : la console affiche **« … » est verrouillée** avec la date de fin du verrou. Elle reste restaurable d'ici là. Une suppression groupée écarte ces archives.

## Rétention automatique

Vous n'avez pas besoin de supprimer les archives à la main : chacune est supprimée automatiquement à la fin de sa rétention, avec la ligne d'exécution correspondante. La dernière archive restaurable d'une ressource est toujours conservée, même si elle a dépassé sa rétention. Voir [Concepts : rétention](../concepts.md#rétention).

## Pour aller plus loin

- [Créer et gérer une destination](./create-destination.md)
- [Restaurer une base](./restore-database.md)
- [Restaurer une VM ou un disque](./restore-vm-or-disk.md)
