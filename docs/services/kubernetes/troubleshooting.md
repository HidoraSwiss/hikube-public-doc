---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Kubernetes

### Le cluster reste en création ou passe à Erreur

**Cause** : le provisionnement du control plane ou des nœuds n'aboutit pas, ou la plateforme n'a pas pu appliquer la dernière modification du cluster. Dans ce dernier cas, le cluster passe au statut **Erreur** ; il peut continuer de fonctionner avec sa configuration précédente.

**Solution** :

1. Dans **Infrastructure** > **Kubernetes**, vérifiez le statut du cluster. Un cluster nouvellement créé passe de **En création** à **Prêt** en quelques minutes. Le filtre de statut de la liste permet d'afficher les clusters **Prêt** ou **Erreur**.
2. Sur la page de détail, vérifiez dans **Pools de Nœuds** que des nœuds deviennent actifs.
3. Si le statut ne change pas, ou si le cluster est en **Erreur**, [contactez le support](mailto:support@hidora.io) en indiquant le nom du cluster et le projet.

---

### La création du premier cluster attend « Préparation de l'environnement Kubernetes »

**Cause** : le premier cluster d'un projet ne peut être créé qu'une fois l'environnement Kubernetes du projet prêt, ce qui prend quelques minutes. Un cluster suivant peut rencontrer la même attente brièvement, pendant une modification du projet comme un changement de quota.

**Solution** :

1. Laissez l'assistant ouvert : il affiche « Préparation de l'environnement Kubernetes du projet, la création reprendra automatiquement. » et relance la création seul, sans perdre votre configuration. Le bouton **Annuler** arrête l'attente.
2. Si la console affiche « L'environnement Kubernetes du projet n'est toujours pas prêt. Votre configuration est conservée : réessayez dans quelques minutes. », cliquez de nouveau sur **Déployer** quelques minutes plus tard.
3. Si la console affiche **Erreur de création** avec un message qui vous demande de contacter le support (par exemple « Le déploiement de l'environnement Kubernetes du projet a échoué. Contactez le support. »), ne réessayez pas : [contactez le support](mailto:support@hidora.io) en indiquant le projet.

Si vous créez vos clusters par l'API, ces cas correspondent aux codes d'erreur `70205` (environnement en préparation : renvoyez la même requête quelques minutes plus tard), `70207` et `70208` (ne réessayez pas, contactez le support).

---

### L'assistant bloque la création (quota)

**Cause** : le projet n'a pas assez de quota CPU, mémoire ou stockage. Le quota est calculé sur le control plane et sur le **nombre maximum** de nœuds de chaque groupe, disque des nœuds compris (« Quota de stockage dépassé pour ce projet (en tenant compte de l'auto-scaling maximum) »).

**Solution** :

1. Consultez les jauges **Quotas du projet** de l'assistant pour identifier la ressource dépassée.
2. Réduisez le **Nombre maximum de nœuds**, le type d'instance ou la **Taille du disque des nœuds** des groupes.
3. Si le besoin est réel, demandez une augmentation de quota au support.

---

### Le téléchargement du kubeconfig échoue

**Cause** : la console affiche « Impossible d'obtenir le fichier kubeconfig. » lorsque le cluster n'est pas encore prêt ou que le service est momentanément indisponible.

**Solution** :

1. Attendez que le cluster ait le statut **Prêt**.
2. Cliquez de nouveau sur **Kubeconfig** dans la section **Actions** de la page de détail.
3. Si l'erreur persiste, contactez le support.

---

### Le bouton Kubeconfig est désactivé ou le téléchargement est refusé

**Cause** : le kubeconfig donne un accès administrateur au cluster ; son téléchargement est réservé aux administrateurs du projet. Pour les autres membres, le bouton **Kubeconfig** est désactivé avec la mention « Réservé aux administrateurs du projet. » Si la demande est refusée par la plateforme, la console affiche « Le kubeconfig donne un accès administrateur au cluster : il est réservé aux administrateurs du projet. »

**Solution** :

1. Adressez-vous à un administrateur du projet.
2. Pour un accès limité au cluster, un administrateur peut aussi vous créer un compte dédié avec RBAC dans le cluster (voir [Accès et outils](./how-to/toolbox.md)).

---

### Kubeconfig expiré ou invalide

**Cause** : `kubectl` renvoie `x509: certificate has expired`, `Unauthorized`, ou ne joint plus le serveur (fichier d'un cluster supprimé puis recréé, par exemple).

**Solution** :

1. Téléchargez un nouveau kubeconfig depuis la page de détail du cluster (bouton **Kubeconfig**).
2. Remplacez l'ancien fichier :
   ```bash
   export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
   ```
3. Vérifiez la connectivité :
   ```bash
   kubectl cluster-info
   ```

---

### Nœuds en état NotReady

**Cause** : un ou plusieurs nœuds ne répondent plus au control plane. Cela peut être lié à des ressources insuffisantes, à un disque de nœud saturé ou à une défaillance du kubelet.

**Solution** :

1. Vérifiez l'état des nœuds et leurs conditions :
   ```bash
   kubectl get nodes
   kubectl describe node <nom-du-nœud>
   ```
2. Consultez les événements pour identifier la cause (`DiskPressure`, `MemoryPressure`, `PIDPressure`) :
   ```bash
   kubectl get events -A --sort-by='.lastTimestamp'
   ```
3. En cas de `DiskPressure`, augmentez la **Taille du disque des nœuds** du groupe (**Modifier** > **Groupes de nœuds**).
4. Vérifiez que le type d'instance fournit suffisamment de ressources pour les workloads déployés.
5. Si le problème persiste, contactez le support.

---

### Pods en Pending (ressources insuffisantes)

**Cause** : aucun nœud ne dispose de suffisamment de CPU ou de mémoire pour planifier le pod.

**Solution** :

1. Identifiez la raison du Pending :
   ```bash
   kubectl describe pod <nom-du-pod>
   ```
   Recherchez le message `FailedScheduling` dans les événements.
2. Vérifiez les ressources disponibles sur les nœuds :
   ```bash
   kubectl top nodes
   ```
3. Si les nœuds sont saturés alors que le groupe a atteint son maximum, augmentez le **Nombre maximum de nœuds** (**Modifier** > **Groupes de nœuds**), ou ajoutez un groupe avec un type d'instance plus grand.
4. Si le pod est bloqué sur un PVC, vérifiez que le PVC est bien provisionné :
   ```bash
   kubectl get pvc
   ```

---

### Ingress retourne 404 ou ne répond pas

**Cause** : la ressource Ingress est mal configurée, l'addon Ingress NGINX n'est pas activé, ou aucun groupe de nœuds n'héberge le contrôleur.

**Solution** :

1. Vérifiez sur la page de détail du cluster que **Ingress NGINX** figure dans la section **Extensions**. Sinon, activez-le via **Modifier** > **Extensions & Addons**.
2. Vérifiez qu'au moins un groupe de nœuds est **Exposé sur internet (IP Publique)** et que le contrôleur a une IP externe :
   ```bash
   kubectl get svc -A | grep ingress-nginx-controller
   ```
3. Vérifiez que l'`ingressClassName` est bien spécifié dans votre Ingress :
   ```yaml title="ingress.yaml"
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: my-app
   spec:
     ingressClassName: nginx
     rules:
       - host: app.example.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: my-app-svc
                   port:
                     number: 80
   ```
4. Vérifiez que le backend (Service et pods) fonctionne :
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```
5. Vérifiez que votre enregistrement DNS pointe vers l'IP externe du contrôleur, et la configuration du host et du path dans la règle Ingress.

---

### PVC en état Pending

**Cause** : la classe de stockage demandée n'existe pas dans le cluster ou la capacité de stockage est insuffisante.

**Solution** :

1. Listez les classes de stockage disponibles dans le cluster :
   ```bash
   kubectl get storageclass
   ```
2. Assurez-vous que le nom utilisé dans votre PVC correspond à une classe existante, par exemple `replicated` :
   ```yaml title="pvc.yaml"
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: my-data
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: replicated
     resources:
       requests:
         storage: 10Gi
   ```
3. Vérifiez les événements liés au PVC :
   ```bash
   kubectl describe pvc my-data
   ```
4. Si la capacité est insuffisante, réduisez la taille demandée ou contactez le support Hikube.

---

### L'enregistrement des modifications échoue

**Cause** : la console affiche une erreur après **Enregistrer**, par exemple « Conflit lors de la mise à jour (ex: ressource en cours d'utilisation). » ou un message de validation.

**Solution** :

1. Lisez le message : il indique le champ à corriger (par exemple, GPU ajoutés à un groupe existant, maximum inférieur au minimum, YAML de surcharge invalide, version inférieure à la version actuelle).
   Un retour à une version inférieure de Kubernetes est refusé (`version downgrades are not supported`, code `70206`) : choisissez la version actuelle ou une version supérieure.
2. En cas de conflit, attendez la fin de l'opération en cours sur le cluster, rechargez la page de modification et réessayez.
3. Pour ajouter des GPU, créez un nouveau groupe de nœuds plutôt que de modifier un groupe existant sans GPU.
