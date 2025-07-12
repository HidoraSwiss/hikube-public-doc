---
sidebar_position: 2
title: Démarrage rapide
---

# Démarrage rapide avec Hikube

Ce guide vous accompagne pour déployer votre première application sur Hikube en moins de 10 minutes.

## Prérequis

- Un compte Hikube (contactez sales@hidora.io)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installé
- [Terraform](https://www.terraform.io/downloads) (optionnel, pour l'Infrastructure as Code)

## Étape 1 : Accéder à votre tenant

1. **Connectez-vous à l'interface web** : [https://dashboard.hikube.cloud/](https://dashboard.hikube.cloud/)

2. **Récupérez votre kubeconfig** :
   - Allez dans l'onglet "Applications"
   - Sélectionnez votre tenant
   - Téléchargez le kubeconfig dans la section "Secrets"

3. **Configurez kubectl** :
   ```bash
   export KUBECONFIG=/chemin/vers/votre/kubeconfig.yaml
   kubectl get nodes
   ```

## Étape 2 : Créer votre premier tenant

```yaml
# tenant.yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Tenant
metadata:
  name: mon-premier-tenant
spec:
  host: "mon-tenant.example.org"
  etcd: true
  monitoring: true
  ingress: true
  isolated: true
```

```bash
kubectl apply -f tenant.yaml
```

## Étape 3 : Déployer PostgreSQL

```yaml
# postgres.yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: ma-base-de-donnees
spec:
  size: 10Gi
  replicas: 2
  storageClass: "replicated"
  users:
    admin:
      password: "mon-mot-de-passe-securise"
  databases:
    monapp:
      roles:
        admin: ["admin"]
```

```bash
kubectl apply -f postgres.yaml
```

## Étape 4 : Vérifier le déploiement

```bash
# Vérifier l'état du tenant
kubectl get tenants

# Vérifier l'état de PostgreSQL
kubectl get postgres

# Voir les logs
kubectl logs -l app=postgres
```

## Étape 5 : Se connecter à la base de données

```bash
# Obtenir les informations de connexion
kubectl get secret postgres-mon-base-de-donnees -o yaml

# Se connecter avec psql
kubectl exec -it postgres-mon-base-de-donnees-0 -- psql -U admin -d monapp
```

## Félicitations ! 🎉

Vous avez déployé votre première application sur Hikube ! 

## Prochaines étapes

- **[Déployer une VM](services/compute/virtual-machines/quick-start.md)** : Créez une machine virtuelle
- **[Déployer Kubernetes](services/kubernetes/quick-start.md)** : Créez un cluster Kubernetes
- **[Utiliser Terraform](tools/terraform.md)** : Automatisez vos déploiements
- **[Monitoring](resources/monitoring.md)** : Surveillez vos applications

## Besoin d'aide ?

- **Documentation** : Explorez les guides détaillés
- **Support** : Contactez notre équipe support
- **Community** : Rejoignez notre communauté 