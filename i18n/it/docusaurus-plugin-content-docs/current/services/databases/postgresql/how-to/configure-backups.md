---
title: "Come configurare i backup automatici"
---

# Come configurare i backup automatici

Questa guida spiega come attivare e configurare i backup automatici del vostro database PostgreSQL verso uno storage compatibile S3, tramite l'operatore CloudNativePG.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **PostgreSQL** distribuita su Hikube (o un manifesto pronto per il deployment)
- Un **bucket S3-compatible** accessibile (Hikube Object Storage, AWS S3, ecc.)
- Le **credenziali S3**: access key, secret key, URL dell'endpoint

## Passaggi

### 1. Preparare le credenziali S3

Prima di attivare i backup, raccogliete le seguenti informazioni:

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| `destinationPath` | Percorso S3 del bucket di destinazione | `s3://backups/postgresql/production/` |
| `endpointURL` | URL dell'endpoint S3 | `http://minio-gateway-service:9000` |
| `s3AccessKey` | Chiave di accesso S3 | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu` |
| `s3SecretKey` | Chiave segreta S3 | `ju3eum4dekeich9ahM1te8waeGai0oog` |

:::tip
Se utilizzate lo storage oggetti Hikube, l'endpoint predefinito e `http://minio-gateway-service:9000`. Per un fornitore esterno (AWS S3, Scaleway, ecc.), inserite l'URL corrispondente.
:::

### 2. Creare il manifesto PostgreSQL con backup attivato

Create o modificate il vostro manifesto per includere la sezione `backup`:

```yaml title="postgresql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

**Dettaglio dei parametri di backup:**

| Parametro | Descrizione | Valore predefinito |
|-----------|-------------|-------------------|
| `backup.enabled` | Attiva i backup automatici | `false` |
| `backup.schedule` | Pianificazione cron (qui: ogni giorno alle 2) | `"0 2 * * * *"` |
| `backup.retentionPolicy` | Durata di retention dei backup | `"30d"` |
| `backup.destinationPath` | Percorso S3 di destinazione | _(richiesto)_ |
| `backup.endpointURL` | URL dell'endpoint S3 | _(richiesto)_ |
| `backup.s3AccessKey` | Chiave di accesso S3 | _(richiesto)_ |
| `backup.s3SecretKey` | Chiave segreta S3 | _(richiesto)_ |

:::note
La pianificazione `schedule` utilizza la sintassi cron standard. Esempi comuni:
- `"0 2 * * *"`: ogni giorno alle 2:00
- `"0 */6 * * *"`: ogni 6 ore
- `"0 2 * * 0"`: ogni domenica alle 2:00
:::

### 3. Applicare la configurazione

```bash
kubectl apply -f postgresql-with-backup.yaml
```

### 4. Verificare che i backup siano configurati

Verificate che l'istanza PostgreSQL sia stata distribuita con il backup attivato:

```bash
kubectl get postgres my-database -o yaml | grep -A 10 backup
```

**Risultato atteso:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: http://minio-gateway-service:9000
```

## Verifica

Per confermare che i backup funzionino correttamente:

1. **Verificate i log** del pod PostgreSQL primary per i messaggi relativi ai backup:

```bash
kubectl logs postgres-my-database-1 -c postgres | grep -i backup
```

2. **Verificate il contenuto del bucket S3** per confermare che i file WAL e i backup base vengano inviati.

3. **Verificate gli eventi** legati all'istanza:

```bash
kubectl describe postgres my-database
```

:::warning
Testate regolarmente il ripristino dei vostri backup. Un backup che non è mai stato testato non è un backup affidabile. Consultate la guida [Come ripristinare un backup (PITR)](./restore-backup.md).
:::

## Per approfondire

- **[Riferimento API PostgreSQL](../api-reference.md)**: documentazione completa di tutti i parametri di backup
- **[Come ripristinare un backup (PITR)](./restore-backup.md)**: ripristinare i vostri dati a un istante preciso
