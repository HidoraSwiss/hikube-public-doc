---
title: "Come configurare l'accesso S3"
---

# Come configurare l'accesso S3

Ogni bucket creato su Hikube genera automaticamente una coppia di chiavi di accesso S3 unica. Questa guida spiega come recuperare queste credenziali, configurare diversi client S3 (AWS CLI, MinIO Client, rclone) e iniettare le chiavi nei vostri pod Kubernetes in modo sicuro.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un **bucket** creato su Hikube
- **jq** installato localmente
- Uno o più client S3 installati: **AWS CLI**, **mc** (MinIO Client) o **rclone**

## Passi

### 1. Comprendere il modello di accesso

Su Hikube, ogni bucket dispone della propria coppia di chiavi di accesso:

- **1 bucket = 1 coppia di chiavi** (accessKeyID + accessSecretKey)
- Le chiavi vengono generate automaticamente alla creazione del bucket
- Le credenziali sono archiviate in un Secret Kubernetes denominato `bucket-<nome-del-bucket>`
- L'endpoint S3 è comune a tutti i bucket: `https://prod.s3.hikube.cloud`

:::tip
Ogni bucket beneficia di un'archiviazione **triple-replicata** ad alta disponibilità. I vostri dati sono automaticamente distribuiti per garantire la durabilità.
:::

### 2. Recuperare le credenziali

Estraete le informazioni di connessione dal Secret Kubernetes:

```bash
kubectl get secret bucket-<nome-del-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Per estrarre i valori individualmente:

```bash
# Endpoint S3
kubectl get secret bucket-<nome-del-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.endpoint'

# Access Key
kubectl get secret bucket-<nome-del-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID'

# Secret Key
kubectl get secret bucket-<nome-del-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey'

# Nome reale del bucket
kubectl get secret bucket-<nome-del-bucket> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName'
```

:::note
Il `bucketName` restituito dal Secret è un identificativo interno (es: `bucket-1df67984-321d-492d-bb06-2f4527bb0f5b`). Differisce dal nome `metadata.name` del vostro manifesto. Utilizzate sempre questo valore per le operazioni S3.
:::

### 3. Configurare i client S3

#### AWS CLI

Configurate un profilo dedicato per Hikube:

```bash
aws configure --profile hikube
```

Inserite i seguenti valori:

```
AWS Access Key ID: <accessKeyID>
AWS Secret Access Key: <accessSecretKey>
Default region name: (lasciare vuoto)
Default output format: json
```

Utilizzate il profilo con l'endpoint Hikube:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud --profile hikube
```

#### MinIO Client (mc)

Create un alias per l'endpoint Hikube:

```bash
mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY
```

Testate la connessione:

```bash
# Elencare gli oggetti
mc ls hikube/$BUCKET_NAME

# Caricare un file
mc cp fichier.txt hikube/$BUCKET_NAME/

# Scaricare un file
mc cp hikube/$BUCKET_NAME/fichier.txt ./
```

#### rclone

Aggiungete una configurazione rclone per Hikube. Create o modificate il file `~/.config/rclone/rclone.conf`:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = https://prod.s3.hikube.cloud
access_key_id = ACCESS_KEY
secret_access_key = SECRET_KEY
acl = private
```

Testate la connessione:

```bash
# Elencare gli oggetti
rclone ls hikube:$BUCKET_NAME

# Sincronizzare una directory locale
rclone sync ./mia-cartella hikube:$BUCKET_NAME/mia-cartella

# Copiare un file
rclone copy fichier.txt hikube:$BUCKET_NAME/
```

### 4. Utilizzare il bucket in un pod Kubernetes

Per iniettare le credenziali S3 in un pod, utilizzate un `initContainer` che legge il Secret ed espone i valori come variabili d'ambiente, oppure montate direttamente il Secret:

```yaml title="app-with-bucket.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      initContainers:
      - name: extract-s3-creds
        image: bitnami/kubectl:latest
        command:
        - sh
        - -c
        - |
          SECRET=$(cat /secrets/BucketInfo)
          echo "export AWS_ACCESS_KEY_ID=$(echo $SECRET | jq -r '.spec.secretS3.accessKeyID')" > /env/s3.env
          echo "export AWS_SECRET_ACCESS_KEY=$(echo $SECRET | jq -r '.spec.secretS3.accessSecretKey')" >> /env/s3.env
          echo "export S3_ENDPOINT=$(echo $SECRET | jq -r '.spec.secretS3.endpoint')" >> /env/s3.env
          echo "export BUCKET_NAME=$(echo $SECRET | jq -r '.spec.bucketName')" >> /env/s3.env
        volumeMounts:
        - name: bucket-secret
          mountPath: /secrets
        - name: env-vars
          mountPath: /env
      containers:
      - name: app
        image: my-app:latest
        command:
        - sh
        - -c
        - |
          source /env/s3.env
          exec my-app-binary
        volumeMounts:
        - name: env-vars
          mountPath: /env
      volumes:
      - name: bucket-secret
        secret:
          secretName: bucket-app-data
      - name: env-vars
        emptyDir: {}
```

:::tip
Per un approccio più semplice, potete anche montare il Secret completo e leggere il JSON direttamente nella vostra applicazione all'avvio.
:::

### 5. Buone pratiche di sicurezza

:::warning
Non archiviate mai le vostre chiavi S3 in chiaro nei manifesti o nei repository Git. Utilizzate sempre i Secret Kubernetes per gestire le credenziali.
:::

Raccomandazioni:

- **Utilizzate i Secret Kubernetes**: le credenziali sono già archiviate in un Secret generato automaticamente. Fate riferimento ad esso piuttosto che copiare le chiavi in chiaro.
- **Non committate mai le chiavi**: aggiungete i file contenenti credenziali al vostro `.gitignore`.
- **Limitate l'accesso ai Secret**: configurate RBAC Kubernetes per restringere i namespace e gli utenti che possono leggere i Secret dei bucket.
- **Rotazione delle chiavi**: se sospettate una compromissione, eliminate e ricreate il bucket per ottenere nuove chiavi.

## Verifica

Confermate che la vostra configurazione sia funzionante con ogni client:

1. **AWS CLI**:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

2. **MinIO Client**:

```bash
mc ls hikube/$BUCKET_NAME
```

3. **rclone**:

```bash
rclone ls hikube:$BUCKET_NAME
```

Se il comando restituisce una lista vuota (bucket vuoto) o la lista degli oggetti esistenti senza errore, la configurazione è corretta.

## Per approfondire

- [Riferimento API Bucket](../api-reference.md)
- [Come connettere un bucket da un'applicazione](./connect-from-app.md)
