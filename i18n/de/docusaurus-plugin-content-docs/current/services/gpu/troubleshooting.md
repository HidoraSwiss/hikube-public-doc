---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — GPU

### GPU non détecté dans la VM

**Ursache**: le champ `gpus` n'est pas configuré dans le manifeste, ou le PCI passthrough n'a pas correctement attaché le GPU à la VM.

**Lösung**:

1. Überprüfen Sie, ob le champ `gpus` est bien présent dans votre manifeste :
   ```yaml title="vm-gpu.yaml"
   spec:
     gpus:
       - name: "nvidia.com/AD102GL_L40S"
   ```

2. Dans la VM, vérifiez la détection PCI :
   ```bash
   lspci | grep -i nvidia
   ```

3. Überprüfen Sie, ob le module kernel NVIDIA est chargé :
   ```bash
   lsmod | grep nvidia
   ```

4. Si aucun résultat, les drivers ne sont pas installés. Consultez la section suivante.

---

### Drivers NVIDIA manquants

**Ursache**: les drivers NVIDIA ne sont pas installés dans la VM, ou les kernel headers ne correspondent pas à la version du noyau.

**Lösung**:

1. Installez les Voraussetzungen et les drivers via cloud-init ou manuellement :
   ```bash
   sudo apt-get update
   sudo apt-get install -y linux-headers-$(uname -r)
   sudo apt-get install -y nvidia-driver-550 nvidia-utils-550
   ```

2. Redémarrez la VM après l'installation :
   ```bash
   sudo reboot
   ```

3. Vérifiez l'installation :
   ```bash
   nvidia-smi
   ```

:::tip
Pour automatiser l'installation, utilisez le champ `cloudInit` dans votre manifeste VM afin que les drivers soient installés au premier démarrage.
:::

---

### Pod GPU en état Pending

**Ursache**: aucun nœud avec GPU disponible, la configuration GPU du cluster est absente, ou le GPU Operator n'est pas actif.

**Lösung**:

1. Vérifiez les événements du pod :
   ```bash
   kubectl describe pod <pod-name>
   ```
   Recherchez le message `Insufficient nvidia.com/gpu`.

2. Überprüfen Sie, ob des nœuds GPU existent et ont des GPU allocables :
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.allocatable["nvidia.com/gpu"]}'
   ```

3. Vérifiez la configuration du nodeGroup GPU dans le manifeste du cluster :
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       gpu-workers:
         minReplicas: 1
         maxReplicas: 4
         instanceType: "u1.2xlarge"
         gpus:
           - name: "nvidia.com/AD102GL_L40S"
   ```

4. Assurez-vous que l'addon GPU Operator est aktiviert :
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

---

### `nvidia-smi` échoue dans un pod

**Ursache**: le GPU Operator n'est pas aktiviert sur le cluster, ce qui empêche l'installation automatique des drivers et la mise à disposition du device plugin.

**Lösung**:

1. Activez l'addon GPU Operator sur le cluster :
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Appliquez la modification :
   ```bash
   kubectl apply -f cluster.yaml
   ```

3. Überprüfen Sie, ob les pods du GPU Operator sont en cours d'exécution :
   ```bash
   kubectl get pods -n gpu-operator
   ```

4. Une fois le GPU Operator opérationnel, recréez votre pod GPU.

---

### GPU Operator non fonctionnel

**Ursache**: l'addon n'est pas aktiviert, les pods de l'opérateur sont en erreur, ou les nœuds n'ont pas de GPU physique.

**Lösung**:

1. Überprüfen Sie, ob l'addon est aktiviert dans le manifeste du cluster :
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Vérifiez l'état des pods du GPU Operator :
   ```bash
   kubectl get pods -n gpu-operator
   kubectl describe pod -n gpu-operator <pod-name>
   ```

3. Überprüfen Sie, ob les nœuds possèdent bien du hardware GPU :
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.capacity["nvidia.com/gpu"]}'
   ```

4. Si les pods sont en `CrashLoopBackOff`, consultez les logs :
   ```bash
   kubectl logs -n gpu-operator <pod-name>
   ```
