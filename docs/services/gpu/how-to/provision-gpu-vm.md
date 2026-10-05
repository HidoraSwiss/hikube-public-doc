---
title: "Comment provisionner un GPU sur une VM"
---

# Comment provisionner un GPU sur une VM

Hikube permet d'attacher un ou plusieurs GPU NVIDIA à une machine virtuelle, à la création ou après coup. Ce guide explique comment choisir le GPU, l'ajouter depuis la console et vérifier qu'il est utilisable.

## Prérequis

- Un compte Hikube et un projet avec des quotas suffisants (8 vCPU et 32 Go de mémoire par GPU recommandés)
- Une clé SSH publique
- Familiarité avec les [machines virtuelles](../../compute/overview.md) Hikube

## Étapes

### 1. Choisir le modèle de GPU

| Modèle | Mémoire | Cas d'usage |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 Go | Inférence, développement, prototypage |
| **NVIDIA A100 80GB** | 80 Go | Entraînement ML, fine-tuning |
| **NVIDIA H100 80GB** | 80 Go | Entraînement et inférence de grands modèles |
| **NVIDIA RTX 6000 Pro** | 96 Go | LLM, calcul intensif |

:::tip Quel GPU choisir ?
Commencez par un **L40S** pour le développement et le prototypage. Passez à un **A100** ou un **H100** pour l'entraînement, et réservez le **RTX 6000 Pro** aux modèles qui demandent le plus de mémoire.
:::

### 2. Ajouter le GPU à la création de la VM

1. Ouvrez **Infrastructure** > **Instances VM** > **Créer une Instance**.
2. Étape **Configuration** :
   - sous **Ressources (CPU / RAM)**, choisissez un gabarit adapté, par exemple **Universel (U)** > **2XLARGE** (8 vCPU, 32 Go) pour un GPU ;
   - sous **Accélération Matérielle (GPU)**, cliquez sur la carte du modèle voulu. Utilisez **+** pour ajouter d'autres GPU du même modèle, ou cliquez sur une autre carte pour combiner des modèles.
3. Étape **Stockage** : choisissez l'image (par exemple **ubuntu** 24.04) et au moins **50 Go**.
4. Étape **Réseau** : ajoutez votre clé SSH et les ports nécessaires (par exemple `8888` pour Jupyter, via **Port personnalisé...**).
5. Étape **Vérification** : contrôlez la ligne **Accélération Matérielle (GPU)** et le coût estimé, puis cliquez sur **Déployer**.

:::warning Plusieurs GPU sur une VM
Tous les GPU d'une VM doivent être libres sur le même serveur physique. Si ce n'est pas le cas, le déploiement échoue avec **Les GPUs suivants ne sont pas disponibles : …**. Réduisez alors le nombre de GPU ou choisissez un autre modèle. Dimensionnez le gabarit en conséquence : un `u1.8xlarge` (32 vCPU, 128 Go) convient pour 4 GPU.
:::

### 3. Ajouter ou changer un GPU sur une VM existante

1. Ouvrez la page de détail de la VM et cliquez sur **Modifier**.
2. Dans **Ressources (CPU / RAM)**, ajustez la sélection **Accélération Matérielle (GPU)** (ajout, retrait, changement de modèle). Adaptez le gabarit si besoin.
3. Cliquez sur **Enregistrer**. La console affiche **Redémarrage requis** : la VM redémarre avec la nouvelle configuration.

### 4. Installer les drivers

Les images Hikube ne contiennent pas les drivers NVIDIA. Suivez [Installer CUDA et les drivers GPU](../../compute/how-to/install-cuda-drivers.md), ou collez le script cloud-init de ce guide dans **Script Cloud-Init (User Data)** à la création.

## Vérification

1. **Dans la console** : la page de détail affiche le statut **Actif** et le GPU sous **GPUs** (section **Ressources & Caractéristiques**), sous son nom technique : `l40s`, `a100-80gb`, `h100-80gb` ou `rtx-6000-pro`.
2. **Dans la VM** :

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<ip-publique>
lspci | grep -i nvidia
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv
```

**Résultat attendu** (après installation des drivers) :

```
name, memory.total [MiB], driver_version
NVIDIA L40S, 46068 MiB, 560.xx.xx
```

:::note Arrêt d'une VM avec GPU
**Arrêter** la VM libère ses GPU. Au démarrage suivant, si un GPU a été attribué à un autre workload, la console ouvre **Sélectionner un GPU alternatif** : choisissez un modèle dans **GPU disponible** puis **Mettre à jour et démarrer**.
:::

## Pour aller plus loin

- [Provisionner un GPU sur Kubernetes](./provision-gpu-kubernetes.md)
- [Installer CUDA et les drivers GPU](../../compute/how-to/install-cuda-drivers.md)
- [Dépannage GPU](../troubleshooting.md)
