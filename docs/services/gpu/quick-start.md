---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer une VM avec GPU

Ce guide crée une VM Ubuntu avec un GPU NVIDIA depuis la [console Hikube](https://console.hikube.cloud), puis vérifie que le GPU est utilisable. Pour des GPU dans un cluster Kubernetes, voir [Provisionner un GPU sur Kubernetes](./how-to/provision-gpu-kubernetes.md).

---

## Prérequis

- Un compte Hikube et un **projet** (voir [Démarrage rapide Hikube](../../getting-started/quick-start.md)).
- Des quotas disponibles : au moins 8 vCPU, 32 Go de mémoire et 50 Go de stockage.
- Une clé SSH publique (`cat ~/.ssh/id_ed25519.pub`).

---

## Étape 1 : Ouvrir l'assistant de création

1. Dans le menu latéral, ouvrez **Infrastructure** > **Instances VM**.
2. Cliquez sur **Créer une Instance**.
3. Étape **Général** : saisissez le **Nom de l'instance**, par exemple `vm-gpu01`, puis **Suivant**.

---

## Étape 2 : Configurer et valider

### Configuration : gabarit et GPU

1. Sous **Ressources (CPU / RAM)**, choisissez **Universel (U)** > **2XLARGE** (8 vCPU, 32 Go).
2. Sous **Accélération Matérielle (GPU)**, cliquez sur la carte **NVIDIA L40S** (ou un autre modèle disponible). Le badge **1 GPU au total** apparaît. Les boutons **+** et **−** de la carte ajustent le nombre de GPU.
3. Cliquez sur **Suivant**.

Les modèles marqués **Indisponible** ne peuvent pas être sélectionnés pour le moment.

### Stockage

1. Sous **Système d'exploitation**, sélectionnez **ubuntu** en version **24.04**.
2. Portez **Taille (Go)** à `50` : les drivers, CUDA et les frameworks ML occupent plusieurs dizaines de Go.
3. Cliquez sur **Suivant**.

### Réseau

1. Laissez **Adresse IPv4 Publique** activée et **SSH (22)** coché dans **Ports Autorisés**.
2. Ajoutez votre clé dans **Clés SSH autorisées**.
3. Optionnel : activez **Script Cloud-Init (User Data)** pour installer les drivers automatiquement (script dans [Installer CUDA](../compute/how-to/install-cuda-drivers.md)).
4. Cliquez sur **Suivant**.

### Vérification

Le **Récapitulatif** affiche une ligne **Accélération Matérielle (GPU)** avec le modèle et la quantité. Vérifiez le coût estimé, puis cliquez sur **Déployer**.

---

## Étape 3 : Vérifier l'état

Dans la liste **Instances VM**, attendez le statut **Actif**. Sur la page de détail, la section **Ressources & Caractéristiques** liste le GPU sous **GPUs**.

**Résultat attendu :** statut **Actif** et un badge par GPU sous **GPUs**, dans **Ressources & Caractéristiques**. Le badge porte le nom technique du modèle (par exemple `l40s` pour un NVIDIA L40S).

---

## Étape 4 : Récupérer les informations de connexion

Copiez la commande du bloc **Connexion SSH** (section **Réseau et Sécurité** de la page de détail), par exemple `ssh ubuntu@203.0.113.20`.

---

## Étape 5 : Connexion et tests

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@203.0.113.20

# Le GPU est visible sur le bus PCI
lspci | grep -i nvidia
```

**Résultat attendu :**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Installez ensuite les drivers NVIDIA et CUDA en suivant [Installer CUDA et les drivers GPU](../compute/how-to/install-cuda-drivers.md), puis :

```bash
nvidia-smi
```

**Résultat attendu :** le tableau `nvidia-smi` liste le GPU (par exemple `NVIDIA L40S`) avec sa mémoire.

---

## Étape 6 : Dépannage rapide

| Symptôme | Action |
|----------|--------|
| La section **Accélération Matérielle (GPU)** n'apparaît pas | La plateforme ne propose aucun GPU pour le moment : contactez le [support](mailto:support@hidora.io). |
| Toutes les cartes sont **Indisponible** | Aucun GPU libre : réessayez plus tard ou contactez le support. |
| **Les GPUs suivants ne sont pas disponibles : …** au déploiement | Les GPU demandés ne sont pas libres ensemble sur un même serveur : réduisez le nombre de GPU ou changez de modèle. |
| `lspci` ne montre aucun GPU NVIDIA | Vérifiez sur la page de détail que le GPU est listé ; sinon, ajoutez-le via **Modifier**. |
| `nvidia-smi: command not found` | Les drivers ne sont pas installés : voir [Installer CUDA](../compute/how-to/install-cuda-drivers.md). |

Plus de cas dans le [dépannage GPU](./troubleshooting.md).

---

## Étape 7 : Nettoyage

1. Sur la page de détail de la VM, cliquez sur **Supprimer**.
2. Saisissez le nom de la VM et cliquez sur **Supprimer définitivement**.
3. Le disque système reste dans le menu **Disques** : supprimez-le depuis ce menu si vous n'en avez plus besoin.

:::tip Arrêter plutôt que supprimer ?
**Arrêter** la VM libère le GPU, qui peut être attribué à un autre workload : au redémarrage, il faudra peut-être choisir un autre modèle. Supprimez la VM si vous n'en avez plus l'usage, arrêtez-la si vous comptez la relancer.
:::

---

## Prochaines étapes

- [Provisionner un GPU sur Kubernetes](./how-to/provision-gpu-kubernetes.md)
- [Concepts GPU](./concepts.md)
- [FAQ](./faq.md)

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/provision-gpu-vm"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Ressources de calcul", href: "../../compute/"},
  ]}
/>
