---
title: Accesso e strumenti
---

# Accesso e strumenti

Questa guida spiega come accedere a un cluster Kubernetes Hikube una volta creato e raccoglie i comandi utili per gestirlo. Il ciclo di vita del cluster (creazione, modifica, eliminazione) si gestisce nella console; tutto il resto si svolge nel cluster con i propri strumenti abituali.

## Scaricare il kubeconfig

1. Nella console, apra **Infrastructure** > **Kubernetes** e faccia clic sul cluster.
2. Attenda che il cluster abbia lo stato **Ready**.
3. Nella sezione **Actions** della pagina di dettaglio, faccia clic su **Kubeconfig**.

Il browser scarica il file `kubeconfig-<nome-del-cluster>.yaml`. Il file conferisce un accesso amministratore al cluster.

:::warning
Conservi questo file in un luogo sicuro (gestore di segreti, cassaforte digitale) e non lo inserisca mai nel controllo di versione. Per concedere l'accesso ad altre persone, crei per loro diritti dedicati con RBAC anziché condividere questo file.
:::

## Utilizzare il kubeconfig

```bash
# Per la sessione corrente
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml

# Oppure in modo puntuale
kubectl --kubeconfig ~/Downloads/kubeconfig-<nome-del-cluster>.yaml get nodes

# Verificare la connessione
kubectl cluster-info
kubectl get nodes
```

Lo stesso file funziona con `helm`, `k9s`, `flux` o qualsiasi client Kubernetes.

## Configurare RBAC

Crei ruoli e account dedicati per i suoi team e le sue pipeline, ad esempio un accesso in sola lettura a un namespace:

```yaml title="rbac-readonly.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: viewer
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: viewer-view
  namespace: production
subjects:
  - kind: ServiceAccount
    name: viewer
    namespace: production
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f rbac-readonly.yaml
```

---

## Monitoring e osservabilità

### Nella console

La pagina di dettaglio del cluster mostra lo stato, la versione, il control plane, i **Node Pools** (numero di nodi attivi per gruppo) e le estensioni attivate.

### Nel cluster

```bash
# Nodi del cluster
kubectl get nodes -o wide

# Consumo di risorse
kubectl top nodes
kubectl top pods -A

# Eventi recenti
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

---

## Gestione del ciclo di vita

Queste operazioni si svolgono nella console:

| Operazione | Dove |
|-----------|----|
| Aggiornare la versione | **Edit** > **Kubernetes Version** ([guida](./upgrade-cluster.md)) |
| Aggiungere, modificare o eliminare un gruppo di nodi | **Edit** > **Node groups** ([guida](./manage-node-groups.md)) |
| Regolare lo scaling | **Edit** > **Minimum nodes** / **Maximum nodes** ([guida](./configure-autoscaling.md)) |
| Attivare o configurare un addon | **Edit** > **Extensions & Addons** |
| Eliminare il cluster | **Delete**, quindi conferma del nome ([avvio rapido](../quick-start.md), passaggio 7) |

---

## Diagnostica

```bash
# Nodi non pronti
kubectl describe node <nome-del-nodo>

# Pod in errore
kubectl get pods -A --field-selector=status.phase!=Running
kubectl describe pod <nome-del-pod> -n <namespace>
kubectl logs <nome-del-pod> -n <namespace> --previous

# Componenti degli addon (Cilium, CoreDNS, Ingress NGINX, ecc.)
kubectl get pods -A | grep -E "cilium|coredns|ingress-nginx|cert-manager"
```

Se un cluster resta in **Creating**, se un addon non viene distribuito o se un nodo non si unisce mai al cluster, [contatti il supporto](mailto:support@hidora.io) indicando il nome del cluster e il progetto.
