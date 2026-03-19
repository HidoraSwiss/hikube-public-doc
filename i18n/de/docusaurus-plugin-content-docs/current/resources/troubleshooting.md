---
sidebar_position: 1
title: Globale Fehlerbehebung
---

# Globale Fehlerbehebung Hikube

Dieser Leitfaden behandelt die häufigsten Probleme auf Hikube und deren Lösungen.

---

## 1. Allgemeine Diagnose

Bevor Sie nach einer spezifischen Lösung suchen, beginnen Sie mit diesen Diagnosebefehlen:

```bash
# Status der Ressourcen in Ihrem Namespace
kubectl get all

# Aktuelle Events (nach Datum sortiert)
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierte Beschreibung einer Ressource
kubectl describe <type> <name>

# Logs eines Pods
kubectl logs <pod-name>

# Logs des vorherigen Containers (bei Absturz)
kubectl logs <pod-name> --previous
```

---

## 2. Pods mit Fehlern

### CrashLoopBackOff

**Symptom:** Der Pod startet in einer Schleife neu, der Status zeigt `CrashLoopBackOff`.

**Diagnose:**

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
```

**Lösungen:**
- **Unzureichender Arbeitsspeicher**: Erhöhen Sie `resources.memory` oder verwenden Sie ein höheres `resourcesPreset`
- **Konfigurationsfehler**: Überprüfen Sie die Umgebungsvariablen und Konfigurationsdateien in den Logs
- **Fehlende Abhängigkeit**: Überprüfen Sie, ob die erforderlichen Dienste (Datenbank, Secrets) verfügbar sind

---

### Pending

**Symptom:** Der Pod bleibt im Status `Pending`, ohne zu starten.

**Diagnose:**

```bash
kubectl describe pod <pod-name>
# Suchen Sie den Abschnitt "Events" am Ende der Ausgabe
```

**Lösungen:**
- **Unzureichende Ressourcen**: Der Cluster hat nicht genug CPU/Arbeitsspeicher. Überprüfen Sie die verfügbaren Knoten mit `kubectl get nodes` und `kubectl top nodes`
- **PVC nicht gebunden**: Das angeforderte persistente Volume ist nicht verfügbar (siehe Abschnitt Speicher)
- **NodeSelector/Affinity**: Der Pod hat Platzierungseinschränkungen, die zu keinem Knoten passen

---

### ImagePullBackOff

**Symptom:** Der Pod startet nicht, der Status zeigt `ImagePullBackOff` oder `ErrImagePull`.

**Diagnose:**

```bash
kubectl describe pod <pod-name>
# Suchen Sie "Failed to pull image" in den Events
```

**Lösungen:**
- **Image nicht gefunden**: Überprüfen Sie den Namen und das Tag des Images in Ihrem Manifest
- **Private Registry**: Stellen Sie sicher, dass ein `imagePullSecret` konfiguriert ist
- **Netzwerkproblem**: Überprüfen Sie die Konnektivität zur Registry

---

### OOMKilled

**Symptom:** Der Pod wird mit dem Exit-Code `137` und dem Grund `OOMKilled` beendet.

**Diagnose:**

```bash
kubectl describe pod <pod-name>
# Suchen Sie "Last State: Terminated - Reason: OOMKilled"
```

**Lösungen:**
- Erhöhen Sie das Arbeitsspeicher-Limit in `resources.memory` oder wechseln Sie zu einem höheren `resourcesPreset`
- Überprüfen Sie, ob die Anwendung ein Speicherleck hat, indem Sie den Verbrauch mit `kubectl top pod` beobachten

---

## 3. Cluster-Zugang

### Ungültige Kubeconfig

**Symptom:** `error: You must be logged in to the server (Unauthorized)`

**Diagnose:**

```bash
# Verwendete kubeconfig-Datei überprüfen
echo $KUBECONFIG
kubectl config current-context
```

**Lösungen:**
- Generieren Sie die kubeconfig aus Ihrem Hikube-Cluster neu:
  ```bash
  kubectl get secret <cluster-name>-admin-kubeconfig \
    -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
    > my-cluster-kubeconfig.yaml
  export KUBECONFIG=my-cluster-kubeconfig.yaml
  ```
- Überprüfen Sie, ob die Variable `KUBECONFIG` auf die richtige Datei zeigt

---

### Abgelaufenes Zertifikat

**Symptom:** `Unable to connect to the server: x509: certificate has expired`

**Diagnose:**

```bash
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d | openssl x509 -text -noout | grep -A2 Validity
```

**Lösung:** Rufen Sie eine aktuelle kubeconfig aus dem Secret des Clusters ab (siehe oben).

---

### Verbindung abgelehnt

**Symptom:** `The connection to the server was refused`

**Diagnose:**

```bash
# Konnektivität testen
kubectl cluster-info
```

**Lösungen:**
- Überprüfen Sie, ob der Cluster im Status `Ready` ist: `kubectl get kubernetes <cluster-name>`
- Überprüfen Sie, ob die Control Plane von Ihrem Netzwerk aus erreichbar ist
- Wenn Sie ein VPN verwenden, stellen Sie sicher, dass es aktiv ist

---

## 4. Speicher

### PVC im Status Pending

**Symptom:** Das PVC bleibt im Status `Pending` und abhängige Pods starten nicht.

**Diagnose:**

```bash
kubectl get pvc
kubectl describe pvc <pvc-name>
```

**Lösungen:**
- **Ungültige StorageClass**: Überprüfen Sie, ob die angegebene `storageClass` existiert mit `kubectl get storageclass`
- **Unzureichende Kapazität**: Reduzieren Sie die angeforderte Grösse oder kontaktieren Sie den Support zur Erhöhung der Kontingente
- **Leere StorageClass**: Wenn `storageClass: ""`, wird die Standardklasse verwendet. Versuchen Sie explizit `storageClass: replicated`

---

### Unzureichender Festplattenspeicher

**Symptom:** Pods stürzen ab mit Fehlern vom Typ `No space left on device`.

**Diagnose:**

```bash
# PVC-Nutzung überprüfen
kubectl exec -it <pod-name> -- df -h
```

**Lösungen:**
- Erhöhen Sie den Wert von `size` im Manifest und wenden Sie es erneut an
- Löschen Sie unnötige Daten (Logs, temporäre Dateien)

---

## 5. Netzwerk

### Dienst nicht erreichbar

**Symptom:** Verbindung zum Dienst von aussen oder zwischen Pods nicht möglich.

**Diagnose:**

```bash
# Überprüfen, ob der Dienst existiert und einen Endpoint hat
kubectl get svc
kubectl get endpoints <service-name>

# Konnektivität von einem Pod aus testen
kubectl run test-net --image=busybox --rm -it -- wget -qO- http://<service-name>:<port>
```

**Lösungen:**
- **Kein Endpoint**: Die Labels des `selector` des Dienstes stimmen mit keinem Pod überein
- **External nicht aktiviert**: Fügen Sie `external: true` im Manifest hinzu, um einen LoadBalancer zu erstellen
- **Falscher Port**: Überprüfen Sie, ob der Port des Dienstes mit dem von der Anwendung exponierten Port übereinstimmt

---

### DNS wird nicht aufgelöst

**Symptom:** `Could not resolve host` beim Zugriff auf einen Dienst über seinen Namen.

**Diagnose:**

```bash
# Cluster-DNS überprüfen
kubectl run test-dns --image=busybox --rm -it -- nslookup <service-name>

# CoreDNS-Pods überprüfen
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Lösungen:**
- Verwenden Sie den vollständigen DNS-Namen: `<service>.<namespace>.svc.cluster.local`
- Überprüfen Sie, ob die CoreDNS-Pods im Status `Running` sind

---

### Ingress gibt 404 oder 502 zurück

**Symptom:** Die Ingress-URL gibt einen Fehler 404 (Not Found) oder 502 (Bad Gateway) zurück.

**Diagnose:**

```bash
kubectl describe ingress <ingress-name>
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

**Lösungen:**
- **404**: Überprüfen Sie, ob `path` und `host` des Ingress mit Ihrer Konfiguration übereinstimmen
- **502**: Der Backend-Dienst antwortet nicht. Überprüfen Sie, ob die Backend-Pods im Status `Running` sind und der Port korrekt ist
- **Fehlende IngressClass**: Fügen Sie `ingressClassName: nginx` in der Ingress-Spec hinzu

---

## 6. Datenbanken

### Verbindung abgelehnt

**Symptom:** `Connection refused` beim Verbindungsversuch zur Datenbank.

**Diagnose:**

```bash
# Status der Datenbank-Pods überprüfen
kubectl get pods | grep <datenbank-name>

# Services überprüfen
kubectl get svc | grep <datenbank-name>
```

**Lösungen:**
- Überprüfen Sie, ob die Datenbank-Pods im Status `Running` sind
- Überprüfen Sie die Zugangsdaten: `kubectl get secret <name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'`
- Wenn `external: false`, verwenden Sie `kubectl port-forward` für eine lokale Verbindung

---

### Replikationsverzögerung

**Symptom:** Die Replicas haben eine erhebliche Replikationsverzögerung gegenüber dem Master.

**Diagnose:**

```bash
# Redis - Replikation überprüfen
kubectl exec -it rfr-redis-<name>-0 -- redis-cli -a "$REDIS_PASSWORD" INFO replication

# PostgreSQL - Verzögerung überprüfen
kubectl exec -it <name>-1 -- psql -c "SELECT * FROM pg_stat_replication;"
```

**Lösungen:**
- Erhöhen Sie die Ressourcen (CPU/Arbeitsspeicher) der Replicas
- Überprüfen Sie die Netzwerklast zwischen den Rechenzentren
- Reduzieren Sie die Schreiblast, wenn die Verzögerung anhält

---

### Failover wird nicht ausgelöst

**Symptom:** Der Master ist ausgefallen, aber kein Replica wird befördert.

**Diagnose:**

```bash
# Redis - Sentinel überprüfen
kubectl exec -it rfs-redis-<name>-<id> -- redis-cli -p 26379 SENTINEL masters

# Events überprüfen
kubectl get events --sort-by=.metadata.creationTimestamp | grep <datenbank-name>
```

**Lösungen:**
- Überprüfen Sie, ob `replicas > 1` im Manifest gesetzt ist (Failover erfordert mindestens ein Replica)
- Überprüfen Sie, ob die Sentinel-Pods (Redis) oder der Operator im Status `Running` sind
- Konsultieren Sie die Logs des Operators auf Fehler

---

## 7. Messaging (NATS, RabbitMQ)

### Produzent/Konsument getrennt

**Symptom:** Clients verlieren die Verbindung zum Message-Broker.

**Diagnose:**

```bash
# Status der Broker-Pods überprüfen
kubectl get pods | grep <nats|rabbitmq>

# Logs überprüfen
kubectl logs <broker-pod-name>
```

**Lösungen:**
- Überprüfen Sie, ob die Broker-Pods im Status `Running` sind
- Implementieren Sie eine automatische Reconnect-Logik auf Client-Seite
- Überprüfen Sie die konfigurierten Verbindungslimits

---

### Verlorene Nachrichten

**Symptom:** Gesendete Nachrichten werden von den Konsumenten nie empfangen.

**Diagnose:**

```bash
# RabbitMQ - Queues überprüfen
kubectl exec -it <rabbitmq-pod> -- rabbitmqctl list_queues name messages consumers

# NATS - JetStream-Streams überprüfen
kubectl exec -it <nats-pod> -- nats stream ls
```

**Lösungen:**
- **RabbitMQ**: Verwenden Sie Quorum Queues, um die Dauerhaftigkeit der Nachrichten zu gewährleisten
- **NATS**: Aktivieren Sie JetStream für die Nachrichtenpersistenz
- Überprüfen Sie, ob die Konsumenten verbunden und aktiv sind
- Stellen Sie sicher, dass die Queues/Subjects existieren, bevor Sie Nachrichten senden
