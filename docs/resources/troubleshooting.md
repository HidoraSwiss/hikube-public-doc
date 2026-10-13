---
sidebar_position: 1
title: Dépannage global
---

# Dépannage global Hikube

Ce guide couvre les problèmes les plus courants rencontrés sur Hikube. Pour un problème propre à un service, consultez aussi la page **Dépannage** de ce service.

---

## 1. Accès à la console

### « Aucune organisation »

**Symptôme :** après connexion, la console affiche **Aucune organisation**.

**Solutions :**
- si votre organisation vient d'être créée, cliquez sur **Actualiser** ;
- sinon, votre compte n'est rattaché à aucune organisation : [contactez le support](mailto:support@hidora.io).

### « Service Indisponible »

**Symptôme :** la console affiche **Service Indisponible**.

**Solutions :**
- la plateforme est en maintenance ou momentanément injoignable : patientez quelques instants puis cliquez sur **Réessayer** ;
- si le problème persiste, contactez le support depuis cette page : les **Détails de l'erreur** sont joints à votre demande.

### Je ne vois pas un projet

Les projets affichés dépendent de l'organisation sélectionnée et de vos droits. Vérifiez l'**Organisation actuelle** dans le menu de profil (**Changer d'organisation** si vous en avez plusieurs), puis demandez à un administrateur de l'organisation de vous donner accès au projet.

---

## 2. Création d'une ressource

### « Quota dépassé »

**Symptôme :** l'assistant de création bloque la validation et signale un dépassement de quota.

**Solutions :**
- réduisez la taille demandée (type d'instance, preset, stockage, nombre de nœuds maximum) ;
- libérez des ressources inutilisées dans le projet ;
- demandez à un administrateur d'augmenter les quotas du projet (paramètres du projet → **Quotas**).

:::note Kubernetes
Pour un cluster Kubernetes, le quota est calculé sur le **nombre maximum** de nœuds de chaque groupe, auto-scaling compris.
:::

### « Les quotas du projet sont indisponibles »

La console ne parvient pas à lire les quotas du projet et bloque la création par sécurité. Rechargez la page ; si le message persiste, contactez le support.

### Ressource bloquée « En création » ou au statut « Erreur »

**Symptôme :** une ressource reste au statut **En création** bien au-delà du délai habituel (quelques minutes), ou passe au statut **Erreur**.

Un projet, un VPC ou une application managée (cluster Kubernetes, base de données…) passe au statut **Erreur** quand la plateforme n'a pas pu appliquer sa dernière modification. La ressource peut continuer de fonctionner avec sa configuration précédente. Un projet en erreur porte un badge **Erreur** dans le sélecteur de projet.

**Solutions :**
- rechargez la page de détail ;
- si le statut ne change pas, ou passe à **Erreur** / **Échec**, contactez le support en indiquant le projet et le nom de la ressource.

---

## 3. Kubernetes

### La création du premier cluster attend « Préparation de l'environnement Kubernetes »

**Symptôme :** après **Déployer**, l'assistant affiche « Préparation de l'environnement Kubernetes du projet, la création reprendra automatiquement. »

**Solution :** pour le premier cluster d'un projet, la plateforme prépare d'abord l'environnement Kubernetes du projet, ce qui prend quelques minutes. Patientez : la console relance la création seule, sans perdre votre configuration (le bouton **Annuler** arrête l'attente). Si un message vous demande de contacter le support, ne réessayez pas et contactez-le.

### Le téléchargement du kubeconfig échoue

**Symptôme :** après un clic sur **Kubeconfig**, la console affiche **Erreur** : « Impossible d'obtenir le fichier kubeconfig. »

**Solution :** le cluster n'est probablement pas encore prêt. Attendez qu'il passe au statut **Prêt**, puis réessayez.

### Le bouton Kubeconfig est désactivé

**Symptôme :** le bouton **Kubeconfig** est grisé, avec la mention « Réservé aux administrateurs du projet. », ou la console affiche « Le kubeconfig donne un accès administrateur au cluster : il est réservé aux administrateurs du projet. »

**Solution :** le kubeconfig donne un accès administrateur au cluster ; son téléchargement est réservé aux administrateurs du projet. Adressez-vous à un administrateur du projet.

### `kubectl` ne parvient pas à joindre le cluster

```bash
# Vérifier le fichier utilisé
echo $KUBECONFIG
kubectl config view --minify

# Tester la connexion
kubectl cluster-info
```

**Solutions :**
- vérifiez que `KUBECONFIG` pointe vers le fichier `kubeconfig-<nom-du-cluster>.yaml` téléchargé depuis la console ;
- si le cluster a été recréé, téléchargez à nouveau son kubeconfig.

### Pods en erreur dans votre cluster

Les commandes suivantes s'exécutent **dans votre cluster Kubernetes**, avec son kubeconfig :

```bash
kubectl get pods -A
kubectl describe pod <nom-du-pod> -n <namespace>
kubectl logs <nom-du-pod> -n <namespace> --previous
```

| État | Cause fréquente | Piste |
|------|-----------------|-------|
| `CrashLoopBackOff` | Erreur applicative, mémoire insuffisante | Lisez les logs du conteneur précédent ; augmentez les limites mémoire |
| `Pending` | Pas assez de ressources sur les nœuds | Augmentez le maximum du groupe de nœuds dans la console ou choisissez un type d'instance plus grand |
| `ImagePullBackOff` | Image introuvable ou registre privé | Vérifiez le nom de l'image et les identifiants du registre |
| `OOMKilled` | Limite mémoire atteinte | Augmentez `resources.limits.memory` du conteneur |

Voir : [Kubernetes - Dépannage](../services/kubernetes/troubleshooting.md)

---

## 4. Machines virtuelles

### Impossible de se connecter en SSH

**Solutions :**
- vérifiez que la VM est au statut **Actif** dans **Instances VM** ;
- vérifiez qu'une IP publique est attribuée et que le port 22 est autorisé dans la configuration réseau de la VM ;
- vérifiez que vous utilisez la clé privée correspondant à la clé publique fournie à la création ;
- connectez-vous avec l'utilisateur indiqué dans le bloc **Connexion SSH** de la page de détail de la VM (par exemple `debian` pour Debian, `opc` pour Oracle Linux). Si la console indique que l'utilisateur par défaut n'est pas disponible, utilisez le compte configuré dans votre image.

Voir : [Machines virtuelles - Dépannage](../services/compute/troubleshooting.md)

---

## 5. Bases de données et messagerie

### Connexion refusée depuis l'extérieur

**Solutions :**
- vérifiez que l'**Accès externe** est activé sur le cluster (**Modifier**) ;
- utilisez l'adresse affichée dans le champ **Hôte** de la page de détail. Tant qu'elle n'est pas attribuée, la connexion externe n'est pas possible. Pour un replica set MongoDB, la page de détail liste l'adresse de chaque membre : connectez-vous à un membre avec `directConnection=true` ;
- vérifiez l'utilisateur et le mot de passe affichés dans la console.

### Mot de passe refusé

Vérifiez que vous utilisez le mot de passe de l'utilisateur concerné, affiché sur la page de détail du cluster. Pour Redis et RabbitMQ, si vous avez fait une rotation de mot de passe, mettez à jour vos applications.

### La modification d'un cluster est refusée

La version d'une base de données ne peut pas être abaissée, et la taille de son disque ne peut pas être réduite. Pour PostgreSQL, MariaDB, MongoDB et RabbitMQ, la console ne propose que la version actuelle et les versions supérieures, et affiche par exemple « La taille du disque ne peut pas être réduite : 20 Go minimum. » Un changement de version ou de preset redémarre les instances du cluster : planifiez-le en dehors des périodes de forte activité.

Voir : [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Stockage

### Supprimer un bucket sans perdre de données

La suppression d'un bucket sans WORM est définitive et emporte tous ses objets, même s'il n'est pas vide. Copiez d'abord les données à conserver avec votre client S3 (par exemple `aws s3 sync`). Si la suppression échoue, réessayez puis contactez le support.

Un bucket verrouillé (WORM) est retiré de la console, mais ses objets ne sont pas supprimés : chaque objet reste verrouillé 365 jours après son écriture (mode COMPLIANCE).

### Accès S3 refusé (`AccessDenied`)

Vérifiez que la clé d'accès utilisée appartient à un utilisateur du bucket, avec les droits adaptés (lecture seule ou lecture/écriture).

Vérifiez aussi le nom du bucket configuré dans votre client S3 : utilisez le nom S3 réel (`bucket-…`), affiché dans le champ **Nom du bucket** de la page du bucket, et non le nom saisi à la création.

### Impossible de réduire la taille d'un disque

La taille d'un disque peut être augmentée depuis le menu **Disques** (voir [Redimensionner un disque](../services/storage/disks/how-to/resize.md)), jamais réduite. La page de modification d'une VM ne change pas la taille de ses disques : ceux que la VM possède déjà y sont en lecture seule. Pour disposer d'un disque plus petit, créez un nouveau disque et copiez-y vos données.

### Un disque ne peut pas être supprimé

**Symptôme :** la console refuse la suppression d'un disque.

**Solutions :**
- le disque est encore attaché à une VM : détachez-le depuis la page **Modifier** de la VM (**Détacher le disque**), ou supprimez la VM. Le disque système d'une VM ne se détache pas : il ne peut être supprimé qu'après la suppression de la VM ;
- le disque a été détaché, mais sa VM l'utilise encore : la console affiche « Ce disque a été détaché, mais sa VM l'utilise encore jusqu'à son prochain redémarrage. Redémarrez la VM, puis réessayez. » Redémarrez la VM, puis relancez la suppression.

Voir : [Buckets - Dépannage](../services/storage/buckets/troubleshooting.md), [Disques - Dépannage](../services/storage/disks/troubleshooting.md)

---

## Contacter le support

Si le problème persiste : menu de profil → **Contacter le support** (le contexte technique de la page est joint), ou **support@hidora.io**. Précisez l'organisation, le projet et le nom des ressources concernées.
