---
sidebar_position: 2
title: CoreDNS
---

# CoreDNS

**CoreDNS** ist der **DNS-Server** der Hikube-Kubernetes-Cluster. Er übernimmt die Namensauflösung der clusterinternen Services und Pods sowie die Weiterleitung von Anfragen an externe Namen.

## In der Konsole

CoreDNS gehört zur **Advanced Configuration** des Schritts **Addons**: Es ist immer im Cluster vorhanden und lässt sich nicht deaktivieren. Sie können lediglich seine Konfiguration überschreiben.

1. Klappen Sie bei der Erstellung (Schritt **Addons**) oder über **Edit** > **Extensions & Addons** den Block **CoreDNS** im Abschnitt **Advanced Configuration** auf.
2. Geben Sie Ihre Werte in **Helm Configuration (YAML) — optional** ein.
3. Bestätigen Sie mit **Next** und dann **Create cluster** (Erstellung) oder mit **Save** (Änderung).

Auf der Detailseite des Clusters zeigt die Zeile **DNS** im Abschnitt **Network** **CoreDNS** an, wenn eine CoreDNS-Konfiguration angewendet wird.

## Die Konfiguration überschreiben

Der YAML-Wert wird unter dem Schlüssel `coredns` an das Helm-Chart von CoreDNS übergeben. Zum Beispiel, um die Anzahl der Replicas und die Ressourcen festzulegen:

```yaml title="coredns-override.yaml"
coredns:
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

Die verfügbaren Optionen (Plugins, Zonen, Cache, Forward …) sind im [Helm-Chart von CoreDNS](https://github.com/coredns/helm/tree/master/charts/coredns) beschrieben.

## Nutzung im Cluster

```bash
# CoreDNS-Pods
kubectl get pods -A | grep coredns

# Namensauflösung aus einem Pod testen
kubectl run dns-test --rm -it --image=busybox --restart=Never -- nslookup kubernetes.default
```

## Best Practices

- Behalten Sie mindestens **2 Replicas**, um die Hochverfügbarkeit des DNS zu gewährleisten.
- Überwachen Sie den Arbeitsspeicher: Der Verbrauch von CoreDNS steigt mit der Anzahl der Services und Anfragen.
- Ändern Sie die `ConfigMap` von CoreDNS nicht manuell im Cluster: Nutzen Sie das Override in der Konsole, sonst werden Ihre Änderungen überschrieben.
