---
sidebar_position: 2
title: Schnellstart
---

# Déployer MySQL en 5 minutes

Dieser Leitfaden begleitet Sie dans le Deployment de votre première base de données **MySQL** sur Hikube, depuis l'installation jusqu'à la première connexion.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Une base de données **MySQL** opérationnelle sur Hikube
- Un cluster répliqué avec un **primary** et des **réplicas** um die ... sicherzustellen Hochverfügbarkeit
- Des **utilisateurs et mots de passe** pour accéder à vos applications
- Un **stockage persistant** attaché à chaque instance um die ... zu gewährleisten durabilité des données
- (Optionnel) La possibilité d'aktiviertr des **sauvegardes automatiques** vers un stockage compatible S3

---

## Voraussetzungen

Bevor Sie beginnen, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** disponible pour héberger votre base de données
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez aktiviertr les sauvegardes automatiques via MariaDB-Operator

---

## Étape 1 : Créer le manifeste MySQL

### **Préparez le fichier manifest**

Erstellen Sie eine Datei `mysql.yaml` comme ci-dessous:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  backup:
    cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
    enabled: false
    resticPassword: <password>
    s3AccessKey: <your-access-key>
    s3Bucket: s3.example.org/mysql-backups
    s3Region: us-east-1
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * *
  databases:
    myapp1:
      roles:
        admin:
        - user1
        readonly:
        - user2
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 10Gi
  storageClass: ""
  users:
    user1:
      maxUserConnections: 1000
      password: hackme
    user2:
      maxUserConnections: 1000
      password: hackme
```

### **Déployez le yaml MySQL**

```bash
# Appliquer le yaml
kubectl apply -f mysql.yaml
```

---

## Étape 2 : Überprüfung du Deployment

Vérifiez le statut de votre cluster MySQL (peut prendre 1-2 minutes) :

```bash
kubectl get mysql
```

**Erwartetes Ergebnis :**

```console
NAME      READY   AGE     VERSION
example   True    1m16s   0.10.0
```

---

## Étape 3 : Überprüfung des pods

Überprüfen Sie, ob les pods applicatifs sont en état `Running` :

```bash
kubectl get po -o wide | grep mysql
```

**Erwartetes Ergebnis :**

```console
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>
```

Avec `replicas: 3`, vous obtenez **3 instances MySQL** (1 primary + 2 réplicas) réparties sur des datacenters différents, plus un pod de métriques.

Überprüfen Sie, ob chaque instance dispose d'un volume persistant (PVC) :

```bash
kubectl get pvc | grep mysql
```

**Erwartetes Ergebnis :**

```console
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m
```

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont stockés dans un Secret Kubernetes :

```bash
kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis :**

```console
root: cr42msoxKhnEajfo
user1: hackme
user2: hackme
```

---

## Étape 5 : Connexion et tests

### Accès externe (si `external: true`)

Vérifiez les services disponibles :

```bash
kubectl get svc | grep mysql
```

```console
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m
```

### Accès via port-forward (si `external: false`)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

:::note
Il est recommandé de ne pas exposer la base de données à l'extérieur si vous n'en avez pas le besoin.
:::

### Test de connexion avec mysql

```bash
mysql -h 91.223.132.64 -u user1 -p myapp1
```

```console
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1214
Server version: 11.0.2-MariaDB-1:11.0.2+maria~ubu2204-log mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myapp1             |
+--------------------+
2 rows in set (0.00 sec)

mysql>
```

---

## Étape 6 : Schnelle Fehlerbehebung

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod en erreur
kubectl logs mysql-example-0

# Vérifier les events du pod
kubectl describe pod mysql-example-0
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume de stockage plein, erreur de configuration MariaDB.

### MySQL non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep mysql

# Vérifier que le LoadBalancer a bien une IP externe
kubectl describe svc mysql-example-primary
```

**Causes fréquentes :** `external: false` dans le manifeste, LoadBalancer en attente d'attribution d'IP, mauvais port ou nom d'hôte dans la chaîne de connexion.

### Réplication en échec

```bash
# Vérifier l'état du cluster MariaDB
kubectl get mariadb

# Inspecter les détails de la ressource MariaDB
kubectl describe mariadb mysql-example
```

**Causes fréquentes :** binlog purgé avant la synchronisation d'un réplica, espace disque insuffisant, problème réseau entre les nœuds.

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster MySQL
kubectl describe mysql example
```

---

## 📋 Résumé

Vous avez déployé :

- Une base de données **MySQL** sur votre tenant Hikube
- Un cluster répliqué avec un **primary** et des **réplicas** um die ... sicherzustellen continuité de service
- Des utilisateurs créés automatiquement, avec leurs identifiants stockés dans des Secrets Kubernetes
- Un stockage persistant (PVC) dédié à chaque pod MySQL um die ... zu gewährleisten durabilité des données
- Un accès sécurisé via le client `mysql` (port-forward ou LoadBalancer)
- La possibilité de configurer des **sauvegardes S3** et de restaurer en cas de besoin

---

## Bereinigung

Pour supprimer les ressources de test :

```bash
kubectl delete -f mysql.yaml
```

:::warning
Cette action supprime le cluster MySQL et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)** : Configuration complète de toutes les options MySQL
- **[Übersicht](./overview.md)** : Architecture détaillée et cas d'usage MySQL auf Hikube
