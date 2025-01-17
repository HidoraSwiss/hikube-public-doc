---
title: Redis
---

**Redis** est un data store en mémoire ultra-rapide et polyvalent, souvent utilisé comme cache pour améliorer considérablement les performances des applications. Le service **Managed Redis** fournit une solution clé en main pour le déploiement et la gestion des clusters Redis, garantissant une disponibilité et une réactivité optimales de vos données.

---

## Détails du Déploiement

Ce service managé repose sur le **Spotahome Redis Operator**, qui offre une gestion efficace et une orchestration fluide des clusters Redis.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                      | **Valeur Par Défaut** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Permet l'accès externe depuis l'extérieur du cluster. | `false`               |
| `size`         | Taille du volume persistant pour les données.         | `1Gi`                 |
| `replicas`     | Nombre de réplicas Redis.                             | `2`                   |
| `storageClass` | Classe de stockage utilisée pour les données.         | `"replicated"` ou `"local"`   |
| `authEnabled`  | Active la génération automatique d'un mot de passe.   | `true`                |

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un déploiement Redis avec deux réplicas et une authentification activée :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: redis-example
spec:
  external: false
  size: 1Gi
  replicas: 2
  storageClass: "replicated"
  authEnabled: true
```

---

## Ressources Additionnelles

Pour approfondir vos connaissances sur Redis et son opérateur, consultez les ressources suivantes :

- **[Documentation Officielle Redis](https://redis.io/docs/)**  
  Guide complet pour configurer et utiliser Redis.

- **[GitHub Spotahome Redis Operator](https://github.com/spotahome/redis-operator)**  
  Informations sur l'opérateur Redis et ses fonctionnalités.
