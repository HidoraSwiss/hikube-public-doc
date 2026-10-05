---
title: "Come gestire gli utenti e le chiavi di accesso"
---

# Come gestire gli utenti e le chiavi di accesso

Ogni bucket Hikube può avere più **utenti S3**, ciascuno con la propria coppia di chiavi e il proprio diritto (**Read-only** o **Read / Write**). Questa guida spiega come gestire questi utenti dalla [console Hikube](https://console.hikube.cloud) e configurare i client S3 più comuni (AWS CLI, MinIO Client, rclone).

## Prerequisiti

- Un **bucket** creato nel suo progetto (vedere l'[avvio rapido](../quick-start.md)), in stato **Ready**
- Uno o più client S3 installati: **AWS CLI**, **mc** (MinIO Client) o **rclone**

## Comprendere il modello di accesso

- Un bucket può avere **più utenti**; ciascuno ha il proprio **Access Key ID** e la propria **Secret Access Key**.
- Le chiavi di un utente danno accesso **solo a quel bucket**.
- Il **nome S3 effettivo** del bucket e l'**endpoint** sono comuni a tutti i suoi utenti; sono visualizzati nella scheda **Access & Configuration** della pagina del bucket.
- La **chiave segreta viene mostrata una sola volta**, alla creazione dell'utente.

## Creare un utente

1. Apra **Infrastructure** → **S3 Buckets**, quindi faccia clic sul bucket.
2. Nella scheda **Users & Access**, faccia clic su **Add User**.
3. Nella finestra **New User**:
   - inserisca il **Username** (da 3 a 16 caratteri: lettere minuscole, cifre e trattini; deve iniziare con una lettera);
   - selezioni **Read-only access** se l'utente deve soltanto leggere gli oggetti.
4. Faccia clic su **Create User**.

La finestra **Generated Credentials** mostra **S3 Bucket**, **S3 Endpoint**, **Access Key ID** e **Secret Access Key**.

:::warning
Copi questi valori prima di cliccare su **I have saved these keys**: la chiave segreta non potrà essere recuperata in seguito.
:::

## Modificare il diritto di un utente

1. Nella scheda **Users & Access**, apra il menu delle azioni dell'utente.
2. Scelga **Edit access**.
3. Selezioni o deselezioni **Read-only access**, quindi faccia clic su **Save changes**.

La colonna **Access** della tabella mostra quindi **Read-only** o **Read / Write**. Le chiavi dell'utente non cambiano.

## Rinnovare le chiavi

La console non prevede la rotazione delle chiavi di un utente esistente. Per rinnovare le chiavi (smarrimento della chiave segreta, sospetto di fuga):

1. Crei un **nuovo utente** con lo stesso diritto e ne recuperi le chiavi.
2. Aggiorni le sue applicazioni con le nuove chiavi.
3. Elimini l'utente precedente: menu delle azioni → **Delete**, quindi confermi.

## Configurare i client S3

Negli esempi seguenti, sostituisca:

- `<endpoint>` con l'**Endpoint**, preceduto da `https://` (ad esempio `https://prod.s3.hikube.cloud`);
- `<bucket>` con il **Bucket name** S3 visualizzato in **Access & Configuration**;
- `<access-key>` e `<secret-key>` con le chiavi dell'utente.

### AWS CLI

Configuri un profilo dedicato:

```bash
aws configure --profile hikube
```

```text
AWS Access Key ID: <access-key>
AWS Secret Access Key: <secret-key>
Default region name: (lasciare vuoto)
Default output format: json
```

Utilizzi il profilo con l'endpoint Hikube:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
```

### MinIO Client (mc)

```bash
mc alias set hikube <endpoint> <access-key> <secret-key>

# Elencare, caricare e scaricare
mc ls hikube/<bucket>/
mc cp fichier.txt hikube/<bucket>/
mc cp hikube/<bucket>/fichier.txt ./
```

### rclone

Aggiunga un remote in `~/.config/rclone/rclone.conf`:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = <endpoint>
access_key_id = <access-key>
secret_access_key = <secret-key>
acl = private
```

```bash
# Elencare gli oggetti
rclone ls hikube:<bucket>

# Sincronizzare una directory locale
rclone sync ./mon-dossier hikube:<bucket>/mon-dossier
```

## Buone pratiche di sicurezza

:::warning
Non memorizzi mai le sue chiavi S3 in chiaro nei repository Git o nelle immagini dei container. Utilizzi un gestore di segreti, variabili d'ambiente oppure, in un cluster Kubernetes, un Secret (vedere [Collegare un'applicazione](./connect-from-app.md)).
:::

- **Un utente per applicazione**: può revocare l'accesso di un'applicazione senza impattare le altre.
- **Sola lettura per impostazione predefinita** per le applicazioni che si limitano a leggere.
- **Elimini gli utenti inutilizzati.**

## Verifica

Con ciascun client configurato, elenchi il bucket:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
mc ls hikube/<bucket>/
rclone ls hikube:<bucket>
```

Se il comando restituisce un elenco vuoto (bucket vuoto) o l'elenco degli oggetti senza errori, la configurazione è corretta. Con un utente in **Read-only**, un caricamento di file deve fallire con `AccessDenied`.

## Per approfondire

- [Collegare un bucket da un'applicazione](./connect-from-app.md)
- [Concetti](../concepts.md)
