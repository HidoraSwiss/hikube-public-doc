---
sidebar_position: 3
title: Démarrage rapide
---

# Démarrage rapide avec Hikube

Ce guide vous accompagne de la première connexion à votre premier cluster Kubernetes, entièrement depuis la [console Hikube](https://console.hikube.cloud). Comptez une dizaine de minutes.

---

## Prérequis

- **Un compte Hikube.** Si vous n'en avez pas encore, contactez notre équipe à **sales@hidora.io**.
- **Un navigateur web récent.**
- **kubectl**, uniquement pour l'étape finale qui interroge votre cluster Kubernetes. Voir [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).

---

## Étape 1 : Se connecter à la console

1. Ouvrez [https://console.hikube.cloud](https://console.hikube.cloud).
2. Connectez-vous avec les identifiants fournis par Hidora.
3. Vous arrivez sur votre **organisation**. Son nom est affiché dans le menu de profil, sous **Organisation actuelle**.

:::note Aucune organisation ?
Si la console affiche **Aucune organisation**, votre compte n'est pas encore rattaché à une organisation. Actualisez la page si vous venez d'en recevoir une, sinon [contactez le support](mailto:support@hidora.io).
:::

---

## Étape 2 : Créer un projet

Un **projet** est un espace isolé qui regroupe vos ressources (VM, clusters, bases de données…) et porte ses propres quotas.

1. Ouvrez le sélecteur de projet et cliquez sur **Créer un projet**. Lors de votre première connexion, l'assistant **Bienvenue sur Hikube** s'ouvre directement.
2. Étape **Général** : saisissez le **Nom du projet**. Il doit commencer par une lettre et ne contenir que des minuscules et des chiffres, sans tiret, entre 3 et 16 caractères (exemple : `demo01`).

   ![Assistant de création de projet, étape Général](/img/console/projects/wizard-general.fr.png)

3. Étape **Quotas** (optionnelle) : fixez les limites de **CPU** (vCPU), **Mémoire** (Go) et **Stockage** (Go) du projet.
4. Étape **Vérification** : relisez le récapitulatif puis cliquez sur **Créer le projet**.

Le tableau de bord affiche **Projet en cours de création…** pendant la préparation du projet, puis s'ouvre automatiquement.

---

## Étape 3 : Créer un cluster Kubernetes

1. Dans le menu latéral, ouvrez **Infrastructure** → **Kubernetes**, puis cliquez sur **Créer un cluster**.
2. Étape **Général** : choisissez un **Nom du cluster**, une **Version de Kubernetes** et la **Taille de l'instance Control Plane**. Laissez **Endpoint API (Host)** vide : la plateforme le génère pour vous.
3. Étape **Nœuds** : configurez au moins un groupe de nœuds (type d'instance, nombre de nœuds, stockage éphémère).
4. Étape **Addons** : activez les extensions dont vous avez besoin (par exemple cert-manager ou ingress-nginx).
5. Étape **Vérification** : contrôlez le récapitulatif et le coût estimé, puis lancez la création.

Le détail de chaque champ est décrit dans le [démarrage rapide Kubernetes](../services/kubernetes/quick-start.md).

---

## Étape 4 : Suivre le déploiement

La liste **Clusters Kubernetes** affiche le statut du cluster :

- **En création** : le control plane et les nœuds sont en cours de provisionnement ;
- **Prêt** / **Actif** : le cluster est opérationnel.

Le passage à **Prêt** prend généralement quelques minutes.

---

## Étape 5 : Récupérer le kubeconfig du cluster

1. Cliquez sur le cluster pour ouvrir sa page de détail.
2. Cliquez sur **Kubeconfig**. La console télécharge un fichier `kubeconfig-<nom-du-cluster>.yaml`.

:::warning Fichier sensible
Ce fichier donne un accès administrateur à votre cluster. Ne le versionnez pas et stockez-le dans un emplacement protégé (par exemple `~/.kube/`).
:::

---

## Étape 6 : Interroger le cluster

```bash
export KUBECONFIG=~/.kube/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes
```

**Résultat attendu :**

```console
NAME                       STATUS   ROLES    AGE   VERSION
<nom-du-cluster>-<groupe>-xxxxx   Ready    <none>   3m    v1.xx.x
```

Les nœuds workers peuvent mettre quelques minutes de plus à apparaître après le passage du cluster à **Prêt**.

---

## Résumé

Vous avez :

- créé un **projet** isolé, avec ses quotas ;
- déployé un **cluster Kubernetes managé** depuis la console ;
- récupéré son kubeconfig et vérifié l'accès avec `kubectl`.

## Besoin d'aide ?

- **[FAQ](../resources/faq.md)** : réponses aux questions courantes
- **[Dépannage](../resources/troubleshooting.md)** : solutions aux problèmes fréquents
- **Support** : bouton **Contacter le support** dans le menu de profil de la console, ou **support@hidora.io**

**Prochaine étape recommandée :** [Concepts clés](./concepts.md)
