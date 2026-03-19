---
sidebar_position: 2
title: CoreDNS
---

  <!--coredns     <Object> -required-
    valuesOverride    <Object> -required--->

# 🧩 Details zum Feld `addons.coredns`

Das Feld `addons.coredns` definiert die Konfiguration des Add-ons **CoreDNS**, das als **DNS-Dienst** des Kubernetes-Clusters verwendet wird.
CoreDNS verwaltet die Namensauflösung für Services und Pods innerhalb des Clusters und kann über Helm-Parameter angepasst werden.

```yaml
addons:
  coredns:
    valuesOverride:
        coredns:
          replicaCount: 2
          servers:
            - plugins:
                - name: errors
                - configBlock: lameduck 10s
                  name: health
                - name: ready
                - configBlock: |-
                    pods insecure
                    fallthrough in-addr.arpa ip6.arpa
                    ttl 33
                  name: kubernetes
                  parameters: cluster.local in-addr.arpa ip6.arpa
                - name: prometheus
                  parameters: 0.0.0.0:9153
                - name: forward
                  parameters: . 10.1.1.2 10.4.1.11
                - name: cache
                  parameters: 333
                - name: loop
                - name: reload
                - name: loadbalance
              port: 53
              zones:
                - use_tcp: true
                  zone: .
```

---

## `coredns` (Object) — **Erforderlich**

### Beschreibung

Das Feld `coredns` gruppiert die Hauptkonfiguration des DNS-Dienstes des Clusters.
Es definiert die für die Bereitstellung und den ordnungsgemäßen Betrieb von CoreDNS erforderlichen Parameter.

### Beispiel

```yaml
coredns:
  valuesOverride:
    corends:
      replicaCount: 2
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standardwerte** der CoreDNS-Bereitstellung, in der Regel über Helm.
Es wird verwendet, um die Ressourcen, die Anzahl der Replikas oder die DNS-Dienst-Konfiguration (z.B.: Plugins, Zonen, Caches) anzupassen.
Weitere Optionen siehe: https://github.com/coredns/helm/blob/master/charts/coredns/values.yaml

### Beispiel

```yaml
valuesOverride:
  corends:
    replicaCount: 2
    resources:
      limits:
        cpu: 500m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 128Mi
```

---

## 💡 Best Practices

- Definieren Sie immer `valuesOverride`, um die Ressourcen je nach Cluster-Größe anzupassen.
- Konfigurieren Sie `replicaCount` auf **mindestens 2**, um die Hochverfügbarkeit des DNS-Dienstes sicherzustellen.
- Überwachen Sie die Speichernutzung: CoreDNS kann je nach Anzahl der Services und DNS-Anfragen mehr verbrauchen.
- Passen Sie die Plugin-Konfiguration (z.B.: `forward`, `cache`, `rewrite`) an die Bedürfnisse Ihrer Umgebung an.
- Vermeiden Sie die manuelle Bearbeitung der `ConfigMap` von CoreDNS: Bevorzugen Sie eine verwaltete Bereitstellung über `valuesOverride`.

---
