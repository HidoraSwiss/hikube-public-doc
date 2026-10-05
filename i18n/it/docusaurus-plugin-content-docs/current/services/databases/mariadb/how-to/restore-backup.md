---
title: "Come ripristinare un backup"
sidebar_position: 4
---

# Come ripristinare un backup

:::info Disponibilità
Il ripristino dei backup MariaDB non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per ripristinare un cluster a partire da un backup gestito dalla piattaforma, [contatti il supporto](mailto:support@hidora.io).
:::

## Informazioni da preparare

| Informazione | Esempio |
|--------------|---------|
| Progetto e nome del cluster | `prod` / `shop-db` |
| Backup da ripristinare | Il più recente, oppure una data precisa |

## Ripristino di un'esportazione logica

Se dispone di un'esportazione eseguita con `mysqldump`, può ripristinarla autonomamente in un database esistente. L'utente deve disporre del diritto **Administrator (Admin)** sul database di destinazione:

```bash
mysql -h <host> -P 3306 -u app-user -p myapp < myapp-2026-06-15.sql
```

## Verifica

```sql
-- Controllare il numero di righe delle tabelle ripristinate
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'myapp'
ORDER BY table_rows DESC;
```

## Per approfondire

- [Configurare i backup](./configure-backups.md)
- [Gestire utenti e database](./manage-users-databases.md)
