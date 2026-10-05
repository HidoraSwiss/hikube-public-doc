---
sidebar_position: 11
title: HAMi
---

# HAMi

Das Addon **HAMi** bringt **GPU-Virtualisierung**: Es ermöglicht, eine GPU zwischen mehreren Pods zu teilen, statt jedem Pod eine ganze GPU zuzuweisen.

## In der Konsole

HAMi erfordert das Addon [GPU Operator](./gpu-operator.md) und damit eine Node-Gruppe mit GPUs.

1. Wählen Sie bei der Erstellung im Schritt **Addons** **HAMi** aus (standardmäßig deaktiviert). Ist **GPU Operator** nicht ausgewählt, zeigt die Konsole „Requires the GPU Operator addon“ an und blockiert das Fortfahren.
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **HAMi** aktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **HAMi** im Abschnitt **Extensions** an, wenn es aktiv ist.

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `hami` an das Helm-Chart von HAMi übergeben. Die verfügbaren Optionen sind in der [HAMi-Dokumentation](https://project-hami.io/docs) beschrieben.

## Nutzung im Cluster

```bash
# HAMi-Pods
kubectl get pods -A | grep -i hami
```

Die Pods fordern mithilfe der von HAMi bereitgestellten Ressourcen (GPU-Speicher, Rechenanteil) einen Bruchteil einer GPU an. Ressourcennamen und Beispiel-Pods finden Sie in der [HAMi-Dokumentation](https://project-hami.io/docs).

## Best Practices

- Beschränken Sie das Teilen von GPUs auf Workloads, die keine ganze GPU auslasten (leichte Inferenz, Entwicklung, Notebooks).
- Legen Sie pro Pod Limits für den GPU-Speicher fest, damit ein Pod den anderen nichts entzieht.
