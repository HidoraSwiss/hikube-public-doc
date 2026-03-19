---
sidebar_position: 2
title: Avvio rapido
---

# Creare il vostro primo Bucket S3

Questa guida vi accompagna passo dopo passo nella creazione del vostro **primo bucket S3 Hikube** in **5 minuti** cronometrati.
Al termine di questo tutorial, disporrete di un bucket pronto all'uso, con credenziali S3 valide e una connettività operativa.

---

## 🎯 Obiettivo

Al termine di questa guida, avrete:

- Un **bucket S3 funzionante** nel vostro tenant
- Un **secret di accesso S3** generato automaticamente
- La possibilità di connettervi con strumenti standard (`aws-cli`, `mc`, ecc.)

---

## 🧰 Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- I **diritti necessari** sul vostro tenant per creare risorse
- Uno strumento S3 a vostra scelta installato (ad es. `aws-cli` o `mc`)

---

## 🚀 Passo 1: Creare il Bucket (1 minuto)

### **Preparate il file manifest**

Create un file `bucket.yaml`:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 Il nome indicato in `metadata.name` identifica la risorsa Kubernetes.
> Il nome reale del bucket S3 viene generato automaticamente.

---

### **Distribuite il bucket**

```bash
# Creare il bucket
kubectl apply -f bucket.yaml

# Verificare la creazione
kubectl get bucket example-bucket -w
```

**Risultato atteso:**

```bash
NAME             READY   AGE
example-bucket   True    15s
```

---

## 🔐 Passo 2: Recuperare le credenziali (2 minuti)

La creazione del bucket genera un `Secret` contenente una chiave `BucketInfo` (JSON).

```bash
# Recuperare e archiviare il JSON in una variabile
INFO="$(kubectl get secret bucket-example-bucket -o jsonpath='{.data.BucketInfo}' | base64 -d)"

# Esportare le variabili utili
export S3_ENDPOINT="$(echo "$INFO" | jq -r '.spec.secretS3.endpoint')"
export S3_ACCESS_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessKeyID')"
export S3_SECRET_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessSecretKey')"
export BUCKET_NAME="$(echo "$INFO" | jq -r '.spec.bucketName')"
```

> `BUCKET_NAME` è il **nome reale** del vostro bucket lato S3. Utilizzatelo nei comandi seguenti.

---

## 🌐 Passo 3: Testare la connessione S3 (2 minuti)

:::warning Accesso root S3
Con queste credenziali, **non avete** il permesso di elencare tutti i bucket dell'endpoint.
I comandi di tipo `ls` **devono puntare al vostro bucket**:
`... ls s3://$BUCKET_NAME/ ...` o `... ls <alias>/$BUCKET_NAME/ ...`
:::

### Opzione A — `aws-cli`

```bash
# Configurare un profilo temporaneo
aws configure --profile hikube
# Access Key ID:    $S3_ACCESS_KEY
# Secret Access Key: $S3_SECRET_KEY
# Default region name: (lasciare vuoto)
# Default output format: json

# Elencare il contenuto **del vostro bucket** (vuoto subito dopo la creazione)
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Inviare un file di test
echo "hello hikube" > /tmp/hello.txt
aws s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Verificare
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube
```

### Opzione B — `mc` (client S3)

```bash
# Definire un alias per l'endpoint
mc alias set hikube "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"

# ⚠️ NON fare: `mc ls hikube`  -> AccessDenied
# ✅ Puntare direttamente al vostro bucket:
mc ls "hikube/$BUCKET_NAME/"

# Inviare un file di test
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"

# Verificare
mc ls "hikube/$BUCKET_NAME/"
```

---

## 🧹 Pulizia (opzionale)

```bash
# Eliminare il bucket (cancella anche il suo contenuto)
kubectl delete buckets example-bucket
```

:::warning Eliminazione irreversibile
L'eliminazione del bucket cancella **definitivamente** tutti i dati che contiene.
Verificate i vostri backup prima di procedere.
:::

---

## 🚀 Prossimi passi

**📚 Riferimento API** → [Specifica completa](./api-reference.md)
**📖 Architettura** → [Panoramica](./overview.md)

---

## 💡 Da ricordare

- Le credenziali fornite danno accesso **unicamente** al vostro bucket
- Puntate sempre a `s3://$BUCKET_NAME/` (o `alias/$BUCKET_NAME/`) nei vostri comandi
- L'endpoint S3 è compatibile con gli strumenti e gli SDK standard
- Isolamento rigoroso per tenant e credenziali dedicate
