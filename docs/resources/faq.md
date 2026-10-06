---
sidebar_position: 2
title: FAQ
---

# Questions fréquentes

Retrouvez ici les réponses aux questions les plus courantes sur l'utilisation d'Hikube. Chaque service dispose aussi de sa propre FAQ.

---

## 1. Comment accéder à Hikube ?

Connectez-vous à la console : [https://console.hikube.cloud](https://console.hikube.cloud), avec les identifiants fournis par Hidora. Si vous n'avez pas encore de compte, contactez **sales@hidora.io**.

Voir : [Démarrage rapide](../getting-started/quick-start.md)

---

## 2. Quelle différence entre organisation et projet ?

L'**organisation** représente votre entreprise ; elle est créée par Hidora. Les **projets** sont les espaces isolés que vous créez dans l'organisation pour y regrouper vos ressources, avec leurs propres quotas. Dans les anciennes versions de la documentation, un projet était appelé **tenant**.

Voir : [Concepts clés](../getting-started/concepts.md)

---

## 3. Comment récupérer le kubeconfig de mon cluster Kubernetes ?

Ouvrez **Infrastructure** → **Kubernetes**, cliquez sur votre cluster, puis sur **Kubeconfig**. La console télécharge le fichier `kubeconfig-<nom-du-cluster>.yaml`.

```bash
export KUBECONFIG=~/.kube/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes
```

Voir : [Kubernetes - Démarrage rapide](../services/kubernetes/quick-start.md)

---

## 4. Ai-je encore besoin d'un kubeconfig pour gérer mes ressources Hikube ?

Non. Les VM, disques, buckets, réseaux, clusters Kubernetes et bases de données se créent et se gèrent depuis la console, et s'automatisent avec l'[API publique](../api/overview.md). Le kubeconfig de projet n'est plus disponible ; la méthode [Terraform legacy](../tools/terraform.md) qui en dépendait est retirée.

Le kubeconfig d'un **cluster Kubernetes** (question 3) reste, lui, le moyen normal d'accéder à ce cluster.

---

## 5. Où trouver les identifiants de ma base de données ?

Sur la page de détail du cluster de base de données dans la console (**DB & Messaging** → service → cluster). Les utilisateurs, leurs mots de passe et l'hôte de connexion y sont affichés.

Voir : [PostgreSQL](../services/databases/postgresql/quick-start.md), [MariaDB](../services/databases/mariadb/quick-start.md), [MongoDB](../services/databases/mongodb/quick-start.md), [Redis](../services/databases/redis/quick-start.md), [RabbitMQ](../services/messaging/rabbitmq/quick-start.md)

---

## 6. Comment exposer une base de données sur Internet ?

Activez l'option **Accès externe** à la création du cluster ou dans **Modifier**. Une IP publique est alors attribuée et affichée dans le champ **Hôte** de la page de détail.

:::warning
N'exposez une base de données que si c'est nécessaire, et utilisez des mots de passe robustes.
:::

---

## 7. Comment choisir la taille de mes ressources ?

Les assistants de création proposent des gabarits prédéfinis :

- **VM et nœuds Kubernetes** : types d'instance des séries `s1`, `u1` et `m1` (de 1 à 64 vCPU). Voir [Concepts Kubernetes](../services/kubernetes/concepts.md) et [Concepts machines virtuelles](../services/compute/concepts.md).
- **Bases de données** : presets de `nano` à `2xlarge`. Voir la page Concepts de chaque service.

Chaque assistant affiche l'impact sur le quota du projet et le coût estimé avant la création.

---

## 8. Comment augmenter les quotas d'un projet ?

Les administrateurs du projet ou de l'organisation modifient les quotas dans les paramètres du projet. Un quota ne peut pas descendre sous la consommation actuelle. Si la capacité de votre organisation est insuffisante, contactez le support.

Voir : [Concepts clés - Quotas](../getting-started/concepts.md#quotas)

---

## 9. Comment scaler mes ressources ?

- **Cluster Kubernetes** : modifiez les bornes minimum et maximum des groupes de nœuds dans **Modifier**. Les nœuds s'adaptent automatiquement à la charge entre ces bornes. Voir [Gérer les groupes de nœuds](../services/kubernetes/how-to/manage-node-groups.md).
- **Bases de données** : selon le service, le preset et le stockage se modifient dans **Modifier**. Voir le guide « scaling » de chaque service.

---

## 10. Comment fonctionne la haute disponibilité des bases de données ?

Avec plusieurs réplicas, chaque service managé bascule automatiquement sur un réplica sain en cas de panne de l'instance principale. Le nombre de réplicas se choisit à la création.

Voir : [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md), [Redis - Concepts](../services/databases/redis/concepts.md)

---

## 11. Les sauvegardes de bases de données sont-elles disponibles dans la console ?

Pas encore. La configuration des sauvegardes et la restauration se font aujourd'hui par le support. Voir par exemple [PostgreSQL - Sauvegardes](../services/databases/postgresql/how-to/configure-backups.md).

---

## 12. Comment contacter le support ?

Depuis la console, ouvrez le menu de profil et cliquez sur **Contacter le support** : le contexte technique de la page est joint à votre demande. Vous pouvez aussi écrire à **support@hidora.io**.
