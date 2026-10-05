---
sidebar_position: 6
title: FAQ
---

# FAQ — Buckets S3

### Quel est l'endpoint S3 Hikube ?

L'endpoint est affiché sur la page de chaque bucket, dans la carte **Accès & Configuration**, champ **Point de terminaison (Endpoint)** (par exemple `prod.s3.hikube.cloud`). Il est aussi indiqué avec les clés lors de la création d'un utilisateur.

Préfixez-le par `https://` dans vos clients S3.

---

### Pourquoi le nom S3 du bucket est-il différent du nom que j'ai choisi ?

Le nom choisi dans la console identifie le bucket dans votre projet. Le **nom S3 réel** est généré par la plateforme pour garantir son unicité sur l'endpoint. Utilisez toujours le **Nom du bucket** affiché dans **Accès & Configuration** dans vos commandes et SDK.

---

### Quels outils sont compatibles ?

Tous les outils compatibles avec l'API S3 :

| Outil | Configuration |
|-------|--------------|
| **aws-cli** | `aws --endpoint-url https://<endpoint> s3 ls s3://<bucket>/` |
| **mc** (MinIO Client) | `mc alias set hikube https://<endpoint> <access-key> <secret-key>` |
| **rclone** | Remote de type `s3` avec l'endpoint Hikube |
| **s3cmd** | `host_base` et `host_bucket` vers l'endpoint Hikube |
| **Velero** | Backup Kubernetes vers S3 Hikube |
| **Restic** | Backup de fichiers vers S3 Hikube |

Toute bibliothèque compatible AWS S3 (boto3, aws-sdk-js, etc.) fonctionne également.

---

### Comment fonctionnent les identifiants ?

Les identifiants sont rattachés à des **utilisateurs S3** du bucket. Chaque utilisateur reçoit, à sa création, une **Access Key ID** et une **Secret Access Key**, ainsi que le nom S3 du bucket et l'endpoint. Un bucket peut avoir plusieurs utilisateurs, chacun en **Lecture seule** ou en **Lecture / Écriture**.

Voir [Gérer les utilisateurs et les clés d'accès](./how-to/configure-access.md).

---

### J'ai perdu la clé secrète d'un utilisateur. Que faire ?

La clé secrète n'est affichée qu'une seule fois et ne peut pas être récupérée. Créez un nouvel utilisateur (bouton **Ajouter un utilisateur**), mettez à jour vos applications, puis supprimez l'ancien utilisateur.

---

### Peut-on avoir plusieurs buckets ?

Oui. Créez autant de buckets que nécessaire avec **Créer un bucket**. Chaque bucket a son propre nom S3 et ses propres utilisateurs ; les clés d'un bucket ne donnent pas accès aux autres.

---

### Peut-on lister tous ses buckets avec un client S3 ?

Non. Les clés d'un utilisateur sont limitées à son bucket : `aws s3 ls` sans nom de bucket renvoie `AccessDenied`. La liste de vos buckets est visible dans la console, page **Buckets Object Storage**.

---

### À quoi sert le verrouillage (WORM) ?

L'option **Activer le verrouillage (Object Lock / WORM)** empêche la suppression ou la modification des objets pendant une durée définie. Elle sert à l'archivage réglementaire ou à la protection des sauvegardes contre une suppression accidentelle ou malveillante. Elle se choisit à la création du bucket.

---

### Le chiffrement peut-il être activé après coup ?

Non. **Activer le chiffrement au repos (LUKS)** se choisit à la création et ne peut pas être modifié ensuite. Pour chiffrer des données existantes, créez un nouveau bucket chiffré et copiez-y les objets (par exemple avec `rclone sync` ou `mc mirror`).

---

### Quelle est la durabilité des données ?

Les données sont répliquées sur trois datacenters (Genève, Gland, Lucerne). Cette architecture maintient la disponibilité et la durabilité des données, même en cas de panne complète d'un datacenter.

---

### Comment est facturé un bucket ?

L'assistant de création affiche un **Coût estimé** par Go et par mois (et par heure). Le tarif d'un bucket chiffré est distinct de celui d'un bucket standard.
