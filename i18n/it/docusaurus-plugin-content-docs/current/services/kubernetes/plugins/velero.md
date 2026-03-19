---
sidebar_position: 9
title: Velero
---

# 🧩 Détails du champ `addons.velero`

Le champ `addons.velero` définit la configuration de l’add-on **Velero**, utilisé pour la **sauvegarde et la restauration** des ressources Kubernetes ainsi que des volumes persistants.
Velero permet d’assurer la résilience du cluster en cas de perte de données ou de migration entre environnements.

```yaml
addons:
  velero:
    enabled: true
    valuesOverride:
      velero:
        configuration:
          backupStorageLocation:
            name: default
            provider: aws
            bucket: velero-backups
            config:
              region: eu-west-3
        schedules:
          daily:
            schedule: "0 2 * * *"
            template:
              ttl: 240h
```

---

## `velero` (Object) — **Obligatoire**

### Description

Le champ `velero` regroupe la configuration principale du système de sauvegarde et de restauration du cluster Kubernetes.
Il permet d’activer Velero et de définir ses paramètres de déploiement.

### Exemple

```yaml
velero:
  enabled: true
  valuesOverride:
    velero:
      configuration:
        backupStorageLocation:
          provider: aws
```

---

## `enabled` (boolean) — **Obligatoire**

### Description

Indique si **Velero** est activé (`true`) ou désactivé (`false`).
Lorsqu’il est activé, Velero déploie ses composants (serveur, contrôleurs et CRDs) permettant la gestion des sauvegardes et des restaurations.

### Exemple

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Le champ `valuesOverride` permet de **surcharger les valeurs** du déploiement Velero.
Il sert à définir les paramètres de stockage, les planifications automatiques, les fournisseurs cloud, ou encore les options de sécurité et de ressources.

### Exemple

```yaml
valuesOverride:
  velero:
    configuration:
      backupStorageLocation:
        provider: aws
        bucket: velero-backups
        config:
          region: eu-west-3
    schedules:
      daily:
        schedule: "0 2 * * *"
        template:
          ttl: 240h
```

---

## 💡 Buone pratiche

- Activer `enabled: true` pour assurer la sauvegarde régulière des ressources critiques du cluster.
- Utiliser `valuesOverride` pour adapter la configuration au fournisseur cloud ou au stockage choisi (AWS, GCP, Azure, MinIO, etc.).
- Configurer des **schedules** (planifications) automatiques pour les sauvegardes récurrentes.
- Vérifier régulièrement l’intégrité des sauvegardes et la possibilité de restauration.
- Restreindre les accès aux clés de stockage pour sécuriser les données de sauvegarde.

---
