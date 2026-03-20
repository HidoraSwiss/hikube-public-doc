---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Come funziona Redis Sentinel su Hikube?

Redis su Hikube viene distribuito tramite l'operatore **Spotahome Redis Operator**, che implementa un'architettura **Redis Sentinel** per l'alta disponibilità:

- **Redis Sentinel** sorveglia le istanze Redis ed effettua una **commutazione automatica** (failover) in caso di guasto del primary.
- Un **quorum** è necessario per decidere il failover: servono almeno **3 repliche** per garantire un quorum funzionale (maggioranza di 2 su 3).
- I client devono connettersi tramite il **servizio Sentinel** per beneficiare del failover automatico.

```yaml title="redis.yaml"
spec:
  replicas: 3    # Minimo raccomandato per il quorum Sentinel
```

:::tip
In produzione, usate sempre almeno 3 repliche per garantire il corretto funzionamento del quorum Sentinel.
:::

### Qual e la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` permette di scegliere un profilo di risorse predeterminato per ogni replica Redis. Se il campo `resources` (CPU/memoria espliciti) e definito, `resourcesPreset` viene **completamente ignorato**.

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="redis.yaml"
spec:
  # Utilizzo di un preset
  resourcesPreset: small

  # OPPURE configurazione esplicita (il preset viene allora ignorato)
  resources:
    cpu: 1000m
    memory: 1Gi
```

### Redis persiste i dati?

Si. Redis su Hikube utilizza la **persistenza RDB/AOF** combinata con volumi persistenti (PVC). I dati vengono scritti su disco e sopravvivono ai riavvii dei pod.

La scelta di `storageClass` influenza la durabilita:

- **`local`**: dati persistiti sul nodo fisico. Veloce ma vulnerabile al guasto del nodo. Raccomandato se `replicas` > 1 (la replica Redis Sentinel assicura già l'HA).
- **`replicated`**: dati replicati su più nodi. Più lento ma resiliente ai guasti. Raccomandato se `replicas` = 1 (lo storage replicato compensa l'assenza di replica applicativa).

```yaml title="redis.yaml"
spec:
  size: 2Gi
  storageClass: local    # Se replicas > 1 (Sentinel assicura l'HA)
```

### A cosa serve il parametro `authEnabled`?

Quando `authEnabled` e impostato su `true` (valore predefinito), una password viene **generata automaticamente** e memorizzata in un Secret Kubernetes. Questa password e richiesta per ogni connessione a Redis.

```yaml title="redis.yaml"
spec:
  authEnabled: true    # Valore predefinito
```

:::warning
Attivate sempre `authEnabled: true` in produzione. Disattivare l'autenticazione espone i vostri dati a qualsiasi pod che possa accedere al servizio Redis.
:::

### Come scalare Redis?

Per aumentare il numero di repliche Redis, modificate il campo `replicas` nel vostro manifesto e applicate la modifica:

```yaml title="redis.yaml"
spec:
  replicas: 5    # Aumentare il numero di repliche
```

```bash
kubectl apply -f redis.yaml
```

Redis Sentinel **riconfigura automaticamente** il cluster per integrare le nuove repliche. Nessun intervento manuale è necessario.

### Come connettersi a Redis da un pod?

1. Recuperate la password dal Secret (se `authEnabled: true`):
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```

2. Connettetevi tramite il servizio **Sentinel** (raccomandato per il failover automatico):
   ```bash
   # Servizio Sentinel
   redis-cli -h rfs-redis-<name> -p 26379 SENTINEL get-master-addr-by-name mymaster
   ```

3. Oppure connettetevi direttamente al servizio Redis:
   ```bash
   # Servizio diretto
   redis-cli -h rfr-redis-<name> -p 6379 -a <password>
   ```

:::tip
Privilegiate la connessione tramite il servizio Sentinel (`rfs-redis-<name>`) affinche le vostre applicazioni seguano automaticamente il primary in caso di failover.
:::
