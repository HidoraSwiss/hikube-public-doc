---
sidebar_position: 3
title: Gateway API
---

# Gateway API

**Gateway API** è un'estensione di Kubernetes per la gestione degli **ingressi di rete** (gateway, route). Offre un modello più flessibile ed estensibile rispetto ai tradizionali oggetti `Ingress`.

L'addon installa le **CRD Kubernetes Gateway API** (canale experimental): `GatewayClass`, `Gateway`, `HTTPRoute`, ecc. Attiva inoltre il supporto di Gateway API in [Cilium](./cilium.md) (con il relativo proxy Envoy) e, se selezionati, in [Cert-Manager](./cert-manager.md) e [Ouroboros](./ouroboros.md).

## Nella console

1. Alla creazione, passaggio **Addons**, selezioni **Gateway API** (disattivato per impostazione predefinita).
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni **Gateway API**, quindi **Save**.

Questo addon non prevede sovrascrittura Helm: si può soltanto attivare o disattivare.

La pagina di dettaglio del cluster mostra **Gateway API** nella sezione **Extensions** quando è attivo.

## Utilizzo nel cluster

```bash
# CRD installate
kubectl get crds | grep gateway.networking.k8s.io

# Classi di gateway disponibili
kubectl get gatewayclass
```

Consulti la [documentazione Gateway API](https://gateway-api.sigs.k8s.io) per la descrizione delle risorse.

## Buone pratiche

- Testi le sue risorse (`HTTPRoute`, `TLSRoute`, ecc.) su un cluster di collaudo prima di migrare da `Ingress`.
- Il canale experimental può cambiare da una versione all'altra: verifichi la compatibilità dei suoi manifesti durante gli aggiornamenti.
