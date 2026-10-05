---
sidebar_position: 7
title: Dépannage
---

# Dépannage — MongoDB

### Le cluster reste au statut « En création »

**Cause** : le provisionnement des membres et de leurs volumes est en cours. Il est plus long avec le sharding, qui déploie davantage de composants.

**Solution** :

1. Patientez quelques minutes et actualisez la page du cluster.
2. Si le statut ne change pas après une quinzaine de minutes, ou passe à **Erreur** ou **Échec**, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.

### Impossible de passer l'étape Configuration de l'assistant

**Cause** : la configuration dépasse les quotas du projet. Avec le sharding, la consommation inclut 2 shards, les serveurs de configuration et les routeurs Mongos.

**Solution** : réduisez la préconfiguration, la taille du disque ou le nombre de réplicas, désactivez le sharding si vous n'en avez pas besoin, ou demandez une augmentation des quotas du projet.

### Connexion refusée ou délai dépassé

**Cause** : l'accès externe est désactivé, l'adresse n'est pas encore attribuée, ou un pare-feu bloque le port.

**Solution** :

1. Dans la carte **Connexion et réseau**, vérifiez que l'**Accès externe** est **Activé** et que le champ **Hôte (Host)** contient une adresse.
2. Testez la connectivité :
   ```bash
   mongosh "mongodb://<hôte>:27017" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Vérifiez qu'aucun pare-feu sortant de votre réseau ne bloque le port `27017`.

### `Authentication failed`

**Cause** : mot de passe erroné ou révoqué par une rotation, ou mauvaise base d'authentification.

**Solution** :

1. Indiquez la base d'authentification `admin` (`--authenticationDatabase admin` ou `?authSource=admin` dans l'URI).
2. En cas de doute sur le mot de passe, générez-en un nouveau via **Actions** → **Changer le mot de passe**, puis mettez à jour vos applications.

### `not authorized on <base> to execute command`

**Cause** : l'utilisateur n'a pas d'accès sur cette base, ou seulement un accès **Lecture seule**.

**Solution** : via **Actions** → **Gérer les accès**, ajoutez la base concernée avec les **Droits** adaptés, puis reconnectez-vous.

### Erreur lors de l'ajout d'un accès ou d'un utilisateur

**Cause** : aucun rôle n'est défini, ou un nom ne respecte pas les règles de nommage.

**Solution** : attribuez au moins un rôle global ou un accès spécifique, et utilisez uniquement des minuscules, des chiffres et des tirets, en commençant par une lettre. Voir [Concepts MongoDB](./concepts.md#règles-de-nommage).

### Disque plein

**Cause** : le volume de données a atteint la **Taille allouée**.

**Solution** : augmentez la **Taille du disque (Go)** via **Modifier**, dans la limite du quota de stockage du projet. Voir [Modifier les ressources](./how-to/scale-resources.md). Supprimez au besoin les données obsolètes ou posez des index TTL sur les collections d'évènements.
