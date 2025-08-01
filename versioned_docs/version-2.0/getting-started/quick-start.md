---
sidebar_position: 3
title: Démarrage rapide
---

# 🚀 Démarrage rapide avec Hikube

Bienvenue ! Ce guide vous accompagne pas à pas pour créer votre premier projet sur Hikube. À la fin de ce tutoriel, vous aurez déployé votre première application dans un environnement complètement sécurisé.

---

## Prérequis

### **Accès à la plateforme**
Si vous n'avez pas encore de compte Hikube, contactez notre équipe à **sales@hidora.io** pour obtenir vos accès.

### **Installation des outils requis**

#### **kubectl** (obligatoire)

**macOS**
```bash
# Homebrew
brew install kubectl
```

**Linux**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y kubectl

# RHEL/CentOS/Fedora
sudo dnf install kubectl
# ou pour les versions plus anciennes
sudo yum install kubectl

# Alpine Linux
sudo apk add kubectl
```

**Windows**
```powershell
# Chocolatey
choco install kubernetes-cli

# winget
winget install Kubernetes.kubectl
```

📖 **Documentation officielle** : [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

#### **kubelogin** (requis pour l'authentification OIDC)

**macOS**
```bash
# Homebrew
brew install Azure/kubelogin/kubelogin
```

**Linux**
```bash
# Installation manuelle (toutes distributions)
curl -LO "https://github.com/Azure/kubelogin/releases/latest/download/kubelogin-linux-amd64.zip"
unzip kubelogin-linux-amd64.zip && sudo mv bin/linux_amd64/kubelogin /usr/local/bin/
rm -rf kubelogin-linux-amd64.zip bin/
```

**Windows**
```powershell
# Chocolatey
choco install kubelogin

# winget
winget install Microsoft.Azure.Kubelogin
```

### **Outils optionnels recommandés**

Pour une meilleure expérience de gestion Kubernetes :

- **[Lens](https://k8slens.dev/)** - Interface graphique moderne pour Kubernetes
- **[K9s](https://k9scli.io/)** - Interface terminal interactive pour Kubernetes  
- **[Helm](https://helm.sh/)** - Gestionnaire de paquets pour Kubernetes
- **[kubectx + kubens](https://github.com/ahmetb/kubectx)** - Outils pour changer rapidement de contexte et namespace

---

## Étape 1 : Accéder à votre Tenant

### **Configuration kubectl**
1. **Récupérez votre kubeconfig** auprès de votre administrateur Hikube
2. **Configurez kubectl** avec votre fichier de configuration :
   ```bash
   # Option 1: Variable d'environnement
   export KUBECONFIG=/path/to/your/hikube-kubeconfig.yaml
   
   # Option 2: Copie dans le répertoire par défaut
   cp hikube-kubeconfig.yaml ~/.kube/config
   ```
3. **Vérifiez la connexion** :
   ```bash
   kubectl cluster-info
   kubectl get pods
   ```

:::tip Configuration multiple
Vous pouvez gérer plusieurs clusters avec `kubectl config get-contexts` et `kubectl config use-context <context-name>`
:::

### **Vérification de votre tenant**
Votre tenant est votre **espace de travail isolé**. Vérifiez que vous êtes dans le bon namespace :
```bash
kubectl config current-context
kubectl get namespaces
```

---

## Étape 2 : Créer votre premier Cluster Kubernetes

### **Déploiement via kubectl**
1. **Créez un fichier YAML** pour votre cluster Kubernetes
2. **Personnalisez la configuration** selon vos besoins
3. **Déployez avec kubectl** :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: kube
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride: {}
    fluxcd:
      enabled: false
      valuesOverride: {}
    ingressNginx:
      enabled: true
      hosts:
      - mon-app.example.com
      valuesOverride: {}
    monitoringAgents:
      enabled: false
      valuesOverride: {}
    verticalPodAutoscaler:
      valuesOverride: {}
  controlPlane:
    replicas: 3
  host: k8s-api.example.com
  kamajiControlPlane:
    addons:
      konnectivity:
        server:
          resources: {}
          resourcesPreset: small
    apiServer:
      resources: {}
      resourcesPreset: small
    controllerManager:
      resources: {}
      resourcesPreset: small
    scheduler:
      resources: {}
      resourcesPreset: small
  nodeGroups:
    md0:
      ephemeralStorage: 30Gi
      instanceType: u1.large
      maxReplicas: 6
      minReplicas: 3
      resources:
        cpu: ""
        memory: ""
      roles:
      - ingress-nginx
  storageClass: replicated

```

4. **Déployez le cluster** :
   ```bash
   # Sauvegardez la configuration dans un fichier
   kubectl apply -f my-kubernetes-cluster.yaml
   ```

### **⏳ Suivi du déploiement**
- Le cluster sera prêt en **1-3 minutes**
- Suivez l'état avec kubectl :
  ```bash
  kubectl get kubernetes
  kubectl describe kubernetes kube
  ```
- Status "Ready" = Cluster opérationnel ✅

---

## Configuration DNS

### **Enregistrements DNS requis**

Pour que votre cluster soit accessible, vous devez créer les enregistrements DNS suivants chez votre fournisseur DNS :

```bash
# Récupérez l'IP publique de votre cluster
kubectl get kubernetes kube -o jsonpath='{.status.controlPlaneEndpoint}' 

# Créez les enregistrements DNS (chez votre fournisseur) :
# Type A : k8s-api.example.com → <IP_CLUSTER>
# Type A : mon-app.example.com → <IP_CLUSTER>
```

:::tip Configuration DNS
- **k8s-api.example.com** : Point d'accès à l'API Kubernetes
- **mon-app.example.com** : Domaine pour vos applications via Ingress
- Remplacez `example.com` par votre vraie zone DNS
:::

---

## Étape 3 : Récupérer le Kubeconfig

### **Extraction du kubeconfig du cluster**
Une fois votre cluster déployé et prêt, récupérez ses credentials avec cette commande :

```bash
# Récupérez le kubeconfig du cluster créé (adaptez les noms)
kubectl get secret -n tenant-<name> kubernetes-<clusterName>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf

# Exemple concret :
kubectl get secret -n tenant-mycompany kubernetes-kube-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf
```

:::info Variables à personnaliser
- `<name>` : Remplacez par le nom de votre tenant (ex: `mycompany`)
- `<clusterName>` : Remplacez par le nom de votre cluster (ex: `kube` selon la config YAML)
:::

### **Configuration locale**
```bash
# Utilisez le kubeconfig du nouveau cluster
export KUBECONFIG=./admin.conf

# Vérifiez la connexion au cluster créé
kubectl get nodes

# Résultat attendu :
# NAME                STATUS   ROLES           AGE   VERSION
# cluster-node-1      Ready    control-plane   2m    v1.28.x
# cluster-node-2      Ready    worker          2m    v1.28.x
# cluster-node-3      Ready    worker          2m    v1.28.x
```

:::success Félicitations !
Votre cluster Kubernetes est maintenant opérationnel avec **haute disponibilité native** !
:::

---

## ✅ Résultat : Vous avez créé...

**Un cluster Kubernetes haute disponibilité**
**Un environnement totalement sécurisé** (isolation réseau)  
**Un stockage résilient** (réplication automatique)
---

## Besoin d'aide ?

### **Documentation**
- **[FAQ](../resources/faq.md)** → Réponses aux questions courantes
- **[Troubleshooting](../resources/troubleshooting.md)** → Solutions aux problèmes

### **Support**
- **Email :** support@hidora.io
- **Documentation :** Cette plateforme
- **Communauté :** Forums et chat en temps réel

:::tip Bravo ! 🎊
Vous venez de faire vos premiers pas sur Hikube. Votre infrastructure est maintenant prête à accueillir tous vos projets les plus ambitieux !
:::

---

**Prochaine étape recommandée :** [📖 Concepts clés](./concepts.md) → Maîtrisez les fondamentaux d'Hikube 