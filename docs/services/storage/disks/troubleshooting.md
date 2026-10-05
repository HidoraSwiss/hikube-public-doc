---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Disques

### « La taille dépasse le quota disponible »

**Cause** : la taille demandée dépasse le stockage restant du quota du projet. Le message indique le maximum disponible.

**Solution** :

1. Réduisez la **Taille (Go)** à une valeur inférieure ou égale au maximum indiqué.
2. Libérez du stockage en supprimant des disques ou des ressources inutilisés (les disques détachés consomment aussi le quota).
3. Si besoin, faites augmenter le quota de stockage du projet.

---

### « La taille minimum est de 20 Go » ou « La taille doit être d'au moins 50 Go pour Windows »

**Cause** : la taille est inférieure au minimum.

**Solution** : saisissez au moins 20 Go, ou 50 Go pour un disque système Windows.

---

### Le disque reste en « Téléchargement » ou passe en « Erreur »

**Cause** : l'import de l'image est long (image volumineuse) ou a échoué (URL inaccessible, fichier non reconnu).

**Solution** :

1. Suivez la progression en pourcentage sur la page du disque ; un import volumineux peut prendre du temps.
2. Pour une image personnalisée, vérifiez que l'URL est accessible publiquement en HTTPS et pointe vers un fichier ISO ou QCOW2 valide :
   ```bash
   curl -I https://example.com/image.qcow2
   ```
3. Si le disque passe en **Erreur**, supprimez-le et recréez-le avec une URL corrigée. Si le problème persiste, [contactez le support](mailto:support@hidora.io) avec le nom et l'identifiant du disque.

---

### Le disque n'apparaît pas dans « Sélectionner un volume existant »

**Cause** : le disque est déjà attaché à une VM, il est déjà sélectionné sur un autre volume, ou son type ne correspond pas au volume.

**Solution** :

1. Vérifiez sur la page du disque le champ **Attaché à** : s'il indique une VM, détachez-le d'abord.
2. Pour le **Disque Système (Boot)**, seuls les disques système (créés à partir d'une image) sont proposés ; pour les volumes de données, seuls les disques de données.

---

### Le disque n'est pas visible dans la VM

**Cause** : la VM n'a pas encore redémarré après la modification du stockage, ou le disque n'a pas été enregistré sur la VM.

**Solution** :

1. Vérifiez sur la page du disque que **Attaché à** indique la bonne VM et que le statut est **En cours d'utilisation**.
2. Attendez la fin du redémarrage de la VM, puis relancez `lsblk` dans la VM.

---

### La nouvelle taille n'est pas visible dans la VM après un redimensionnement

**Cause** : le système de fichiers n'a pas été étendu, ou la VM n'a pas encore pris en compte la nouvelle taille du périphérique.

**Solution** :

1. Vérifiez la taille du périphérique avec `lsblk`. Si elle n'a pas changé, redémarrez la VM.
2. Étendez la partition et le système de fichiers (voir [Redimensionner un disque](./how-to/resize.md)).

---

### La suppression du disque échoue

**Cause** : le disque est attaché à une VM (« Le disque ne peut pas être supprimé car il est en cours d'utilisation. »), ou le service est momentanément indisponible.

**Solution** :

1. Détachez le disque depuis la page de modification de la VM (section **Stockage**), puis réessayez.
2. Si le message indique « Le service de suppression de disque est temporairement indisponible. », réessayez quelques minutes plus tard.

---

### Le nom du disque est refusé

**Cause** : le nom ne respecte pas les règles, ou il se termine par un suffixe réservé (« Ce domaine est réservé par Hikube »).

**Solution** : utilisez 3 à 16 caractères (minuscules, chiffres et tirets), commencez par une lettre et terminez par une lettre ou un chiffre.
