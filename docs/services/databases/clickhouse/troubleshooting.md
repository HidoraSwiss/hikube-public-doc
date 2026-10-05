---
sidebar_position: 7
title: Dépannage
---

# Dépannage — ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

### Requêtes lentes sur gros volumes

**Cause** : les tables n'utilisent pas les bons moteurs ou un `ORDER BY` adapté, la topologie n'est pas optimale, ou les ressources allouées sont insuffisantes.

**Solution** :

1. Sur une instance shardée, interrogez des tables **Distributed** pour répartir les requêtes sur tous les shards.
2. Assurez-vous que les tables locales utilisent `ReplicatedMergeTree` avec un `ORDER BY` adapté à vos filtres les plus fréquents.
3. Analysez les requêtes lentes via le journal système :
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```
4. Si les ressources sont saturées, demandez un preset supérieur ou des shards supplémentaires au [support](mailto:support@hidora.io). Voir [Scaler verticalement](./how-to/scale-resources.md).

### Espace disque insuffisant

**Cause** : le volume de données dépasse la taille du stockage, ou les journaux système (`query_log`, `query_thread_log`) accumulent trop de données.

**Solution** :

1. Identifiez les tables les plus volumineuses :
   ```sql
   SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
   FROM system.parts
   WHERE active
   GROUP BY database, table
   ORDER BY sum(bytes_on_disk) DESC;
   ```
2. Supprimez les partitions obsolètes de vos données applicatives (`ALTER TABLE ... DROP PARTITION`) ou posez un `TTL` sur vos tables.
3. Pour augmenter le stockage, la taille du volume des journaux ou réduire leur rétention, contactez le support.

### Erreurs de réplication ou Keeper indisponible

**Cause** : ClickHouse Keeper n'a pas son quorum, ou un réplica ne parvient plus à se synchroniser.

**Solution** :

1. Contrôlez l'état des tables répliquées :
   ```sql
   SELECT database, table, is_readonly, absolute_delay, queue_size
   FROM system.replicas
   WHERE is_readonly OR absolute_delay > 60;
   ```
2. Un réplica en lecture seule (`is_readonly = 1`) signale généralement une perte de contact avec Keeper. [Contactez le support](mailto:support@hidora.io) en indiquant le projet, le nom de l'instance et le résultat de la requête.

### Authentification refusée

**Cause** : utilisateur ou mot de passe erroné, ou utilisateur en lecture seule tentant une écriture (`Not enough privileges`).

**Solution** : vérifiez les identifiants transmis et le niveau d'accès de l'utilisateur (`SHOW GRANTS`). Pour créer un utilisateur ou modifier ses droits, contactez le support. Voir [Gérer les utilisateurs](./how-to/manage-users.md).
