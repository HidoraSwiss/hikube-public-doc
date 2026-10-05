---
sidebar_position: 6
title: Cert-Manager
---

# Cert-Manager

L'addon **Cert-Manager** gestisce automaticamente i certificati SSL/TLS del cluster: emissione, rinnovo e archiviazione in Secret Kubernetes. Supporta Let's Encrypt (ACME) e le autorità private.

## Nella console

1. Alla creazione, passaggio **Addons**, **Cert-Manager** è selezionato per impostazione predefinita.
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni o deselezioni **Cert-Manager**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Cert-Manager** nella sezione **Extensions** quando è attivo.

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart Helm di Cert-Manager, sotto la chiave `cert-manager`. Ad esempio, per regolare le risorse:

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

Le opzioni disponibili sono descritte nel [chart Helm di Cert-Manager](https://artifacthub.io/packages/helm/cert-manager/cert-manager).

## Utilizzo nel cluster

L'addon non crea alcun emittente: dichiari il suo `ClusterIssuer` (o `Issuer`) nel cluster, quindi lo referenzi nei suoi Ingress.

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

# Seguire i certificati
kubectl get certificates -A
kubectl describe certificate <nome> -n <namespace>
```

Il percorso completo è descritto in [Come distribuire un Ingress con TLS](../how-to/deploy-ingress-tls.md).

## Buone pratiche

- Mantenga Cert-Manager attivato non appena espone applicazioni in HTTPS.
- Esegua i test con il server di staging di Let's Encrypt prima di utilizzare il server di produzione.
- Verifichi regolarmente lo stato `READY` dei suoi certificati per prevenire i mancati rinnovi.
