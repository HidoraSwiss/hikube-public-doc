---
title: "Come configurare il networking"
---

# Come configurare il networking

Questa guida spiega come gestire la configurazione di rete del cluster Kubernetes Hikube, utilizzando le NetworkPolicy Kubernetes e gli strumenti di osservabilità Cilium/Hubble.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**) e caricato nella sessione:
  ```bash
  export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
  ```
- Nozioni di base sul networking Kubernetes (Service, Pod, namespace)

## Passaggi

### 1. Comprendere la rete Hikube

:::note
Cilium è il CNI (Container Network Interface) dei cluster Kubernetes Hikube. Fornisce il networking, la sicurezza di rete e l'osservabilità. È sempre presente; la sua configurazione si sovrascrive nella console, sezione **Advanced Configuration** degli addon (vedere [Cilium](../plugins/cilium.md)).
:::

I cluster Hikube integrano:

- **Cilium** come CNI: rete pod-to-pod, service e applicazione delle NetworkPolicy;
- **Hubble** per l'osservabilità: visualizzazione dei flussi di rete, da attivare tramite la sovrascrittura di Cilium.

Per impostazione predefinita, tutti i pod possono comunicare tra loro senza restrizioni. Le NetworkPolicy consentono di limitare queste comunicazioni.

L'esposizione verso internet passa attraverso i gruppi di nodi contrassegnati **Exposed on the internet (Public IP)** nella console, che ospitano il controller [Ingress NGINX](../plugins/ingress-nginx.md).

### 2. Creare una NetworkPolicy

Definisca le regole per controllare il traffico in ingresso (Ingress) e in uscita (Egress) dei suoi pod:

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
- **autorizza il traffico in ingresso** verso i pod `app: web` solo dai pod `app: frontend` sulla porta 80;
- **autorizza il traffico in uscita** dai pod `app: web` solo verso i pod `app: database` sulla porta 5432;
- **blocca qualsiasi altro traffico** in ingresso e in uscita per i pod `app: web`.

### 3. Applicare e testare

```bash
# Applicare la NetworkPolicy
kubectl apply -f network-policy.yaml

# Verificare che la policy sia stata creata
kubectl get networkpolicies

# Testare la connettività autorizzata
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Testare la connettività bloccata (deve fallire)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Inizi con policy permissive, quindi le restringa progressivamente. Una policy troppo restrittiva può interrompere la comunicazione tra i suoi servizi.
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
La policy `default-deny-all` blocca **tutto il traffico** nel namespace, compreso l'accesso al DNS. Se la applica, aggiunga immediatamente una policy che autorizzi il traffico DNS (porta 53) in uscita, altrimenti la risoluzione dei nomi non funzionerà.
:::

### 4. Utilizzare Hubble per il debugging di rete

Hubble non è attivato per impostazione predefinita. Per attivarlo, modifichi il cluster nella console (**Edit**), espanda **Cilium** nella sezione **Advanced Configuration** degli addon, inserisca la seguente sovrascrittura in **Helm Configuration (YAML) — optional**, quindi faccia clic su **Save**:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Una volta ridistribuito Cilium, utilizzi la CLI Hubble integrata nei pod Cilium:

```bash
# Pod Cilium (uno per nodo)
kubectl get pods -A -l k8s-app=cilium

# Namespace di Cilium, utilizzato dai comandi seguenti
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')

# Verificare lo stato di Hubble
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble status

# Osservare i flussi di rete in tempo reale
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe

# Vedere i flussi rifiutati dalle NetworkPolicy
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --verdict DROPPED

# Filtrare per namespace
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- hubble observe --namespace production
```

:::tip
Il comando `hubble observe --verdict DROPPED` è particolarmente utile per identificare i flussi bloccati da una NetworkPolicy e regolare le sue regole.
:::

## Verifica

```bash
# Elencare tutte le NetworkPolicy
kubectl get networkpolicies -A

# Dettagli di una policy
kubectl describe networkpolicy allow-web

# Verificare lo stato di Cilium
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

**Risultato atteso per `kubectl get networkpolicies`:**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Per approfondire

- [Concetti](../concepts.md): architettura di rete e gruppi di nodi esposti
- [Come distribuire un Ingress con TLS](./deploy-ingress-tls.md): esposizione HTTPS delle sue applicazioni
