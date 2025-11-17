---
sidebar_position: 3
title: Référence API
---

# Référence API NATS

Cette référence détaille la configuration et le fonctionnement des **clusters NATS** sur Hikube, incluant la gestion des **utilisateurs**, la configuration du **JetStream** pour la persistance des messages, et les options de personnalisation via le champ `config`.

---

## Structure de Base

### **Ressource NATS**

#### Exemple de configuration YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Nats
metadata:
  name: nats
  namespace: tenant-x
spec:
  replicas: 2
  resourcesPreset: nano
  external: false
  jetstream:
    enabled: true
    size: 10Gi
  users:
    user1:
      password: "mypassword"
````

---

## Paramètres

### **Paramètres Communs**

| **Paramètre**      | **Type**   | **Description**                                                                                      | **Défaut** | **Requis** |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| `replicas`         | `int`      | Nombre de réplicas NATS (nœuds du cluster)                                                           | `2`        | Oui        |
| `resources`        | `object`   | Configuration explicite CPU et mémoire pour chaque réplique. Si vide, `resourcesPreset` est utilisé. | `{}`       | Non        |
| `resources.cpu`    | `quantity` | CPU disponible par réplique NATS                                                                     | `""`       | Non        |
| `resources.memory` | `quantity` | RAM disponible par réplique NATS                                                                     | `""`       | Non        |
| `resourcesPreset`  | `string`   | Preset de ressources par défaut (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)   | `"nano"`   | Oui        |
| `storageClass`     | `string`   | StorageClass utilisé pour stocker les données persistantes du cluster                                | `""`       | Non        |
| `external`         | `bool`     | Active l’accès externe au cluster NATS (exposition hors du cluster Kubernetes)                       | `false`    | Non        |

#### Exemple YAML

```yaml title="nats.yaml"
replicas: 3
resourcesPreset: small
external: true
storageClass: replicated
```

---

### **Paramètres Application (Spécifiques à NATS)**

| **Paramètre**          | **Type**            | **Description**                                                                                                | **Défaut** | **Requis**    |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ------------- |
| `users`                | `map[string]object` | Liste des utilisateurs autorisés à se connecter au cluster NATS. La clé correspond au nom d’utilisateur.       | `{}`       | Non           |
| `users[name].password` | `string`            | Mot de passe associé à l’utilisateur.                                                                          | `""`       | Oui si défini |
| `jetstream`            | `object`            | Configuration du module **JetStream** pour la persistance des messages.                                        | `{}`       | Non           |
| `jetstream.enabled`    | `bool`              | Active ou désactive le module JetStream.                                                                       | `true`     | Non           |
| `jetstream.size`       | `quantity`          | Taille du volume persistant alloué pour JetStream.                                                             | `10Gi`     | Non           |
| `config`               | `object`            | Configuration avancée de NATS. Permet d’ajouter ou d’écraser certaines valeurs de la configuration par défaut. | `{}`       | Non           |
| `config.merge`         | `object`            | Configuration additionnelle fusionnée dans la configuration NATS principale.                                   | `{}`       | Non           |
| `config.resolver`      | `object`            | Configuration spécifique du résolveur NATS (DNS, opérateur, etc.).                                             | `{}`       | Non           |

#### Exemple YAML

```yaml title="nats.yaml"
users:
  admin:
    password: "supersecurepassword"
  client:
    password: "clientpassword"

jetstream:
  enabled: true
  size: 20Gi

config:
  merge:
    debug: true
    trace: true
  resolver:
    dir: /data/nats/resolver
```

---

### **resources et resourcesPreset**

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique.
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.

#### Exemple YAML

```yaml title="nats.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ **Note :** si `resources` est défini, la valeur de `resourcesPreset` est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
| --------------- | ------- | ----------- |
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Exemple complet

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats
  namespace: tenant-x
spec:
  external: false

  replicas: 2
  resourcesPreset: large
  storageClass: "replicated"

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      # Exemple de configuration additionnelle NATS
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
    resolver:
      # Configuration du resolver (optionnelle, pour JWTs, accounts, etc.)
      type: full
      dir: /data/resolver
```

---

Cette ressource permet de déployer un **cluster NATS hautement disponible**, avec **JetStream activé** pour la persistance des messages et des **utilisateurs authentifiés** pour un contrôle d’accès granulaire.
