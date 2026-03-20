---
sidebar_position: 3
title: Avvio rapido
---

# 🚀 Avvio rapido con Hikube

Benvenuti! Questa guida vi accompagna passo dopo passo per creare il vostro primo progetto su Hikube. Al termine di questo tutorial, avrete distribuito la vostra prima applicazione in un ambiente completamente sicuro.

---

## Prerequisiti

### **Accesso alla piattaforma**
Se non avete ancora un account Hikube, contattate il nostro team a **sales@hidora.io** per ottenere i vostri accessi.

### **Installazione degli strumenti richiesti**

#### **kubectl** (obbligatorio)

**macOS**
```bash
# Homebrew
brew install kubectl
```

**Linux**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y kubectl

# RHEL/CentOS/Fedora
sudo dnf install kubectl
# o per le versioni più vecchie
sudo yum install kubectl

# Alpine Linux
sudo apk add kubectl
```

**Windows**
```powershell
# Chocolatey
choco install kubernetes-cli

# winget
winget install Kubernetes.kubectl
```

📖 **Documentazione ufficiale**: [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

#### **kubelogin** (richiesto per l'autenticazione OIDC)

[kubelogin](https://github.com/int128/kubelogin) è un plugin kubectl per l'autenticazione OpenID Connect (OIDC).

**macOS / Linux (Homebrew)**
```bash
brew install kubelogin
```

**Krew (macOS, Linux, Windows)**
```bash
kubectl krew install oidc-login
```

**Windows (Chocolatey)**
```powershell
choco install kubelogin
```

📖 **Documentazione ufficiale**: [int128/kubelogin](https://github.com/int128/kubelogin)

:::warning Attenzione
**Non** utilizzate il kubelogin di Azure (`Azure/kubelogin`). Hikube utilizza l'autenticazione OIDC standard e richiede il plugin [int128/kubelogin](https://github.com/int128/kubelogin).
:::

### **Strumenti opzionali raccomandati**

Per una migliore esperienza di gestione Kubernetes:

- **[Lens](https://k8slens.dev/)** - Interfaccia grafica moderna per Kubernetes
- **[K9s](https://k9scli.io/)** - Interfaccia terminale interattiva per Kubernetes
- **[Helm](https://helm.sh/)** - Gestore di pacchetti per Kubernetes
- **[kubectx + kubens](https://github.com/ahmetb/kubectx)** - Strumenti per cambiare rapidamente contesto e namespace

---

## Passo 1: Accedere al vostro Tenant

### **Configurazione kubectl**
1. **Recuperate il vostro kubeconfig** dal vostro amministratore Hikube
2. **Configurate kubectl** con il vostro file di configurazione:
   ```bash
   # Opzione 1: Variabile d'ambiente
   export KUBECONFIG=/path/to/your/hikube-kubeconfig.yaml

   # Opzione 2: Copia nella directory predefinita
   cp hikube-kubeconfig.yaml ~/.kube/config
   ```
3. **Verificate la connessione**:
   ```bash
   kubectl get pods
   ```

:::tip Configurazione multipla
Potete gestire più cluster con `kubectl config get-contexts` e `kubectl config use-context <context-name>`
:::

### **Verifica del vostro tenant**
Il vostro tenant è il vostro **spazio di lavoro isolato**. Verificate di essere nel contesto corretto:
```bash
kubectl config current-context
```

:::warning Non utilizzare -A / --all-namespaces
Il flag `-A` (`--all-namespaces`) effettua una richiesta a livello di cluster, il che è vietato per un utente tenant. Utilizzate sempre i comandi senza `-A`: il vostro kubeconfig punta già al vostro namespace.
:::

---

## Passo 2: Creare il vostro primo Cluster Kubernetes

### **Deployment tramite kubectl**
1. **Create un file YAML** per il vostro cluster Kubernetes
2. **Personalizzate la configurazione** secondo le vostre esigenze
3. **Distribuite con kubectl**:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: kube
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride: {}
    fluxcd:
      enabled: false
      valuesOverride: {}
    ingressNginx:
      enabled: true
      hosts:
      - mon-app.example.com
      valuesOverride: {}
    monitoringAgents:
      enabled: false
      valuesOverride: {}
    verticalPodAutoscaler:
      valuesOverride: {}
  controlPlane:
    replicas: 3
  host: k8s-api.example.com
  kamajiControlPlane:
    addons:
      konnectivity:
        server:
          resources: {}
          resourcesPreset: small
    apiServer:
      resources: {}
      resourcesPreset: small
    controllerManager:
      resources: {}
      resourcesPreset: small
    scheduler:
      resources: {}
      resourcesPreset: small
  nodeGroups:
    md0:
      ephemeralStorage: 30Gi
      instanceType: u1.large
      maxReplicas: 6
      minReplicas: 3
      roles:
      - ingress-nginx
  storageClass: replicated
```

4. **Distribuite il cluster**:
   ```bash
   # Salvate la configurazione in un file
   kubectl apply -f my-kubernetes-cluster.yaml
   ```

### **⏳ Monitoraggio del deployment**
- Il cluster sarà pronto in **1-3 minuti**
- Seguite lo stato con kubectl:
  ```bash
  kubectl get kubernetes
  kubectl describe kubernetes kube
  ```
- Status "Ready" = Cluster operativo ✅

---

## Configurazione DNS

### **Record DNS richiesti**

Affinché il vostro cluster sia accessibile, dovete creare i seguenti record DNS presso il vostro provider DNS:

```bash
# Recuperate l'IP pubblico del vostro cluster tramite gli Ingress
kubectl get ingress
```

**Risultato atteso:**

```console
NAME                            CLASS           HOSTS                 ADDRESS        PORTS   AGE
kubernetes-kube                 tenant-myco     k8s-api.example.com   91.x.x.x      80      2m
kubernetes-kube-ingress-nginx   tenant-myco     mon-app.example.com   91.x.x.x      80      2m
```

Create i record DNS presso il vostro provider:

```
Type A : k8s-api.example.com → <ADDRESS>
Type A : mon-app.example.com → <ADDRESS>
```

:::tip Configurazione DNS
- **k8s-api.example.com**: Punto di accesso all'API Kubernetes
- **mon-app.example.com**: Dominio per le vostre applicazioni tramite Ingress
- Sostituite `example.com` con la vostra vera zona DNS
:::

---

## Passo 3: Recuperare il Kubeconfig

### **Estrazione del kubeconfig del cluster**
Una volta che il vostro cluster è distribuito e pronto, recuperate le sue credenziali con questo comando:

```bash
# Recuperate il kubeconfig del cluster creato (adattate il nome del cluster)
kubectl get secret kubernetes-<clusterName>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf

# Esempio concreto con il cluster "kube":
kubectl get secret kubernetes-kube-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf
```

:::info Variabile da personalizzare
- `<clusterName>`: Sostituite con il nome del vostro cluster (es: `kube` secondo il manifesto YAML)
:::

### **Configurazione locale**
```bash
# Utilizzate il kubeconfig del nuovo cluster
export KUBECONFIG=./admin.conf

# Verificate la connessione al cluster creato
kubectl get nodes
```

:::note
Questo comando funzionerà solo dopo aver configurato i record DNS (sezione precedente). I nodi worker possono impiegare qualche minuto in più per apparire.
:::

:::success Congratulazioni!
Il vostro cluster Kubernetes è ora operativo con **alta disponibilità nativa**!
:::

---

## Riepilogo

Avete creato:

- Un **cluster Kubernetes ad alta disponibilità**
- Un **ambiente totalmente sicuro** (isolamento di rete)
- Un'**archiviazione resiliente** (replica automatica)
---

## Serve aiuto?

### **Documentazione**
- **[FAQ](../resources/faq.md)** → Risposte alle domande comuni
- **[Troubleshooting](../resources/troubleshooting.md)** → Soluzioni ai problemi

### **Supporto**
- **Email:** support@hidora.io
- **Documentazione:** Questa piattaforma
- **Community:** Forum e chat in tempo reale

:::tip Bravi! 🎊
Avete appena fatto i vostri primi passi su Hikube. La vostra infrastruttura è ora pronta per accogliere tutti i vostri progetti più ambiziosi!
:::

---

**Prossimo passo raccomandato:** [📖 Concetti chiave](./concepts.md) → Padroneggiate i fondamentali di Hikube
