---
title: Tenant
---

Un **Tenant** est l'unité principale de sécurité sur la plateforme. Il peut être comparé aux namespaces du noyau Linux. Les tenants peuvent être créés de manière récursive et suivent des règles spécifiques pour la gestion et l'héritage.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un tenant avec ses propres services et une isolation réseau activée :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Tenant
metadata:
  name: tenant-u1
spec:
  host: "u1.example.org"
  etcd: true
  monitoring: true
  ingress: true
  seaweedfs: true
  isolated: true
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier manifest.yaml, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

`kubectl apply -f manifest.yaml`

---

## Détails sur les Tenants

### Règles de Gestion

1. Les tenants de niveau supérieur peuvent accéder aux tenants de niveau inférieur.
2. Les tenants de niveau supérieur peuvent visualiser et gérer les applications de tous leurs enfants.

### Héritage des Domaines

Chaque tenant possède son propre domaine. Par défaut, il hérite du domaine de son parent avec un préfixe basé sur son nom.

**Exemple** :

- Si le parent possède le domaine `example.org`, alors un tenant nommé `tenant-foo` obtiendra le domaine `foo.example.org` par défaut.
- Les clusters Kubernetes créés dans ce namespace obtiendront des sous-domaines comme `kubernetes-cluster.foo.example.org`.

Arborescence :

```scss
tenant-root (example.org)
└── tenant-foo (foo.example.org)
    └── kubernetes-cluster1 (kubernetes-cluster1.foo.example.org)
```

### Partage de Services

Un tenant de niveau inférieur peut accéder aux services du cluster de son parent (s'il ne déploie pas ses propres services).

**Exemple** :

- Créons `tenant-u1` avec un ensemble de services : `etcd`, `ingress`, `monitoring`.
- Créons un tenant de niveau inférieur `tenant-u2` dans le namespace de `tenant-u1`.
- Si `tenant-u2` n’a pas ses propres services comme `etcd`, `ingress` ou `monitoring`, les applications utiliseront ceux de `tenant-u1`.

Arborescence :

```scss
tenant-u1
├── etcd
├── ingress
├── monitoring
└── tenant-u2
    ├── kubernetes-cluster1
    └── postgres-db1
```

Dans cet exemple :

- Les données Kubernetes de `tenant-u2` seront stockées dans le `etcd` de `tenant-u1`.
- L'accès se fera via le `ingress` commun de `tenant-u1`.
- Les métriques seront collectées dans le système de monitoring de `tenant-u1`.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**      | **Description**                                                                      | **Valeur Par Défaut** |
|--------------|--------------------------------------------------------------------------------------|------------------------|
| `host`       | Nom d'hôte utilisé pour accéder aux services du tenant (basé sur le domaine parent). | `""`                  |
| `etcd`       | Déploie un cluster Etcd propre au tenant.                                            | `false`               |
| `monitoring` | Déploie une stack de monitoring propre au tenant.                                    | `false`               |
| `ingress`    | Déploie un contrôleur Ingress propre au tenant.                                      | `false`               |
| `seaweedfs`  | Déploie une instance SeaweedFS propre au tenant.                                     | `false`               |
| `isolated`   | Applique des politiques réseau pour isoler le namespace du tenant.                  | `false`               |

---
