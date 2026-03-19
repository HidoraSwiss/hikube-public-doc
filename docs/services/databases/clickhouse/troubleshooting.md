---
sidebar_position: 7
title: Depannage
---

# Depannage — ClickHouse

### ClickHouse Keeper instable (nombre pair de replicas)

**Cause** : le nombre de replicas ClickHouse Keeper est pair (2, 4, etc.), ce qui empeche le maintien du quorum. Le protocole Raft necessite une majorite stricte pour elire un leader, et un nombre pair de noeuds ne garantit pas cette majorite en cas de partition reseau.

**Solution** :

1. Verifiez le nombre actuel de replicas Keeper :
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Modifiez le nombre de replicas pour utiliser un nombre **impair** (3 ou 5) :
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
4. Verifiez les logs Keeper pour confirmer que le quorum est retabli :
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```

### Requetes lentes sur gros volumes

**Cause** : la configuration de sharding n'est pas optimale, les tables n'utilisent pas les bons moteurs, ou les ressources allouees sont insuffisantes.

**Solution** :

1. Verifiez que vous utilisez des tables **Distributed** pour repartir les requetes sur tous les shards.
2. Assurez-vous que les tables locales utilisent le moteur `ReplicatedMergeTree` avec un `ORDER BY` adapte a vos requetes les plus frequentes.
3. Augmentez le nombre de shards pour distribuer la charge :
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 4    # Augmenter le nombre de shards
   ```
4. Verifiez les ressources allouees et augmentez si necessaire :
   ```bash
   kubectl top pod -l app=clickhouse-<name>
   ```
5. Analysez les requetes lentes via le `query_log` systeme :
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```

### Espace disque insuffisant

**Cause** : le volume de donnees depasse la taille du PVC, ou les logs systeme (`query_log`, `query_thread_log`) accumulent trop de donnees.

**Solution** :

1. Augmentez la taille du volume de donnees :
   ```yaml title="clickhouse.yaml"
   spec:
     size: 50Gi    # Augmenter depuis la valeur actuelle
   ```
2. Verifiez egalement la taille du volume de logs et ajustez si necessaire :
   ```yaml title="clickhouse.yaml"
   spec:
     logStorageSize: 5Gi    # Augmenter si les logs saturent
   ```
3. Reduisez la retention des logs systeme via `logTTL` :
   ```yaml title="clickhouse.yaml"
   spec:
     logTTL: 7    # Reduire de 15 a 7 jours par exemple
   ```
4. Verifiez les politiques de retention de vos donnees applicatives et supprimez les partitions obsoletes.

### Pod ClickHouse en etat Pending

**Cause** : le PersistentVolumeClaim (PVC) ne parvient pas a se lier a un volume, generalement a cause d'une `storageClass` inexistante ou d'un quota de ressources depasse.

**Solution** :

1. Verifiez l'etat du pod et les evenements associes :
   ```bash
   kubectl describe pod clickhouse-<name>-0-0
   ```
2. Verifiez l'etat des PVC :
   ```bash
   kubectl get pvc -l app=clickhouse-<name>
   ```
3. Assurez-vous que la `storageClass` existe :
   ```bash
   kubectl get storageclass
   ```
4. Verifiez que les quotas de ressources (CPU, memoire, stockage) ne sont pas atteints.
5. Corrigez la configuration dans votre manifeste et reappliquez :
   ```bash
   kubectl apply -f clickhouse.yaml
   ```

### Replication inter-shards echouee

**Cause** : ClickHouse Keeper n'est pas fonctionnel, le reseau entre les pods est instable, ou la configuration des replicas par shard est incorrecte.

**Solution** :

1. Verifiez que ClickHouse Keeper est operationnel :
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Consultez les logs Keeper pour identifier les erreurs :
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```
3. Verifiez la connectivite reseau entre les pods ClickHouse :
   ```bash
   kubectl exec clickhouse-<name>-0-0 -- clickhouse-client --query "SELECT * FROM system.clusters"
   ```
4. Assurez-vous que la configuration des replicas est coherente :
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 2
     replicas: 3    # Chaque shard doit avoir le meme nombre de replicas
     clickhouseKeeper:
       enabled: true
       replicas: 3
   ```
5. Si Keeper est instable, redemarrez les pods Keeper et attendez la stabilisation du quorum.
