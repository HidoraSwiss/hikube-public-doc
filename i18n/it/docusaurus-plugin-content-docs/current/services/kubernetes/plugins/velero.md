---
sidebar_position: 9
title: Velero
---

# 🧩 Dettagli del campo `addons.velero`

Il campo `addons.velero` definisce la configurazione dell'add-on **Velero**, utilizzato per il **backup e il ripristino** delle risorse Kubernetes e dei volumi persistenti.
Velero permette di garantire la resilienza del cluster in caso di perdita di dati o di migrazione tra ambienti.

```yaml
addons:
  velero:
    enabled: true
    valuesOverride:
      velero:
        configuration:
          backupStorageLocation:
            name: default
            provider: aws
            bucket: velero-backups
            config:
              region: eu-west-3
        schedules:
          daily:
            schedule: "0 2 * * *"
            template:
              ttl: 240h
```

---

## `velero` (Object) — **Obbligatorio**

### Descrizione

Il campo `velero` raggruppa la configurazione principale del sistema di backup e ripristino del cluster Kubernetes.
Permette di attivare Velero e di definirne i parametri di distribuzione.

### Esempio

```yaml
velero:
  enabled: true
  valuesOverride:
    velero:
      configuration:
        backupStorageLocation:
          provider: aws
```

---

## `enabled` (boolean) — **Obbligatorio**

### Descrizione

Indica se **Velero** è attivato (`true`) o disattivato (`false`).
Quando è attivato, Velero distribuisce i suoi componenti (server, controller e CRD) permettendo la gestione dei backup e dei ripristini.

### Esempio

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obbligatorio**

### Descrizione

Il campo `valuesOverride` permette di **sovrascrivere i valori** della distribuzione Velero.
Serve a definire i parametri di archiviazione, le pianificazioni automatiche, i provider cloud o le opzioni di sicurezza e risorse.

### Esempio

```yaml
valuesOverride:
  velero:
    configuration:
      backupStorageLocation:
        provider: aws
        bucket: velero-backups
        config:
          region: eu-west-3
    schedules:
      daily:
        schedule: "0 2 * * *"
        template:
          ttl: 240h
```

---

## 💡 Buone pratiche

- Attivare `enabled: true` per garantire il backup regolare delle risorse critiche del cluster.
- Utilizzare `valuesOverride` per adattare la configurazione al provider cloud o all'archiviazione scelta (AWS, GCP, Azure, MinIO, ecc.).
- Configurare delle **schedule** (pianificazioni) automatiche per i backup ricorrenti.
- Verificare regolarmente l'integrità dei backup e la possibilità di ripristino.
- Limitare gli accessi alle chiavi di archiviazione per proteggere i dati di backup.

---
