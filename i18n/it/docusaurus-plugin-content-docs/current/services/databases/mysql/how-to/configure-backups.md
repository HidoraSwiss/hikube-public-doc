---
title: "Come configurare i backup automatici"
---

# Come configurare i backup automatici

Questa guida vi spiega come attivare e configurare i backup automatici del vostro database MySQL su Hikube. I backup utilizzano **Restic** e sono archiviati in un bucket **S3-compatible**, il che permette un ripristino affidabile in caso di perdita di dati.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **MySQL** distribuita sul vostro tenant
- Un **bucket S3-compatible** accessibile (Hikube Object Storage, AWS S3, MinIO, ecc.)
- Le **credenziali di accesso S3** (Access Key e Secret Key)

## Passaggi

### 1. Preparare lo storage S3 e le credenziali

Prima di configurare i backup, assicuratevi di disporre delle seguenti informazioni:

| Informazione | Esempio | Descrizione |
|---|---|---|
| **Regione S3** | `eu-central-1` | Regione del bucket S3 |
| **Bucket S3** | `s3.hikube.cloud/mysql-backups` | Percorso completo del bucket |
| **Access Key** | `HIKUBE123ACCESSKEY` | Chiave di accesso S3 |
| **Secret Key** | `HIKUBE456SECRETKEY` | Chiave segreta S3 |
| **Password Restic** | `SuperStrongResticPassword!` | Password per la cifratura dei backup |

:::warning
Conservate la **password Restic** in un luogo sicuro. Senza questa password, e impossibile ripristinare i backup cifrati.
:::

### 2. Configurare la sezione backup nel manifesto

Create o modificate il vostro manifesto MySQL per includere la sezione `backup`:

```yaml title="mysql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: strongpassword
      maxUserConnections: 100

  databases:
    myapp:
      roles:
        admin:
          - appuser

  backup:
    enabled: true
    schedule: "0 2 * * *"                                              # Ogni giorno alle 2 del mattino
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

#### Parametri di backup

| Parametro | Descrizione | Valore predefinito |
|---|---|---|
| `backup.enabled` | Attiva i backup | `false` |
| `backup.schedule` | Pianificazione cron | `"0 2 * * *"` |
| `backup.s3Region` | Regione AWS S3 | `"us-east-1"` |
| `backup.s3Bucket` | Bucket S3 | - |
| `backup.s3AccessKey` | Chiave di accesso S3 | - |
| `backup.s3SecretKey` | Chiave segreta S3 | - |
| `backup.resticPassword` | Password Restic | - |
| `backup.cleanupStrategy` | Strategia di retention | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` |

:::tip
Adattate lo `schedule` secondo le vostre esigenze. Alcuni esempi comuni:
- `"0 2 * * *"`: ogni giorno alle 2:00 del mattino
- `"0 */6 * * *"`: ogni 6 ore
- `"0 3 * * 0"`: ogni domenica alle 3:00 del mattino
:::

### 3. Applicare la configurazione

```bash
kubectl apply -f mysql-with-backup.yaml
```

### 4. Adattare la strategia di retention

La `cleanupStrategy` utilizza le opzioni di retention di Restic. Ecco alcuni esempi:

| Strategia | Descrizione |
|---|---|
| `--keep-last=3` | Conservare gli ultimi 3 snapshot |
| `--keep-daily=7` | Conservare 1 snapshot al giorno per 7 giorni |
| `--keep-weekly=4` | Conservare 1 snapshot a settimana per 4 settimane |
| `--keep-within-weekly=1m` | Conservare tutti gli snapshot settimanali dell'ultimo mese |

Esempio per un ambiente di produzione:

```yaml title="mysql-production-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: production
spec:
  replicas: 3
  resourcesPreset: medium
  size: 50Gi

  backup:
    enabled: true
    schedule: "0 */6 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "PROD_ACCESS_KEY"
    s3SecretKey: "PROD_SECRET_KEY"
    resticPassword: "ProdResticPassword!"
```

## Verifica

Verificate che la configurazione sia stata applicata correttamente:

```bash
kubectl get mariadb example -o yaml | grep -A 10 backup
```

**Risultato atteso:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
```

:::note
Il primo backup verra eseguito secondo la pianificazione cron definita in `schedule`. Potete verificare gli snapshot disponibili con il comando Restic (vedere la guida [Come ripristinare un backup](./restore-backup.md)).
:::

## Per approfondire

- [Riferimento API](../api-reference.md): lista completa dei parametri di backup
- [Come ripristinare un backup](./restore-backup.md): procedura di ripristino da uno snapshot Restic
