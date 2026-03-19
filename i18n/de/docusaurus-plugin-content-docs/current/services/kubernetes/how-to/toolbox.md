---
title: Zugang und Tools
---

# Zugang und Tools

## Kubeconfig abrufen

Sobald der Cluster bereitgestellt ist, rufen Sie die Zugangsdaten ab:

```bash
# Kubeconfig admin complet
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Kubeconfig lecture seule (si configuré)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

## RBAC-Konfiguration

Nach dem Deployment konfigurieren Sie die Benutzerzugriffe:

```bash
# Se connecter au cluster
export KUBECONFIG=cluster-admin.yaml

# Créer des rôles et bindings
kubectl apply -f rbac-config.yaml
```

---

## Monitoring und Observability

### Cluster-Metriken

```bash
# Status général du cluster Hikube
kubectl get kubernetes <cluster-name> -o yaml

# Nœuds du cluster Kubernetes
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Métriques de ressources
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

### Logs und Debugging

```bash
# Events du cluster
kubectl describe kubernetes <cluster-name>

# Logs des components
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Status détaillé des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

## Lebenszyklus-Verwaltung

### Update

```bash
# Mise à jour du cluster
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # Nouvelle version Kubernetes
'
```

### Skalierung

```bash
# Scaling d'un node group
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Augmenter la limite
'
```

### Löschung

```bash
# ATTENTION: Suppression irréversible du cluster
kubectl delete kubernetes <cluster-name>
```

---

## Fehlerbehebung

### Häufige Probleme

```bash
# Cluster bloqué en création
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Nœuds non prêts
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-ons en erreur
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

### Detaillierte Logs

```bash
# Logs Cluster API
kubectl logs -n capi-system -l control-plane=controller-manager

# Logs Kamaji (control plane)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# Logs KubeVirt (workers)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```
