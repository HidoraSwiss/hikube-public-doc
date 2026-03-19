---
title: Come gestire utenti e database
---

# Comment gérer les utilisateurs et bases de données

Ce guide vous explique comment créer et gérer les utilisateurs, les bases de données et les rôles d'accès de votre instance MySQL sur Hikube. Vous apprendrez également à basculer le noeud primary dans un cluster répliqué.

## Prerequisitiiti

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **MySQL** déployée sur votre tenant
- Un client **mysql** pour tester les connexions

## Passi

### 1. Ajouter un utilisateur

Les utilisateurs sont définis dans la section `users` du manifeste. Chaque utilisateur est identifié par un nom et peut avoir un mot de passe et une limite de connexions :

```yaml title="mysql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10
```

| Paramètre | Description | Défaut |
|---|---|---|
| `users[name].password` | Mot de passe de l'utilisateur | `""` |
| `users[name].maxUserConnections` | Nombre maximum de connexions simultanées pour cet utilisateur | `0` (illimité) |

:::tip
Limitez le `maxUserConnections` par utilisateur pour éviter qu'une application ne consomme toutes les connexions disponibles du serveur.
:::

### 2. Créer une base de données avec des rôles

Les bases de données sont définies dans la section `databases`. Chaque base peut attribuer des rôles **admin** (lecture/écriture) ou **readonly** (lecture seule) à des utilisateurs :

```yaml title="mysql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10

  databases:
    production:
      roles:
        admin:
          - appuser          # appuser a les droits complets sur "production"
        readonly:
          - readonly         # readonly peut uniquement lire "production"
          - analytics        # analytics peut aussi lire "production"
    analytics_db:
      roles:
        admin:
          - analytics        # analytics a les droits complets sur "analytics_db"
        readonly:
          - readonly         # readonly peut lire "analytics_db"
```

:::note
Un même utilisateur peut avoir des rôles différents sur des bases différentes. Par exemple, `analytics` est **admin** sur `analytics_db` mais **readonly** sur `production`.
:::

### 3. Appliquer les changements

Appliquez le manifeste pour créer ou mettre à jour les utilisateurs et bases de données :

```bash
kubectl apply -f mysql-databases.yaml
```

### 4. Récupérer les identifiants

Les mots de passe sont stockés dans un Secret Kubernetes nommé `<instance>-credentials` :

```bash
kubectl get secret example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso :**

```console
root: cr42msoxKhnEajfo
appuser: SecureAppPassword
analytics: SecureAnalyticsPassword
readonly: SecureReadOnlyPassword
```

:::tip
Le mot de passe `root` est généré automatiquement par l'opérateur. Utilisez-le uniquement pour l'administration du cluster, jamais dans vos applications.
:::

### 5. Tester la connexion

#### Via port-forward (accès interne)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

```bash
mysql -h 127.0.0.1 -P 3306 -u appuser -p production
```

#### Via LoadBalancer (si `external: true`)

```bash
# Récupérer l'IP externe
kubectl get svc mysql-example-primary -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

```bash
mysql -h <IP_EXTERNE> -P 3306 -u appuser -p production
```

Vérifiez les droits de l'utilisateur :

```sql
-- En tant que appuser (admin sur production)
SHOW DATABASES;
CREATE TABLE test (id INT PRIMARY KEY);
INSERT INTO test VALUES (1);

-- En tant que readonly (lecture seule sur production)
SELECT * FROM test;       -- OK
INSERT INTO test VALUES (2);  -- ERREUR : accès refusé
```

### 6. Basculer le noeud primary (optionnel)

Dans un cluster MySQL répliqué, un noeud est désigné comme **primary** (écritures) et les autres comme **réplicas** (lecture). Vous pouvez basculer le rôle primary vers un autre noeud, par exemple lors d'une maintenance.

#### Éditer la ressource MariaDB

```bash
kubectl edit mariadb mysql-example
```

Modifiez la section `replication` pour désigner le nouveau primary :

```yaml title="switchover.yaml"
spec:
  replication:
    primary:
      podIndex: 1   # Promouvoir mysql-example-1 en primary
```

#### Vérifier la bascule

```bash
kubectl get mariadb
```

**Risultato atteso :**

```console
NAME            READY   STATUS    PRIMARY           UPDATES                    AGE
mysql-example   True    Running   mysql-example-1   ReplicasFirstPrimaryLast   84m
```

:::warning
La bascule du primary peut entraîner une **brève interruption des écritures** pendant la promotion du nouveau noeud. Les lectures restent disponibles via les réplicas.
:::

## Verifica

Vérifiez la configuration complète de votre instance :

```bash
kubectl get mariadb example -o yaml
```

Assurez-vous que :
- Les utilisateurs sont présents dans la section `users`
- Les bases de données sont listées dans la section `databases`
- Les rôles sont correctement attribués

## Per approfondire

- [Référence API](../api-reference.md) : liste complète des paramètres utilisateurs et bases de données
- [Comment scaler verticalement](./scale-resources.md) : ajuster les ressources CPU et mémoire
