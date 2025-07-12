---
title: Déployer PostgreSQL en 5 minutes
---

# Déployer PostgreSQL en 5 minutes

Ce guide vous accompagne pour déployer votre première base de données PostgreSQL sur Hikube en moins de 5 minutes.

## Prérequis

- Accès à un tenant Hikube
- kubectl configuré avec votre kubeconfig
- [psql](https://www.postgresql.org/docs/current/app-psql.html) (optionnel, pour tester)

## Étape 1 : Créer PostgreSQL

### Via kubectl

```text
# postgres.yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: ma-premiere-db
spec:
  external: true
  size: 10Gi
  replicas: 2
  storageClass: "replicated"
  users:
    admin:
      password: "mon-mot-de-passe-securise"
  databases:
    monapp:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f postgres.yaml
```

### Via interface web

1. Allez dans l'onglet **"Catalog"**
2. Sélectionnez l'application **"PostgreSQL"**
3. Configurez les paramètres :
   - **Name** : `ma-premiere-db`
   - **Size** : `10Gi`
   - **Replicas** : `2`
   - **External** : `true`
4. Cliquez sur **"Deploy"**

## Étape 2 : Vérifier le déploiement

```bash
# Vérifier l'état de PostgreSQL
kubectl get postgres

# Voir les détails
kubectl describe postgres ma-premiere-db

# Vérifier les pods
kubectl get pods -l app=postgres

# Voir les logs
kubectl logs -l app=postgres
```

## Étape 3 : Récupérer les informations de connexion

```bash
# Obtenir les credentials
kubectl get secret postgres-ma-premiere-db -o yaml

# Décoder le mot de passe
echo "VOTRE_PASSWORD_BASE64" | base64 -d
```

## Étape 4 : Se connecter à la base de données

### Via kubectl

```bash
# Se connecter directement
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp

# Tester une requête
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "SELECT version();"
```

### Via psql externe

```bash
# Obtenir l'IP externe
kubectl get service postgres-ma-premiere-db

# Se connecter avec psql
psql -h IP_EXTERNE -p 5432 -U admin -d monapp
```

## Étape 5 : Tester la base de données

### Créer une table

```sql
-- Se connecter à la base
\c monapp

-- Créer une table de test
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer des données
INSERT INTO users (name, email) VALUES 
    ('Alice Dupont', 'alice@example.com'),
    ('Bob Martin', 'bob@example.com'),
    ('Carol Wilson', 'carol@example.com');

-- Vérifier les données
SELECT * FROM users;
```

### Tester les performances

```sql
-- Créer une table de test avec beaucoup de données
CREATE TABLE test_data AS
SELECT 
    generate_series(1, 10000) as id,
    'User ' || generate_series(1, 10000) as name,
    'user' || generate_series(1, 10000) || '@example.com' as email;

-- Vérifier la taille
SELECT pg_size_pretty(pg_total_relation_size('test_data'));

-- Tester une requête
SELECT COUNT(*) FROM test_data WHERE name LIKE 'User 1%';
```

## Étape 6 : Utiliser avec une application

### Exemple avec Python

```python
import psycopg2
from psycopg2.extras import RealDictCursor

# Configuration
config = {
    'host': 'IP_EXTERNE',
    'port': 5432,
    'database': 'monapp',
    'user': 'admin',
    'password': 'mon-mot-de-passe-securise'
}

# Se connecter
conn = psycopg2.connect(**config)
cur = conn.cursor(cursor_factory=RealDictCursor)

# Exécuter une requête
cur.execute("SELECT * FROM users")
users = cur.fetchall()

for user in users:
    print(f"ID: {user['id']}, Name: {user['name']}, Email: {user['email']}")

# Fermer la connexion
cur.close()
conn.close()
```

### Exemple avec Node.js

```javascript
const { Client } = require('pg');

// Configuration
const client = new Client({
    host: 'IP_EXTERNE',
    port: 5432,
    database: 'monapp',
    user: 'admin',
    password: 'mon-mot-de-passe-securise'
});

// Se connecter et exécuter une requête
// (à placer dans un fichier .js et exécuter avec node)
client.connect()
    .then(() => client.query('SELECT * FROM users'))
    .then(result => {
        console.log('Users:', result.rows);
    })
    .catch(err => {
        console.error('Error:', err);
    })
    .finally(() => client.end());
```

## Étape 7 : Monitoring

### Vérifier les métriques

```bash
# Voir les métriques PostgreSQL
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit
FROM pg_stat_database 
WHERE datname = 'monapp';
"
```

### Vérifier l'espace disque

```bash
# Voir l'utilisation du disque
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## Félicitations ! 🎉

Vous avez déployé et testé votre première base de données PostgreSQL sur Hikube !

## Prochaines étapes

- **[Référence API](api-reference.md)** : Découvrez tous les paramètres
- **[Tutoriels](tutorials/)** : Guides avancés
- **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
- **[Sauvegardes](tutorials/backup-restore.md)** : Configurer les sauvegardes automatiques
- **[Haute disponibilité](tutorials/high-availability.md)** : Configurer la réplication 