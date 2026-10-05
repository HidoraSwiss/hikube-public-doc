---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Buckets S3

### AccessDenied lors de l'accès au bucket

**Cause** : les clés utilisées sont incorrectes, le nom de bucket utilisé n'est pas le nom S3 réel, ou l'utilisateur est en lecture seule et tente une écriture.

**Solution** :

1. Ouvrez la page du bucket et relevez le **Nom du bucket** dans la carte **Accès & Configuration**. Utilisez ce nom, et non le nom saisi dans l'assistant :
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<nom-du-bucket-s3>/
   ```
2. Vérifiez dans la carte **Utilisateurs et Accès** le droit de l'utilisateur (**Lecture seule** ou **Lecture / Écriture**) ; modifiez-le si besoin avec **Modifier l'accès**.
3. Vérifiez que l'Access Key ID et la Secret Access Key sont correctement configurées dans votre outil. Si la clé secrète est perdue, créez un nouvel utilisateur.

---

### ListBucket échoue sur la racine

**Cause** : les clés d'un utilisateur sont limitées à son bucket. Il n'est pas possible de lister tous les buckets de l'endpoint.

**Solution** :

1. Ciblez toujours le bucket dans vos commandes :
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<nom-du-bucket-s3>/
   mc ls hikube/<nom-du-bucket-s3>/
   ```
2. Pour voir tous vos buckets, utilisez la page **Buckets Object Storage** de la console.

---

### Identifiants introuvables

**Cause** : la clé secrète n'est affichée qu'à la création de l'utilisateur, ou aucun utilisateur n'a été créé (par exemple si le bucket n'était pas prêt à la fin de l'assistant).

**Solution** :

1. Ouvrez la page du bucket et vérifiez la carte **Utilisateurs et Accès**.
2. Cliquez sur **Ajouter un utilisateur** pour créer un utilisateur et obtenir de nouvelles clés.
3. L'endpoint et le nom S3 restent consultables à tout moment dans **Accès & Configuration**.

---

### « Aucune information de connexion S3 disponible pour l'instant »

**Cause** : le bucket est encore en cours de provisionnement.

**Solution** : attendez que le statut du bucket passe à **Prêt**, puis rechargez la page. Si le statut reste **En création** ou passe à **Erreur**, [contactez le support](mailto:support@hidora.io) en indiquant le nom du bucket et son identifiant.

---

### Échec de création : « Un bucket avec ce nom existe déjà »

**Cause** : un bucket du projet porte déjà ce nom.

**Solution** : revenez à l'étape **Général** de l'assistant et choisissez un autre **Nom du bucket**.

---

### Les objets ont disparu après la suppression d'un bucket

**Cause** : la suppression d'un bucket n'est pas bloquée lorsqu'il contient des objets ; elle les supprime avec lui, sans possibilité de récupération.

**Solution** : avant de supprimer un bucket, copiez les objets à conserver, par exemple sur votre poste :

```bash
aws --endpoint-url https://<endpoint> s3 sync s3://<nom-du-bucket-s3>/ ./sauvegarde-bucket/
```

### La suppression du bucket échoue

**Solution** : réessayez la suppression depuis la console. Si l'erreur persiste, [contactez le support](mailto:support@hidora.io) en indiquant le nom du bucket.

---

### Upload lent ou timeout

**Cause** : problème réseau, fichier volumineux envoyé sans multipart upload.

**Solution** :

1. Vérifiez votre connectivité vers l'endpoint :
   ```bash
   curl -s -o /dev/null -w "%{time_total}\n" https://<endpoint>
   ```
2. Pour les fichiers volumineux, utilisez un client qui gère le multipart upload : `aws s3 cp` et `mc cp` le font automatiquement au-delà d'une certaine taille.
3. Augmentez si besoin le parallélisme côté client (par exemple `aws configure set default.s3.max_concurrent_requests 20`).

---

### Bucket non trouvé (`NoSuchBucket`)

**Cause** : le nom utilisé est le nom choisi dans la console et non le nom S3 réel.

**Solution** : relevez le **Nom du bucket** dans la carte **Accès & Configuration** de la page du bucket et utilisez-le dans vos commandes.

:::warning
Ne confondez pas le nom du bucket dans la console et son nom S3. Seul le second fonctionne avec les clients S3.
:::
