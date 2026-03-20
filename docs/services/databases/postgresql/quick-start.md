---
sidebar_position: 2
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Déployer PostgreSQL en 5 minutes

Ce guide vous accompagne dans le déploiement de votre première base de données **PostgreSQL** sur Hikube, depuis l'installation jusqu'à la première connexion.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Une base de données **PostgreSQL** déployée sur Hikube
- Un cluster répliqué avec un **primary** et des **réplicas** pour assurer la haute disponibilité
- Un utilisateur et un mot de passe pour vous connecter
- Un stockage persistant pour conserver vos données

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** disponible pour héberger votre base de données
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez activer les sauvegardes automatiques via CloudNativePG

---

## Étape 1 : Créer le manifeste PostgreSQL

### **Préparez le fichier manifest**

Créez un fichier `postgresql.yaml` comme ci-dessous:

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
  # configuration backup
  backup:
    enabled: false
    destinationPath: s3://bucket/path/to/folder/
    endpointURL: http://minio-gateway-service:9000
    retentionPolicy: 30d
    s3AccessKey: <your-access-key>
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * * *
  bootstrap:
    enabled: false
    oldName: ""
    recoveryTime: ""
  # creation databases
  databases:
    airflow:
      extensions:
      - hstore
      roles: # assign roles to the database
        admin:
        - airflow
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
  external: true # create service LoadBalancer if true (with public IP)
  # define parameters about postgresql
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0
  replicas: 3 # total number of postgresql instance
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: micro
  size: 10Gi
  storageClass: ""
  # create users
  users:
    airflow:
      password: qwerty123
    debezium:
      replication: true
    user1:
      password: strongpassword
    user2:
      password: hackme
```

### **Déployez le yaml PostgreSQL**

```bash
# Appliquer le yaml
kubectl apply -f postgresql.yaml
```

---

## Étape 2 : Vérification du déploiement

Vérifiez le statut de votre cluster PostgreSQL (peut prendre 1-2 minutes) :

```bash
kubectl get postgreses
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que les pods applicatifs sont en état `Running` :

```bash
kubectl get po -o wide | grep postgres
```

**Résultat attendu :**

```console
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>
```

Avec `replicas: 3`, vous obtenez **3 instances PostgreSQL** réparties sur des datacenters différents pour la haute disponibilité.

Vérifiez que chaque instance dispose d'un volume persistant (PVC) :

```bash
kubectl get pvc | grep postgres
```

**Résultat attendu :**

```console
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s
```

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont stockés dans un Secret Kubernetes :

```bash
kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Résultat attendu :**

```console
airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme
```

---

## Étape 5 : Connexion et tests

### Accès externe (si `external: true`)

Vérifiez les services disponibles :

```bash
kubectl get svc | grep postgre
```

```console
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m
```

### Accès via port-forward (si `external: false`)

```bash
kubectl port-forward svc/postgres-example-rw 5432:5432
```

:::note
Il est recommandé de ne pas exposer la base de données à l'extérieur si vous n'en avez pas le besoin.
:::

### Test de connexion avec psql

```bash
psql -h 91.223.132.64 -U user1 myapp
```

```console
psql (17.4, server 17.2 (Debian 17.2-1.pgdg110+1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

myapp=> \du
                                 List of roles
     Role name     |                         Attributes
-------------------+------------------------------------------------------------
 airflow           |
 airflow_admin     | No inheritance, Cannot login
 airflow_readonly  | No inheritance, Cannot login
 app               |
 debezium          | Replication
 myapp_admin       | No inheritance, Cannot login
 myapp_readonly    | No inheritance, Cannot login
 postgres          | Superuser, Create role, Create DB, Replication, Bypass RLS
 streaming_replica | Replication
 user1             |
 user2             |

myapp=>
```

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod en erreur
kubectl logs postgres-example-1

# Vérifier les events du pod
kubectl describe pod postgres-example-1
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume de stockage plein, erreur de configuration PostgreSQL dans `postgresql.parameters`.

### PostgreSQL non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep postgres

# Vérifier que le LoadBalancer a bien une IP externe
kubectl describe svc postgres-example-external-write
```

**Causes fréquentes :** `external: false` dans le manifeste, LoadBalancer en attente d'attribution d'IP, mauvais nom de service dans la chaîne de connexion.

### Réplication en échec

```bash
# Vérifier l'état du cluster CloudNativePG
kubectl describe postgres example

# Vérifier les logs du primary
kubectl logs postgres-example-1 -c postgres
```

**Causes fréquentes :** stockage insuffisant sur un réplica, problème réseau entre les nœuds, paramètres `quorum` mal configurés.

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster PostgreSQL
kubectl describe postgres example
```

---

## 📋 Résumé

Vous avez déployé :

- Une base de données **PostgreSQL** sur votre tenant Hikube
- Un cluster répliqué avec un **primary** et des **standby** pour la haute disponibilité
- Des utilisateurs et rôles configurés, avec mots de passe stockés dans des Secrets Kubernetes
- Un stockage persistant (PVC) attaché à chaque instance PostgreSQL
- Un accès sécurisé via `psql` (service interne ou LoadBalancer)
- La possibilité d'activer des **sauvegardes S3** automatiques

---

## Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f postgresql.yaml
```

:::warning
Cette action supprime le cluster PostgreSQL et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options PostgreSQL
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage PostgreSQL sur Hikube

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Reference API", href: "../api-reference"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de donnees", href: "../../"},
  ]}
/>
