---
sidebar_position: 3
title: GatewayAPI
---

# 🧩 Dettagli del campo `addons.gatewayAPI`

Il campo `addons.gatewayAPI` definisce la configurazione dell'add-on **Gateway API**, un'estensione moderna di Kubernetes per la gestione degli **ingressi di rete** (ingress, route, gateway).
Sostituisce progressivamente gli oggetti `Ingress` tradizionali offrendo un modello piu flessibile ed estensibile.

```yaml
addons:
  gatewayAPI:
    enabled: true
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se il modulo **Gateway API** e attivato (`true`) o disattivato (`false`).
Quando e attivato, le **Custom Resource Definitions (CRD)** associate a Gateway API (come `GatewayClass`, `Gateway`, `HTTPRoute`, ecc.) vengono installate e rese disponibili nel cluster.

### Esempio

```yaml
enabled: true
```

---

## 💡 Buone pratiche

- Attivare `enabled: true` per utilizzare la nuova API di rete standardizzata dalla CNCF.
- Testare la compatibilita delle risorse (`HTTPRoute`, `TCPRoute`, `ReferencePolicy`, ecc.) prima di migrare da `Ingress`.

---
