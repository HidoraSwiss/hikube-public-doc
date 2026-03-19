---
sidebar_position: 7
title: Dépannage
---

# Dépannage — ClickHouse

### ClickHouse Keeper instable (nombre pair de réplicas)

**Cause** : le nombre de réplicas ClickHouse Keeper est pair (2, 4, etc.), ce qui empêche le maintien du quorum. Le protocole Raft nécessite une majorité stricte pour élire un leader, et un nombre pair de nœuds ne garantit pas cette majorité en cas de partition réseau.

**Solution** :

1. Vérifiez le nombre actuel de réplicas Keeper :
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Modifiez le nombre de réplicas pour utiliser un nombre **impair** (3 ou 5) :
   ```yaml title="clickhouse.yaml"
   spec:
     clickhouseKeeper:
       enabled: true
       replicas: 3    # Toujours impair
   ```
3. Appliquez la modification :
   ```bash
   kubectl apply -f clickhouse.yaml
   ```
4. Vérifiez les logs Keeper pour confirmer que le quorum est rétabli :
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```

### Requêtes lentes sur gros volumes

**Cause** : la configuration de sharding n'est pas optimale, les tables n'utilisent pas les bons moteurs, ou les ressources allouées sont insuffisantes.

**Solution** :

1. Vérifiez que vous utilisez des tables **Distributed** pour répartir les requêtes sur tous les shards.
2. Assurez-vous que les tables locales utilisent le moteur `ReplicatedMergeTree` avec un `ORDER BY` adapté à vos requêtes les plus fréquentes.
3. Augmentez le nombre de shards pour distribuer la charge :
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 4    # Augmenter le nombre de shards
   ```
4. Vérifiez les ressources allouées et augmentez si nécessaire :
   ```bash
   kubectl top pod -l app=clickhouse-<name>
   ```
5. Analysez les requêtes lentes via le `query_log` système :
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```

### Espace disque insuffisant

**Cause** : le volume de données dépasse la taille du PVC, ou les logs système (`query_log`, `query_thread_log`) accumulent trop de données.

**Solution** :

1. Augmentez la taille du volume de données :
   ```yaml title="clickhouse.yaml"
   spec:
     size: 50Gi    # Augmenter depuis la valeur actuelle
   ```
2. Vérifiez également la taille du volume de logs et ajustez si nécessaire :
   ```yaml title="clickhouse.yaml"
   spec:
     logStorageSize: 5Gi    # Augmenter si les logs saturent
   ```
3. Réduisez la rétention des logs système via `logTTL` :
   ```yaml title="clickhouse.yaml"
   spec:
     logTTL: 7    # Réduire de 15 à 7 jours par exemple
   ```
4. Vérifiez les politiques de rétention de vos données applicatives et supprimez les partitions obsolètes.

### Pod ClickHouse en état Pending

**Cause** : le PersistentVolumeClaim (PVC) ne parvient pas à se lier à un volume, généralement à cause d'une `storageClass` inexistante ou d'un quota de ressources dépassé.

**Solution** :

1. Vérifiez l'état du pod et les événements associés :
   ```bash
   kubectl describe pod clickhouse-<name>-0-0
   ```
2. Vérifiez l'état des PVC :
   ```bash
   kubectl get pvc -l app=clickhouse-<name>
   ```
3. Vérifiez que la `storageClass` utilisée est bien l'une des classes disponibles : `local`, `replicated` ou `replicated-async`.
4. Vérifiez que les quotas de ressources (CPU, mémoire, stockage) ne sont pas atteints.
5. Corrigez la configuration dans votre manifeste et réappliquez :
   ```bash
   kubectl apply -f clickhouse.yaml
   ```

### Réplication inter-shards échouée

**Cause** : ClickHouse Keeper n'est pas fonctionnel, le réseau entre les pods est instable, ou la configuration des réplicas par shard est incorrecte.

**Solution** :

1. Vérifiez que ClickHouse Keeper est opérationnel :
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Consultez les logs Keeper pour identifier les erreurs :
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```
3. Vérifiez la connectivité réseau entre les pods ClickHouse :
   ```bash
   kubectl exec clickhouse-<name>-0-0 -- clickhouse-client --query "SELECT * FROM system.clusters"
   ```
4. Assurez-vous que la configuration des réplicas est cohérente :
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 2
     replicas: 3    # Chaque shard doit avoir le même nombre de réplicas
     clickhouseKeeper:
       enabled: true
       replicas: 3
   ```
5. Si Keeper est instable, redémarrez les pods Keeper et attendez la stabilisation du quorum.
