---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Macchine virtuali

### La VM non si avvia

**Causa**: il disco di sistema non è pronto, l'immagine sorgente non è valida, o il profilo di istanza non corrisponde all'immagine.

**Soluzione**:

1. Verificate che le risorse VMDisk esistano e siano pronte:
   ```bash
   kubectl get vmdisk
   ```

2. Verificate gli eventi della VMInstance:
   ```bash
   kubectl describe vminstance <vm-name>
   ```

3. Verificate che l'`instanceProfile` sia adatto all'OS dell'immagine (ad esempio `ubuntu` per un'immagine Ubuntu). Un profilo inadatto non impedisce l'avvio ma la VM non sarà ottimizzata (driver mancanti).

4. Verificate che l'`instanceType` scelto sia valido (prefisso `s1`, `u1` o `m1` seguito da una dimensione valida).

---

### SSH timeout con PortList

**Causa**: la porta 22 non è nella lista `externalPorts`, l'esposizione esterna non è attivata, o la chiave SSH non è stata iniettata.

**Soluzione**:

1. Verificate che `external: true` sia attivato e che la porta 22 sia elencata:
   ```yaml title="vm.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

2. Recuperate l'indirizzo IP del servizio esposto:
   ```bash
   kubectl get svc
   ```

3. Verificate che la vostra chiave SSH sia stata iniettata nel manifest:
   ```yaml title="vm.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

4. Testate la connessione in modalità verbose:
   ```bash
   ssh -v user@<external-ip>
   ```

---

### Il DNS .local non funziona nella VM

**Causa**: `systemd-resolved` tratta i domini `.local` come mDNS (multicast DNS), il che impedisce la risoluzione DNS classica per questi domini.

**Soluzione**:

1. Create un drop-in per `systemd-networkd` che disabilita il mDNS:
   ```bash
   sudo mkdir -p /etc/systemd/network/10-cloud-init-eth0.network.d
   ```

2. Create il file di configurazione:
   ```bash
   sudo tee /etc/systemd/network/10-cloud-init-eth0.network.d/override.conf << 'EOF'
   [Network]
   MulticastDNS=no
   EOF
   ```

3. Ricaricate la configurazione di rete:
   ```bash
   sudo networkctl reload
   ```

4. Verificate che la risoluzione funzioni:
   ```bash
   resolvectl status
   resolvectl query mio-servizio.local
   ```

:::note
Questo problema interessa tutte le distribuzioni che utilizzano `systemd-resolved` (Ubuntu 22.04+, Debian 12+, ecc.). La correzione persiste dopo il riavvio.
:::

---

### Disco non collegato alla VM

**Causa**: il nome del VMDisk non corrisponde alla voce in `spec.disks`, il VMDisk non è pronto, o la `storageClass` non è valida.

**Soluzione**:

1. Verificate che il nome del VMDisk corrisponda esattamente a quello referenziato in `spec.disks`:
   ```yaml title="vm.yaml"
   spec:
     disks:
       - data-volume  # Deve corrispondere a metadata.name del VMDisk
   ```

2. Verificate lo stato del VMDisk:
   ```bash
   kubectl get vmdisk data-volume
   kubectl describe vmdisk data-volume
   ```

3. Le storageClass disponibili su Hikube sono: `local`, `replicated` e `replicated-async`. Per una VM (istanza isolata), `replicated` è raccomandato.

---

### Console seriale / VNC per debug

**Causa**: la VM non risponde in SSH e avete bisogno di un accesso diretto per diagnosticare il problema.

**Soluzione**:

1. Per un accesso console seriale (testo):
   ```bash
   virtctl console <vm-name>
   ```

2. Per un accesso VNC (grafico):
   ```bash
   virtctl vnc <vm-name>
   ```

3. Dalla console, potete verificare:
   - I log di avvio
   - La configurazione di rete (`ip addr`, `ip route`)
   - Lo stato dei servizi (`systemctl status`)
   - I log di sistema (`journalctl -xe`)

:::tip
`virtctl` è il CLI KubeVirt. Installatelo dalle [release KubeVirt](https://github.com/kubevirt/kubevirt/releases).
:::
