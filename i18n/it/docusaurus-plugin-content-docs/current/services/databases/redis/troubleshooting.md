---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Redis

### Perte de données après redémarrage

**Causa** : la `storageClass` utilisée est `local`, ce qui signifie que les données sont stockées uniquement sur le nœud physique où s'exécutait le pod. Si le pod est replanifié sur un autre nœud, les données précédentes sont perdues.

**Soluzione** :

1. Vérifiez la `storageClass` utilisée :
   ```bash
   kubectl get pvc -l app=redis-<name>
   ```
2. Si vous utilisez un seul réplica (`replicas` = 1), passez à `storageClass: replicated` pour que le stockage compense l'absence de réplication applicative. Si vous avez plusieurs réplicas (`replicas` >= 3), `storageClass: local` est approprié car Redis Sentinel assure déjà la haute disponibilité :
   ```yaml title="redis.yaml"
   spec:
     storageClass: replicated    # Si replicas = 1
     # storageClass: local       # Si replicas >= 3 (Sentinel assure la HA)
   ```
3. Appliquez la modification. Notez qu'un changement de `storageClass` nécessite généralement une recréation des PVC.
4. Assurez-vous également que `replicas` >= 3 pour bénéficier de la réplication Redis Sentinel.

### Redis Sentinel ne converge pas

**Causa** : le nombre de réplicas est pair ou inférieur à 3, ce qui empêche le quorum Sentinel de fonctionner correctement. Sentinel nécessite une majorité pour élire un nouveau primary.

**Soluzione** :

1. Vérifiez le nombre de réplicas :
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Assurez-vous d'utiliser un nombre **impair** >= 3 :
   ```yaml title="redis.yaml"
   spec:
     replicas: 3    # Ou 5, jamais 2 ou 4
   ```
3. Consultez les logs Sentinel pour identifier les problèmes de convergence :
   ```bash
   kubectl logs -l app=rfs-redis-<name>
   ```
4. Vérifiez la connectivité réseau entre les pods Redis. Des problèmes de DNS ou de réseau peuvent empêcher la découverte des nœuds.

### Mémoire saturée (OOMKilled)

**Causa** : le dataset Redis dépasse la mémoire allouée au conteneur. Kubernetes tue le pod lorsqu'il dépasse sa limite mémoire.

**Soluzione** :

1. Vérifiez si le pod a été tué pour OOM :
   ```bash
   kubectl describe pod rfr-redis-<name>-0 | grep -i oom
   ```
2. Augmentez la mémoire allouée via `resources.memory` ou un `resourcesPreset` supérieur :
   ```yaml title="redis.yaml"
   spec:
     resources:
       cpu: 1000m
       memory: 2Gi    # Augmenter la mémoire
   ```
3. Vérifiez la politique d'éviction Redis (`maxmemory-policy`). Par défaut, Redis renvoie une erreur quand la mémoire est pleine. Envisagez d'utiliser `allkeys-lru` si Redis sert de cache.
4. Surveillez la taille du dataset :
   ```bash
   redis-cli -h rfr-redis-<name> -p 6379 -a <password> INFO memory
   ```

### Connexion timeout

**Causa** : les pods Redis ne sont pas en cours d'exécution, les endpoints du service sont vides, ou la configuration d'authentification côté client ne correspond pas à celle du serveur.

**Soluzione** :

1. Vérifiez que les pods sont en état `Running` :
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Vérifiez que les services ont des endpoints :
   ```bash
   kubectl get endpoints rfr-redis-<name>
   kubectl get endpoints rfs-redis-<name>
   ```
3. Si `authEnabled: true`, assurez-vous que votre client fournit le mot de passe correct.
4. Testez la connexion depuis un pod de debug :
   ```bash
   kubectl run test-redis --rm -it --image=redis:7 -- redis-cli -h rfr-redis-<name> -p 6379 -a <password> PING
   ```

### Authentification échoue

**Causa** : le mot de passe utilisé ne correspond pas à celui stocké dans le Secret Kubernetes, ou `authEnabled` n'est pas activé sur le serveur alors que le client envoie un mot de passe (ou inversement).

**Soluzione** :

1. Récupérez le mot de passe correct depuis le Secret :
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
2. Vérifiez que `authEnabled: true` est configuré dans votre manifeste :
   ```yaml title="redis.yaml"
   spec:
     authEnabled: true
   ```
3. Assurez-vous que votre client utilise exactement le mot de passe récupéré à l'étape 1.
4. Si vous avez changé la configuration `authEnabled`, les clients existants doivent être mis à jour pour refléter le changement.
