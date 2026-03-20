---
sidebar_position: 2
title: CoreDNS
---

  <!--coredns     <Object> -required-
    valuesOverride    <Object> -required--->

# 🧩 Dettagli del campo `addons.coredns`

Il campo `addons.coredns` definisce la configurazione dell'add-on **CoreDNS**, utilizzato come **servizio DNS** del cluster Kubernetes.
CoreDNS gestisce la risoluzione dei nomi dei servizi e dei pod interni al cluster, e può essere personalizzato tramite parametri Helm.

```yaml
addons:
  coredns:
    valuesOverride:
        coredns:
          replicaCount: 2
          servers:
            - plugins:
                - name: errors
                - configBlock: lameduck 10s
                  name: health
                - name: ready
                - configBlock: |-
                    pods insecure
                    fallthrough in-addr.arpa ip6.arpa
                    ttl 33
                  name: kubernetes
                  parameters: cluster.local in-addr.arpa ip6.arpa
                - name: prometheus
                  parameters: 0.0.0.0:9153
                - name: forward
                  parameters: . 10.1.1.2 10.4.1.11
                - name: cache
                  parameters: 333
                - name: loop
                - name: reload
                - name: loadbalance
              port: 53
              zones:
                - use_tcp: true
                  zone: .
```

---

## `coredns` (Object) — **Obbligatorio**

### Descrizione

Il campo `coredns` raggruppa la configurazione principale del servizio DNS del cluster.
Definisce i parametri necessari alla distribuzione e al corretto funzionamento di CoreDNS.

### Esempio

```yaml
coredns:
  valuesOverride:
    corends:
      replicaCount: 2
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori predefiniti** della distribuzione CoreDNS, generalmente tramite Helm.
E utilizzato per personalizzare le risorse, il numero di repliche o la configurazione del servizio DNS (es: plugin, zone, cache).
Vedere le altre opzioni: https://github.com/coredns/helm/blob/master/charts/coredns/values.yaml

### Esempio

```yaml
valuesOverride:
  corends:
    replicaCount: 2
    resources:
      limits:
        cpu: 500m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 128Mi
```

---

## 💡 Buone pratiche

- Definire sempre `valuesOverride` per regolare le risorse in base alla dimensione del cluster.
- Configurare `replicaCount` ad **almeno 2** per garantire l'alta disponibilità del servizio DNS.
- Monitorare l'utilizzo della memoria: CoreDNS può consumare di più in base al numero di servizi e richieste DNS.
- Adattare la configurazione dei plugin (es: `forward`, `cache`, `rewrite`) in base alle esigenze del vostro ambiente.
- Evitare di modificare manualmente il `ConfigMap` di CoreDNS: preferire una distribuzione gestita tramite `valuesOverride`.

---
