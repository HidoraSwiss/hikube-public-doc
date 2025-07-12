---
title: Déployer Kubernetes en 5 minutes
---

# Déployer Kubernetes en 5 minutes

Ce guide vous accompagne pour déployer votre premier cluster Kubernetes sur Hikube en moins de 5 minutes.

## Prérequis

- Accès à un tenant Hikube
- kubectl configuré avec votre kubeconfig
- [Helm](https://helm.sh/) (optionnel, pour les charts)

## Étape 1 : Créer le cluster Kubernetes

### Via kubectl

```yaml
# kubernetes.yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: mon-premier-cluster
spec:
  host: "k8s.mon-domaine.org"
  controlPlane:
    replicas: 2
  storageClass: "replicated"
  nodeGroups:
    md0:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "cx1.medium"
      ephemeralStorage: "20Gi"
      roles: ["ingress-nginx"]
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts: ["mon-domaine.org"]
```

```bash
kubectl apply -f kubernetes.yaml
```

### Via interface web

1. Allez dans l'onglet **"Catalog"**
2. Sélectionnez l'application **"Kubernetes"**
3. Configurez les paramètres :
   - **Name** : `mon-premier-cluster`
   - **Host** : `k8s.mon-domaine.org`
   - **Control Plane Replicas** : `2`
   - **Node Group** : `md0` avec 1-3 réplicas
4. Cliquez sur **"Deploy"**

## Étape 2 : Vérifier le déploiement

```bash
# Vérifier l'état du cluster
kubectl get kubernetes

# Voir les détails
kubectl describe kubernetes mon-premier-cluster

# Vérifier les pods
kubectl get pods -l app=kubernetes

# Vérifier les nodes
kubectl get nodes
```

## Étape 3 : Récupérer le kubeconfig

```bash
# Obtenir le kubeconfig du nouveau cluster
kubectl get secret kubernetes-mon-premier-cluster -o yaml

# Décoder le kubeconfig
echo "VOTRE_KUBECONFIG_BASE64" | base64 -d > cluster-kubeconfig.yaml

# Utiliser le nouveau contexte
export KUBECONFIG=cluster-kubeconfig.yaml
kubectl config current-context
```

## Étape 4 : Tester le cluster

### Vérifier les composants

```bash
# Vérifier les namespaces
kubectl get namespaces

# Vérifier les pods système
kubectl get pods --all-namespaces

# Vérifier les services
kubectl get services --all-namespaces

# Vérifier les nodes
kubectl get nodes -o wide
```

### Tester avec une application simple

```bash
# Créer un namespace de test
kubectl create namespace test-app

# Déployer une application nginx
kubectl run nginx --image=nginx --port=80 -n test-app

# Exposer le service
kubectl expose pod nginx --port=80 --target-port=80 -n test-app

# Vérifier le déploiement
kubectl get pods,services -n test-app
```

## Étape 5 : Configurer l'ingress

### Créer un ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
  namespace: test-app
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - test.mon-domaine.org
    secretName: test-tls
  rules:
  - host: test.mon-domaine.org
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx
            port:
              number: 80
```

```bash
kubectl apply -f ingress.yaml -n test-app
```

### Vérifier l'ingress

```bash
# Vérifier l'état de l'ingress
kubectl get ingress -n test-app

# Vérifier les certificats
kubectl get certificates -n test-app

# Tester l'accès
curl -I https://test.mon-domaine.org
```

## Étape 6 : Déployer avec Helm

### Installer Helm

```bash
# Installer Helm
curl https://get.helm.sh/helm-v3.15.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Vérifier l'installation
helm version
```

### Déployer une application avec Helm

```bash
# Ajouter un repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Déployer WordPress
helm install wordpress bitnami/wordpress \
  --namespace test-app \
  --set wordpressUsername=admin \
  --set wordpressPassword=password123 \
  --set wordpressEmail=admin@example.com \
  --set wordpressFirstName=Admin \
  --set wordpressLastName=User \
  --set wordpressBlogName="Mon Blog"

# Vérifier le déploiement
helm list -n test-app
kubectl get pods -n test-app
```

## Étape 7 : Monitoring et métriques

### Vérifier les métriques

```bash
# Vérifier les métriques des nodes
kubectl top nodes

# Vérifier les métriques des pods
kubectl top pods --all-namespaces

# Vérifier l'utilisation des ressources
kubectl describe nodes
```

### Configurer Prometheus (optionnel)

```bash
# Ajouter le repository Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Installer Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.enabled=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

## Étape 8 : Scaling et autoscaling

### Configurer l'autoscaling

```bash
# Créer un HPA (Horizontal Pod Autoscaler)
kubectl autoscale deployment nginx --cpu-percent=50 --min=1 --max=10 -n test-app

# Vérifier l'HPA
kubectl get hpa -n test-app

# Simuler une charge
kubectl run load-generator --image=busybox --rm -it --restart=Never -- /bin/sh -c "while true; do wget -qO- http://nginx; done"
```

### Scaling manuel

```bash
# Scale up
kubectl scale deployment nginx --replicas=5 -n test-app

# Scale down
kubectl scale deployment nginx --replicas=1 -n test-app

# Vérifier le scaling
kubectl get pods -n test-app
```

## Étape 9 : Backup et restauration

### Sauvegarder les ressources

```bash
# Sauvegarder tous les objets d'un namespace
kubectl get all -n test-app -o yaml > backup-test-app.yaml

# Sauvegarder les secrets
kubectl get secrets -n test-app -o yaml > backup-secrets.yaml

# Sauvegarder les configmaps
kubectl get configmaps -n test-app -o yaml > backup-configmaps.yaml
```

### Restaurer les ressources

```bash
# Restaurer un namespace
kubectl apply -f backup-test-app.yaml

# Restaurer les secrets
kubectl apply -f backup-secrets.yaml

# Restaurer les configmaps
kubectl apply -f backup-configmaps.yaml
```

## Félicitations ! 🎉

Vous avez déployé et configuré votre premier cluster Kubernetes sur Hikube !

## Prochaines étapes

- **[Référence API](api-reference.md)** : Découvrez tous les paramètres
- **[Tutoriels](tutorials/)** : Guides avancés
- **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
- **[CI/CD](tutorials/cicd.md)** : Configurer GitLab CI/CD
- **[Monitoring](tutorials/monitoring.md)** : Configurer Grafana et Prometheus
- **[Sécurité](tutorials/security.md)** : Bonnes pratiques de sécurité 