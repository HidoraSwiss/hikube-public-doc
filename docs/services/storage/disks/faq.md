---
sidebar_position: 6
title: FAQ
---

# FAQ — Disques

### Quelle différence entre un disque et un bucket S3 ?

Un **disque** est un volume bloc attaché à une seule VM, que le système d'exploitation formate et monte comme un disque local. Un [bucket S3](../buckets/overview.md) est un stockage objet accessible par API HTTPS depuis n'importe quelle application, sans être attaché à une machine.

---

### Puis-je créer un disque directement depuis l'assistant de VM ?

Oui. À l'étape **Stockage** de l'assistant de création de VM, chaque volume en mode **Nouveau** crée un disque. Ces disques apparaissent ensuite dans **Infrastructure** → **Disques**, comme ceux créés depuis le menu **Disques**.

---

### Un disque peut-il être attaché à plusieurs VM ?

Non. Un disque est attaché à une seule VM à la fois. Pour le déplacer, détachez-le de la première VM, puis attachez-le à la seconde (voir [Attacher un disque à une VM](./how-to/attach-to-vm.md)).

---

### Que deviennent les disques quand je supprime une VM ?

Ils sont **détachés** et conservés, avec leurs données. Ils restent dans la liste **Disques de Stockage** au statut **Prêt** et continuent de consommer le quota de stockage du projet jusqu'à leur suppression.

---

### Peut-on réduire la taille d'un disque ?

Non. « La réduction de taille n'est pas supportée » : un disque ne peut qu'être agrandi. Pour réduire l'espace utilisé, créez un disque plus petit, copiez-y les données depuis la VM, puis supprimez l'ancien.

---

### Peut-on activer le chiffrement ou changer la réplication après la création ?

Non. Le chiffrement et le type de réplication se choisissent à la création ; seule la taille est modifiable ensuite. Pour changer ces options, créez un nouveau disque et copiez-y les données.

---

### Quelle réplication choisir ?

- **Réplication Asynchrone** (recommandée) : convient à la plupart des charges de travail. RPO < 5 min.
- **Réplication Synchrone** : pour les données dont la perte doit être minimale. RPO < 1 min.

Dans les deux cas, le RTO est inférieur à 5 minutes.

---

### Pourquoi la taille minimale est-elle de 50 Go pour Windows ?

Un disque système Windows nécessite au moins 50 Go. La console applique automatiquement ce minimum lorsque vous sélectionnez une image Windows.

---

### Comment est facturé un disque ?

L'assistant affiche un **Coût estimé** : un tarif par Go et par mois, et le coût mensuel correspondant à la taille choisie. Le tarif dépend du chiffrement ; un disque système Windows ajoute le coût de la licence.

---

### Pourquoi ne puis-je pas supprimer mon disque ?

Un disque attaché à une VM ne peut pas être supprimé : la console répond « Le disque ne peut pas être supprimé car il est en cours d'utilisation. ». Détachez-le d'abord depuis la page de modification de la VM.
