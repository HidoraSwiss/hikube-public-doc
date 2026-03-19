---
sidebar_position: 7
title: Depannage
---

# Depannage — Redis

### Perte de donnees apres redemarrage

**Cause** : la `storageClass` utilisee est `local`, ce qui signifie que les donnees sont stockees uniquement sur le noeud physique ou s'executait le pod. Si le pod est replanifie sur un autre noeud, les donnees precedentes sont perdues.

**Solution** :

1. Verifiez la `storageClass` utilisee :
   ```bash
   kubectl get pvc -l app=redis-<name>
   ```
2. Pour garantir la durabilite des donnees, utilisez `storageClass: replicated` :
   ```yaml title="redis.yaml"
   spec:
     storageClass: replicated
   ```
3. Appliquez la modification. Notez qu'un changement de `storageClass` necessite generalement une recreation des PVC.
4. Assurez-vous egalement que `replicas` >= 3 pour beneficier de la replication Redis Sentinel.

### Redis Sentinel ne converge pas

**Cause** : le nombre de replicas est pair ou inferieur a 3, ce qui empeche le quorum Sentinel de fonctionner correctement. Sentinel necessite une majorite pour elire un nouveau primary.

**Solution** :

1. Verifiez le nombre de replicas :
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Assurez-vous d'utiliser un nombre **impair** >= 3 :
   ```yaml title="redis.yaml"
   spec:
     replicas: 3    # Ou 5, jamais 2 ou 4
   ```
3. Consultez les logs Sentinel pour identifier les problemes de convergence :
   ```bash
   kubectl logs -l app=rfs-redis-<name>
   ```
4. Verifiez la connectivite reseau entre les pods Redis. Des problemes de DNS ou de reseau peuvent empecher la decouverte des noeuds.

### Memoire saturee (OOMKilled)

**Cause** : le dataset Redis depasse la memoire allouee au conteneur. Kubernetes tue le pod lorsqu'il depasse sa limite memoire.

**Solution** :

1. Verifiez si le pod a ete tue pour OOM :
   ```bash
   kubectl describe pod rfr-redis-<name>-0 | grep -i oom
   ```
2. Augmentez la memoire allouee via `resources.memory` ou un `resourcesPreset` superieur :
   ```yaml title="redis.yaml"
   spec:
     resources:
       cpu: 1000m
       memory: 2Gi    # Augmenter la memoire
   ```
3. Verifiez la politique d'eviction Redis (`maxmemory-policy`). Par defaut, Redis renvoie une erreur quand la memoire est pleine. Envisagez d'utiliser `allkeys-lru` si Redis sert de cache.
4. Surveillez la taille du dataset :
   ```bash
   redis-cli -h rfr-redis-<name> -p 6379 -a <password> INFO memory
   ```

### Connexion timeout

**Cause** : les pods Redis ne sont pas en cours d'execution, les endpoints du service sont vides, ou la configuration d'authentification cote client ne correspond pas a celle du serveur.

**Solution** :

1. Verifiez que les pods sont en etat `Running` :
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Verifiez que les services ont des endpoints :
   ```bash
   kubectl get endpoints rfr-redis-<name>
   kubectl get endpoints rfs-redis-<name>
   ```
3. Si `authEnabled: true`, assurez-vous que votre client fournit le mot de passe correct.
4. Testez la connexion depuis un pod de debug :
   ```bash
   kubectl run test-redis --rm -it --image=redis:7 -- redis-cli -h rfr-redis-<name> -p 6379 -a <password> PING
   ```

### Authentification echoue

**Cause** : le mot de passe utilise ne correspond pas a celui stocke dans le Secret Kubernetes, ou `authEnabled` n'est pas active sur le serveur alors que le client envoie un mot de passe (ou inversement).

**Solution** :

1. Recuperez le mot de passe correct depuis le Secret :
   ```bash
   kubectl get secret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
2. Verifiez que `authEnabled: true` est configure dans votre manifeste :
   ```yaml title="redis.yaml"
   spec:
     authEnabled: true
   ```
3. Assurez-vous que votre client utilise exactement le mot de passe recupere a l'etape 1.
4. Si vous avez change la configuration `authEnabled`, les clients existants doivent etre mis a jour pour refleter le changement.
