---
title: "Comment deployer avec Flux (GitOps)"
---

# Comment deployer avec Flux (GitOps)

Ce guide explique comment activer et configurer FluxCD sur un cluster Kubernetes Hikube pour deployer vos applications selon l'approche GitOps : un depot Git comme source de verite pour l'etat de votre cluster.

## Prerequis

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Un depot Git accessible contenant vos manifestes Kubernetes
- Le kubeconfig du cluster enfant recupere

## Etapes

### 1. Preparer le depot Git

Organisez votre depot Git avec une structure de repertoires contenant vos manifestes Kubernetes :

```
k8s-manifests/
├── namespaces/
│   └── production.yaml
├── apps/
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── backend/
│       ├── deployment.yaml
│       └── service.yaml
└── config/
    └── configmaps.yaml
```

:::tip
Flux synchronise tous les manifestes YAML trouves dans le repertoire cible et ses sous-repertoires. Organisez vos fichiers de maniere logique pour faciliter la maintenance.
:::

### 2. Activer l'addon FluxCD

Modifiez la configuration de votre cluster pour activer FluxCD avec l'URL de votre depot :

```yaml title="cluster-gitops.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
```

:::note
Pour les depots Git prives, configurez l'authentification SSH ou par token dans le cluster enfant apres le deploiement de Flux.
:::

### 3. Appliquer la configuration du cluster

```bash
kubectl apply -f cluster-gitops.yaml

# Attendre que le cluster et les addons soient prets
kubectl get kubernetes my-cluster -w
```

### 4. Observer la synchronisation

Verifiez que Flux synchronise correctement votre depot Git :

```bash
export KUBECONFIG=cluster-admin.yaml

# Verifier le GitRepository
kubectl get gitrepositories -A

# Verifier les Kustomizations (reconciliation Flux)
kubectl get kustomizations -A

# Details de la synchronisation
kubectl describe gitrepository -A

# Verifier les pods Flux
kubectl get pods -n flux-system
```

**Resultat attendu :**

```console
NAMESPACE     NAME            URL                                          READY   STATUS                  AGE
flux-system   flux-system     https://github.com/company/k8s-manifests    True    Fetched revision: main   5m
```

```console
NAMESPACE     NAME            READY   STATUS                  AGE
flux-system   flux-system     True    Applied revision: main   5m
```

### 5. Deployer une application via Git

Pour deployer ou mettre a jour une application, poussez simplement les manifestes dans votre depot Git :

```yaml title="apps/my-app/deployment.yaml"
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
# Depuis votre depot local
git add apps/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux detecte automatiquement les changements et applique les manifestes dans le cluster :

```bash
# Observer la reconciliation
kubectl get kustomizations -A -w

# Verifier que l'application est deployee
kubectl get pods -l app=my-app
```

:::tip
Par defaut, Flux synchronise le depot toutes les minutes. Pour forcer une reconciliation immediate :
```bash
kubectl annotate --overwrite gitrepository flux-system -n flux-system reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
:::

## Verification

Validez que le pipeline GitOps fonctionne de bout en bout :

```bash
# Statut global de Flux
kubectl get gitrepositories,kustomizations -A

# Logs de Flux en cas de probleme
kubectl logs -n flux-system deploy/source-controller --tail=30
kubectl logs -n flux-system deploy/kustomize-controller --tail=30

# Verifier les resources deployees par Flux
kubectl get all -l kustomize.toolkit.fluxcd.io/name=flux-system
```

:::warning
Si la synchronisation echoue, verifiez :
- L'accessibilite du depot Git depuis le cluster
- La validite des manifestes YAML dans le depot (un fichier invalide bloque la reconciliation)
- Les logs des controlleurs Flux pour identifier l'erreur precise
:::

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Configuration de l'addon `fluxcd`
- [Concepts](../concepts.md) -- Architecture du cluster et addons
- [Comment deployer un Ingress avec TLS](./deploy-ingress-tls.md) -- Exposer vos applications deployees par Flux
