---
sidebar_position: 6
title: "FAQ — MongoDB"
sidebar_label: FAQ
description: "Questions courantes sur MongoDB Hikube : version, nombre de réplicas, sharding, adresse de connexion, droits des utilisateurs, mot de passe et sauvegardes."
---

# FAQ — MongoDB

### Quelle version choisir ?

L'assistant propose **6.0**, **7.0** et **8.0** (par défaut). Choisissez la plus récente pour un nouveau projet. Pour une migration, partez de la version de votre environnement actuel, puis montez de version une étape à la fois depuis **Modifier**. Une version ne peut pas être abaissée.

### Combien de réplicas choisir ?

- **1 (Standalone)** : développement et tests, sans tolérance aux pannes.
- **3 (Haute disponibilité max)** : recommandé en production ; le cluster reste disponible si un membre tombe.
- **5 (Très haute disponibilité)** : tolère la perte de deux membres.

Le nombre de réplicas ne peut pas être modifié après la création.

### Quand activer le sharding ?

Lorsque le volume de données ou le débit d'écriture dépasse ce qu'un seul replica set peut absorber. Le sharding se décide à la création et multiplie les ressources consommées (2 shards, serveurs de configuration et routeurs Mongos). Pour la plupart des applications, un replica set suffit. Voir [Configurer le sharding](./how-to/configure-sharding.md).

### Quelles préconfigurations sont disponibles ?

La **Préconfiguration (Preset)** fixe le CPU et la mémoire de chaque nœud. Les presets reprennent les tailles des [machines virtuelles](../../compute/overview.md), séries `u1`, `s1` et `m1` : un preset a les mêmes ressources que la VM du même nom.

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

La liste affichée par l'assistant fait foi. La préconfiguration ne peut pas être modifiée après la création.

### Où trouver l'adresse de connexion ?

Dans la carte **Connexion et réseau** de la page du cluster. Le port est `27017`.

- Depuis le projet (VM, clusters Kubernetes) : l'hôte de la zone **Interne**, toujours affiché. Sur un replica set, ajoutez `replicaSet=rs0`.
- Depuis Internet, lorsque l'**Accès externe** est activé : la zone **Externe**, avec l'adresse des routeurs pour un cluster shardé, une adresse par membre et la **Chaîne de connexion externe** pour un replica set. Sur un replica set, connectez-vous à un membre avec `directConnection=true`, sans paramètre `replicaSet`.

### Pourquoi l'utilisateur créé dans l'assistant n'a-t-il pas accès à ma base ?

Le **Rôle** choisi dans l'assistant s'applique à la **Base de données** indiquée pour cet utilisateur, et à elle seule. Accordez l'accès à vos autres bases via **Gérer les accès**. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

Les utilisateurs créés avant la console v1.3.0 ont reçu leur rôle sur la base système `admin`. Dans **Gérer les accès**, retirez la ligne `admin`, affichée en erreur, et ajoutez leur base applicative.

### Pourquoi ne puis-je pas enregistrer un utilisateur ?

Un utilisateur MongoDB doit avoir au moins un accès à une base de données : sinon, la console affiche « Veuillez attribuer au moins un accès à une base de données. ». Les bases système `admin`, `local` et `config` sont refusées. Vérifiez aussi les règles de nommage : minuscules, chiffres et tirets uniquement, sans tiret bas ; 3 à 16 caractères pour un nom d'utilisateur.

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Il ne peut pas être relu. Générez-en un nouveau : **Actions** → **Changer le mot de passe** → **Effectuer la rotation**. L'ancien mot de passe est révoqué immédiatement.

### Les sauvegardes sont-elles disponibles ?

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; [contactez le support](mailto:support@hidora.io). Vous pouvez à tout moment réaliser un export logique avec `mongodump` :

```bash
mongodump --uri "mongodb://<utilisateur>@<hôte>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
