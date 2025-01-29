---
title: HTTPCache
---

Le service **HTTPCache** est un système de cache géré basé sur **Nginx** conçu pour optimiser le trafic web et améliorer les performances des applications web. Il combine des instances Nginx personnalisées avec **HAProxy** pour fournir un caching efficace et un équilibrage de charge.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour déployer HTTPCache avec deux réplicas pour HAProxy et Nginx :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: HTTPCache
metadata:
  name: httpcache-example
spec:
  external: true
  size: 20Gi
  storageClass: "replicated"
  haproxy:
    replicas: 2
  nginx:
    replicas: 2
  endpoints:
    - url: "https://example-origin.com"
    - url: "https://another-origin.com"
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier manifest.yaml, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

`kubectl apply -f manifest.yaml`

---

## Fonctionnalités Principales

- **Modules et Intégrations Nginx** :
  - Module **VTS** pour les statistiques.
  - Intégration avec **ip2location** et **ip2proxy** pour la géolocalisation IP.
  - Support de **51Degrees** pour la détection d'appareils.
  - Fonctionnalité de purge de cache.

- **Rôle de HAProxy** :
  - HAProxy utilise un **hash cohérent** basé sur l'URL pour diriger le trafic vers les instances Nginx appropriées.
  - Fonctionnement actif/backup pour une haute disponibilité.

- **Stockage des Caches** :
  - Chaque instance Nginx utilise un **Persistent Volume Claim (PVC)** pour stocker les contenus mis en cache, assurant un accès rapide et fiable aux ressources fréquemment utilisées.

---

## Architecture de Déploiement

L'architecture de déploiement se décompose en trois couches principales :

1. **Load Balancer** : HAProxy pour l'équilibrage de charge.
2. **Caching Layer** : Instances Nginx avec PVC.
3. **Origin Layer** : Les serveurs d'origine pour les contenus non mis en cache.

Voici un schéma illustrant l'architecture :

```scss
      ┌─────────┐
      │ metallb │ arp announce
      └────┬────┘
           │
           │
   ┌───────▼───────────────────────────┐
   │  kubernetes service               │  node
   │ (externalTrafficPolicy: Local)    │  level
   └──────────┬────────────────────────┘
              │
              │
         ┌────▼────┐  ┌─────────┐
         │ haproxy │  │ haproxy │   loadbalancer
         │ (active)│  │ (backup)│      layer
         └────┬────┘  └─────────┘
              │
              │ balance uri whole
              │ hash-type consistent
       ┌──────┴──────┬──────────────┐
   ┌───▼───┐     ┌───▼───┐      ┌───▼───┐ caching
   │ nginx │     │ nginx │      │ nginx │  layer
   └───┬───┘     └───┬───┘      └───┬───┘
       │             │              │
  ┌────┴───────┬─────┴────┬─────────┴──┐
  │            │          │            │
┌───▼────┐ ┌────▼───┐ ┌───▼────┐  ┌────▼───┐ 
│ origin │ │ origin │ │ origin │  │ origin │ 
└────────┘ └────────┘ └────────┘  └────────┘
```

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**            | **Description**                                              | **Valeur Par Défaut** |
|---------------------|--------------------------------------------------------------|------------------------|
| `external`         | Permet l'accès externe au service HTTPCache depuis l'extérieur du cluster. | `false`               |
| `size`             | Taille du volume persistant utilisé pour le cache.           | `10Gi`                |
| `storageClass`     | Classe de stockage utilisée pour les données.                | `"replicated"` ou `"local"`   |
| `haproxy.replicas` | Nombre de réplicas pour HAProxy.                              | `2`                   |
| `nginx.replicas`   | Nombre de réplicas pour Nginx.                                | `2`                   |

---

### **Paramètres de Configuration**

| **Nom**        | **Description**                 | **Valeur Par Défaut** |
|-----------------|---------------------------------|------------------------|
| `endpoints`    | Configuration des endpoints.    | `[]`                  |

---

## Problèmes Connus

- **Temps de réponse des upstreams dans le module VTS** :  
  Le module **VTS** affiche des temps de réponse incorrects. Ce problème est documenté ici :  
  [GitHub Issue - VTS Module](https://github.com/vozlt/nginx-module-vts/issues/198)

---

## Ressources Additionnelles

Pour en savoir plus sur la configuration et l'utilisation des composants de HTTPCache, voici quelques ressources utiles :

- [**Documentation Officielle Nginx**](https://nginx.org/en/docs/)  
  Guide complet pour configurer et optimiser Nginx, incluant des modules spécifiques comme la gestion des caches.

- [**Documentation Officielle HAProxy**](https://haproxy.org/)  
  Tout ce que vous devez savoir pour configurer HAProxy en tant qu'équilibreur de charge performant.

- [**Issue GitHub : VTS Module**](https://github.com/vozlt/nginx-module-vts/issues/198)  
  Informations sur le problème connu lié aux temps de réponse incorrects dans le module VTS de Nginx.
