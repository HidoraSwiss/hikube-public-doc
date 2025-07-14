---
sidebar_position: 2
title: Démarrage rapide
---

# 🚀 Démarrage rapide avec Hikube

Bienvenue ! Ce guide vous accompagne pas à pas pour créer votre premier projet sur Hikube en **moins de 10 minutes**. À la fin de ce tutoriel, vous aurez déployé votre première application dans un environnement complètement sécurisé.

---

## ⚡ Prérequis (2 minutes)

### **📧 Accès à la plateforme**
Si vous n'avez pas encore de compte Hikube, contactez notre équipe à **sales@hidora.io** pour obtenir vos accès.

### **🛠️ Outils recommandés**
```bash
# Installation rapide des outils essentiels
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# Optionnel : Interface graphique Lens
# https://k8slens.dev/
```

---

## 🎯 Étape 1 : Accéder à votre Tenant (1 minute)

### **Connexion Web**
1. Rendez-vous sur l'interface Hikube fournie par votre administrateur
2. Connectez-vous avec vos identifiants
3. Vous arrivez sur le **tableau de bord principal**

:::tip Interface intuitive
L'interface Hikube est conçue pour être simple. Chaque élément a une aide contextuelle disponible en survolant les icônes ℹ️
:::

### **Vérification de votre tenant**
Votre tenant est votre **espace de travail isolé**. Vérifiez que vous êtes dans le bon tenant via le sélecteur en haut à droite.

---

## 🏗️ Étape 2 : Créer votre premier Cluster Kubernetes (3 minutes)

### **Déploiement via l'interface**
1. **Accédez au Catalog** → Cliquez sur l'onglet "Catalog"
2. **Sélectionnez Kubernetes** → Trouvez l'application "Kubernetes"
3. **Configurez votre cluster** :

```yaml
# Configuration recommandée pour démarrer
metadata:
  name: my-first-cluster
spec:
  replicas: 3              # 3 nœuds pour la haute disponibilité
  resources:
    requests:
      cpu: "1"
      memory: "4Gi"
  networking:
    cni: cilium            # Réseau sécurisé par défaut
  monitoring:
    enabled: true          # Observabilité intégrée
```

4. **Déployez** → Cliquez sur "Create Application"

### **⏳ Suivi du déploiement**
- Le cluster sera prêt en **2-3 minutes**
- Suivez l'état dans l'onglet "Applications"
- Status "Ready" = Cluster opérationnel ✅

---

## 🔑 Étape 3 : Récupérer le Kubeconfig (1 minute)

### **Accès aux credentials**
1. **Applications** → Cliquez sur votre cluster
2. **Secrets** → Trouvez la section "Kubeconfig"
3. **Téléchargez** le fichier kubeconfig

### **Configuration locale**
```bash
# Sauvegardez votre kubeconfig
export KUBECONFIG=/path/to/your/kubeconfig.yaml

# Vérifiez la connexion
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

## 🚀 Étape 4 : Déployer votre première application (3 minutes)

### **Application de démonstration**
Déployons une application web simple mais complète :

```yaml
# demo-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-web-app
  labels:
    app: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: demo-service
spec:
  selector:
    app: demo
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### **Déploiement**
```bash
# Appliquez la configuration
kubectl apply -f demo-app.yaml

# Vérifiez le déploiement
kubectl get pods,svc

# Attendez que les pods soient "Running"
kubectl wait --for=condition=Ready pod -l app=demo --timeout=60s
```

### **Accès à votre application**
```bash
# Obtenez l'IP externe
kubectl get service demo-service

# Testez votre application
curl http://<EXTERNAL-IP>
```

:::info Load Balancer automatique
Hikube configure automatiquement un load balancer avec **SSL/TLS** et **protection DDoS** pour vos services !
:::

---

## 🎉 Étape 5 : Exploration et nettoyage (optionnel)

### **🔍 Explorez votre infrastructure**
```bash
# Monitoring intégré
kubectl get pods -n monitoring

# Stockage persistant
kubectl get pv,pvc

# Réseau et sécurité
kubectl get networkpolicies
```

### **🧹 Nettoyage (si souhaité)**
```bash
# Supprimez l'application de test
kubectl delete -f demo-app.yaml

# Le cluster reste opérationnel pour vos vrais projets
```

---

## ✅ Résultat : Vous avez créé...

🎯 **Un cluster Kubernetes haute disponibilité** (3 nœuds)  
🔒 **Un environnement totalement sécurisé** (isolation réseau)  
📊 **Un monitoring intégré** (métriques et logs)  
🚀 **Une application web accessible** (avec load balancer)  
💾 **Un stockage résilient** (réplication automatique)

**Le tout en moins de 10 minutes !** ⏱️

---

## 🔄 Prochaines étapes recommandées

### **📚 Approfondissement**
1. **[Concepts clés](./concepts.md)** → Comprenez l'architecture Hikube
2. **[Kubernetes](../services/kubernetes/)** → Maîtrisez tous les paramètres
3. **[Virtual Machines](../services/compute/virtual-machines/)** → Ajoutez des VMs à votre infrastructure

### **🛠️ Cas d'usage avancés**
- **[Storage](../services/storage/)** → Gestion des données persistantes
- **[Networking](../services/networking/)** → Connectivité avancée
- **[Monitoring](../resources/troubleshooting.md)** → Observabilité complète

### **⚡ Automatisation**
- **[Terraform](../tools/terraform.md)** → Infrastructure as Code
- **[CLI](../tools/cli.md)** → Automatisation des tâches

---

## 🆘 Besoin d'aide ?

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