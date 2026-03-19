---
sidebar_position: 4
title: Pod Auto Scaler
---

# 🧩 Dettagli del campo `addons.verticalPodAutoscaler`

Il campo `addons.verticalPodAutoscaler` definisce la configurazione dell'add-on **Vertical Pod Autoscaler (VPA)**, responsabile della regolazione automatica delle risorse CPU e memoria dei Pod.
Analizza in modo continuo il consumo reale dei workload e raccomanda o applica regolazioni per ottimizzare le prestazioni e l'utilizzo delle risorse.

```yaml
addons:
  verticalPodAutoscaler:
    valuesOverride:
      verticalPodAutoscaler:
        recommender:
          enabled: true
        updater:
          enabled: true
        admissionController:
          enabled: true
```

---

## `verticalPodAutoscaler` (Object) — **Obbligatorio**

### Descrizione

Il campo `verticalPodAutoscaler` raggruppa la configurazione principale dell'add-on VPA.
Permette di distribuire e personalizzare i componenti del Vertical Pod Autoscaler per automatizzare la gestione delle risorse dei Pod.

### Esempio

```yaml
verticalPodAutoscaler:
  valuesOverride:
    verticalPodAutoscaler:
      recommender:
        enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori Helm** della distribuzione del Vertical Pod Autoscaler.
E utilizzato per attivare o disattivare i diversi sotto-componenti:

| Componente | Descrizione |
|------------|-------------|
| `recommender` | Analizza le metriche e raccomanda risorse ottimali per i Pod. |
| `updater` | Aggiorna automaticamente i Pod quando le raccomandazioni cambiano. |
| `admissionController` | Intercetta le richieste di creazione/modifica dei Pod per regolare le risorse al volo. |

### Esempio

```yaml
valuesOverride:
  verticalPodAutoscaler:
    recommender:
      enabled: true
    updater:
      enabled: true
    admissionController:
      enabled: true
```

---

## 💡 Buone pratiche

- Attivare sempre `recommender` per beneficiare dei suggerimenti automatici sulle risorse.
- Utilizzare `updater.enabled: false` inizialmente per osservare le raccomandazioni prima di applicare le modifiche.
- Adattare la configurazione tramite `valuesOverride` in base alle esigenze di carico e agli ambienti (staging, produzione).
