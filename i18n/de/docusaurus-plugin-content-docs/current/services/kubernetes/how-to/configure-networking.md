---
title: "Networking konfigurieren"
---

# Networking konfigurieren

Diese Anleitung erklärt, wie Sie die Netzwerkkonfiguration Ihres Kubernetes-Hikube-Clusters verwalten, unter Verwendung von Kubernetes-NetworkPolicies und den Observability-Tools Cilium/Hubble.

## Voraussetzungen

- Ein bereitgestellter Kubernetes-Hikube-Cluster (siehe [Schnellstart](../quick-start.md))
- Die kubeconfig des Child-Clusters konfiguriert (`export KUBECONFIG=cluster-admin.yaml`)
- Grundkenntnisse des Kubernetes-Netzwerks (Services, Pods, Namespaces)

## Schritte

### 1. Das Hikube-Netzwerk verstehen

:::note
Cilium ist das standardmäßige CNI (Container Network Interface) auf Kubernetes-Hikube-Clustern. Es bietet Netzwerk, Netzwerksicherheit und Observability.
:::

Hikube-Cluster integrieren:

- **Cilium** als CNI: Verwaltung des Pod-zu-Pod-Netzwerks, der Services und der Durchsetzung von NetworkPolicies
- **Hubble** für Observability: Echtzeit-Visualisierung der Netzwerkflüsse und Debugging

Standardmäßig können alle Pods ohne Einschränkung miteinander kommunizieren. NetworkPolicies ermöglichen es, diese Kommunikation einzuschränken.

### 2. Eine NetworkPolicy erstellen

Definieren Sie Regeln zur Steuerung des eingehenden (Ingress) und ausgehenden (Egress) Datenverkehrs Ihrer Pods:

```yaml title="network-policy.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

Diese Richtlinie:
- **Erlaubt eingehenden Datenverkehr** zu den Pods `app: web` nur von den Pods `app: frontend` auf Port 80
- **Erlaubt ausgehenden Datenverkehr** von den Pods `app: web` nur zu den Pods `app: database` auf Port 5432
- **Blockiert jeglichen anderen Datenverkehr** (eingehend und ausgehend) für die Pods `app: web`

### 3. Anwenden und testen

```bash
# NetworkPolicy anwenden
kubectl apply -f network-policy.yaml

# Prüfen, ob die Richtlinie erstellt wurde
kubectl get networkpolicies

# Erlaubte Konnektivität testen
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Blockierte Konnektivität testen (sollte fehlschlagen)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Beginnen Sie mit permissiven Richtlinien im Beobachtungsmodus und schränken Sie dann schrittweise ein. Eine zu restriktive Richtlinie kann die Kommunikation zwischen Ihren Services unterbrechen.
:::

**Beispiel einer Standard-Richtlinie zur Isolierung eines Namespace:**

```yaml title="default-deny.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

:::warning
Die Richtlinie `default-deny-all` blockiert **jeglichen Datenverkehr** im Namespace, einschließlich des DNS-Zugriffs. Wenn Sie sie anwenden, fügen Sie sofort eine Richtlinie hinzu, die den DNS-Datenverkehr (Port 53) ausgehend erlaubt, sonst wird die Namensauflösung unterbrochen.
:::

### 4. Hubble für Netzwerk-Debugging verwenden

Hubble bietet vollständige Sichtbarkeit auf die Netzwerkflüsse des Clusters. Verwenden Sie es zur Diagnose von Konnektivitätsproblemen:

```bash
# Hubble-Status prüfen
kubectl exec -n kube-system -it ds/cilium -- hubble status

# Netzwerkflüsse in Echtzeit beobachten
kubectl exec -n kube-system -it ds/cilium -- hubble observe

# Flüsse für einen bestimmten Pod filtern
kubectl exec -n kube-system -it ds/cilium -- hubble observe --pod web-xxxxx

# Von NetworkPolicies abgelehnte Flüsse anzeigen
kubectl exec -n kube-system -it ds/cilium -- hubble observe --verdict DROPPED

# Nach Namespace filtern
kubectl exec -n kube-system -it ds/cilium -- hubble observe --namespace production
```

:::tip
Der Befehl `hubble observe --verdict DROPPED` ist besonders nützlich, um von einer NetworkPolicy blockierte Flüsse zu identifizieren und Ihre Regeln anzupassen.
:::

## Überprüfung

Prüfen Sie, ob Ihre Netzwerkrichtlinien korrekt angewendet werden:

```bash
# Alle NetworkPolicies auflisten
kubectl get networkpolicies -A

# Details einer Richtlinie
kubectl describe networkpolicy allow-web

# Cilium-Status prüfen
kubectl exec -n kube-system -it ds/cilium -- cilium status
```

**Erwartetes Ergebnis für `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Vollständige Cluster-Konfiguration
- [Konzepte](../concepts.md) -- Netzwerkarchitektur und Kommunikationsflüsse
- [Ingress mit TLS bereitstellen](./deploy-ingress-tls.md) -- HTTPS-Exposition Ihrer Anwendungen
