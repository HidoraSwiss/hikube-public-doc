---
sidebar_position: 1
title: Bien démarrer
slug: /
---

Bienvenue sur **Hikube** ! Cette documentation vous guidera à travers les étapes essentielles pour commencer à utiliser la plateforme et gérer vos ressources (tenants, clusters Kubernetes, machines virtuelles et applications).

---

## Accès à la Plateforme

Deux méthodes sont disponibles pour vous connecter à votre **tenant** Hikube :

### **1. Via l'Interface Web**

- Accédez au **Dashboard Hikube** : [https://dashboard.hikube.cloud/](https://dashboard.hikube.cloud/)
- Connectez-vous avec vos identifiants.
- Une fois connecté, vous pourrez **provisionner et gérer vos ressources** (applications, Kubernetes, VMs) via une interface graphique.

### **2. Via Kubeconfig**

Pour une gestion avancée, vous pouvez utiliser le fichier **Kubeconfig** fourni.

#### **Installation des outils nécessaires :**

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [kubelogin](https://github.com/int128/kubelogin)
- [Lens](https://k8slens.dev/) *(optionnel pour une interface Desktop)*

Une fois ces outils installés, vous pouvez interagir avec votre tenant directement depuis votre terminal.

---

## Organisation des Tenants

Hikube repose sur un **système de tenants** permettant d'organiser et d'isoler vos ressources.

### **Création de Tenants**

Il est recommandé de structurer votre organisation en plusieurs tenants.
Pour créer un **tenant**, utilisez l'interface web :

1. Rendez-vous dans **l'onglet "Catalog"**.
2. Sélectionnez **l'application "Tenant"**.
3. Définissez les paramètres souhaités (**host, ingress, isolation...**).

Une fois vos tenants créés, vous pouvez y accéder :

- **Depuis l'interface web** (menu déroulant en haut à droite).
- **Via leurs Kubeconfigs respectifs**, disponibles dans **l'onglet "Applications"** → cliquez sur le tenant souhaité → récupérez le fichier **dans la section "Secrets"**.

Pour plus d'informations sur la gestion et la création des Tenants, n'hésitez pas à aller consulter **[notre page dédiée aux Tenants.](./api/applications/tenants.md)**

---

## Déploiement d'Applications Kubernetes

Il est déconseillé d'installer des applications directement sur les clusters des tenants.  
**Bonne pratique** :  
🔹 **Créez un cluster Kubernetes à l’intérieur du tenant** (via l’interface web ou en CLI).  
🔹 **Installez vos applications sur ce nouveau cluster**, plutôt que sur celui du tenant directement.

Pour plus d'informations sur le provisionnement de Kubernetes, consultez la page **[Kubernetes](./api/applications/kuberneteses.md)**.

---

## Création d’une Machine Virtuelle (VM)

### **Étapes de Création**

Une VM sur Hikube repose sur deux ressources essentielles :

1. **VMDisk** – Définit l’image disque à utiliser.
2. **VMInstance** – Utilise un VMDisk pour démarrer la VM.

### **Procédure**

1. **Créer un VMDisk**
   - Sélectionnez l'application **"VMDisk"** dans le **Catalog**.
   - Utilisez une image cloud ISO, par exemple :

     ```yaml
     https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
     ```

   - Configurez la taille du disque et la **StorageClass** (`replicated` ou `local`).

2. **Créer une VMInstance**
   - Sélectionnez l'application **"VMInstance"**.
   - Associez-la au **VMDisk** précédemment créé.
   - Configurez la machine (RAM, CPU, réseau, etc.).
   - Utilisez **cloud-init** pour automatiser la configuration de la VM :
     - Documentation : [Cloud-Init](https://cloudinit.readthedocs.io/en/latest/)

Pour plus d'informations sur le provisionnement de Kubernetes, consultez les pages **[VMDisks](./api/applications/vmdisks.md)** et **[VMInstances](./api/applications/vminstances.md)**.

---

## Récupérer les Kubeconfigs des Tenants

Chaque tenant a un Kubeconfig unique, permettant d'y accéder via **kubectl**.  
Pour récupérer un **Kubeconfig** :

1. **Accédez à l'interface web**.
2. **Ouvrez l'onglet "Applications"**.
3. **Sélectionnez votre tenant**.
4. **Récupérez le Kubeconfig** dans la section **"Secrets"**.

Une fois le Kubeconfig récupéré, utilisez la commande suivante pour l’ajouter :

```sh
export KUBECONFIG=/chemin/vers/kubeconfig.yaml
kubectl get nodes
```

---

## Recommandations Générales

✔ **Isoler les environnements** : Utilisez plusieurs tenants pour organiser vos ressources proprement.  
✔ **Créer un Kubernetes par besoin** : Ne pas installer les applications sur les clusters des tenants directement.  
✔ **Utiliser Cloud-Init pour les VMs** : Simplifie l’automatisation de l’installation et la configuration.

---

Bienvenue sur **Hikube** ! 🎉 Si vous avez des questions ou besoin d’aide, consultez la documentation ou contactez notre support.
