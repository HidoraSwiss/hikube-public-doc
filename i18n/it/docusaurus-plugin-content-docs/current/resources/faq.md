---
sidebar_position: 2
title: FAQ
---

# Domande frequenti

Trovate qui le risposte alle domande più comuni sull'utilizzo di Hikube.

---

## 1. Come recuperare il mio kubeconfig?

Una volta distribuito il vostro cluster Kubernetes, recuperate il kubeconfig con:

```bash
kubectl get secret <nom-cluster>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

export KUBECONFIG=my-cluster-kubeconfig.yaml
kubectl get nodes
```

Vedi: [Kubernetes - Avvio rapido](../services/kubernetes/quick-start.md)

---

## 2. Come recuperare le credenziali del mio database?

Le credenziali sono memorizzate in un Secret Kubernetes. Il comando varia a seconda del servizio:

```bash
# Redis
kubectl get secret redis-<nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# PostgreSQL
kubectl get secret pg-<nom>-app -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# MySQL
kubectl get secret mysql-<nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Vedi: [Redis - Avvio rapido](../services/databases/redis/quick-start.md), [PostgreSQL - Avvio rapido](../services/databases/postgresql/quick-start.md), [MySQL - Avvio rapido](../services/databases/mysql/quick-start.md)

---

## 3. Come esporre un servizio all'esterno?

Sono disponibili due opzioni:

**Opzione 1: Accesso esterno tramite LoadBalancer** (consigliato per la produzione)

Aggiungete `external: true` nel manifesto YAML del vostro servizio. Un LoadBalancer con un IP pubblico verrà creato automaticamente.

```yaml
spec:
  external: true
```

**Opzione 2: Port-forward** (consigliato per lo sviluppo)

```bash
kubectl port-forward svc/<nom-du-service> <port-local>:<port-service>
```

:::note
Si consiglia di non esporre i database all'esterno se non ne avete la necessità.
:::

---

## 4. Qual è la differenza tra `resources` e `resourcesPreset`?

- **`resourcesPreset`**: profilo predefinito (nano, micro, small, medium, large, xlarge, 2xlarge) che alloca automaticamente CPU e memoria.
- **`resources`**: permette di definire **esplicitamente** i valori di CPU e memoria.

Se `resources` è definito, `resourcesPreset` viene **ignorato**.

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Vedi: [Redis - Riferimento API](../services/databases/redis/api-reference.md)

---

## 5. Come scegliere il mio instanceType per Kubernetes?

Il parametro `instanceType` nei `nodeGroups` determina le risorse di ogni nodo worker:

| Instance Type | vCPU | RAM |
|---------------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |

Scegliete in base ai vostri workload:
- **Applicazioni web classiche**: `s1.large` (buon equilibrio costo/prestazioni)
- **Applicazioni con elevato consumo di memoria**: `s1.xlarge` o `s1.2xlarge`
- **Ambienti di sviluppo**: `s1.small` o `s1.medium`

Vedi: [Kubernetes - Riferimento API](../services/kubernetes/api-reference.md)

---

## 6. Come attivare i backup S3?

Per i database che lo supportano (PostgreSQL, ClickHouse), aggiungete la sezione `backup` nel vostro manifesto:

```yaml
spec:
  backup:
    enabled: true
    s3:
      endpoint: "https://s3.example.com"
      bucket: "my-backups"
      accessKey: "ACCESS_KEY"
      secretKey: "SECRET_KEY"
```

Vedi: [PostgreSQL - Riferimento API](../services/databases/postgresql/api-reference.md)

---

## 7. Come accedere a Grafana e alle mie dashboard?

Se il monitoring è attivato sul vostro tenant, Grafana è accessibile tramite un URL dedicato. Per trovarlo:

```bash
# Verificare gli Ingress di monitoring
kubectl get ingress -n monitoring

# Oppure verificare i servizi
kubectl get svc -n monitoring | grep grafana
```

Le dashboard sono preconfigurate per ogni tipo di risorsa (Kubernetes, database, VM, ecc.).

Vedi: [Concetti chiave - Osservabilità](../getting-started/concepts.md)

---

## 8. Come scalare il mio cluster?

### Scalare le repliche di un database

Modificate il campo `replicas` nel vostro manifesto e riapplicate:

```yaml
spec:
  replicas: 5  # Augmenter le nombre de réplicas
```

```bash
kubectl apply -f <manifeste>.yaml
```

### Scalare i nodi Kubernetes

I nodi scalano automaticamente tra `minReplicas` e `maxReplicas` in base al carico. Per modificare i limiti, regolate la configurazione del `nodeGroup`:

```yaml
spec:
  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 10
```

Vedi: [Kubernetes - Avvio rapido](../services/kubernetes/quick-start.md)

---

## 9. Quali sono le storageClass disponibili?

| StorageClass | Descrizione |
|-------------|-------------|
| `""` (predefinita) | Archiviazione standard, dati su un singolo datacenter |
| `replicated` | Archiviazione replicata su più datacenter, alta disponibilità |

Utilizzate `replicated` per i workload di produzione che richiedono tolleranza ai guasti hardware.

```yaml
spec:
  storageClass: replicated
```

Vedi: [Kubernetes - Riferimento API](../services/kubernetes/api-reference.md)

---

## 10. Come funziona l'auto-failover sui database?

Ogni servizio di database gestito dispone di un meccanismo di auto-failover:

| Servizio | Meccanismo | Funzionamento |
|---------|-----------|----------------|
| **Redis** | Redis Sentinel | Monitora il master, promuove automaticamente una replica in caso di guasto |
| **PostgreSQL** | CloudNativePG | Rilevamento del guasto e promozione automatica di uno standby |
| **MySQL** | MySQL Operator | Replica semi-sincrona con failover automatico |
| **ClickHouse** | ClickHouse Keeper | Consenso distribuito per il coordinamento di shard e repliche |
| **RabbitMQ** | Quorum Queues | Replica Raft per la tolleranza ai guasti dei messaggi |

L'auto-failover è **attivato per impostazione predefinita** quando `replicas > 1`. Nessuna configurazione aggiuntiva è necessaria.

Vedi: [Redis - Panoramica](../services/databases/redis/overview.md), [PostgreSQL - Panoramica](../services/databases/postgresql/overview.md)

---

## 11. Perché `kubectl get ... -A` restituisce "Forbidden"?

Il flag `-A` (`--all-namespaces`) effettua una richiesta a **livello cluster** (cluster scope). Tuttavia, gli utenti tenant dispongono unicamente di **ruoli limitati al loro namespace**. Kubernetes non filtra automaticamente i namespace autorizzati: la richiesta cluster-scope viene rifiutata integralmente.

**Soluzione:** non utilizzare `-A`. Il vostro kubeconfig definisce già il vostro namespace di destinazione, i comandi funzionano direttamente:

```bash
# Corretto
kubectl get pods
kubectl get kubernetes

# Errato (Forbidden)
kubectl get pods -A
kubectl get kubernetes -A
```

I comandi `kubectl config` (locali) non sono interessati:
```bash
# Funziona sempre
kubectl config current-context
kubectl config get-contexts
```
