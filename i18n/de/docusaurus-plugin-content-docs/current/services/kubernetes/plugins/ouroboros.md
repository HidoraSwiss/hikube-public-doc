---
sidebar_position: 12
title: Ouroboros
---

# Ouroboros

Das Addon **Ouroboros** behebt **Hairpin-NAT** von Ingress NGINX, wenn das PROXY-Protokoll verwendet wird. Ohne dieses Addon kann die Anfrage eines Pods im Cluster fehlschlagen, wenn er eine öffentliche Domain aufruft, die vom Ingress desselben Clusters ausgeliefert wird.

:::note
Das Addon [Ingress NGINX](./ingress-nginx.md) aktiviert das PROXY-Protokoll standardmäßig nicht. Ouroboros ist nur nützlich, wenn Sie es über das Override von Ingress NGINX auf der gesamten Eingangskette aktiviert haben.
:::

## In der Konsole

Ouroboros erfordert das Addon [Ingress NGINX](./ingress-nginx.md).

1. Wählen Sie bei der Erstellung im Schritt **Addons** **Ouroboros** aus (standardmäßig deaktiviert). Ist **Ingress NGINX** nicht ausgewählt, zeigt die Konsole „Requires the Ingress NGINX addon“ an und blockiert das Fortfahren.
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Ouroboros** aktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Ouroboros** im Abschnitt **Extensions** an, wenn es aktiv ist.

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `ouroboros` an das Helm-Chart von Ouroboros übergeben. In den meisten Fällen ist kein Override nötig.

## Nutzung im Cluster

```bash
# Ouroboros-Pods
kubectl get pods -A | grep -i ouroboros

# Zugriff auf eine öffentliche Domain, die vom Ingress des Clusters ausgeliefert wird, aus einem Pod testen
kubectl run hairpin-test --rm -it --image=curlimages/curl --restart=Never -- curl -sv https://app.example.com
```

## Best Practices

- Aktivieren Sie Ouroboros, wenn das PROXY-Protokoll auf Ingress NGINX aktiv ist und Anwendungen des Clusters sich gegenseitig über ihre öffentlichen Domains aufrufen.
