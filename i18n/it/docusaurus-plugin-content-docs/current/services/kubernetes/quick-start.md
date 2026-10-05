---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare un cluster Kubernetes in pochi minuti

Questa guida la accompagna nella creazione del suo primo cluster Kubernetes dalla console Hikube, fino alla distribuzione di un'applicazione di test.

---

## Prerequisiti

- **Un account Hikube** e l'accesso alla [console Hikube](https://console.hikube.cloud)
- **Un progetto** con quota sufficienti (CPU, memoria, storage)
- **`kubectl` installato sulla sua postazione**, per lavorare nel cluster una volta creato
- **Nozioni di base di Kubernetes** (pod, service, deployment)

---

## Passaggio 1: Creare il cluster

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **Infrastructure** > **Kubernetes**. Viene visualizzata la pagina **Kubernetes Clusters**.
3. Faccia clic su **Create cluster**. La procedura guidata **Create a new cluster** si apre sul passaggio **General**.

---

## Passaggio 2: Configurare e convalidare

La procedura guidata comprende quattro passaggi: **General**, **Nodes**, **Addons** e **Summary**. Gli indicatori **Project Quotas** mostrano in ogni momento la parte di quota che il cluster riserverà.

### General

| Campo | Valore per questa guida |
|-------|----------------------|
| **Cluster name** | `demo-cluster` (da 3 a 16 caratteri: lettere minuscole, cifre e trattini) |
| **Kubernetes Version** | La versione preselezionata (la più recente proposta) |
| **API Endpoint (Host)** | Lasci vuoto: l'indirizzo viene generato automaticamente dalla piattaforma, senza alcuna configurazione DNS da parte sua |
| **Control Plane Instance Size** | **Medium** (il preset **Small** proposto per impostazione predefinita può non avere memoria sufficiente) |
| **Control Plane High Availability** | **3 (HA)** |

![Procedura guidata di creazione del cluster Kubernetes, passo General](/img/console/kubernetes/wizard-general.en.png)

Faccia clic su **Next**.

### Nodes

È già presente un primo gruppo, `worker-pool-1`. Lo espanda e compili:

| Campo | Valore per questa guida |
|-------|----------------------|
| **Group name** | `worker-pool-1` |
| **Ephemeral storage size** | 20 GB |
| **Minimum nodes** | 1 |
| **Maximum nodes** | 3 |
| **Instance type** | Serie **Standard (S)**, dimensione **Large** (`s1.large`, 4 vCPU, 8 GB) |
| **Exposed on the internet (Public IP)** | Attivato (imposto per il primo gruppo) |

![Procedura guidata Kubernetes, passo Nodes: gruppo di nodi e tipo di istanza](/img/console/kubernetes/wizard-nodes.en.png)

Faccia clic su **Next**.

### Addons

**Cert-Manager**, **Ingress NGINX** e **Monitoring Agents** sono selezionati per impostazione predefinita. Mantenga questa selezione per la presente guida. I blocchi della **Advanced Configuration** (Cilium, CoreDNS, Vertical Pod Autoscaler) non devono essere modificati.

![Procedura guidata Kubernetes, passo Addons](/img/console/kubernetes/wizard-addons.en.png)

Faccia clic su **Next**.

### Summary

Il **Summary** riprende l'identità del cluster, il control plane, i gruppi di nodi e gli **Enabled Extensions & Addons**. Verifichi la configurazione, quindi faccia clic su **Create cluster**.

![Procedura guidata Kubernetes, passo Summary](/img/console/kubernetes/wizard-review.en.png)


---

## Passaggio 3: Verificare lo stato

Dopo la distribuzione, la console torna all'elenco **Kubernetes Clusters**. Il cluster `demo-cluster` vi compare con lo stato **Creating**.

Il provisioning richiede alcuni minuti. Lo stato passa quindi a **Ready**.

Faccia clic sul cluster (oppure su **View Details** nel relativo menu **Actions**) per aprirne la pagina di dettaglio:

- **General**: versione di Kubernetes, preset del control plane e numero di istanze;
- **Node Pools**: ogni gruppo con il proprio tipo di istanza e il numero di nodi attivi, ad esempio «1 active node (1 to 3)»;
- **Extensions**: addon attivati.

**Risultato atteso**: stato **Ready** e almeno un nodo attivo in `worker-pool-1`.

---

## Passaggio 4: Recuperare le credenziali

Nella pagina di dettaglio del cluster, sezione **Actions**, faccia clic su **Kubeconfig**. Il browser scarica il file `kubeconfig-demo-cluster.yaml` e la console conferma: «The kubeconfig file has been downloaded.»

![Pagina di dettaglio di un cluster Kubernetes, con il pulsante Kubeconfig nella scheda Actions](/img/console/kubernetes/cluster-detail.en.png)


:::warning
Questo kubeconfig conferisce un accesso amministratore completo al cluster. Lo conservi in un luogo sicuro e non lo inserisca nel controllo di versione.
:::

---

## Passaggio 5: Connessione e test

### Connettersi al cluster

```bash
# Utilizzare il kubeconfig scaricato
export KUBECONFIG=~/Downloads/kubeconfig-demo-cluster.yaml

# Testare la connessione
kubectl get nodes
```

**Risultato atteso**: un nodo per ogni nodo attivo del gruppo, con lo stato `Ready`.

```console
NAME                        STATUS   ROLES    AGE   VERSION
demo-cluster-worker-xxxxx   Ready    <none>   2m    v1.xx.x
```

### Distribuire un'applicazione dimostrativa

```yaml title="demo-app.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-hikube
  labels:
    app: hello-hikube
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-hikube
  template:
    metadata:
      labels:
        app: hello-hikube
    spec:
      containers:
        - name: app
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: hello-hikube-service
spec:
  selector:
    app: hello-hikube
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-hikube-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-hikube-service
                port:
                  number: 80
```

```bash
kubectl apply -f demo-app.yaml

# Verificare la distribuzione
kubectl get pods -l app=hello-hikube
```

**Risultato atteso:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### Testare l'accesso

```bash
# Test diretto del Service, senza passare dall'Ingress
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080

# Recuperare l'IP esterno del controller Ingress NGINX (colonna EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller

# Testare l'Ingress senza configurare il DNS
curl -H "Host: demo.example.com" http://<EXTERNAL-IP>
```

Per pubblicare l'applicazione con il suo dominio, crei un record DNS che punti a questo IP esterno, quindi segua [Come distribuire un Ingress con TLS](./how-to/deploy-ingress-tls.md).

---

## Passaggio 6: Risoluzione rapida dei problemi

| Sintomo | Verifica |
|----------|--------------|
| Il pulsante **Next** resta disattivato e un indicatore **Project Quotas** è superato | Il progetto non dispone di quota sufficiente per il control plane e il **massimo** di nodi di ogni gruppo. Riduca il numero massimo di nodi, il modello o lo storage effimero. |
| Il cluster resta in **Creating** oltre qualche decina di minuti | [Contatti il supporto](mailto:support@hidora.io) indicando il nome del cluster e il progetto. |
| **Kubeconfig** mostra «Could not download the kubeconfig file.» | Attenda che il cluster sia **Ready**, quindi riprovi. |
| `kubectl get nodes` non elenca alcun nodo `Ready` | Verifichi in **Node Pools** il numero di nodi attivi, quindi `kubectl describe node <nome-del-nodo>`. |
| Pod in `Pending` | `kubectl describe pod <nome-del-pod>`; se i nodi sono saturi, aumenti i **Maximum nodes** tramite **Edit**. |
| L'Ingress non risponde | Verifichi che l'addon **Ingress NGINX** sia attivato e che almeno un gruppo sia **Exposed on the internet (Public IP)**. |

Per approfondire, consulti la pagina [Risoluzione dei problemi](./troubleshooting.md).

---

## Passaggio 7: Pulizia

Elimini prima l'applicazione di test:

```bash
kubectl delete -f demo-app.yaml
```

Quindi elimini il cluster dalla console:

1. In **Infrastructure** > **Kubernetes**, apra il menu **Actions** del cluster e scelga **Delete** (oppure faccia clic su **Delete** dalla relativa pagina di dettaglio).
2. Nella finestra «Delete demo-cluster?», inserisca il nome esatto del cluster per confermare.
3. Faccia clic su **Permanently delete**.

:::warning
L'eliminazione è irreversibile: tutti i dati associati al cluster vanno persi definitivamente.
:::

---

## Riepilogo

Lei ha creato:

- un cluster Kubernetes con un control plane gestito in alta disponibilità;
- un gruppo di nodi con auto-scaling da 1 a 3 nodi;
- un'applicazione di esempio esposta tramite Ingress NGINX.

## Prossimi passi

- **[Concetti](./concepts.md)**: dettaglio di ogni campo della procedura guidata
- **[Come aggiungere e modificare un gruppo di nodi](./how-to/manage-node-groups.md)**
- **[GPU](../gpu/overview.md)**: utilizzare GPU con Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Guide pratiche", href: "../how-to/manage-node-groups"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
