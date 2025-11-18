---
sidebar_position: 1
title: Cilium
---

# 🧩 Détails du champ `addons.cilium`

Le champ `addons.cilium` définit la configuration de l’add-on **Cilium**, utilisé comme **CNI (Container Network Interface)** pour le cluster Kubernetes.
Cilium gère le réseau, la sécurité et l’observabilité des Pods à l’aide de **BPF (Berkeley Packet Filter)**.
Ce champ permet de personnaliser le déploiement du composant via des valeurs spécifiques.

```yaml
addons:
  cilium:
    valuesOverride:
      hubble:
        enabled: true
      encryption:
        enabled: true
```

---

## `cilium` (Object) — **Obligatoire**

### Description
Le champ `cilium` représente la configuration principale de l’add-on réseau.
Il regroupe les paramètres nécessaires à l’installation et à la personnalisation de Cilium dans le cluster.

### Exemple
```yaml
cilium:
  valuesOverride:
    hubble:
      enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description
Le champ `valuesOverride` permet de **surcharger les valeurs par défaut** utilisées lors du déploiement de Cilium.
Il sert à ajuster le comportement du CNI sans modifier le chart principal.
Ces valeurs peuvent inclure la configuration de **Hubble**, du chiffrement, des politiques réseau, ou encore des ressources allouées.
Pour plus de valeurs à définir : https://docs.cilium.io/en/stable/helm-reference/

### Exemple
```yaml
valuesOverride:
  hubble:
    enabled: true
  encryption:
    enabled: true
```

---

## 💡 Bonnes pratiques

- Toujours définir `valuesOverride` pour garder la maîtrise de la configuration réseau.
- Activer **Hubble** (`hubble.enabled: true`) pour bénéficier de la visibilité réseau et du suivi des flux.
- Utiliser `encryption.enabled: true` pour chiffrer le trafic inter-Pod dans les environnements sensibles.
- Vérifier la compatibilité de la version de Cilium avec la version du cluster Kubernetes.

---
