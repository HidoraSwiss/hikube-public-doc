---
sidebar_position: 6
title: FAQ
---

# FAQ — MySQL

### Perche Hikube utilizza MariaDB per il servizio MySQL?

Il servizio MySQL su Hikube e basato su **MariaDB**, distribuito tramite il **MariaDB Operator**. MariaDB e un fork open-source di MySQL, completamente compatibile con il protocollo e la sintassi MySQL. Questa scelta garantisce:

- Una **compatibilita totale** con i client e le applicazioni MySQL esistenti
- Uno sviluppo **open-source** attivo e trasparente
- Funzionalita avanzate (compressione delle colonne, motore Aria, ecc.)

Le vostre applicazioni MySQL funzionano senza modifiche con il servizio MySQL Hikube.

### Qual e la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` permette di scegliere un profilo di risorse predeterminato per ogni replica MySQL. Se il campo `resources` (CPU/memoria espliciti) e definito, `resourcesPreset` viene **completamente ignorato**.

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="mysql.yaml"
spec:
  # Utilizzo di un preset
  resourcesPreset: small

  # OPPURE configurazione esplicita (il preset viene allora ignorato)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Come funziona la replica MySQL su Hikube?

La replica MySQL su Hikube utilizza la **replica binlog** (binary log) gestita dal MariaDB Operator:

- Un nodo e designato come **primary** (lettura-scrittura)
- Gli altri nodi sono delle **repliche** (sola lettura)
- La commutazione automatica (**auto-failover**) e gestita dall'operatore in caso di guasto del primary

Con 3 repliche, ottenete 1 primary + 2 repliche, il che assicura l'alta disponibilita.

### Come configurare i backup con Restic?

I backup MySQL utilizzano **Restic** per la cifratura e la compressione. Configurate la sezione `backup` con uno storage S3 compatibile:

```yaml title="mysql.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/mysql-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Conservate il `resticPassword` in un luogo sicuro. Senza questa password, i backup non potranno essere decifrati.
:::

### Come effettuare uno switchover del primary?

Per commutare il ruolo di primary verso un'altra replica, modificate il campo `spec.replication.primary.podIndex` nel vostro manifesto:

```yaml title="mysql.yaml"
spec:
  replication:
    primary:
      podIndex: 1    # Indice del pod che diventera il nuovo primary
```

Applicate poi la modifica:

```bash
kubectl apply -f mysql.yaml
```

:::note
Lo switchover comporta una **breve interruzione** delle scritture durante la commutazione. Le letture restano disponibili sulle repliche.
:::

### Come gestire utenti e database?

Utilizzate le mappe `users` e `databases` per definire i vostri utenti e database. Ogni utente puo avere un limite di connessioni, e ogni database dei ruoli `admin` e `readonly`:

```yaml title="mysql.yaml"
spec:
  users:
    appuser:
      password: SecurePassword123
      maxUserConnections: 100
    analyst:
      password: AnalystPassword456
      maxUserConnections: 20

  databases:
    production:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
    analytics:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
```
