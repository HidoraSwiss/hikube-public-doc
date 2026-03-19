---
title: "Verwaltung von les utilisateurs et profils ClickHouse"
---

# Verwaltung von les utilisateurs et profils ClickHouse

Dieser Leitfaden erklärt comment creer et gerer les utilisateurs ClickHouse auf Hikube, definir des permissions en lecture seule pour les analystes, et configurer la retention des logs de requetes.

## Voraussetzungen

- Une instance ClickHouse deployee sur Hikube (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Le fichier YAML de configuration de votre instance ClickHouse

## Schritte

### 1. Creer un utilisateur admin

Definissez un utilisateur avec un acces complet en ecriture et lecture dans le champ `users` du manifeste :

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
Utilisez des mots de passe forts en production. Les mots de passe sont stockes dans le manifeste en clair -- assurez-vous de proteger l'acces a vos fichiers YAML et aux Secrets Kubernetes associes.
:::

### 2. Creer un utilisateur en lecture seule

Ajoutez un utilisateur `analyst` avec le flag `readonly: true` pour limiter l'acces aux requetes de lecture (SELECT) uniquement :

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
Creez un utilisateur en lecture seule pour les outils d'analyse et de reporting (Grafana, Metabase, etc.). Cela limite les risques de modification accidentelle des donnees.
:::

### 3. Configurer les logs de requetes

ClickHouse enregistre les requetes executees dans les tables systeme `query_log` et `query_thread_log`. Configurez la taille de stockage et la duree de retention des logs :

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

- **`logStorageSize`** : taille du volume persistant dedie aux logs (defaut : `2Gi`)
- **`logTTL`** : duree de retention en jours pour `query_log` et `query_thread_log` (defaut : `15`)

:::note
Ajustez `logTTL` je nach vos besoins d'audit. Une valeur elevee consomme plus d'espace disque (`logStorageSize`). Pour un environnement de developpement, `7` jours est generalement suffisant.
:::

### 4. Appliquer les changements

```bash
kubectl apply -f clickhouse-users-logs.yaml
```

### 5. Se connecter avec clickhouse-client

Testez la connexion avec chaque utilisateur :

```bash
# Connexion avec l'utilisateur admin
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user admin --password MonMotDePasseAdmin2024
```

```bash
# Connexion avec l'utilisateur analyst
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user analyst --password AnalysteSecure2024
```

### 6. Verifier les permissions

Une fois connecte avec l'utilisateur `analyst`, verifiez que l'ecriture est bloquee :

```sql
-- Cette requete doit reussir (lecture autorisee)
SELECT count() FROM system.tables;

-- Cette requete doit echouer (ecriture interdite)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

L'utilisateur en lecture seule recevra une erreur du type :

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Überprüfung

Überprüfen Sie, ob les utilisateurs sont correctement configures :

```bash
# Verifier la configuration de la ressource ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 10 users

# Verifier que les pods sont en etat Running
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

Connectez-vous en tant qu'admin et listez les utilisateurs :

```sql
SELECT name, storage, auth_type FROM system.users;
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parametres `users`, `logStorageSize` et `logTTL`
- [Skalierung von verticalement ClickHouse](./scale-resources.md) -- Ajuster les ressources CPU et memoire
- [Konfiguration von le sharding](./configure-sharding.md) -- Distribution horizontale des donnees
