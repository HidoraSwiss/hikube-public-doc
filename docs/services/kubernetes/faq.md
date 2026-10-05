---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Comment créer un cluster Kubernetes ?

Dans la [console Hikube](https://console.hikube.cloud), ouvrez **Infrastructure** > **Kubernetes** et cliquez sur **Créer un cluster**. L'assistant comporte quatre étapes : **Général**, **Nœuds**, **Addons** et **Vérification**. Le [démarrage rapide](./quick-start.md) détaille chaque étape.

---

### Quels sont les types d'instance disponibles ?

Hikube propose trois séries d'instances pour les nœuds Kubernetes :

| Série | Préfixe | Ratio vCPU:RAM | Usage recommandé |
|-------|---------|----------------|------------------|
| **Standard (S)** | `s1` | 1:2 | Usage économique, développement, tests |
| **Universel (U)** | `u1` | 1:4 | Usage général : serveurs web, applications |
| **Mémoire (M)** | `m1` | 1:8 | Bases de données, caches, traitements en mémoire |

Chaque série est disponible en plusieurs tailles, par exemple `s1.small`, `u1.large`, `m1.2xlarge`. La liste complète figure dans les [concepts](./concepts.md#types-dinstance).

---

### Quelle classe de stockage utiliser dans mon cluster ?

Les volumes persistants de vos workloads utilisent la classe de stockage **`replicated`**, répliquée sur plusieurs datacenters :

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
      storage: 10Gi
```

Le choix d'une autre classe de stockage pour le cluster n'est pas proposé dans la console ; contactez le support.

---

### Quels addons sont disponibles ?

L'étape **Addons** de l'assistant propose :

| Addon | Description | Activé par défaut |
|-------|-------------|-------------------|
| **Cert-Manager** | Gestion automatique des certificats SSL/TLS | Oui |
| **Ingress NGINX** | Contrôleur Ingress basé sur NGINX | Oui |
| **Gateway API** | CRDs Kubernetes Gateway API | Non |
| **GPU Operator** | Gestion des GPU NVIDIA | Non (imposé si un groupe a des GPU) |
| **HAMi** | Partage d'un GPU entre plusieurs pods (nécessite GPU Operator) | Non |
| **Flux CD** | Déploiement continu GitOps | Non |
| **Monitoring Agents** | Agents de surveillance pour logs et métriques | Oui |
| **Ouroboros** | Correction du hairpin NAT d'Ingress NGINX (nécessite Ingress NGINX) | Non |
| **Velero** | Sauvegarde et restauration | Non |

**Cilium**, **CoreDNS** et **Vertical Pod Autoscaler** sont toujours présents ; leur configuration se surcharge dans la section **Configuration avancée**. Les addons s'activent à la création ou depuis **Modifier** > **Extensions & Addons**. Voir la section Plugins, à partir de [Cilium](./plugins/cilium.md).

---

### Comment récupérer mon kubeconfig ?

Ouvrez la page de détail du cluster dans la console et cliquez sur **Kubeconfig** dans la section **Actions**. Le navigateur télécharge le fichier `kubeconfig-<nom-du-cluster>.yaml` :

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes
```

Voir [Accès et outils](./how-to/toolbox.md).

---

### Comment scaler les groupes de nœuds ?

Le scaling est contrôlé par le **Nombre minimum de nœuds** et le **Nombre maximum de nœuds** de chaque groupe. L'autoscaler ajuste automatiquement le nombre de nœuds entre ces deux bornes en fonction de la charge.

Pour modifier les bornes : **Modifier** > **Groupes de nœuds**, dépliez le groupe, changez les valeurs, puis **Enregistrer**. Voir [Comment configurer l'autoscaling](./how-to/configure-autoscaling.md).

---

### Comment ajouter des nœuds GPU à mon cluster ?

Ajoutez un nouveau groupe de nœuds (**Modifier** > **Ajouter un groupe de nœuds**) et choisissez le modèle et le nombre de GPU dans sa section **GPU**. La console active alors automatiquement l'addon **GPU Operator**, qui installe les pilotes NVIDIA.

:::warning
- Les GPU choisis sont attachés à **chaque** nœud du groupe, et la réservation est calculée sur le nombre maximum de nœuds : un groupe de 4 nœuds au maximum avec 1 GPU par nœud réserve 4 GPU, avec un impact direct sur la facturation.
- Un groupe existant créé sans GPU ne peut pas en recevoir : créez un nouveau groupe.
:::

Voir [Comment ajouter et modifier un groupe de nœuds](./how-to/manage-node-groups.md).

---

### Puis-je modifier le control plane après la création ?

Non. La **Taille de l'instance Control Plane** et la **Haute Disponibilité du Control Plane** ne sont pas modifiables dans la console après la création ; contactez le support. La version de Kubernetes, l'endpoint API, les groupes de nœuds et les addons restent modifiables.
