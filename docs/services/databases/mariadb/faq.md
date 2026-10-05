---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Mes applications MySQL sont-elles compatibles ?

Oui. **MariaDB** est un fork open source de MySQL, compatible avec le protocole et la syntaxe MySQL. Les clients `mysql`, `mysqldump` et les connecteurs MySQL (JDBC, PDO, `mysql2`, etc.) fonctionnent sans modification. Ce service était auparavant présenté dans cette documentation sous le nom « MySQL ».

### Quelle version choisir ?

L'assistant propose les versions **10.6**, **10.11**, **11.4** et **11.8**. Choisissez la plus récente pour un nouveau projet, ou la version la plus proche de votre environnement actuel pour une migration. La version peut être changée après la création depuis **Modifier**.

### Quelles préconfigurations sont disponibles ?

La **Préconfiguration (Preset)** fixe le CPU et la mémoire de chaque nœud. La liste affichée par l'assistant fait foi ; à titre indicatif :

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

:::warning
La préconfiguration ne peut pas être modifiée après la création. Dimensionnez-la en conséquence, ou contactez le support pour la changer.
:::

### Comment fonctionne la réplication ?

Le primary écrit ses modifications dans le binary log, que les réplicas rejouent. En cas de panne du primary, la plateforme promeut automatiquement un réplica. Choisissez **3 (Haute disponibilité max)** ou **5 (Très haute disponibilité)** réplicas à la création pour en bénéficier : ce nombre n'est plus modifiable ensuite.

### Où trouver l'adresse de connexion ?

Dans la carte **Connexion et réseau** de la page du cluster, champ **Hôte (Host)**, lorsque l'**Accès externe** est activé. Le port est `3306`. Sans accès externe, le champ affiche **Non défini** : le cluster reste joignable depuis les VM et les clusters Kubernetes du projet par une adresse interne, que la console n'affiche pas ; [contactez le support](mailto:support@hidora.io) pour l'obtenir.

### Comment créer une base de données ?

Accordez à un utilisateur un accès sur le nom de la base (**Gérer les accès** → **Accès spécifiques (Bases de données)** → **Ajouter**). La base est créée si elle n'existe pas. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

### Pourquoi l'utilisateur créé dans l'assistant n'a-t-il pas accès à ma base ?

Le **Rôle** choisi dans l'assistant de création du cluster s'applique à la base système `mysql`. Accordez ensuite l'accès à vos bases applicatives via **Gérer les accès**.

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Il ne peut pas être relu. Générez-en un nouveau : **Actions** → **Changer le mot de passe** → **Effectuer la rotation**. L'ancien mot de passe est révoqué immédiatement.

### Peut-on limiter le nombre de connexions par utilisateur ou modifier les paramètres serveur ?

Ces réglages ne sont pas proposés dans la console ; contactez le support.

### Les sauvegardes sont-elles disponibles ?

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; contactez le support. Voir [Configurer les sauvegardes](./how-to/configure-backups.md).
