---
title: "Comment créer et gérer une destination de sauvegarde"
sidebar_position: 1
description: "Créez une destination de sauvegarde Hikube sur un bucket de votre projet, modifiez sa rétention, utilisez un bucket verrouillé (WORM) et supprimez une destination."
---

# Comment créer et gérer une destination de sauvegarde

Une destination indique où les sauvegardes du projet sont écrites, et combien de temps elles sont gardées. Ce guide la crée depuis la [console Hikube](https://console.hikube.cloud), puis explique comment modifier sa rétention et la supprimer.

## Prérequis

- Un **bucket S3** dans le projet (voir [Créer un bucket](../../storage/buckets/quick-start.md)). Pour des archives que personne ne peut supprimer avant un an, créez-le avec le verrouillage d'objets (voir [Bucket verrouillé](#utiliser-un-bucket-verrouillé-worm)).

## Créer une destination

1. Ouvrez **Infrastructure** > **Sauvegardes**, onglet **Destinations**, puis cliquez sur **Créer une destination**.
2. Renseignez la page **Nouvelle destination** :

   | Champ | Valeur |
   |-------|--------|
   | **Nom** | Minuscules, chiffres et tirets, 40 caractères au plus, sans commencer ni finir par un tiret. Unique dans le projet. |
   | **Bucket** | Un bucket du projet. |
   | **Identifiants** | **Créer un utilisateur dédié** (recommandé) avec un **Nom de l'utilisateur**, ou **Utiliser un utilisateur existant** du bucket. |
   | **Rétention (jours)** | Nombre entier de jours, de 1 à 3 650. |

3. Cliquez sur **Créer**. La console affiche **Destination créée**.

Dans l'onglet **Destinations**, la destination passe de **En préparation** à **Prête**. Elle est alors utilisable par toutes les bases PostgreSQL et MariaDB, VM et disques du projet.

:::tip Un utilisateur dédié
Un utilisateur de bucket réservé aux sauvegardes peut être révoqué ou voir ses clés renouvelées sans toucher aux applications qui utilisent le même bucket. Si la création de l'utilisateur réussit mais pas celle de la destination, la console le signale : réessayez en choisissant cet utilisateur existant, ou supprimez-le depuis l'écran du bucket.
:::

## Modifier la rétention

1. Dans l'onglet **Destinations**, ouvrez le menu de la destination et choisissez **Modifier la rétention**.
2. Saisissez les **Jours de conservation**, puis cliquez sur **Enregistrer**.

La nouvelle valeur ne s'applique pas de la même façon à toutes les archives :

- **MariaDB, VM, disques** : les archives déjà écrites gardent leur rétention ; seules les suivantes prennent la nouvelle valeur.
- **PostgreSQL** : la nouvelle valeur s'applique à tout l'historique. L'abaisser peut supprimer des archives existantes dès la sauvegarde suivante.

## Utiliser un bucket verrouillé (WORM)

Si le bucket choisi a été créé avec le verrouillage d'objets, chaque archive y est verrouillée 365 jours : personne ne peut la supprimer avant. La console affiche **WORM · 365 j** à côté de la destination.

- La rétention doit être d'au moins 365 jours. Une valeur plus courte est refusée, à la création comme à la modification, avec le minimum exact.
- Le verrouillage d'un bucket ne change jamais : il est fixé à sa création.

## Supprimer une destination

1. Dans l'onglet **Destinations**, ouvrez le menu de la destination et choisissez **Supprimer**.
2. Confirmez.

Avant de confirmer, retenez que :

- la suppression est **refusée** tant qu'une programmation, une sauvegarde en cours ou une restauration utilise la destination : supprimez d'abord les programmations concernées ;
- les archives déjà prises **restent dans votre bucket** : rien n'est effacé ;
- ces archives **ne sont plus restaurables**, même si vous recréez ensuite une destination du même nom sur le même bucket ;
- pour PostgreSQL, la rétention cesse d'être appliquée : les archives ne sont plus supprimées automatiquement.

Si la suppression n'aboutit pas entièrement, la destination reste listée **En erreur** avec un message qui indique ce qui n'a pas pu être libéré : supprimez-la à nouveau.

## Vérification

- La destination est **Prête** dans l'onglet **Destinations**.
- Dans l'onglet **Sauvegardes** d'une base, d'une VM ou d'un disque, la destination est proposée dans **Programmer** et **Sauvegarder maintenant**.

## Pour aller plus loin

- [Programmer des sauvegardes](./schedule-backups.md)
- [Concepts : destinations](../concepts.md#destinations)
