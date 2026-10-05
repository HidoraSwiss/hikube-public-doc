---
sidebar_position: 9
title: Velero
---

# Velero

L'addon **Velero** installe l'outil de **sauvegarde et de restauration** des ressources Kubernetes et des volumes persistants. Il assure la résilience du cluster en cas de perte de données ou de migration entre environnements.

## Dans la console

1. À la création, étape **Addons**, cochez **Velero** (désactivé par défaut).
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez **Velero**, puis **Enregistrer**.

La page de détail du cluster affiche **Velero** dans la section **Extensions** lorsqu'il est actif.

Velero s'installe dans le cluster avec le plugin AWS (`velero-plugin-for-aws`, pour le stockage S3) déjà installé. Aucun emplacement de sauvegarde n'est configuré par défaut.

## Configurer le stockage des sauvegardes

Velero a besoin d'un emplacement de stockage objet pour ses sauvegardes, par exemple un [bucket S3 Hikube](../../storage/buckets/overview.md). Cet emplacement se déclare dans le champ **Configuration Helm (YAML) — optionnel**, qui apparaît une fois l'addon coché. La valeur est transmise au chart Helm de Velero, sous la clé `velero`.

```yaml title="velero-override.yaml"
velero:
  configuration:
    backupStorageLocation:
      - name: default
        provider: aws
        bucket: velero-backups
        config:
          region: us-east-1
          s3ForcePathStyle: "true"
          s3Url: https://<endpoint-s3>
  credentials:
    secretContents:
      cloud: |
        [default]
        aws_access_key_id=<clé-d-accès>
        aws_secret_access_key=<clé-secrète>
  schedules:
    daily:
      schedule: "0 2 * * *"
      template:
        ttl: 240h
```

Les options disponibles sont décrites dans le [chart Helm de Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero).

:::warning
Les clés d'accès saisies dans la surcharge sont stockées dans la configuration du cluster. Utilisez un utilisateur de bucket dédié à Velero, limité au bucket de sauvegarde.
:::

## Utilisation dans le cluster

```bash
# Emplacements de sauvegarde et leur état
kubectl get backupstoragelocations -A

# Sauvegardes et restaurations
kubectl get backups -A
kubectl get restores -A
```

Avec la CLI `velero` (configurée sur le kubeconfig du cluster). Indiquez-lui d'abord le namespace où l'addon est installé :

```bash
velero client config set namespace=$(kubectl get deploy -A -l app.kubernetes.io/name=velero -o jsonpath='{.items[0].metadata.namespace}')

velero backup create my-backup --include-namespaces production
velero backup describe my-backup
velero restore create --from-backup my-backup
```

## Bonnes pratiques

- Planifiez des sauvegardes récurrentes (`schedules`) avec une durée de rétention (`ttl`) adaptée.
- Testez régulièrement une restauration complète sur un cluster de recette.
- Stockez les sauvegardes dans un bucket distinct de vos données applicatives.
