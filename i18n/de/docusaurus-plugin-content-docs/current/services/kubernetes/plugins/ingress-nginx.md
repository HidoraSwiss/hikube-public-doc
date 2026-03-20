---
sidebar_position: 5
title: Ingress Nginx
---

# 🧩 Details zum Feld `addons.ingressNginx`

Das Feld `addons.ingressNginx` definiert die Konfiguration des Add-ons **Ingress NGINX**, das zur Verwaltung der HTTP(S)-Eingangspunkte des Kubernetes-Clusters verwendet wird.
Es stellt einen NGINX-Controller bereit, der interne Anwendungen über Ingress-Routen exponiert, mit vollständiger Unterstützung für TLS, Load Balancing und Kubernetes-Annotations.

```yaml
addons:
  ingressNginx:
    enabled: true
    exposeMethod: LoadBalancer
    hosts:
      - app.example.com
      - api.example.com
    valuesOverride:
      ingressNginx:
        controller:
          replicaCount: 2
          service:
            type: LoadBalancer
```

---

## `ingressNginx` (Object) — **Erforderlich**

### Beschreibung

Das Feld `ingressNginx` gruppiert die Hauptkonfiguration des auf NGINX basierenden Ingress Controllers.
Es ermöglicht die Aktivierung der Controller-Bereitstellung, die Wahl der Expositionsmethode und die Definition der zugehörigen öffentlichen Hosts.

### Beispiel

```yaml
ingressNginx:
  enabled: true
  exposeMethod: Proxied
  hosts:
    - app.example.com
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob der **Ingress NGINX** Controller aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn er aktiviert ist, werden ein oder mehrere NGINX-Pods bereitgestellt, um die Eingangsregeln des Clusters zu verwalten.

### Beispiel

```yaml
enabled: true
```

---

## `exposeMethod` (string) — **Erforderlich**

### Beschreibung

Bestimmt die **Expositionsmethode** des Ingress NGINX Controllers.
Dieses Feld akzeptiert folgende Werte:

| Wert | Beschreibung |
|--------|--------------|
| `Proxied` | Der Controller wird über einen internen Proxy oder einen bestehenden Ingress exponiert. |
| `LoadBalancer` | Der NGINX-Service wird über einen `Service` vom Typ `LoadBalancer` exponiert. |

### Beispiel

```yaml
exposeMethod: LoadBalancer
```

---

## `hosts` (Array)

### Beschreibung

Listet die dem Ingress NGINX Controller zugeordneten **Domainnamen** auf.
Diese Hosts definieren die öffentlichen Routen, die von außerhalb des Clusters erreichbar sind.

### Beispiel

```yaml
hosts:
  - app.example.com
  - api.example.com
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte** der Ingress NGINX-Bereitstellung.
Es wird verwendet, um die Controller-Konfiguration anzupassen (Anzahl der Replikas, Service-Typ, Ressourcen, Annotations usw.).

#### **Ingress NGINX**

Ingress-Controller für HTTP/HTTPS-Exposition.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Wildcard-Unterstützung
      valuesOverride: {}
```

#### **Erweiterte Ingress NGINX-Konfiguration**

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "production.company.com"
        - "*.apps.company.com"
      valuesOverride:
        ingressNginx:
          controller:
            # Replikation für Hochverfügbarkeit
            replicaCount: 3

            # Ressourcen-Konfiguration
            resources:
              requests:
                cpu: 100m
                memory: 90Mi
              limits:
                cpu: 500m
                memory: 500Mi

            # LoadBalancer-Service-Konfiguration
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb

            # Metriken
            metrics:
              enabled: true
              serviceMonitor:
                enabled: true

            # SSL-Konfiguration
            config:
              ssl-protocols: "TLSv1.2 TLSv1.3"
              ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

            # Logging
            enableSnippets: true
```

---

## 💡 Best Practices

- Bevorzugen Sie `Proxied` für On-Premises-Umgebungen, in denen der Zugriff über einen externen Reverse Proxy verwaltet wird.
- Definieren Sie mehrere `hosts` für Multi-Domain-Anwendungen.
- Verwenden Sie `valuesOverride`, um Ressourcen, Anzahl der Replikas und TLS-Konfiguration anzupassen.
- Konfigurieren Sie die Annotations (`nginx.ingress.kubernetes.io/*`) direkt über die `Ingress`-Manifeste für eine bessere Anwendungskontrolle.
