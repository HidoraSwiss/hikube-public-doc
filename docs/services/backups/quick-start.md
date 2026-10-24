---
sidebar_position: 3
title: "Sauvegarder et restaurer une base PostgreSQL"
sidebar_label: Démarrage rapide
description: "Créez une destination de sauvegarde depuis la console Hikube, programmez la sauvegarde d'une base PostgreSQL, lancez-en une à la demande puis restaurez l'archive."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import NavigationFooter from '@site/src/components/NavigationFooter';

# Sauvegarder et restaurer une base PostgreSQL

Ce guide crée une destination de sauvegarde depuis la [console Hikube](https://console.hikube.cloud), programme la sauvegarde quotidienne d'une base PostgreSQL, en lance une à la demande, puis restaure l'archive obtenue. La démarche est la même pour une base MariaDB, une VM ou un disque.

---

## Prérequis

- Un projet Hikube contenant :
  - un **bucket S3** (voir [Créer un bucket](../storage/buckets/quick-start.md)) ;
  - une **base PostgreSQL**, par exemple `orders-db` (voir [Démarrage rapide PostgreSQL](../databases/postgresql/quick-start.md)).
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`. Remplacez `<bucket>` par le nom de votre bucket.

---

## Étape 1 : Ouvrir la création de destination

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans le menu latéral, ouvrez **Infrastructure** > **Sauvegardes**.
2. Ouvrez l'onglet **Destinations**, puis cliquez sur **Créer une destination**.

La page **Nouvelle destination** s'ouvre.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas de page de création. Vérifiez que la clé donne accès au service en listant les destinations du projet :

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/destinations" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{totalCount, destinations: [.destinations[]?.name]}'
```

</TabItem>
</Tabs>


---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. **Nom** : `quotidien` (minuscules, chiffres et tirets, 40 caractères au plus).
2. **Bucket** : choisissez le bucket du projet.
3. **Identifiants** : laissez **Créer un utilisateur dédié** et saisissez un **Nom de l'utilisateur**, par exemple `backup`. Ses identifiants ne serviront qu'aux sauvegardes.
4. **Rétention (jours)** : conservez `30`.
5. Cliquez sur **Créer**.

La console affiche **Destination créée** : « quotidien » est en préparation.

</TabItem>
<TabItem value="api" label="API">

Créez l'utilisateur dédié du bucket, puis la destination :

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/<bucket>/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "backup", "config": {"readonly": false}}' > /dev/null

curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/destinations" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "quotidien", "bucketName": "<bucket>", "bucketUser": "backup", "retentionDays": 30}' \
  | jq '.destination | {name, status}'
```

</TabItem>
</Tabs>


---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Dans l'onglet **Destinations**, l'état de `quotidien` passe de **En préparation** à **Prête** en quelques instants.

**Résultat attendu :** destination **Prête**, avec le bucket, l'utilisateur et la rétention de 30 jours.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/destinations/quotidien" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.destination | {status, bucketName, bucketUser, retentionDays}'
```

**Résultat attendu :** `status` passe de `provisioning` à `ready`.

</TabItem>
</Tabs>


---

## Étape 4 : Programmer et lancer une sauvegarde

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez **PostgreSQL**, cliquez sur `orders-db`, puis sur l'onglet **Sauvegardes**.
2. Dans **Programmation**, cliquez sur **Programmer**. La fenêtre **Programmer une sauvegarde** s'ouvre :
   - **Nom du plan** : `orders-db-quotidien` ;
   - **Destination** : `quotidien` ;
   - onglet **Préréglage**, **Fréquence** : **Chaque jour**, **Heure** `02`, **Minute** `00` (heure locale).
3. Cliquez sur **Programmer**. La carte **Programmation** affiche l'horaire et la **Prochaine** exécution.
4. Dans **Sauvegarde à la demande**, cliquez sur **Sauvegarder maintenant**. La console affiche **Sauvegarde démarrée vers « quotidien »**.

La sauvegarde apparaît dans **État des exécutions**, puis dans la liste des archives de la base.

**Résultat attendu :** au bout de quelques minutes, l'archive passe à **Prête**.

</TabItem>
<TabItem value="api" label="API">

Programmez une sauvegarde quotidienne à 01:00 UTC, puis lancez une sauvegarde immédiate :

```bash
curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/plans" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "orders-db-quotidien", "application": {"kind": "postgres", "name": "orders-db"}, "destination": "quotidien", "cron": "0 1 * * *"}' \
  | jq '.plan | {status, nextRunAt}'

JOB=$(curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/jobs" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"application": {"kind": "postgres", "name": "orders-db"}, "destination": "quotidien"}' | jq -r '.job.name')

curl -sS "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/jobs/$JOB" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.job | {status, backup}'
```

**Résultat attendu :** au bout de quelques minutes, `status` vaut `succeeded` et `backup` nomme l'archive. Notez ce nom : `BACKUP=<nom de l'archive>`.

</TabItem>
</Tabs>

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

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Sauvegardes** de `orders-db`, sur la ligne de l'archive, cliquez sur **Restaurer**.
2. **Cible de la restauration** : **Sur la base d'origine**.
3. **Restaurer jusqu'à** : laissez l'état de la sauvegarde sélectionnée.
4. Saisissez `orders-db` pour confirmer, puis cliquez sur le bouton de restauration (**Restaurer l'état de la sauvegarde du…**).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"backup\": \"$BACKUP\", \"confirmDestructive\": true}" | jq '.restore | {name, status}'
```

Suivez la restauration avec `GET $HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores/<nom>` jusqu'à `status` `succeeded`.

</TabItem>
</Tabs>

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

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans l'onglet **Sauvegardes** de `orders-db`, carte **Programmation**, cliquez sur **Supprimer** et confirmez. Les archives sont conservées.
2. Supprimez les archives de test avec **Supprimer** sur chaque ligne. Pour PostgreSQL, seule la fiche disparaît : les données restent dans le bucket, que vous pouvez vider depuis **Buckets S3**.
3. Dans **Sauvegardes** > **Destinations**, ouvrez le menu de `quotidien` et choisissez **Supprimer**. La suppression est refusée tant qu'une programmation, une sauvegarde ou une restauration l'utilise.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/plans/orders-db-quotidien" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/backups/$BACKUP" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/destinations/quotidien" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Pour PostgreSQL, seule la fiche de l'archive disparaît : les données restent dans le bucket.

</TabItem>
</Tabs>


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
