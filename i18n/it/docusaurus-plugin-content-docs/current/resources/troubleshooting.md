---
sidebar_position: 1
title: Risoluzione dei problemi globale
---

# Risoluzione dei problemi globale Hikube

Questa guida copre i problemi più comuni riscontrati su Hikube e le loro soluzioni.

---

## 1. Diagnostica generale

Prima di cercare una soluzione specifica, iniziate con questi comandi di diagnostica:

```bash
# Stato delle risorse nel vostro namespace
kubectl get all

# Eventi recenti (ordinati per data)
kubectl get events --sort-by=.metadata.creationTimestamp

# Descrizione dettagliata di una risorsa
kubectl describe <type> <nom>

# Log di un pod
kubectl logs <nom-du-pod>

# Log del contenitore precedente (in caso di crash)
kubectl logs <nom-du-pod> --previous
```

---

## 2. Pod in errore

### CrashLoopBackOff

**Sintomo:** Il pod si riavvia in loop, lo stato mostra `CrashLoopBackOff`.

**Diagnostica:**

```bash
kubectl describe pod <nom-du-pod>
kubectl logs <nom-du-pod> --previous
```

**Soluzioni:**
- **Memoria insufficiente**: aumentate `resources.memory` o utilizzate un `resourcesPreset` più elevato
- **Errore di configurazione**: verificate le variabili d'ambiente e i file di configurazione nei log
- **Dipendenza mancante**: verificate che i servizi richiesti (database, secret) siano disponibili

---

### Pending

**Sintomo:** Il pod resta in stato `Pending` senza avviarsi.

**Diagnostica:**

```bash
kubectl describe pod <nom-du-pod>
# Cercate la sezione "Events" in fondo all'output
```

**Soluzioni:**
- **Risorse insufficienti**: il cluster non ha abbastanza CPU/memoria. Verificate i nodi disponibili con `kubectl get nodes` e `kubectl top nodes`
- **PVC non collegato**: il volume persistente richiesto non è disponibile (vedi sezione Archiviazione)
- **NodeSelector/Affinity**: il pod ha vincoli di posizionamento che non corrispondono a nessun nodo

---

### ImagePullBackOff

**Sintomo:** Il pod non si avvia, lo stato mostra `ImagePullBackOff` o `ErrImagePull`.

**Diagnostica:**

```bash
kubectl describe pod <nom-du-pod>
# Cercate "Failed to pull image" negli eventi
```

**Soluzioni:**
- **Immagine non trovata**: verificate il nome e il tag dell'immagine nel vostro manifesto
- **Registry privato**: assicuratevi che un `imagePullSecret` sia configurato
- **Problema di rete**: verificate la connettività verso il registry

---

### OOMKilled

**Sintomo:** Il pod viene terminato con il codice di uscita `137` e il motivo `OOMKilled`.

**Diagnostica:**

```bash
kubectl describe pod <nom-du-pod>
# Cercate "Last State: Terminated - Reason: OOMKilled"
```

**Soluzioni:**
- Aumentate il limite di memoria in `resources.memory` o passate a un `resourcesPreset` superiore
- Verificate se l'applicazione ha una perdita di memoria osservando il consumo con `kubectl top pod`

---

## 3. Accesso al cluster

### Kubeconfig non valido

**Sintomo:** `error: You must be logged in to the server (Unauthorized)`

**Diagnostica:**

```bash
# Verificare il file kubeconfig utilizzato
echo $KUBECONFIG
kubectl config current-context
```

**Soluzioni:**
- Rigenerate il kubeconfig dal vostro cluster Hikube:
  ```bash
  kubectl get secret <nom-cluster>-admin-kubeconfig \
    -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
    > my-cluster-kubeconfig.yaml
  export KUBECONFIG=my-cluster-kubeconfig.yaml
  ```
- Verificate che la variabile `KUBECONFIG` punti al file corretto

---

### Certificato scaduto

**Sintomo:** `Unable to connect to the server: x509: certificate has expired`

**Diagnostica:**

```bash
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d | openssl x509 -text -noout | grep -A2 Validity
```

**Soluzione:** Recuperate un nuovo kubeconfig aggiornato dal Secret del cluster (vedi sopra).

---

### Connessione rifiutata

**Sintomo:** `The connection to the server was refused`

**Diagnostica:**

```bash
# Testare la connettività
kubectl cluster-info
```

**Soluzioni:**
- Verificate che il cluster sia in stato `Ready`: `kubectl get kubernetes <nom-cluster>`
- Verificate che il control plane sia accessibile dalla vostra rete
- Se utilizzate una VPN, assicuratevi che sia attiva

---

## 4. Archiviazione

### PVC in stato Pending

**Sintomo:** Il PVC resta in `Pending` e i pod dipendenti non si avviano.

**Diagnostica:**

```bash
kubectl get pvc
kubectl describe pvc <nom-du-pvc>
```

**Soluzioni:**
- **StorageClass non valida**: verificate che la `storageClass` specificata esista con `kubectl get storageclass`
- **Capacità insufficiente**: riducete la dimensione richiesta o contattate il supporto per aumentare le quote
- **StorageClass vuota**: se `storageClass: ""`, viene utilizzata la classe predefinita. Provate `storageClass: replicated` esplicitamente

---

### Spazio disco insufficiente

**Sintomo:** I pod si bloccano con errori di tipo `No space left on device`.

**Diagnostica:**

```bash
# Verificare l'utilizzo dei PVC
kubectl exec -it <nom-du-pod> -- df -h
```

**Soluzioni:**
- Aumentate il valore di `size` nel manifesto e riapplicate
- Eliminate i dati inutili (log, file temporanei)

---

## 5. Rete

### Servizio non accessibile

**Sintomo:** Impossibile connettersi al servizio dall'esterno o tra pod.

**Diagnostica:**

```bash
# Verificare che il servizio esista e abbia un endpoint
kubectl get svc
kubectl get endpoints <nom-du-service>

# Testare la connettività da un pod
kubectl run test-net --image=busybox --rm -it -- wget -qO- http://<nom-du-service>:<port>
```

**Soluzioni:**
- **Nessun endpoint**: le label del `selector` del servizio non corrispondono a nessun pod
- **External non attivato**: aggiungete `external: true` nel manifesto per creare un LoadBalancer
- **Porta errata**: verificate che la porta del servizio corrisponda alla porta esposta dall'applicazione

---

### DNS non risolto

**Sintomo:** `Could not resolve host` durante l'accesso a un servizio tramite il suo nome.

**Diagnostica:**

```bash
# Verificare il DNS del cluster
kubectl run test-dns --image=busybox --rm -it -- nslookup <nom-du-service>

# Verificare i pod CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Soluzioni:**
- Utilizzate il nome DNS completo: `<service>.<namespace>.svc.cluster.local`
- Verificate che i pod CoreDNS siano in stato `Running`

---

### Ingress restituisce 404 o 502

**Sintomo:** L'URL dell'Ingress restituisce un errore 404 (Not Found) o 502 (Bad Gateway).

**Diagnostica:**

```bash
kubectl describe ingress <nom-de-lingress>
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

**Soluzioni:**
- **404**: verificate che il `path` e l'`host` dell'Ingress corrispondano alla vostra configurazione
- **502**: il servizio backend non risponde. Verificate che i pod del backend siano in stato `Running` e che la porta sia corretta
- **IngressClass mancante**: aggiungete `ingressClassName: nginx` nella spec dell'Ingress

---

## 6. Database

### Connessione rifiutata

**Sintomo:** `Connection refused` durante il tentativo di connessione al database.

**Diagnostica:**

```bash
# Verificare lo stato dei pod del database
kubectl get pods | grep <nom-de-la-base>

# Verificare i servizi
kubectl get svc | grep <nom-de-la-base>
```

**Soluzioni:**
- Verificate che i pod del database siano in stato `Running`
- Verificate le credenziali: `kubectl get secret <nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'`
- Se `external: false`, utilizzate `kubectl port-forward` per connettervi localmente

---

### Replica in ritardo

**Sintomo:** Le repliche hanno un ritardo di replica significativo rispetto al master.

**Diagnostica:**

```bash
# Redis - Verificare la replica
kubectl exec -it rfr-redis-<nom>-0 -- redis-cli -a "$REDIS_PASSWORD" INFO replication

# PostgreSQL - Verificare il ritardo
kubectl exec -it <nom>-1 -- psql -c "SELECT * FROM pg_stat_replication;"
```

**Soluzioni:**
- Aumentate le risorse (CPU/memoria) delle repliche
- Verificate il carico di rete tra i datacenter
- Riducete il carico in scrittura se il ritardo persiste

---

### Failover non attivato

**Sintomo:** Il master è in panne ma nessuna replica viene promossa.

**Diagnostica:**

```bash
# Redis - Verificare Sentinel
kubectl exec -it rfs-redis-<nom>-<id> -- redis-cli -p 26379 SENTINEL masters

# Verificare gli eventi
kubectl get events --sort-by=.metadata.creationTimestamp | grep <nom-de-la-base>
```

**Soluzioni:**
- Verificate che `replicas > 1` nel manifesto (il failover richiede almeno una replica)
- Verificate che i pod Sentinel (Redis) o l'operatore siano in stato `Running`
- Consultate i log dell'operatore per eventuali errori

---

## 7. Messaggistica (NATS, RabbitMQ)

### Produttore/consumatore disconnesso

**Sintomo:** I client perdono la connessione al broker di messaggi.

**Diagnostica:**

```bash
# Verificare lo stato dei pod del broker
kubectl get pods | grep <nats|rabbitmq>

# Verificare i log
kubectl logs <nom-du-pod-broker>
```

**Soluzioni:**
- Verificate che i pod del broker siano in stato `Running`
- Implementate una logica di riconnessione automatica lato client
- Verificate i limiti di connessione configurati

---

### Messaggi persi

**Sintomo:** Messaggi inviati non vengono mai ricevuti dai consumatori.

**Diagnostica:**

```bash
# RabbitMQ - Verificare le code
kubectl exec -it <pod-rabbitmq> -- rabbitmqctl list_queues name messages consumers

# NATS - Verificare gli stream JetStream
kubectl exec -it <pod-nats> -- nats stream ls
```

**Soluzioni:**
- **RabbitMQ**: utilizzate le Quorum Queues per garantire la durabilità dei messaggi
- **NATS**: attivate JetStream per la persistenza dei messaggi
- Verificate che i consumatori siano connessi e attivi
- Assicuratevi che le code/subject esistano prima di inviare messaggi
