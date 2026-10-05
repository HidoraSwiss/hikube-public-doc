---
title: "Come gestire le sottoreti di un VPC"
---

# Come gestire le sottoreti di un VPC

Un VPC non si modifica dopo la sua creazione, ma può aggiungervi sottoreti ed eliminare quelle che non servono più. Questa guida mostra come procedere dalla console e come scegliere gli intervalli di indirizzi.

## Prerequisiti

- Un account Hikube e un progetto
- Un VPC esistente in **Infrastructure** > **Networking**

## Passaggi

### 1. Pianificare gli intervalli di indirizzi

Scelga un intervallo IPv4 privato che non si sovrapponga ad alcuna altra sottorete del VPC. Esempio di suddivisione:

| Sottorete | Intervallo CIDR | Indirizzi |
|-------------|------------|----------|
| `app` | `172.16.0.0/24` | 256 |
| `db` | `172.16.1.0/24` | 256 |
| `admin` | `172.16.2.0/26` | 64 |

Intervalli consentiti: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, esclusi gli intervalli riservati `10.244.0.0/16` e `10.96.0.0/12`.

### 2. Aprire l'elenco delle sottoreti

1. Apra **Infrastructure** > **Networking**.
2. Nel menu **Actions** del VPC, faccia clic su **View Subnets**.

La pagina **Subnets for `<vpc>`** elenca ogni sottorete con il suo **Subnet Name** e il suo **CIDR Block**.

### 3. Creare una sottorete

1. Faccia clic su **Create Subnet**.
2. **Subnet Name**: da 1 a 63 caratteri, lettere minuscole, cifre e trattini.
3. **IPv4 CIDR Block**: ad esempio `172.16.2.0/26`.
4. Faccia clic su **Create Subnet**.

La console mostra **Subnet created!** e torna all'elenco. La sottorete è subito disponibile nella sezione **VPC Networks (Secondary)** delle VM.

### 4. Eliminare una sottorete

1. Scolleghi prima le VM che la utilizzano (vedere [Collegare una VM a un VPC](./attach-vm-to-vpc.md#5-scollegare-una-vm)).
2. Nell'elenco delle sottoreti, apra il menu **Actions** della riga e faccia clic su **Delete**.
3. Inserisca il nome della sottorete per confermare, quindi faccia clic su **Permanently delete**.

Se una VM vi è ancora collegata, la console mostra **Cannot delete** e l'elenco delle VM interessate.

### 5. Cambiare l'intervallo di una sottorete

Una sottorete non si modifica. Crei una nuova sottorete con l'intervallo corretto, vi colleghi le VM, le scolleghi dalla vecchia, quindi elimini quest'ultima.

## Verifica

La pagina **Subnets for `<vpc>`** riflette le creazioni e le eliminazioni. Su una VM collegata, la sezione **VPC Networks** della pagina di dettaglio mostra le sottoreti connesse con il relativo intervallo.

## Per approfondire

- [Concetti: intervalli di indirizzi](../concepts.md#intervalli-di-indirizzi)
- [Collegare una VM a un VPC](./attach-vm-to-vpc.md)
