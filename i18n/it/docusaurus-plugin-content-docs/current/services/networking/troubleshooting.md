---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Rete

### Blocco CIDR rifiutato alla creazione di una sottorete

**Causa**: formato non valido, intervallo pubblico, sovrapposizione con un'altra sottorete del VPC o con un intervallo riservato.

**Soluzione**:

| Messaggio | Correzione |
|---------|-----------|
| **Invalid CIDR block (ex: 192.168.1.0/24)** o **Invalid CIDR format (e.g., 172.16.0.0/24)** | Inserisca un indirizzo IPv4 seguito da un prefisso, ad esempio `172.16.0.0/24`. |
| Messaggio che indica che l'intervallo deve essere privato | Utilizzi un intervallo in `10.0.0.0/8`, `172.16.0.0/12` o `192.168.0.0/16`. |
| Messaggio che menziona una sovrapposizione (*overlaps*) con una sottorete esistente | Scelga un intervallo disgiunto dalle altre sottoreti del VPC (elenco in **View Subnets**). |
| Messaggio che menziona una sovrapposizione con una rete riservata | Eviti `10.244.0.0/16` e `10.96.0.0/12`; preferisca `172.16.0.0/12`. |

---

### Nome del VPC o della sottorete rifiutato

**Causa**: il nome non rispetta le regole, oppure esiste già.

**Soluzione**:

- **VPC**: da 3 a 16 caratteri, lettere minuscole, cifre e trattini, iniziando con una lettera e terminando con una lettera o una cifra. Univoco nel progetto.
- **Sottorete**: da 1 a 63 caratteri, lettere minuscole, cifre e trattini. Univoco nel VPC.

---

### Il VPC resta in stato Provisioning

**Causa**: la piattaforma non ha terminato il provisioning della rete.

**Soluzione**: l'elenco si aggiorna automaticamente; attenda qualche istante. Se lo stato non passa a **Ready** dopo alcuni minuti, contatti il [supporto](mailto:support@hidora.io) indicando il nome del VPC.

---

### L'interfaccia secondaria non ha un indirizzo nella VM

**Causa**: la piattaforma aggiunge l'interfaccia alla VM, ma il sistema operativo non la configura automaticamente (è il caso di Ubuntu 24.04); oppure la VM non ha ancora recepito la modifica.

**Soluzione**:

1. Nella pagina di dettaglio della VM, verifichi che **VPC Networks** elenchi la sottorete e che **IP Addresses** contenga un indirizzo **Secondary**.
2. Nella VM, elenchi le interfacce:
   ```bash
   ip -br link
   ip -br addr
   ```
3. Se l'interfaccia esiste senza indirizzo, vi attivi DHCP (esempio netplan in [Collegare una VM a un VPC](./how-to/attach-vm-to-vpc.md#4-verificare-nel-sistema-operativo)).
4. Se l'interfaccia non compare affatto, riavvii la VM (**Restart** nella sezione **Actions**).
5. Se il problema persiste, contatti il [supporto](mailto:support@hidora.io).

---

### Due VM della stessa sottorete non comunicano

**Causa**: VM su sottoreti o VPC diversi, interfaccia non configurata nel sistema operativo, oppure firewall del sistema operativo.

**Soluzione**:

1. Confronti la sezione **VPC Networks** delle due VM: devono condividere lo stesso VPC **e** la stessa sottorete.
2. Verifichi in ogni VM che l'interfaccia secondaria abbia l'indirizzo mostrato nella console (`ip -br addr`).
3. Verifichi il firewall del sistema operativo (`sudo ufw status`, `sudo firewall-cmd --list-all`, `sudo nft list ruleset`).
4. Esegua il test specificando esplicitamente l'interfaccia:
   ```bash
   ping -c 3 -I enp2s0 <indirizzo-dell-altra-vm>
   ```

---

### La VM ha perso l'accesso a Internet dopo l'aggiunta di un VPC

**Causa**: la configurazione di rete del sistema operativo ha reso l'interfaccia VPC la route predefinita.

**Soluzione**: verifichi la route predefinita:

```bash
ip route show default
```

Deve passare per l'interfaccia principale. Se passa per l'interfaccia VPC, disattivi l'uso delle route DHCP su questa interfaccia (`use-routes: false` con netplan, vedere [Collegare una VM a un VPC](./how-to/attach-vm-to-vpc.md#4-verificare-nel-sistema-operativo)).

---

### Eliminazione impossibile (Cannot delete)

**Causa**: il VPC o la sottorete è ancora utilizzato da delle VM. La console elenca le VM interessate.

**Soluzione**: per ogni VM elencata, apra **Edit** > **Network & Security**, deselezioni il VPC o la sottorete, quindi **Save**. Riprovi poi l'eliminazione.
