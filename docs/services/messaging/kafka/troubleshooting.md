---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Kafka

:::info Disponibilité
Kafka n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Les diagnostics ci-dessous se font depuis vos outils clients Kafka. Lorsqu'une action est nécessaire côté plateforme (ressources, stockage, redémarrage, journaux serveur), [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom de l'instance.

### Connexion impossible au cluster

**Cause** : adresse ou port des serveurs bootstrap incorrect, accès externe non activé alors que le client se trouve hors de la plateforme, ou paramètres de sécurité client manquants.

**Solution** :

1. Vérifiez que vous utilisez l'adresse communiquée par le support.
2. Interrogez les métadonnées du cluster :
   ```bash
   kcat -b <bootstrap-servers> -L
   ```
3. Si la commande échoue depuis l'extérieur de la plateforme, vérifiez avec le support que l'accès externe est activé sur l'instance.

### ZooKeeper perd le quorum

**Cause** : le nombre d'instances ZooKeeper est insuffisant ou pair, ou un volume ZooKeeper est plein. Un quorum nécessite une majorité stricte (ex. 2 nœuds sur 3).

**Solution** : ce diagnostic et sa correction (nombre d'instances impair, augmentation du stockage ZooKeeper) se font côté plateforme. Contactez le support.

### Topic inaccessible ou broker indisponible

**Cause** : un ou plusieurs brokers ne fonctionnent pas correctement, ou le topic n'a pas suffisamment de réplicas synchronisés par rapport à `min.insync.replicas`.

**Solution** :

1. Décrivez le topic depuis votre client pour vérifier les leaders et les ISR (In-Sync Replicas) :
   ```bash
   kafka-topics.sh --describe --topic <nom-topic> --bootstrap-server <bootstrap-servers>
   ```
2. Vérifiez que le nombre de réplicas du topic est cohérent avec le nombre de brokers.
3. Si des partitions n'ont pas de leader ou si des brokers manquent, contactez le support (état des brokers, espace disque).

### Consumer lag important

**Cause** : les consumers ne traitent pas les messages assez rapidement par rapport au débit de production. Cela peut être dû à un nombre insuffisant de partitions, trop peu de consumers dans le groupe, ou des consumers sous-dimensionnés.

**Solution** :

1. Mesurez le lag du consumer group :
   ```bash
   kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server <bootstrap-servers>
   ```
2. Si le lag est réparti sur de nombreuses partitions, **augmentez le nombre de consumers** dans le groupe (sans dépasser le nombre de partitions).
3. Si toutes les partitions ont du lag, envisagez d'**augmenter le nombre de partitions** du topic. Cette option n'est pas proposée dans la console ; contactez le support.
4. Vérifiez que vos consumers disposent de ressources suffisantes (CPU, mémoire) pour traiter les messages.

### Broker redémarré par manque de mémoire

**Cause** : le broker consomme plus de mémoire que la limite allouée. Cela se produit fréquemment avec les presets `nano` ou `micro` sous charge.

**Solution** : demandez un preset supérieur ou des ressources explicites pour les brokers. Cette option n'est pas proposée dans la console ; contactez le support.

### Messages dupliqués

**Cause** : par défaut, Kafka fonctionne en mode **at-least-once delivery**. En cas de retry du producteur ou de rebalancing des consumers, des messages peuvent être délivrés plusieurs fois.

**Solution** :

1. **Côté producteur** : activez l'idempotence pour éviter les doublons lors des retries :
   ```properties title="producer.properties"
   enable.idempotence=true
   acks=all
   ```
2. **Côté consumer** : implémentez un mécanisme de **déduplication** basé sur un identifiant unique du message (clé, UUID, etc.).
3. Pour les cas critiques, combinez `acks=all`, `enable.idempotence=true` sur le producteur et un traitement idempotent côté consumer.

:::tip
L'idempotence du producteur garantit qu'un message envoyé plusieurs fois (à cause de retries réseau) n'est écrit qu'une seule fois dans la partition. Le traitement idempotent côté consumer reste nécessaire pour couvrir les scénarios de rebalancing.
:::
