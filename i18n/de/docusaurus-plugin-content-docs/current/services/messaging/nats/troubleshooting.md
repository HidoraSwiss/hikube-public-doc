---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — NATS

### Messages perdus (pas de JetStream)

**Ursache**: JetStream n'est pas aktiviert ou aucun stream n'est configuré pour capturer les messages. Sans JetStream, NATS fonctionne en mode fire-and-forget : les messages ne sont délivrés qu'aux abonnés connectés au moment de la publication.

**Lösung**:

1. Überprüfen Sie, ob JetStream est aktiviert dans votre manifeste :
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 10Gi
   ```
2. Réappliquez le manifeste si nécessaire :
   ```bash
   kubectl apply -f nats.yaml
   ```
3. Créez un stream pour capturer les messages des subjects souhaités :
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
4. Überprüfen Sie, ob le stream est bien créé et capture les messages :
   ```bash
   nats stream info orders-stream
   ```

### Consumer ne reçoit pas les messages

**Ursache**: le consumer est abonné à un subject qui ne correspond pas à celui utilisé par le producteur. Les erreurs courantes incluent une faute de frappe dans le nom du subject, un mauvais usage des wildcards, ou une configuration de queue group incorrecte.

**Lösung**:

1. Vérifiez le subject exact utilisé par le producteur et le consumer — les subjects sont **sensibles à la casse**
2. Testez la réception avec un abonnement de diagnostic :
   ```bash
   nats sub ">"
   ```
   Cela permet de voir **tous les messages** publiés sur le serveur
3. Vérifiez les wildcards utilisés :
   - `orders.*` ne matche **pas** `orders.new.urgent` (utilisez `orders.>` pour les sous-niveaux)
4. Si vous utilisez des queue groups, vérifiez que le consumer est bien membre du groupe attendu et que le group name est identique

### Stockage JetStream plein

**Ursache**: le volume JetStream a atteint sa capacité maximale (`jetstream.size`). Les nouveaux messages ne peuvent plus être persistés et les publications échouent.

**Lösung**:

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
4. Vérifiez la politique de rétention des streams — utilisez `limits` avec `max-age` pour supprimer automatiquement les anciens messages :
   ```bash
   nats stream edit <nom-stream> --max-age 72h
   ```
5. Si nécessaire, augmentez `jetstream.size` dans votre manifeste :
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 50Gi
   ```

### Mémoire insuffisante

**Ursache**: le serveur NATS consomme plus de mémoire que la limite allouée, souvent à cause d'un nombre élevé de connexions, de messages volumineux (`max_payload` trop élevé), ou de streams JetStream en mémoire.

**Lösung**:

1. Vérifiez les événements du pod pour confirmer un OOMKill :
   ```bash
   kubectl describe pod <pod-nats> | grep -A 5 "Last State"
   ```
2. Augmentez les ressources allouées à NATS :
   ```yaml title="nats.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   ```
3. Vérifiez la valeur de `max_payload` dans `config.merge` — réduisez-la si des messages très volumineux ne sont pas nécessaires
4. Réappliquez le manifeste :
   ```bash
   kubectl apply -f nats.yaml
   ```

### Connexion refusée

**Ursache**: le client ne parvient pas à se connecter au serveur NATS. Cela peut être dû à des pods non démarrés, des identifiants incorrects, ou une tentative de connexion externe sans `external: true`.

**Lösung**:

1. Überprüfen Sie, ob les pods NATS sont en état `Running` :
   ```bash
   kubectl get pods -l app.kubernetes.io/component=nats
   ```
2. Consultez les logs du pod pour identifier les erreurs :
   ```bash
   kubectl logs <pod-nats>
   ```
3. Vérifiez les identifiants utilisateur dans le Secret Kubernetes :
   ```bash
   kubectl get tenantsecret <nom-nats>-credentials -o jsonpath='{.data}' | base64 -d
   ```
4. Si vous vous connectez depuis l'extérieur du cluster, assurez-vous que `external: true` est configuré :
   ```yaml title="nats.yaml"
   external: true
   ```
5. Testez la connectivité depuis un pod dans le cluster :
   ```bash
   kubectl exec <pod-nats> -- nats-server --help 2>&1 | head -1
   ```
