---
sidebar_position: 6
title: Cert-Manager
---

# Cert-Manager

Das Addon **Cert-Manager** verwaltet die SSL/TLS-Zertifikate des Clusters automatisch: Ausstellung, Erneuerung und Speicherung in Kubernetes-Secrets. Es unterstützt Let's Encrypt (ACME) und private Zertifizierungsstellen.

## In der Konsole

1. Bei der Erstellung ist **Cert-Manager** im Schritt **Addons** standardmäßig ausgewählt.
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Cert-Manager** aktivieren oder deaktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Cert-Manager** im Abschnitt **Extensions** an, wenn es aktiv ist.

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `cert-manager` an das Helm-Chart von Cert-Manager übergeben. Zum Beispiel, um die Ressourcen anzupassen:

```yaml title="cert-manager-override.yaml"
cert-manager:
  resources:
    requests:
      cpu: 10m
      memory: 32Mi
    limits:
      cpu: 100m
      memory: 128Mi
```

Die verfügbaren Optionen sind im [Helm-Chart von Cert-Manager](https://artifacthub.io/packages/helm/cert-manager/cert-manager) beschrieben.

## Nutzung im Cluster

Das Addon erstellt keinen Aussteller: Deklarieren Sie Ihren `ClusterIssuer` (oder `Issuer`) im Cluster und referenzieren Sie ihn dann in Ihren Ingress-Ressourcen.

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

# Zertifikate verfolgen
kubectl get certificates -A
kubectl describe certificate <name> -n <namespace>
```

Der vollständige Ablauf ist in [Einen Ingress mit TLS bereitstellen](../how-to/deploy-ingress-tls.md) beschrieben.

## Best Practices

- Lassen Sie Cert-Manager aktiviert, sobald Sie Anwendungen per HTTPS bereitstellen.
- Testen Sie mit dem Staging-Server von Let's Encrypt, bevor Sie den Produktionsserver verwenden.
- Prüfen Sie regelmäßig den Zustand `READY` Ihrer Zertifikate, um fehlgeschlagene Erneuerungen frühzeitig zu erkennen.
