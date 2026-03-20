---
sidebar_position: 8
title: FluxCD
---

<!--Link zu valuesoverride-->

# 🧩 Details zum Feld `addons.fluxcd`

Das Feld `addons.fluxcd` definiert die Konfiguration des Add-ons **FluxCD**, das für die **GitOps-Verwaltung** des Kubernetes-Clusters verwendet wird.
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
Es ermöglicht die Aktivierung der FluxCD-Bereitstellung und die Anpassung seiner Konfiguration über Helm.

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

Das Feld `valuesOverride` ermöglicht das **Überschreiben der Standard-Helm-Werte**, die für die Bereitstellung von FluxCD verwendet werden.
Es wird insbesondere zur Konfiguration der Ressourcen, der CRDs oder erweiterten Optionen wie Synchronisationsfrequenz, Git-Quellen und automatischen Update-Strategien verwendet.

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

#### Konfiguration mit einem FluxCD Git-Repo

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    # Git-Repository-Konfiguration
    gitRepository:
      url: "https://github.com/company/k8s-manifests"
      branch: "main"
      path: "./clusters/production"
```

---

## 💡 Best Practices

- Aktivieren Sie `enabled: true`, um vom kontinuierlichen GitOps-basierten Deployment zu profitieren.
- Verwenden Sie `valuesOverride`, um die Ressourcen anzupassen und die Synchronisationsfrequenz je nach Bedarf einzustellen.
- Sichern Sie den Git-Zugriff mit **Kubernetes-Secrets** oder **persönlichen Token**.
- Prüfen Sie die Kompatibilität der FluxCD-Version mit der Kubernetes-Version vor jedem Update.
