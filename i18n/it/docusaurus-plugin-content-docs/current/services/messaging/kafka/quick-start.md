---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire Kafka in 5 minuti

Questa guida vi accompagna passo dopo passo nella distribuzione del vostro primo **cluster Kafka** su Hikube, dal manifesto YAML fino ai primi test di messaggistica.

---

## Obiettivi

Al termine di questa guida, avrete:

- Un **cluster Kafka** distribuito e operativo su Hikube
- **3 broker Kafka** e **3 nodi ZooKeeper** per l'alta disponibilità
- Un **topic** pronto a ricevere messaggi
- Un **archivio persistente** per i vostri dati Kafka e ZooKeeper

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** dedicato per ospitare il vostro cluster Kafka
- **kafkacat** (o `kcat`) installato sulla vostra postazione (opzionale, per i test)

---

## Passo 1: Creare il manifesto Kafka

Create un file `kafka.yaml` con la seguente configurazione:

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: example
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
    storageClass: replicated
  topics:
    - name: my-topic
      partitions: 3
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
```

:::tip
Kafka non dispone di autenticazione predefinita su Hikube. Per un utilizzo in produzione, si raccomanda di non esporre il cluster all'esterno (`external: false`). Consultate il [Riferimento API](./api-reference.md) per la configurazione completa.
:::

---

## Passo 2: Distribuire il cluster Kafka

Applicate il manifesto e verificate che la distribuzione sia avviata:

```bash
# Applicare il manifesto
kubectl apply -f kafka.yaml
```

Verificate lo stato del cluster (può richiedere 2-3 minuti):

```bash
kubectl get kafka
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.13.0
```

---

## Passo 3: Verifica dei pod

Verificate che tutti i pod siano nello stato `Running`:

```bash
kubectl get pods | grep kafka
```

**Risultato atteso:**

```console
kafka-example-kafka-0        1/1     Running   0   2m
kafka-example-kafka-1        1/1     Running   0   2m
kafka-example-kafka-2        1/1     Running   0   2m
kafka-example-zookeeper-0    1/1     Running   0   2m
kafka-example-zookeeper-1    1/1     Running   0   2m
kafka-example-zookeeper-2    1/1     Running   0   2m
```

Con `kafka.replicas: 3` e `zookeeper.replicas: 3`, ottenete **6 pod**:

| Prefisso | Ruolo | Numero |
|----------|-------|--------|
| `kafka-example-kafka-*` | **Broker Kafka** (ricezione, archiviazione e distribuzione dei messaggi) | 3 |
| `kafka-example-zookeeper-*` | **ZooKeeper** (coordinamento del cluster ed elezione del leader) | 3 |

---

## Passo 4: Recuperare le credenziali

Kafka su Hikube non dispone di autenticazione predefinita. Le connessioni avvengono direttamente tramite il servizio bootstrap:

```bash
kubectl get svc | grep kafka
```

**Risultato atteso:**

```console
kafka-example-kafka-bootstrap    ClusterIP      10.96.xx.xx    <none>        9092/TCP    2m
kafka-example-kafka-brokers      ClusterIP      None           <none>        9092/TCP    2m
kafka-example-zookeeper-client   ClusterIP      10.96.xx.xx    <none>        2181/TCP    2m
```

:::note
Il servizio `kafka-example-kafka-bootstrap` è il punto di accesso principale per i client Kafka.
:::

---

## Passo 5: Connessione e test

### Port-forward del servizio Kafka

```bash
kubectl port-forward svc/kafka-example-kafka-bootstrap 9092:9092 &
```

### Pubblicare e consumare un messaggio

```bash
# Inviare un messaggio sul topic
echo "Hello Hikube!" | kafkacat -b localhost:9092 -t my-topic -P

# Consumare il messaggio
kafkacat -b localhost:9092 -t my-topic -C -o beginning -e
```

**Risultato atteso:**

```console
Hello Hikube!
```

:::note
Se non avete `kafkacat`, potete installarlo con `apt install kafkacat` (Debian/Ubuntu) o `brew install kcat` (macOS).
:::

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del broker in errore
kubectl logs kafka-example-kafka-0

# Verificare gli eventi del pod
kubectl describe pod kafka-example-kafka-0
```

**Cause frequenti:** memoria insufficiente (`kafka.resources.memory` troppo bassa), volume di archiviazione pieno.

### Kafka non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep kafka

# Verificare il servizio bootstrap
kubectl describe svc kafka-example-kafka-bootstrap
```

**Cause frequenti:** port-forward non attivo, porta errata nella stringa di connessione, servizio non pronto.

### ZooKeeper in errore

```bash
# Verificare i log di ZooKeeper
kubectl logs kafka-example-zookeeper-0

# Verificare lo stato dei pod ZooKeeper
kubectl get pods | grep zookeeper
```

**Cause frequenti:** il quorum ZooKeeper richiede un numero dispari di repliche (minimo 3 raccomandato), spazio su disco insufficiente.

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster Kafka
kubectl describe kafka example
```

---

## Passo 7: Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f kafka.yaml
```

:::warning
Questa azione elimina il cluster Kafka e tutti i dati associati. Questa operazione è **irreversibile**.
:::

---

## Riepilogo

Avete distribuito:

- Un cluster Kafka con **3 broker** distribuiti su nodi diversi
- **3 nodi ZooKeeper** per il coordinamento del cluster
- Un **topic** configurato con 3 partizioni e 3 repliche
- Un archivio persistente per la durabilità dei dati

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni Kafka
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso Kafka su Hikube
