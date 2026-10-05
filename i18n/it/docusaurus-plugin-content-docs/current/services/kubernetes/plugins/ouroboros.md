---
sidebar_position: 12
title: Ouroboros
---

# Ouroboros

L'addon **Ouroboros** corregge il **NAT hairpin** (*hairpin NAT*) di Ingress NGINX quando viene utilizzato il PROXY protocol. Senza di esso, un pod del cluster che chiama un dominio pubblico servito dall'Ingress dello stesso cluster può vedere la propria richiesta fallire.

:::note
L'addon [Ingress NGINX](./ingress-nginx.md) non attiva il PROXY protocol per impostazione predefinita. Ouroboros è utile solo se lei lo ha attivato, tramite la sovrascrittura di Ingress NGINX, sull'intera catena di ingresso.
:::

## Nella console

Ouroboros richiede l'addon [Ingress NGINX](./ingress-nginx.md).

1. Alla creazione, passaggio **Addons**, selezioni **Ouroboros** (disattivato per impostazione predefinita). Se **Ingress NGINX** non è selezionato, la console mostra «Requires the Ingress NGINX addon» e blocca il proseguimento.
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni **Ouroboros**, quindi **Save**.

La pagina di dettaglio del cluster mostra **Ouroboros** nella sezione **Extensions** quando è attivo.

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart Helm di Ouroboros, sotto la chiave `ouroboros`. Nella maggior parte dei casi non è necessaria alcuna sovrascrittura.

## Utilizzo nel cluster

```bash
# Pod Ouroboros
kubectl get pods -A | grep -i ouroboros

# Testare l'accesso a un dominio pubblico servito dall'Ingress del cluster, da un pod
kubectl run hairpin-test --rm -it --image=curlimages/curl --restart=Never -- curl -sv https://app.example.com
```

## Buone pratiche

- Attivi Ouroboros quando il PROXY protocol è attivo su Ingress NGINX e le applicazioni del cluster si chiamano tra loro tramite i rispettivi domini pubblici.
