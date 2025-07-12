---
title: Dépannage PostgreSQL
---

# Dépannage PostgreSQL

Solutions aux problèmes courants avec PostgreSQL sur Hikube.

---

## Erreurs de connexion

### Erreur : "Connection refused"

**Cause :** Le service PostgreSQL n'est pas démarré ou accessible.

**Solution :**

```bash
# Vérifier l'état des pods
kubectl get pods -l app=postgres

# Vérifier les logs
kubectl logs -l app=postgres

# Vérifier le service
kubectl get service postgres-*

# Redémarrer si nécessaire
kubectl delete pod postgres-ma-premiere-db-0
```

### Erreur : "Authentication failed"

**Cause :** Credentials incorrects ou utilisateur inexistant.

**Solution :**

```bash
# Vérifier les credentials
kubectl get secret postgres-ma-premiere-db -o yaml

# Se reconnecter avec les bons credentials
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d postgres
```

### Erreur : "Database does not exist"

**Cause :** La base de données n'a pas été créée.

**Solution :**

```bash
# Se connecter à la base postgres
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d postgres

# Créer la base de données
CREATE DATABASE monapp;

# Vérifier les bases existantes
\l
```

---

## Problèmes de performance

### Erreur : "Out of memory"

**Cause :** Configuration mémoire insuffisante.

**Solution :**

```text
# Modifier la configuration
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: ma-premiere-db
spec:
  postgresql:
    parameters:
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
      work_mem: "4MB"
```

### Erreur : "Too many connections"

**Cause :** Limite de connexions atteinte.

**Solution :**

```bash
# Vérifier les connexions actives
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT count(*) FROM pg_stat_activity;
"

# Augmenter la limite
kubectl patch postgres ma-premiere-db --type='merge' -p='
spec:
  postgresql:
    parameters:
      max_connections: 200
'
```

### Erreur : "Disk full"

**Cause :** Espace disque insuffisant.

**Solution :**

```bash
# Vérifier l'utilisation du disque
kubectl exec -it postgres-ma-premiere-db-0 -- df -h

# Vérifier la taille des tables
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    schemaname,
    tablename,
    -- pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Augmenter la taille du volume
kubectl patch postgres ma-premiere-db --type='merge' -p='
spec:
  size: 50Gi
'
```

---

## Problèmes de réplication

### Erreur : "Replica lag"

**Cause :** Délai de réplication important.

**Solution :**

```bash
# Vérifier l'état de la réplication
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn
    -- pg_wal_lsn_diff(sent_lsn, replay_lsn) as lag_bytes
FROM pg_stat_replication;
"

# Vérifier les paramètres de réplication
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SHOW synchronous_commit;
SHOW wal_sync_method;
"
```

### Erreur : "Primary/Replica failover"

**Cause :** Basculement automatique ou manuel.

**Solution :**

```bash
# Vérifier quel pod est primary
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
-- SELECT pg_is_in_recovery();
SELECT 'Check if this is primary or replica' as status;
"

# Forcer un basculement si nécessaire
kubectl exec -it postgres-ma-premiere-db-1 -- psql -U admin -d monapp -c "
-- SELECT pg_promote();
SELECT 'Promote replica to primary' as action;
"
```

---

## Problèmes de sauvegarde

### Erreur : "Backup failed"

**Cause :** Échec de sauvegarde S3.

**Solution :**

```bash
# Vérifier la configuration S3
kubectl get postgres ma-premiere-db -o yaml | grep -A 10 backup

# Tester la connexion S3
kubectl exec -it postgres-ma-premiere-db-0 -- restic -r s3:s3.tenant.hikube.cloud/postgres-backups snapshots

# Vérifier les logs de sauvegarde
kubectl logs -l app=postgres | grep backup
```

### Erreur : "Restore failed"

**Cause :** Échec de restauration.

**Solution :**

```bash
# Lister les sauvegardes disponibles
kubectl exec -it postgres-ma-premiere-db-0 -- restic -r s3:s3.tenant.hikube.cloud/postgres-backups snapshots

# Restaurer la dernière sauvegarde
kubectl exec -it postgres-ma-premiere-db-0 -- restic -r s3:s3.tenant.hikube.cloud/postgres-backups restore latest --target /tmp/restore
```

---

## Problèmes de sécurité

### Erreur : "SSL connection required"

**Cause :** Connexion non chiffrée.

**Solution :**

```bash
# Vérifier la configuration SSL
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SHOW ssl;
SHOW ssl_cert_file;
"

# Se connecter avec SSL
psql "sslmode=require host=IP port=5432 dbname=monapp user=admin"
```

### Erreur : "Permission denied"

**Cause :** Droits insuffisants.

**Solution :**

```bash
# Vérifier les rôles
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
\du
"

# Créer un nouvel utilisateur avec les bons droits
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
CREATE USER app_user WITH PASSWORD 'app-password';
GRANT CONNECT ON DATABASE monapp TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
"
```

---

## Problèmes de monitoring

### Erreur : "Metrics not available"

**Cause :** Métriques PostgreSQL non disponibles.

**Solution :**

```bash
# Vérifier l'extension pg_stat_statements
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
"

# Vérifier les métriques
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT * FROM pg_stat_statements LIMIT 10;
"
```

---

## Commandes de diagnostic

### Vérifier l'état général

```bash
# État des pods
kubectl get pods -l app=postgres

# Logs récents
kubectl logs -l app=postgres --tail=100

# État du service
kubectl get service postgres-*

# État des volumes
kubectl get pvc -l app=postgres
```

### Vérifier les performances

```bash
# Statistiques de base de données
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database 
WHERE datname = 'monapp';
"

# Requêtes lentes
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"
```

### Vérifier l'espace disque

```bash
# Utilisation du disque
kubectl exec -it postgres-ma-premiere-db-0 -- df -h

# Taille des bases de données
kubectl exec -it postgres-ma-premiere-db-0 -- psql -U admin -d monapp -c "
SELECT 
    datname,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database;
"

# Taille des tables
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

---

## Support

Si vous ne trouvez pas la solution à votre problème dans cette page :

1. **Vérifiez les logs** : `kubectl logs -l app=postgres`
2. **Consultez la documentation** : [PostgreSQL officielle](https://www.postgresql.org/docs/)
3. **Contactez le support** : support@hidora.io
4. **Ouvrez un ticket** : [GitLab Issues](https://gitlab.hidora/hikube/documentation-hikube/-/issues) 