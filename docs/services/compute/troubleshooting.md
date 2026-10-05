---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Machines virtuelles

### Le bouton Suivant reste grisé dans l'assistant

**Cause** : la VM dépasserait un quota du projet (CPU, Mémoire ou Stockage). Le bandeau de l'assistant affiche **Quota dépassé** et le détail par ressource.

**Solution** :

1. Choisissez un type d'instance plus petit ou réduisez la taille des disques.
2. Libérez des ressources : supprimez des VM ou des disques inutilisés (les disques détachés comptent dans le quota de stockage).
3. Faites augmenter les quotas du projet.

Si la console indique que les quotas du projet sont indisponibles, la création reste bloquée tant qu'ils ne peuvent pas être lus : réessayez plus tard ou contactez le [support](mailto:support@hidora.io).

---

### Erreur à la création : nom déjà utilisé ou taille de disque refusée

**Cause et solution** :

| Message | Solution |
|---------|----------|
| **Une instance avec ce nom existe déjà.** | Choisissez un autre nom. |
| **Min. 20 Go requis** / **Min. 50 Go requis** | Augmentez **Taille (Go)** : 20 Go minimum, 50 Go pour Windows. |
| Message mentionnant une taille minimale pour Oracle Linux | Le disque système Oracle Linux demande au moins 40 Go. |
| **L'image système est requise pour un nouveau disque** | Sélectionnez une carte sous **Système d'exploitation**. |
| **Format invalide. Attendu : `<algorithme> <clé-base64> [commentaire]`** | Collez la clé **publique** complète (fichier `.pub`), sur une seule ligne. |

---

### La VM reste en statut Erreur ou Échec

**Cause** : la VM n'a pas pu être planifiée ou démarrée (ressources indisponibles, disque en erreur, GPU indisponible…). Lorsque la plateforme renvoie une raison, elle s'affiche au survol du badge de statut.

**Solution** :

1. Ouvrez la page de détail et vérifiez la section **Stockage & Disques** : les disques doivent être présents.
2. Si la VM a des GPU, consultez [GPU indisponible au démarrage](#gpu-indisponible-au-démarrage).
3. Essayez **Arrêter** puis **Démarrer** depuis la section **Actions**.
4. Si le statut persiste, contactez le [support](mailto:support@hidora.io) en indiquant le nom de la VM et son identifiant (affiché sous le titre de la page de détail, avec un bouton de copie).

---

### Timeout SSH

**Cause** : pas d'IP publique, port 22 non autorisé, ou service SSH pas encore démarré dans la VM.

**Solution** :

1. Sur la page de détail, section **Réseau et Sécurité** : **IP Publique** doit être **Active** et le port **22** doit figurer sous **Pare-feu & Ports**.
2. Sinon, cliquez sur **Modifier**, activez **Adresse IPv4 Publique**, cochez **SSH (22)** dans **Ports Autorisés**, puis **Enregistrer**.
3. Juste après la création, attendez une à deux minutes que l'OS ait fini de démarrer.
4. Testez en mode verbeux :
   ```bash
   ssh -v ubuntu@<ip-publique>
   ```

---

### Permission denied (publickey)

**Cause** : mauvais utilisateur, mauvaise clé, ou clé ajoutée après le premier démarrage sans rechargement du user-data.

**Solution** :

1. Utilisez l'utilisateur indiqué dans le bloc **Connexion SSH** (ou sous **Image Système** > **Utilisateur**).
2. Vérifiez que la clé publique correspondant à votre clé privée figure dans **Configuration avancée** > **Clés SSH**.
3. Si vous venez d'ajouter la clé via **Modifier**, choisissez **Reload user-data** dans la boîte de dialogue **Clés SSH modifiées**, ou lancez **Recharger UserData** depuis la section **Actions**, puis **Redémarrer** : la clé n'est installée qu'au redémarrage.

---

### Le disque ajouté n'apparaît pas dans la VM

**Cause** : la VM n'a pas encore redémarré après l'ajout, ou le disque n'est pas formaté.

**Solution** :

1. Après **Enregistrer**, la console affiche **Redémarrage requis** : attendez que la VM revienne à l'état **Actif**.
2. Vérifiez le disque dans la section **Stockage & Disques** de la page de détail.
3. Dans la VM, listez les périphériques : un nouveau disque apparaît sans partition ni point de montage.
   ```bash
   lsblk
   ```
4. Formatez-le et montez-le : voir [Attacher un disque supplémentaire](./how-to/attach-extra-disk.md).

---

### GPU indisponible au démarrage

**Cause** : un GPU est libéré quand la VM est arrêtée et peut être attribué à un autre workload entre-temps.

**Solution** : au démarrage, si le GPU n'est plus disponible, la console ouvre la boîte **Sélectionner un GPU alternatif**. Choisissez un modèle dans **GPU disponible** puis cliquez sur **Mettre à jour et démarrer**. Si la boîte indique **Aucun GPU n'est actuellement disponible.**, réessayez plus tard ou contactez le [support](mailto:support@hidora.io). Voir [Dépannage GPU](../gpu/troubleshooting.md).

---

### DNS .local ne fonctionne pas dans la VM

**Cause** : `systemd-resolved` traite les domaines `.local` comme du mDNS.

**Solution** : voir [Résoudre le DNS .local dans les VM](./how-to/fix-dns-local.md).

---

### La VM ne répond plus du tout (ni SSH ni RDP)

**Cause** : OS bloqué, réseau mal configuré dans la VM, pare-feu interne trop restrictif.

**Solution** :

1. Lancez **Redémarrer** depuis la section **Actions** de la page de détail.
2. Si une modification récente du cloud-init est en cause, corrigez le script dans **Modifier** > **Configuration avancée**, puis lancez **Recharger UserData** et **Redémarrer**.
3. L'accès console série ou VNC n'est pas proposé dans la console ; contactez le [support](mailto:support@hidora.io) pour un diagnostic de bas niveau.
