---
sidebar_position: 5
title: Ingress Nginx
---

# 🧩 Dettagli del campo `addons.ingressNginx`

Il campo `addons.ingressNginx` definisce la configurazione dell'add-on **Ingress NGINX**, utilizzato per gestire i punti di ingresso HTTP(S) del cluster Kubernetes.
Distribuisce un controller NGINX che espone le applicazioni interne tramite route Ingress, con supporto completo per TLS, load balancing e annotazioni Kubernetes.

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

## `ingressNginx` (Object) — **Obbligatorio**

### Descrizione

Il campo `ingressNginx` raggruppa la configurazione principale del controller Ingress basato su NGINX.
Permette di attivare la distribuzione del controller, di scegliere il metodo di esposizione e di definire gli host pubblici associati.

### Esempio

```yaml
ingressNginx:
  enabled: true
  exposeMethod: Proxied
  hosts:
    - app.example.com
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se il controller **Ingress NGINX** e attivato (`true`) o disattivato (`false`).
Quando e attivato, uno o piu pod NGINX vengono distribuiti per gestire le regole di ingresso del cluster.

### Esempio

```yaml
enabled: true
```

---

## `exposeMethod` (string) — **Obbligatorio**

### Descrizione

Determina il **metodo di esposizione** del controller Ingress NGINX.
Questo campo accetta i seguenti valori:

| Valore | Descrizione |
|--------|-------------|
| `Proxied` | Il controller e esposto tramite un proxy interno o un ingress esistente. |
| `LoadBalancer` | Il servizio NGINX e esposto tramite un `Service` di tipo `LoadBalancer`. |

### Esempio

```yaml
exposeMethod: LoadBalancer
```

---

## `hosts` (Array)

### Descrizione

Elenca i **nomi di dominio** associati al controller Ingress NGINX.
Questi host definiscono le route pubbliche accessibili dall'esterno del cluster.

### Esempio

```yaml
hosts:
  - app.example.com
  - api.example.com
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori Helm** della distribuzione Ingress NGINX.
E utilizzato per personalizzare la configurazione del controller (numero di repliche, tipo di servizio, risorse, annotazioni, ecc.).

#### **Ingress NGINX**

Controller di ingress per l'esposizione HTTP/HTTPS.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Supporto wildcard
      valuesOverride: {}
```

#### **Configurazione Avanzata Ingress NGINX**

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
            # Replica per alta disponibilita
            replicaCount: 3

            # Configurazione delle risorse
            resources:
              requests:
                cpu: 100m
                memory: 90Mi
              limits:
                cpu: 500m
                memory: 500Mi

            # Configurazione del servizio LoadBalancer
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb

            # Metriche
            metrics:
              enabled: true
              serviceMonitor:
                enabled: true

            # Configurazione SSL
            config:
              ssl-protocols: "TLSv1.2 TLSv1.3"
              ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

            # Logging
            enableSnippets: true
```

---

## 💡 Buone pratiche

- Preferire `Proxied` per gli ambienti on-premises dove l'accesso e gestito tramite un reverse proxy esterno.
- Definire diversi `hosts` per le applicazioni multi-dominio.
- Utilizzare `valuesOverride` per regolare le risorse, il numero di repliche e la configurazione TLS.
- Configurare le annotazioni (`nginx.ingress.kubernetes.io/*`) direttamente tramite i manifesti `Ingress` per un miglior controllo applicativo.
