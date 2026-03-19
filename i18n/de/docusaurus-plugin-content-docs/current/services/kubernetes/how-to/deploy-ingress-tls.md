---
title: "Ingress mit TLS bereitstellen"
---

# Ingress mit TLS bereitstellen

Diese Anleitung erklärt, wie Sie eine Anwendung über HTTPS mit einem automatischen TLS-Zertifikat auf einem Kubernetes-Hikube-Cluster exponieren, unter Verwendung der Addons cert-manager und ingress-nginx.

## Voraussetzungen

- Ein bereitgestellter Kubernetes-Hikube-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Ein Domainname, der auf Ihren Cluster zeigt (DNS A- oder CNAME-Eintrag)
- Die kubeconfig des Child-Clusters abgerufen

## Schritte

### 1. Addons certManager und ingressNginx aktivieren

Ändern Sie die Konfiguration Ihres Clusters, um die erforderlichen Addons zu aktivieren:

```yaml title="cluster-ingress-tls.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    web:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
```

:::note
Das Feld `hosts` unter `ingressNginx` definiert die Domains, für die der Ingress Controller Datenverkehr akzeptiert. Sie können Wildcards (`*.example.com`) verwenden, um mehrere Subdomains abzudecken.
:::

### 2. Die Rolle ingress-nginx einer Node Group zuweisen

Die Node Group, die den Ingress Controller hostet, muss die Rolle `ingress-nginx` in ihrer Konfiguration haben. Prüfen Sie, ob Ihre Node Group korrekt konfiguriert ist:

```yaml title="cluster-ingress.yaml"
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 5
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

:::tip
Eine dedizierte Node Group für den Ingress ermöglicht es, den eingehenden Datenverkehr zu isolieren und die HTTP/HTTPS-Expositionsressourcen unabhängig zu dimensionieren.
:::

### 3. Cluster-Konfiguration anwenden

```bash
kubectl apply -f cluster-ingress-tls.yaml

# Warten, bis der Cluster bereit ist
kubectl get kubernetes my-cluster -w
```

Prüfen Sie, ob die Addons im Child-Cluster bereitgestellt sind:

```bash
export KUBECONFIG=cluster-admin.yaml

# cert-manager prüfen
kubectl get pods -n cert-manager

# Ingress Controller prüfen
kubectl get pods -n ingress-nginx

# Externe IP des Ingress Controllers abrufen
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### 4. Einen Ingress mit TLS im Child-Cluster erstellen

Stellen Sie Ihre Anwendung bereit und erstellen Sie dann einen Ingress mit automatischer TLS-Terminierung:

```yaml title="ingress-tls.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

Wenden Sie die Konfiguration im Child-Cluster an:

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
Die Annotation `cert-manager.io/cluster-issuer: letsencrypt-prod` weist cert-manager an, automatisch ein Let's-Encrypt-Zertifikat für die angegebene Domain zu beschaffen.
:::

### 5. Zertifikat überprüfen

```bash
# Zertifikatsstatus prüfen
kubectl get certificate

# Erwartetes Ergebnis
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

# Zertifikatsdetails
kubectl describe certificate app-tls
```

## Überprüfung

Testen Sie den HTTPS-Zugriff auf Ihre Anwendung:

```bash
# Ingress prüfen
kubectl get ingress my-app

# HTTPS-Zugriff testen
curl -v https://app.example.com
```

**Erwartetes Ergebnis:**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Die Bereitstellung des Let's-Encrypt-Zertifikats kann einige Minuten dauern. Wenn das Zertifikat im Zustand `False` verbleibt, prüfen Sie, ob Ihr DNS-Eintrag korrekt auf die IP des Ingress Controllers zeigt und ob Port 80 erreichbar ist (erforderlich für die HTTP-01-Validierung).
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Konfiguration der Addons `certManager` und `ingressNginx`
- [Konzepte](../concepts.md) -- Cluster-Architektur und Netzwerkkomponenten
- [Networking konfigurieren](./configure-networking.md) -- Erweiterte Netzwerkverwaltung
