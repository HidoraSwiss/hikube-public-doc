---
title: "Comment ouvrir la console d'une VM"
description: "Afficher l'écran d'une VM ou son port série depuis la console Hikube, pour dépanner une VM qui ne répond plus en SSH ou en RDP, suivre une installation ou un démarrage."
---

# Comment ouvrir la console d'une VM

L'onglet **Console** de la page d'une VM donne accès, depuis votre navigateur, à l'écran de la VM et à son port série. C'est l'équivalent d'un écran et d'un clavier branchés sur la machine : il fonctionne même quand la VM n'est plus joignable sur le réseau.

Utilisez-le pour :

- dépanner une VM qui ne répond plus en SSH ou en RDP : pare-feu interne trop strict, configuration réseau cassée, système bloqué au démarrage ;
- suivre une installation ou un démarrage, lire les messages affichés à l'écran ;
- utiliser le menu de démarrage ou le BIOS de la VM ;
- envoyer Ctrl+Alt+Suppr à une VM Windows.

Pour un travail suivi, SSH (Linux) ou RDP (Windows) restent plus confortables et plus rapides.

## Prérequis

- Une VM **Actif** dans **Infrastructure** > **Instances VM**
- Au moins le rôle **Utilisation** sur le projet (voir [Droits nécessaires](#droits))
- Pour la console série : un compte avec mot de passe dans la VM (voir [Se connecter sur le port série](#mot-de-passe))

## Étapes

### 1. Ouvrir l'onglet Console

1. Ouvrez **Infrastructure** > **Instances VM** et cliquez sur la VM.
2. Cliquez sur l'onglet **Console**, entre **Aperçu** et **Sauvegardes**.
3. Choisissez la vue :
   - **Écran (VNC)** : l'écran graphique de la VM ;
   - **Console série** : le port série de la VM, en mode texte.

L'onglet **Console** n'apparaît que lorsque la VM est en marche (ou en cours de migration). Une VM arrêtée n'a pas de console à ouvrir : démarrez-la d'abord (voir [Démarrer une VM](./manage-lifecycle.md#2-démarrer-une-vm)).

{/* Capture à ajouter : onglet Console d'une VM, vue Écran (VNC), barre d'outils visible.
    Fichiers attendus : /img/console/compute/vm-console-vnc.fr.png et .en.png */}

L'écran et le port série sont indépendants : vous pouvez ouvrir les deux en même temps, par exemple dans deux onglets du navigateur.

### 2. Utiliser l'écran

La vue **Écran (VNC)** affiche l'écran de la VM. Cliquez dans l'écran pour lui envoyer le clavier et la souris. La barre d'outils propose :

| Bouton | Effet |
|--------|-------|
| **Ctrl+Alt+Suppr** | Envoie la combinaison à la VM. Indispensable sous Windows : tapée sur votre clavier, elle est interceptée par votre propre système. |
| **Coller le presse-papiers** | Tape le texte de votre presse-papiers dans la VM (voir ci-dessous). |
| **Plein écran** | Affiche l'écran de la VM en plein écran. Maintenez Échap pour en sortir. |
| **Nouvel onglet** | Ouvre la console seule dans un nouvel onglet du navigateur. |

**Clavier.** Les touches que vous frappez sont interprétées selon la disposition de clavier configurée dans la VM, pas selon celle de votre ordinateur. Si les caractères affichés ne correspondent pas aux touches (par exemple `z` et `y` inversés), changez la disposition dans le système de la VM.

**Collage.** Il n'y a pas de presse-papiers partagé entre votre ordinateur et la VM. **Coller le presse-papiers** contourne cette limite en tapant le texte touche par touche, comme sur un clavier US :

- seuls les caractères ASCII, Entrée et Tab passent : les lettres accentuées et les autres caractères sont ignorés, et la console indique combien n'ont pas pu être tapés ;
- 4000 caractères au plus ;
- si la VM utilise une autre disposition que le clavier US, certains caractères peuvent sortir différemment.

Si le navigateur refuse l'accès au presse-papiers, une fenêtre **Coller du texte** s'ouvre : collez-y le texte, puis cliquez sur **Taper le texte**.

### 3. Utiliser le port série

La vue **Console série** affiche le port série de la VM dans un terminal. À l'ouverture, une bannière rappelle l'organisation, le projet et la VM, puis indique : « Appuyez sur Entrée pour afficher l'invite de connexion. »

{/* Capture à ajouter : onglet Console d'une VM, vue Console série, bannière et invite de connexion.
    Fichiers attendus : /img/console/compute/vm-console-serial.fr.png et .en.png */}

Appuyez sur Entrée : l'invite de connexion de la VM s'affiche, si son système en propose une sur le port série (c'est le cas des images Linux courantes). Connectez-vous avec un utilisateur de la VM et son mot de passe.

La barre d'outils propose :

| Bouton | Effet |
|--------|-------|
| **–** / **+** | Réduit ou agrandit la police du terminal. |
| **Plein écran** | Affiche le terminal en plein écran. |
| **Nouvel onglet** | Ouvre la console seule dans un nouvel onglet du navigateur. |
| **Adapter la VM à C×R** | Donne au système de la VM la taille du terminal (C colonnes, R lignes). |

**Adapter la taille.** Le port série ne transmet pas la taille de votre fenêtre : sans réglage, les programmes plein écran (`vim`, `less`, `top`) n'utilisent qu'une partie du terminal. Le bouton **Adapter la VM à C×R** tape pour vous `stty rows R cols C` dans la session. Utilisez-le **une fois connecté à un shell** : à l'invite de connexion, la commande serait prise pour un nom d'utilisateur. Recommencez après avoir changé la taille de la fenêtre ou de la police.

**Ce que le port série ne fait pas** :

- il n'a pas d'historique : seul ce que la VM écrit après l'ouverture s'affiche ;
- son débit est d'environ 40 Ko/s : une commande qui affiche beaucoup de texte défile lentement. Pour un travail suivi, préférez SSH.

#### Se connecter sur le port série {#mot-de-passe}

Le port série demande un utilisateur **et un mot de passe**. Or les images cloud n'en définissent souvent aucun : on s'y connecte par clé SSH, et l'utilisateur par défaut n'a pas de mot de passe. Dans ce cas, l'invite de connexion s'affiche mais aucun mot de passe n'est accepté.

Définissez un mot de passe **avant** d'en avoir besoin, tant que la VM est joignable :

- **depuis une session SSH** : `sudo passwd <utilisateur>` ;
- **à la création de la VM**, dans le champ **Script Cloud-Init (User Data)** (voir [Configurer cloud-init](./configure-cloud-init.md)). Par exemple, pour l'utilisateur par défaut de l'image :

```yaml title="user-data.yaml"
#cloud-config
password: "<mot-de-passe-temporaire>"
chpasswd:
  expire: true
ssh_pwauth: false
```

`expire: true` oblige à changer le mot de passe à la première connexion ; `ssh_pwauth: false` laisse SSH accessible par clé uniquement : le mot de passe ne sert que sur la console. Ne gardez pas de vrai mot de passe dans un script cloud-init : remplacez-le dès la première connexion.

## Droits nécessaires {#droits}

Ouvrir la console demande au moins le rôle **Utilisation** sur le projet : depuis la console, on peut agir sur la VM comme avec un clavier. Un membre qui n'a que le rôle **Lecture** voit la VM, mais l'ouverture de sa console est refusée avec le message « Vous n'avez pas le droit d'ouvrir cette console. »

:::info Disponibilité
La console d'une VM ne s'ouvre que depuis la console web Hikube. Elle n'est pas accessible avec une clé d'API, ni en ligne de commande.
:::

## Une seule session par console {#une-seule-session-par-console}

Chaque console d'une VM, l'écran comme le port série, n'accepte qu'une session à la fois. L'ouvrir ailleurs, dans un autre onglet ou par une autre personne, ferme la session précédente. Celle-ci affiche :

> La console a été fermée, peut-être ouverte ailleurs.

avec un bouton **Reconnecter**. Elle ne se reconnecte pas d'elle-même : cliquer sur **Reconnecter** reprend la console, et ferme à son tour la session de l'autre onglet ou de l'autre personne. Avant de reprendre une console, assurez-vous que personne d'autre n'est en train de l'utiliser.

Le bouton **Nouvel onglet** suit la même règle : la console s'ouvre dans le nouvel onglet, et l'onglet d'origine affiche « La console est ouverte dans un autre onglet. » avec un bouton **Ouvrir ici** pour la reprendre.

## Durée et reconnexions

| Situation | Ce que fait la console |
|-----------|------------------------|
| Toutes les 12 minutes environ | La connexion de sécurité est renouvelée : la session se rouvre d'elle-même, en une seconde environ. |
| Maintenance de la plateforme | Reconnexion automatique. |
| Migration de la VM vers un autre serveur | Reconnexion automatique. |
| VM arrêtée ou redémarrée depuis la console Hikube | La console affiche « L'instance n'est pas en marche. La console s'ouvrira dès qu'elle aura démarré. » et se rouvre seule quand la VM est de nouveau en marche. |
| Session ouverte depuis 8 heures | La session se ferme (« La session a atteint sa durée maximale de 8 heures. ») : cliquez sur **Reconnecter**. |

À l'écran, une reconnexion ne fait rien perdre : l'image est redessinée. Sur le port série, ce que la VM écrit pendant la seconde de reconnexion est perdu ; votre session dans la VM, elle, reste ouverte.

:::tip Voir le démarrage depuis le début
Après un **Redémarrer** depuis la console Hikube, la console se rouvre quand la VM est de nouveau en marche : les premières secondes du démarrage (menu de démarrage, BIOS) peuvent être déjà passées. Pour les voir, gardez la console ouverte et redémarrez depuis le système de la VM (`sudo reboot`, ou **Ctrl+Alt+Suppr** puis redémarrage sous Windows).
:::

## FAQ

### Rien ne s'affiche à l'écran

- L'écran de la VM est peut-être en veille : cliquez dans l'écran ou appuyez sur une touche, par exemple Maj.
- Une VM Linux sans interface graphique affiche une simple invite de connexion texte ; si elle reste noire, essayez la **Console série**.
- Si la VM vient de démarrer, son système n'a peut-être pas encore affiché quoi que ce soit : attendez quelques secondes.

### Rien ne s'affiche sur le port série

Le port série n'a pas d'historique : appuyez sur Entrée pour faire apparaître l'invite de connexion. Si rien n'apparaît, le système de la VM n'utilise peut-être pas son port série (c'est le cas de Windows et de certaines images personnalisées) : passez par **Écran (VNC)**.

### La console s'est fermée

Selon le message affiché :

- « La console a été fermée, peut-être ouverte ailleurs. » : la même console a été ouverte dans un autre onglet ou par une autre personne (voir [Une seule session par console](#une-seule-session-par-console)) ;
- « La session a atteint sa durée maximale de 8 heures. » : cliquez sur **Reconnecter** ;
- « La connexion était trop lente pour suivre l'écran : la session a été fermée. » : votre connexion Internet n'a pas suivi le débit de l'écran. Cliquez sur **Reconnecter** ; si cela se répète, fermez les applications qui chargent votre connexion ou réduisez l'activité à l'écran de la VM.

Dans les trois cas, la console ne se rouvre pas seule.

### Je n'ai pas de mot de passe pour le port série

C'est le cas le plus fréquent avec les images cloud, prévues pour une connexion par clé SSH. Définissez un mot de passe comme indiqué dans [Se connecter sur le port série](#mot-de-passe). Si la VM n'est plus joignable en SSH et n'a aucun mot de passe, la console ne permet pas de s'y connecter : corrigez la cause par le script cloud-init (**Modifier** > **Configuration avancée**, puis **Recharger UserData** et **Redémarrer**, voir [Dépannage](../troubleshooting.md)), ou contactez le [support](mailto:support@hidora.io).

### L'onglet Console n'apparaît pas

La VM n'est pas en marche : l'onglet n'est proposé que pour une VM **Actif** (ou en cours de migration). Démarrez-la, puis rouvrez sa page.

## Conditions d'utilisation

La console est un service Hikube, soumis aux [conditions générales de Hidora SA](https://hikube.cloud/terms).

## Pour aller plus loin

- [Démarrer, arrêter, modifier et supprimer une VM](./manage-lifecycle.md)
- [Configurer cloud-init](./configure-cloud-init.md)
- [Dépannage](../troubleshooting.md)
