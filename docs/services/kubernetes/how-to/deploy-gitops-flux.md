---
title: "Comment déployer avec Flux (GitOps)"
---

# Comment déployer avec Flux (GitOps)

Ce guide explique comment activer Flux CD sur un cluster Kubernetes Hikube et le configurer pour déployer vos applications selon l'approche GitOps : un dépôt Git comme source de vérité pour l'état de votre cluster.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**)
- Un dépôt Git accessible depuis le cluster, contenant vos manifestes Kubernetes

## Étapes

### 1. Préparer le dépôt Git

Organisez votre dépôt Git avec une structure de répertoires contenant vos manifestes Kubernetes :

```
k8s-manifests/
└── clusters/
    └── production/
        ├── namespaces.yaml
        ├── frontend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── ingress.yaml
        └── backend/
            ├── deployment.yaml
            └── service.yaml
```

:::tip
Flux applique tous les manifestes YAML trouvés dans le répertoire cible et ses sous-répertoires. Organisez vos fichiers de manière logique pour faciliter la maintenance.
:::

### 2. Activer l'addon Flux CD

1. Dans **Infrastructure** > **Kubernetes**, ouvrez le menu **Actions** du cluster et choisissez **Modifier** (ou cochez l'addon directement à la création, étape **Addons**).
2. Dans la section **Extensions & Addons**, cochez **Flux CD** (« Déploiement continu GitOps pour Kubernetes »).
3. Cliquez sur **Enregistrer**.

La page de détail du cluster affiche alors **Flux CD** dans la section **Extensions**. L'addon installe les contrôleurs Flux et leurs CRDs ; la déclaration de vos dépôts se fait ensuite dans le cluster.

### 3. Vérifier l'installation de Flux

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml

# CRDs Flux installées
kubectl get crds | grep toolkit.fluxcd.io

# Contrôleurs Flux
kubectl get deploy -A -l app.kubernetes.io/part-of=flux
```

### 4. Déclarer le dépôt et la synchronisation

Créez dans le cluster une source `GitRepository` et une `Kustomization` qui applique le répertoire choisi :

```yaml title="gitops-sync.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: gitops
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k8s-manifests
  namespace: gitops
spec:
  interval: 1m
  url: https://github.com/company/k8s-manifests
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: production
  namespace: gitops
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: k8s-manifests
  path: ./clusters/production
  prune: true
```

```bash
kubectl apply -f gitops-sync.yaml
```

:::note
Pour un dépôt Git privé, créez un Secret contenant une clé SSH ou un token dans le namespace `gitops`, puis référencez-le dans le champ `spec.secretRef` du `GitRepository`. Consultez la [documentation Flux](https://fluxcd.io/flux/components/source/gitrepositories/) pour le format attendu.
:::

### 5. Observer la synchronisation

```bash
# État de la source Git
kubectl get gitrepositories -n gitops

# État de la réconciliation
kubectl get kustomizations -n gitops
```

**Résultat attendu :**

```console
NAME            URL                                         READY   STATUS
k8s-manifests   https://github.com/company/k8s-manifests    True    stored artifact for revision 'main@sha1:...'
```

```console
NAME         READY   STATUS
production   True    Applied revision: main@sha1:...
```

### 6. Déployer une application via Git

Pour déployer ou mettre à jour une application, poussez les manifestes dans votre dépôt Git :

```yaml title="clusters/production/my-app/deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: registry.example.com/my-app:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

```bash
# Depuis votre dépôt local
git add clusters/production/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux détecte les changements à l'intervalle défini et applique les manifestes dans le cluster :

```bash
kubectl get kustomizations -n gitops -w
kubectl get pods -A -l app=my-app
```

:::tip
Pour forcer une réconciliation immédiate :
```bash
kubectl annotate --overwrite gitrepository k8s-manifests -n gitops reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
Avec la CLI `flux`, l'équivalent est `flux reconcile kustomization production -n gitops --with-source`.
:::

## Vérification

```bash
# Statut global
kubectl get gitrepositories,kustomizations -A

# Détail d'une erreur de réconciliation
kubectl describe kustomization production -n gitops
```

:::warning
Si la synchronisation échoue, vérifiez :
- l'accessibilité du dépôt Git depuis le cluster ;
- la validité des manifestes YAML du dépôt (un fichier invalide bloque la réconciliation) ;
- les events et les logs des contrôleurs Flux (`kubectl logs` sur les pods `source-controller` et `kustomize-controller`).
:::

## Pour aller plus loin

- [Flux CD](../plugins/fluxcd.md) : détail de l'addon
- [Comment déployer un Ingress avec TLS](./deploy-ingress-tls.md) : exposer vos applications déployées par Flux
