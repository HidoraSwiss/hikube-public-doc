---
sidebar_position: 6
title: Cert-manager
---

# 🧩 Dettagli del campo `certManager`

Il campo `certManager` definisce la configurazione del gestore di certificati integrato nel cluster Kubernetes.
Permette di attivare o disattivare il componente e di personalizzarne il comportamento tramite valori specifici.

```yaml
certManager:
  enabled: true
  valuesOverride:
    certManager:
      installCRDs: true
      prometheus:
        enabled: false
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se il **cert-manager** è attivato (`true`) o disattivato (`false`) nella configurazione del cluster.
Quando è disattivato, nessun componente legato al cert-manager viene distribuito.

### Esempio

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Permette di **sovrascrivere i valori predefiniti** utilizzati per la distribuzione del cert-manager.
Questo campo e generalmente utilizzato per iniettare parametri Helm personalizzati (come le immagini, le risorse o le configurazioni ACME).

### Campi interni

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `installCRDs` | boolean | No | Installa le Custom Resource Definitions necessarie al cert-manager |
| `prometheus.enabled` | boolean | No | Attiva o disattiva l'esportazione delle metriche Prometheus |

### Esempio

```yaml
valuesOverride:
  certManager:
    installCRDs: true
```

---

## Esempi completi

### **Cert-Manager**

Gestione automatizzata dei certificati SSL/TLS.

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          installCRDs: true
          prometheus:
            enabled: true
```

#### **Configurazione Avanzata Cert-Manager**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          # Configurazione degli issuer predefiniti
          global:
            leaderElection:
              namespace: cert-manager
          # Metriche Prometheus
          prometheus:
            enabled: true
            servicemonitor:
              enabled: true
          # Risorse dei pod
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 128Mi
```

---

## 💡 Buone pratiche

- Lasciare `enabled: true` per garantire la gestione automatica dei certificati TLS.
- Utilizzare `valuesOverride` per regolare i parametri Helm senza modificare i valori predefiniti globali.
- Verificare la compatibilità delle versioni di `cert-manager` con la versione di Kubernetes utilizzata.
- Attivare `installCRDs` solo durante la prima installazione per evitare conflitti di risorse.
- Disattivare `prometheus.enabled` se il monitoraggio non è richiesto, per ridurre il carico sul cluster.
