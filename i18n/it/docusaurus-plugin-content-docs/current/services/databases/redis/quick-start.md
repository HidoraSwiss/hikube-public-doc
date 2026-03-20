---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire Redis in 5 minuti

Questa guida vi accompagna passo dopo passo nel deployment del vostro primo cluster **Redis** su Hikube, dal manifesto YAML fino ai primi test di connessione.

---

## Obiettivi

Alla fine di questa guida, avrete:

- Un cluster **Redis** distribuito su Hikube
- Un'architettura composta da un **master** e delle **repliche** per garantire l'alta disponibilità
- **Redis Sentinel** configurato per l'auto-failover
- Un accesso Redis sicuro con le vostre credenziali di autenticazione
- Un'archiviazione persistente collegata per conservare i dati oltre i riavvii

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** dedicato per ospitare il vostro cluster Redis
- **redis-cli** installato sulla vostra postazione (opzionale, per i test di connessione)

---

## Passo 1: Creare il manifesto Redis

Create un file `redis.yaml` con la seguente configurazione:

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  # Numero di repliche Redis (alta disponibilità se >1)
  replicas: 3

  # Profilo di risorse predefinito (nano, micro, small, medium, large, xlarge, 2xlarge)
  resourcesPreset: nano

  # Oppure definire le risorse esplicitamente (sostituisce resourcesPreset)
  resources:
    cpu: 3000m
    memory: 3Gi

  # Dimensione del disco persistente per istanza
  size: 1Gi
  storageClass: ""

  # Attivare l'autenticazione Redis
  authEnabled: true

  # Esporre il servizio Redis all'esterno del cluster
  external: true
```

:::tip
Se `resources` e definito, il valore di `resourcesPreset` viene ignorato. Consultate il [Riferimento API](./api-reference.md) per la lista completa dei preset disponibili.
:::

---

## Passo 2: Distribuire il cluster Redis

Applicate il manifesto e verificate che il deployment inizi:

```bash
# Applicare il manifesto
kubectl apply -f redis.yaml
```

Verificate lo stato del cluster (può richiedere 1-2 minuti):

```bash
kubectl get redis
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    1m39s   0.10.0
```

---

## Passo 3: Verifica dei pod

Verificate che tutti i pod siano nello stato `Running`:

```bash
kubectl get po -o wide | grep redis
```

**Risultato atteso:**

```console
rfr-redis-example-0                               2/2     Running     0     7m7s    10.244.2.109   gld-csxhk-006   <none>   <none>
rfr-redis-example-1                               2/2     Running     0     7m7s    10.244.2.114   luc-csxhk-005   <none>   <none>
rfr-redis-example-2                               2/2     Running     0     7m7s    10.244.2.111   plo-csxhk-004   <none>   <none>
rfs-redis-example-7b65c79ccb-dkqqz                1/1     Running     0     7m7s    10.244.2.112   luc-csxhk-005   <none>   <none>
rfs-redis-example-7b65c79ccb-kvjt8                1/1     Running     0     7m7s    10.244.2.108   gld-csxhk-006   <none>   <none>
rfs-redis-example-7b65c79ccb-xwk7v                1/1     Running     0     7m7s    10.244.2.110   plo-csxhk-004   <none>   <none>
```

Con `replicas: 3`, ottenete **6 pod** distribuiti su diversi datacenter:

| Prefisso | Ruolo | Numero |
|---------|------|--------|
| `rfr-redis-example-*` | **Redis** (master + repliche) | 3 |
| `rfs-redis-example-*` | **Redis Sentinel** (supervisione e auto-failover) | 3 |

---

## Passo 4: Recuperare le credenziali

Se `authEnabled: true`, una password viene generata automaticamente in un Secret Kubernetes:

```bash
kubectl get secret redis-example-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
password: QkP9bhppEFCQcXIXLzEAhAUBlMYEVFNZ
```

---

## Passo 5: Connessione e test

### Accesso esterno (se `external: true`)

Recuperate l'IP esterno del LoadBalancer:

```bash
kubectl get svc | grep redis
```

```console
redis-example-external-lb            LoadBalancer   10.96.156.151   91.223.132.41   6379/TCP    13m
redis-example-metrics                ClusterIP      10.96.58.67     <none>          9121/TCP    13m
rfr-redis-example                    ClusterIP      None            <none>          9121/TCP    13m
rfrm-redis-example                   ClusterIP      10.96.109.194   <none>          6379/TCP    13m
rfrs-redis-example                   ClusterIP      10.96.118.28    <none>          6379/TCP    13m
rfs-redis-example                    ClusterIP      10.96.176.169   <none>          26379/TCP   13m
```

Il servizio `redis-example-external-lb` espone Redis sull'IP esterno `91.223.132.41`.

### Accesso tramite port-forward (se `external: false`)

```bash
kubectl port-forward svc/rfrm-redis-example 6379:6379 &
```

### Test con redis-cli

```bash
# Recuperare la password
REDIS_PASSWORD=$(kubectl get secret redis-example-auth -o jsonpath="{.data.password}" | base64 -d)

# Test PING
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" ping
# PONG

# Creare una chiave
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" SET hello "hikube"
# OK

# Leggere la chiave
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" GET hello
# "hikube"
```

:::note
Se usate il port-forward, sostituite `91.223.132.41` con `127.0.0.1` nei comandi qui sopra.
Si raccomanda di non esporre il database all'esterno se non ne avete necessità.
:::

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod in errore
kubectl logs rfr-redis-example-0

# Verificare gli eventi
kubectl describe pod rfr-redis-example-0
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume di archiviazione pieno.

### Redis non accessibile

```bash
# Verificare che il servizio esista
kubectl get svc | grep redis

# Verificare che il LoadBalancer abbia un IP esterno
kubectl describe svc redis-example-external-lb
```

**Cause frequenti:** `external: false` nel manifesto, LoadBalancer in attesa di assegnazione IP.

### Sentinel non rileva il master

```bash
# Verificare i log di Sentinel
kubectl logs rfs-redis-example-7b65c79ccb-dkqqz

# Verificare la topologia Sentinel
kubectl exec -it rfs-redis-example-7b65c79ccb-dkqqz -- redis-cli -p 26379 SENTINEL masters
```

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster Redis
kubectl describe redis example
```

---

## Passo 7: Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f redis.yaml
```

:::warning
Questa azione elimina il cluster Redis e tutti i dati associati. Questa operazione e **irreversibile**.
:::

---

## Riepilogo

Avete distribuito:

- Un cluster Redis con **3 repliche** distribuite su datacenter diversi
- **3 pod Sentinel** per la supervisione e l'auto-failover
- Un accesso sicuro tramite password generata automaticamente
- Un'archiviazione persistente per la durabilita dei dati

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni Redis
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso Redis su Hikube
