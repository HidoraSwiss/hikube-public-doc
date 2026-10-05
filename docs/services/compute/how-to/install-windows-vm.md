---
title: "Comment créer une VM Windows"
---

# Comment créer une VM Windows

La console Hikube propose des images **Windows Server** prêtes à l'emploi. Ce guide explique comment créer une VM Windows Server, récupérer le mot de passe administrateur généré et vous connecter en RDP.

## Prérequis

- Un compte Hikube et un projet avec au moins 4 vCPU, 16 Go de mémoire et 50 Go de stockage disponibles
- Un client RDP (Connexion Bureau à distance sous Windows, Windows App sous macOS, `xfreerdp` ou Remmina sous Linux)
- Un gestionnaire de mots de passe pour conserver le mot de passe administrateur

## Étapes

### 1. Lancer l'assistant

Ouvrez **Infrastructure** > **Instances VM** et cliquez sur **Créer une Instance**. À l'étape **Général**, saisissez le **Nom de l'instance** (par exemple `win-srv01`), puis **Suivant**.

### 2. Choisir le gabarit

À l'étape **Configuration**, choisissez au moins **Universel (U)** > **XLARGE** (4 vCPU, 16 Go). Cliquez sur **Suivant**.

:::note Licence Windows
La licence Windows est facturée en fonction du nombre de vCPU. Elle est incluse dans le coût estimé affiché en haut de l'assistant.
:::

### 3. Choisir l'image et le disque système

À l'étape **Stockage** :

1. Sous **Système d'exploitation**, sélectionnez la carte **windows-server** et la version **2022** ou **2025**.
2. Portez **Taille (Go)** à au moins `50` : c'est le minimum pour Windows (message **Min. 50 Go requis** en dessous).
3. Choisissez le **Type de réplication** et, si besoin, activez **Chiffrement du disque**.
4. Cliquez sur **Suivant**.

### 4. Ouvrir le port RDP

À l'étape **Réseau** :

1. Laissez **Adresse IPv4 Publique** activée et **Activer le Pare-feu** coché.
2. Dans **Port personnalisé...**, saisissez `3389` et cliquez sur le bouton d'ajout.
3. Décochez **SSH (22)** si vous n'utilisez pas OpenSSH sur le serveur.

Le champ **Script Cloud-Init (User Data)** n'est pas proposé pour Windows.

### 5. Déployer et copier le mot de passe

À l'étape **Vérification**, cliquez sur **Déployer**. La boîte **Identifiants de l'instance Windows** s'ouvre et affiche :

- **Nom d'utilisateur par défaut** ;
- **Mot de passe Administrateur**.

Copiez les deux valeurs avec les boutons de copie et enregistrez-les dans votre gestionnaire de mots de passe, puis cliquez sur **J'ai copié le mot de passe et je continue**.

:::warning Mot de passe affiché une seule fois
Le mot de passe est généré à la création et **ne sera plus affiché**. Si vous le perdez, il n'est pas récupérable depuis la console.
:::

### 6. Attendre le démarrage

Dans la liste **Instances VM**, attendez le statut **Actif**. Le premier démarrage de Windows (initialisation et configuration) prend plusieurs minutes de plus qu'une VM Linux : patientez avant la première connexion RDP.

### 7. Se connecter en RDP

Relevez l'adresse IP publique sur la page de détail : elle figure dans le bloc **Connexion SSH** de la section **Réseau et Sécurité**. Connectez-vous ensuite :

```bash
# Linux
xfreerdp /v:<ip-publique> /u:<nom-utilisateur>
```

Sous Windows ou macOS, ajoutez un PC avec l'adresse `<ip-publique>` dans votre client Bureau à distance et utilisez les identifiants copiés à l'étape 5.

## Vérification

Testez l'ouverture du port RDP depuis votre poste :

```bash
nc -zv -w 5 <ip-publique> 3389
```

**Résultat attendu :** `Connection to <ip-publique> 3389 port [tcp/ms-wbt-server] succeeded!`

Une fois connecté, changez le mot de passe et appliquez les mises à jour Windows.

:::note Installation depuis votre propre ISO
L'installation de Windows depuis une ISO personnalisée nécessite un accès console graphique (VNC) pendant l'installation. Cette option n'est pas proposée dans la console ; contactez le [support](mailto:support@hidora.io).
:::

## Pour aller plus loin

- [Configurer le réseau et le pare-feu](./configure-network.md)
- [Attacher un disque supplémentaire](./attach-extra-disk.md)
