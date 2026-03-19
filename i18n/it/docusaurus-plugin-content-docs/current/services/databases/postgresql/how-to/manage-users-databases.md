---
title: Come gestire utenti e database
---

# Comment gérer les utilisateurs et bases de données

Ce guide explique comment créer et gérer les utilisateurs, bases de données, rôles et extensions PostgreSQL sur Hikube de manière déclarative via les manifestes Kubernetes.

## Prerequisitiiti

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **PostgreSQL** déployée sur Hikube (ou un manifeste prêt à déployer)
- (Optionnel) **psql** installé localement pour tester la connexion

## Passi

### 1. Ajouter des utilisateurs

Les utilisateurs sont déclarés dans la section `users` du manifeste. Chaque utilisateur est identifié par un nom et possède un mot de passe.

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

**Paramètres utilisateur :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `users[name].password` | `string` | Mot de passe de l'utilisateur |
| `users[name].replication` | `bool` | Accorde le privilège de réplication à l'utilisateur |

:::note
Le privilège `replication` est nécessaire pour les utilisateurs utilisés par des outils de Change Data Capture (CDC) comme Debezium, ou pour la réplication logique PostgreSQL. Ne l'activez que si vous en avez besoin.
:::

### 2. Créer des bases de données avec des rôles

Les bases de données sont déclarées dans la section `databases`. Chaque base peut définir des rôles `admin` et `readonly`, qui sont assignés aux utilisateurs déclarés dans `users`.

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

**Rôles disponibles :**

| Rôle | Description |
|------|-------------|
| `admin` | Accès complet en lecture/écriture sur la base de données |
| `readonly` | Accès en lecture seule sur la base de données |

:::tip
Suivez le principe du moindre privilège : n'accordez le rôle `admin` qu'aux utilisateurs qui en ont réellement besoin. Utilisez `readonly` pour les services de reporting ou de monitoring.
:::

### 3. Activer des extensions

Les extensions PostgreSQL sont activées par base de données via le champ `extensions` :

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

**Extensions courantes :**

| Extension | Description |
|-----------|-------------|
| `hstore` | Type de données clé-valeur |
| `uuid-ossp` | Génération d'identifiants UUID |
| `pgcrypto` | Fonctions cryptographiques (hachage, chiffrement) |

### 4. Appliquer les changements

Combinez tous les éléments dans un seul manifeste et appliquez-le :

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

### 5. Récupérer les identifiants

Les mots de passe des utilisateurs sont stockés dans un Secret Kubernetes. Récupérez-les avec :

```bash
kubectl get secret postgres-my-database-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso :**

```console
admin: SecureAdminPassword
appuser: AppUserPassword456
readonly: ReadOnlyPassword789
```

:::note
Si vous ne spécifiez pas de mot de passe pour un utilisateur, l'opérateur en génère un automatiquement. Utilisez la commande ci-dessus pour le récupérer.
:::

### 6. Tester la connexion

Ouvrez un port-forward vers le service PostgreSQL :

```bash
kubectl port-forward svc/postgres-my-database-rw 5432:5432
```

Connectez-vous avec `psql` :

```bash
psql -h 127.0.0.1 -U appuser myapp
```

Vérifiez les utilisateurs et les rôles :

```sql
-- Lister les utilisateurs
\du

-- Lister les bases de données
\l

-- Vérifier les extensions installées
\dx
```

**Risultato atteso pour `\du` :**

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

## Verifica

La configuration est réussie si :

- Les utilisateurs apparaissent dans `\du` avec les attributs corrects
- Les bases de données sont listées dans `\l`
- Les extensions sont actives (vérifiables avec `\dx` dans chaque base)
- Chaque utilisateur peut se connecter avec son mot de passe
- Les utilisateurs `readonly` ne peuvent pas modifier les données

## Per approfondire

- **[Référence API PostgreSQL](../api-reference.md)** : documentation complète des paramètres `users`, `databases` et `extensions`
- **[Démarrage rapide PostgreSQL](../quick-start.md)** : déployer une instance PostgreSQL complète
