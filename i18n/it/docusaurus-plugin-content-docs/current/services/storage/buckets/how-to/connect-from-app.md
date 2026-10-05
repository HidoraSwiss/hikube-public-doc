---
title: "Come collegare un bucket da un'applicazione"
---

# Come collegare un bucket da un'applicazione

Questa guida spiega come utilizzare le credenziali di un utente S3 Hikube da un'applicazione: variabili d'ambiente, SDK Python (boto3) e iniezione in un pod del suo cluster Kubernetes.

## Prerequisiti

- Un **bucket** e un **utente S3** creati dalla [console Hikube](https://console.hikube.cloud), con le relative chiavi (vedere [Gestire gli utenti e le chiavi di accesso](./configure-access.md))
- A seconda dei casi: **AWS CLI**, **Python con boto3** (`pip install boto3`), oppure un **cluster Kubernetes** e il relativo kubeconfig

## Passaggi

### 1. Raccogliere le informazioni di connessione

| Informazione | Dove trovarla |
|-------------|---------------|
| Endpoint | Pagina del bucket, scheda **Access & Configuration**, campo **Endpoint** |
| Nome del bucket S3 | Stessa scheda, campo **Bucket name** |
| Access Key ID / Secret Access Key | Mostrate alla creazione dell'utente |

:::note
Il nome del bucket S3 è generato dalla piattaforma e differisce dal nome scelto nella console. Utilizzi sempre il nome S3 nella sua applicazione.
:::

### 2. Esporre le credenziali come variabili d'ambiente

La maggior parte degli SDK e degli strumenti S3 legge le variabili standard:

```bash
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export S3_ENDPOINT="https://<endpoint>"
export BUCKET_NAME="<bucket>"
```

Esegua un test con AWS CLI:

```bash
# Caricare, elencare e scaricare un file
aws s3 cp fichier.txt "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 cp "s3://$BUCKET_NAME/fichier.txt" ./fichier-download.txt --endpoint-url "$S3_ENDPOINT"
```

### 3. Utilizzare il bucket con Python (boto3)

```python title="s3_example.py"
import os

import boto3

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)
bucket_name = os.environ["BUCKET_NAME"]

# Upload di un file
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload completato")

# Download di un file
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download completato")

# Elencare gli oggetti
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} byte)")
```

```bash
python s3_example.py
```

### 4. Utilizzare il bucket da un cluster Kubernetes

Se la sua applicazione è in esecuzione in un [cluster Kubernetes Hikube](../../../kubernetes/overview.md), memorizzi le credenziali in un Secret **del suo cluster** (con il kubeconfig scaricato dalla pagina del cluster):

```bash
kubectl create secret generic s3-credentials \
  --from-literal=AWS_ACCESS_KEY_ID="<access-key>" \
  --from-literal=AWS_SECRET_ACCESS_KEY="<secret-key>" \
  --from-literal=S3_ENDPOINT="https://<endpoint>" \
  --from-literal=BUCKET_NAME="<bucket>"
```

Le inietti nella sua applicazione:

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
      containers:
        - name: app
          image: my-app:latest
          envFrom:
            - secretRef:
                name: s3-credentials
```

```bash
kubectl apply -f app-with-bucket.yaml
```

:::tip
Non versioni le chiavi nei suoi manifest. Crei il Secret separatamente (o tramite il suo strumento di gestione dei segreti) e lo referenzi unicamente tramite il suo nome.
:::

## Verifica

1. Carichi un file di test e ne verifichi la presenza:

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
```

**Risultato atteso:**

```console
2026-01-15 10:30:00          5 test.txt
```

2. Elimini il file di test:

```bash
aws s3 rm "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
```

## Per approfondire

- [Gestire gli utenti e le chiavi di accesso](./configure-access.md)
- [Risoluzione dei problemi](../troubleshooting.md)
