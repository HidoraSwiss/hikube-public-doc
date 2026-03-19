---
title: "Come configurare il networking"
---

# Come configurare il networking

Questa guida spiega come gestire la configurazione di rete del vostro cluster Kubernetes Hikube, utilizzando le NetworkPolicy Kubernetes e gli strumenti di osservabilita Cilium/Hubble.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster figlio configurato (`export KUBECONFIG=cluster-admin.yaml`)
- Nozioni di base sul networking Kubernetes (Services, Pod, namespace)

## Fasi

### 1. Comprendere la rete Hikube

:::note
Cilium e il CNI (Container Network Interface) predefinito sui cluster Kubernetes Hikube. Fornisce il networking, la sicurezza di rete e l'osservabilita.
:::

I cluster Hikube integrano:

- **Cilium** come CNI: gestione della rete pod-to-pod, dei servizi e dell'applicazione delle NetworkPolicy
- **Hubble** per l'osservabilita: visualizzazione dei flussi di rete in tempo reale e debugging

Per impostazione predefinita, tutti i pod possono comunicare tra loro senza restrizioni. Le NetworkPolicy permettono di limitare queste comunicazioni.

### 2. Creare una NetworkPolicy

Definite delle regole per controllare il traffico in entrata (Ingress) e in uscita (Egress) dei vostri pod:

```yaml title="network-policy.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

Questa policy:
- **Autorizza il traffico in entrata** verso i pod `app: web` solo dai pod `app: frontend` sulla porta 80
- **Autorizza il traffico in uscita** dei pod `app: web` solo verso i pod `app: database` sulla porta 5432
- **Blocca tutto il resto del traffico** in entrata e in uscita per i pod `app: web`

### 3. Applicare e testare

```bash
# Applicare la NetworkPolicy
kubectl apply -f network-policy.yaml

# Verificare che la policy sia stata creata
kubectl get networkpolicies

# Testare la connettivita autorizzata
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Testare la connettivita bloccata (dovrebbe fallire)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Iniziate con policy permissive in modalita osservazione, poi restringete progressivamente. Una policy troppo restrittiva puo interrompere la comunicazione tra i vostri servizi.
:::

**Esempio di policy predefinita per isolare un namespace:**

```yaml title="default-deny.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

:::warning
La policy `default-deny-all` blocca **tutto il traffico** nel namespace, incluso l'accesso DNS. Se la applicate, aggiungete immediatamente una policy che autorizzi il traffico DNS (porta 53) in uscita, altrimenti la risoluzione dei nomi sara interrotta.
:::

### 4. Utilizzare Hubble per il debugging di rete

Hubble fornisce una visibilita completa sui flussi di rete del cluster. Utilizzatelo per diagnosticare i problemi di connettivita:

```bash
# Verificare lo stato di Hubble
kubectl exec -n kube-system -it ds/cilium -- hubble status

# Osservare i flussi di rete in tempo reale
kubectl exec -n kube-system -it ds/cilium -- hubble observe

# Filtrare i flussi per un pod specifico
kubectl exec -n kube-system -it ds/cilium -- hubble observe --pod web-xxxxx

# Vedere i flussi rifiutati dalle NetworkPolicy
kubectl exec -n kube-system -it ds/cilium -- hubble observe --verdict DROPPED

# Filtrare per namespace
kubectl exec -n kube-system -it ds/cilium -- hubble observe --namespace production
```

:::tip
Il comando `hubble observe --verdict DROPPED` e particolarmente utile per identificare i flussi bloccati da una NetworkPolicy e regolare le vostre regole.
:::

## Verifica

Verificate che le vostre policy di rete siano correttamente applicate:

```bash
# Elencare tutte le NetworkPolicy
kubectl get networkpolicies -A

# Dettagli di una policy
kubectl describe networkpolicy allow-web

# Verificare lo stato di Cilium
kubectl exec -n kube-system -it ds/cilium -- cilium status
```

**Risultato atteso per `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Configurazione completa del cluster
- [Concetti](../concepts.md) -- Architettura di rete e flussi di comunicazione
- [Come distribuire un Ingress con TLS](./deploy-ingress-tls.md) -- Esposizione HTTPS delle vostre applicazioni
