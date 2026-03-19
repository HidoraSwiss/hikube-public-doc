---
sidebar_position: 8
title: FluxCD
---

<!--Lien vers valuesoverride-->

# 🧩 Details zum Feld `addons.fluxcd`

Das Feld `addons.fluxcd` definiert die Konfiguration des Add-ons **FluxCD**, das für das **GitOps-Management** des Kubernetes-Clusters verwendet wird.
FluxCD synchronisiert automatisch den Cluster-Zustand mit Git-Repositories und stellt sicher, dass die im Code deklarierte Konfiguration stets angewendet wird.

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

## `fluxcd` (Object) — **Erforderlich**

### Beschreibung

Das Feld `fluxcd` gruppiert die Hauptkonfiguration des GitOps-Managers des Clusters.
Es ermöglicht die Aktivierung des FluxCD-Deployments und die Anpassung seiner Konfiguration über Helm.

### Beispiel

```yaml
fluxcd:
  enabled: true
  valuesOverride:
    fluxcd:
      installCRDs: true
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob **FluxCD** im Cluster aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn aktiviert, stellt FluxCD seine Controller bereit und startet die GitOps-Synchronisation.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standard-Helm-Werte**, die für das FluxCD-Deployment verwendet werden.
Es wird insbesondere verwendet, um Ressourcen, CRDs oder erweiterte Optionen wie Synchronisationsfrequenz, Git-Quellen und automatische Update-Strategien zu konfigurieren.

### Beispiele

#### Basiskonfiguration

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

#### Konfiguration mit einem FluxCD Git-Repository

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    # Configuration du Git repository
    gitRepository:
      url: "https://github.com/company/k8s-manifests"
      branch: "main"
      path: "./clusters/production"
```

---

## 💡 Best Practices

- `enabled: true` aktivieren, um von kontinuierlichem GitOps-basiertem Deployment zu profitieren.
- `valuesOverride` verwenden, um Ressourcen anzupassen und die Synchronisationsfrequenz nach Bedarf einzustellen.
- Den Git-Zugang mit **Kubernetes-Secrets** oder **persönlichen Tokens** absichern.
- Die Kompatibilität der FluxCD-Version mit der Kubernetes-Version vor jedem Update überprüfen.
