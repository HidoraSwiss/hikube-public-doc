---
title: "Comment gérer les utilisateurs"
---

# Comment gérer les utilisateurs NATS

Ce guide explique comment créer et gérer les utilisateurs d'un cluster NATS sur Hikube de manière déclarative via les manifestes Kubernetes.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **NATS** déployé sur Hikube (ou un manifeste prêt à déployer)
- (Optionnel) le CLI **nats** installé localement pour tester les connexions

## Étapes

### 1. Ajouter des utilisateurs

Les utilisateurs sont déclarés dans la section `users` du manifeste. Chaque utilisateur est identifié par un nom et possède un mot de passe.

```yaml title="nats-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small

  jetstream:
    enabled: true
    size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789
```

**Paramètres utilisateur :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `users[name].password` | `string` | Mot de passe associé à l'utilisateur |

:::tip
Créez des utilisateurs distincts par application pour un contrôle d'accès granulaire. Utilisez un compte **admin** pour l'administration, des comptes **applicatifs** par service, et un compte **monitoring** dédié à la supervision.
:::

### 2. Appliquer les changements

```bash
kubectl apply -f nats-users.yaml
```

Surveillez le rolling update des pods :

```bash
kubectl get po -w | grep my-nats
```

Attendez que tous les pods soient en état `Running` :

```bash
kubectl get po | grep my-nats
```

**Résultat attendu :**

```console
my-nats-0   1/1     Running   0   2m
my-nats-1   1/1     Running   0   4m
my-nats-2   1/1     Running   0   6m
```

### 3. Tester la connexion avec le CLI nats

Ouvrez un port-forward vers le service NATS :

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Testez la connexion avec chaque utilisateur :

**Connexion avec l'utilisateur admin :**

```bash
nats pub test "Hello from admin" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Résultat attendu :**

```console
Published 16 bytes to "test"
```

**Connexion avec l'utilisateur appuser :**

```bash
nats pub app.events "Hello from appuser" \
  --server nats://appuser:AppUserPassword456@127.0.0.1:4222
```

**Résultat attendu :**

```console
Published 18 bytes to "app.events"
```

**Test d'un mot de passe incorrect :**

```bash
nats pub test "This should fail" \
  --server nats://admin:wrongpassword@127.0.0.1:4222
```

**Résultat attendu :**

```console
nats: error: Authorization Violation
```

:::warning
Si `external: true` est activé, le cluster NATS est accessible depuis l'extérieur du cluster Kubernetes. Assurez-vous que tous les utilisateurs disposent de mots de passe robustes.
:::

### 4. Vérifier les connexions actives

Vous pouvez vérifier les connexions actives sur le cluster NATS :

```bash
nats server report connections \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Résultat attendu :**

```console
╭──────────────────────────────────────────────────────────╮
│                   Connection Report                       │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Server   │ Conns    │ In Msgs  │ Out Msgs │ In Bytes     │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ my-nats-0│ 2        │ 5        │ 3        │ 128B         │
│ my-nats-1│ 1        │ 2        │ 1        │ 64B          │
│ my-nats-2│ 0        │ 0        │ 0        │ 0B           │
╰──────────┴──────────┴──────────┴──────────┴──────────────╯
```

Pour voir le détail des connexions par utilisateur :

```bash
nats server report connz \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Vérification

La configuration est réussie si :

- Les pods NATS sont tous en état `Running` après la mise à jour
- Chaque utilisateur peut se connecter avec son mot de passe
- Un mot de passe incorrect est rejeté (`Authorization Violation`)
- Les connexions actives sont visibles dans le rapport du serveur

## Pour aller plus loin

- **[Référence API NATS](../api-reference.md)** : documentation complète des paramètres `users`
- **[Comment configurer JetStream](./configure-jetstream.md)** : activer la persistance des messages et le streaming
