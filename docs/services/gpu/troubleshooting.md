---
sidebar_position: 7
title: Dépannage
---

# Dépannage — GPU

### La section GPU n'apparaît pas dans l'assistant

**Cause** : la section **Accélération Matérielle (GPU)** (VM) ou **GPU** (groupe de nœuds Kubernetes) n'est affichée que si la plateforme propose au moins un modèle.

**Solution** : rechargez la page. Si la section reste absente, contactez le [support](mailto:support@hidora.io).

---

### Tous les modèles sont Indisponible

**Cause** : aucune unité libre pour ces modèles au moment de la création.

**Solution** : réessayez plus tard ou contactez [sales@hidora.io](mailto:sales@hidora.io) pour un besoin de capacité.

---

### « Les GPUs suivants ne sont pas disponibles : … » à la création ou à l'enregistrement

**Cause** : les GPU demandés ne sont pas libres ensemble sur un même serveur physique, ou ont été attribués entre l'ouverture de l'assistant et le déploiement. Une VM, comme un nœud Kubernetes, s'exécute sur un seul serveur.

**Solution** :

1. Réduisez le nombre de GPU par VM ou par nœud.
2. Évitez de combiner plusieurs modèles sur une même VM.
3. Choisissez un autre modèle disponible.

---

### La VM avec GPU ne redémarre pas

**Cause** : l'arrêt a libéré le GPU, qui a été attribué à un autre workload. La console affiche **Ces GPUs ne sont plus disponibles, ils ont peut-être été réclamés par un autre workload : …**.

**Solution** :

1. Dans la boîte **Sélectionner un GPU alternatif**, choisissez un modèle dans **GPU disponible**.
2. Cliquez sur **Mettre à jour et démarrer** : la configuration de la VM est mise à jour, puis la VM démarre.
3. Si la boîte indique **Aucun GPU n'est actuellement disponible.**, réessayez plus tard.

---

### GPU non détecté dans la VM

**Cause** : le GPU n'est pas attaché à la VM, ou la VM n'a pas redémarré après l'ajout.

**Solution** :

1. Sur la page de détail, vérifiez que le GPU figure sous **GPUs** (section **Ressources & Caractéristiques**). Sinon, ajoutez-le via **Modifier** > **Ressources (CPU / RAM)**, puis **Enregistrer**.
2. Après un ajout, attendez que la VM soit revenue au statut **Actif**.
3. Dans la VM :
   ```bash
   lspci | grep -i nvidia
   ```
4. Si le GPU apparaît dans `lspci` mais pas dans `nvidia-smi`, les drivers manquent : voir la section suivante.

---

### Drivers NVIDIA manquants dans la VM

**Cause** : les images Hikube ne contiennent pas les drivers NVIDIA, ou les en-têtes du noyau ne correspondent pas à la version du noyau.

**Solution** :

1. Installez les drivers en suivant [Installer CUDA et les drivers GPU](../compute/how-to/install-cuda-drivers.md). Sur Ubuntu, vérifiez que les en-têtes du noyau sont présents :
   ```bash
   sudo apt-get install -y linux-headers-$(uname -r)
   ```
2. Redémarrez la VM (`sudo reboot` ou **Redémarrer** dans la console).
3. Vérifiez :
   ```bash
   nvidia-smi
   ```

---

### Pod GPU en état Pending

**Cause** : aucun nœud du cluster n'a de GPU libre, le groupe GPU est à 0 nœud, ou le GPU Operator n'est pas prêt.

**Solution** :

1. Consultez les événements du pod :
   ```bash
   kubectl describe pod <pod>
   ```
   Le message `Insufficient nvidia.com/gpu` indique qu'aucun nœud n'a de GPU libre.
2. Vérifiez les GPU allouables :
   ```bash
   kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
   ```
3. Dans la console, ouvrez le cluster et vérifiez le groupe de nœuds GPU (**Pools de Nœuds**) : nombre de nœuds actifs, modèle de GPU. Augmentez **Nombre maximum de nœuds** via **Modifier** si tous les GPU sont occupés.
4. Vérifiez que l'addon **GPU Operator** est actif (il l'est automatiquement dès qu'un groupe a des GPU).

---

### `nvidia-smi` échoue dans un pod

**Cause** : les composants du GPU Operator ne sont pas encore prêts sur le nœud, ou le pod ne demande pas de GPU.

**Solution** :

1. Vérifiez que le pod déclare `nvidia.com/gpu` dans `resources.limits`.
2. Vérifiez l'état des pods du GPU Operator :
   ```bash
   kubectl get pods -A | grep -i gpu-operator
   ```
3. Si des pods sont en `CrashLoopBackOff`, consultez leurs logs :
   ```bash
   kubectl logs -n <namespace> <pod>
   ```
4. Une fois l'opérateur prêt, recréez votre pod. Si le problème persiste, contactez le [support](mailto:support@hidora.io).

---

### Impossible d'ajouter un GPU à un groupe de nœuds existant

**Cause** : un groupe créé sans GPU ne peut pas en recevoir (**Un groupe de nœuds existant ne peut pas recevoir de GPU : ajoutez un nouveau groupe de nœuds GPU**). À l'inverse, un groupe GPU doit garder au moins un GPU.

**Solution** : dans **Modifier** > **Groupes de nœuds**, cliquez sur **Ajouter un groupe de nœuds** et configurez le GPU sur ce nouveau groupe.
