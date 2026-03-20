---
title: "Comment configurer les sauvegardes automatiques"
---

# Comment configurer les sauvegardes automatiques

Ce guide explique comment activer et configurer les sauvegardes automatiques de votre base PostgreSQL vers un stockage compatible S3, via l'opérateur CloudNativePG.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **PostgreSQL** déployée sur Hikube (ou un manifeste prêt à déployer)
- Un **bucket S3-compatible** accessible (Hikube Object Storage, AWS S3, etc.)
- Les **identifiants S3** : access key, secret key, URL du endpoint

## Étapes

### 1. Préparer les identifiants S3

Avant d'activer les sauvegardes, rassemblez les informations suivantes :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `destinationPath` | Chemin S3 du bucket de destination | `s3://backups/postgresql/production/` |
| `endpointURL` | URL du endpoint S3 | `https://prod.s3.hikube.cloud` |
| `s3AccessKey` | Clé d'accès S3 | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu` |
| `s3SecretKey` | Clé secrète S3 | `ju3eum4dekeich9ahM1te8waeGai0oog` |

:::tip
Si vous utilisez le stockage objet Hikube, l'endpoint par défaut est `https://prod.s3.hikube.cloud`. Pour un fournisseur externe (AWS S3, Scaleway, etc.), renseignez l'URL correspondante.
:::

### 2. Créer le manifeste PostgreSQL avec backup activé

Créez ou modifiez votre manifeste pour inclure la section `backup` :

```yaml title="postgresql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

**Détail des paramètres de backup :**

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| `backup.enabled` | Active les sauvegardes automatiques | `false` |
| `backup.schedule` | Planification cron (ici : tous les jours à 2h) | `"0 2 * * * *"` |
| `backup.retentionPolicy` | Durée de rétention des sauvegardes | `"30d"` |
| `backup.destinationPath` | Chemin S3 de destination | _(requis)_ |
| `backup.endpointURL` | URL du endpoint S3 | _(requis)_ |
| `backup.s3AccessKey` | Clé d'accès S3 | _(requis)_ |
| `backup.s3SecretKey` | Clé secrète S3 | _(requis)_ |

:::note
La planification `schedule` utilise la syntaxe cron standard. Exemples courants :
- `"0 2 * * *"` : tous les jours à 2h00
- `"0 */6 * * *"` : toutes les 6 heures
- `"0 2 * * 0"` : tous les dimanches à 2h00
:::

### 3. Appliquer la configuration

```bash
kubectl apply -f postgresql-with-backup.yaml
```

### 4. Vérifier que les sauvegardes sont configurées

Vérifiez que l'instance PostgreSQL est bien déployée avec le backup activé :

```bash
kubectl get postgres my-database -o yaml | grep -A 10 backup
```

**Résultat attendu :**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: https://prod.s3.hikube.cloud
```

## Vérification

Pour confirmer que les sauvegardes fonctionnent correctement :

1. **Vérifiez les logs** du pod PostgreSQL primary pour les messages relatifs aux sauvegardes :

```bash
kubectl logs postgres-my-database-1 -c postgres | grep -i backup
```

2. **Vérifiez le contenu du bucket S3** pour confirmer que les fichiers WAL et les sauvegardes base sont bien envoyés.

3. **Vérifiez les événements** liés à l'instance :

```bash
kubectl describe postgres my-database
```

:::warning
Testez régulièrement la restauration de vos sauvegardes. Une sauvegarde qui n'a jamais été testée n'est pas une sauvegarde fiable. Consultez le guide [Comment restaurer une sauvegarde (PITR)](./restore-backup.md).
:::

## Pour aller plus loin

- **[Référence API PostgreSQL](../api-reference.md)** : documentation complète de tous les paramètres de backup
- **[Comment restaurer une sauvegarde (PITR)](./restore-backup.md)** : restaurer vos données à un instant précis
