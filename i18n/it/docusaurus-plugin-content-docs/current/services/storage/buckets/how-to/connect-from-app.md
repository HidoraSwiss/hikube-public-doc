---
title: "Come connettere un bucket da un'applicazione"
---

# Come connettere un bucket da un'applicazione

Quando create un bucket su Hikube, un Secret Kubernetes contenente le credenziali S3 viene generato automaticamente. Questa guida spiega come recuperare queste credenziali e utilizzarle da AWS CLI, Python (boto3) o qualsiasi applicazione compatibile S3.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un **bucket** creato su Hikube (o un manifesto pronto per la distribuzione)
- **jq** installato localmente (per l'estrazione delle credenziali)
- **AWS CLI** o **Python con boto3** installato (secondo il vostro caso d'uso)

## Passi

### 1. Creare un bucket

Se non avete ancora un bucket, createne uno:

```yaml title="my-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-data
```

Applicate il manifesto:

```bash
kubectl apply -f my-bucket.yaml
```

Verificate che il bucket e il suo Secret siano stati creati:

```bash
kubectl get bucket app-data
kubectl get secret bucket-app-data
```

**Risultato atteso:**

```
NAME       AGE
app-data   10s

NAME                 TYPE     DATA   AGE
bucket-app-data      Opaque   1      10s
```

### 2. Recuperare le credenziali S3

Il Secret `bucket-app-data` contiene una chiave `BucketInfo` in formato JSON con tutte le informazioni di connessione. Estraetele:

```bash
kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

**Risultato atteso:**

```json
{
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    }
  }
}
```

:::note
Il `bucketName` è un identificativo interno generato automaticamente. Differisce dal nome che avete dato in `metadata.name`. Utilizzate sempre `bucketName` per le operazioni S3.
:::

### 3. Utilizzare il bucket con AWS CLI

Esportate le credenziali come variabili d'ambiente:

```bash
export AWS_ACCESS_KEY_ID=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID')
export AWS_SECRET_ACCESS_KEY=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey')
export BUCKET_NAME=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName')
```

Testate la connessione:

```bash
# Elencare gli oggetti del bucket
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud

# Caricare un file
aws s3 cp fichier.txt s3://$BUCKET_NAME/ --endpoint-url https://prod.s3.hikube.cloud

# Scaricare un file
aws s3 cp s3://$BUCKET_NAME/fichier.txt ./fichier-download.txt --endpoint-url https://prod.s3.hikube.cloud
```

### 4. Utilizzare il bucket con Python (boto3)

Ecco un esempio completo di utilizzo con la libreria `boto3`:

```python title="s3_example.py"
import boto3
import json
import subprocess

# Opzione 1: Leggere le credenziali dal Secret Kubernetes
result = subprocess.run(
    ["kubectl", "get", "secret", "bucket-app-data",
     "-o", "jsonpath={.data.BucketInfo}"],
    capture_output=True, text=True
)
import base64
bucket_info = json.loads(base64.b64decode(result.stdout))

endpoint = bucket_info["spec"]["secretS3"]["endpoint"]
access_key = bucket_info["spec"]["secretS3"]["accessKeyID"]
secret_key = bucket_info["spec"]["secretS3"]["accessSecretKey"]
bucket_name = bucket_info["spec"]["bucketName"]

# Opzione 2: Utilizzare variabili d'ambiente (raccomandato in produzione)
# import os
# endpoint = "https://prod.s3.hikube.cloud"
# access_key = os.environ["AWS_ACCESS_KEY_ID"]
# secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
# bucket_name = os.environ["BUCKET_NAME"]

# Creare il client S3
s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
)

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

:::tip
In produzione, privilegiate le variabili d'ambiente o i Secret Kubernetes montati come volumi piuttosto che chiamare `kubectl` dal vostro codice applicativo.
:::

## Verifica

Confermate che la connessione funzioni correttamente:

1. **Verificate il bucket**:

```bash
kubectl get bucket app-data
```

2. **Testate un upload/download**:

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

**Risultato atteso:**

```
2024-01-15 10:30:00          5 test.txt
```

3. **Pulite il file di test**:

```bash
aws s3 rm s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
```

## Per approfondire

- [Riferimento API Bucket](../api-reference.md)
- [Come configurare l'accesso S3](./configure-access.md)
