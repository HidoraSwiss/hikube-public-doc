---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Distribuire MariaDB in 5 minuti

Questa guida la accompagna nella creazione del suo primo cluster **MariaDB** dalla [console Hikube](https://console.hikube.cloud), fino alla prima connessione con il client `mysql` (o `mariadb`).

---

## Obiettivi

Al termine di questa guida, avrà:

- Un cluster **MariaDB** distribuito nel suo progetto Hikube
- Un utente con i diritti su un database applicativo
- Una connessione funzionante con un client MySQL

---

## Prerequisiti

- Un **account Hikube** e un **progetto** con quota sufficiente (CPU, memoria, storage)
- Il client **`mysql`** o **`mariadb`** installato sul suo computer, se desidera testare una connessione da Internet

---

## Passo 1: Creare il cluster

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **DB & Messaging** → **MariaDB**. Viene visualizzata la pagina **MariaDB Clusters**.
3. Faccia clic su **Create a cluster**. Si apre la procedura guidata **Create a MariaDB cluster**.

---

## Passo 2: Configurare e confermare

La procedura guidata comprende cinque passaggi: **General**, **Configuration**, **Users**, **Summary** e **Finish**.

### General

Inserisca il **Cluster Name**, ad esempio `demo-mariadb` (da 3 a 16 caratteri: lettere minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra).

### Configuration

| Campo | Valore consigliato per questa guida | Nota |
|-------|-------------------------------------|------|
| **MariaDB Version** | `11.8` | Versioni proposte: 10.6, 10.11, 11.4, 11.8 |
| **Preset** | `Small (1 CPU, 512Mi)` | Non modificabile dopo la creazione |
| **Disk size (GB)** | `10` | Capacità di storage per nodo |
| **Number of replicas** | `1 (Standalone)` | `3` o `5` per l'alta disponibilità; non modificabile dopo la creazione |
| **External access** | Attivato | Necessario per connettersi dal suo computer |

Il banner nella parte superiore della procedura guidata mostra l'**Estimated cost** e l'impatto sulla quota del progetto.

:::note
Attivi l'**External access** solo se ne ha bisogno: espone il database sull'Internet pubblico.
:::

### Users

Aggiunga almeno un utente:

1. **Username**: ad esempio `app-user` (lettere minuscole, cifre e trattini).
2. **Role**: **Administrator** o **Read-only**.
3. Faccia clic su **Add**.

### Summary

Rilegga il riepilogo (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Estimated cost**, **Users to create**), quindi faccia clic su **Create cluster**.

---

## Passo 3: Verificare lo stato

Il passaggio **Finish** conferma la creazione (« Creation complete! »). Faccia clic su **Finish** per aprire la pagina del cluster.

| Stato | Significato |
|-------|-------------|
| **Creating** | Il cluster è in fase di provisioning |
| **Ready** / **Running** | Il cluster è operativo |
| **Error** / **Failed** | Il provisioning non è riuscito |

**Risultato atteso:** dopo alcuni minuti, lo stato passa a **Ready**. La pagina mostra la **MariaDB Version**, le **Replicas**, l'**Allocated Size** e il **Preset**.

---

## Passo 4: Recuperare le credenziali e concedere l'accesso a un database

### Credenziali

Il passaggio **Finish** della procedura guidata mostra, in **User Credentials**, la **Password** di ogni utente e la **Internal Connection String** (`<host>:3306`) quando l'accesso esterno è attivato.

:::warning
Copi subito queste password: non verranno più mostrate. In caso di smarrimento, ne generi una nuova dalla sezione **Users** (**Actions** → **Change Password**).
:::

L'indirizzo resta consultabile nel riquadro **Connection and network** della pagina del cluster, campo **Host**.

### Accesso a un database applicativo

Il ruolo scelto nella procedura guidata si applica al database di sistema `mysql`. Per creare un database applicativo e concedervi l'accesso:

1. Nella sezione **Users**, apra il menu **Actions** di `app-user` e scelga **Manage Access**.
2. Sotto **Specific Access (Databases)**, faccia clic su **Add**.
3. Inserisca il **Database name**, ad esempio `myapp` (lettere minuscole, cifre e trattini), e scelga i **Rights** **Administrator (Admin)**.
4. Faccia clic su **Save**. Il database `myapp` viene creato se non esiste.

---

## Passo 5: Connessione e test

```bash
mysql -h <host> -P 3306 -u app-user -p myapp
```

Inserisca la password, quindi verifichi la connessione:

```sql
SELECT VERSION();
CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(100));
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Risultato atteso:**

```console
+----+----------------+
| id | message        |
+----+----------------+
|  1 | Bonjour Hikube |
+----+----------------+
```

:::tip
Il client `mariadb` accetta le stesse opzioni: `mariadb -h <host> -P 3306 -u app-user -p myapp`.
:::

---

## Passo 6: Risoluzione rapida dei problemi

### Il campo Host mostra « Not defined »

L'**External Access** è disattivato, oppure l'indirizzo IP pubblico non è ancora stato assegnato. Se necessario, lo attivi tramite **Edit**, quindi attenda qualche istante.

### `Access denied for user`

Password errata, oppure utente senza accesso al database indicato. Verifichi la colonna **Databases** dell'elenco degli utenti e aggiunga l'accesso tramite **Manage Access**.

### Il pulsante Next resta inattivo

- Nel passaggio **Configuration**: il cluster supera la quota del progetto.
- Nel passaggio **Users**: aggiunga almeno un utente.

### Il cluster resta in stato Error

[Contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e del cluster.

---

## Passo 7: Pulizia

1. Apra la pagina del cluster (**DB & Messaging** → **MariaDB** → nome del cluster).
2. Faccia clic su **Delete cluster**.
3. Inserisca il nome esatto del cluster nel campo **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning
Questa azione elimina il cluster MariaDB e tutti i dati associati. È **irreversibile**.
:::

---

## Riepilogo

Dalla console ha creato:

- Un cluster **MariaDB** nel suo progetto
- Un utente e un database applicativo
- Un accesso esterno e una connessione con il client `mysql`

<NavigationFooter
  nextSteps={[
    {label: "Gestire utenti e database", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
