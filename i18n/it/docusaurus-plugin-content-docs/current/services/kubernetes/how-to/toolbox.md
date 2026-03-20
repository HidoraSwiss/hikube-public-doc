---
title: Accesso e strumenti
---

# Accesso e strumenti

## Recupero del Kubeconfig

Una volta distribuito il cluster, recuperate le credenziali di accesso:

```bash
# Kubeconfig admin completo
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Kubeconfig in sola lettura (se configurato)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

## Configurazione RBAC

Dopo la distribuzione, configurate gli accessi utente:

```bash
# Connettersi al cluster
export KUBECONFIG=cluster-admin.yaml

# Creare ruoli e binding
kubectl apply -f rbac-config.yaml
```

---

## Monitoring e Osservabilita

### Metriche del Cluster

```bash
# Stato generale del cluster Hikube
kubectl get kubernetes <cluster-name> -o yaml

# Nodi del cluster Kubernetes
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Metriche delle risorse
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

### Log e Debugging

```bash
# Eventi del cluster
kubectl describe kubernetes <cluster-name>

# Log dei componenti
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Stato dettagliato delle macchine
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

## Gestione del Ciclo di Vita

### Aggiornamento

```bash
# Aggiornamento del cluster
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # Nuova versione Kubernetes
'
```

### Scaling

```bash
# Scaling di un node group
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Aumentare il limite
'
```

### Eliminazione

```bash
# ATTENZIONE: Eliminazione irreversibile del cluster
kubectl delete kubernetes <cluster-name>
```

---

## Risoluzione dei problemi

### Problemi Comuni

```bash
# Cluster bloccato in creazione
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Nodi non pronti
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-on in errore
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

### Log Dettagliati

```bash
# Log Cluster API
kubectl logs -n capi-system -l control-plane=controller-manager

# Log Kamaji (piano di controllo)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# Log KubeVirt (worker)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```
