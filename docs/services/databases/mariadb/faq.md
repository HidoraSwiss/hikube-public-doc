---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Mes applications MySQL sont-elles compatibles ?

Oui. **MariaDB** est un fork open source de MySQL, compatible avec le protocole et la syntaxe MySQL. Les clients `mysql`, `mysqldump` et les connecteurs MySQL (JDBC, PDO, `mysql2`, etc.) fonctionnent sans modification. Ce service était auparavant présenté dans cette documentation sous le nom « MySQL ».

### Quelle version choisir ?

L'assistant propose les versions **10.6**, **10.11**, **11.4** et **11.8**. Choisissez la plus récente pour un nouveau projet, ou la version la plus proche de votre environnement actuel pour une migration. La version peut être montée après la création depuis **Modifier** ; elle ne peut pas être abaissée.

### Quelles préconfigurations sont disponibles ?

La **Préconfiguration (Preset)** fixe le CPU et la mémoire de chaque nœud. Les presets reprennent les tailles des [machines virtuelles](../../compute/overview.md), séries `u1`, `s1` et `m1` : un preset a les mêmes ressources que la VM du même nom. La liste affichée par l'assistant fait foi :

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

:::warning
La préconfiguration ne peut pas être modifiée après la création. Dimensionnez-la en conséquence, ou contactez le support pour la changer.
:::

### Comment fonctionne la réplication ?

Le primary écrit ses modifications dans le binary log, que les réplicas rejouent. En cas de panne du primary, la plateforme promeut automatiquement un réplica. Choisissez **3 (Haute disponibilité max)** ou **5 (Très haute disponibilité)** réplicas à la création pour en bénéficier : ce nombre n'est plus modifiable ensuite.

### Où trouver l'adresse de connexion ?

Dans la carte **Connexion et réseau** de la page du cluster, champ **Hôte (Host)**, lorsque l'**Accès externe** est activé. Le port est `3306`. Sans accès externe, le champ affiche **Non défini** : le cluster reste joignable depuis les VM et les clusters Kubernetes du projet par une adresse interne, que la console n'affiche pas ; [contactez le support](mailto:support@hidora.io) pour l'obtenir.

### Comment créer une base de données ?

Accordez à un utilisateur un accès sur le nom de la base (**Gérer les accès** → **Accès spécifiques (Bases de données)** → **Ajouter**), ou indiquez-la comme **Base de données** d'un utilisateur à l'étape **Utilisateurs** de l'assistant de création du cluster. La base est créée si elle n'existe pas. Les noms de bases système (`mysql`, `information_schema`, `performance_schema`, `sys`) sont refusés. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

### Pourquoi l'utilisateur créé dans l'assistant n'a-t-il pas accès à ma base ?

Le **Rôle** choisi dans l'assistant s'applique à la **Base de données** indiquée pour cet utilisateur, et à elle seule. Accordez l'accès à vos autres bases via **Gérer les accès**.

Les utilisateurs créés avant la console v1.3.0 ont reçu leur rôle sur la base système `mysql`. Dans **Gérer les accès**, retirez la ligne `mysql`, affichée en erreur, et ajoutez leur base applicative.

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Il ne peut pas être relu. Générez-en un nouveau : **Actions** → **Changer le mot de passe** → **Effectuer la rotation**. L'ancien mot de passe est révoqué immédiatement.

### Peut-on limiter le nombre de connexions par utilisateur ou modifier les paramètres serveur ?

Ces réglages ne sont pas proposés dans la console ; contactez le support.

### Les sauvegardes sont-elles disponibles ?

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; contactez le support. Voir [Configurer les sauvegardes](./how-to/configure-backups.md).
