---
title: "Come distribuire un Ingress con TLS"
---

# Come distribuire un Ingress con TLS

Questa guida spiega come esporre un'applicazione in HTTPS con un certificato TLS automatico su un cluster Kubernetes Hikube, utilizzando gli addon Cert-Manager e Ingress NGINX.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**)
- Un nome di dominio di cui gestisce la zona DNS

## Passaggi

### 1. Attivare gli addon Cert-Manager e Ingress NGINX

I due addon sono selezionati per impostazione predefinita alla creazione di un cluster. Per verificarli o attivarli su un cluster esistente:

1. In **Infrastructure** > **Kubernetes**, apra la pagina di dettaglio del cluster: la sezione **Extensions** elenca gli addon attivi.
2. Se non vi compaiono, faccia clic su **Edit**, selezioni **Cert-Manager** e **Ingress NGINX** nella sezione **Extensions & Addons**, quindi faccia clic su **Save**.

### 2. Verificare il gruppo di nodi esposto

Il controller Ingress NGINX viene eseguito sui nodi dei gruppi contrassegnati **Exposed on the internet (Public IP)**. Il primo gruppo del cluster lo è sempre. Per dedicare un altro gruppo al traffico in ingresso, attivi questa opzione sulla relativa scheda nella sezione **Node groups** della pagina **Edit**.

:::tip
Dedicare un gruppo di nodi all'Ingress consente di isolare il traffico in ingresso e di dimensionare in modo indipendente le risorse di esposizione HTTP/HTTPS.
:::

### 3. Recuperare l'IP esterno e configurare il DNS

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml

# Pod Cert-Manager e Ingress NGINX
kubectl get pods -A | grep -E "cert-manager|ingress-nginx"

# IP esterno del controller Ingress NGINX (colonna EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller
```

Crei presso il suo provider DNS un record `A` che faccia puntare il suo dominio (ad esempio `app.example.com`) a questo IP esterno.

### 4. Creare un emittente di certificati

Dichiari un `ClusterIssuer` Let's Encrypt, che convaliderà i suoi domini tramite challenge HTTP-01 attraverso Ingress NGINX:

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
Per i test, utilizzi prima il server di staging di Let's Encrypt (`https://acme-staging-v02.api.letsencrypt.org/directory`) per non raggiungere i limiti di richieste.
:::

### 5. Creare un Ingress con TLS

Distribuisca l'applicazione, quindi crei un Ingress con terminazione TLS automatica:

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
L'annotazione `cert-manager.io/cluster-issuer: letsencrypt-prod` indica a Cert-Manager di ottenere automaticamente un certificato per i domini della sezione `tls`.
:::

### 6. Verificare il certificato

```bash
kubectl get certificate

# Risultato atteso
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

kubectl describe certificate app-tls
```

## Verifica

```bash
# Verificare l'Ingress
kubectl get ingress my-app

# Testare l'accesso HTTPS
curl -v https://app.example.com
```

**Risultato atteso:**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Il provisioning del certificato Let's Encrypt può richiedere alcuni minuti. Se il certificato resta nello stato `False`, verifichi che il suo record DNS punti all'IP esterno del controller Ingress NGINX e che la porta 80 sia accessibile (necessaria per la convalida HTTP-01).
:::

:::tip
Se i pod del cluster devono raggiungere i suoi domini pubblici (hairpin NAT), attivi l'addon [Ouroboros](../plugins/ouroboros.md).
:::

## Per approfondire

- [Cert-Manager](../plugins/cert-manager.md) e [Ingress NGINX](../plugins/ingress-nginx.md): dettaglio degli addon
- [Come configurare il networking](./configure-networking.md): gestione avanzata della rete
