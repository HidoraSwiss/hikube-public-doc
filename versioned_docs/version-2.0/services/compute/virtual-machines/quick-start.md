---
sidebar_position: 2
title: Démarrage Rapide - VM
---

# Créer votre première Machine Virtuelle

Ce guide vous accompagne dans la création de votre première machine virtuelle Hikube en **5 minutes** chrono ! 🚀

---

## 🎯 Objectif

À la fin de ce guide, vous aurez :
- ✅ Une machine virtuelle Ubuntu fonctionnelle
- ✅ Accès SSH configuré
- ✅ Connectivité réseau opérationnelle
- ✅ Stockage persistant attaché

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ **kubectl** configuré avec votre kubeconfig Hikube
- ✅ **Droits administrateur** sur votre tenant

---

## 🚀 Étape 1 : Créer le Disque VM (2 minutes)

### **Préparez le fichier manifest**

Créez un fichier `vm-disk.yaml` avec une image Ubuntu Cloud :

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/oracular/current/oracular-server-cloudimg-amd64.img
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

### **Déployez le disque**

```bash
# Créer le disque VM
kubectl apply -f vm-disk.yaml

# Vérifier le statut (peut prendre 1-2 minutes)
kubectl get vmdisk disk-example -w
```

**Résultat attendu :**
```
NAME          STATUS   SIZE   STORAGECLASS   AGE
disk-example  Ready    20Gi   replicated     90s
```

---

## 🖥️ Étape 2 : Créer la Machine Virtuelle (2 minutes)

### **Générez votre clé SSH**

Si vous n'avez pas encore de clé SSH :

```bash
# Générer une clé SSH (optionnel)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/hikube-vm

# Afficher la clé publique
cat ~/.ssh/hikube-vm.pub
```

### **Préparez le manifest VM**

Créez un fichier `vm-instance.yaml` :

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: WholeIP
  externalPorts:
    - 22
  running: true
  instanceType: u1.xlarge
  instanceProfile: "ubuntu"
  disks:
    - name: disk-example #Spécifier le nom de votre disque
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - votre-clé-publique-ici
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

:::warning Attention
Remplacez `votre-clé-publique-ici` par votre vraie clé SSH publique !
:::

### **Déployez la VM**

```bash
# Créer la machine virtuelle
kubectl apply -f vm-instance.yaml

# Suivre le démarrage
kubectl get vminstance vm-example -w
```

---

## 🔌 Étape 3 : Accéder à votre VM (1 minute)

### **Installation de virtctl**

Si vous n'avez pas encore `virtctl` installé :

```bash
# Installation de virtctl
export VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
chmod +x virtctl
sudo mv virtctl /usr/local/bin/

# Vérifier l'installation
virtctl version
```
### **Vérification du déploiement**

```bash
# Status de la VM
kubectl get vminstance vm-example

# Détails complets
kubectl describe vminstance vm-example
```

### **Méthodes d'accès**

#### **Option 1 : Console Série (toujours disponible)**
```bash
# Accès console directe
virtctl console vm-example
```

#### **Option 2 : Interface VNC**
```bash
# Accès graphique
virtctl vnc vm-example
```

#### **Option 3 : SSH Direct**
```bash
# SSH via virtctl (avec clé personnalisée)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-example

---

## ✅ Étape 4 : Validation (30 secondes)

### **Tests de fonctionnement**

Une fois connecté à votre VM, testez :

```bash
# Information système
hostnamectl
uname -a

# Ressources allouées
lscpu
free -h
df -h

# Connectivité réseau
ping -c 3 google.com
curl -I https://httpbin.org/ip
```

### **Résultat attendu**
```bash
ubuntu@vm-example:~$ free -h
               total        used        free      shared
Mem:            3.8Gi       180Mi       3.4Gi       1.0Mi
```

---

## 🎉 Félicitations ! 

Votre machine virtuelle Hikube est **opérationnelle** ! 🎊

### **Ce que vous avez accompli :**
- ✅ **VM Ubuntu** déployée avec 4 vCPU / 16 GB RAM
- ✅ **Stockage persistant** de 20 GB répliqué
- ✅ **Accès SSH** sécurisé configuré
- ✅ **Connectivité externe** activée
- ✅ **Infrastructure résiliente** avec séparation compute/stockage

---

## 🗑️ Nettoyage (Optionnel)

Si vous voulez supprimer les ressources créées :

```bash
# Supprimer la VM (attention !)
kubectl delete vminstance vm-example

# Supprimer le disque (attention !)
kubectl delete vmdisk disk-example
```

:::warning Suppression Irréversible
La suppression des VMs et disques est **irréversible**. Assurez-vous d'avoir sauvegardé toutes les données importantes avant de procéder.
:::

---

## 🎯 Prochaines Étapes

<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

**📚 Configuration Avancée**  
→ [API Reference complète](./api-reference.md)

**📖 Architecture Technique**  
→ [Comprendre le fonctionnement](./overview.md)

</div>

---

:::tip Astuces Pro
- Utilisez `virtctl` pour une gestion simplifiée des VMs
- Configurez des **snapshots** réguliers pour sauvegarder vos VMs
- Explorez les **séries d'instances** pour optimiser performances/coûts
- La classe de stockage `replicated` garantit la haute disponibilité
:::

:::info Dépannage
Si votre VM ne démarre pas, vérifiez :
1. Le statut du VMDisk avec `kubectl get vmdisk`
2. Les events avec `kubectl get events`
3. Les logs avec `kubectl logs -l kubevirt.io=vm-example`
:::

---

**💡 Points Clés à Retenir :**
- Vos **données sont toujours sûres** grâce à la réplication DRBD
- Votre VM peut être **relocalisée automatiquement** en cas de panne nœud
- L'**isolation totale** garantit la sécurité entre tenants 