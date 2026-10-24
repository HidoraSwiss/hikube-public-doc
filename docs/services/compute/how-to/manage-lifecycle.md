---
title: "Comment démarrer, arrêter, modifier et supprimer une VM"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment démarrer, arrêter, modifier et supprimer une VM

Ce guide regroupe les actions courantes sur une VM existante depuis la console : démarrage, arrêt, redémarrage, modification des ressources et suppression.

## Prérequis

- Un compte Hikube et un projet
- Une VM existante dans **Infrastructure** > **Instances VM**
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Où trouver les actions

| Emplacement | Actions disponibles |
|-------------|---------------------|
| Liste **Instances VM**, menu **Actions** (⋯) d'une ligne | **Voir les détails**, **Démarrer**, **Arrêter**, **Redémarrer**, **Recharger UserData**, **Éditer**, **Supprimer** |
| Page de détail, en-tête | **Modifier**, **Supprimer** |
| Page de détail, section **Actions** | **Démarrer** (VM arrêtée), **Arrêter** et **Redémarrer** (VM active), **Recharger UserData** (VM active) |

La liste propose aussi une recherche (**Rechercher des instances...**) et un filtre par statut (**Tous les statuts**, **Actif**, **Arrêté**).

## Étapes

### 1. Arrêter une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Cliquez sur **Arrêter**.
2. Confirmez dans la boîte **Arrêter la machine virtuelle ?** : les services hébergés sont interrompus jusqu'au redémarrage.

Le statut passe à **Arrêt en cours**, puis **Arrêté**.

:::warning VM avec GPU
L'arrêt libère le GPU, qui peut être attribué à un autre workload. Vous risquez de ne pas pouvoir redémarrer la VM immédiatement si aucun GPU n'est disponible ensuite. Voir [GPU indisponible au démarrage](../troubleshooting.md#gpu-indisponible-au-démarrage).
:::

</TabItem>
<TabItem value="api" label="API">

```bash
VM=vmdemo   # nom de votre VM

curl -sS -X PUT "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM/stop" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la demande. La description de la VM (`GET .../instances/$VM`) renvoie ensuite `"status": "stopping"`, puis `"stopped"`.

:::warning VM avec GPU
L'arrêt libère le GPU, qui peut être attribué à un autre workload. Vous risquez de ne pas pouvoir redémarrer la VM immédiatement si aucun GPU n'est disponible ensuite. Voir [GPU indisponible au démarrage](../troubleshooting.md#gpu-indisponible-au-démarrage).
:::

</TabItem>
</Tabs>

### 2. Démarrer une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Cliquez sur **Démarrer**. Le statut passe à **Démarrage en cours**, puis **Actif**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PUT "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM/start" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Le statut passe à `starting`, puis `running`.

</TabItem>
</Tabs>

### 3. Redémarrer une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Cliquez sur **Redémarrer** et confirmez dans **Redémarrer la machine virtuelle ?**. Les applications sont temporairement indisponibles. Le statut passe par **Redémarrage en cours**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PUT "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM/restart" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Pour réappliquer le script cloud-init d'une VM active (action **Recharger UserData** de la console) :

```bash
curl -sS -X PUT "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM/reload-userdata" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

</TabItem>
</Tabs>

### 4. Modifier une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Sur la page de détail, cliquez sur **Modifier** (ou **Éditer** dans le menu **Actions** de la liste, disponible seulement pour une VM **Actif**).
2. Modifiez les sections voulues :
   - **Ressources (CPU / RAM)** : série et taille, GPU ;
   - **Stockage** : ajout de disques, détachement de disques de données ;
   - **Réseau & Sécurité** : IP publique, pare-feu, ports, VPC ;
   - **Configuration avancée** : clés SSH, script cloud-init, **Redémarrage Automatique**.
3. Vérifiez le récapitulatif de quota en haut de page et cliquez sur **Enregistrer**.

Si le type d'instance, les disques ou les GPU changent, la console affiche **Redémarrage requis** : ces modifications ne prennent effet qu'au prochain redémarrage de la VM. Cliquez sur **Redémarrer** pour les appliquer. Sinon, elle affiche **Instance mise à jour**.

Si l'enregistrement est refusé, la console affiche **Formulaire incomplet** et nomme les champs en erreur.

Le nom et l'image système ne sont pas modifiables.

Dans la section **Stockage**, les disques que la VM possède déjà s'affichent en lecture seule (**Nom du volume**, **Taille (Go)**) :

- le **Disque Système (Boot)** n'a aucune action ; la console l'explique : « Le disque système d'une VM existante ne se remplace pas : la VM démarre dessus. » ;
- un disque de données ne propose que **Détacher le disque** ;
- le choix **Nouveau** / **Existant** n'apparaît que sur les disques ajoutés avec **Ajouter un disque**.

Pour agrandir un disque, passez par sa page dans le menu **Disques** (voir [Redimensionner un disque](../../storage/disks/how-to/resize.md)).

Pour faire démarrer la VM sur un autre disque système, supprimez la VM : ses disques sont détachés et conservés dans le menu **Disques**. Recréez-la ensuite avec l'assistant, en choisissant **Existant** sur le **Disque Système (Boot)** puis le disque voulu ; rattachez de la même façon ses disques de données.

</TabItem>
<TabItem value="api" label="API">

La modification passe par `PATCH /instance/v1alpha1/projects/{projectId}/instances/{name}`, une [mise à jour partielle](../../../api/overview.md#mises-a-jour-partielles) : seuls les champs envoyés changent. Règles propres aux VM :

- `disks`, s'il est envoyé, **remplace** la liste actuelle : un disque absent est détaché (pas supprimé), un nouveau nom crée un disque (avec `size`), et le disque système doit rester en première position : une modification qui le remplace, le retire ou le déplace est refusée (code `20208`) ;
- `network` se modifie champ par champ : `{"network": {"publicIpv4": true}}` garde le pare-feu et les VPC ;
- une liste envoyée remplace la liste actuelle, et `[]` la vide : `gpus`, `sshKeys`, `network.vpcs`, `network.firewall.allowedInboundPorts` ;
- `userData: ""` retire les données utilisateur d'une VM Linux ; sur une VM Windows, elles sont générées par la plateforme et ne se modifient pas.

Exemple : passer la VM en `u1.2xlarge` :

```bash
curl -sS -X PATCH "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceType": "u1.2xlarge"}'
```

Comme dans la console, un changement de type d'instance, de disques ou de GPU ne prend effet qu'au prochain redémarrage de la VM. Relisez la VM : `restartRequired` vaut `true` tant qu'un redémarrage est en attente ; appliquez-le avec `PUT /instance/v1alpha1/projects/{projectId}/instances/{name}/restart`. Le nom et l'image système ne sont pas modifiables.

</TabItem>
</Tabs>

### 5. Supprimer une VM

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Cliquez sur **Supprimer**.
2. Saisissez le nom exact de la VM, puis cliquez sur **Supprimer définitivement**.

Les disques de la VM sont détachés et restent dans le menu **Disques**, où vous pouvez les rattacher à une autre VM ou les supprimer (voir [Disques](../../storage/disks/overview.md)).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/$VM" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Les disques de la VM sont détachés et restent disponibles : `GET /disk/v1alpha1/projects/{projectId}/disks` les liste avec le statut `ready` (voir [Disques](../../storage/disks/overview.md)).

</TabItem>
</Tabs>

## Vérification

Le statut affiché dans la liste et sur la page de détail se met à jour sans recharger la page. Les compteurs en haut de la liste (**Instances Actives**, **Instances arrêtées**, **CPU Total**, **RAM Total**) reflètent les changements.

## Pour aller plus loin

- [Concepts : cycle de vie](../concepts.md#cycle-de-vie)
- [Dépannage](../troubleshooting.md)
