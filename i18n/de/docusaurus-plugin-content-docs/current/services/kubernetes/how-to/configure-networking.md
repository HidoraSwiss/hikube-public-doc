---
title: "Networking konfigurieren"
---

# Networking konfigurieren

Dieser Leitfaden erklärt, wie Sie die Netzwerkkonfiguration Ihres Hikube-Kubernetes-Clusters verwalten, unter Verwendung von Kubernetes-NetworkPolicies und den Cilium/Hubble-Observability-Tools.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die kubeconfig des Child-Clusters konfiguriert (`export KUBECONFIG=cluster-admin.yaml`)
- Grundkenntnisse über Kubernetes-Networking (Services, Pods, Namespaces)

## Schritte

### 1. Das Hikube-Netzwerk verstehen

:::note
Cilium ist das Standard-CNI (Container Network Interface) auf Hikube-Kubernetes-Clustern. Es bietet Networking, Netzwerksicherheit und Observability.
:::

Hikube-Cluster integrieren:

- **Cilium** als CNI: Verwaltung des Pod-zu-Pod-Netzwerks, der Services und der Durchsetzung von NetworkPolicies
- **Hubble** für Observability: Echtzeit-Visualisierung der Netzwerkflüsse und Debugging

Standardmäßig können alle Pods ohne Einschränkung miteinander kommunizieren. NetworkPolicies ermöglichen es, diese Kommunikation einzuschränken.

### 2. Eine NetworkPolicy erstellen

Definieren Sie Regeln zur Steuerung des eingehenden (Ingress) und ausgehenden (Egress) Traffics Ihrer Pods:

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
- **Erlaubt eingehenden Traffic** zu den Pods `app: web` nur von den Pods `app: frontend` auf Port 80
- **Erlaubt ausgehenden Traffic** von den Pods `app: web` nur zu den Pods `app: database` auf Port 5432
- **Blockiert allen anderen Traffic** ein- und ausgehend für die Pods `app: web`

### 3. Anwenden und testen

```bash
# Appliquer la NetworkPolicy
kubectl apply -f network-policy.yaml

# Verifier que la politique est creee
kubectl get networkpolicies

# Tester la connectivite autorisee
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Tester la connectivite bloquee (devrait echouer)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Beginnen Sie mit permissiven Richtlinien im Beobachtungsmodus und schränken Sie dann schrittweise ein. Eine zu restriktive Richtlinie kann die Kommunikation zwischen Ihren Services unterbrechen.
:::

**Beispiel einer Standard-Richtlinie zur Namespace-Isolation:**

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
Die Richtlinie `default-deny-all` blockiert **allen Traffic** im Namespace, einschließlich DNS-Zugriff. Wenn Sie sie anwenden, fügen Sie sofort eine Richtlinie hinzu, die ausgehenden DNS-Traffic (Port 53) erlaubt, sonst wird die Namensauflösung nicht funktionieren.
:::

### 4. Hubble für Netzwerk-Debugging verwenden

Hubble bietet vollständige Sichtbarkeit auf die Netzwerkflüsse des Clusters. Verwenden Sie es zur Diagnose von Konnektivitätsproblemen:

```bash
# Verifier le statut de Hubble
kubectl exec -n kube-system -it ds/cilium -- hubble status

# Observer les flux reseau en temps reel
kubectl exec -n kube-system -it ds/cilium -- hubble observe

# Filtrer les flux pour un pod specifique
kubectl exec -n kube-system -it ds/cilium -- hubble observe --pod web-xxxxx

# Voir les flux refuses par les NetworkPolicies
kubectl exec -n kube-system -it ds/cilium -- hubble observe --verdict DROPPED

# Filtrer par namespace
kubectl exec -n kube-system -it ds/cilium -- hubble observe --namespace production
```

:::tip
Der Befehl `hubble observe --verdict DROPPED` ist besonders nützlich, um durch eine NetworkPolicy blockierte Flüsse zu identifizieren und Ihre Regeln anzupassen.
:::

## Überprüfung

Überprüfen Sie, ob Ihre Netzwerkrichtlinien korrekt angewendet werden:

```bash
# Lister toutes les NetworkPolicies
kubectl get networkpolicies -A

# Details d'une politique
kubectl describe networkpolicy allow-web

# Verifier l'etat de Cilium
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
