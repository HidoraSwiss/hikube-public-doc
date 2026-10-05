---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Bucket S3

### AccessDenied durante l'accesso al bucket

**Causa**: le chiavi utilizzate sono errate, il nome del bucket utilizzato non è il nome S3 effettivo, oppure l'utente è in sola lettura e tenta una scrittura.

**Soluzione**:

1. Apra la pagina del bucket e annoti il **Bucket name** nella scheda **Access & Configuration**. Utilizzi questo nome, e non il nome inserito nella procedura guidata:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<nome-del-bucket-s3>/
   ```
2. Verifichi nella scheda **Users & Access** il diritto dell'utente (**Read-only** o **Read / Write**); se necessario, lo modifichi con **Edit access**.
3. Verifichi che l'Access Key ID e la Secret Access Key siano configurate correttamente nel suo strumento. Se la chiave segreta è andata persa, crei un nuovo utente.

---

### ListBucket non riesce sulla radice

**Causa**: le chiavi di un utente sono limitate al suo bucket. Non è possibile elencare tutti i bucket dell'endpoint.

**Soluzione**:

1. Indichi sempre il bucket nei suoi comandi:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<nome-del-bucket-s3>/
   mc ls hikube/<nome-del-bucket-s3>/
   ```
2. Per vedere tutti i suoi bucket, utilizzi la pagina **Object Storage Buckets** della console.

---

### Credenziali introvabili

**Causa**: la chiave segreta viene mostrata solo alla creazione dell'utente, oppure non è stato creato alcun utente (ad esempio se il bucket non era pronto al termine della procedura guidata).

**Soluzione**:

1. Apra la pagina del bucket e verifichi la scheda **Users & Access**.
2. Faccia clic su **Add User** per creare un utente e ottenere nuove chiavi.
3. L'endpoint e il nome S3 restano consultabili in qualsiasi momento in **Access & Configuration**.

---

### «No S3 connection information available currently»

**Causa**: il bucket è ancora in fase di provisioning.

**Soluzione**: attenda che lo stato del bucket passi a **Ready**, quindi ricarichi la pagina. Se lo stato resta **Creating** o passa a **Error**, [contatti il supporto](mailto:support@hidora.io) indicando il nome del bucket e il suo identificativo.

---

### Creazione non riuscita: «A bucket with this name already exists»

**Causa**: un bucket del progetto ha già questo nome.

**Soluzione**: torni al passaggio **General** della procedura guidata e scelga un altro **Bucket name**.

---

### L'eliminazione del bucket non riesce

**Causa**: la console risponde «The bucket is not empty or is still in use.».

**Soluzione**:

1. Svuoti il bucket con un utente in **Read / Write**:
   ```bash
   aws --endpoint-url https://<endpoint> s3 rm s3://<nome-del-bucket-s3>/ --recursive
   ```
2. Se il blocco (WORM) è attivato, gli oggetti ancora soggetti a conservazione non possono essere eliminati prima della scadenza.
3. Riprovi l'eliminazione dalla console. Se l'errore persiste, [contatti il supporto](mailto:support@hidora.io).

---

### Upload lento o timeout

**Causa**: problema di rete, file di grandi dimensioni inviato senza multipart upload.

**Soluzione**:

1. Verifichi la connettività verso l'endpoint:
   ```bash
   curl -s -o /dev/null -w "%{time_total}\n" https://<endpoint>
   ```
2. Per i file di grandi dimensioni, utilizzi un client che gestisca il multipart upload: `aws s3 cp` e `mc cp` lo fanno automaticamente oltre una certa dimensione.
3. Se necessario, aumenti il parallelismo lato client (ad esempio `aws configure set default.s3.max_concurrent_requests 20`).

---

### Bucket non trovato (`NoSuchBucket`)

**Causa**: il nome utilizzato è quello scelto nella console e non il nome S3 effettivo.

**Soluzione**: annoti il **Bucket name** nella scheda **Access & Configuration** della pagina del bucket e lo utilizzi nei suoi comandi.

:::warning
Non confonda il nome del bucket nella console con il suo nome S3. Solo il secondo funziona con i client S3.
:::
