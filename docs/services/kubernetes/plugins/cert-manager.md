---
sidebar_position: 6
title: Cert-Manager
---

# Cert-Manager

L'addon **Cert-Manager** gère automatiquement les certificats SSL/TLS du cluster : émission, renouvellement et stockage dans des Secrets Kubernetes. Il prend en charge Let's Encrypt (ACME) et les autorités privées.

## Dans la console

1. À la création, étape **Addons**, **Cert-Manager** est coché par défaut.
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez ou décochez **Cert-Manager**, puis **Enregistrer**.

La page de détail du cluster affiche **Cert-Manager** dans la section **Extensions** lorsqu'il est actif.

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart Helm de Cert-Manager, sous la clé `cert-manager`. Par exemple, pour ajuster les ressources :

```yaml title="cert-manager-override.yaml"
cert-manager:
  resources:
    requests:
      cpu: 10m
      memory: 32Mi
    limits:
      cpu: 100m
      memory: 128Mi
```

Les options disponibles sont décrites dans le [chart Helm de Cert-Manager](https://artifacthub.io/packages/helm/cert-manager/cert-manager).

## Utilisation dans le cluster

Aucun émetteur n'est créé par l'addon : déclarez votre `ClusterIssuer` (ou `Issuer`) dans le cluster, puis référencez-le dans vos Ingress.

```yaml title="cluster-issuer.yaml"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

```bash
kubectl apply -f cluster-issuer.yaml

# Suivre les certificats
kubectl get certificates -A
kubectl describe certificate <nom> -n <namespace>
```

Le parcours complet est décrit dans [Comment déployer un Ingress avec TLS](../how-to/deploy-ingress-tls.md).

## Bonnes pratiques

- Gardez Cert-Manager activé dès que vous exposez des applications en HTTPS.
- Testez avec le serveur de staging de Let's Encrypt avant d'utiliser le serveur de production.
- Vérifiez régulièrement l'état `READY` de vos certificats pour anticiper les échecs de renouvellement.
