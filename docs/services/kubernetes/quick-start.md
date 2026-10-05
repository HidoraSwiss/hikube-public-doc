---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Créer un cluster Kubernetes en quelques minutes

Ce guide vous accompagne dans la création de votre premier cluster Kubernetes depuis la console Hikube, jusqu'au déploiement d'une application de test.

---

## Prérequis

- **Un compte Hikube** et l'accès à la [console Hikube](https://console.hikube.cloud)
- **Un projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- **`kubectl` installé sur votre poste**, pour travailler dans le cluster une fois créé
- **Notions de base Kubernetes** (pods, services, deployments)
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

---

## Étape 1 : Créer le cluster

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** > **Kubernetes**. La page **Clusters Kubernetes** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un nouveau cluster** s'ouvre sur l'étape **Général**.

</TabItem>
<TabItem value="api" label="API">

Avec l'API, il n'y a pas d'assistant. Consultez d'abord les versions et les tailles de control plane proposées :

```bash
curl -sS "$HIKUBE_API/kubernetes/v1alpha1/versions" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS "$HIKUBE_API/kubernetes/v1alpha1/presets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.presets'
```

Les versions s'écrivent `v1.XX`. Les types d'instance des nœuds sont ceux de `GET /instance/v1alpha1/instance-types`.

</TabItem>
</Tabs>

---

## Étape 2 : Configurer et valider

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

L'assistant comporte quatre étapes : **Général**, **Nœuds**, **Addons** et **Vérification**. Les jauges **Quotas du projet** indiquent en permanence la part du quota que le cluster réservera.

### Général

| Champ | Valeur pour ce guide |
|-------|----------------------|
| **Nom du cluster** | `demo-cluster` (3 à 16 caractères : minuscules, chiffres et tirets) |
| **Version de Kubernetes** | La version présélectionnée (la plus récente proposée) |
| **Endpoint API (Host)** | Laissez vide : l'adresse est générée automatiquement par la plateforme, sans configuration DNS de votre part |
| **Taille de l'instance Control Plane** | **Medium** (le preset **Small** proposé par défaut peut manquer de mémoire) |
| **Haute Disponibilité du Control Plane** | **3 (HA)** |

![Assistant de création de cluster Kubernetes, étape Général](/img/console/kubernetes/wizard-general.fr.png)

Cliquez sur **Suivant**.

### Nœuds

Un premier groupe, `worker-pool-1`, est déjà présent. Dépliez-le et renseignez :

| Champ | Valeur pour ce guide |
|-------|----------------------|
| **Nom du groupe** | `worker-pool-1` |
| **Taille du stockage éphémère** | 20 Go |
| **Nombre minimum de nœuds** | 1 |
| **Nombre maximum de nœuds** | 3 |
| **Type d'instance** | Série **Standard (S)**, taille **Large** (`s1.large`, 4 vCPU, 8 Go) |
| **Exposé sur internet (IP Publique)** | Activé (imposé pour le premier groupe) |

![Assistant Kubernetes, étape Nœuds : groupe de nœuds et type d'instance](/img/console/kubernetes/wizard-nodes.fr.png)

Cliquez sur **Suivant**.

### Addons

**Cert-Manager**, **Ingress NGINX** et **Monitoring Agents** sont cochés par défaut. Gardez cette sélection pour ce guide. Les blocs de la **Configuration avancée** (Cilium, CoreDNS, Vertical Pod Autoscaler) n'ont pas besoin d'être modifiés.

![Assistant Kubernetes, étape Addons](/img/console/kubernetes/wizard-addons.fr.png)

Cliquez sur **Suivant**.

### Vérification

Le **Récapitulatif** reprend l'identité du cluster, le control plane, les groupes de nœuds et les **Extensions & Addons activés**. Vérifiez la configuration, puis cliquez sur **Déployer**.

![Assistant Kubernetes, étape Vérification : récapitulatif du cluster](/img/console/kubernetes/wizard-review.fr.png)

</TabItem>
<TabItem value="api" label="API">

Créez le cluster avec `POST /kubernetes/v1alpha1/projects/{projectId}/clusters`. L'exemple reprend la configuration de l'onglet Console ; remplacez la version par l'une de celles renvoyées à l'étape 1 :

```bash
curl -sS -X POST "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "democluster",
    "version": "v1.31",
    "controlPlane": {"preset": "medium", "replicas": 3},
    "nodeGroups": {
      "worker-pool-1": {
        "instanceType": "s1.large",
        "storage": 20,
        "minReplicas": 1,
        "maxReplicas": 3,
        "isExposed": true
      }
    },
    "addons": {
      "certManager": {"enabled": true},
      "ingressNginx": {"enabled": true},
      "monitoringAgents": {"enabled": true}
    }
  }'
```

- `name` : 16 caractères maximum, en minuscules ; ce nom identifie le cluster dans les chemins de l'API ;
- `host` (facultatif) : omis, l'adresse de l'API du cluster est générée automatiquement ;
- `controlPlane.replicas` : de 1 à 5 ; `3` correspond à **3 (HA)** ;
- `nodeGroups` : un objet dont chaque clé est le nom d'un groupe ; au moins un groupe. `storage` est la taille du stockage éphémère en Go (20 par défaut), `minReplicas` et `maxReplicas` bornent l'auto-scaling (0 à 128) ;
- `addons` : un addon absent n'est pas installé.

La réponse décrit le cluster créé, avec son `id` et son `status`.

</TabItem>
</Tabs>

---

## Étape 3 : Vérifier l'état

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Après le déploiement, la console revient sur la liste **Clusters Kubernetes**. Le cluster `demo-cluster` y apparaît avec le statut **En création**.

Le provisionnement prend quelques minutes. Le statut passe ensuite à **Prêt**.

Cliquez sur le cluster (ou **Voir les détails** dans son menu **Actions**) pour ouvrir sa page de détail :

- **Général** : version de Kubernetes, preset du control plane et nombre d'instances ;
- **Pools de Nœuds** : chaque groupe avec son type d'instance et son nombre de nœuds actifs, par exemple « 1 nœud actif (De 1 à 3) » ;
- **Extensions** : addons activés.

**Résultat attendu** : statut **Prêt**, et au moins un nœud actif dans `worker-pool-1`.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters/democluster" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, version, controlPlane, nodeGroups}'
```

**Résultat attendu :** `status` passe de `provisioning` à `ready` (**Prêt** dans la console) au bout de quelques minutes ; `error` signale un échec. Pour suivre les nœuds actifs eux-mêmes, utilisez `kubectl get nodes` à l'étape 5.

</TabItem>
</Tabs>

---

## Étape 4 : Récupérer les identifiants

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Sur la page de détail du cluster, section **Actions**, cliquez sur **Kubeconfig**. Le navigateur télécharge le fichier `kubeconfig-demo-cluster.yaml` et la console confirme : « Le fichier kubeconfig a été téléchargé. »

![Page de détail d'un cluster Kubernetes, avec le bouton Kubeconfig dans la carte Actions](/img/console/kubernetes/cluster-detail.fr.png)


:::warning
Ce kubeconfig donne un accès administrateur complet au cluster. Conservez-le en lieu sûr et ne le versionnez pas.
:::

</TabItem>
<TabItem value="api" label="API">

Le kubeconfig du cluster est renvoyé dans le champ `kubeconfig` de la réponse :

```bash
curl -sS "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters/democluster/kubeconfig" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.kubeconfig' > ~/Downloads/kubeconfig-demo-cluster.yaml
chmod 600 ~/Downloads/kubeconfig-demo-cluster.yaml
```

:::warning
Ce kubeconfig donne un accès administrateur complet au cluster. Conservez-le en lieu sûr et ne le versionnez pas.
:::

Si le cluster n'est pas encore `ready`, la requête échoue : attendez la fin du provisionnement, puis réessayez.

</TabItem>
</Tabs>

---

## Étape 5 : Connexion et tests

### Se connecter au cluster

```bash
# Utiliser le kubeconfig téléchargé
export KUBECONFIG=~/Downloads/kubeconfig-demo-cluster.yaml

# Tester la connexion
kubectl get nodes
```

**Résultat attendu** : un nœud par nœud actif du groupe, avec le statut `Ready`.

```console
NAME                        STATUS   ROLES    AGE   VERSION
demo-cluster-worker-xxxxx   Ready    <none>   2m    v1.xx.x
```

### Déployer une application de démonstration

```yaml title="demo-app.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-hikube
  labels:
    app: hello-hikube
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-hikube
  template:
    metadata:
      labels:
        app: hello-hikube
    spec:
      containers:
        - name: app
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: hello-hikube-service
spec:
  selector:
    app: hello-hikube
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-hikube-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-hikube-service
                port:
                  number: 80
```

```bash
kubectl apply -f demo-app.yaml

# Vérifier le déploiement
kubectl get pods -l app=hello-hikube
```

**Résultat attendu :**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### Tester l'accès

```bash
# Test direct du Service, sans passer par l'Ingress
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080

# Récupérer l'IP externe du contrôleur Ingress NGINX (colonne EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller

# Tester l'Ingress sans configurer de DNS
curl -H "Host: demo.example.com" http://<EXTERNAL-IP>
```

Pour publier l'application sous votre propre domaine, créez un enregistrement DNS qui pointe vers cette IP externe, puis suivez [Comment déployer un Ingress avec TLS](./how-to/deploy-ingress-tls.md).

---

## Étape 6 : Dépannage rapide

| Symptôme | Vérification |
|----------|--------------|
| Le bouton **Suivant** reste grisé et une jauge **Quotas du projet** est dépassée | Le projet n'a pas assez de quota pour le control plane et le **maximum** de nœuds de chaque groupe. Réduisez le nombre maximum de nœuds, le gabarit ou le stockage éphémère. |
| Le cluster reste **En création** au-delà de quelques dizaines de minutes | [Contactez le support](mailto:support@hidora.io) en indiquant le nom du cluster et le projet. |
| **Kubeconfig** affiche « Impossible d'obtenir le fichier kubeconfig. » | Attendez que le cluster soit **Prêt**, puis réessayez. |
| `kubectl get nodes` ne liste aucun nœud `Ready` | Vérifiez dans **Pools de Nœuds** le nombre de nœuds actifs, puis `kubectl describe node <nom-du-nœud>`. |
| Pods en `Pending` | `kubectl describe pod <nom-du-pod>` ; si les nœuds sont saturés, augmentez le **Nombre maximum de nœuds** via **Modifier**. |
| L'Ingress ne répond pas | Vérifiez que l'addon **Ingress NGINX** est activé et qu'au moins un groupe est **Exposé sur internet (IP Publique)**. |

Pour aller plus loin, consultez la page [Dépannage](./troubleshooting.md).

---

## Étape 7 : Nettoyage

Supprimez d'abord l'application de test :

```bash
kubectl delete -f demo-app.yaml
```

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Puis supprimez le cluster depuis la console :

1. Dans **Infrastructure** > **Kubernetes**, ouvrez le menu **Actions** du cluster et choisissez **Supprimer** (ou cliquez sur **Supprimer** depuis sa page de détail).
2. Dans la fenêtre « Supprimer demo-cluster ? », saisissez le nom exact du cluster pour confirmer.
3. Cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

Puis supprimez le cluster :

```bash
curl -sS -X DELETE "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters/democluster" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Une réponse `200` avec un objet vide `{}` confirme la demande ; le cluster disparaît ensuite de la liste `GET /kubernetes/v1alpha1/projects/{projectId}/clusters`.

</TabItem>
</Tabs>

:::warning
La suppression est irréversible : toutes les données associées au cluster sont définitivement perdues.
:::

---

## Résumé

Vous avez créé :

- un cluster Kubernetes avec un control plane managé en haute disponibilité ;
- un groupe de nœuds avec auto-scaling de 1 à 3 nœuds ;
- une application d'exemple exposée par Ingress NGINX.

## Prochaines étapes

- **[Concepts](./concepts.md)** : détail de chaque champ de l'assistant
- **[Comment ajouter et modifier un groupe de nœuds](./how-to/manage-node-groups.md)**
- **[GPU](../gpu/overview.md)** : utiliser des GPU avec Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/manage-node-groups"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
