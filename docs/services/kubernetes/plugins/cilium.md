---
sidebar_position: 1
title: Cilium
---

# Cilium

**Cilium** est le **CNI (Container Network Interface)** des clusters Kubernetes Hikube. Il gère le réseau, la sécurité et l'observabilité des pods à l'aide d'**eBPF**, et applique les `NetworkPolicy`.

## Dans la console

Cilium fait partie de la **Configuration avancée** de l'étape **Addons** : il est toujours présent dans le cluster et ne se désactive pas. Vous pouvez seulement surcharger sa configuration.

1. À la création (étape **Addons**) ou depuis **Modifier** > **Extensions & Addons**, dépliez le bloc **Cilium** de la section **Configuration avancée**.
2. Saisissez vos valeurs dans **Configuration Helm (YAML) — optionnel**.
3. Validez avec **Suivant** puis **Déployer** (création) ou **Enregistrer** (modification).

:::warning
Sur un cluster existant, la console n'enregistre pas une première surcharge saisie depuis **Modifier** : le bouton **Enregistrer** confirme la mise à jour, mais la valeur est ignorée. Définissez la surcharge à la création du cluster, ou [contactez le support](mailto:support@hidora.io). Une surcharge définie à la création reste modifiable depuis **Modifier**.
:::

Sur la page de détail du cluster, la ligne **CNI** de la section **Réseau** indique **Personnalisé** lorsqu'une configuration Cilium est appliquée.

## Surcharger la configuration

La valeur YAML est transmise au chart Helm de Cilium, sous la clé `cilium`. Par exemple, pour activer Hubble :

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Les options disponibles sont décrites dans la [référence Helm de Cilium](https://docs.cilium.io/en/stable/helm-reference/).

:::warning
Le réseau du cluster dépend de Cilium. Une surcharge erronée peut couper la communication entre les pods ou avec le control plane : modifiez uniquement les options dont vous maîtrisez l'effet.
:::

## Utilisation dans le cluster

```bash
# Pods Cilium (un par nœud)
kubectl get pods -A -l k8s-app=cilium

# État de l'agent Cilium
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

Voir [Comment configurer le networking](../how-to/configure-networking.md) pour les `NetworkPolicy` et Hubble.

## Bonnes pratiques

- Activez **Hubble** pour bénéficier de la visibilité réseau et du suivi des flux.
- Utilisez des `NetworkPolicy` pour restreindre le trafic entre vos applications.
- Testez toute surcharge sur un cluster de recette avant la production.
