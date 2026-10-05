---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Quels presets d'instance sont disponibles ?

Le **Preset d'instance** fixe le CPU et la mémoire de chaque nœud du cluster. La liste affichée par l'assistant fait foi ; à titre indicatif :

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Le preset peut être changé après la création depuis **Modifier**. La définition de valeurs CPU/mémoire libres n'est pas proposée dans la console ; contactez le support.

### Combien de réplicas choisir ?

- **1 (Standalone)** : développement et tests. Une panne de l'instance rend la base indisponible jusqu'à son redémarrage.
- **2 (Haute disponibilité)** : un standby prêt à prendre le relais en cas de panne du primary.
- **3 (Haute disponibilité max)** : recommandé pour la production critique.

Le nombre de réplicas ne peut pas être modifié après la création ; contactez le support si vous devez le changer.

### Où trouver l'adresse de connexion ?

Dans la page du cluster, carte **Connexion et Bases de données**, champ **Hôte (Host)**. Une adresse n'y figure que si l'**Accès externe** est activé ; sinon le champ affiche **Non défini**. Le port est `5432`.

### Comment se connecter depuis une VM ou un cluster Kubernetes du même projet sans accès externe ?

Sans accès externe, le cluster reste joignable depuis les VM et les clusters Kubernetes du projet par une adresse interne au projet, que la console n'affiche pas. [Contactez le support](mailto:support@hidora.io) pour l'obtenir.

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Les mots de passe ne sont affichés qu'une fois et ne peuvent pas être relus. Générez-en un nouveau : onglet **Utilisateurs** → **Actions** → **Changer le mot de passe** → **Effectuer la rotation**. L'ancien mot de passe est révoqué immédiatement.

### Pourquoi mon nom d'utilisateur est-il refusé ?

Les noms d'utilisateur PostgreSQL comptent 3 à 16 caractères, en minuscules, chiffres et tirets bas (`_`), et commencent par une lettre ou un tiret bas. Le tiret (`-`) n'est pas accepté. Les noms `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica`, `cnpg_pooler_pgbouncer` et tous ceux commençant par `pg_` sont réservés.

### Comment ajouter des extensions PostgreSQL ?

À la création d'une base (onglet **Bases de données** → **Créer**, section **Extensions PostgreSQL**) ou ensuite, via **Actions** → **Gérer les extensions**. Les extensions proposées incluent notamment `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` et `vector` (pgvector).

### Peut-on créer plusieurs bases et utilisateurs ?

Oui. Ajoutez autant de bases que nécessaire dans l'onglet **Bases de données**, et autant d'utilisateurs que nécessaire dans l'onglet **Utilisateurs**. Chaque utilisateur peut avoir un droit différent sur chaque base (**Administrateur (Admin)** ou **Lecture seule (Read-only)**).

### Peut-on modifier les paramètres PostgreSQL (`max_connections`, `shared_buffers`…) ?

Ces paramètres ne sont pas proposés dans la console ; contactez le support.

### Les sauvegardes sont-elles disponibles ?

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; contactez le support. Voir [Configurer les sauvegardes](./how-to/configure-backups.md).
