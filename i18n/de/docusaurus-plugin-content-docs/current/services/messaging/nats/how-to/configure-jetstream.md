---
title: "Konfiguration von JetStream"
---

# Konfiguration von JetStream

Dieser Leitfaden erklärt comment aktiviertr et configurer le module **JetStream** sur un cluster NATS déployé sur Hikube. JetStream fournit la persistance des messages, le streaming et le pattern request/reply avec garanties de livraison.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **NATS** déployé sur Hikube (ou un manifeste prêt à déployer)
- (Optionnel) le CLI **nats** installé localement pour tester

## Schritte

### 1. Activer JetStream

JetStream est aktiviert par défaut (`jetstream.enabled: true`). Si vous l'avez désaktiviert ou si vous souhaitez le configurer explicitement, ajoutez la section `jetstream` au manifeste :

```yaml title="nats-jetstream.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small
  external: false

  jetstream:
    enabled: true
    size: 20Gi

  users:
    admin:
      password: SecureAdminPassword
```

**Paramètres JetStream :**

| Paramètre | Typ | Beschreibung | Défaut |
|-----------|------|-------------|--------|
| `jetstream.enabled` | `bool` | Active ou désaktiviert JetStream | `true` |
| `jetstream.size` | `quantity` | Taille du volume persistant pour les données JetStream | `10Gi` |

:::tip
Utilisez 3 réplicas minimum en production pour bénéficier du consensus Raft de JetStream. Cela garantit la Hochverfügbarkeit et la durabilité des streams en cas de panne d'un nœud.
:::

### 2. Configurer le stockage JetStream

Le dimensionnement du volume JetStream dépend de votre cas d'usage :

- **Messages éphémères** (TTL court, quelques heures) : `10Gi` à `20Gi`
- **Rétention longue** (jours, semaines) : `50Gi` à `100Gi`
- **Streams volumineux** (événements, logs) : `100Gi` et plus

```yaml title="nats-jetstream-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
```

:::warning
Réduire `jetstream.size` sur un cluster existant peut entraîner une perte de données. Prévoyez toujours une marge suffisante lors du dimensionnement initial.
:::

### 3. Configuration avancée via config.merge

Le champ `config.merge` permet d'ajuster les paramètres bas niveau de NATS :

```yaml title="nats-config-advanced.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

**Options de configuration courantes :**

| Paramètre | Beschreibung | Défaut |
|-----------|-------------|--------|
| `max_payload` | Taille maximale d'un message | `1MB` |
| `write_deadline` | Délai maximal pour écrire une réponse au client | `2s` |
| `debug` | Active les logs de debug | `false` |
| `trace` | Active le traçage des messages (très verbeux) | `false` |

:::note
Activez `debug` et `trace` uniquement pour le Fehlerbehebung temporaire. Ces options génèrent un volume important de logs et peuvent impacter les performances.
:::

### 4. Appliquer et vérifier

Appliquez le manifeste :

```bash
kubectl apply -f nats-config-advanced.yaml
```

Surveillez le rolling update des pods :

```bash
kubectl get po -w | grep my-nats
```

Attendez que tous les pods soient en état `Running` :

```bash
kubectl get po | grep my-nats
```

**Erwartetes Ergebnis :**

```console
my-nats-0   1/1     Running   0   2m
my-nats-1   1/1     Running   0   4m
my-nats-2   1/1     Running   0   6m
```

### 5. Tester JetStream

Ouvrez un port-forward vers le service NATS :

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Créez un stream avec le CLI `nats` :

```bash
nats stream create EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --subjects "events.>" \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3
```

**Erwartetes Ergebnis :**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

Publiez un message :

```bash
nats pub events.test "Hello JetStream" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

Consommez le message :

```bash
nats sub "events.>" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --count 1
```

**Erwartetes Ergebnis :**

```console
[#1] Received on "events.test"
Hello JetStream
```

Vérifiez l'état du stream :

```bash
nats stream info EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Überprüfung

La configuration est réussie si :

- Les pods NATS sont tous en état `Running`
- Un stream peut être créé avec le nombre de réplicas souhaité
- Les messages publiés sont persistés et peuvent être consommés
- Le stream info affiche le bon nombre de réplicas et la politique de rétention configurée

## Weiterführende Informationen

- **[API-Referenz NATS](../api-reference.md)** : documentation complète des paramètres `jetstream`, `config` et `config.merge`
- **[Verwaltung von les utilisateurs NATS](./manage-users.md)** : créer et gérer les comptes d'accès au cluster
