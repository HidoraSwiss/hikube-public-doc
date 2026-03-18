---
title: "How to manage users and databases"
---

# How to manage users and databases

This guide explains how to create and manage users, databases, roles, and PostgreSQL extensions on Hikube declaratively via Kubernetes manifests.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **PostgreSQL** instance deployed on Hikube (or a manifest ready to deploy)
- (Optional) **psql** installed locally to test the connection

## Steps

### 1. Add users

Users are declared in the `users` section of the manifest. Each user is identified by a name and has a password.

```yaml title="postgresql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789
    replicator:
      password: ReplicatorPassword
      replication: true
```

**User parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `users[name].password` | `string` | User password |
| `users[name].replication` | `bool` | Grants the replication privilege to the user |

:::note
The `replication` privilege is required for users used by Change Data Capture (CDC) tools like Debezium, or for PostgreSQL logical replication. Only enable it if you need it.
:::

### 2. Create databases with roles

Databases are declared in the `databases` section. Each database can define `admin` and `readonly` roles, which are assigned to users declared in `users`.

```yaml title="postgresql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
```

**Available roles:**

| Role | Description |
|------|-------------|
| `admin` | Full read/write access to the database |
| `readonly` | Read-only access to the database |

:::tip
Follow the principle of least privilege: only grant the `admin` role to users who truly need it. Use `readonly` for reporting or monitoring services.
:::

### 3. Enable extensions

PostgreSQL extensions are enabled per database via the `extensions` field:

```yaml title="postgresql-extensions.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
      extensions:
        - hstore
        - uuid-ossp
        - pgcrypto
```

**Common extensions:**

| Extension | Description |
|-----------|-------------|
| `hstore` | Key-value data type |
| `uuid-ossp` | UUID identifier generation |
| `pgcrypto` | Cryptographic functions (hashing, encryption) |

### 4. Apply the changes

Combine all elements into a single manifest and apply it:

```yaml title="postgresql-complete.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
      extensions:
        - pgcrypto
```

```bash
kubectl apply -f postgresql-complete.yaml
```

### 5. Retrieve credentials

User passwords are stored in a Kubernetes Secret. Retrieve them with:

```bash
kubectl get secret postgres-my-database-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
admin: SecureAdminPassword
appuser: AppUserPassword456
readonly: ReadOnlyPassword789
```

:::note
If you do not specify a password for a user, the operator generates one automatically. Use the command above to retrieve it.
:::

### 6. Test the connection

Open a port-forward to the PostgreSQL service:

```bash
kubectl port-forward svc/postgres-my-database-rw 5432:5432
```

Connect with `psql`:

```bash
psql -h 127.0.0.1 -U appuser myapp
```

Verify the users and roles:

```sql
-- Lister les utilisateurs
\du

-- Lister les bases de données
\l

-- Vérifier les extensions installées
\dx
```

**Expected output for `\du`:**

```console
                                 List of roles
     Role name      |                         Attributes
--------------------+------------------------------------------------------------
 admin              | Replication
 appuser            |
 myapp_admin        | No inheritance, Cannot login
 myapp_readonly     | No inheritance, Cannot login
 analytics_admin    | No inheritance, Cannot login
 analytics_readonly | No inheritance, Cannot login
 postgres           | Superuser, Create role, Create DB, Replication, Bypass RLS
 readonly           |
```

## Verification

The configuration is successful if:

- Users appear in `\du` with the correct attributes
- Databases are listed in `\l`
- Extensions are active (verifiable with `\dx` in each database)
- Each user can connect with their password
- `readonly` users cannot modify data

## Going further

- **[PostgreSQL API Reference](../api-reference.md)**: complete documentation of `users`, `databases` and `extensions` parameters
- **[PostgreSQL Quick start](../quick-start.md)**: deploy a complete PostgreSQL instance
