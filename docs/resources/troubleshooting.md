---
sidebar_position: 1
title: Dépannage global
---

# Dépannage global Hikube

Ce guide couvre les problèmes les plus courants rencontrés sur Hikube et leurs solutions.

---

## 1. Diagnostic général

Avant de chercher une solution spécifique, commencez par ces commandes de diagnostic :

```bash
# État des ressources dans votre namespace
kubectl get all

# Events récents (triés par date)
kubectl get events --sort-by=.metadata.creationTimestamp

# Description détaillée d'une ressource
kubectl describe <type> <nom>

# Logs d'un pod
kubectl logs <nom-du-pod>

# Logs du conteneur précédent (en cas de crash)
kubectl logs <nom-du-pod> --previous
```

---

## 2. Pods en erreur

### CrashLoopBackOff

**Symptôme :** Le pod redémarre en boucle, l'état affiche `CrashLoopBackOff`.

**Diagnostic :**

```bash
kubectl describe pod <nom-du-pod>
kubectl logs <nom-du-pod> --previous
```

**Solutions :**
- **Mémoire insuffisante** : augmentez `resources.memory` ou utilisez un `resourcesPreset` plus élevé
- **Erreur de configuration** : vérifiez les variables d'environnement et les fichiers de configuration dans les logs
- **Dépendance manquante** : vérifiez que les services requis (base de données, secrets) sont disponibles

---

### Pending

**Symptôme :** Le pod reste en état `Pending` sans démarrer.

**Diagnostic :**

```bash
kubectl describe pod <nom-du-pod>
# Cherchez la section "Events" en bas de la sortie
```

**Solutions :**
- **Ressources insuffisantes** : le cluster n'a pas assez de CPU/mémoire. Vérifiez les nœuds disponibles avec `kubectl get nodes` et `kubectl top nodes`
- **PVC non lié** : le volume persistant demandé n'est pas disponible (voir section Stockage)
- **NodeSelector/Affinity** : le pod a des contraintes de placement qui ne correspondent à aucun nœud

---

### ImagePullBackOff

**Symptôme :** Le pod ne démarre pas, l'état affiche `ImagePullBackOff` ou `ErrImagePull`.

**Diagnostic :**

```bash
kubectl describe pod <nom-du-pod>
# Cherchez "Failed to pull image" dans les events
```

**Solutions :**
- **Image introuvable** : vérifiez le nom et le tag de l'image dans votre manifeste
- **Registry privé** : assurez-vous qu'un `imagePullSecret` est configuré
- **Problème réseau** : vérifiez la connectivité vers le registry

---

### OOMKilled

**Symptôme :** Le pod est tué avec le code de sortie `137` et la raison `OOMKilled`.

**Diagnostic :**

```bash
kubectl describe pod <nom-du-pod>
# Cherchez "Last State: Terminated - Reason: OOMKilled"
```

**Solutions :**
- Augmentez la limite mémoire dans `resources.memory` ou passez à un `resourcesPreset` supérieur
- Vérifiez si l'application a une fuite mémoire en observant la consommation avec `kubectl top pod`

---

## 3. Accès cluster

### Kubeconfig invalide

**Symptôme :** `error: You must be logged in to the server (Unauthorized)`

**Diagnostic :**

```bash
# Vérifier le fichier kubeconfig utilisé
echo $KUBECONFIG
kubectl config current-context
```

**Solutions :**
- Régénérez le kubeconfig depuis votre cluster Hikube :
  ```bash
  kubectl get secret <nom-cluster>-admin-kubeconfig \
    -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
    > my-cluster-kubeconfig.yaml
  export KUBECONFIG=my-cluster-kubeconfig.yaml
  ```
- Vérifiez que la variable `KUBECONFIG` pointe vers le bon fichier

---

### Certificat expiré

**Symptôme :** `Unable to connect to the server: x509: certificate has expired`

**Diagnostic :**

```bash
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d | openssl x509 -text -noout | grep -A2 Validity
```

**Solution :** Récupérez un nouveau kubeconfig à jour depuis le Secret du cluster (voir ci-dessus).

---

### Connexion refusée

**Symptôme :** `The connection to the server was refused`

**Diagnostic :**

```bash
# Tester la connectivité
kubectl cluster-info
```

**Solutions :**
- Vérifiez que le cluster est en état `Ready` : `kubectl get kubernetes <nom-cluster>`
- Vérifiez que le control plane est accessible depuis votre réseau
- Si vous utilisez un VPN, assurez-vous qu'il est actif

---

## 4. Stockage

### PVC en état Pending

**Symptôme :** Le PVC reste en `Pending` et les pods dépendants ne démarrent pas.

**Diagnostic :**

```bash
kubectl get pvc
kubectl describe pvc <nom-du-pvc>
```

**Solutions :**
- **StorageClass invalide** : vérifiez que la `storageClass` spécifiée existe avec `kubectl get storageclass`
- **Capacité insuffisante** : réduisez la taille demandée ou contactez le support pour augmenter les quotas
- **StorageClass vide** : si `storageClass: ""`, la classe par défaut est utilisée. Essayez `storageClass: replicated` explicitement

---

### Espace disque insuffisant

**Symptôme :** Les pods crashent avec des erreurs de type `No space left on device`.

**Diagnostic :**

```bash
# Vérifier l'utilisation des PVC
kubectl exec -it <nom-du-pod> -- df -h
```

**Solutions :**
- Augmentez la valeur de `size` dans le manifeste et réappliquez
- Supprimez les données inutiles (logs, fichiers temporaires)

---

## 5. Réseau

### Service non accessible

**Symptôme :** Impossible de se connecter au service depuis l'extérieur ou entre pods.

**Diagnostic :**

```bash
# Vérifier que le service existe et a un endpoint
kubectl get svc
kubectl get endpoints <nom-du-service>

# Tester la connectivité depuis un pod
kubectl run test-net --image=busybox --rm -it -- wget -qO- http://<nom-du-service>:<port>
```

**Solutions :**
- **Pas d'endpoint** : les labels du `selector` du service ne correspondent à aucun pod
- **External non activé** : ajoutez `external: true` dans le manifeste pour créer un LoadBalancer
- **Port incorrect** : vérifiez que le port du service correspond au port exposé par l'application

---

### DNS non résolu

**Symptôme :** `Could not resolve host` lors de l'accès à un service par son nom.

**Diagnostic :**

```bash
# Vérifier le DNS du cluster
kubectl run test-dns --image=busybox --rm -it -- nslookup <nom-du-service>

# Vérifier les pods CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Solutions :**
- Utilisez le nom DNS complet : `<service>.<namespace>.svc.cluster.local`
- Vérifiez que les pods CoreDNS sont en état `Running`

---

### Ingress retourne 404 ou 502

**Symptôme :** L'URL de l'Ingress retourne une erreur 404 (Not Found) ou 502 (Bad Gateway).

**Diagnostic :**

```bash
kubectl describe ingress <nom-de-lingress>
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

**Solutions :**
- **404** : vérifiez que le `path` et le `host` de l'Ingress correspondent à votre configuration
- **502** : le service backend ne répond pas. Vérifiez que les pods du backend sont en état `Running` et que le port est correct
- **IngressClass manquant** : ajoutez `ingressClassName: nginx` dans la spec de l'Ingress

---

## 6. Bases de données

### Connexion refusée

**Symptôme :** `Connection refused` lors de la tentative de connexion à la base de données.

**Diagnostic :**

```bash
# Vérifier l'état des pods de la base
kubectl get pods | grep <nom-de-la-base>

# Vérifier les services
kubectl get svc | grep <nom-de-la-base>
```

**Solutions :**
- Vérifiez que les pods de la base sont en état `Running`
- Vérifiez les identifiants : `kubectl get secret <nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'`
- Si `external: false`, utilisez `kubectl port-forward` pour vous connecter localement

---

### Réplication en retard

**Symptôme :** Les réplicas ont un lag de réplication important par rapport au master.

**Diagnostic :**

```bash
# Redis - Vérifier la réplication
kubectl exec -it rfr-redis-<nom>-0 -- redis-cli -a "$REDIS_PASSWORD" INFO replication

# PostgreSQL - Vérifier le lag
kubectl exec -it <nom>-1 -- psql -c "SELECT * FROM pg_stat_replication;"
```

**Solutions :**
- Augmentez les ressources (CPU/mémoire) des réplicas
- Vérifiez la charge réseau entre les datacenters
- Réduisez la charge en écriture si le lag persiste

---

### Failover non déclenché

**Symptôme :** Le master est en panne mais aucun réplica n'est promu.

**Diagnostic :**

```bash
# Redis - Vérifier Sentinel
kubectl exec -it rfs-redis-<nom>-<id> -- redis-cli -p 26379 SENTINEL masters

# Vérifier les events
kubectl get events --sort-by=.metadata.creationTimestamp | grep <nom-de-la-base>
```

**Solutions :**
- Vérifiez que `replicas > 1` dans le manifeste (le failover nécessite au moins un réplica)
- Vérifiez que les pods Sentinel (Redis) ou l'opérateur sont en état `Running`
- Consultez les logs de l'opérateur pour des erreurs

---

## 7. Messaging (NATS, RabbitMQ)

### Producteur/consommateur déconnecté

**Symptôme :** Les clients perdent la connexion au broker de messages.

**Diagnostic :**

```bash
# Vérifier l'état des pods du broker
kubectl get pods | grep <nats|rabbitmq>

# Vérifier les logs
kubectl logs <nom-du-pod-broker>
```

**Solutions :**
- Vérifiez que les pods du broker sont en état `Running`
- Implémentez une logique de reconnexion automatique côté client
- Vérifiez les limites de connexion configurées

---

### Messages perdus

**Symptôme :** Des messages envoyés ne sont jamais reçus par les consommateurs.

**Diagnostic :**

```bash
# RabbitMQ - Vérifier les queues
kubectl exec -it <pod-rabbitmq> -- rabbitmqctl list_queues name messages consumers

# NATS - Vérifier les streams JetStream
kubectl exec -it <pod-nats> -- nats stream ls
```

**Solutions :**
- **RabbitMQ** : utilisez les Quorum Queues pour garantir la durabilité des messages
- **NATS** : activez JetStream pour la persistance des messages
- Vérifiez que les consommateurs sont connectés et actifs
- Assurez-vous que les queues/subjects existent avant d'envoyer des messages
