---
title: "Comment restaurer une base PostgreSQL ou MariaDB"
sidebar_position: 3
description: "Restaurez une archive PostgreSQL ou MariaDB Hikube sur la base d'origine ou sur une autre base du projet, avec les précautions à prendre avant et les vérifications après."
---

# Comment restaurer une base PostgreSQL ou MariaDB

Ce guide restaure une archive de base de données depuis la [console Hikube](https://console.hikube.cloud), soit sur la base d'origine, soit sur une autre base du projet. Pour revenir à un instant précis d'une base PostgreSQL, voir [Restaurer à un instant précis](./restore-point-in-time.md).

## Prérequis

- Une archive **Prête** et restaurable de la base (voir [Gérer les archives](./manage-archives.md)).
- Pour restaurer vers une autre base : une base **existante** du même type dans le projet. Pour PostgreSQL, elle doit avoir la **même version majeure** que la base sauvegardée.

## Avant de commencer

:::warning Une restauration écrase les données
Restaurer sur la base d'origine remplace son contenu actuel. C'est irréversible. Pour récupérer quelques données sans toucher à la base en service, restaurez plutôt vers une base vide créée pour l'occasion.
:::

- **Vérifiez les programmations de la base** (PostgreSQL). Une sauvegarde à la demande est refusée pendant une restauration, mais une sauvegarde **programmée** peut se déclencher pendant celle-ci et la faire échouer. Si la **Prochaine** exécution d'une programmation de la base tombe dans les 30 minutes, attendez qu'elle soit terminée avant de lancer une restauration en place.
- **Une restauration à la fois** : une seconde restauration de la même base est refusée tant que la première n'est pas terminée.

## Restaurer

1. Ouvrez la base (**PostgreSQL** ou **MariaDB**), puis son onglet **Sauvegardes**. Vous pouvez aussi partir de **Sauvegardes** > **Archives**, qui liste les archives de tout le projet.
2. Sur la ligne de l'archive, cliquez sur **Restaurer**.
3. Choisissez la **Cible de la restauration** :
   - **Sur la base d'origine** : écrase le contenu actuel de la base ;
   - **Sur une autre base de données** : choisissez une base existante du projet, dont le contenu actuel sera écrasé.
4. PostgreSQL uniquement : choisissez l'état à restaurer dans **Restaurer jusqu'à** (par défaut, l'état de la sauvegarde ; voir [Restaurer à un instant précis](./restore-point-in-time.md)).
5. Saisissez le nom demandé pour confirmer, puis cliquez sur le bouton de restauration.

La console affiche **Restauration de « … » démarrée**. La restauration apparaît dans la section **Restaurations** de l'onglet **Sauvegardes** et dans **Sauvegardes** > **Activité**.

### Ce que devient la base cible

| Type | Effet de la restauration |
|------|--------------------------|
| **PostgreSQL** | La base cible est entièrement reconstruite à partir de l'archive. Ses données précédentes disparaissent. |
| **MariaDB** | L'export de l'archive est rejoué dans la base cible : chaque table qu'il contient remplace la table du même nom ; les tables et bases qu'il ne contient pas sont conservées. |

### La base d'origine n'existe plus

Si la base sauvegardée a été supprimée, la console affiche **« … » n'existe plus : choisissez une autre base de données**. Créez une base du même type (et de la même version majeure pour PostgreSQL), puis restaurez l'archive dessus.

Si une nouvelle base a été créée sous le même nom après la sauvegarde, elle est traitée comme une autre base : la restauration est acceptée après confirmation.

## Suivre la restauration

La restauration passe par **En attente**, **En cours**, puis **Réussie** ou **Échouée**. Une restauration de base qui n'aboutit pas échoue d'elle-même au bout de 30 minutes ; elle ne peut pas être annulée avant.

Si une restauration PostgreSQL a échoué, la base peut rester indisponible. Une sauvegarde à la demande est alors refusée tant que la base n'est pas de nouveau prête : relancez une restauration, c'est ce qui la rétablit.

## Vérification

- La restauration est **Réussie** dans la section **Restaurations**.
- Connectez-vous à la base et contrôlez vos données, par exemple :

  ```sql
  -- PostgreSQL
  SELECT count(*) FROM ma_table;
  ```

  ```sql
  -- MariaDB
  SELECT COUNT(*) FROM ma_table;
  ```

- Après une restauration PostgreSQL en place, lancez une sauvegarde à la demande : les archives prises avant la restauration appartiennent à l'ancienne branche de l'historique de la base (voir [Concepts](../concepts.md#branches-de-lhistorique)). Cette première sauvegarde peut échouer ; relancez-la une fois (voir [Dépannage](../troubleshooting.md#la-première-sauvegarde-dune-base-postgresql-échoue)).

## Pour aller plus loin

- [Restaurer à un instant précis](./restore-point-in-time.md)
- [Dépannage : une restauration est refusée](../troubleshooting.md#une-restauration-est-refusée)
