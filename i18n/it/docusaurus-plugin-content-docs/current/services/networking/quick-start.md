---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare un VPC e collegarvi due VM

Questa guida crea un VPC con una sottorete dalla [console Hikube](https://console.hikube.cloud), vi collega due VM e verifica che comunichino tramite i loro indirizzi privati.

---

## Prerequisiti

- Un account Hikube e un **progetto** (vedere [Avvio rapido Hikube](../../getting-started/quick-start.md)).
- Due VM Linux in questo progetto, di cui almeno una accessibile in SSH (vedere [Creare la prima VM](../compute/quick-start.md)). Può anche crearle durante questa guida.

---

## Passo 1: Aprire la procedura guidata di creazione del VPC

1. Nel menu laterale, apra **Infrastructure** > **Networking**. La pagina **Virtual Private Clouds** elenca i VPC del progetto.
2. Faccia clic su **Create VPC**.

La procedura guidata **Create VPC** comprende tre passaggi: **General**, **Subnets** e **Review**.

---

## Passo 2: Configurare e confermare

### General

Inserisca il nome nel campo **VPC Name**, ad esempio `vpc-demo` (da 3 a 16 caratteri: lettere minuscole, cifre e trattini, iniziando con una lettera). Faccia clic su **Next**.

### Subnets

Una sottorete è precompilata con il **CIDR Block** `172.16.0.0/24`.

1. **Name**: sostituisca il nome generato con `app`.
2. **CIDR Block**: mantenga `172.16.0.0/24`.
3. Facoltativo: **Add a subnet** per crearne altre (ad esempio `db` in `172.16.1.0/24`), fino a dieci.
4. Faccia clic su **Next**.

### Review

Il **Configuration Summary** riepiloga il **VPC Name** e le sue **Subnets**. Faccia clic su **Create VPC**.

La console mostra **VPC Created** e torna all'elenco.

---

## Passo 3: Verificare lo stato

Nell'elenco dei VPC, lo stato di `vpc-demo` (colonna **State** nella vista tabella) deve passare da **Provisioning** a **Ready**.

Apra il menu **Actions** del VPC e faccia clic su **View Subnets**: la pagina **Subnets for vpc-demo** elenca `app` con il suo **CIDR Block** `172.16.0.0/24`.

**Risultato atteso:** VPC **Ready**, sottorete `app` elencata.

---

## Passo 4: Collegare le VM alla sottorete

Per ciascuna delle due VM:

1. Apra **VM Instances**, faccia clic sulla VM e poi su **Edit**.
2. In **Network & Security**, sotto **VPC Networks (Secondary)**, selezioni `vpc-demo`.
3. Sotto **Subnets**, selezioni `app`.
4. Faccia clic su **Save**.

Per una nuova VM, effettui la stessa selezione al passaggio **Network** della procedura guidata **Create an Instance**.

Nella pagina di dettaglio di ogni VM, sezione **Network & Security**:

- **VPC Networks** mostra `vpc-demo` e `app (172.16.0.0/24)`;
- **IP Addresses** mostra un indirizzo **Secondary** in `172.16.0.0/24`. Annoti quello della seconda VM.

---

## Passo 5: Connessione e test

Si connetta alla prima VM in SSH (comando del blocco **SSH Connection**), quindi elenchi le sue interfacce:

```bash
ip -br addr
```

**Risultato atteso:** compare un'interfaccia aggiuntiva (ad esempio `enp2s0`), senza indirizzo: il sistema operativo non la configura automaticamente.

Attivi DHCP su questa interfaccia. Esempio con netplan (Ubuntu):

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

**Risultato atteso:** `enp2s0` è `UP` con un indirizzo in `172.16.0.x/24`, quello mostrato come **Secondary** nella console. Ripeta l'operazione sulla seconda VM.

Verifichi la comunicazione con la seconda VM sul suo indirizzo privato:

```bash
ping -c 3 172.16.0.11
```

Sostituisca `172.16.0.11` con l'indirizzo **Secondary** annotato al passo 4. Il ping deve rispondere; questo traffico non passa né da Internet né dal firewall dell'IP pubblico.

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Azione |
|----------|--------|
| **Invalid CIDR block** alla creazione | Inserisca un intervallo IPv4 nel formato `a.b.c.d/n`, ad esempio `172.16.2.0/24`. |
| Messaggio di errore che menziona una sovrapposizione (*overlaps*) | L'intervallo si sovrappone a un'altra sottorete del VPC o a un intervallo riservato (`10.244.0.0/16`, `10.96.0.0/12`): scelga un altro intervallo. |
| L'interfaccia secondaria non ha un indirizzo nella VM | Vedere [Risoluzione dei problemi](./troubleshooting.md#linterfaccia-secondaria-non-ha-un-indirizzo-nella-vm). |
| Il ping non risponde | Verifichi che le due VM siano sulla **stessa** sottorete e che il firewall del sistema operativo (ufw, firewalld) consenta ICMP. |

---

## Passo 7: Pulizia

1. Scolleghi le VM: **Edit** > **Network & Security**, deselezioni `vpc-demo`, quindi **Save**.
2. In **Networking**, apra il menu **Actions** del VPC e faccia clic su **Delete**.
3. Inserisca il nome del VPC per confermare, quindi faccia clic su **Permanently delete**.

L'eliminazione di un VPC elimina anche le sue sottoreti. Viene rifiutata finché una VM vi è collegata: la console mostra **Cannot delete** con l'elenco delle VM interessate.

---

## Passi successivi

- [Collegare o scollegare una VM esistente](./how-to/attach-vm-to-vpc.md)
- [Gestire le sottoreti](./how-to/manage-subnets.md)
- [Concetti](./concepts.md)

<NavigationFooter
  nextSteps={[
    {label: "Guide pratiche", href: "../how-to/attach-vm-to-vpc"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
