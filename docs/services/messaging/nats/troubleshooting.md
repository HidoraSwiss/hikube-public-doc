---
sidebar_position: 7
title: Dépannage
---

# Dépannage — NATS

:::info Disponibilité
NATS n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Les diagnostics ci-dessous se font depuis le CLI `nats` (voir le [démarrage rapide](./quick-start.md) pour enregistrer un contexte de connexion). Lorsqu'une action est nécessaire côté plateforme (ressources, stockage, redémarrage, journaux serveur), [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom de l'instance.

### Messages perdus (pas de JetStream)

**Cause** : JetStream n'est pas activé ou aucun stream n'est configuré pour capturer les messages. Sans JetStream, NATS fonctionne en mode fire-and-forget : les messages ne sont délivrés qu'aux abonnés connectés au moment de la publication.

**Solution** :

1. Vérifiez que JetStream est disponible pour votre compte :
   ```bash
   nats account info
   ```
   Si JetStream n'est pas activé sur l'instance, contactez le support.
2. Créez un stream pour capturer les messages des subjects souhaités :
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
3. Vérifiez que le stream est bien créé et capture les messages :
   ```bash
   nats stream info orders-stream
   ```

### Consumer ne reçoit pas les messages

**Cause** : le consumer est abonné à un subject qui ne correspond pas à celui utilisé par le producteur. Les erreurs courantes incluent une faute de frappe dans le nom du subject, un mauvais usage des wildcards, ou une configuration de queue group incorrecte.

**Solution** :

1. Vérifiez le subject exact utilisé par le producteur et le consumer — les subjects sont **sensibles à la casse**.
2. Testez la réception avec un abonnement de diagnostic :
   ```bash
   nats sub ">"
   ```
   Cela permet de voir **tous les messages** que votre utilisateur est autorisé à recevoir.
3. Vérifiez les wildcards utilisés : `orders.*` ne matche **pas** `orders.new.urgent` (utilisez `orders.>` pour les sous-niveaux).
4. Si vous utilisez des queue groups, vérifiez que le consumer est bien membre du groupe attendu et que le nom du groupe est identique.

### Stockage JetStream plein

**Cause** : le volume JetStream a atteint sa capacité maximale. Les nouveaux messages ne peuvent plus être persistés et les publications échouent.

**Solution** :

1. Vérifiez l'utilisation du stockage JetStream :
   ```bash
   nats account info
   ```
2. Identifiez les streams les plus volumineux :
   ```bash
   nats stream list
   ```
3. Purgez les anciens messages des streams qui le permettent :
   ```bash
   nats stream purge <nom-stream>
   ```
4. Ajustez la politique de rétention des streams — utilisez `limits` avec `max-age` pour supprimer automatiquement les anciens messages :
   ```bash
   nats stream edit <nom-stream> --max-age 72h
   ```
5. Si nécessaire, demandez l'augmentation du volume JetStream. Cette option n'est pas proposée dans la console ; contactez le support.

### Mémoire insuffisante

**Cause** : le serveur NATS consomme plus de mémoire que la limite allouée, souvent à cause d'un nombre élevé de connexions, de messages volumineux (`max_payload` élevé), ou de streams JetStream en mémoire.

**Solution** :

1. Privilégiez le stockage `file` plutôt que `memory` pour les streams volumineux.
2. Réduisez la taille des messages publiés si des messages très volumineux ne sont pas nécessaires.
3. Si le problème persiste, demandez un preset supérieur ou un ajustement de `max_payload`. Cette option n'est pas proposée dans la console ; contactez le support.

### Connexion refusée

**Cause** : URL ou port incorrect, identifiants erronés, ou tentative de connexion depuis l'extérieur de la plateforme sans accès externe activé.

**Solution** :

1. Vérifiez que vous utilisez l'URL et les identifiants communiqués par le support.
2. Testez la connexion :
   ```bash
   nats server check connection --server <nats-url> --user <utilisateur> --password <mot-de-passe>
   ```
3. Une erreur `Authorization Violation` indique des identifiants incorrects ; demandez au support de vérifier ou de renouveler le mot de passe.
4. Si vous vous connectez depuis l'extérieur de la plateforme, vérifiez avec le support que l'accès externe est activé sur l'instance.
