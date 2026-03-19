---
sidebar_position: 5
title: Ingress Nginx
---

# 🧩 Details zum Feld `addons.ingressNginx`

Das Feld `addons.ingressNginx` definiert die Konfiguration des Add-ons **Ingress NGINX**, das zur Verwaltung der HTTP(S)-Einstiegspunkte des Kubernetes-Clusters verwendet wird.
Es stellt einen NGINX-Controller bereit, der interne Anwendungen über Ingress-Routen exponiert, mit vollständiger Unterstützung von TLS, Load Balancing und Kubernetes-Annotationen.

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

Das Feld `ingressNginx` gruppiert die Hauptkonfiguration des NGINX-basierten Ingress-Controllers.
Es ermöglicht die Aktivierung des Controller-Deployments, die Wahl der Expositionsmethode und die Definition der zugehörigen öffentlichen Hosts.

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

Gibt an, ob der **Ingress NGINX**-Controller aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn aktiviert, werden ein oder mehrere NGINX-Pods bereitgestellt, um die Eingangsregeln des Clusters zu verwalten.

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
|------|--------------|
| `Proxied` | Der Controller wird über einen internen Proxy oder einen bestehenden Ingress exponiert. |
| `LoadBalancer` | Der NGINX-Service wird über einen `Service` vom Typ `LoadBalancer` exponiert. |

### Beispiel

```yaml
exposeMethod: LoadBalancer
```

---

## `hosts` (Array)

### Beschreibung

Listet die **Domainnamen** auf, die dem Ingress NGINX Controller zugeordnet sind.
Diese Hosts definieren die öffentlichen Routen, die von außerhalb des Clusters zugänglich sind.

### Beispiel

```yaml
hosts:
  - app.example.com
  - api.example.com
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Helm-Werte** des Ingress NGINX-Deployments.
Es wird verwendet, um die Controller-Konfiguration anzupassen (Anzahl der Replicas, Service-Typ, Ressourcen, Annotationen usw.).

#### **Ingress NGINX**

Ingress-Controller für die HTTP/HTTPS-Exposition.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Wildcard support
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
            # Réplication pour haute disponibilité
            replicaCount: 3

            # Configuration des ressources
            resources:
              requests:
                cpu: 100m
                memory: 90Mi
              limits:
                cpu: 500m
                memory: 500Mi

            # Configuration du service LoadBalancer
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb

            # Métriques
            metrics:
              enabled: true
              serviceMonitor:
                enabled: true

            # Configuration SSL
            config:
              ssl-protocols: "TLSv1.2 TLSv1.3"
              ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

            # Logging
            enableSnippets: true
```

---

## 💡 Best Practices

- `Proxied` für On-Premises-Umgebungen bevorzugen, in denen der Zugang über einen externen Reverse Proxy verwaltet wird.
- Mehrere `hosts` für Multi-Domain-Anwendungen definieren.
- `valuesOverride` verwenden, um Ressourcen, Replica-Anzahl und TLS-Konfiguration anzupassen.
- Annotationen (`nginx.ingress.kubernetes.io/*`) direkt über die `Ingress`-Manifeste konfigurieren, für bessere Anwendungskontrolle.
