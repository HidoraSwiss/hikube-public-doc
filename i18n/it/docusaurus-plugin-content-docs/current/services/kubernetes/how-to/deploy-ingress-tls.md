---
title: "Come distribuire un Ingress con TLS"
---

# Come distribuire un Ingress con TLS

Questa guida spiega come esporre un'applicazione tramite HTTPS con un certificato TLS automatico su un cluster Kubernetes Hikube, utilizzando gli addon cert-manager e ingress-nginx.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Un nome di dominio che punta al vostro cluster (record DNS A o CNAME)
- Il kubeconfig del cluster figlio recuperato

## Fasi

### 1. Attivare gli addon certManager e ingressNginx

Modificate la configurazione del vostro cluster per attivare gli addon necessari:

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
Il campo `hosts` sotto `ingressNginx` definisce i domini per i quali l'Ingress Controller accettera il traffico. Potete utilizzare dei wildcard (`*.example.com`) per coprire più sottodomini.
:::

### 2. Assegnare il ruolo ingress-nginx a un node group

Il node group che ospitera l'Ingress Controller deve avere il ruolo `ingress-nginx` nella sua configurazione. Verificate che il vostro node group sia correttamente configurato:

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
Dedicare un node group all'Ingress permette di isolare il traffico in entrata e dimensionare indipendentemente le risorse di esposizione HTTP/HTTPS.
:::

### 3. Applicare la configurazione del cluster

```bash
kubectl apply -f cluster-ingress-tls.yaml

# Attendere che il cluster sia pronto
kubectl get kubernetes my-cluster -w
```

Verificate che gli addon siano distribuiti nel cluster figlio:

```bash
export KUBECONFIG=cluster-admin.yaml

# Verificare cert-manager
kubectl get pods -n cert-manager

# Verificare l'Ingress Controller
kubectl get pods -n ingress-nginx

# Recuperare l'IP esterno dell'Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### 4. Creare un Ingress con TLS nel cluster figlio

Distribuite la vostra applicazione, poi create un Ingress con terminazione TLS automatica:

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

Applicate la configurazione nel cluster figlio:

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
L'annotazione `cert-manager.io/cluster-issuer: letsencrypt-prod` indica a cert-manager di ottenere automaticamente un certificato Let's Encrypt per il dominio specificato.
:::

### 5. Verificare il certificato

```bash
# Verificare lo stato del certificato
kubectl get certificate

# Risultato atteso
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

# Dettagli del certificato
kubectl describe certificate app-tls
```

## Verifica

Testate l'accesso HTTPS alla vostra applicazione:

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
Il provisioning del certificato Let's Encrypt può richiedere alcuni minuti. Se il certificato rimane in stato `False`, verificate che il vostro record DNS punti correttamente verso l'IP dell'Ingress Controller e che la porta 80 sia accessibile (necessario per la validazione HTTP-01).
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- Configurazione degli addon `certManager` e `ingressNginx`
- [Concetti](../concepts.md) -- Architettura del cluster e componenti di rete
- [Come configurare il networking](./configure-networking.md) -- Gestione avanzata della rete
