---
sidebar_position: 7
title: Dépannage
---

# Dépannage — RabbitMQ

### Queue bloquée (flow control)

**Cause** : RabbitMQ a déclenché une **alarme mémoire** ou **alarme disque**, bloquant les publications pour protéger le système. Cela se produit lorsque la consommation mémoire dépasse le seuil (high watermark) ou que l'espace disque est insuffisant.

**Solution** :

1. Vérifiez l'état du cluster et les alarmes actives :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -A 10 "alarms"
   ```
2. Identifiez la ressource en cause (mémoire ou disque) :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -E "mem_|disk_"
   ```
3. Augmentez les ressources allouées dans votre manifeste :
   ```yaml title="rabbitmq.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   size: 20Gi
   ```
4. Purgez les queues inutilisées si nécessaire :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl purge_queue <nom-queue>
   ```

### Nœud RabbitMQ non rejoint au cluster

**Cause** : un nœud RabbitMQ n'arrive pas à rejoindre le cluster, souvent à cause d'un problème de résolution DNS, d'incohérence du cookie Erlang, ou de politiques réseau restrictives.

**Solution** :

1. Vérifiez l'état du cluster depuis un nœud fonctionnel :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl cluster_status
   ```
2. Consultez les logs du pod en erreur :
   ```bash
   kubectl logs <pod-rabbitmq-problematique>
   ```
3. Vérifiez que la résolution DNS fonctionne entre les pods :
   ```bash
   kubectl exec <pod-rabbitmq> -- nslookup <pod-rabbitmq-problematique>.<service-headless>
   ```
4. Si le problème persiste, supprimez le pod en erreur pour forcer sa recréation :
   ```bash
   kubectl delete pod <pod-rabbitmq-problematique>
   ```

### Messages non routés (exchange mal configuré)

**Cause** : les messages publiés ne parviennent pas aux queues, généralement à cause d'un mauvais type d'exchange, d'une routing key incorrecte, ou d'un binding manquant entre l'exchange et la queue.

**Solution** :

1. Listez les bindings existants pour identifier les routes configurées :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_bindings -p <vhost>
   ```
2. Vérifiez le type d'exchange et la routing key attendue :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_exchanges -p <vhost>
   ```
3. Configurez un **dead letter exchange** pour capturer les messages non routés et faciliter le diagnostic :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"dlx"}' -p <vhost>
   ```
4. Vérifiez que le producteur utilise le bon exchange et la bonne routing key dans sa configuration

### Mémoire saturée (memory alarm)

**Cause** : RabbitMQ a atteint le seuil de mémoire (**high watermark**, par défaut 40% de la mémoire disponible). Toutes les publications sont bloquées jusqu'à ce que la mémoire redescende sous le seuil.

**Solution** :

1. Vérifiez la consommation mémoire :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep "mem_used"
   ```
2. Identifiez les queues les plus volumineuses :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_queues name messages memory -p <vhost> --formatter table
   ```
3. Augmentez la mémoire allouée à RabbitMQ :
   ```yaml title="rabbitmq.yaml"
   resources:
     cpu: 1
     memory: 4Gi
   ```
4. Purgez les queues inutilisées ou les queues contenant un grand nombre de messages non consommés

### Connexion AMQP refusée

**Cause** : le client ne parvient pas à se connecter au broker RabbitMQ. Cela peut être dû à des identifiants incorrects, des permissions vhost manquantes, ou un problème d'accessibilité réseau.

**Solution** :

1. Vérifiez les identifiants de connexion dans le Secret Kubernetes :
   ```bash
   kubectl get tenantsecret <nom-rabbitmq>-credentials -o jsonpath='{.data}' | base64 -d
   ```
2. Vérifiez que l'utilisateur a les permissions nécessaires sur le vhost :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_permissions -p <vhost>
   ```
3. Testez la connectivité au port AMQP (5672) :
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmq-diagnostics check_port_connectivity
   ```
4. Si vous vous connectez depuis l'extérieur du cluster, assurez-vous que `external: true` est configuré dans votre manifeste
