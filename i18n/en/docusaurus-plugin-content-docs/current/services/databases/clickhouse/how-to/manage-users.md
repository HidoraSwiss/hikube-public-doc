---
title: "How to manage ClickHouse users and profiles"
---

# How to manage ClickHouse users and profiles

This guide explains how to create and manage ClickHouse users on Hikube, define read-only permissions for analysts, and configure query log retention.

## Prerequisites

- A ClickHouse instance deployed on Hikube (see the [quick start](../quick-start.md))
- `kubectl` configured to interact with the Hikube API
- The YAML configuration file for your ClickHouse instance

## Steps

### 1. Create an admin user

Define a user with full read and write access in the `users` field of the manifest:

```yaml title="clickhouse-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
```

:::warning
Use strong passwords in production. Passwords are stored in plain text in the manifest -- make sure to protect access to your YAML files and associated Kubernetes Secrets.
:::

### 2. Create a read-only user

Add an `analyst` user with the `readonly: true` flag to limit access to read (SELECT) queries only:

```yaml title="clickhouse-users-readonly.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
    analyst:
      password: AnalysteSecure2024
      readonly: true
```

:::tip
Create a read-only user for analytics and reporting tools (Grafana, Metabase, etc.). This limits the risk of accidental data modification.
:::

### 3. Configure query logs

ClickHouse records executed queries in the `query_log` and `query_thread_log` system tables. Configure the log storage size and retention duration:

```yaml title="clickhouse-users-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  logStorageSize: 5Gi
  logTTL: 30
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
    analyst:
      password: AnalysteSecure2024
      readonly: true
```

- **`logStorageSize`**: size of the persistent volume dedicated to logs (default: `2Gi`)
- **`logTTL`**: retention duration in days for `query_log` and `query_thread_log` (default: `15`)

:::note
Adjust `logTTL` based on your audit needs. A high value consumes more disk space (`logStorageSize`). For a development environment, `7` days is generally sufficient.
:::

### 4. Apply the changes

```bash
kubectl apply -f clickhouse-users-logs.yaml
```

### 5. Connect with clickhouse-client

Test the connection with each user:

```bash
# Connexion avec l'utilisateur admin
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user admin --password MonMotDePasseAdmin2024
```

```bash
# Connexion avec l'utilisateur analyst
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user analyst --password AnalysteSecure2024
```

### 6. Verify permissions

Once connected with the `analyst` user, verify that writes are blocked:

```sql
-- Cette requete doit reussir (lecture autorisee)
SELECT count() FROM system.tables;

-- Cette requete doit echouer (ecriture interdite)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

The read-only user will receive an error like:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Verification

Verify that users are correctly configured:

```bash
# Verifier la configuration de la ressource ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 10 users

# Verifier que les pods sont en etat Running
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

Connect as admin and list the users:

```sql
SELECT name, storage, auth_type FROM system.users;
```

## Going further

- [API Reference](../api-reference.md) -- `users`, `logStorageSize` and `logTTL` parameters
- [How to vertically scale ClickHouse](./scale-resources.md) -- Adjust CPU and memory resources
- [How to configure sharding](./configure-sharding.md) -- Horizontal data distribution
