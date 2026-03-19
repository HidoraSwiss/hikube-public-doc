---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Kubernetes

### Nœuds en état NotReady

**Cause** : un ou plusieurs nœuds ne répondent plus au plan de contrôle. Cela peut être lié à des ressources insuffisantes, un problème de stockage ou une défaillance du kubelet.

**Solution** :

1. Vérifiez l'état des nœuds et leurs conditions :
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Consultez les événements pour identifier la cause (DiskPressure, MemoryPressure, PIDPressure) :
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```
3. Vérifiez que l'`instanceType` choisi fournit suffisamment de ressources pour les workloads déployés.
4. Si le problème persiste, augmentez le `maxReplicas` du nodeGroup pour permettre au cluster de provisionner de nouveaux nœuds sains.

---

### Pods en Pending (ressources insuffisantes)

**Cause** : aucun nœud ne dispose de suffisamment de CPU ou de mémoire pour planifier le pod. Le scheduler Kubernetes ne peut pas trouver de placement.

**Solution** :

1. Identifiez la raison du Pending :
   ```bash
   kubectl describe pod <pod-name>
   ```
   Recherchez le message `FailedScheduling` dans les événements.

2. Vérifiez les ressources disponibles sur les nœuds :
   ```bash
   kubectl top nodes
   ```

3. Si les nœuds sont saturés, augmentez le `maxReplicas` de votre nodeGroup :
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       workers:
         minReplicas: 2
         maxReplicas: 10
   ```

4. Si le pod est bloqué sur un PVC, vérifiez que le PVC est bien provisionné :
   ```bash
   kubectl get pvc
   ```

---

### Kubeconfig expiré ou invalide

**Cause** : le certificat client dans le kubeconfig a expiré (erreur `x509: certificate has expired`) ou les credentials sont invalides (erreur `Unauthorized`).

**Solution** :

1. Regénérez le kubeconfig depuis le Secret source :
   ```bash
   kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
   ```

2. Remplacez votre ancien fichier kubeconfig :
   ```bash
   export KUBECONFIG=kubeconfig.yaml
   ```

3. Vérifiez la connectivité :
   ```bash
   kubectl cluster-info
   ```

---

### Ingress retourne 404

**Cause** : la ressource Ingress est mal configurée ou l'addon ingressNginx n'est pas activé sur le cluster.

**Solution** :

1. Vérifiez que l'addon `ingressNginx` est activé dans la configuration du cluster :
   ```yaml title="cluster.yaml"
   spec:
     addons:
       ingressNginx:
         enabled: true
   ```

2. Vérifiez que l'`ingressClassName` est bien spécifié dans votre Ingress :
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

3. Vérifiez que le backend (Service + Pod) fonctionne :
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```

4. Vérifiez la configuration du host et du path dans la règle Ingress.

---

### PVC en état Pending

**Cause** : la `storageClass` demandée n'existe pas ou la capacité de stockage est insuffisante.

**Solution** :

1. Les storageClasses disponibles sur Hikube sont : `local`, `replicated` et `replicated-async`.

2. Assurez-vous que le nom utilisé dans votre PVC correspond à une storageClass existante :
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
