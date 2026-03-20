---
title: "Comment configurer le monitoring"
---

# Comment configurer le monitoring

Ce guide explique comment activer et configurer le monitoring sur un cluster Kubernetes Hikube, incluant la collecte de metriques, les logs et les dashboards de visualisation.

## Prerequis

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le fichier YAML de configuration de votre cluster

## Etapes

### 1. Activer l'addon monitoringAgents

Modifiez la configuration de votre cluster pour activer l'addon de monitoring :

```yaml title="cluster-monitoring.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

:::note
L'activation de Fluent Bit (`fluentbit.enabled: true`) permet la collecte et le transfert des logs de vos applications vers la stack d'observabilite.
:::

### 2. Creer un node group dedie au monitoring

Les composants de monitoring (VictoriaMetrics, Grafana, Fluent Bit) consomment des ressources significatives. Il est recommande de dedier un node group avec des instances optimisees en memoire :

```yaml title="cluster-monitoring.yaml"
nodeGroups:
  monitoring:
    minReplicas: 2
    maxReplicas: 4
    instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
    ephemeralStorage: 200Gi       # Stockage important pour les metriques et logs
    roles:
      - monitoring
```

:::tip
La serie M (Memory Optimized) est ideale pour le monitoring car les bases de donnees de metriques (VictoriaMetrics) et les moteurs d'indexation de logs necessitent beaucoup de memoire.
:::

### 3. Appliquer la configuration

```bash
kubectl apply -f cluster-monitoring.yaml

# Attendre que le cluster soit pret
kubectl get kubernetes my-cluster -w
```

### 4. Acceder aux outils de monitoring

Une fois le cluster mis a jour, verifiez que les composants de monitoring sont deployes dans le cluster enfant :

```bash
export KUBECONFIG=cluster-admin.yaml

# Lister les pods de monitoring
kubectl get pods -n monitoring

# Verifier les services disponibles
kubectl get svc -n monitoring

# Acceder a Grafana (si disponible via Ingress)
kubectl get ingress -n monitoring
```

Pour acceder a Grafana en local :

```bash
kubectl port-forward -n monitoring svc/grafana 3000:80 &
# Ouvrir http://localhost:3000 dans le navigateur
```

### 5. Verifier les metriques

Confirmez que les metriques sont correctement collectees :

```bash
# Metriques des noeuds
kubectl top nodes

# Metriques des pods
kubectl top pods -A

# Events du cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Resultat attendu pour `kubectl top nodes` :**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-monitoring-yyyyy   800m         20%    4500Mi          14%
```

## Verification

Verifiez que l'ensemble de la stack de monitoring est operationnelle :

```bash
# Verifier tous les composants de monitoring
kubectl get pods -n monitoring

# Verifier les logs Fluent Bit
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit --tail=20
```

**Resultat attendu :**

```console
NAME                                 READY   STATUS    RESTARTS   AGE
grafana-xxxxx-yyyyy                  1/1     Running   0          10m
vmagent-xxxxx-yyyyy                  1/1     Running   0          10m
fluent-bit-xxxxx                     1/1     Running   0          10m
```

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Configuration de l'addon `monitoringAgents`
- [Concepts](../concepts.md) -- Architecture et observabilite
- [Acces et outils](./toolbox.md) -- Commandes de debugging et metriques
