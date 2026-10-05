---
title: "Das Networking konfigurieren"
---

# Das Networking konfigurieren

Diese Anleitung erklärt, wie Sie die Netzwerkkonfiguration Ihres Hikube-Kubernetes-Clusters mit Kubernetes-NetworkPolicies und den Observability-Werkzeugen Cilium/Hubble verwalten.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**), in Ihre Sitzung geladen:
  ```bash
  export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
  ```
- Grundkenntnisse zum Kubernetes-Networking (Services, Pods, Namespaces)

## Schritte

### 1. Das Hikube-Netzwerk verstehen

:::note
Cilium ist das CNI (Container Network Interface) der Hikube-Kubernetes-Cluster. Es stellt Networking, Netzwerksicherheit und Observability bereit. Es ist immer vorhanden; seine Konfiguration wird in der Konsole im Abschnitt **Advanced Configuration** der Addons überschrieben (siehe [Cilium](../plugins/cilium.md)).
:::

Die Hikube-Cluster enthalten:

- **Cilium** als CNI: Pod-zu-Pod-Netzwerk, Services und Durchsetzung der NetworkPolicies;
- **Hubble** für Observability: Visualisierung der Netzwerkflüsse, zu aktivieren über das Cilium-Override.

Standardmäßig können alle Pods ohne Einschränkung miteinander kommunizieren. Mit NetworkPolicies schränken Sie diese Kommunikation ein.

Die Erreichbarkeit aus dem Internet läuft über die Node-Gruppen, die in der Konsole als **Exposed on the internet (Public IP)** markiert sind und den Controller [Ingress NGINX](../plugins/ingress-nginx.md) hosten.

### 2. Eine NetworkPolicy erstellen

Definieren Sie Regeln, um den eingehenden (Ingress) und ausgehenden (Egress) Traffic Ihrer Pods zu steuern:

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

Diese Policy:
- **erlaubt eingehenden Traffic** zu den Pods `app: web` nur von den Pods `app: frontend` auf Port 80;
- **erlaubt ausgehenden Traffic** von den Pods `app: web` nur zu den Pods `app: database` auf Port 5432;
- **blockiert jeden anderen** ein- und ausgehenden Traffic für die Pods `app: web`.

### 3. Anwenden und testen

```bash
# NetworkPolicy anwenden
kubectl apply -f network-policy.yaml

# Prüfen, ob die Policy erstellt wurde
kubectl get networkpolicies

# Erlaubte Konnektivität testen
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Blockierte Konnektivität testen (muss fehlschlagen)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Beginnen Sie mit großzügigen Policies und schränken Sie sie dann schrittweise ein. Eine zu restriktive Policy kann die Kommunikation zwischen Ihren Services unterbrechen.
:::

**Beispiel für eine Standard-Policy zur Isolierung eines Namespace:**

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
Die Policy `default-deny-all` blockiert **den gesamten Traffic** im Namespace, einschließlich des DNS-Zugriffs. Wenn Sie sie anwenden, fügen Sie sofort eine Policy hinzu, die ausgehenden DNS-Traffic (Port 53) erlaubt, sonst funktioniert die Namensauflösung nicht mehr.
:::

### 4. Hubble für das Netzwerk-Debugging verwenden

Hubble ist standardmäßig nicht aktiviert. Um es zu aktivieren, klappen Sie bei der Erstellung des Clusters **Cilium** im Abschnitt **Advanced Configuration** des Schritts **Addons** auf und geben Sie das folgende Override in **Helm Configuration (YAML) — optional** ein:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Bei einem bestehenden Cluster speichert die Konsole ein erstes über **Edit** eingegebenes Cilium-Override nicht: [Wenden Sie sich an den Support](mailto:support@hidora.io), um es anwenden zu lassen.

Sobald Cilium neu bereitgestellt ist, verwenden Sie die in die Cilium-Pods integrierte Hubble-CLI:

```bash
# Cilium-Pods (einer pro Node)
kubectl get pods -A -l k8s-app=cilium

# Namespace von Cilium, von den folgenden Befehlen verwendet
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')

# Status von Hubble prüfen
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble status

# Netzwerkflüsse in Echtzeit beobachten
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe

# Von NetworkPolicies abgelehnte Flüsse anzeigen
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --verdict DROPPED

# Nach Namespace filtern
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --namespace production
```

:::tip
Der Befehl `hubble observe --verdict DROPPED` ist besonders hilfreich, um von einer NetworkPolicy blockierte Flüsse zu erkennen und Ihre Regeln anzupassen.
:::

## Überprüfung

```bash
# Alle NetworkPolicies auflisten
kubectl get networkpolicies -A

# Details einer Policy
kubectl describe networkpolicy allow-web

# Zustand von Cilium prüfen
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

**Erwartetes Ergebnis für `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Weiterführende Informationen

- [Konzepte](../concepts.md): Netzwerkarchitektur und erreichbare Node-Gruppen
- [Einen Ingress mit TLS bereitstellen](./deploy-ingress-tls.md): HTTPS-Bereitstellung Ihrer Anwendungen
