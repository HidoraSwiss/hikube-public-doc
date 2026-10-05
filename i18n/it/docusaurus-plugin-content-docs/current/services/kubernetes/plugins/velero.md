---
sidebar_position: 9
title: Velero
---

# Velero

L'addon **Velero** installa lo strumento di **backup e ripristino** delle risorse Kubernetes e dei volumi persistenti. Garantisce la resilienza del cluster in caso di perdita di dati o di migrazione tra ambienti.

## Nella console

1. Alla creazione, passaggio **Addons**, selezioni **Velero** (disattivato per impostazione predefinita).
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni **Velero**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Velero** nella sezione **Extensions** quando è attivo.

Velero si installa nel cluster con il plugin AWS (`velero-plugin-for-aws`, per lo storage S3) già installato. Nessuna posizione di backup è configurata per impostazione predefinita.

## Configurare lo storage dei backup

Velero necessita di una posizione di object storage per i propri backup, ad esempio un [bucket S3 Hikube](../../storage/buckets/overview.md). Questa posizione si dichiara nel campo **Helm Configuration (YAML) — optional**, che compare una volta selezionato l'addon. Il valore viene trasmesso al chart Helm di Velero, sotto la chiave `velero`.

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
        aws_access_key_id=<chiave-di-accesso>
        aws_secret_access_key=<chiave-segreta>
  schedules:
    daily:
      schedule: "0 2 * * *"
      template:
        ttl: 240h
```

Le opzioni disponibili sono descritte nel [chart Helm di Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero).

:::warning
Le chiavi di accesso inserite nella sovrascrittura sono archiviate nella configurazione del cluster. Utilizzi un utente di bucket dedicato a Velero, limitato al bucket di backup.
:::

## Utilizzo nel cluster

```bash
# Posizioni di backup e relativo stato
kubectl get backupstoragelocations -A

# Backup e ripristini
kubectl get backups -A
kubectl get restores -A
```

Con la CLI `velero` (configurata sul kubeconfig del cluster). Indichi innanzitutto il namespace in cui è installato l'addon:

```bash
velero client config set namespace=$(kubectl get deploy -A -l app.kubernetes.io/name=velero -o jsonpath='{.items[0].metadata.namespace}')

velero backup create my-backup --include-namespaces production
velero backup describe my-backup
velero restore create --from-backup my-backup
```

## Buone pratiche

- Pianifichi backup ricorrenti (`schedules`) con una durata di conservazione (`ttl`) adeguata.
- Testi regolarmente un ripristino completo su un cluster di collaudo.
- Archivi i backup in un bucket distinto da quello dei dati applicativi.
