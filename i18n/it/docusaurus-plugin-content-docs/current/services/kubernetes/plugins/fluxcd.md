---
sidebar_position: 8
title: Flux CD
---

# Flux CD

L'addon **Flux CD** installa i controller **Flux** nel cluster, per la **gestione GitOps**: Flux sincronizza continuamente lo stato del cluster con i repository Git, in modo che la configurazione dichiarata nel codice sia sempre applicata.

## Nella console

1. Alla creazione, passaggio **Addons**, selezioni **Flux CD** (disattivato per impostazione predefinita).
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni **Flux CD**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Flux CD** nella sezione **Extensions** quando è attivo.

## Sovrascrivere la configurazione

L'addon installa Flux 2.8 con il **Flux Operator** nel cluster. Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart `flux-instance`, sotto la chiave `flux-instance`; le opzioni disponibili sono quelle della risorsa [FluxInstance](https://fluxcd.control-plane.io/operator/fluxinstance/). Nella maggior parte dei casi non è necessaria alcuna sovrascrittura.

:::note
L'addon installa Flux, ma non dichiara alcun repository. Le sorgenti Git e le sincronizzazioni si creano nel cluster, come descritto di seguito.
:::

## Utilizzo nel cluster

Dichiari una sorgente `GitRepository` e una `Kustomization`:

```yaml title="gitops-sync.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: gitops
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k8s-manifests
  namespace: gitops
spec:
  interval: 1m
  url: https://github.com/company/k8s-manifests
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: production
  namespace: gitops
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: k8s-manifests
  path: ./clusters/production
  prune: true
```

```bash
kubectl apply -f gitops-sync.yaml
kubectl get gitrepositories,kustomizations -n gitops
```

Il percorso completo è descritto in [Come distribuire con Flux (GitOps)](../how-to/deploy-gitops-flux.md).

## Buone pratiche

- Archivi le credenziali Git (chiave SSH, token) in Secret Kubernetes referenziati da `spec.secretRef`, mai nel repository.
- Attivi `prune: true` affinché le risorse rimosse dal repository vengano rimosse anche dal cluster.
- Separi le directory per ambiente (`clusters/staging`, `clusters/production`).
