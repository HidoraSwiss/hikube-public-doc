---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer NATS en 5 minutes

Ce guide vous accompagne dans le déploiement de votre premier **cluster NATS** sur Hikube en **quelques minutes** !

---

## Objectifs

À la fin de ce guide, vous aurez :

* Un **cluster NATS** déployé et opérationnel sur Hikube  
* Une configuration **haute disponibilité** avec plusieurs réplicas  
* Le **JetStream** activé pour le stockage persistant des messages  
* Un **utilisateur** configuré pour se connecter à votre cluster  

---

## Prérequis

Avant de commencer, assurez-vous d’avoir :

* **kubectl** configuré avec votre kubeconfig Hikube  
* Les **droits administrateur** sur votre tenant

---

## Étape 1 : Créer le manifeste NATS

### **Préparez le fichier `nats.yaml`**

Créez un fichier `nats.yaml` comme ci-dessous :

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats
  namespace: tenant-x
spec:
  external: false

  replicas: 2
  resourcesPreset: large
  storageClass: "replicated"

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
    resolver:
      type: full
      dir: /data/resolver
````

---

## Étape 2 : Déployer le cluster NATS

Appliquez simplement votre manifeste :

```bash
kubectl apply -f nats.yaml
```

Vérifiez ensuite le déploiement :

```bash
kubectl get nats
NAME    READY   AGE
nats    True    2m
```

Et les pods associés :

```bash
kubectl get pods | grep nats
nats-0   1/1   Running   0   2m
nats-1   1/1   Running   0   2m
```

---

## Étape 3 : Connexion au cluster NATS

### **Option 1 : Port-forward local**

```bash
kubectl port-forward svc/nats-nats 4222:4222
```

---

## Étape 4 : Utilisation de JetStream

Créez un stream et publiez vos premiers messages persistants :

```bash
# Créer un stream
nats stream add EVENTS --subjects "events.*" --storage file --replicas 2

# Publier un message
nats pub events.test "Hikube rocks!"

# Lire les messages
nats consumer add EVENTS my_consumer
nats consumer next EVENTS my_consumer
```

---

## Étape 5 : Vérification de la persistance

Vérifiez l’état de JetStream :

```bash
nats stream report
```

Vous devriez voir un état similaire à :

```txt
Streams: 1  Consumers: 1  Messages: 1  Bytes: 250
```

---

## 📋 Résumé

Vous avez déployé :

* Un **cluster NATS** en haute disponibilité sur votre tenant Hikube
* Le **JetStream** activé pour la persistance des messages
* Un **utilisateur** prêt à publier et consommer des messages

---

✨ Vous êtes maintenant prêt à intégrer NATS dans vos applications hébergées sur **Hikube** !
