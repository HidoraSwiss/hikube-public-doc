---
title: "Comment résoudre le DNS .local dans les VMs"
---

# Comment résoudre le DNS .local dans les VMs

Les VM Hikube basées sur Debian ou Ubuntu utilisent `systemd-resolved` pour la résolution DNS. Or le domaine DNS interne de la plateforme se termine en `.local` (`cozy.local`), et `systemd-resolved` refuse par défaut les requêtes `*.local` car ce TLD est réservé au protocole mDNS (RFC 6762). Ce guide explique comment corriger ce comportement dans l'OS de la VM.

## Prérequis

- Une VM Hikube basée sur Debian ou Ubuntu
- Un accès **SSH** à la VM (commande du bloc **Connexion SSH** de la page de détail)
- Droits **root** ou **sudo**

## Étapes

### 1. Diagnostiquer le problème

Connectez-vous à la VM :

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-publique>
```

Vérifiez la configuration DNS actuelle :

```bash
resolvectl status
```

Repérez la section de l'interface réseau principale (souvent `enp1s0`). Elle ne contient ni domaine de recherche ni domaine de routage.

Testez la résolution d'un nom en `.local` :

```bash
dig mon-service.cozy.local
```

**Résultat typique du problème :**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Le statut `REFUSED` confirme que `systemd-resolved` envoie la requête `.local` vers mDNS au lieu du serveur DNS unicast.

**Cause racine** : le DHCP de la plateforme fournit un serveur DNS mais pas de domaine de recherche. Sans domaine de routage `~local`, `systemd-resolved` applique le RFC 6762 et route `.local` vers mDNS.

### 2. Créer le drop-in systemd-networkd

:::warning Ne pas utiliser netplan
Netplan ne gère pas les domaines de routage (préfixe `~`). Utilisez directement un drop-in `systemd-networkd`.
:::

Repérez le nom du fichier réseau généré pour l'interface :

```bash
networkctl status enp1s0 | grep "Network File"
```

Créez le répertoire du drop-in correspondant (ici pour `10-netplan-enp1s0.network`) :

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Créez le fichier de configuration :

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=cozy.local ~local ~.
EOF
```

**Domaines configurés :**

| Domaine | Rôle |
|---------|------|
| `cozy.local` | Domaine de recherche : permet de résoudre un nom relatif à `cozy.local` |
| `~local` | Domaine de routage : force `.local` vers le DNS unicast au lieu de mDNS |
| `~.` | Domaine de routage : fait de cette interface la route DNS par défaut (sans lui, la résolution externe cesse de fonctionner) |

:::note Domaines de recherche supplémentaires
Si l'on vous a communiqué un domaine interne plus précis (par exemple `<espace>.svc.cozy.local`), ajoutez-le en tête de la ligne `Domains=` pour pouvoir utiliser des noms courts. En cas de doute sur le domaine à utiliser, contactez le [support](mailto:support@hidora.io).
:::

### 3. Appliquer la configuration

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Vérifier la configuration

```bash
resolvectl status
```

La section de l'interface doit lister les domaines :

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    cozy.local
```

## Vérification

Testez la résolution d'un nom `.local` complet :

```bash
dig mon-service.cozy.local
```

**Résultat attendu :** statut `NOERROR` (ou `NXDOMAIN` si le nom n'existe pas), et non plus `REFUSED`.

Vérifiez que la résolution externe fonctionne toujours :

```bash
dig example.com
```

:::tip Persistance
Le drop-in est lu par `systemd-networkd` à chaque démarrage : la correction survit aux redémarrages.
:::

:::tip Automatiser avec cloud-init
Pour appliquer la correction dès la création, ajoutez-la au **Script Cloud-Init (User Data)** :

```yaml title="user-data.yaml"
#cloud-config
write_files:
  - path: /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf
    content: |
      [Network]
      Domains=cozy.local ~local ~.
runcmd:
  - systemctl restart systemd-networkd systemd-resolved
```
:::

## Pour aller plus loin

- [Configurer cloud-init](./configure-cloud-init.md)
- [Dépannage](../troubleshooting.md)
