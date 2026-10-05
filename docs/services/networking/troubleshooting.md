---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Réseau

### Bloc CIDR refusé à la création d'un sous-réseau

**Cause** : format invalide, plage publique, chevauchement avec un autre sous-réseau du VPC ou avec une plage réservée.

**Solution** :

| Message | Correction |
|---------|-----------|
| **Bloc CIDR invalide (ex: 192.168.1.0/24)** ou **Format CIDR invalide (ex: 172.16.0.0/24)** | Saisissez une adresse IPv4 suivie d'un préfixe, par exemple `172.16.0.0/24`. |
| Message indiquant que la plage doit être privée | Utilisez une plage dans `10.0.0.0/8`, `172.16.0.0/12` ou `192.168.0.0/16`. |
| Message mentionnant un chevauchement (*overlaps*) avec un sous-réseau existant | Choisissez une plage disjointe des autres sous-réseaux du VPC (liste dans **Voir les sous-réseaux**). |
| Message mentionnant un chevauchement avec un réseau réservé | Évitez `10.244.0.0/16` et `10.96.0.0/12` ; préférez `172.16.0.0/12`. |

---

### Nom de VPC ou de sous-réseau refusé

**Cause** : le nom ne respecte pas les règles, ou il existe déjà.

**Solution** :

- **VPC** : 3 à 16 caractères, minuscules, chiffres et tirets, commençant par une lettre et se terminant par une lettre ou un chiffre. Unique dans le projet.
- **Sous-réseau** : 1 à 63 caractères, minuscules, chiffres et tirets. Unique dans le VPC.

---

### Le VPC reste En création ou En attente

**Cause** : la plateforme n'a pas fini de provisionner le réseau.

**Solution** : la liste se met à jour automatiquement ; patientez quelques instants. Si l'état passe à **Erreur** ou **Échec**, ou reste bloqué, contactez le [support](mailto:support@hidora.io) en indiquant le nom du VPC.

---

### L'interface secondaire n'a pas d'adresse dans la VM

**Cause** : l'OS de la VM n'a pas configuré automatiquement la nouvelle interface, ou la VM n'a pas encore pris en compte la modification.

**Solution** :

1. Sur la page de détail de la VM, vérifiez que **Réseaux VPC** liste le sous-réseau et que **Adresses IP** contient une adresse **Secondaire**.
2. Dans la VM, listez les interfaces :
   ```bash
   ip -br link
   ip -br addr
   ```
3. Si l'interface existe sans adresse, activez DHCP dessus (exemple netplan dans [Relier une VM à un VPC](./how-to/attach-vm-to-vpc.md#4-vérifier-dans-los)).
4. Si l'interface n'apparaît pas du tout, redémarrez la VM (**Redémarrer** dans la section **Actions**).
5. Si le problème persiste, contactez le [support](mailto:support@hidora.io).

---

### Deux VM du même sous-réseau ne communiquent pas

**Cause** : VM sur des sous-réseaux ou des VPC différents, interface non configurée dans l'OS, ou pare-feu de l'OS.

**Solution** :

1. Comparez la section **Réseaux VPC** des deux VM : elles doivent partager le même VPC **et** le même sous-réseau.
2. Vérifiez dans chaque VM que l'interface secondaire porte l'adresse affichée dans la console (`ip -br addr`).
3. Vérifiez le pare-feu de l'OS (`sudo ufw status`, `sudo firewall-cmd --list-all`, `sudo nft list ruleset`).
4. Testez avec l'interface explicitement :
   ```bash
   ping -c 3 -I enp2s0 <adresse-de-l-autre-vm>
   ```

---

### La VM a perdu l'accès Internet après l'ajout d'un VPC

**Cause** : la configuration réseau de l'OS a fait de l'interface VPC la route par défaut.

**Solution** : vérifiez la route par défaut :

```bash
ip route show default
```

Elle doit passer par l'interface principale. Si elle passe par l'interface VPC, désactivez l'utilisation des routes DHCP sur cette interface (`use-routes: false` avec netplan, voir [Relier une VM à un VPC](./how-to/attach-vm-to-vpc.md#4-vérifier-dans-los)).

---

### Suppression impossible

**Cause** : le VPC ou le sous-réseau est encore utilisé par des VM. La console liste les VM concernées.

**Solution** : pour chaque VM listée, ouvrez **Modifier** > **Réseau & Sécurité**, décochez le VPC ou le sous-réseau, puis **Enregistrer**. Réessayez ensuite la suppression.
