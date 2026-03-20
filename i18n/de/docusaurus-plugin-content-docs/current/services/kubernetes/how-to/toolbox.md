---
title: Zugang und Tools
---

# Zugang und Tools

## Kubeconfig abrufen

Sobald der Cluster bereitgestellt ist, rufen Sie die Zugangsdaten ab:

```bash
# Vollständige Admin-Kubeconfig
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Schreibgeschützte Kubeconfig (falls konfiguriert)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

## RBAC-Konfiguration

Nach der Bereitstellung konfigurieren Sie die Benutzerzugriffe:

```bash
# Mit dem Cluster verbinden
export KUBECONFIG=cluster-admin.yaml

# Rollen und Bindings erstellen
kubectl apply -f rbac-config.yaml
```

---

## Monitoring und Observability

### Cluster-Metriken

```bash
# Allgemeiner Status des Hikube-Clusters
kubectl get kubernetes <cluster-name> -o yaml

# Knoten des Kubernetes-Clusters
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Ressourcen-Metriken
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

### Logs und Debugging

```bash
# Cluster-Events
kubectl describe kubernetes <cluster-name>

# Komponenten-Logs
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Detaillierter Status der Maschinen
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

## Lebenszyklusverwaltung

### Update

```bash
# Cluster aktualisieren
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # Neue Kubernetes-Version
'
```

### Skalierung

```bash
# Node Group skalieren
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Grenze erhöhen
'
```

### Löschung

```bash
# ACHTUNG: Irreversible Löschung des Clusters
kubectl delete kubernetes <cluster-name>
```

---

## Fehlerbehebung

### Häufige Probleme

```bash
# Cluster hängt bei der Erstellung
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Knoten nicht bereit
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-ons fehlerhaft
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

### Detaillierte Logs

```bash
# Cluster API Logs
kubectl logs -n capi-system -l control-plane=controller-manager

# Kamaji Logs (Control Plane)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# KubeVirt Logs (Workers)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```
