---
sidebar_position: 8
title: FluxCD
---

<!--Link verso valuesoverride-->

# 🧩 Dettagli del campo `addons.fluxcd`

Il campo `addons.fluxcd` definisce la configurazione dell'add-on **FluxCD**, utilizzato per la **gestione GitOps** del cluster Kubernetes.
FluxCD sincronizza automaticamente lo stato del cluster con i repository Git, garantendo che la configurazione dichiarata nel codice sia sempre applicata.

```yaml
addons:
  fluxcd:
    enabled: true
    valuesOverride:
      fluxcd:
        installCRDs: true
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 200m
            memory: 256Mi
```

---

## `fluxcd` (Object) — **Obbligatorio**

### Descrizione

Il campo `fluxcd` raggruppa la configurazione principale del gestore GitOps del cluster.
Permette di attivare la distribuzione di FluxCD e di regolarne la configurazione tramite Helm.

### Esempio

```yaml
fluxcd:
  enabled: true
  valuesOverride:
    fluxcd:
      installCRDs: true
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se **FluxCD** è attivato (`true`) o disattivato (`false`) nel cluster.
Quando è attivato, FluxCD distribuisce i suoi controller e avvia la sincronizzazione GitOps.

### Esempio

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori Helm predefiniti** utilizzati per la distribuzione di FluxCD.
E utilizzato in particolare per configurare le risorse, i CRD o le opzioni avanzate come la frequenza di sincronizzazione, le sorgenti Git e le strategie di aggiornamento automatico.

### Esempi

#### Configurazione base

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    resources:
      limits:
        cpu: 500m
        memory: 512Mi
      requests:
        cpu: 200m
        memory: 256Mi
```

#### Configurazione con un gitrepo di fluxcd

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    # Configurazione del repository Git
    gitRepository:
      url: "https://github.com/company/k8s-manifests"
      branch: "main"
      path: "./clusters/production"
```

---

## 💡 Buone pratiche

- Attivare `enabled: true` per beneficiare della distribuzione continua basata su GitOps.
- Utilizzare `valuesOverride` per personalizzare le risorse e regolare la frequenza di sincronizzazione in base alle esigenze.
- Proteggere l'accesso Git con **secret Kubernetes** o **token personali**.
- Verificare la compatibilità della versione di FluxCD con quella di Kubernetes prima di ogni aggiornamento.
