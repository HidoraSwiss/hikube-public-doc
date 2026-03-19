---
sidebar_position: 6
title: Cert-manager
---

# 🧩 Détails du champ `certManager`

Le champ `certManager` définit la configuration du gestionnaire de certificats intégré au cluster Kubernetes.
Il permet d’activer ou de désactiver le composant et de personnaliser son comportement via des valeurs spécifiques.

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

## `enabled` (boolean) — **Obligatoire**

### Description

Indique si le **cert-manager** est activé (`true`) ou désactivé (`false`) dans la configuration du cluster.
Lorsqu’il est désactivé, aucun composant lié au cert-manager n’est déployé.

### Exemple

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Permet de **surcharger les valeurs par défaut** utilisées pour le déploiement du cert-manager.
Ce champ est généralement utilisé pour injecter des paramètres Helm personnalisés (comme les images, les ressources, ou les configurations ACME).

### Champs internes

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `installCRDs` | boolean | ❌ | Installe les Custom Resource Definitions nécessaires au cert-manager |
| `prometheus.enabled` | boolean | ❌ | Active ou désactive l’export des métriques Prometheus |

### Exemple

```yaml
valuesOverride:
  certManager:
    installCRDs: true
```

---

## Esempi completi

### **Cert-Manager**

Gestion automatisée des certificats SSL/TLS.

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

#### **Configuration Avancée Cert-Manager**

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

## 💡 Buone pratiche

- Laisser `enabled: true` pour assurer la gestion automatique des certificats TLS.
- Utiliser `valuesOverride` pour ajuster les paramètres Helm sans modifier les valeurs par défaut globales.
- Vérifier la compatibilité des versions de `cert-manager` avec la version de Kubernetes utilisée.
- Activer `installCRDs` uniquement lors de la première installation pour éviter les conflits de ressources.
- Désactiver `prometheus.enabled` si la surveillance n’est pas requise, afin de réduire la charge sur le cluster.
