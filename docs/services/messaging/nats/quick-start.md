---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer NATS en 5 minutes

Ce guide vous accompagne pas à pas dans le déploiement de votre premier **cluster NATS** sur Hikube, du manifeste YAML jusqu'aux premiers tests de messagerie.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster NATS** déployé et opérationnel sur Hikube
- Une configuration **haute disponibilité** avec plusieurs réplicas
- Le **JetStream** activé pour le stockage persistant des messages
- Un **utilisateur** configuré pour se connecter à votre cluster

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** dédié pour héberger votre cluster NATS
- Le **CLI NATS** (`nats`) installé sur votre poste (optionnel, pour les tests)

---

## Étape 1 : Créer le manifeste NATS

Créez un fichier `nats.yaml` avec la configuration suivante :

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: example
spec:
  external: false

  replicas: 3
  resourcesPreset: small
  storageClass: replicated

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
```

:::tip
Si `resources` est défini, la valeur de `resourcesPreset` est ignorée. Consultez la [Référence API](./api-reference.md) pour la liste complète des options disponibles.
:::

---

## Étape 2 : Déployer le cluster NATS

Appliquez le manifeste et vérifiez que le déploiement démarre :

```bash
# Appliquer le manifeste
kubectl apply -f nats.yaml
```

Vérifiez le statut du cluster (peut prendre 1-2 minutes) :

```bash
kubectl get nats
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que tous les pods sont en état `Running` :

```bash
kubectl get pods | grep nats
```

**Résultat attendu :**

```console
nats-example-0    1/1     Running   0   2m
nats-example-1    1/1     Running   0   2m
nats-example-2    1/1     Running   0   2m
```

Avec `replicas: 3`, vous obtenez **3 pods NATS** formant un cluster haute disponibilité avec consensus Raft pour JetStream.

| Préfixe | Rôle | Nombre |
|---------|------|--------|
| `nats-example-*` | **NATS Server** (messagerie + JetStream) | 3 |

---

## Étape 4 : Récupérer les identifiants

Les mots de passe des utilisateurs NATS sont stockés dans un Secret Kubernetes :

```bash
kubectl get secret nats-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Résultat attendu :**

```console
user1: mypassword
```

---

## Étape 5 : Connexion et tests

### Port-forward du service NATS

```bash
kubectl port-forward svc/nats-example 4222:4222 &
```

### Test de publication et consommation

```bash
# Créer un stream JetStream
nats -s nats://user1:mypassword@localhost:4222 stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old

# Publier un message
nats -s nats://user1:mypassword@localhost:4222 pub events.test "Hello Hikube!"

# Consommer le message
nats -s nats://user1:mypassword@localhost:4222 stream view EVENTS
```

**Résultat attendu :**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

:::note
Si vous n'avez pas le CLI NATS, vous pouvez l'installer depuis [nats-io/natscli](https://github.com/nats-io/natscli).
:::

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod en erreur
kubectl logs nats-example-0

# Vérifier les events du pod
kubectl describe pod nats-example-0
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume JetStream plein (`jetstream.size` trop faible).

### NATS non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep nats

# Vérifier le service NATS
kubectl describe svc nats-example
```

**Causes fréquentes :** port-forward non actif, mauvais port (4222 pour les clients), identifiants incorrects.

### JetStream non fonctionnel

```bash
# Vérifier l'état de JetStream dans les logs
kubectl logs nats-example-0 | grep -i jetstream

# Vérifier le rapport JetStream
nats -s nats://user1:mypassword@localhost:4222 server report jetstream
```

**Causes fréquentes :** `jetstream.enabled: false` dans le manifeste, espace de stockage JetStream insuffisant, nombre de réplicas insuffisant pour le facteur de réplication demandé.

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster NATS
kubectl describe nats example
```

---

## Étape 7 : Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f nats.yaml
```

:::warning
Cette action supprime le cluster NATS et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Résumé

Vous avez déployé :

- Un cluster NATS avec **3 réplicas** en haute disponibilité
- **JetStream** activé pour la persistance des messages
- Un **utilisateur** authentifié pour se connecter au cluster
- Un stockage persistant pour la durabilité des données

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options NATS
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage NATS sur Hikube
