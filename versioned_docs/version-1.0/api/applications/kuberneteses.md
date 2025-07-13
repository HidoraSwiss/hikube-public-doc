---
title: Kubernetes
---

Le service **Managed Kubernetes** offre une solution optimisée pour gérer efficacement les charges de travail serveur. Kubernetes, devenu un standard de l'industrie, fournit une API unifiée et accessible, principalement configurée en YAML, facilitant la gestion des infrastructures par les équipes.

---

## Aperçu

Le service Kubernetes repose sur des modèles de conception logicielle robustes, permettant une récupération continue via la méthode de réconciliation. Il garantit également une mise à l'échelle fluide sur plusieurs serveurs, éliminant les défis des API complexes des plateformes de virtualisation traditionnelles.

Cette solution managée simplifie considérablement la gestion des charges de travail en éliminant le besoin de solutions personnalisées ou de modifications de code source, économisant temps et efforts.

---

## Détails du Déploiement

Le service déploie un cluster Kubernetes standard en utilisant :

- **Cluster API** : Pour la gestion des clusters Kubernetes.
- **Kamaji** : Fournisseur du plan de contrôle (Control Plane).
- **KubeVirt** : Fournisseur de l'infrastructure pour l'orchestration des machines virtuelles.

Les charges de travail utilisent des nœuds worker déployés en tant que machines virtuelles, tandis que le plan de contrôle est exécuté dans des conteneurs.

### Fonctionnalités Disponibles

- Services **LoadBalancer** pour gérer l'accès externe.
- Provisionnement facile de volumes persistants pour les applications.

**Liens Utiles** :

- [Documentation Kamaji](https://github.com/clastix/kamaji)
- [Documentation Cluster API](https://cluster-api.sigs.k8s.io/)
- [GitHub KubeVirt CSI Driver](https://github.com/kubevirt/csi-driver)

---

## Accès au Cluster Déployé

Pour accéder au cluster Kubernetes déployé, utilisez la commande suivante pour obtenir le fichier kubeconfig :

```bash
kubectl get secret -n <namespace> kubernetes-<clusterName>-admin-kubeconfig -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' > kubeconfig.yaml
```

Cela génère un fichier `kubeconfig.yaml` que vous pouvez utiliser avec `kubectl` pour interagir avec le cluster.

---

## Machines Virtuelles et Séries de Ressources

Les nœuds worker du cluster Kubernetes sont déployés en tant que **machines virtuelles** avec des caractéristiques adaptées à différentes charges de travail. Ces caractéristiques incluent :

- **Burstable CPU** pour les charges de travail variables.
- **Hugepages** pour améliorer les performances mémoire.
- **vCPU-To-Memory Ratios** pour une utilisation optimale des ressources.

Pour plus de détails sur les séries et les ressources des machines virtuelles, consultez la page [Machines Virtuelles](virtualmachines.md).

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**                    | **Description**                                                                 | **Valeur Par Défaut**    |
|-----------------------------|---------------------------------------------------------------------------------|---------------------------|
| `host`                     | Nom d'hôte utilisé pour accéder au cluster Kubernetes.                          | `""` (nom du cluster)     |
| `controlPlane.replicas`    | Nombre de réplicas pour les composants du plan de contrôle.                     | `2`                      |
| `storageClass`             | Classe de stockage utilisée pour les données des utilisateurs.                  | `"replicated"` ou `"local"`             |

### **Configuration des Groupes de Nœuds**

| **Nom**           | **Description**                                                                                     | **Valeur Par Défaut** |
|--------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `nodeGroups`       | Configuration des groupes de nœuds, incluant les types d'instances, le stockage et les rôles attribués. | `{}`                  |

Exemple pour un groupe de nœuds :

```yaml
nodeGroups:
  md0:
    minReplicas: 0
    maxReplicas: 10
    instanceType: "u1.medium"
    ephemeralStorage: 20Gi
    roles:
    - ingress-nginx
    resources:
      cpu: ""
      memory: ""
```

## Add-ons Disponibles

Les fonctionnalités suivantes peuvent être activées pour améliorer les capacités du cluster :

### Cert-Manager

Gère automatiquement les certificats SSL/TLS.

Configuration :

```yaml
addons:
  certManager:
    enabled: true
    valuesOverride: {}
```

---

### Ingress-NGINX Controller

Gère l'accès HTTP/HTTPS au cluster.

Configuration :

```yaml
addons:
  ingressNginx:
    enabled: true
    hosts:
    - example.org
    - foo.example.net
    valuesOverride: {}
```

---

### Flux CD

Implémente des pratiques GitOps pour le déploiement des applications.

Configuration :

```yaml
addons:
  fluxcd:
    enabled: true
    valuesOverride: {}
```

---

### Agents de Monitoring

Permet l'intégration avec des agents de monitoring comme FluentBit pour la collecte des logs et des métriques.

Configuration :

```yaml
addons:
  monitoringAgents:
    enabled: true
    valuesOverride: {}
```

---

## Ressources Additionnelles

- **[Documentation Officielle Kubernetes](https://kubernetes.io/docs/)**  
  Guide officiel couvrant tous les aspects de Kubernetes.
- **[Cluster API Documentation](https://cluster-api.sigs.k8s.io/)**  
  Documentation détaillée pour la gestion des clusters Kubernetes via Cluster API.
- **[Kamaji Documentation](https://github.com/clastix/kamaji)**  
  Guide sur l'utilisation de Kamaji en tant que fournisseur du plan de contrôle.
- **[KubeVirt Documentation](https://kubevirt.io/)**  
  Informations sur l'orchestration des machines virtuelles dans Kubernetes.
  