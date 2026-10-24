---
title: "Comment restaurer une base PostgreSQL à un instant précis"
sidebar_position: 4
description: "Restaurez une base PostgreSQL Hikube à l'état exact d'une sauvegarde, à son état le plus récent ou à un instant précis, grâce aux journaux de transactions archivés en continu."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment restaurer une base PostgreSQL à un instant précis

Une base PostgreSQL sauvegardée archive en continu ses **journaux de transactions** vers sa destination, entre deux sauvegardes. Ce guide s'en sert pour ramener une base à un instant précis, par exemple juste avant une suppression accidentelle, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Une base PostgreSQL avec au moins une archive **Prête** et restaurable, prise **avant** l'instant visé.
- Avoir lu [Restaurer une base PostgreSQL ou MariaDB](./restore-database.md#avant-de-commencer) : les mêmes précautions s'appliquent.
- Pour l'onglet **API** : une clé d'API du projet (`admin` pour créer, modifier, lancer, restaurer ou supprimer ; `read` pour consulter) et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`.

## Ce que vous pouvez restaurer

| Choix dans **Restaurer jusqu'à** | Résultat |
|----------------------------------|----------|
| **État de la sauvegarde du …** (par défaut) | L'état exact de l'archive choisie. |
| **État le plus récent** | L'archive, puis tous les journaux archivés depuis, jusqu'à la dernière écriture connue. |
| Un instant sur la frise, ou une **Date** et une **Heure (24 h)** | L'état de la base juste avant la première transaction postérieure à cet instant. |

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Choisir l'archive

1. Ouvrez **PostgreSQL**, la base, puis son onglet **Sauvegardes**.
2. Sur la ligne de l'archive la plus récente **antérieure** à l'instant visé, cliquez sur **Restaurer**.
3. Choisissez la **Cible de la restauration**. Pour examiner les données sans toucher à la base en service, choisissez **Sur une autre base de données** et une base vide de la même version.

### 2. Choisir l'instant

La section **Restaurer jusqu'à** affiche une frise. Réglez l'**Échelle** (**1 h**, **6 h**, **1 jour**, **7 jours**) et naviguez avec **Sauvegarde précédente** / **Sauvegarde suivante**.

- Cliquez sur la frise, ou saisissez une **Date** et une **Heure (24 h)** en heure locale. La console affiche les bornes de la fenêtre : **Restaurable du … au …**.
- Un instant hors de la fenêtre est ramené à la borne la plus proche, et la console l'indique (**Avant la première sauvegarde : ramené au …**, **Pas encore archivé : ramené au …**).
- **Revenir au plus récent** sélectionne l'état le plus récent.

Le libellé du bouton reprend votre choix : **Restaurer l'état au …**, **Restaurer l'état le plus récent**, **Restaurer l'état de la sauvegarde du …**.

### 3. Confirmer

Saisissez le nom demandé, puis cliquez sur le bouton de restauration.

</TabItem>
<TabItem value="api" label="API">

### 1. Lire la fenêtre de l'archive

Choisissez l'archive la plus récente **antérieure** à l'instant visé, puis lisez sa fenêtre de restauration (`recoveryWindow`) :

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups/<archive>" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.backup.recoveryWindow'
```

| Champ | Signification |
|-------|---------------|
| `earliest` | Premier instant restaurable : la fin de la sauvegarde |
| `latest` | Estimation du dernier instant couvert par les journaux archivés. Relisez-la : elle avance avec le temps. Absente si l'archivage des journaux ne fonctionne pas |
| `lastCommitAt` | Dernière transaction archivée : tout instant à partir de celle-ci est refusé. Fiable seulement si `lastCommitKnown` vaut `true` |
| `crossTimelineAfter` | Premier instant qui partirait d'une autre branche de l'historique : les instants suivants sont refusés |
| `latestRestorable` | `false` si l'état le plus récent suivrait une autre branche de l'historique |

### 2. Lancer la restauration

L'état visé se choisit avec `recoveryTime` (un instant) ou `restorePoint` (`backup` ou `latest`), jamais les deux :

```bash
# Un instant précis, en UTC (RFC 3339)
curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "backup": "<archive>",
    "target": {"kind": "postgres", "name": "demopg-copy"},
    "recoveryTime": "2026-10-24T09:41:00Z",
    "confirmDestructive": true
  }'

# L'état le plus récent
curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"backup": "<archive>", "restorePoint": "latest", "confirmDestructive": true}'
```

Sans `recoveryTime` ni `restorePoint`, la base revient à l'état de l'archive (`backup`). Omettez `target` pour restaurer sur la base d'origine.

</TabItem>
</Tabs>

## Comprendre la fenêtre

```mermaid
flowchart LR
    A["Début de la sauvegarde"] --> B["Fin de la sauvegarde<br/>(premier instant restaurable)"]
    B --> C["Instants restaurables"]
    C --> D["Dernière transaction archivée<br/>(non incluse)"]
    D --> E["Pas encore archivé"]
```

- **Premier instant** : la fin de la sauvegarde, pas son début. La base n'est cohérente qu'une fois la sauvegarde terminée.
- **Dernier instant** : juste avant la dernière transaction archivée. Une restauration s'arrête sur la première transaction qui **suit** l'instant demandé ; après la dernière transaction, il n'y en a plus, et l'instant ne peut pas être atteint. Pour inclure cette dernière écriture, choisissez **État le plus récent**.
- **Pas encore archivé** : les journaux partent vers la destination avec quelques minutes de décalage ; les toutes dernières minutes ne sont pas encore restaurables.
- **Aucune écriture** : si rien n'a été écrit depuis la sauvegarde, l'état le plus récent est celui de la sauvegarde, et la console l'indique (**Identique à l'état le plus récent**).

## Cas particuliers

| Message | Signification | Que faire |
|---------|---------------|-----------|
| **Dernière écriture inconnue** | Les journaux archivés n'ont pas pu être lus : la fenêtre affichée n'est qu'une estimation. | Réessayez plus tard, ou restaurez l'état de la sauvegarde. |
| « l'archivage des journaux ne fonctionne pas sur cette base » | Aucun instant postérieur à la sauvegarde ne peut être garanti. | Restaurez l'état de la sauvegarde ; contactez le support si l'archivage ne reprend pas. |
| Instants non proposés **à partir du …** (autre branche de l'historique) | Une restauration en place antérieure a créé une nouvelle branche de l'historique ; au-delà de cette date, la restauration partirait d'une archive de l'autre branche. | Choisissez un instant plus ancien, ou une archive de la branche voulue. |
| **Aucune transaction après cet instant** | L'instant est postérieur à la dernière écriture archivée. | Choisissez **État le plus récent** : l'état obtenu est le même. |

Avec l'API, ces cas sont refusés avant le lancement : instant hors de la fenêtre (`180214`), archivage des journaux arrêté (`180215`), aucune transaction après l'instant (`180219`), autre branche de l'historique (`180221`), journaux momentanément illisibles (`180220`, réessayez). `recoveryTime` avec une archive autre que PostgreSQL est refusé (`180207`), comme `recoveryTime` combiné à `restorePoint` (`180108`).

## Vérification

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

- La restauration est **Réussie** ; la colonne **Point de récupération** de la section **Restaurations** affiche l'instant restauré, **État de la sauvegarde** ou **État le plus récent**.
- Connectez-vous à la base et vérifiez que la donnée visée est présente, et que les modifications postérieures à l'instant choisi n'y sont pas.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores/<restauration>" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.restore | {status, recoveryTime, restorePoint}'
```

Une fois `status` à `succeeded`, `recoveryTime` donne l'instant restauré, ou `restorePoint` vaut `latest`. Connectez-vous ensuite à la base pour vérifier les données.

</TabItem>
</Tabs>

## Pour aller plus loin

- [Concepts : restauration à un instant précis](../concepts.md#restauration-à-un-instant-précis-postgresql)
- [Dépannage](../troubleshooting.md#une-restauration-est-refusée)
