---
sidebar_position: 1
title: Vue d'ensemble
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Présentation du Kubernetes managé sur Hikube

Hikube propose un service de **Kubernetes managé** conçu pour offrir une infrastructure hautement disponible, sécurisée et performante.
Le plan de contrôle est entièrement géré par la plateforme, tandis que les **nœuds workers** sont déployés dans votre projet sous forme de machines virtuelles.

Les clusters se créent, se modifient et se suppriment depuis la [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Kubernetes**. Une fois le cluster prêt, vous téléchargez son kubeconfig depuis la console et vous travaillez dans le cluster avec vos outils habituels (`kubectl`, `helm`, client SDK, etc.).

---

## Architecture

Les clusters Kubernetes Hikube s'appuient sur une **infrastructure multi-datacenter** (3 sites suisses) garantissant la réplication, la tolérance aux pannes et la continuité de service.

- **Plan de contrôle (Control Plane)** : hébergé et opéré par Hikube. Il est composé de :
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Nœuds workers** : machines virtuelles dans votre projet, regroupées en groupes de nœuds
- **Réseau** : CNI Cilium, support des Services `LoadBalancer`, des `Ingress` et des `NetworkPolicy`
- **Stockage** : volumes persistants répliqués sur les 3 datacenters
- **Addons** : Cert-Manager, Ingress NGINX, Flux CD, agents de monitoring, Velero, GPU Operator, etc.
- **Versions Kubernetes** : vous choisissez la version parmi celles proposées par la plateforme

---

## Ce que vous configurez dans la console

L'assistant **Créer un cluster** regroupe la configuration en quatre étapes :

| Étape | Ce que vous définissez |
|-------|------------------------|
| **Général** | Nom du cluster, version de Kubernetes, endpoint API (optionnel), taille et nombre d'instances du control plane |
| **Nœuds** | Un ou plusieurs groupes de nœuds : nom, type d'instance, stockage éphémère, nombre minimum et maximum de nœuds, exposition sur internet, GPU |
| **Addons** | Activation des addons du cluster et surcharge facultative de leurs valeurs Helm |
| **Vérification** | Récapitulatif avant le déploiement |

Le détail de chaque champ est décrit dans les [concepts](./concepts.md) et le [démarrage rapide](./quick-start.md).

---

## Fonctionnement détaillé

### Control Plane

- Géré par Hikube, sans maintenance nécessaire de votre part
- Dimensionné par un preset (**Taille de l'instance Control Plane**) et un nombre d'instances (**Haute Disponibilité du Control Plane** : 1, 3 ou 5)
- Accès via l'API standard Kubernetes (`kubectl`, client SDK, etc.) avec le kubeconfig téléchargé depuis la console

### Groupes de nœuds

Les **groupes de nœuds** permettent d'adapter les ressources à vos workloads. Chaque groupe a son propre type d'instance et ses propres bornes d'auto-scaling.

- **Auto-scaling** : nombre minimum et maximum de nœuds par groupe
- **Support GPU** : attachement de GPU NVIDIA aux nœuds d'un groupe, choisis dans l'assistant
- **Types d'instance** : séries Standard (S), Universel (U) et Mémoire (M)

---

## Stockage persistant

Les volumes persistants (PVC) créés dans le cluster utilisent la classe de stockage **`replicated`** :

- Réplication automatique sur les **3 datacenters suisses**
- Provisioning dynamique des volumes persistants
- Tolérance aux pannes et haute disponibilité native

Exemple de PVC à déployer dans votre cluster :

```yaml title="pvc.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated
  resources:
    requests:
      storage: 20Gi
```

---

## Versions Kubernetes

- La version se choisit à la création du cluster, parmi celles proposées par la plateforme (la plus récente est présélectionnée)
- La mise à jour se fait depuis la page de modification du cluster (voir [Comment mettre à jour un cluster](./how-to/upgrade-cluster.md))

---

## Addons intégrés

### Cert-Manager

- Gestion automatisée des certificats SSL/TLS
- Support Let's Encrypt et autorités privées
- Renouvellement automatique

### Ingress NGINX

- Contrôleur d'ingress intégré, exposé par un Service `LoadBalancer`
- Déployé sur les groupes de nœuds exposés sur internet

### Flux CD (GitOps)

- Synchronisation continue avec vos dépôts Git
- Déploiement automatisé et rollback

### Monitoring Agents

- Collecte des métriques et des logs du cluster (VictoriaMetrics Agent, Fluent Bit, kube-state-metrics, node exporter)

La liste complète figure dans la section [Plugins](./plugins/cilium.md).

---

## Exemples de cas d'usage

| Cas d'usage | Groupe de nœuds conseillé |
|-------------|---------------------------|
| **Applications web** | Série Standard (S), 2 à 10 nœuds, groupe exposé sur internet pour héberger l'Ingress |
| **Workloads ML/IA** | Série Universel (U) avec GPU, addon GPU Operator activé |
| **Applications critiques** | Au moins 3 nœuds minimum, control plane en haute disponibilité (3 instances) |

---

## Ressources

- **[Concepts et architecture](./concepts.md)** : comprendre comment est déployé un cluster Kubernetes Hikube
- **[Démarrage rapide](./quick-start.md)** : créer votre premier cluster depuis la console

---

## Points clés

- **Plan de contrôle managé** : aucune maintenance des masters requise
- **Nœuds dans votre projet** : contrôle complet sur les workers
- **Auto-scaling** : ajustement dynamique selon la charge
- **Multi-datacenter** : haute disponibilité native et réplication
- **Compatibilité totale** : API Kubernetes standard

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Démarrage rapide", href: "../quick-start"},
  ]}
/>
