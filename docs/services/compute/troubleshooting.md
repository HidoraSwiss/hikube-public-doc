---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Machines virtuelles

### VM ne boot pas

**Cause** : le disque système n'est pas prêt, l'image source est invalide, ou le profil d'instance ne correspond pas à l'image.

**Solution** :

1. Vérifiez que les ressources VMDisk existent et sont prêtes :
   ```bash
   kubectl get vmdisk
   ```

2. Vérifiez les événements de la VMInstance :
   ```bash
   kubectl describe vminstance <vm-name>
   ```

3. Vérifiez que l'`instanceProfile` est adapté à l'OS de l'image (par exemple `ubuntu` pour une image Ubuntu). Un profil inadapté n'empêche pas le démarrage mais la VM ne sera pas optimisée (drivers manquants).

4. Vérifiez que l'`instanceType` choisi est valide (préfixe `s1`, `u1` ou `m1` suivi d'une taille valide).

---

### SSH timeout avec PortList

**Cause** : le port 22 n'est pas dans la liste `externalPorts`, l'exposition externe n'est pas activée, ou la clé SSH n'a pas été injectée.

**Solution** :

1. Vérifiez que `external: true` est activé et que le port 22 est listé :
   ```yaml title="vm.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

2. Récupérez l'adresse IP du service exposé :
   ```bash
   kubectl get svc
   ```

3. Vérifiez que votre clé SSH a bien été injectée dans le manifeste :
   ```yaml title="vm.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

4. Testez la connexion en mode verbose :
   ```bash
   ssh -v user@<external-ip>
   ```

---

### DNS .local ne fonctionne pas dans la VM

**Cause** : `systemd-resolved` traite les domaines `.local` comme du mDNS (multicast DNS), ce qui empêche la résolution DNS classique pour ces domaines.

**Solution** :

1. Créez un drop-in pour `systemd-networkd` qui désactive le mDNS :
   ```bash
   sudo mkdir -p /etc/systemd/network/10-cloud-init-eth0.network.d
   ```

2. Créez le fichier de configuration :
   ```bash
   sudo tee /etc/systemd/network/10-cloud-init-eth0.network.d/override.conf << 'EOF'
   [Network]
   MulticastDNS=no
   EOF
   ```

3. Rechargez la configuration réseau :
   ```bash
   sudo networkctl reload
   ```

4. Vérifiez que la résolution fonctionne :
   ```bash
   resolvectl status
   resolvectl query mon-service.local
   ```

:::note
Ce problème affecte toutes les distributions utilisant `systemd-resolved` (Ubuntu 22.04+, Debian 12+, etc.). Le correctif persiste après redémarrage.
:::

---

### Disque non attaché à la VM

**Cause** : le nom du VMDisk ne correspond pas à l'entrée dans `spec.disks`, le VMDisk n'est pas prêt, ou la `storageClass` est invalide.

**Solution** :

1. Vérifiez que le nom du VMDisk correspond exactement à celui référencé dans `spec.disks` :
   ```yaml title="vm.yaml"
   spec:
     disks:
       - data-volume  # Doit correspondre à metadata.name du VMDisk
   ```

2. Vérifiez le statut du VMDisk :
   ```bash
   kubectl get vmdisk data-volume
   kubectl describe vmdisk data-volume
   ```

3. Les storageClasses disponibles sur Hikube sont : `local`, `replicated` et `replicated-async`. Pour une VM (instance isolée), `replicated` est recommandé.

---

### Console série / VNC pour debug

**Cause** : la VM ne répond pas en SSH et vous avez besoin d'un accès direct pour diagnostiquer le problème.

**Solution** :

1. Pour un accès console série (texte) :
   ```bash
   virtctl console <vm-name>
   ```

2. Pour un accès VNC (graphique) :
   ```bash
   virtctl vnc <vm-name>
   ```

3. Depuis la console, vous pouvez vérifier :
   - Les logs de démarrage
   - La configuration réseau (`ip addr`, `ip route`)
   - L'état des services (`systemctl status`)
   - Les logs système (`journalctl -xe`)

:::tip
`virtctl` est le CLI KubeVirt. Installez-le depuis les [releases KubeVirt](https://github.com/kubevirt/kubevirt/releases).
:::
