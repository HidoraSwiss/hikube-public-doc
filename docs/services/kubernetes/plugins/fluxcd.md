---
sidebar_position: 8
title: FluxCD
---

<!--Lien vers valuesoverride-->

# 🧩 Détails du champ `addons.fluxcd`

Le champ `addons.fluxcd` définit la configuration de l’add-on **FluxCD**, utilisé pour la **gestion GitOps** du cluster Kubernetes.
FluxCD synchronise automatiquement l’état du cluster avec des dépôts Git, garantissant que la configuration déclarée dans le code est toujours appliquée.

```yaml
addons:
  fluxcd:
    enabled: true
    valuesOverride:
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

## `fluxcd` (Object) — **Obligatoire**

### Description
Le champ `fluxcd` regroupe la configuration principale du gestionnaire GitOps du cluster.
Il permet d’activer le déploiement de FluxCD et d’ajuster sa configuration via Helm.

### Exemple
```yaml
fluxcd:
  enabled: true
  valuesOverride:
    installCRDs: true
```

---

## `enabled` (boolean) — **Obligatoire**

### Description
Indique si **FluxCD** est activé (`true`) ou désactivé (`false`) dans le cluster.
Lorsqu’il est activé, FluxCD déploie ses contrôleurs et démarre la synchronisation GitOps.

### Exemple
```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description
Le champ `valuesOverride` permet de **surcharger les valeurs Helm par défaut** utilisées pour le déploiement de FluxCD.
Il est notamment utilisé pour configurer les ressources, les CRDs, ou les options avancées comme la fréquence de synchronisation, les sources Git et les stratégies de mise à jour automatique.

### Exemples

#### Configuration basique
```yaml
valuesOverride:
  installCRDs: true
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 200m
      memory: 256Mi
```

#### Configuration avec un gitrepo de fluxcd
```yaml
valuesOverride:
  installCRDs: true
  # Configuration du Git repository
  gitRepository:
    url: "https://github.com/company/k8s-manifests"
    branch: "main"
    path: "./clusters/production"
```

---

## 💡 Bonnes pratiques

- Activer `enabled: true` pour bénéficier du déploiement continu basé sur GitOps.
- Utiliser `valuesOverride` pour personnaliser les ressources et ajuster la fréquence de synchronisation selon les besoins.
- Sécuriser l’accès Git avec des **secrets Kubernetes** ou des **tokens personnels**.
- Vérifier la compatibilité de la version de FluxCD avec celle de Kubernetes avant chaque mise à jour.
