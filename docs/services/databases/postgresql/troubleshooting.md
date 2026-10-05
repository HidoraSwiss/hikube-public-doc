---
sidebar_position: 7
title: Dépannage
---

# Dépannage — PostgreSQL

### Le cluster reste au statut « En création »

**Cause** : le provisionnement des instances et de leurs volumes est en cours. Il peut prendre plusieurs minutes, davantage avec plusieurs réplicas.

**Solution** :

1. Patientez quelques minutes et actualisez la page du cluster.
2. Si le statut ne change pas après une quinzaine de minutes, ou passe à **Erreur** ou **Échec**, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.

### Impossible de passer l'étape Configuration de l'assistant

**Cause** : la configuration demandée dépasse les quotas du projet (CPU, mémoire ou stockage). Le message « Quota de stockage dépassé pour ce projet » peut s'afficher sous le champ **Taille du disque (Go)**.

**Solution** :

1. Consultez le bandeau de quotas en haut de l'assistant.
2. Réduisez le **Preset d'instance**, la **Taille du disque (Go)** ou le **Nombre de réplicas** : la consommation est multipliée par le nombre de réplicas.
3. Si le projet a besoin de quotas supplémentaires, contactez le support.

### Connexion refusée ou délai dépassé

**Cause** : l'accès externe est désactivé, l'adresse IP n'est pas encore attribuée, ou le client utilise une mauvaise adresse ou un mauvais port.

**Solution** :

1. Dans la page du cluster, vérifiez que la carte **Accès externe** indique **Activé**. Sinon, activez-le via **Modifier**.
2. Vérifiez que le champ **Hôte (Host)** contient une adresse et non **Non défini**.
3. Utilisez le port `5432` et testez la connectivité :
   ```bash
   pg_isready -h <hôte> -p 5432
   ```
4. Vérifiez qu'aucun pare-feu sortant de votre réseau ne bloque le port `5432`.

### Authentification refusée (`password authentication failed`)

**Cause** : mot de passe erroné ou révoqué par une rotation, ou utilisateur sans droit sur la base cible.

**Solution** :

1. Vérifiez dans l'onglet **Utilisateurs** que l'utilisateur existe et qu'il a un accès sur la base utilisée (colonne **Bases de données**).
2. Si nécessaire, ajoutez l'accès via **Actions** → **Gérer les accès**.
3. Si le mot de passe a été perdu ou a changé, générez-en un nouveau via **Actions** → **Changer le mot de passe**, puis mettez à jour vos applications.

### Permission refusée sur une table (`permission denied`)

**Cause** : l'utilisateur dispose du droit **Lecture seule (Read-only)** sur la base, ou n'a pas d'accès sur cette base.

**Solution** : via **Actions** → **Gérer les accès**, attribuez le droit **Administrateur (Admin)** sur la base concernée, puis reconnectez-vous.

### Performances lentes

**Cause** : les ressources allouées sont insuffisantes pour la charge, ou des requêtes ne sont pas optimisées.

**Solution** :

1. Activez l'extension `pg_stat_statements` sur la base (**Actions** → **Gérer les extensions**) et identifiez les requêtes les plus coûteuses :
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
2. Ajoutez les index manquants.
3. Si les ressources sont saturées, passez à un preset supérieur via **Modifier**. Voir [Modifier les ressources](./how-to/scale-resources.md).
4. Pour ajuster les paramètres PostgreSQL (`shared_buffers`, `work_mem`, `max_connections`), contactez le support : ces paramètres ne sont pas proposés dans la console.

### Disque plein

**Cause** : le volume de données a atteint la **Taille allouée**.

**Solution** : augmentez la **Taille du disque (Go)** via **Modifier**, dans la limite du quota de stockage du projet. Supprimez au besoin les données obsolètes et lancez `VACUUM` pour récupérer l'espace.
