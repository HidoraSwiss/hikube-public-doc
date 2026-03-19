---
sidebar_position: 6
title: Cert-manager
---

# 🧩 Details zum Feld `certManager`

Das Feld `certManager` definiert die Konfiguration des in den Kubernetes-Cluster integrierten Zertifikatsmanagers.
Es ermöglicht die Aktivierung oder Deaktivierung der Komponente und die Anpassung ihres Verhaltens über spezifische Werte.

```yaml
certManager:
  enabled: true
  valuesOverride:
    certManager:
      installCRDs: true
      prometheus:
        enabled: false
```

---

## `enabled` (boolean) — **Erforderlich**

### Beschreibung

Gibt an, ob der **cert-manager** aktiviert (`true`) oder deaktiviert (`false`) ist.
Wenn deaktiviert, wird keine cert-manager-Komponente bereitgestellt.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Ermöglicht das **Überschreiben der Standardwerte**, die für das Deployment des cert-managers verwendet werden.
Dieses Feld wird typischerweise verwendet, um benutzerdefinierte Helm-Parameter einzufügen (wie Images, Ressourcen oder ACME-Konfigurationen).

### Interne Felder

| Feld | Typ | Erforderlich | Beschreibung |
|------|-----|-------------|--------------|
| `installCRDs` | boolean | Nein | Installiert die für cert-manager erforderlichen Custom Resource Definitions |
| `prometheus.enabled` | boolean | Nein | Aktiviert oder deaktiviert den Export von Prometheus-Metriken |

### Beispiel

```yaml
valuesOverride:
  certManager:
    installCRDs: true
```

---

## Vollständige Beispiele

### **Cert-Manager**

Automatisierte Verwaltung von SSL/TLS-Zertifikaten.

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          installCRDs: true
          prometheus:
            enabled: true
```

#### **Erweiterte Cert-Manager-Konfiguration**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        certManager:
          # Configuration des issuers par défaut
          global:
            leaderElection:
              namespace: cert-manager
          # Métriques Prometheus
          prometheus:
            enabled: true
            servicemonitor:
              enabled: true
          # Resources des pods
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 128Mi
```

---

## 💡 Best Practices

- `enabled: true` beibehalten, um die automatische Verwaltung von TLS-Zertifikaten sicherzustellen.
- `valuesOverride` verwenden, um Helm-Parameter anzupassen, ohne die globalen Standardwerte zu ändern.
- Die Kompatibilität der `cert-manager`-Versionen mit der verwendeten Kubernetes-Version überprüfen.
- `installCRDs` nur bei der Erstinstallation aktivieren, um Ressourcenkonflikte zu vermeiden.
- `prometheus.enabled` deaktivieren, wenn keine Überwachung erforderlich ist, um die Cluster-Last zu reduzieren.
