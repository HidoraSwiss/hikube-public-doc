---
title: "Comment résoudre le DNS .local dans les VMs"
---

# Comment résoudre le DNS .local dans les VMs

Les VMs Hikube basées sur Debian ou Ubuntu utilisent `systemd-resolved` pour la résolution DNS. Or, le domaine DNS interne du cluster est `cozy.local`, et `systemd-resolved` refuse par défaut toutes les requêtes `*.local` car ce TLD est réservé au protocole mDNS (RFC 6762). Ce guide explique comment corriger ce comportement pour permettre la résolution DNS des services Kubernetes depuis une VM.

## Prérequis

- Une **VMInstance** Hikube basée sur Debian ou Ubuntu
- Un accès **SSH** ou **console** à la VM
- Droits **root** ou **sudo** sur la VM

## Étapes

### 1. Diagnostiquer le problème

Connectez-vous à la VM :

```bash
virtctl ssh ubuntu@my-vm
```

Vérifiez la configuration DNS actuelle :

```bash
resolvectl status
```

Observez la section de votre interface réseau (généralement `enp1s0`). Vous constaterez l'absence de domaines de recherche (search domains) et de domaines de routage (routing domains).

Testez la résolution d'un service Kubernetes :

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Résultat typique du problème :**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Le statut `REFUSED` confirme que `systemd-resolved` envoie la requête `.local` vers mDNS (désactivé dans la VM) au lieu du serveur DNS unicast.

**Cause racine** : le DHCP de KubeVirt (virt-launcher) fournit un serveur DNS mais ne transmet pas de domaines de recherche. Sans le domaine de routage `~local`, `systemd-resolved` applique le comportement par défaut du RFC 6762 et route `.local` vers mDNS.

### 2. Créer le drop-in systemd-networkd

La solution consiste à créer un fichier drop-in pour `systemd-networkd` qui déclare les domaines de recherche et les domaines de routage appropriés.

:::warning Ne pas utiliser netplan
Netplan ne supporte pas les domaines de routage (préfixe `~`). Utilisez directement un drop-in `systemd-networkd`.
:::

Créez le répertoire du drop-in :

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Créez le fichier de configuration :

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=<namespace>.svc.cozy.local svc.cozy.local cozy.local ~local ~.
EOF
```

:::note Remplacez le namespace
Remplacez `<namespace>` par le nom réel de votre namespace (tenant) Hikube. Par exemple : `tenant-prod.svc.cozy.local`.
:::

**Explication des domaines configurés :**

| Domaine | Rôle |
|---------|------|
| `<namespace>.svc.cozy.local` | Domaine de recherche : permet la résolution par nom court (ex : `my-service` au lieu de `my-service.my-namespace.svc.cozy.local`) |
| `svc.cozy.local` | Domaine de recherche : résolution des services dans d'autres namespaces |
| `cozy.local` | Domaine de recherche : résolution de tout nom dans le cluster |
| `~local` | Domaine de routage : force `.local` vers le DNS unicast au lieu de mDNS |
| `~.` | Domaine de routage : fait de cette interface la route DNS par défaut (sinon la résolution externe cesse de fonctionner) |

### 3. Appliquer la configuration

Redémarrez les services réseau :

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Vérifier la configuration

Vérifiez que les domaines sont correctement appliqués :

```bash
resolvectl status
```

Vous devriez voir les domaines de recherche et de routage dans la section de l'interface `enp1s0` :

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    <namespace>.svc.cozy.local
                    svc.cozy.local
                    cozy.local
```

## Vérification

Testez la résolution DNS d'un service Kubernetes par nom complet (FQDN) :

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Résultat attendu :** statut `NOERROR` avec une réponse contenant l'adresse IP du service.

Testez la résolution par nom court (grâce aux domaines de recherche) :

```bash
dig my-service
```

Testez que la résolution DNS externe fonctionne toujours :

```bash
dig google.com
```

:::tip Persistance
Cette configuration est **persistante** : elle survit aux redémarrages de la VM. Le fichier drop-in est lu automatiquement par `systemd-networkd` au démarrage.
:::

:::note Solution au niveau plateforme
Ce problème sera résolu à terme au niveau de la plateforme Hikube en configurant le DHCP de KubeVirt (virt-launcher) pour transmettre les domaines de recherche aux VMs. En attendant, cette correction manuelle est nécessaire.
:::

## Pour aller plus loin

- [Référence API](../api-reference.md)
- [Démarrage rapide](../quick-start.md)
