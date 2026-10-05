---
sidebar_position: 1
title: Cilium
---

# Cilium

**Cilium** ist das **CNI (Container Network Interface)** der Hikube-Kubernetes-Cluster. Es verwaltet Netzwerk, Sicherheit und Observability der Pods mithilfe von **eBPF** und setzt die `NetworkPolicy` durch.

## In der Konsole

Cilium gehört zur **Advanced Configuration** des Schritts **Addons**: Es ist immer im Cluster vorhanden und lässt sich nicht deaktivieren. Sie können lediglich seine Konfiguration überschreiben.

1. Klappen Sie bei der Erstellung (Schritt **Addons**) oder über **Edit** > **Extensions & Addons** den Block **Cilium** im Abschnitt **Advanced Configuration** auf.
2. Geben Sie Ihre Werte in **Helm Configuration (YAML) — optional** ein.
3. Bestätigen Sie mit **Next** und dann **Create cluster** (Erstellung) oder mit **Save** (Änderung).

Auf der Detailseite des Clusters zeigt die Zeile **CNI** im Abschnitt **Network** **Custom** an, wenn eine Cilium-Konfiguration angewendet wird.

## Die Konfiguration überschreiben

Der YAML-Wert wird unter dem Schlüssel `cilium` an das Helm-Chart von Cilium übergeben. Zum Beispiel, um Hubble zu aktivieren:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Die verfügbaren Optionen sind in der [Helm-Referenz von Cilium](https://docs.cilium.io/en/stable/helm-reference/) beschrieben.

:::warning
Das Netzwerk des Clusters hängt von Cilium ab. Ein fehlerhaftes Override kann die Kommunikation zwischen den Pods oder mit der Control Plane unterbrechen: Ändern Sie nur Optionen, deren Wirkung Sie genau kennen.
:::

## Nutzung im Cluster

```bash
# Cilium-Pods (einer pro Node)
kubectl get pods -A -l k8s-app=cilium

# Zustand des Cilium-Agents
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

Siehe [Das Networking konfigurieren](../how-to/configure-networking.md) für `NetworkPolicy` und Hubble.

## Best Practices

- Aktivieren Sie **Hubble**, um von Netzwerktransparenz und der Verfolgung der Flüsse zu profitieren.
- Verwenden Sie `NetworkPolicy`, um den Traffic zwischen Ihren Anwendungen einzuschränken.
- Testen Sie jedes Override auf einem Testcluster, bevor Sie es in der Produktion einsetzen.
