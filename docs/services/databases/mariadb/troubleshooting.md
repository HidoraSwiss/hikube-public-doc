---
sidebar_position: 7
title: Dépannage
---

# Dépannage — MariaDB

### Le cluster reste au statut « En création »

**Cause** : le provisionnement des nœuds et de leurs volumes est en cours. Il peut prendre plusieurs minutes, davantage avec 3 ou 5 réplicas.

**Solution** :

1. Patientez quelques minutes et actualisez la page du cluster.
2. Si le statut ne change pas après une quinzaine de minutes, ou passe à **Erreur** ou **Échec**, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.

### Connexion refusée ou délai dépassé

**Cause** : l'accès externe est désactivé, l'adresse IP n'est pas encore attribuée, ou le client utilise une mauvaise adresse ou un mauvais port.

**Solution** :

1. Dans la carte **Connexion et réseau**, vérifiez que l'**Accès externe** est **Activé** et que le champ **Hôte (Host)** contient une adresse.
2. Utilisez le port `3306` et testez la connectivité :
   ```bash
   mysqladmin -h <hôte> -P 3306 -u <utilisateur> -p ping
   ```
3. Vérifiez qu'aucun pare-feu sortant de votre réseau ne bloque le port `3306`.

### `Access denied for user`

**Cause** : mot de passe erroné ou révoqué par une rotation, ou utilisateur sans droit sur la base indiquée.

**Solution** :

1. Vérifiez dans la liste des utilisateurs la colonne **Bases de données** : l'utilisateur doit avoir un accès sur la base utilisée.
2. Ajoutez l'accès via **Actions** → **Gérer les accès** si nécessaire.
3. En cas de doute sur le mot de passe, générez-en un nouveau via **Actions** → **Changer le mot de passe** et mettez à jour vos applications.

### Erreur lors de l'ajout d'un accès ou d'un utilisateur

**Cause** : le nom de la base ou de l'utilisateur ne respecte pas les règles de nommage.

**Solution** : utilisez uniquement des minuscules, des chiffres et des tirets, en commençant par une lettre et en terminant par une lettre ou un chiffre. Les tirets bas (`_`) et les majuscules ne sont pas acceptés. Voir [Concepts MariaDB](./concepts.md#règles-de-nommage).

### Espace disque plein

**Cause** : le volume de données (y compris les binary logs) a atteint la **Taille allouée**.

**Solution** :

1. Mesurez l'espace utilisé par base :
   ```sql
   SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
   FROM information_schema.tables
   GROUP BY table_schema;
   ```
2. Augmentez la **Taille du disque (Go)** via **Modifier**, dans la limite du quota de stockage du projet. Voir [Modifier les ressources](./how-to/scale-resources.md).
3. Supprimez les données obsolètes, puis optimisez les tables concernées (`OPTIMIZE TABLE`).

### Réplication désynchronisée

**Cause** : un réplica n'arrive plus à suivre le primary (charge d'écriture élevée, ressources insuffisantes, incident d'infrastructure).

**Solution** : la resynchronisation d'un réplica n'est pas proposée dans la console. [Contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.
