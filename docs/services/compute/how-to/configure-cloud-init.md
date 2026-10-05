---
title: "Comment configurer cloud-init"
---

# Comment configurer cloud-init

cloud-init est le standard d'initialisation automatique des VM : création d'utilisateurs, installation de paquets, écriture de fichiers, exécution de commandes. Dans la console Hikube, le script cloud-init se saisit dans le champ **Script Cloud-Init (User Data)**.

## Prérequis

- Un compte Hikube et un projet
- Une image **Linux** : le champ cloud-init n'est pas proposé pour les images Windows
- Connaissance de base du format **YAML**

## Étapes

### 1. Saisir le script à la création

1. Ouvrez **Infrastructure** > **Instances VM** > **Créer une Instance** et renseignez les étapes **Général**, **Configuration** et **Stockage**.
2. À l'étape **Réseau**, section **Initialisation & Accès**, activez l'interrupteur **Script Cloud-Init (User Data)**.
3. Saisissez votre configuration dans la zone de texte. Elle doit commencer par `#cloud-config`.
4. Terminez l'assistant et cliquez sur **Déployer**.

Les clés saisies dans **Clés SSH autorisées** sont injectées par la plateforme : inutile de les répéter dans le script pour l'utilisateur par défaut.

### 2. Exemples

#### Utilisateur supplémentaire avec sudo

```yaml title="user-data.yaml"
#cloud-config
users:
  - default
  - name: deployer
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: sudo
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-ed25519 AAAA... deployer@ci
```

L'entrée `default` conserve l'utilisateur par défaut de l'image (par exemple `ubuntu`).

#### Paquets installés au démarrage

```yaml title="user-data.yaml"
#cloud-config
package_update: true
package_upgrade: true
packages:
  - htop
  - curl
  - git
  - docker.io
```

#### Commandes au démarrage

```yaml title="user-data.yaml"
#cloud-config
runcmd:
  - mkdir -p /opt/app
  - echo "VM initialisée le $(date)" > /opt/app/init.log
  - systemctl enable --now docker
```

#### Serveur web

Autorisez aussi les ports **HTTP (80)** et **HTTPS (443)** à l'étape **Réseau**.

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
write_files:
  - path: /var/www/html/index.html
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Hikube VM</title></head>
      <body><h1>VM opérationnelle</h1></body>
      </html>
runcmd:
  - systemctl enable --now nginx
```

### 3. Modifier le script d'une VM existante

1. Ouvrez la page de détail de la VM et cliquez sur **Modifier**.
2. Dans **Configuration avancée**, modifiez **Script Cloud-Init (User Data)**.
3. Cliquez sur **Enregistrer**.

Le nouveau script est enregistré, sans redémarrage de la VM, mais il n'est pas rejoué automatiquement : passez à l'étape suivante.

### 4. Rejouer le script

1. Sur une VM au statut **Actif**, cliquez sur **Recharger UserData**, depuis la section **Actions** de la page de détail ou depuis le menu **Actions** de la liste. La console affiche **Le rechargement du UserData a été initié.**
2. Le rechargement ne redémarre pas la VM : le script est rejoué au démarrage suivant. Cliquez sur **Redémarrer** pour l'appliquer tout de suite.

Au redémarrage, cloud-init traite la VM comme une nouvelle instance : il réexécute tout le script (`runcmd`, `write_files`, `packages`…) et régénère les clés d'hôte SSH. Votre client SSH signale alors un changement de clé d'hôte ; supprimez l'ancienne entrée avec `ssh-keygen -R <ip-publique>`.

Lorsque vous modifiez les **Clés SSH** d'une VM, la console propose directement ce rechargement dans la boîte **Clés SSH modifiées** : **Reload user-data** ou **Ne pas reloader user-data**.

:::warning Effets d'un rechargement
Un rechargement suivi d'un redémarrage fait réexécuter tout le script cloud-init par la VM. Écrivez des scripts idempotents (sans effet indésirable s'ils sont exécutés plusieurs fois), en particulier pour `runcmd` et `write_files`.
:::

## Vérification

Connectez-vous à la VM et vérifiez l'état de cloud-init :

```bash
cloud-init status
```

**Résultat attendu :**

```
status: done
```

Consultez le journal en cas de problème :

```bash
sudo cat /var/log/cloud-init-output.log
```

Vérifiez la syntaxe d'un script avant de l'envoyer (sur une machine où cloud-init est installé) :

```bash
cloud-init schema --config-file user-data.yaml
```

Le script enregistré est visible à tout moment sur la page de détail, section **Configuration avancée** > **Cloud-Init User Data**.

## Pour aller plus loin

- [Installer CUDA via cloud-init](./install-cuda-drivers.md)
- [Démarrage rapide VM](../quick-start.md)
- [Documentation cloud-init](https://cloudinit.readthedocs.io/)
