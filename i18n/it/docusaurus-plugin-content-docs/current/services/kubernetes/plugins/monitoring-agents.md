---
sidebar_position: 10
title: Monitoring Agents
---

# Monitoring Agents

L'addon **Monitoring Agents** distribuisce nel cluster gli agenti di raccolta delle **metriche** e dei **log**, che trasmettono i dati al sistema di monitoraggio della piattaforma Hikube. Non è necessario attivare alcuna opzione nel progetto.

| Componente | Ruolo |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Raccoglie e invia le metriche |
| **Fluent Bit** | Raccoglie e invia i log dei container |
| **kube-state-metrics** | Espone lo stato degli oggetti Kubernetes sotto forma di metriche |
| **Node exporter** | Espone le metriche di sistema dei nodi |

## Nella console

1. Alla creazione, passaggio **Addons**, **Monitoring Agents** è selezionato per impostazione predefinita.
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni o deselezioni **Monitoring Agents**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Monitoring Agents** nella sezione **Extensions** quando è attivo.

:::note
L'accesso alle dashboard di monitoraggio del progetto non è disponibile nella console; contatti il supporto.
:::

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**, ma la piattaforma non lo applica per questo addon: una sovrascrittura inserita qui resta senza effetto. Le destinazioni delle metriche e dei log sono definite dalla piattaforma. Per adattare il comportamento degli agenti (risorse, filtri di raccolta), contatti il supporto.

## Utilizzo nel cluster

```bash
# Pod degli agenti
kubectl get pods -A -l app.kubernetes.io/name=vmagent
kubectl get pods -A -l app.kubernetes.io/name=fluent-bit

# Metriche delle risorse
kubectl top nodes
kubectl top pods -A
```

Vedere [Come configurare il monitoring](../how-to/configure-monitoring.md).

## Buone pratiche

- Mantenga l'addon attivato sui cluster di produzione per conservare lo storico delle metriche e dei log.
- Scriva i log applicativi sullo standard output dei container: è ciò che Fluent Bit raccoglie.
