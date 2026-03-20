---
sidebar_position: 7
title: GPU Operator
---

# 🧩 Dettagli del campo `addons.gpuOperator`

Il campo `addons.gpuOperator` definisce la configurazione dell'add-on **NVIDIA GPU Operator**, utilizzato per gestire automaticamente le **GPU** in un cluster Kubernetes.
Questo componente installa e mantiene i driver NVIDIA, i plugin di esecuzione, il `device plugin`, nonche gli strumenti di monitoring necessari all'utilizzo delle GPU.

```yaml
addons:
  gpuOperator:
    enabled: true
    valuesOverride:
      gpuOperator:
        driver:
          enabled: true
        toolkit:
          enabled: true
        devicePlugin:
          enabled: true
```

---

## `gpuOperator` (Object) — **Obbligatorio**

### Descrizione

Il campo `gpuOperator` raggruppa la configurazione principale dell'add-on NVIDIA GPU Operator.
Permette di attivare la distribuzione del componente e di regolarne la configurazione.

### Esempio

```yaml
gpuOperator:
  enabled: true
  valuesOverride:
    gpuOperator:
      driver:
        enabled: true
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se il **GPU Operator** è attivato (`true`) o disattivato (`false`) nel cluster.
Quando è attivato, l'operatore distribuisce automaticamente i componenti necessari alla gestione delle GPU NVIDIA.

### Esempio

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori predefiniti** del GPU Operator.
E utilizzato per personalizzare il comportamento della distribuzione (attivazione del driver, del toolkit, dei plugin o configurazione delle risorse).

### Esempio

```yaml
valuesOverride:
  gpuOperator:
    driver:
      enabled: true
    toolkit:
      enabled: true
    devicePlugin:
      enabled: true
```

---

## 💡 Buone pratiche

- Attivare `enabled: true` sui nodi dotati di GPU affinche l'operatore gestisca automaticamente i componenti NVIDIA.
- Utilizzare `valuesOverride` per adattare la configurazione alle esigenze specifiche (es. attivare o disattivare il `driver` se già installato manualmente).
- Distribuire il GPU Operator solo negli ambienti in cui sono necessari workload GPU (IA, ML, calcolo scientifico).
