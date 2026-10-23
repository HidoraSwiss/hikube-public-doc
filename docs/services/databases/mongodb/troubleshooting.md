---
sidebar_position: 7
title: "Dépannage — MongoDB"
sidebar_label: Dépannage
description: "Résolvez les problèmes de MongoDB sur Hikube : cluster en erreur, connexion refusée, not primary, Authentication failed, not authorized, disque plein."
---

# Dépannage — MongoDB

### Le cluster reste au statut « En création »

**Cause** : le provisionnement des membres et de leurs volumes est en cours. Il est plus long avec le sharding, qui déploie davantage de composants.

**Solution** :

1. Patientez quelques minutes et actualisez la page du cluster.
2. Si le statut ne change pas après une quinzaine de minutes, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.

### Le cluster passe au statut « Erreur »

**Cause** : la plateforme n'a pas pu appliquer la création du cluster ou sa dernière modification. Après une modification, le cluster peut continuer à fonctionner avec sa configuration précédente.

**Solution** : [contactez le support](mailto:support@hidora.io) en indiquant le projet, le nom du cluster et la modification demandée.

### Impossible de passer l'étape Configuration de l'assistant

**Cause** : la configuration dépasse les quotas du projet. Avec le sharding, la consommation inclut 2 shards, les serveurs de configuration et les routeurs Mongos.

**Solution** : réduisez la préconfiguration, la taille du disque ou le nombre de réplicas, désactivez le sharding si vous n'en avez pas besoin, ou demandez une augmentation des quotas du projet.

### Connexion refusée ou délai dépassé

**Cause** : l'accès externe est désactivé, l'adresse n'est pas encore attribuée, ou un pare-feu bloque le port.

**Solution** :

1. Dans la carte **Connexion et réseau**, vérifiez que la zone **Externe** contient une adresse (une par membre pour un replica set), et non **Désactivé** ou « En attente d'attribution… ».
2. Testez la connectivité (sur un replica set, avec l'adresse d'un membre) :
   ```bash
   mongosh "mongodb://<hôte>:27017/?directConnection=true" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Vérifiez qu'aucun pare-feu sortant de votre réseau ne bloque le port `27017`.

### `ENOTFOUND`, ou écriture refusée avec `not primary`

**Cause** : sur un replica set, le client a reçu le paramètre `replicaSet` et cherche à joindre les membres sous leurs noms internes au cluster, qui ne se résolvent pas depuis l'extérieur ; ou il est connecté directement à un secondaire, qui n'accepte pas les écritures.

**Solution** :

1. Retirez `replicaSet` de la chaîne de connexion et ajoutez `directConnection=true`, comme dans la **Chaîne de connexion externe** de la carte **Connexion et réseau**.
2. Pour écrire, connectez-vous au membre primaire : `db.hello().isWritablePrimary` indique si le membre joint l'est. Sinon, essayez un autre membre de la liste.

### `Authentication failed`

**Cause** : mot de passe erroné ou révoqué par une rotation, ou mauvaise base d'authentification.

**Solution** :

1. Indiquez la base d'authentification `admin` (`--authenticationDatabase admin` ou `?authSource=admin` dans l'URI).
2. En cas de doute sur le mot de passe, générez-en un nouveau via **Actions** → **Changer le mot de passe**, puis mettez à jour vos applications.

### `not authorized on <base> to execute command`

**Cause** : l'utilisateur n'a pas d'accès sur cette base, ou seulement un accès **Lecture seule**.

**Solution** : via **Actions** → **Gérer les accès**, ajoutez la base concernée avec les **Droits** adaptés, puis reconnectez-vous.

### Erreur lors de l'ajout d'un accès ou d'un utilisateur

**Cause** : aucun accès à une base n'est défini, un accès vise une base système (`admin`, `local`, `config`), ou un nom ne respecte pas les règles de nommage.

**Solution** : attribuez au moins un accès à une base applicative, et utilisez uniquement des minuscules, des chiffres et des tirets, en commençant par une lettre et en terminant par une lettre ou un chiffre. Voir [Concepts MongoDB](./concepts.md#règles-de-nommage).

### Une ligne `admin` apparaît en erreur dans « Gérer les accès »

**Cause** : l'utilisateur a été créé avec l'assistant de création de cluster avant la console v1.3.0, qui lui attribuait un rôle sur la base système `admin`. Une base système ne peut plus recevoir d'accès, et la mise à jour de l'utilisateur est refusée tant que cette ligne est présente.

**Solution** : retirez la ligne `admin`, ajoutez si besoin la base applicative de l'utilisateur, puis cliquez sur **Enregistrer**. Le message « Accès mis à jour » confirme l'enregistrement.

### Disque plein

**Cause** : le volume de données a atteint la **Taille allouée**.

**Solution** : augmentez la **Taille du disque (Go)** via **Modifier**, dans la limite du quota de stockage du projet. La taille ne peut pas être réduite ensuite. Voir [Modifier les ressources](./how-to/scale-resources.md). Supprimez au besoin les données obsolètes ou posez des index TTL sur les collections d'évènements.
