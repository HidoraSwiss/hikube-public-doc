---
sidebar_position: 6
title: FAQ
---

# FAQ — Rete

### A cosa serve un VPC se la mia VM ha già un IP pubblico?

L'IP pubblico serve a esporre la VM su Internet. Il VPC serve agli scambi **tra le sue VM**, su indirizzi privati che non sono raggiungibili da Internet. Può così assegnare un IP pubblico solo alle VM di front-end e mantenere le altre in privato.

---

### Una VM può essere collegata a più VPC?

Sì. Selezioni più VPC, e una o più sottoreti in ciascuno, nella sezione **VPC Networks (Secondary)**. Ogni sottorete aggiunge un'interfaccia di rete alla VM.

---

### Quali intervalli di indirizzi posso utilizzare?

Intervalli IPv4 privati: `10.0.0.0/8`, `172.16.0.0/12` o `192.168.0.0/16`, senza sovrapporsi a un'altra sottorete dello stesso VPC né agli intervalli riservati `10.244.0.0/16` e `10.96.0.0/12`. Consigliamo dei `/24` in `172.16.0.0/12`. Vedere [Concetti](./concepts.md#intervalli-di-indirizzi).

---

### Due VPC possono utilizzare lo stesso intervallo?

Sì: i VPC sono isolati, i loro intervalli possono sovrapporsi. Solo le sottoreti di uno stesso VPC devono essere disgiunte.

---

### Posso collegare due VPC tra loro?

L'interconnessione di VPC (*peering*) e le route statiche non sono disponibili nella console; contatti il [supporto](mailto:support@hidora.io).

---

### Posso modificare un VPC o una sottorete?

No. Può aggiungere sottoreti a un VPC ed eliminare quelle non più utilizzate. Per cambiare un intervallo, crei una nuova sottorete e vi migri le VM (vedere [Gestire le sottoreti](./how-to/manage-subnets.md)).

---

### I miei cluster Kubernetes o database possono entrare in un VPC?

Non dalla console: la sezione **VPC Networks (Secondary)** esiste solo per le istanze VM.

---

### Il firewall della VM si applica al traffico VPC?

No. Il firewall Hikube (**Enable Firewall**, **Allowed Ports**) filtra solo il traffico che arriva dall'IP pubblico della VM. Il traffico tra VM di un VPC non è filtrato, indipendentemente dalle porte consentite: a tale scopo configuri un firewall nel sistema operativo (ufw, firewalld, nftables).

---

### Perché non posso eliminare il mio VPC?

Una VM vi è ancora collegata: la console mostra **Cannot delete** con il nome delle VM. Le scolleghi (**Edit** > **Network & Security**) o le elimini, quindi riprovi.

---

### Quante sottoreti posso creare?

La procedura guidata **Create VPC** accetta fino a dieci sottoreti. Altre possono essere aggiunte in seguito con **Create Subnet**, purché i loro intervalli non si sovrappongano.
