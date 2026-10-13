---
title: Hikube API v1.5.1
authors: [hikube]
tags: [release]
---

Les bases de données managées, RabbitMQ et le control plane Kubernetes se dimensionnent désormais avec les tailles des machines virtuelles, et les applications managées sont facturées 10 CHF par vCPU et par Gio. Cette version protège aussi le disque système des VM en service et aligne les règles des bases PostgreSQL.

<!-- truncate -->

## Ajouté

- **Bases de données managées et RabbitMQ** — Le champ `preset` prend les tailles des machines virtuelles, des séries `u1`, `s1` et `m1`. Une taille a les mêmes ressources qu'une VM du même nom : `u1.medium` vaut 1 vCPU et 4 Gio. Les 17 tailles proposées vont de `s1.small` (1 vCPU / 2 Gio) à `m1.8xlarge` (32 vCPU / 256 Gio). L'opération `presets` de chaque service les liste avec leurs ressources.

- **Kubernetes** — Le control plane se dimensionne en `u1.small` (1 vCPU / 2 Gio) ou en `u1.2xmedium` (2 vCPU / 4 Gio). La taille s'applique à ses quatre composants, et la réponse détaille la taille de chacun.

- **Ressources** — La réponse d'une base de données, de RabbitMQ ou d'un cluster Kubernetes indique les ressources réelles de sa taille (`resources` : CPU et mémoire).

- **Codes d'erreur** — Deux nouveaux refus, renvoyés en HTTP 400 :

| Code | Service | Signification |
| --- | --- | --- |
| `20208` | Compute | Le disque système d'une VM existante ne peut être ni remplacé, ni détaché, ni déplacé |
| `30201` | Disques | Le disque est détaché, mais la VM l'utilise encore jusqu'à son prochain redémarrage : il ne peut pas encore être supprimé |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Tailles des bases de données et de RabbitMQ** — Les anciens noms (`small`, `medium`, `large`…) restent acceptés pour le moment, avec ressources inchangées. Chaque requête qui en utilise un reçoit un en-tête `Warning` qui indique la taille équivalente à utiliser. Un nom des séries `u1`, `s1` ou `m1` désigne toujours la taille de VM : `u1.small`, par exemple, est refusé pour une base de données.

- **Kubernetes** — Un control plane plus petit que `small` est refusé à la création et lors d'un changement de taille (code `70111`) : `nano`, `micro` et leurs équivalents. Un cluster existant de cette taille reste modifiable tant que sa taille ne change pas.

- **Prix** — Une application managée coûte 10 CHF par mois par vCPU et par Gio de mémoire : `s1.small` coûte 30 CHF, `u1.medium` 50 CHF. Le control plane Kubernetes reste au forfait de 32 CHF par mois, quelle que soit sa taille. Une base de données qui garde un ancien nom de taille n'a pas de prix catalogue tant qu'elle n'est pas passée à une taille de la liste.

- **Quotas** — Le quota compte désormais les trois sentinelles d'un cluster Redis, à la taille du cluster, ainsi que les quatre composants du control plane Kubernetes. Les sentinelles ne sont pas facturées.

- **PostgreSQL** — Les bases système `postgres`, `template0` et `template1` ne peuvent plus recevoir de rôle, ni être créées, modifiées ou supprimées (code `80105`). Un utilisateur qui détient déjà un rôle sur l'une d'elles le garde tant que ce rôle ne change pas.

- **PostgreSQL** — Un nom de base peut contenir des minuscules, des chiffres, des tirets bas (`_`) et des tirets. Il commence par une lettre ou un tiret bas, ne commence pas par `pg_`, et compte 54 caractères au plus. Les noms de 55 à 63 caractères, acceptés jusqu'ici, sont refusés (code `80105`).

- **Compute** — Une mise à jour de VM qui remplace, retire ou déplace son disque système est refusée (code `20208`). Pour changer de disque système, supprimez la VM, puis recréez-la à partir du disque voulu.

- **Disques** — La suppression d'un disque encore utilisé est refusée : disque attaché ou listé dans une VM (code `30007`), ou disque détaché que la VM utilise jusqu'à son prochain redémarrage (code `30201`). Redémarrez la VM, puis réessayez.

## Corrigé

- **Kubernetes** — Une mise à jour qui ne change pas le control plane, comme l'activation d'un addon, ne le modifie plus et ne remplace plus ses composants.

- **Kubernetes, PostgreSQL et Redis** — Un cluster dont la taille ne figure pas dans la liste reste modifiable : sa taille est renvoyée telle quelle et n'est plus refusée tant qu'elle ne change pas.

- **PostgreSQL** — Les noms de base avec un tiret bas, comme `app_db`, sont acceptés.

## Sécurité

- **Compute et disques** — Une modification de VM pouvait remplacer ou détacher le disque système d'une VM en service, et ce disque pouvait ensuite être supprimé alors que la VM l'utilisait encore. L'API refuse désormais ces deux opérations.
