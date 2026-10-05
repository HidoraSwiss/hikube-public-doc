---
sidebar_position: 2
title: CoreDNS
---

# CoreDNS

**CoreDNS** è il **server DNS** dei cluster Kubernetes Hikube. Garantisce la risoluzione dei nomi dei service e dei pod interni al cluster e l'inoltro delle richieste verso i nomi esterni.

## Nella console

CoreDNS fa parte della **Advanced Configuration** del passaggio **Addons**: è sempre presente nel cluster e non si può disattivare. È possibile soltanto sovrascriverne la configurazione.

1. Alla creazione (passaggio **Addons**) oppure da **Edit** > **Extensions & Addons**, espanda il blocco **CoreDNS** della sezione **Advanced Configuration**.
2. Inserisca i suoi valori in **Helm Configuration (YAML) — optional**.
3. Confermi con **Next** e poi **Create cluster** (creazione) oppure **Save** (modifica).

:::warning
Su un cluster esistente, la console non salva una prima sovrascrittura inserita da **Edit**: il pulsante **Save** conferma l'aggiornamento, ma il valore viene ignorato. Definisca la sovrascrittura alla creazione del cluster, oppure [contatti il supporto](mailto:support@hidora.io). Una sovrascrittura definita alla creazione resta modificabile da **Edit**.
:::

Nella pagina di dettaglio del cluster, la riga **DNS** della sezione **Network** indica **CoreDNS** quando viene applicata una configurazione CoreDNS.

## Sovrascrivere la configurazione

Il valore YAML viene trasmesso al chart Helm di CoreDNS, sotto la chiave `coredns`. Ad esempio, per impostare il numero di repliche e le risorse:

```yaml title="coredns-override.yaml"
coredns:
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

Le opzioni disponibili (plugin, zone, cache, forward…) sono descritte nel [chart Helm di CoreDNS](https://github.com/coredns/helm/tree/master/charts/coredns).

## Utilizzo nel cluster

```bash
# Pod CoreDNS
kubectl get pods -A | grep coredns

# Testare la risoluzione da un pod
kubectl run dns-test --rm -it --image=busybox --restart=Never -- nslookup kubernetes.default
```

## Buone pratiche

- Mantenga almeno **2 repliche** per garantire l'alta disponibilità del DNS.
- Monitori la memoria: il consumo di CoreDNS aumenta con il numero di service e di richieste.
- Non modifichi manualmente il `ConfigMap` di CoreDNS nel cluster: utilizzi la sovrascrittura nella console, altrimenti le sue modifiche verranno sovrascritte.
