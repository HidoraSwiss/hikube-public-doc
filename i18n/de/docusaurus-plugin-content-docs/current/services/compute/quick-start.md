---
sidebar_position: 2
title: Schnellstart
---

# Créer votre première Machine Virtuelle

Dieser Leitfaden begleitet Sie dans la création de votre première machine virtuelle Hikube en **5 minutes** chrono !

---

## Objectif

À la fin de ce guide, vous aurez :

- Une machine virtuelle Ubuntu fonctionnelle
- Accès SSH configuré
- Connectivité réseau opérationnelle
- Stockage persistant attaché

---

## Voraussetzungen

Bevor Sie beginnen, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant

---

## 🚀 Étape 1 : Créer le Disque VM (2 minutes)

### **Préparez le fichier manifest**

Erstellen Sie eine Datei `vm-disk.yaml` avec une image Ubuntu Cloud :

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
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

**Erwartetes Ergebnis :**

```
NAME          STATUS   SIZE   STORAGECLASS   AGE
disk-example  Ready    20Gi   replicated     90s
```

---

## Étape 2 : Créer la Machine Virtuelle (2 minutes)

### **Générez votre clé SSH**

Si vous n'avez pas encore de clé SSH :

```bash
# Générer une clé SSH Ed25519 (moderne et sécurisée)
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm

# Afficher la clé publique
cat ~/.ssh/hikube-vm.pub
```

### **Préparez le manifest VM**

Erstellen Sie eine Datei `vm-instance.yaml` :

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: PortList
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

:::warning Achtung
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

## Comprendre les Méthodes d'Exposition

### **PortList vs WholeIP : Quelle différence ?**

Hikube bietet deux méthodes d'exposition externe, chacune avec ses spécificités :

#### **PortList (Recommandé)**

- **Firewall contrôlé** : Seuls les ports spécifiés dans `externalPorts` sont accessibles
- **Sécurité renforcée** : Protection automatique contre les accès non autorisés
- **Usage** : Production, environnements sécurisés
- **Configuration** : `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

#### **WholeIP**

- **Accès complet** : Tous les ports de la VM sont directement accessibles
- **Pas de firewall** : Aucune protection au niveau réseau configurée via le service
- **Usage** : Développement, accès administratif complet
- **Configuration** : `externalMethod: WholeIP` (pas besoin d'`externalPorts`)

:::tip Choix de la Méthode

- **Production/Sécurisé** → `PortList` avec ports spécifiques
- **Développement/Debug** → `WholeIP` pour un accès complet
:::

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

### **Méthodes d'accès**

#### **Option 1 : SSH Direct**

```bash
# SSH via virtctl (avec clé personnalisée)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-example
# ou SSH via l'IP public ( avec clé personalisée)
ssh -i ~/.ssh/hikube-vm ubuntu@public-ip
```

#### **Option 2 : Console Série (toujours disponible)**

```bash
# Accès console directe
virtctl console vm-example
```

#### **Option 3 : Interface VNC**

```bash
# Accès graphique
virtctl vnc vm-example
```

---

## 🎉 Félicitations

Votre machine virtuelle Hikube est **opérationnelle** !

### **Ce que vous avez accompli :**

- **VM Ubuntu** déployée avec 4 vCPU / 16 GB RAM
- **Stockage persistant** de 20 GB répliqué
- **Accès SSH** sécurisé configuré
- **Connectivité externe** aktivierte
- **Infrastructure résiliente** avec séparation compute/stockage

---

## Bereinigung (Optionnel)

Si vous voulez supprimer les ressources créées :

```bash
# Supprimer la VM (attention !)
kubectl delete vminstance vm-example

# Supprimer le disque (attention !)
kubectl delete vmdisk disk-example
```

:::warning Suppression Irréversible
La suppression des VMs et disques est **irréversible**. Stellen Sie sicher, dass Sie Folgendes haben sauvegardé toutes les données importantes avant de procéder.
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

**💡 Wichtige Punkte à Retenir :**

- Vos **données sont toujours sûres** grâce à la réplication 3 datacenters
- Votre VM peut être **relocalisée automatiquement** en cas de panne nœud
- L'**isolation totale** garantit la sécurité entre tenants
