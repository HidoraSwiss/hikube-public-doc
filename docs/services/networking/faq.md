---
sidebar_position: 6
title: FAQ
---

# FAQ — Réseau

### À quoi sert un VPC si ma VM a déjà une IP publique ?

L'IP publique sert à exposer la VM sur Internet. Le VPC sert aux échanges **entre vos VM**, sur des adresses privées qui ne sont pas joignables depuis Internet. Vous pouvez ainsi ne donner d'IP publique qu'aux VM frontales et garder les autres en privé.

---

### Une VM peut-elle être reliée à plusieurs VPC ?

Oui. Cochez plusieurs VPC, et un ou plusieurs sous-réseaux dans chacun, dans la section **Réseaux VPC (Secondaires)**. Chaque sous-réseau ajoute une interface réseau à la VM.

---

### Quelles plages d'adresses puis-je utiliser ?

Des plages IPv4 privées : `10.0.0.0/8`, `172.16.0.0/12` ou `192.168.0.0/16`, sans chevaucher un autre sous-réseau du même VPC ni les plages réservées `10.244.0.0/16` et `10.96.0.0/12`. Nous recommandons des `/24` dans `172.16.0.0/12`. Voir [Concepts](./concepts.md#plages-dadresses).

---

### Deux VPC peuvent-ils utiliser la même plage ?

Oui : les VPC sont isolés, leurs plages peuvent se recouvrir. Seuls les sous-réseaux d'un même VPC doivent être disjoints.

---

### Puis-je relier deux VPC entre eux ?

L'interconnexion de VPC (*peering*) et les routes statiques ne sont pas proposées dans la console ; contactez le [support](mailto:support@hidora.io).

---

### Puis-je modifier un VPC ou un sous-réseau ?

Non. Vous pouvez ajouter des sous-réseaux à un VPC et supprimer ceux qui ne sont plus utilisés. Pour changer une plage, créez un nouveau sous-réseau et migrez-y les VM (voir [Gérer les sous-réseaux](./how-to/manage-subnets.md)).

---

### Mes clusters Kubernetes ou bases de données peuvent-ils rejoindre un VPC ?

Pas depuis la console : la section **Réseaux VPC (Secondaires)** n'existe que pour les instances VM.

---

### Le pare-feu de la VM s'applique-t-il au trafic VPC ?

Non. Le pare-feu Hikube (**Activer le Pare-feu**, **Ports Autorisés**) ne filtre que le trafic qui arrive par l'IP publique de la VM. Le trafic entre VM d'un VPC n'est pas filtré, quels que soient les ports autorisés : configurez pour cela un pare-feu dans l'OS (ufw, firewalld, nftables).

---

### Pourquoi ne puis-je pas supprimer mon VPC ?

Une VM y est encore reliée : la console affiche **Suppression impossible** avec le nom des VM. Détachez-les (**Modifier** > **Réseau & Sécurité**) ou supprimez-les, puis réessayez.

---

### Combien de sous-réseaux puis-je créer ?

L'assistant **Créer un VPC** accepte jusqu'à dix sous-réseaux. D'autres peuvent être ajoutés ensuite avec **Créer un sous-réseau**, tant que leurs plages ne se chevauchent pas.
