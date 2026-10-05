---
sidebar_position: 5
title: Ingress NGINX
---

# Ingress NGINX

L'addon **Ingress NGINX** distribuisce un controller Ingress basato su NGINX. Espone le applicazioni del cluster tramite risorse `Ingress`, con supporto di TLS, load balancing e annotazioni NGINX.

## Nella console

1. Alla creazione, passaggio **Addons**, **Ingress NGINX** è selezionato per impostazione predefinita.
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni o deselezioni **Ingress NGINX**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Ingress NGINX** nella sezione **Extensions** quando è attivo.

### Esposizione

Il controller è esposto tramite un Service di tipo `LoadBalancer` e viene eseguito sui nodi dei gruppi contrassegnati **Exposed on the internet (Public IP)** (passaggio **Nodes**). Il primo gruppo del cluster è sempre esposto. Il PROXY protocol non è attivato per impostazione predefinita.

:::note
La scelta del metodo di esposizione (`LoadBalancer` o `Proxied`) e la dichiarazione di nomi host a livello dell'addon non sono disponibili nella console; contatti il supporto.
:::

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart Helm di Ingress NGINX, sotto la chiave `ingress-nginx`. Ad esempio, per regolare le risorse e la configurazione NGINX:

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

Le opzioni disponibili sono descritte nel [chart Helm di Ingress NGINX](https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx).

## Utilizzo nel cluster

```bash
# IP esterno del controller (colonna EXTERNAL-IP)
kubectl get svc -A -l app.kubernetes.io/name=ingress-nginx

# Classe di Ingress da utilizzare nei manifesti
kubectl get ingressclass
```

Esempio di Ingress:

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

Faccia quindi puntare i suoi nomi di dominio (record DNS `A`) all'IP esterno del controller. Per l'HTTPS, vedere [Come distribuire un Ingress con TLS](../how-to/deploy-ingress-tls.md).

## Buone pratiche

- Dedichi al traffico in ingresso un gruppo di nodi esposto, per isolarlo dai carichi di calcolo.
- Configuri le annotazioni `nginx.ingress.kubernetes.io/*` direttamente nei manifesti `Ingress` per un controllo per singola applicazione.
- Attivi [Ouroboros](./ouroboros.md) se i pod del cluster devono raggiungere i domini pubblici serviti da questo stesso Ingress.
