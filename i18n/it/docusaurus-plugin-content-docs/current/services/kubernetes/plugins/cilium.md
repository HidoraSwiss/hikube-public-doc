---
sidebar_position: 1
title: Cilium
---

# 🧩 Dettagli del campo `addons.cilium`

Il campo `addons.cilium` definisce la configurazione dell'add-on **Cilium**, utilizzato come **CNI (Container Network Interface)** per il cluster Kubernetes.
Cilium gestisce la rete, la sicurezza e l'osservabilità dei Pod tramite **BPF (Berkeley Packet Filter)**.
Questo campo permette di personalizzare la distribuzione del componente tramite valori specifici.

```yaml
addons:
  cilium:
    valuesOverride:
      cilium:
        hubble:
          enabled: true
        encryption:
          enabled: true
```

---

## `cilium` (Object) — **Obbligatorio**

### Descrizione

Il campo `cilium` rappresenta la configurazione principale dell'add-on di rete.
Raggruppa i parametri necessari all'installazione e alla personalizzazione di Cilium nel cluster.

### Esempio

```yaml
cilium:
  valuesOverride:
    cilium:
      hubble:
        enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori predefiniti** utilizzati durante la distribuzione di Cilium.
Serve a regolare il comportamento del CNI senza modificare il chart principale.
Questi valori possono includere la configurazione di **Hubble**, della crittografia, delle policy di rete o delle risorse allocate.
Per ulteriori valori da definire: https://docs.cilium.io/en/stable/helm-reference/

### Esempio

```yaml
valuesOverride:
  cilium:
    hubble:
      enabled: true
    encryption:
      enabled: true
```

---

## 💡 Buone pratiche

- Definire sempre `valuesOverride` per mantenere il controllo della configurazione di rete.
- Attivare **Hubble** (`hubble.enabled: true`) per beneficiare della visibilità di rete e del tracciamento dei flussi.
- Utilizzare `encryption.enabled: true` per crittografare il traffico inter-Pod negli ambienti sensibili.
- Verificare la compatibilità della versione di Cilium con la versione del cluster Kubernetes.

---
