---
sidebar_position: 7
title: Dépannage
---

# Dépannage — PostgreSQL

### Pod PostgreSQL en état Pending

**Cause** : le PersistentVolumeClaim (PVC) ne parvient pas à se lier à un volume. Cela peut être dû à une `storageClass` inexistante, un quota de stockage dépassé ou un manque de ressources sur les nœuds.

**Solution** :

1. Vérifiez l'état du pod et les événements associés :
   ```bash
   kubectl describe pod pg-<name>-1
   ```
2. Vérifiez l'état du PVC :
   ```bash
   kubectl get pvc
   kubectl describe pvc pg-<name>-1
   ```
3. Assurez-vous que la `storageClass` spécifiée dans votre manifeste existe :
   ```bash
   kubectl get storageclass
   ```
4. Vérifiez que votre quota de stockage n'est pas atteint.
5. Si nécessaire, corrigez la `storageClass` dans votre manifeste et réappliquez :
   ```bash
   kubectl apply -f postgresql.yaml
   ```

### Réplication désynchronisée entre primary et standby

**Cause** : un décalage (lag) de réplication peut survenir en raison d'une charge réseau élevée, de ressources insuffisantes sur les standby, ou d'un volume de transactions important sur le primary.

**Solution** :

1. Connectez-vous au primary et vérifiez l'état de la réplication :
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
   FROM pg_stat_replication;
   ```
2. Comparez les positions LSN entre `sent_lsn` et `replay_lsn`. Un écart important indique un lag.
3. Vérifiez les ressources allouées aux standby (CPU, mémoire). Si nécessaire, augmentez le `resourcesPreset` ou les `resources` explicites.
4. Vérifiez la connectivité réseau entre les pods :
   ```bash
   kubectl logs pg-<name>-2
   ```
5. Si le lag persiste, envisagez de réduire la charge d'écriture sur le primary ou d'augmenter les ressources.

### Connexion refusée à PostgreSQL

**Cause** : les pods ne sont pas en cours d'exécution, le nom du Secret est incorrect, ou le service n'est pas accessible.

**Solution** :

1. Vérifiez que les pods PostgreSQL sont en état `Running` :
   ```bash
   kubectl get pods -l app=pg-<name>
   ```
2. Vérifiez que le service existe et pointe vers les bons endpoints :
   ```bash
   kubectl get svc pg-<name>-rw
   kubectl get endpoints pg-<name>-rw
   ```
3. Assurez-vous d'utiliser le bon nom de Secret pour les identifiants. Le pattern est `pg-<name>-app` :
   ```bash
   kubectl get secret pg-<name>-app
   ```
4. Testez la connexion depuis un pod dans le même namespace :
   ```bash
   kubectl run test-pg --rm -it --image=postgres:16 -- psql -h pg-<name>-rw -p 5432 -U <user>
   ```

### Restauration PITR échouée

**Cause** : les paramètres de bootstrap sont mal configurés. Le champ `bootstrap.oldName` doit correspondre exactement au nom de l'instance d'origine, et le nom de la nouvelle instance doit être différent.

**Solution** :

1. Vérifiez que `bootstrap.oldName` correspond exactement au nom de l'instance PostgreSQL d'origine :
   ```yaml title="postgresql-restore.yaml"
   apiVersion: apps.cozystack.io/v1alpha1
   kind: Postgres
   metadata:
     name: restored-db       # Doit être un nouveau nom
   spec:
     bootstrap:
       enabled: true
       oldName: "original-db"  # Nom exact de l'ancienne instance
       recoveryTime: "2025-06-15T14:30:00Z"  # Format RFC 3339
   ```
2. Le `recoveryTime` doit être au format **RFC 3339** (ex: `2025-06-15T14:30:00Z`). Si laissé vide, la restauration se fait au dernier état disponible.
3. Le nom dans `metadata.name` doit être **différent** de `bootstrap.oldName`.
4. Assurez-vous que les sauvegardes de l'instance d'origine sont toujours accessibles dans le stockage S3.

### Performances lentes

**Cause** : les paramètres PostgreSQL ne sont pas adaptés à la charge de travail, ou les ressources allouées sont insuffisantes.

**Solution** :

1. Ajustez les paramètres PostgreSQL dans votre manifeste :
   ```yaml title="postgresql.yaml"
   spec:
     postgresql:
       parameters:
         shared_buffers: 512MB       # ~25% de la RAM allouée
         work_mem: 64MB              # Mémoire par opération de tri
         max_connections: 200        # Adapter selon la charge
         effective_cache_size: 1536MB  # ~75% de la RAM
   ```
2. Vérifiez que le `resourcesPreset` est adapté à votre charge :
   - Développement : `nano` ou `micro`
   - Production : `medium`, `large` ou supérieur
3. Surveillez l'utilisation des ressources :
   ```bash
   kubectl top pod pg-<name>-1
   ```
4. Si les requêtes sont lentes, identifiez-les avec `pg_stat_statements` et optimisez les index.
5. Augmentez les ressources si nécessaire en passant à un preset supérieur ou en définissant des `resources` explicites.
