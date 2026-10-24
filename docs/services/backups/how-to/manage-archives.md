---
title: "Comment consulter et supprimer des archives"
sidebar_position: 7
description: "Consultez les archives de sauvegarde Hikube d'une ressource ou de tout le projet, comprenez pourquoi une archive n'est pas restaurable, et supprimez des archives."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment consulter et supprimer des archives

Ce guide montre où trouver les archives de sauvegarde dans la [console Hikube](https://console.hikube.cloud), comment savoir si elles sont restaurables, et comment les supprimer.

## Prérequis

- Pour l'onglet **API** : une clé d'API du projet (`admin` pour créer, modifier, lancer, restaurer ou supprimer ; `read` pour consulter) et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`.

## Consulter les archives

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- **Pour une ressource** : onglet **Sauvegardes** de la base, de la VM ou du disque. La liste d'un disque contient aussi les archives de la VM qui le porte.
- **Pour tout le projet** : **Sauvegardes** > **Archives**. Cette vue liste aussi les archives des ressources supprimées (**Application supprimée**), d'où elles peuvent être recréées.

Pour chaque archive, la console affiche l'**Archive**, sa **Date**, sa **Durée**, son **Statut**, son **Origine** (le nom de la programmation, ou **À la demande**) et sa **Destination**. La colonne **Taille** reste vide : la taille des archives n'est pas mesurée aujourd'hui.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups?applicationName=demopg" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  | jq '.backups[] | {name, application, takenAt, status, plan, destination, restorable}'
```

Sans `applicationName`, la liste couvre tout le projet, y compris les archives des ressources supprimées. Pour un disque, elle contient aussi les archives de la VM qui le porte : le champ `covers` d'une archive de VM liste les disques qu'elle contient. `sizeBytes` est absent : la taille n'est pas mesurée aujourd'hui.

</TabItem>
</Tabs>

## Savoir si une archive est restaurable

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Une archive **Prête** se restaure avec le bouton **Restaurer**. Quand elle ne peut pas l'être, la console affiche **Restauration impossible :** suivi de la raison :

| Raison | Que faire |
|--------|-----------|
| L'archive n'est pas prête | Attendez la fin de l'écriture, ou choisissez une autre archive si la sauvegarde a échoué. |
| Sa destination a été supprimée | L'archive ne redeviendra pas restaurable, même en recréant une destination du même nom. Choisissez une archive plus récente. |
| Sa destination est en cours de suppression | Choisissez une autre archive. |
| La destination de ce nom a été recréée après la sauvegarde | Ce n'est plus la destination où l'archive a été écrite. Choisissez une archive prise depuis. |
| Les destinations n'ont pas pu être lues | Réessayez dans un moment. |
| Les données de l'archive ne sont plus stockées | VM et disques : l'archive a été effacée, par exemple en fin de rétention. Choisissez une autre archive. |

</TabItem>
<TabItem value="api" label="API">

Le champ `restorable` d'une archive dit si une restauration serait acceptée. S'il vaut `false`, `notRestorableReason` en donne la raison en clair et `notRestorableCause` la résume : `not_ready`, `destination_removed`, `destination_tearing_down`, `destination_replaced`, `destination_unverified` (destinations illisibles) ou `stored_archive_gone` (VM et disques). Les réponses à apporter sont celles du tableau de l'onglet **Console**.

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups/<archive>" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.backup | {status, restorable, notRestorableCause, notRestorableReason}'
```

</TabItem>
</Tabs>

## Supprimer une archive

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Sur la ligne de l'archive, cliquez sur **Supprimer**.
2. Confirmez :
   - **PostgreSQL, MariaDB** : la fiche est retirée ; **l'archive reste dans votre bucket**. Pour libérer la place, videz le bucket vous-même.
   - **VM, disque** : **l'archive stockée est détruite avec la fiche**. C'est irréversible : saisissez le nom de l'archive pour confirmer.

Pour supprimer plusieurs archives d'une même ressource, sélectionnez-les puis cliquez sur **Supprimer N archives**. La console demande de saisir le nombre d'archives sélectionnées pour confirmer.

</TabItem>
<TabItem value="api" label="API">

```bash
# PostgreSQL, MariaDB : la fiche est retirée, l'archive reste dans le bucket
curl -sS -X DELETE "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups/<archive>" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

# VM, disque : l'archive stockée est détruite, confirmation obligatoire
curl -sS -X DELETE "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups/<archive>?confirmDestructive=true" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Sans `confirmDestructive=true`, la suppression d'une archive de VM ou de disque est refusée (`180109`). L'API supprime une archive par requête.

</TabItem>
</Tabs>

Une suppression est refusée dans deux cas :

- l'archive est en cours de lecture par une restauration : attendez la fin de la restauration (`180210` avec l'API) ;
- l'archive est sur une destination **WORM** et son verrou court encore : la console affiche **« … » est verrouillée** avec la date de fin du verrou. Elle reste restaurable d'ici là. Une suppression groupée écarte ces archives (`180217` avec l'API).

## Rétention automatique

Vous n'avez pas besoin de supprimer les archives à la main : chacune est supprimée automatiquement à la fin de sa rétention, avec la ligne d'exécution correspondante. La dernière archive restaurable d'une ressource est toujours conservée, même si elle a dépassé sa rétention. Voir [Concepts : rétention](../concepts.md#rétention).

## Pour aller plus loin

- [Créer et gérer une destination](./create-destination.md)
- [Restaurer une base](./restore-database.md)
- [Restaurer une VM ou un disque](./restore-vm-or-disk.md)
