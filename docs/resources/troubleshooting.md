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

### Ressource bloquée « En création »

**Symptôme :** une ressource reste au statut **En création** bien au-delà du délai habituel (quelques minutes).

**Solutions :**
- rechargez la page de détail ;
- si le statut ne change pas, ou passe à **Erreur** / **Échec**, contactez le support en indiquant le projet et le nom de la ressource.

---

## 3. Kubernetes

### Le téléchargement du kubeconfig échoue

**Symptôme :** le bouton **Kubeconfig** affiche **Erreur de téléchargement**.

**Solution :** le cluster n'est probablement pas encore prêt. Attendez qu'il passe au statut **Prêt**, puis réessayez.

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
- vérifiez que vous utilisez la clé privée correspondant à la clé publique fournie à la création.

Voir : [Machines virtuelles - Dépannage](../services/compute/troubleshooting.md)

---

## 5. Bases de données et messagerie

### Connexion refusée depuis l'extérieur

**Solutions :**
- vérifiez que l'**Accès externe** est activé sur le cluster (**Modifier**) ;
- utilisez l'adresse affichée dans le champ **Hôte** de la page de détail. Tant qu'elle n'est pas attribuée, la connexion externe n'est pas possible ;
- vérifiez l'utilisateur et le mot de passe affichés dans la console.

### Mot de passe refusé

Vérifiez que vous utilisez le mot de passe de l'utilisateur concerné, affiché sur la page de détail du cluster. Pour Redis et RabbitMQ, si vous avez fait une rotation de mot de passe, mettez à jour vos applications.

Voir : [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Stockage

### Impossible de supprimer un bucket

Un bucket qui contient encore des objets, ou qui est encore utilisé, ne peut pas être supprimé. Videz-le avec votre client S3, puis réessayez.

### Accès S3 refusé (`AccessDenied`)

Vérifiez que la clé d'accès utilisée appartient à un utilisateur du bucket, avec les droits adaptés (lecture seule ou lecture/écriture).

Voir : [Buckets - Dépannage](../services/storage/buckets/troubleshooting.md), [Disques - Dépannage](../services/storage/disks/troubleshooting.md)

---

## Contacter le support

Si le problème persiste : menu de profil → **Contacter le support** (le contexte technique de la page est joint), ou **support@hidora.io**. Précisez l'organisation, le projet et le nom des ressources concernées.
