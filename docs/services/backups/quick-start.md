---
sidebar_position: 3
title: "Sauvegarder et restaurer une base PostgreSQL"
sidebar_label: Démarrage rapide
description: "Créez une destination de sauvegarde depuis la console Hikube, programmez la sauvegarde d'une base PostgreSQL, lancez-en une à la demande puis restaurez l'archive."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Sauvegarder et restaurer une base PostgreSQL

Ce guide crée une destination de sauvegarde depuis la [console Hikube](https://console.hikube.cloud), programme la sauvegarde quotidienne d'une base PostgreSQL, en lance une à la demande, puis restaure l'archive obtenue. La démarche est la même pour une base MariaDB, une VM ou un disque.

---

## Prérequis

- Un projet Hikube contenant :
  - un **bucket S3** (voir [Créer un bucket](../storage/buckets/quick-start.md)) ;
  - une **base PostgreSQL**, par exemple `orders-db` (voir [Démarrage rapide PostgreSQL](../databases/postgresql/quick-start.md)).

---

## Étape 1 : Ouvrir la création de destination

1. Dans le menu latéral, ouvrez **Infrastructure** > **Sauvegardes**.
2. Ouvrez l'onglet **Destinations**, puis cliquez sur **Créer une destination**.

La page **Nouvelle destination** s'ouvre.

---

## Étape 2 : Configurer et valider

1. **Nom** : `quotidien` (minuscules, chiffres et tirets, 40 caractères au plus).
2. **Bucket** : choisissez le bucket du projet.
3. **Identifiants** : laissez **Créer un utilisateur dédié** et saisissez un **Nom de l'utilisateur**, par exemple `backup`. Ses identifiants ne serviront qu'aux sauvegardes.
4. **Rétention (jours)** : conservez `30`.
5. Cliquez sur **Créer**.

La console affiche **Destination créée** : « quotidien » est en préparation.

---

## Étape 3 : Vérifier l'état

Dans l'onglet **Destinations**, l'état de `quotidien` passe de **En préparation** à **Prête** en quelques instants.

**Résultat attendu :** destination **Prête**, avec le bucket, l'utilisateur et la rétention de 30 jours.

---

## Étape 4 : Programmer et lancer une sauvegarde

1. Ouvrez **PostgreSQL**, cliquez sur `orders-db`, puis sur l'onglet **Sauvegardes**.
2. Dans **Programmation**, cliquez sur **Programmer**. La fenêtre **Programmer une sauvegarde** s'ouvre :
   - **Nom du plan** : `orders-db-quotidien` ;
   - **Destination** : `quotidien` ;
   - onglet **Préréglage**, **Fréquence** : **Chaque jour**, **Heure** `02`, **Minute** `00` (heure locale).
3. Cliquez sur **Programmer**. La carte **Programmation** affiche l'horaire et la **Prochaine** exécution.
4. Dans **Sauvegarde à la demande**, cliquez sur **Sauvegarder maintenant**. La console affiche **Sauvegarde démarrée vers « quotidien »**.

La sauvegarde apparaît dans **État des exécutions**, puis dans la liste des archives de la base.

**Résultat attendu :** au bout de quelques minutes, l'archive passe à **Prête**.

:::note Horaire en UTC
L'heure choisie dans le préréglage est convertie en UTC. Elle se décalera donc d'une heure en heure locale au prochain changement d'heure. Voir [Concepts](./concepts.md#horaires-et-fuseau-horaire).
:::

---

## Étape 5 : Restaurer et vérifier

Ajoutez d'abord une donnée témoin, pour constater ensuite son absence après restauration :

```sql
CREATE TABLE apres_sauvegarde (id int);
```

Puis restaurez l'archive sur la base d'origine :

1. Dans l'onglet **Sauvegardes** de `orders-db`, sur la ligne de l'archive, cliquez sur **Restaurer**.
2. **Cible de la restauration** : **Sur la base d'origine**.
3. **Restaurer jusqu'à** : laissez l'état de la sauvegarde sélectionnée.
4. Saisissez `orders-db` pour confirmer, puis cliquez sur le bouton de restauration (**Restaurer l'état de la sauvegarde du…**).

:::warning
Une restauration en place **écrase** le contenu actuel de la base. Pour tester sans toucher à vos données, créez une seconde base PostgreSQL vide de la même version et choisissez **Sur une autre base de données**.
:::

La restauration apparaît dans **Restaurations**, puis passe à **Réussie**. Reconnectez-vous à la base :

```sql
SELECT to_regclass('apres_sauvegarde');
```

**Résultat attendu :** `NULL` : la table créée après la sauvegarde n'existe plus.

---

## Étape 6 : Dépannage rapide

| Symptôme | Action |
|----------|--------|
| **Aucun bucket dans ce projet** | Créez un bucket depuis **Buckets S3**, puis revenez à la création de destination. |
| La destination reste **En erreur** | Le bucket ou son utilisateur n'est plus lisible : voir [Dépannage](./troubleshooting.md#la-destination-est-en-erreur). |
| **Aucune destination prête dans ce projet** dans la fenêtre de programmation | Attendez que la destination soit **Prête**. |
| L'archive est **Échouée** | Lisez le message de l'exécution dans **Sauvegardes** > **Activité**, puis voir [Dépannage](./troubleshooting.md#une-sauvegarde-échoue). |
| La restauration est refusée | Voir [Dépannage](./troubleshooting.md#une-restauration-est-refusée). |

---

## Étape 7 : Nettoyage

1. Dans l'onglet **Sauvegardes** de `orders-db`, carte **Programmation**, cliquez sur **Supprimer** et confirmez. Les archives sont conservées.
2. Supprimez les archives de test avec **Supprimer** sur chaque ligne. Pour PostgreSQL, seule la fiche disparaît : les données restent dans le bucket, que vous pouvez vider depuis **Buckets S3**.
3. Dans **Sauvegardes** > **Destinations**, ouvrez le menu de `quotidien` et choisissez **Supprimer**. La suppression est refusée tant qu'une programmation, une sauvegarde ou une restauration l'utilise.

---

## Prochaines étapes

- [Programmer des sauvegardes](./how-to/schedule-backups.md)
- [Restaurer une base à un instant précis](./how-to/restore-point-in-time.md)
- [Restaurer une VM ou un disque](./how-to/restore-vm-or-disk.md)

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/create-destination"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
