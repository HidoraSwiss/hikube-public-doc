---
sidebar_position: 1
title: Cilium
---

# Cilium

**Cilium** è il **CNI (Container Network Interface)** dei cluster Kubernetes Hikube. Gestisce la rete, la sicurezza e l'osservabilità dei pod tramite **eBPF** e applica le `NetworkPolicy`.

## Nella console

Cilium fa parte della **Advanced Configuration** del passaggio **Addons**: è sempre presente nel cluster e non si può disattivare. È possibile soltanto sovrascriverne la configurazione.

1. Alla creazione (passaggio **Addons**) oppure da **Edit** > **Extensions & Addons**, espanda il blocco **Cilium** della sezione **Advanced Configuration**.
2. Inserisca i suoi valori in **Helm Configuration (YAML) — optional**.
3. Confermi con **Next** e poi **Create cluster** (creazione) oppure **Save** (modifica).

Nella pagina di dettaglio del cluster, la riga **CNI** della sezione **Network** indica **Custom** quando viene applicata una configurazione Cilium.

## Sovrascrivere la configurazione

Il valore YAML viene trasmesso al chart Helm di Cilium, sotto la chiave `cilium`. Ad esempio, per attivare Hubble:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Le opzioni disponibili sono descritte nel [riferimento Helm di Cilium](https://docs.cilium.io/en/stable/helm-reference/).

:::warning
La rete del cluster dipende da Cilium. Una sovrascrittura errata può interrompere la comunicazione tra i pod o con il control plane: modifichi solo le opzioni di cui conosce bene l'effetto.
:::

## Utilizzo nel cluster

```bash
# Pod Cilium (uno per nodo)
kubectl get pods -A -l k8s-app=cilium

# Stato dell'agente Cilium
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

Vedere [Come configurare il networking](../how-to/configure-networking.md) per le `NetworkPolicy` e Hubble.

## Buone pratiche

- Attivi **Hubble** per beneficiare della visibilità di rete e del tracciamento dei flussi.
- Utilizzi le `NetworkPolicy` per limitare il traffico tra le sue applicazioni.
- Testi qualsiasi sovrascrittura su un cluster di collaudo prima della produzione.
