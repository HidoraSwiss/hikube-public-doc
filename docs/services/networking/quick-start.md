---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Créer un VPC et y relier deux VM

Ce guide crée un VPC avec un sous-réseau depuis la [console Hikube](https://console.hikube.cloud), y relie deux VM et vérifie qu'elles communiquent par leurs adresses privées.

---

## Prérequis

- Un compte Hikube et un **projet** (voir [Démarrage rapide Hikube](../../getting-started/quick-start.md)).
- Deux VM Linux dans ce projet, dont au moins une accessible en SSH (voir [Créer votre première VM](../compute/quick-start.md)). Vous pouvez aussi les créer pendant ce guide.
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Ouvrir l'assistant de création de VPC

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans le menu latéral, ouvrez **Infrastructure** > **Réseau**. La page **Virtual Private Clouds** liste les VPC du projet.
2. Cliquez sur **Créer un VPC**.

L'assistant **Créer un VPC** comporte trois étapes : **Général**, **Sous-réseaux** et **Vérification**.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Listez les VPC du projet pour vérifier l'accès :

```bash
curl -sS "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

**Résultat attendu :** un objet JSON `{"totalCount": ..., "vpcs": [...]}`.

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### Général

Saisissez le **Nom du VPC**, par exemple `vpc-demo` (3 à 16 caractères : minuscules, chiffres et tirets, commençant par une lettre). Cliquez sur **Suivant**.

### Sous-réseaux

Un sous-réseau est pré-rempli avec la **Plage CIDR** `172.16.0.0/24`.

1. **Nom** : remplacez le nom généré par `app`.
2. **Plage CIDR** : conservez `172.16.0.0/24`.
3. Optionnel : **Ajouter un sous-réseau** pour en créer d'autres (par exemple `db` en `172.16.1.0/24`), jusqu'à dix.
4. Cliquez sur **Suivant**.

### Vérification

Le **Résumé de la configuration** reprend le **Nom du VPC** et ses **Sous-réseaux**. Cliquez sur **Créer le VPC**.

La console affiche **VPC créé** et revient à la liste.

</TabItem>
<TabItem value="api" label="API">

Le VPC et ses sous-réseaux se créent en deux requêtes. Créez d'abord le VPC :

```bash
curl -sS -X POST "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "vpcdemo"}'
```

`name` : 3 à 16 caractères, en minuscules ; ce nom identifie le VPC dans les chemins de l'API.

Ajoutez ensuite le sous-réseau `app` :

```bash
curl -sS -X POST "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs/vpcdemo/subnets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"subnetName": "app", "cidr": "172.16.0.0/24"}'
```

Répétez la requête pour d'autres sous-réseaux, par exemple `db` en `172.16.1.0/24`. Un sous-réseau ne doit chevaucher ni un autre sous-réseau du VPC ni une plage réservée.

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Dans la liste des VPC, le statut de `vpc-demo` (colonne **État** en vue tableau) doit passer de **En cours de provisionnement** à **Prêt**.

Ouvrez le menu **Actions** du VPC et cliquez sur **Voir les sous-réseaux** : la page **Sous-réseaux pour vpc-demo** liste `app` avec son **Bloc CIDR** `172.16.0.0/24`.

**Résultat attendu :** VPC **Prêt**, sous-réseau `app` listé.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs/vpcdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status}'

curl -sS "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs/vpcdemo/subnets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

**Résultat attendu :** `status` passe de `provisioning` à `ready`, et la liste des sous-réseaux contient `{"subnetName": "app", "cidr": "172.16.0.0/24"}`.

</TabItem>
</Tabs>

---

## Étape 4 : Relier les VM au sous-réseau

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Pour chacune des deux VM :

1. Ouvrez **Instances VM**, cliquez sur la VM puis sur **Modifier**.
2. Dans **Réseau & Sécurité**, sous **Réseaux VPC (Secondaires)**, cochez `vpc-demo`.
3. Sous **Sous-réseaux**, cochez `app`.
4. Cliquez sur **Enregistrer**.

Pour une nouvelle VM, faites la même sélection à l'étape **Réseau** de l'assistant **Créer une Instance**.

Sur la page de détail de chaque VM, section **Réseau et Sécurité** :

- **Réseaux VPC** affiche `vpc-demo` et `app (172.16.0.0/24)` ;
- **Adresses IP** affiche une adresse **Secondaire** dans `172.16.0.0/24`. Notez celle de la seconde VM.

</TabItem>
<TabItem value="api" label="API">

Une VM se relie à un sous-réseau en modifiant la VM (`PATCH /instance/v1alpha1/projects/{projectId}/instances/{name}`). `instanceType` et `disks` sont obligatoires ; si vous envoyez `network`, reprenez `publicIpv4` et le pare-feu actuels. Pour chacune des deux VM :

```bash
VM=vm1   # nom de la VM

curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{instanceType, disks: (.disks | map({name})),
       network: {publicIpv4: .network.publicIpv4, firewall: .network.firewall,
                 vpcs: [{name: "vpcdemo", subnets: ["app"]}]}}' > vm-update.json

curl -sS -X PATCH "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vm-update.json
```

La liste `vpcs` remplace les connexions VPC actuelles de la VM ; chaque connexion doit nommer au moins un sous-réseau. Pour une nouvelle VM, placez le même bloc `network.vpcs` dans le corps de création.

Relevez ensuite l'adresse privée de chaque VM :

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{vpcs: .network.vpcs, ips: .network.ips}'
```

`network.ips` contient une adresse dans `172.16.0.0/24`. Notez celle de la seconde VM.

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

Connectez-vous à la première VM en SSH (commande du bloc **Connexion SSH**), puis listez ses interfaces :

```bash
ip -br addr
```

**Résultat attendu :** une interface supplémentaire apparaît (par exemple `enp2s0`), sans adresse : l'OS ne la configure pas automatiquement.

Activez DHCP sur cette interface. Exemple avec netplan (Ubuntu) :

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

**Résultat attendu :** `enp2s0` est `UP` avec une adresse en `172.16.0.x/24`, celle affichée comme **Secondaire** dans la console. Faites de même sur la seconde VM.

Testez la communication avec la seconde VM sur son adresse privée :

```bash
ping -c 3 172.16.0.11
```

Remplacez `172.16.0.11` par l'adresse **Secondaire** relevée à l'étape 4. Le ping doit répondre ; ce trafic ne passe ni par Internet ni par le pare-feu de l'IP publique.

---

## Étape 6 : Dépannage rapide

| Symptôme | Action |
|----------|--------|
| **Bloc CIDR invalide** à la création | Saisissez une plage IPv4 au format `a.b.c.d/n`, par exemple `172.16.2.0/24`. |
| Message d'erreur mentionnant un chevauchement (*overlaps*) | La plage chevauche un autre sous-réseau du VPC ou une plage réservée (`10.244.0.0/16`, `10.96.0.0/12`) : choisissez une autre plage. |
| L'interface secondaire n'a pas d'adresse dans la VM | Voir [Dépannage](./troubleshooting.md#linterface-secondaire-na-pas-dadresse-dans-la-vm). |
| Le ping ne répond pas | Vérifiez que les deux VM sont sur le **même** sous-réseau et que le pare-feu de l'OS (ufw, firewalld) autorise ICMP. |

---

## Étape 7 : Nettoyage

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Détachez les VM : **Modifier** > **Réseau & Sécurité**, décochez `vpc-demo`, puis **Enregistrer**.
2. Dans **Réseau**, ouvrez le menu **Actions** du VPC et cliquez sur **Supprimer**.
3. Saisissez le nom du VPC pour confirmer, puis cliquez sur **Supprimer définitivement**.

La suppression d'un VPC supprime aussi ses sous-réseaux. Elle est refusée tant qu'une VM y est reliée : la console affiche **Suppression impossible** avec la liste des VM concernées.

</TabItem>
<TabItem value="api" label="API">

1. Détachez les VM du VPC. Une liste `network.vpcs` vide est ignorée par l'API : à ce jour, retirer le dernier VPC d'une VM se fait depuis la console (onglet Console, étape 1). Si la VM n'est plus utile, vous pouvez aussi la supprimer.
2. Supprimez le VPC :
   ```bash
   curl -sS -X DELETE "$HIKUBE_API/network/v1alpha1/projects/$PROJECT_ID/vpcs/vpcdemo" \
     -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
   ```

La suppression d'un VPC supprime aussi ses sous-réseaux. Elle est refusée tant qu'une VM y est reliée.

</TabItem>
</Tabs>

---

## Prochaines étapes

- [Relier ou détacher une VM existante](./how-to/attach-vm-to-vpc.md)
- [Gérer les sous-réseaux](./how-to/manage-subnets.md)
- [Concepts](./concepts.md)

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/attach-vm-to-vpc"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
