---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Créer votre première machine virtuelle

Ce guide vous accompagne dans la création d'une VM Ubuntu depuis la [console Hikube](https://console.hikube.cloud), jusqu'à la première connexion SSH.

---

## Objectif

À la fin de ce guide, vous aurez :

- une VM Ubuntu en statut **Actif** ;
- une IP publique avec le port 22 ouvert ;
- un accès SSH par clé ;
- un disque système répliqué.

---

## Prérequis

- Un compte Hikube et un **projet** (voir [Démarrage rapide Hikube](../../getting-started/quick-start.md)).
- Des quotas disponibles dans ce projet : au moins 4 vCPU, 16 Go de mémoire et 20 Go de stockage pour l'exemple ci-dessous.
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`
- Une paire de clés SSH. Si vous n'en avez pas :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm
cat ~/.ssh/hikube-vm.pub
```

Gardez la clé publique affichée (ligne commençant par `ssh-ed25519`) : vous la collerez dans l'assistant.

---

## Étape 1 : Ouvrir l'assistant de création

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à [https://console.hikube.cloud](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** > **Instances VM**.
3. Cliquez sur **Créer une Instance**.

L'assistant **Créer une nouvelle instance** s'ouvre. Il comporte cinq étapes : **Général**, **Configuration**, **Stockage**, **Réseau** et **Vérification**.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Consultez d'abord les catalogues, qui ne demandent qu'une clé valide :

```bash
# Types d'instance (gabarits CPU / RAM)
curl -sS "$HIKUBE_API/instance/v1alpha1/instance-types" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.instanceTypes[] | "\(.name)\t\(.vcpu) vCPU\t\(.ram) Go"'

# Images système : chaque distribution et ses versions
curl -sS "$HIKUBE_API/instance/v1alpha1/cloud-images" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.images[] | {name, versions, minSizeGib}'
```

L'image se désigne par `<distribution>-<version>`, par exemple `ubuntu-24.04`. La série **Universel (U)**, taille **XLARGE**, correspond au type `u1.xlarge` (4 vCPU, 16 Go).

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### Général

Saisissez le **Nom de l'instance**, par exemple `vm-demo`. Le nom doit faire 3 à 16 caractères, commencer par une lettre, se terminer par une lettre ou un chiffre, et ne contenir que des minuscules, des chiffres et des tirets. Cliquez sur **Suivant**.

### Configuration

1. Sous **Ressources (CPU / RAM)**, choisissez la série **Universel (U)**, puis la taille **XLARGE** (4 vCPU, 16 Go).
2. Laissez la section **Accélération Matérielle (GPU)** vide (voir [GPU](../gpu/overview.md) pour une VM avec GPU).
3. Laissez **Redémarrage Automatique** désactivé ou activez-le selon votre besoin.
4. Cliquez sur **Suivant**.

![Assistant de création de VM, étape Configuration : type d'instance et GPU](/img/console/compute/wizard-configuration.fr.png)


Le bandeau en haut de l'étape affiche le coût estimé et la consommation de quota du projet.

### Stockage

Le **Disque Système (Boot)** est pré-rempli : il porte le nom de la VM et mesure 20 Go.

1. Sous **Système d'exploitation**, sélectionnez la carte **ubuntu** et la version **24.04**.
2. Conservez **Taille (Go)** à `20`.
3. Conservez **Réplication Asynchrone** (Recommandé).
4. Activez **Chiffrement du disque** si vous voulez chiffrer les données au repos.
5. Cliquez sur **Suivant**.

### Réseau

1. Vérifiez que **Adresse IPv4 Publique** est activée.
2. Vérifiez que **Activer le Pare-feu** est coché et que **SSH (22)** est sélectionné dans **Ports Autorisés**.
3. Sous **Clés SSH autorisées**, collez votre clé publique dans le champ **Ajouter une clé SSH publique**, puis validez avec Entrée ou le bouton d'ajout. Le format attendu est `<algorithme> <clé-base64> [commentaire]`.
4. Cliquez sur **Suivant**.

### Vérification

Le **Récapitulatif** reprend l'instance, le stockage et la section **Réseau & Sécurité** (IP publique, pare-feu, ports ouverts, clés SSH). Cliquez sur **Déployer**.

La console affiche **Instance créée** et revient à la liste des instances.

</TabItem>
<TabItem value="api" label="API">

Créez la VM avec `POST /instance/v1alpha1/projects/{projectId}/instances`. L'exemple reprend la configuration de l'onglet Console et lit la clé publique SSH depuis votre fichier :

```bash
jq -n --arg key "$(cat ~/.ssh/hikube-vm.pub)" '{
  name: "vmdemo",
  instanceType: "u1.xlarge",
  image: "ubuntu-24.04",
  disks: [
    {name: "vmdemo", size: 20, asyncReplication: true, encrypted: false}
  ],
  network: {
    publicIpv4: true,
    firewall: {enabled: true, allowedInboundPorts: [22]}
  },
  sshKeys: [$key],
  automaticRestart: false
}' > vm.json

curl -sS -X POST "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vm.json
```

- `name` : 16 caractères maximum, en minuscules ; ce nom identifie la VM dans les chemins de l'API ;
- `disks` : le disque système est **le premier** de la liste ; il reçoit l'image `image`. `size` va de 20 à 4096 Go ; `asyncReplication: true` correspond à **Réplication Asynchrone** ;
- `network.firewall.allowedInboundPorts` : ports ouverts sur l'IP publique ;
- `sshKeys` : au moins une clé, au format `<algorithme> <clé-base64> [commentaire]` ;
- `gpus` (facultatif) : modèles de GPU, à choisir dans `GET /gpu/v1alpha1/gpus`.

La réponse décrit la VM créée, avec son `id` et son `status`.

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Dans la liste **Instances VM**, la VM passe de **En création** à **Actif**. La mise à jour est automatique, sans recharger la page.

Cliquez sur le nom de la VM pour ouvrir sa page de détail. Vous y trouvez :

- **Ressources & Caractéristiques** : type d'instance, image système, utilisateur par défaut, vCPU et RAM ;
- **Stockage & Disques** : disques attachés, taille, réplication, chiffrement ;
- **Réseau et Sécurité** : **IP Publique**, **Connexion SSH**, **Adresses IP**, **Pare-feu & Ports**.

**Résultat attendu :** statut **Actif**, **IP Publique** à **Active**, port **22** listé sous **Pare-feu & Ports**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/vmdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, running, reason, instanceType, image, disks, network}'
```

**Résultat attendu :** `status` passe de `provisioning` à `starting`, puis `running` (**Actif** dans la console), et `running` vaut `true`. Les autres valeurs possibles sont `stopping`, `stopped`, `paused`, `migrating`, `error` et `unknown` ; en cas d'erreur, `reason` en donne la cause. `network.firewall.allowedInboundPorts` contient `22`.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les informations de connexion

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Dans la section **Réseau et Sécurité** de la page de détail, le bloc **Connexion SSH** affiche la commande prête à l'emploi, par exemple :

```bash
ssh ubuntu@203.0.113.10
```

Cliquez sur l'icône de copie pour la copier dans le presse-papier. L'utilisateur par défaut dépend de l'image ; c'est celui qui figure dans la commande SSH.

![Page de détail d'une VM : carte Réseau et Sécurité avec la commande SSH](/img/console/compute/vm-detail-network.fr.png)

</TabItem>
<TabItem value="api" label="API">

L'utilisateur par défaut et les adresses de la VM figurent dans sa description :

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/vmdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{defaultUser, ips: .network.ips}'
```

`defaultUser` dépend de l'image (`ubuntu` ici ; vide pour une image importée). `network.ips` liste les adresses de la VM, dont l'IP publique une fois allouée : c'est elle qu'il faut utiliser dans la commande SSH, par exemple `ssh ubuntu@203.0.113.10`.

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

Connectez-vous avec votre clé privée :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@203.0.113.10
```

Une fois connecté, vérifiez les ressources et le disque :

```bash
nproc
free -h
lsblk
```

**Résultat attendu :** 4 processeurs, environ 16 Go de mémoire et un disque `vda` d'environ 20 Go.

---

## Étape 6 : Dépannage rapide

| Symptôme | Vérification |
|----------|--------------|
| **Suivant** reste grisé à l'étape Configuration ou Stockage | Un quota du projet est dépassé : réduisez le gabarit ou la taille du disque, ou faites augmenter les quotas du projet. |
| `Connection timed out` en SSH | Vérifiez sur la page de détail que **IP Publique** est **Active** et que le port 22 figure dans **Pare-feu & Ports**. |
| `Permission denied (publickey)` | Vérifiez l'utilisateur (bloc **Connexion SSH**) et que la clé privée utilisée correspond à la clé publique listée dans **Configuration avancée** > **Clés SSH**. |
| Statut **Erreur** ou **Échec** | Consultez le [dépannage](./troubleshooting.md). |

---

## Étape 7 : Nettoyage

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Ouvrez la page de détail de la VM, ou le menu **Actions** de la ligne dans la liste.
2. Cliquez sur **Supprimer**.
3. Saisissez le nom exact de la VM pour confirmer, puis cliquez sur **Supprimer définitivement**.

Le disque système est détaché mais **pas supprimé** : il reste dans le menu **Disques** et continue de consommer du quota de stockage. Supprimez-le depuis **Disques** si vous n'en avez plus besoin (voir [Disques](../storage/disks/overview.md)).

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances/vmdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la suppression. Comme dans la console, le disque système est détaché mais **pas supprimé**. Supprimez-le s'il ne sert plus :

```bash
curl -sS -X DELETE "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks/vmdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

</TabItem>
</Tabs>

:::warning Suppression irréversible
La suppression d'une VM, puis celle de ses disques, est définitive. Sauvegardez les données importantes avant.
:::

---

## Prochaines étapes

- [Attacher un disque de données](./how-to/attach-extra-disk.md)
- [Configurer cloud-init](./how-to/configure-cloud-init.md)
- [Configurer le réseau et le pare-feu](./how-to/configure-network.md)
- [Relier la VM à un réseau privé (VPC)](../networking/quick-start.md)

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/attach-extra-disk"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
