---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Einen Kubernetes-Cluster in wenigen Minuten erstellen

Dieser Leitfaden begleitet Sie bei der Erstellung Ihres ersten Kubernetes-Clusters über die Hikube-Konsole bis zur Bereitstellung einer Testanwendung.

---

## Voraussetzungen

- **Ein Hikube-Konto** und Zugang zur [Hikube-Konsole](https://console.hikube.cloud)
- **Ein Projekt** mit ausreichenden Quotas (CPU, Arbeitsspeicher, Speicher)
- **`kubectl` auf Ihrem Rechner installiert**, um nach der Erstellung im Cluster zu arbeiten
- **Kubernetes-Grundkenntnisse** (Pods, Services, Deployments)

---

## Schritt 1: Den Cluster erstellen

1. Melden Sie sich bei der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **Infrastructure** > **Kubernetes**. Die Seite **Kubernetes Clusters** wird angezeigt.
3. Klicken Sie auf **Create cluster**. Der Assistent **Create a new cluster** öffnet sich mit dem Schritt **General**.

---

## Schritt 2: Konfigurieren und bestätigen

Der Assistent umfasst vier Schritte: **General**, **Nodes**, **Addons** und **Summary**. Die Anzeigen **Project Quotas** zeigen jederzeit an, welchen Anteil der Quota der Cluster reservieren wird.

### General

| Feld | Wert für diesen Leitfaden |
|------|---------------------------|
| **Cluster name** | `demo-cluster` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche) |
| **Kubernetes Version** | Die vorausgewählte Version (die neueste angebotene) |
| **API Endpoint (Host)** | Leer lassen: Die Adresse wird automatisch von der Plattform erzeugt, ohne dass Sie DNS konfigurieren müssen |
| **Control Plane Instance Size** | **Small** |
| **Control Plane High Availability** | **3 (HA)** |

![Assistent zum Erstellen eines Kubernetes-Clusters, Schritt General](/img/console/kubernetes/wizard-general.en.png)

Klicken Sie auf **Next**.

### Nodes

Eine erste Gruppe, `worker-pool-1`, ist bereits vorhanden. Klappen Sie sie auf und füllen Sie aus:

| Feld | Wert für diesen Leitfaden |
|------|---------------------------|
| **Group name** | `worker-pool-1` |
| **Ephemeral storage size** | 20 GB |
| **Minimum nodes** | 1 |
| **Maximum nodes** | 3 |
| **Instance type** | Serie **Standard (S)**, Größe **Large** (`s1.large`, 4 vCPU, 8 GB) |
| **Exposed on the internet (Public IP)** | Aktiviert (für die erste Gruppe vorgegeben) |

![Kubernetes-Assistent, Schritt Nodes: Node-Gruppe und Instanztyp](/img/console/kubernetes/wizard-nodes.en.png)

Klicken Sie auf **Next**.

### Addons

**Cert-Manager**, **Ingress NGINX** und **Monitoring Agents** sind standardmäßig ausgewählt. Behalten Sie diese Auswahl für diesen Leitfaden bei. Die Blöcke der **Advanced Configuration** (Cilium, CoreDNS, Vertical Pod Autoscaler) müssen nicht geändert werden.

![Kubernetes-Assistent, Schritt Addons](/img/console/kubernetes/wizard-addons.en.png)

Klicken Sie auf **Next**.

### Summary

Die **Summary** fasst die Identität des Clusters, die Control Plane, die Node-Gruppen und die **Enabled Extensions & Addons** zusammen. Prüfen Sie die Konfiguration und klicken Sie dann auf **Create cluster**.

![Kubernetes-Assistent, Schritt Summary](/img/console/kubernetes/wizard-review.en.png)


---

## Schritt 3: Den Zustand prüfen

Nach der Bereitstellung kehrt die Konsole zur Liste **Kubernetes Clusters** zurück. Der Cluster `demo-cluster` erscheint dort mit dem Status **Creating**.

Das Provisioning dauert einige Minuten. Danach wechselt der Status zu **Ready**.

Klicken Sie auf den Cluster (oder auf **View details** in seinem Menü **Actions**), um seine Detailseite zu öffnen:

- **General**: Kubernetes-Version, Preset der Control Plane und Anzahl der Instanzen;
- **Node Pools**: jede Gruppe mit ihrem Instanztyp und der Anzahl aktiver Nodes, zum Beispiel „1 active node (1 to 3)“;
- **Extensions**: aktivierte Addons.

**Erwartetes Ergebnis**: Status **Ready** und mindestens ein aktiver Node in `worker-pool-1`.

---

## Schritt 4: Die Zugangsdaten abrufen

Klicken Sie auf der Detailseite des Clusters im Abschnitt **Actions** auf **Kubeconfig**. Der Browser lädt die Datei `kubeconfig-demo-cluster.yaml` herunter, und die Konsole bestätigt: „The kubeconfig file has been downloaded.“

![Detailseite eines Kubernetes-Clusters mit der Schaltfläche Kubeconfig in der Karte Actions](/img/console/kubernetes/cluster-detail.en.png)


:::warning
Diese kubeconfig gewährt vollen administrativen Zugriff auf den Cluster. Bewahren Sie sie sicher auf und versionieren Sie sie nicht.
:::

---

## Schritt 5: Verbindung und Tests

### Mit dem Cluster verbinden

```bash
# Heruntergeladene kubeconfig verwenden
export KUBECONFIG=~/Downloads/kubeconfig-demo-cluster.yaml

# Verbindung testen
kubectl get nodes
```

**Erwartetes Ergebnis**: ein Node pro aktivem Node der Gruppe, mit dem Status `Ready`.

```console
NAME                        STATUS   ROLES    AGE   VERSION
demo-cluster-worker-xxxxx   Ready    <none>   2m    v1.xx.x
```

### Eine Demo-Anwendung bereitstellen

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

# Bereitstellung prüfen
kubectl get pods -l app=hello-hikube
```

**Erwartetes Ergebnis:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### Den Zugriff testen

```bash
# Direkter Test des Service, ohne den Ingress
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080

# Externe IP des Ingress-NGINX-Controllers abrufen (Spalte EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller

# Den Ingress ohne DNS-Konfiguration testen
curl -H "Host: demo.example.com" http://<EXTERNAL-IP>
```

Um die Anwendung unter Ihrer eigenen Domain zu veröffentlichen, legen Sie einen DNS-Eintrag an, der auf diese externe IP zeigt, und folgen Sie dann [Einen Ingress mit TLS bereitstellen](./how-to/deploy-ingress-tls.md).

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Prüfung |
|---------|---------|
| Die Schaltfläche **Next** bleibt ausgegraut und eine Anzeige **Project Quotas** ist überschritten | Das Projekt hat nicht genügend Quota für die Control Plane und das **Maximum** an Nodes jeder Gruppe. Verringern Sie die maximale Anzahl der Nodes, die Größe oder den ephemeren Speicher. |
| Der Cluster bleibt länger als einige Dutzend Minuten im Status **Creating** | [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Clusters und das Projekt an. |
| **Kubeconfig** zeigt „Could not download the kubeconfig file.“ an | Warten Sie, bis der Cluster **Ready** ist, und versuchen Sie es dann erneut. |
| `kubectl get nodes` listet keinen Node im Status `Ready` | Prüfen Sie unter **Node Pools** die Anzahl aktiver Nodes und dann `kubectl describe node <node-name>`. |
| Pods im Status `Pending` | `kubectl describe pod <pod-name>`; wenn die Nodes ausgelastet sind, erhöhen Sie **Maximum nodes** über **Edit**. |
| Der Ingress antwortet nicht | Prüfen Sie, dass das Addon **Ingress NGINX** aktiviert ist und mindestens eine Gruppe **Exposed on the internet (Public IP)** ist. |

Weitere Informationen finden Sie auf der Seite [Fehlerbehebung](./troubleshooting.md).

---

## Schritt 7: Aufräumen

Löschen Sie zuerst die Testanwendung:

```bash
kubectl delete -f demo-app.yaml
```

Löschen Sie dann den Cluster über die Konsole:

1. Öffnen Sie unter **Infrastructure** > **Kubernetes** das Menü **Actions** des Clusters und wählen Sie **Delete** (oder klicken Sie auf seiner Detailseite auf **Delete**).
2. Geben Sie im Fenster „Delete demo-cluster?“ zur Bestätigung den exakten Namen des Clusters ein.
3. Klicken Sie auf **Permanently delete**.

:::warning
Das Löschen ist unwiderruflich: Alle mit dem Cluster verbundenen Daten gehen endgültig verloren.
:::

---

## Zusammenfassung

Sie haben erstellt:

- einen Kubernetes-Cluster mit einer verwalteten, hochverfügbaren Control Plane;
- eine Node-Gruppe mit Autoscaling von 1 bis 3 Nodes;
- eine Beispielanwendung, die über Ingress NGINX bereitgestellt wird.

## Nächste Schritte

- **[Konzepte](./concepts.md)**: alle Felder des Assistenten im Detail
- **[Eine Node-Gruppe hinzufügen und ändern](./how-to/manage-node-groups.md)**
- **[GPU](../gpu/overview.md)**: GPUs mit Kubernetes nutzen

<NavigationFooter
  nextSteps={[
    {label: "Praktische Anleitungen", href: "../how-to/manage-node-groups"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
