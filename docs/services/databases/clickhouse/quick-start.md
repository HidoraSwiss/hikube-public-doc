---
sidebar_position: 2
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Déployer ClickHouse en 5 minutes

Ce guide vous accompagne dans le déploiement de votre première base de données **ClickHouse** sur Hikube en **quelques minutes**!

---

## Objectifs

À la fin de ce guide, vous aurez :

- Une base de données **ClickHouse** déployée sur Hikube
- Une configuration initiale avec **shards** et **réplicas** adaptée à vos besoins
- Un utilisateur et un mot de passe pour vous connecter
- Un stockage persistant pour conserver vos données

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** disponible pour héberger votre base de données
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez activer les sauvegardes automatiques

---

## Étape 1 : Créer le manifeste ClickHouse

### **Préparez le fichier manifest**

Créez un fichier `clickhouse.yaml` comme ci-dessous:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: example
spec:
#   backup:
#     cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
#     enabled: false
#     resticPassword: <password>
#     s3AccessKey: <your-access-key>
#     s3Bucket: s3.example.org/clickhouse-backups
#     s3Region: us-east-1
#     s3SecretKey: <your-secret-key>
#     schedule: 0 2 * * *
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  logStorageSize: 2Gi
  logTTL: 15
  replicas: 2
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: small
  shards: 1
  size: 10Gi
  storageClass: ""
  users:
    user1:
      password: strongpassword
    user2:
      readonly: true
      password: hackme
```

### **Déployez le yaml ClickHouse**

```bash
# Appliquer le yaml
kubectl apply -f clickhouse.yaml
```

---

## Étape 2 : Vérification du déploiement

Vérifiez le statut de votre cluster ClickHouse (peut prendre 1-2 minutes) :

```bash
kubectl get clickhouse
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que les pods applicatifs sont en état `Running` :

```bash
kubectl get po | grep clickhouse
```

**Résultat attendu :**

```console
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s
```

Avec `replicas: 2` et `shards: 1`, vous obtenez **2 pods ClickHouse** (réplicas du shard) et **3 pods ClickHouse Keeper** pour la coordination du cluster.

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont stockés dans un Secret Kubernetes :

```bash
kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Résultat attendu :**

```console
backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme
```

---

## Étape 5 : Connexion et tests

### Port-forward du service ClickHouse

```bash
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000
```

### Test de connexion avec clickhouse-client

Dans un autre terminal, connectez-vous et vérifiez la version de ClickHouse :

```bash
clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES;"
```

**Résultat attendu :**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod ClickHouse en erreur
kubectl logs chi-clickhouse-example-clickhouse-0-0-0

# Vérifier les events du pod
kubectl describe pod chi-clickhouse-example-clickhouse-0-0-0
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume de stockage plein, erreur dans la configuration des shards ou réplicas.

### ClickHouse non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep clickhouse

# Vérifier le service endpoint
kubectl describe svc chendpoint-clickhouse-example
```

**Causes fréquentes :** port-forward non actif, mauvais port (9000 pour le protocole natif, 8123 pour HTTP), service non prêt.

### ClickHouse Keeper non fonctionnel

```bash
# Vérifier les logs du Keeper
kubectl logs chk-clickhouse-example-keeper-cluster1-0-0-0

# Vérifier l'état des pods Keeper
kubectl get pods | grep keeper
```

**Causes fréquentes :** le quorum Keeper nécessite un nombre impair de réplicas (3 minimum recommandé), espace disque Keeper insuffisant (`clickhouseKeeper.size` trop faible).

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster ClickHouse
kubectl describe clickhouse example
```

---

## 📋 Résumé

Vous avez déployé :

- Une base de données **ClickHouse** sur votre tenant Hikube
- Une configuration initiale avec **shards** et **réplicas**
- Un composant **ClickHouse Keeper** pour la coordination du cluster
- Un stockage persistant attaché pour vos données et logs
- Des utilisateurs avec mots de passe générés et stockés dans un Secret Kubernetes
- Un accès à votre base via `clickhouse-client`
- La possibilité de configurer des **sauvegardes S3** automatiques

---

## Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f clickhouse.yaml
```

:::warning
Cette action supprime le cluster ClickHouse et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options ClickHouse
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage ClickHouse sur Hikube

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Référence API", href: "../api-reference"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
