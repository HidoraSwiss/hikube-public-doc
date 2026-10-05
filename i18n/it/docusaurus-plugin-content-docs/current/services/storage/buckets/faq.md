---
sidebar_position: 6
title: FAQ
---

# FAQ — Bucket S3

### Qual è l'endpoint S3 di Hikube?

L'endpoint è visualizzato nella pagina di ciascun bucket, nella scheda **Access & Configuration**, campo **Endpoint** (ad esempio `prod.s3.hikube.cloud`). Viene indicato anche insieme alle chiavi al momento della creazione di un utente.

Nei suoi client S3, lo anteponga con `https://`.

---

### Perché il nome S3 del bucket è diverso dal nome che ho scelto?

Il nome scelto nella console identifica il bucket nel suo progetto. Il **nome S3 effettivo** è generato dalla piattaforma per garantirne l'unicità sull'endpoint. Utilizzi sempre il **Bucket name** visualizzato in **Access & Configuration** nei suoi comandi e SDK.

---

### Quali strumenti sono compatibili?

Tutti gli strumenti compatibili con l'API S3:

| Strumento | Configurazione |
|-------|--------------|
| **aws-cli** | `aws --endpoint-url https://<endpoint> s3 ls s3://<bucket>/` |
| **mc** (MinIO Client) | `mc alias set hikube https://<endpoint> <access-key> <secret-key>` |
| **rclone** | Remote di tipo `s3` con l'endpoint Hikube |
| **s3cmd** | `host_base` e `host_bucket` verso l'endpoint Hikube |
| **Velero** | Backup Kubernetes verso S3 Hikube |
| **Restic** | Backup di file verso S3 Hikube |

Funziona anche qualsiasi libreria compatibile con AWS S3 (boto3, aws-sdk-js, ecc.).

---

### Come funzionano le credenziali?

Le credenziali sono associate agli **utenti S3** del bucket. Alla creazione, ogni utente riceve un **Access Key ID** e una **Secret Access Key**, insieme al nome S3 del bucket e all'endpoint. Un bucket può avere più utenti, ciascuno in **Read-only** o in **Read / Write**.

Vedere [Gestire gli utenti e le chiavi di accesso](./how-to/configure-access.md).

---

### Ho smarrito la chiave segreta di un utente. Cosa devo fare?

La chiave segreta viene mostrata una sola volta e non può essere recuperata. Crei un nuovo utente (pulsante **Add User**), aggiorni le sue applicazioni, quindi elimini l'utente precedente.

---

### È possibile avere più bucket?

Sì. Crei tutti i bucket necessari con **Create a bucket**. Ogni bucket ha il proprio nome S3 e i propri utenti; le chiavi di un bucket non danno accesso agli altri.

---

### È possibile elencare tutti i propri bucket con un client S3?

No. Le chiavi di un utente sono limitate al suo bucket: `aws s3 ls` senza nome di bucket restituisce `AccessDenied`. L'elenco dei suoi bucket è visibile nella console, pagina **Object Storage Buckets**.

---

### A cosa serve il blocco (WORM)?

L'opzione **Enable Object Lock (WORM)** impedisce l'eliminazione o la modifica degli oggetti per 365 giorni. La piattaforma applica questa conservazione per impostazione predefinita in modalità `COMPLIANCE`: nessuno può eliminare un oggetto né ridurne la conservazione prima della scadenza. Questa durata predefinita non è configurabile nella console; per esigenze diverse, contatti il supporto. L'opzione serve per l'archiviazione normativa o per proteggere i backup da un'eliminazione accidentale o malevola. Si sceglie alla creazione del bucket.

---

### La cifratura può essere attivata in un secondo momento?

No. **Enable encryption at rest (LUKS)** si sceglie alla creazione e non può essere modificata in seguito. Per cifrare dati esistenti, crei un nuovo bucket cifrato e vi copi gli oggetti (ad esempio con `rclone sync` o `mc mirror`).

---

### Qual è la durabilità dei dati?

I dati sono replicati su tre datacenter (Ginevra, Gland, Lucerna). Questa architettura mantiene la disponibilità e la durabilità dei dati, anche in caso di guasto completo di un datacenter.

---

### Come viene fatturato un bucket?

La procedura guidata di creazione mostra un **Estimated Cost** per GB al mese (e all'ora). La tariffa di un bucket cifrato è distinta da quella di un bucket standard.
