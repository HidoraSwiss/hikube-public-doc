---
title: "Comment installer une VM Windows"
---

# Comment installer une VM Windows

L'installation d'une VM Windows Server sur Hikube nécessite plusieurs étapes manuelles : préparer les disques ISO, créer la VM, installer Windows via VNC puis charger les drivers virtio. Ce guide détaille l'ensemble du processus.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- **virtctl** installé pour l'accès VNC
- Licence ou évaluation **Windows Server 2025** (l'ISO d'évaluation est utilisée dans ce guide)
- Espace de stockage suffisant (environ 70 Gi au total)

## Étapes

### 1. Créer le disque ISO Windows Server 2025

Créez un VMDisk de type optique contenant l'ISO d'installation Windows Server :

```yaml title="win-iso-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win2k25-iso
spec:
  source:
    http:
      url: https://software-static.download.prss.microsoft.com/dbazure/888969d5-f34g-4e03-ac9d-1f9786c66749/SERVER_EVAL_x64FRE_en-us.iso
  optical: true
  storage: 7Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-iso-disk.yaml
```

### 2. Créer le disque ISO des drivers virtio

Les drivers virtio sont indispensables pour que Windows reconnaisse les disques et le réseau dans un environnement KubeVirt :

```yaml title="virtio-drivers-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: virtio-drivers
spec:
  source:
    http:
      url: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
  optical: true
  storage: 1Gi
  storageClass: replicated
```

```bash
kubectl apply -f virtio-drivers-disk.yaml
```

### 3. Créer le disque système

Créez un disque vide qui servira de disque système pour Windows :

```yaml title="win-system-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win-system
spec:
  source: {}
  optical: false
  storage: 60Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-system-disk.yaml
```

### 4. Vérifier que les trois disques sont prêts

```bash
kubectl get vmdisk win2k25-iso virtio-drivers win-system
```

**Résultat attendu :**

```
NAME              STATUS   SIZE   STORAGECLASS   AGE
win2k25-iso       Ready    7Gi    replicated     2m
virtio-drivers    Ready    1Gi    replicated     2m
win-system        Ready    60Gi   replicated     1m
```

:::note Temps de téléchargement
Le téléchargement de l'ISO Windows (~5 Go) peut prendre plusieurs minutes selon la bande passante. Attendez que tous les disques soient en statut `Ready`.
:::

### 5. Créer la VMInstance

Créez la VM avec les trois disques attachés. Le disque système doit être en première position :

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  running: true
  instanceType: u1.xlarge
  instanceProfile: windows
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
    - win2k25-iso
    - virtio-drivers
```

:::tip Profil Windows
Le profil `instanceProfile: windows` active les optimisations KubeVirt spécifiques à Windows (horloge, hypervctl, etc.). Utilisez toujours ce profil pour les VMs Windows.
:::

```bash
kubectl apply -f windows-vm.yaml
```

Attendez que la VM démarre :

```bash
kubectl get vminstance windows-server -w
```

### 6. Accéder via VNC pour l'installation

Ouvrez une session VNC vers la VM :

```bash
virtctl vnc windows-server
```

L'installeur Windows devrait démarrer automatiquement depuis l'ISO. Suivez les étapes classiques de l'installation :

1. Choisissez la langue et le clavier
2. Cliquez sur **Installer maintenant**
3. Sélectionnez l'édition Windows Server souhaitée
4. Acceptez le contrat de licence
5. Choisissez **Installation personnalisée**

### 7. Charger les drivers virtio pendant l'installation

Lors de l'étape de sélection du disque d'installation, Windows ne détectera aucun disque. Vous devez charger les drivers virtio :

1. Cliquez sur **Charger un pilote** (Load driver)
2. Cliquez sur **Parcourir** (Browse)
3. Naviguez vers le lecteur CD des drivers virtio (généralement `E:\`)
4. Sélectionnez le dossier `vioscsi\2k25\amd64` (storage controller)
5. Cliquez sur **OK** puis **Suivant**

Le disque de 60 Go devrait maintenant apparaitre. Sélectionnez-le et poursuivez l'installation.

:::warning Drivers réseau
Après l'installation, installez également les drivers réseau (NetKVM) et ballon mémoire (Balloon) depuis le CD virtio pour des performances optimales. Naviguez dans les dossiers `NetKVM\2k25\amd64` et `Balloon\2k25\amd64`.
:::

### 8. Post-installation : retirer les disques ISO

Une fois Windows installé et fonctionnel, retirez les disques ISO du manifeste pour libérer les ressources et éviter de démarrer sur l'ISO :

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  running: true
  instanceType: u1.xlarge
  instanceProfile: windows
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
```

```bash
kubectl apply -f windows-vm.yaml
```

Vous pouvez ensuite supprimer les VMDisk ISO si vous n'en avez plus besoin :

```bash
kubectl delete vmdisk win2k25-iso virtio-drivers
```

### 9. Configurer l'accès RDP (optionnel)

La VM expose déjà le port 3389 (RDP). Récupérez l'adresse IP externe :

```bash
kubectl get vminstance windows-server -o yaml
```

Connectez-vous avec votre client RDP :

```bash
# Depuis Linux
xfreerdp /v:<IP-EXTERNE> /u:Administrator

# Depuis macOS (Microsoft Remote Desktop)
# Ajoutez un PC avec l'adresse <IP-EXTERNE>
```

## Vérification

Vérifiez que la VM Windows fonctionne correctement :

```bash
kubectl get vminstance windows-server
```

**Résultat attendu :**

```
NAME              STATUS    AGE
windows-server    Running   15m
```

Testez l'accès RDP sur le port 3389 :

```bash
nc -zv <IP-EXTERNE> 3389
```

## Pour aller plus loin

- [Référence API](../api-reference.md)
- [Comment configurer le réseau externe](./configure-network.md)
