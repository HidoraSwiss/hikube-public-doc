---
sidebar_position: 4
title: Vertical Pod Autoscaler
---

# Vertical Pod Autoscaler

Il **Vertical Pod Autoscaler (VPA)** regola automaticamente le risorse CPU e memoria dei pod. Analizza in modo continuo il consumo reale dei workload, quindi raccomanda o applica gli adeguamenti.

| Componente | Ruolo |
|-----------|------|
| `recommender` | Analizza le metriche e raccomanda le risorse per i pod |
| `updater` | Ricrea i pod quando le raccomandazioni cambiano |
| `admissionController` | Applica le risorse raccomandate alla creazione dei pod |

## Nella console

Il Vertical Pod Autoscaler fa parte della **Advanced Configuration** del passaggio **Addons**: è sempre presente nel cluster e non si può disattivare. È possibile soltanto sovrascriverne la configurazione.

1. Alla creazione (passaggio **Addons**) oppure da **Edit** > **Extensions & Addons**, espanda il blocco **Vertical Pod Autoscaler** della sezione **Advanced Configuration**.
2. Inserisca i suoi valori in **Helm Configuration (YAML) — optional**.
3. Confermi con **Next** e poi **Create cluster** (creazione) oppure **Save** (modifica).

Nella pagina di dettaglio del cluster, la riga **VPA** della sezione **Network** indica **VPA** quando l'addon è configurato.

## Sovrascrivere la configurazione

Il valore YAML viene trasmesso al chart Helm del VPA, sotto la chiave `vertical-pod-autoscaler`. Ad esempio, per disattivare l'updater e utilizzare solo le raccomandazioni:

```yaml title="vpa-override.yaml"
vertical-pod-autoscaler:
  updater:
    enabled: false
```

Le opzioni disponibili sono descritte nel [chart Helm del Vertical Pod Autoscaler](https://github.com/cowboysysop/charts/tree/master/charts/vertical-pod-autoscaler).

## Utilizzo nel cluster

Crei un oggetto `VerticalPodAutoscaler` per ogni workload da monitorare:

```yaml title="vpa-my-app.yaml"
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Off"
```

```bash
kubectl apply -f vpa-my-app.yaml

# Leggere le raccomandazioni
kubectl describe vpa my-app
```

## Buone pratiche

- Inizi con `updateMode: "Off"` per osservare le raccomandazioni prima di applicarle.
- Non utilizzi il VPA e un `HorizontalPodAutoscaler` sulla stessa metrica (CPU o memoria) di uno stesso workload.
- Combini il VPA con l'[autoscaling dei gruppi di nodi](../how-to/configure-autoscaling.md) per adattare sia i pod sia la capacità del cluster.
