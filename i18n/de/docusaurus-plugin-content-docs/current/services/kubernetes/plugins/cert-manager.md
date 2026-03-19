---
sidebar_position: 6
title: Cert-manager
---

# 🧩 Details zum Feld `certManager`

Das Feld `certManager` definiert die Konfiguration des im Kubernetes-Cluster integrierten Zertifikatsmanagers.
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

Gibt an, ob der **cert-manager** aktiviert (`true`) oder deaktiviert (`false`) in der Cluster-Konfiguration ist.
Wenn er deaktiviert ist, wird keine cert-manager-bezogene Komponente bereitgestellt.

### Beispiel

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Erforderlich**

### Beschreibung

Ermöglicht das **Überschreiben der Standardwerte**, die für die Bereitstellung von cert-manager verwendet werden.
Dieses Feld wird in der Regel verwendet, um benutzerdefinierte Helm-Parameter einzufügen (wie Images, Ressourcen oder ACME-Konfigurationen).

### Interne Felder

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
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
          # Konfiguration der Standard-Issuers
          global:
            leaderElection:
              namespace: cert-manager
          # Prometheus-Metriken
          prometheus:
            enabled: true
            servicemonitor:
              enabled: true
          # Pod-Ressourcen
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

- Belassen Sie `enabled: true`, um die automatische Verwaltung von TLS-Zertifikaten sicherzustellen.
- Verwenden Sie `valuesOverride`, um Helm-Parameter anzupassen, ohne die globalen Standardwerte zu ändern.
- Prüfen Sie die Kompatibilität der `cert-manager`-Versionen mit der verwendeten Kubernetes-Version.
- Aktivieren Sie `installCRDs` nur bei der Erstinstallation, um Ressourcenkonflikte zu vermeiden.
- Deaktivieren Sie `prometheus.enabled`, wenn kein Monitoring erforderlich ist, um die Cluster-Last zu reduzieren.
