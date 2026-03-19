---
title: "Come configurare l'alta disponibilita Redis"
---

# Come configurare l'alta disponibilita Redis

Questa guida spiega come distribuire un cluster Redis ad alta disponibilita su Hikube. Il servizio si basa sull'operatore **Spotahome Redis Operator** che utilizza **Redis Sentinel** per assicurare il failover automatico quando sono configurate 3 o piu repliche.

## Prerequisiti

- `kubectl` configurato per interagire con l'API Hikube
- Conoscenza delle basi di Redis (vedere l'[avvio rapido](../quick-start.md))
- Un ambiente di produzione che necessita di alta disponibilita

## Passaggi

### 1. Configurare il manifesto con 3+ repliche

Per attivare l'alta disponibilita, configurate almeno 3 repliche. Redis Sentinel viene automaticamente distribuito dall'operatore Spotahome per orchestrare l'elezione del leader e il failover:

```yaml title="redis-ha.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis-ha
spec:
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

:::note
Il `storageClass: replicated` garantisce che i volumi persistenti siano replicati a livello di storage, proteggendo i dati contro la perdita di un nodo fisico.
:::

### 2. Applicare la configurazione

```bash
kubectl apply -f redis-ha.yaml
```

### 3. Verificare il cluster Redis

Attendete che tutti i pod siano pronti:

```bash
# Verificare lo stato dei pod Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha -w
```

**Risultato atteso:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-redis-ha-0       1/1     Running   0          3m
my-redis-ha-1       1/1     Running   0          2m
my-redis-ha-2       1/1     Running   0          1m
```

Verificate anche lo stato di Redis Sentinel:

```bash
# Verificare i pod Sentinel
kubectl get pods -l app.kubernetes.io/component=sentinel,app.kubernetes.io/instance=my-redis-ha
```

### 4. Comprendere il failover automatico

Con 3 repliche, Redis Sentinel assicura le seguenti funzioni:

- **Rilevamento guasti**: Sentinel sorveglia continuamente il nodo master e le repliche
- **Elezione automatica**: se il master cade, Sentinel elegge un nuovo master tra le repliche disponibili
- **Riconfigurazione**: le repliche rimanenti vengono automaticamente riconfigurate per replicare dal nuovo master

:::tip
Il failover e completamente automatico. Nessun intervento manuale e necessario. Il tempo di commutazione e generalmente di pochi secondi.
:::

### 5. Recuperare la password

Con `authEnabled: true`, una password viene generata automaticamente e memorizzata in un Secret Kubernetes:

```bash
# Recuperare il nome del secret
kubectl get secrets | grep my-redis-ha

# Estrarre la password
kubectl get secret my-redis-ha -o jsonpath='{.data.password}' | base64 -d
```

:::warning
Attivate sempre `authEnabled: true` in produzione. Senza autenticazione, qualsiasi applicazione con accesso alla rete del cluster puo leggere e scrivere in Redis.
:::

## Verifica

Verificate che il cluster HA funzioni correttamente:

```bash
# Verificare la risorsa Redis
kubectl get redis my-redis-ha

# Verificare che tutti i pod siano Running
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha

# Verificare i servizi esposti
kubectl get svc -l app.kubernetes.io/instance=my-redis-ha
```

**Risultato atteso:**

```console
NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
my-redis-ha              ClusterIP   10.96.xxx.xxx   <none>        6379/TCP    5m
my-redis-ha-sentinel     ClusterIP   10.96.xxx.xxx   <none>        26379/TCP   5m
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `replicas`, `authEnabled` e `storageClass`
- [Come scalare verticalmente Redis](./scale-resources.md) -- Regolare le risorse CPU e memoria
