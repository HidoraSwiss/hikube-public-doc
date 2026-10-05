---
title: "Einen Ingress mit TLS bereitstellen"
---

# Einen Ingress mit TLS bereitstellen

Diese Anleitung erklärt, wie Sie eine Anwendung auf einem Hikube-Kubernetes-Cluster mit einem automatischen TLS-Zertifikat per HTTPS erreichbar machen, mithilfe der Addons Cert-Manager und Ingress NGINX.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**)
- Ein Domainname, dessen DNS-Zone Sie verwalten

## Schritte

### 1. Die Addons Cert-Manager und Ingress NGINX aktivieren

Beide Addons sind bei der Erstellung eines Clusters standardmäßig ausgewählt. Um sie auf einem bestehenden Cluster zu prüfen oder zu aktivieren:

1. Öffnen Sie unter **Infrastructure** > **Kubernetes** die Detailseite des Clusters: Der Abschnitt **Extensions** listet die aktiven Addons auf.
2. Wenn sie dort nicht aufgeführt sind, klicken Sie auf **Edit**, aktivieren Sie **Cert-Manager** und **Ingress NGINX** im Abschnitt **Extensions & Addons** und klicken Sie dann auf **Save**.

### 2. Die erreichbare Node-Gruppe prüfen

Der Ingress-NGINX-Controller läuft auf den Nodes der Gruppen, die als **Exposed on the internet (Public IP)** markiert sind. Die erste Gruppe des Clusters ist es immer. Um eine andere Gruppe dem eingehenden Traffic zu widmen, aktivieren Sie diese Option auf ihrer Karte im Abschnitt **Node groups** der Seite **Edit**.

:::tip
Wenn Sie eine Node-Gruppe dem Ingress widmen, isolieren Sie den eingehenden Traffic und dimensionieren die Ressourcen für die HTTP/HTTPS-Bereitstellung unabhängig.
:::

### 3. Die externe IP abrufen und DNS konfigurieren

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Pods von Cert-Manager und Ingress NGINX
kubectl get pods -A | grep -E "cert-manager|ingress-nginx"

# Externe IP des Ingress-NGINX-Controllers (Spalte EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller
```

Legen Sie bei Ihrem DNS-Anbieter einen `A`-Eintrag an, der Ihre Domain (zum Beispiel `app.example.com`) auf diese externe IP zeigen lässt.

### 4. Einen Zertifikataussteller erstellen

Deklarieren Sie einen Let's-Encrypt-`ClusterIssuer`, der Ihre Domains per HTTP-01-Challenge über Ingress NGINX validiert:

```yaml title="cluster-issuer.yaml"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

```bash
kubectl apply -f cluster-issuer.yaml
kubectl get clusterissuer letsencrypt-prod
```

:::tip
Verwenden Sie für Ihre Tests zunächst den Staging-Server von Let's Encrypt (`https://acme-staging-v02.api.letsencrypt.org/directory`), um die Anfragelimits nicht zu erreichen.
:::

### 5. Einen Ingress mit TLS erstellen

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

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
Die Annotation `cert-manager.io/cluster-issuer: letsencrypt-prod` weist Cert-Manager an, automatisch ein Zertifikat für die Domains im Abschnitt `tls` zu beziehen.
:::

### 6. Das Zertifikat prüfen

```bash
kubectl get certificate

# Erwartetes Ergebnis
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

kubectl describe certificate app-tls
```

## Überprüfung

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
Die Ausstellung des Let's-Encrypt-Zertifikats kann einige Minuten dauern. Wenn das Zertifikat im Zustand `False` bleibt, prüfen Sie, ob Ihr DNS-Eintrag auf die externe IP des Ingress-NGINX-Controllers zeigt und Port 80 erreichbar ist (erforderlich für die HTTP-01-Validierung).
:::

:::tip
Wenn Pods des Clusters Ihre eigenen öffentlichen Domains erreichen müssen (Hairpin-NAT), aktivieren Sie das Addon [Ouroboros](../plugins/ouroboros.md).
:::

## Weiterführende Informationen

- [Cert-Manager](../plugins/cert-manager.md) und [Ingress NGINX](../plugins/ingress-nginx.md): Details zu den Addons
- [Das Networking konfigurieren](./configure-networking.md): erweiterte Netzwerkverwaltung
