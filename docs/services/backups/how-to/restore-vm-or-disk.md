---
title: "Comment restaurer une VM ou un disque"
sidebar_position: 5
description: "Restaurez une machine virtuelle Hikube et tous ses disques depuis une archive, choisissez le sort des disques remplacés, et recréez une VM ou un disque supprimé."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment restaurer une VM ou un disque

Ce guide restaure une machine virtuelle, ou un disque supprimé, à partir d'une archive, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Une archive **Prête** et restaurable de la VM ou du disque (voir [Gérer les archives](./manage-archives.md)).
- Pour l'onglet **API** : une clé d'API du projet (`admin` pour créer, modifier, lancer, restaurer ou supprimer ; `read` pour consulter) et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`.

## Ce qu'il faut savoir

- **Une VM ou un disque se restaure sur lui-même**, jamais sur une autre ressource.
- **L'archive d'une VM contient tous ses disques**, et la restauration les réécrit tous. Il n'est pas possible de n'en restaurer qu'un.
- **Un disque sauvegardé seul ne se restaure pas sur lui-même tant qu'il existe.** Pour revenir à un état antérieur d'un disque attaché, restaurez une archive de la VM qui le porte. L'archive d'un disque sert à le **recréer** s'il a été supprimé.
- La VM est arrêtée pendant la restauration : prévoyez une interruption de service.

## Restaurer une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **Instances VM**, la VM, puis son onglet **Sauvegardes**. Vous pouvez aussi partir de **Sauvegardes** > **Archives**.
2. Sur la ligne de l'archive, cliquez sur **Restaurer**.
3. Choisissez le sort de **Les disques actuels de cette machine** :

   | Choix | Effet |
   |-------|-------|
   | **Les supprimer** (par défaut) | Chaque disque reprend le contenu de l'archive ; ce qu'il contenait jusqu'ici est supprimé une fois la restauration réussie. |
   | **Les garder** | Chaque disque reprend le contenu de l'archive ; ce qu'il contenait jusqu'ici devient un disque à part, nommé `<disque>-orig-<identifiant>`, détaché, facturé jusqu'à ce que vous le supprimiez. |

4. Saisissez le nom de la VM pour confirmer, puis cliquez sur **Restaurer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "backup": "<archive>",
    "originalDisks": "keep",
    "confirmDestructive": true
  }' | jq '.restore.name'
```

- Une VM ou un disque se restaure sur lui-même : n'envoyez pas de `target` (`180208` s'il désigne une autre ressource).
- `originalDisks` : `discard` (par défaut, **Les supprimer** de la console) ou `keep` (**Les garder**). Avec `keep` sans disque à garder, la requête est refusée (`180213`).
- `confirmDestructive: true` est obligatoire quand la VM existe encore (`180109` sinon).

</TabItem>
</Tabs>

:::tip Quand garder les anciens disques
Choisissez **Les garder** si vous n'êtes pas certain que l'archive est la bonne : vous pourrez attacher un ancien disque à une VM pour en récupérer des fichiers. Pensez à le supprimer ensuite depuis **Disques**.
:::

## Recréer une VM ou un disque supprimé

Si la VM ou le disque a été supprimé, la console l'indique (**« … » a été supprimée : elle sera recréée à partir de cette archive**). La restauration recrée la ressource sous son nom d'origine.

Pour une VM supprimée dont des disques ont survécu, le choix porte sur **Les disques qui ont survécu à cette machine**.

Si une **nouvelle** VM ou un nouveau disque porte désormais le même nom, créé après la sauvegarde, la restauration est refusée : elle remplacerait les données d'une autre ressource. Supprimez d'abord cette ressource, puis restaurez. Il en va de même si l'un des disques contenus dans l'archive d'une VM a été supprimé puis recréé depuis la sauvegarde. Avec l'API, ce refus porte le code `180222`.

## Suivre la restauration

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- La section **Restaurations** de l'onglet **Sauvegardes** affiche le statut, le pourcentage de données transférées et le sort des disques d'origine (**Disques d'origine supprimés si la restauration réussit**, **Disques d'origine gardés**…).
- Avant de passer à **Réussie**, la restauration vérifie que chaque disque de l'archive a bien été réécrit ; elle reste **En cours** pendant ces quelques secondes.
- Une restauration qui échoue, ou que vous annulez, **ne supprime rien**, même avec **Les supprimer** : les anciens disques sont gardés sous le nom `<disque>-orig-<identifiant>`, et le message le dit (**Disques d'origine gardés : la restauration n'a pas réussi**). Relancer la restauration peut réussir.
- Une restauration de VM ne s'arrête pas d'elle-même si elle reste bloquée : vous pouvez l'annuler (voir [Annuler une sauvegarde ou une restauration](./cancel-backup-or-restore.md)).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores/<restauration>" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.restore | {status, message, progress, originalDisks}'
```

- `progress.percent` donne le pourcentage de données transférées ; `progress` disparaît une fois le transfert terminé.
- `originalDisks` rappelle le choix fait ; le `message` dit ce qu'il en est advenu, en particulier quand une restauration qui échoue a gardé les anciens disques.
- Une restauration de VM bloquée s'annule (voir [Annuler une sauvegarde ou une restauration](./cancel-backup-or-restore.md)).

</TabItem>
</Tabs>

## Vérification

- La restauration est **Réussie**.
- Démarrez la VM si elle est arrêtée, connectez-vous et contrôlez vos données.
- Avec **Les garder**, les disques `<disque>-orig-<identifiant>` apparaissent dans **Disques**, non attachés.

## Pour aller plus loin

- [Concepts : restaurations](../concepts.md#restaurations)
- [Attacher un disque à une VM](../../storage/disks/how-to/attach-to-vm.md)
