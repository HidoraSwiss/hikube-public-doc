---
sidebar_position: 5
title: Ingress NGINX
---

# Ingress NGINX

Das Addon **Ingress NGINX** stellt einen auf NGINX basierenden Ingress-Controller bereit. Es macht die Anwendungen des Clusters über `Ingress`-Ressourcen erreichbar, mit Unterstützung für TLS, Load Balancing und NGINX-Annotationen.

## In der Konsole

1. Bei der Erstellung ist **Ingress NGINX** im Schritt **Addons** standardmäßig ausgewählt.
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Ingress NGINX** aktivieren oder deaktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Ingress NGINX** im Abschnitt **Extensions** an, wenn es aktiv ist.

### Erreichbarkeit

Der Controller wird über einen Service vom Typ `LoadBalancer` bereitgestellt und läuft auf den Nodes der Gruppen, die als **Exposed on the internet (Public IP)** markiert sind (Schritt **Nodes**). Die erste Gruppe des Clusters ist immer erreichbar. Das PROXY-Protokoll ist standardmäßig nicht aktiviert.

:::note
Die Wahl der Bereitstellungsmethode (`LoadBalancer` oder `Proxied`) und die Deklaration von Hostnamen auf Ebene des Addons werden in der Konsole nicht angeboten; wenden Sie sich an den Support.
:::

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `ingress-nginx` an das Helm-Chart von Ingress NGINX übergeben. Zum Beispiel, um die Ressourcen und die NGINX-Konfiguration anzupassen:

```yaml title="ingress-nginx-override.yaml"
ingress-nginx:
  controller:
    resources:
      requests:
        cpu: 100m
        memory: 90Mi
      limits:
        cpu: 500m
        memory: 500Mi
    config:
      ssl-protocols: "TLSv1.2 TLSv1.3"
```

Die verfügbaren Optionen sind im [Helm-Chart von Ingress NGINX](https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx) beschrieben.

## Nutzung im Cluster

```bash
# Externe IP des Controllers (Spalte EXTERNAL-IP)
kubectl get svc -A -l app.kubernetes.io/name=ingress-nginx

# In Ihren Manifesten zu verwendende Ingress-Klasse
kubectl get ingressclass
```

Beispiel für einen Ingress:

```yaml title="ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  ingressClassName: nginx
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

Lassen Sie dann Ihre Domainnamen (DNS-Eintrag `A`) auf die externe IP des Controllers zeigen. Für HTTPS siehe [Einen Ingress mit TLS bereitstellen](../how-to/deploy-ingress-tls.md).

## Best Practices

- Widmen Sie dem eingehenden Traffic eine erreichbare Node-Gruppe, um ihn von Ihren Rechen-Workloads zu isolieren.
- Konfigurieren Sie die Annotationen `nginx.ingress.kubernetes.io/*` direkt in Ihren `Ingress`-Manifesten, um sie pro Anwendung zu steuern.
- Aktivieren Sie [Ouroboros](./ouroboros.md), wenn Pods des Clusters die öffentlichen Domains erreichen müssen, die von diesem Ingress ausgeliefert werden.
