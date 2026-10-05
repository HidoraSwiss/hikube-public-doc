---
sidebar_position: 6
title: FAQ
---

# FAQ — MongoDB

### Quelle version choisir ?

L'assistant propose **6.0**, **7.0** et **8.0** (par défaut). Choisissez la plus récente pour un nouveau projet. Pour une migration, partez de la version de votre environnement actuel, puis montez de version une étape à la fois depuis **Modifier**.

### Combien de réplicas choisir ?

- **1 (Standalone)** : développement et tests, sans tolérance aux pannes.
- **3 (Haute disponibilité max)** : recommandé en production ; le cluster reste disponible si un membre tombe.
- **5 (Très haute disponibilité)** : tolère la perte de deux membres.

Le nombre de réplicas ne peut pas être modifié après la création.

### Quand activer le sharding ?

Lorsque le volume de données ou le débit d'écriture dépasse ce qu'un seul replica set peut absorber. Le sharding se décide à la création et multiplie les ressources consommées (2 shards, serveurs de configuration et routeurs Mongos). Pour la plupart des applications, un replica set suffit. Voir [Configurer le sharding](./how-to/configure-sharding.md).

### Quelles préconfigurations sont disponibles ?

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

La liste affichée par l'assistant fait foi. La préconfiguration ne peut pas être modifiée après la création.

### Où trouver l'adresse de connexion ?

Dans la carte **Connexion et réseau** de la page du cluster, champ **Hôte (Host)**, lorsque l'**Accès externe** est activé. Le port est `27017`. Sans accès externe, le champ affiche **Non défini** : le cluster reste joignable depuis les VM et les clusters Kubernetes du projet par une adresse interne, que la console n'affiche pas ; [contactez le support](mailto:support@hidora.io) pour l'obtenir.

### Pourquoi l'utilisateur créé dans l'assistant n'a-t-il pas accès à ma base ?

Le **Rôle** choisi dans l'assistant de création du cluster s'applique à la base `admin`. Accordez ensuite l'accès à vos bases applicatives via **Gérer les accès**. Voir [Gérer les utilisateurs et bases de données](./how-to/manage-users-databases.md).

### Pourquoi ne puis-je pas enregistrer un utilisateur ?

Un utilisateur MongoDB doit avoir au moins un rôle : un **Rôle Global** ou un **Accès spécifique** sur une base. Vérifiez aussi les règles de nommage : minuscules, chiffres et tirets uniquement, sans tiret bas.

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Il ne peut pas être relu. Générez-en un nouveau : **Actions** → **Changer le mot de passe** → **Effectuer la rotation**. L'ancien mot de passe est révoqué immédiatement.

### Les sauvegardes sont-elles disponibles ?

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; [contactez le support](mailto:support@hidora.io). Vous pouvez à tout moment réaliser un export logique avec `mongodump` :

```bash
mongodump --uri "mongodb://<utilisateur>@<hôte>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
