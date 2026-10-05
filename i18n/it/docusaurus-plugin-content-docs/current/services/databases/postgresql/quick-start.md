---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Distribuire PostgreSQL in 5 minuti

Questa guida la accompagna nella creazione del suo primo cluster **PostgreSQL** dalla [console Hikube](https://console.hikube.cloud), fino alla prima connessione con `psql`.

---

## Obiettivi

Al termine di questa guida, avrà:

- Un cluster **PostgreSQL** distribuito nel suo progetto Hikube
- Un database applicativo e un utente per connettersi
- Una password generata dalla piattaforma
- Una connessione funzionante con `psql`

---

## Prerequisiti

- Un **account Hikube** e un **progetto** con quota sufficiente (CPU, memoria, storage)
- Il client **`psql`** installato sul suo computer, se desidera testare una connessione da Internet

---

## Passo 1: Creare il cluster

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **DB & Messaging** → **PostgreSQL**. Viene visualizzata la pagina **PostgreSQL Clusters**.
3. Faccia clic su **Create a cluster**. Si apre la procedura guidata **Create a PostgreSQL cluster**.

---

## Passo 2: Configurare e confermare

La procedura guidata comprende sei passaggi: **General**, **Configuration**, **Databases**, **Users**, **Summary** e **Finish**. Passi dall'uno all'altro con **Next** e **Previous**.

### General

Inserisca il **Cluster Name** (per impostazione predefinita viene proposto un nome casuale), ad esempio `demo-pg`. Deve contenere da 3 a 16 caratteri (lettere minuscole, cifre e trattini), iniziare con una lettera e terminare con una lettera o una cifra.

### Configuration

| Campo | Valore consigliato per questa guida | Nota |
|-------|-------------------------------------|------|
| **PostgreSQL Version** | `18` | Versioni proposte: 15, 16, 17, 18 |
| **Instance preset** | `Small (1 CPU, 512Mi)` | Capacità assegnata a ogni nodo |
| **Disk size (GB)** | `10` | Capacità di storage per nodo |
| **Number of replicas** | `1 (Standalone)` | `2` o `3` per l'alta disponibilità |
| **External access** | Attivato | Necessario per connettersi dal suo computer |

![Procedura guidata PostgreSQL, passo Configuration](/img/console/postgresql/wizard-configuration.en.png)


Il banner nella parte superiore della procedura guidata mostra l'**Estimated cost** e l'impatto sulla quota del progetto.

:::warning
Il **Number of replicas** non può più essere modificato dopo la creazione. Per la produzione, scelga direttamente **2 (High Availability)** o **3 (Max High Availability)**.
:::

:::note
Attivi l'**External access** solo se ne ha bisogno: espone il database sull'Internet pubblico.
:::

### Databases

Inserisca un **Database name**, ad esempio `myapp`, quindi faccia clic su **Add**. Se non aggiunge alcun database, viene creato solo il database predefinito **`postgres`**.

### Users

Aggiunga almeno un utente:

1. **Username**: ad esempio `app_user` (solo lettere minuscole, cifre e trattini bassi, nessun trattino).
2. **Database name**: selezioni `myapp`.
3. **Rights**: **Administrator (Admin)** o **Read-only**.
4. Faccia clic su **Add**.

### Summary

Rilegga il riepilogo (**Version**, **Instance preset**, **Data volume**, **Replicas**, **External exposure**, **Databases to create**, **Users to create**, **Estimated cost**), quindi faccia clic su **Create cluster**.

---

## Passo 3: Verificare lo stato

Il passaggio **Finish** conferma la creazione (« Creation complete! »). Faccia clic su **Finish** per aprire la pagina del cluster.

Lo stato del cluster è mostrato accanto al suo nome, sia nella pagina del cluster sia nell'elenco **PostgreSQL Clusters**:

| Stato | Significato |
|-------|-------------|
| **Creating** | Il cluster è in fase di provisioning |
| **Ready** / **Running** | Il cluster è operativo |
| **Error** / **Failed** | Il provisioning non è riuscito |

**Risultato atteso:** dopo alcuni minuti, lo stato passa a **Ready**. La pagina del cluster mostra la **PostgreSQL Version**, le **Replicas**, l'**Allocated Size** e l'**External Access** (**Enabled**).

---

## Passo 4: Recuperare le credenziali

Le password vengono mostrate **una sola volta**, nel passaggio **Finish** della procedura guidata, nella sezione **User Credentials**:

- **Password** di ogni utente creato;
- **Internal Connection String**: l'indirizzo del cluster, quando l'accesso esterno è attivato.

![Procedura guidata PostgreSQL, passo Finish: credenziali degli utenti (password oscurata)](/img/console/postgresql/wizard-credentials.en.png)


:::warning
Copi queste password in un gestore di password prima di lasciare la schermata: non verranno più mostrate. In caso di smarrimento, ne generi una nuova dalla scheda **Users** (**Actions** → **Change Password**).
:::

L'indirizzo del cluster resta consultabile nella pagina del cluster, riquadro **Connection and Databases**, campo **Host**.

---

## Passo 5: Connessione e test

Si connetta con `psql` utilizzando l'indirizzo del campo **Host**:

```bash
psql "host=<host> port=5432 dbname=myapp user=app_user sslmode=require"
```

Inserisca la password quando richiesta, quindi verifichi la connessione:

```sql
SELECT version();
CREATE TABLE test (id serial PRIMARY KEY, message text);
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Risultato atteso:**

```console
 id |    message
----+----------------
  1 | Bonjour Hikube
(1 row)
```

---

## Passo 6: Risoluzione rapida dei problemi

### Il campo Host mostra « Not defined »

L'**External Access** è disattivato, oppure l'indirizzo IP pubblico non è ancora stato assegnato. Verifichi il riquadro **External Access** della pagina del cluster; se necessario, lo attivi tramite **Edit**, quindi attenda qualche istante.

### Il pulsante Next resta inattivo

- Nel passaggio **Configuration**: il cluster supera la quota del progetto. Riduca il preset, la dimensione del disco o il numero di repliche.
- Nel passaggio **Users**: aggiunga almeno un utente.

### Autenticazione rifiutata

Verifichi il nome utente, il database di destinazione e la password. Se la password è stata smarrita, effettui una rotazione dalla scheda **Users**. Consulti [Gestire utenti e database](./how-to/manage-users-databases.md).

### Il cluster resta in stato Error

[Contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e del cluster.

---

## Passo 7: Pulizia

1. Apra la pagina del cluster (**DB & Messaging** → **PostgreSQL** → nome del cluster).
2. Faccia clic su **Delete cluster**.
3. Inserisca il nome esatto del cluster nel campo **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning
Questa azione elimina il cluster PostgreSQL e tutti i dati associati. È **irreversibile**.
:::

---

## Riepilogo

Dalla console ha creato:

- Un cluster **PostgreSQL** nel suo progetto
- Un database e un utente con i relativi diritti
- Un accesso esterno e una connessione `psql`

<NavigationFooter
  nextSteps={[
    {label: "Gestire utenti e database", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
