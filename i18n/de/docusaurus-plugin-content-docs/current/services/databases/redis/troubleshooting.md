---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Redis

### Datenverlust nach Neustart

**Ursache**: Die verwendete `storageClass` ist `local`, was bedeutet, dass die Daten nur auf dem physischen Knoten gespeichert werden, auf dem der Pod lief. Wenn der Pod auf einen anderen Knoten umgeplant wird, gehen die vorherigen Daten verloren.

**Lösung**:

1. Überprüfen Sie die verwendete `storageClass`:
   ```bash
   kubectl get pvc -l app=redis-<name>
   ```
2. Wenn Sie nur ein Replika verwenden (`replicas` = 1), wechseln Sie zu `storageClass: replicated`, damit der Speicher das Fehlen der Anwendungsreplikation kompensiert. Bei mehreren Replikas (`replicas` >= 3) ist `storageClass: local` angemessen, da Redis Sentinel bereits die Hochverfügbarkeit gewährleistet:
   ```yaml title="redis.yaml"
   spec:
     storageClass: replicated    # Wenn replicas = 1
     # storageClass: local       # Wenn replicas >= 3 (Sentinel gewährleistet die HA)
   ```
3. Wenden Sie die Änderung an. Beachten Sie, dass eine Änderung der `storageClass` in der Regel eine Neuanlage der PVC erfordert.
4. Stellen Sie außerdem sicher, dass `replicas` >= 3 ist, um von der Redis Sentinel-Replikation zu profitieren.

### Redis Sentinel konvergiert nicht

**Ursache**: Die Anzahl der Replikas ist gerade oder unter 3, was das Sentinel-Quorum am ordnungsgemäßen Funktionieren hindert. Sentinel benötigt eine Mehrheit, um einen neuen Primary zu wählen.

**Lösung**:

1. Überprüfen Sie die Anzahl der Replikas:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Stellen Sie sicher, dass eine **ungerade** Anzahl >= 3 verwendet wird:
   ```yaml title="redis.yaml"
   spec:
     replicas: 3    # Oder 5, niemals 2 oder 4
   ```
3. Konsultieren Sie die Sentinel-Logs, um Konvergenzprobleme zu identifizieren:
   ```bash
   kubectl logs -l app=rfs-redis-<name>
   ```
4. Überprüfen Sie die Netzwerkverbindung zwischen den Redis-Pods. DNS- oder Netzwerkprobleme können die Knotenerkennung verhindern.

### Speicher gesättigt (OOMKilled)

**Ursache**: Das Redis-Dataset überschreitet den dem Container zugewiesenen Speicher. Kubernetes beendet den Pod, wenn er sein Speicherlimit überschreitet.

**Lösung**:

1. Überprüfen Sie, ob der Pod wegen OOM beendet wurde:
   ```bash
   kubectl describe pod rfr-redis-<name>-0 | grep -i oom
   ```
2. Erhöhen Sie den zugewiesenen Speicher über `resources.memory` oder ein höheres `resourcesPreset`:
   ```yaml title="redis.yaml"
   spec:
     resources:
       cpu: 1000m
       memory: 2Gi    # Speicher erhöhen
   ```
3. Überprüfen Sie die Redis-Eviction-Policy (`maxmemory-policy`). Standardmäßig gibt Redis einen Fehler zurück, wenn der Speicher voll ist. Erwägen Sie `allkeys-lru`, wenn Redis als Cache dient.
4. Überwachen Sie die Dataset-Größe:
   ```bash
   redis-cli -h rfr-redis-<name> -p 6379 -a <password> INFO memory
   ```

### Verbindungs-Timeout

**Ursache**: Die Redis-Pods laufen nicht, die Service-Endpoints sind leer oder die Authentifizierungskonfiguration auf der Client-Seite stimmt nicht mit der des Servers überein.

**Lösung**:

1. Überprüfen Sie, dass die Pods den Status `Running` haben:
   ```bash
   kubectl get pods -l app=redis-<name>
   ```
2. Überprüfen Sie, dass die Services Endpoints haben:
   ```bash
   kubectl get endpoints rfr-redis-<name>
   kubectl get endpoints rfs-redis-<name>
   ```
3. Wenn `authEnabled: true`, stellen Sie sicher, dass Ihr Client das korrekte Passwort bereitstellt.
4. Testen Sie die Verbindung von einem Debug-Pod:
   ```bash
   kubectl run test-redis --rm -it --image=redis:7 -- redis-cli -h rfr-redis-<name> -p 6379 -a <password> PING
   ```

### Authentifizierung schlägt fehl

**Ursache**: Das verwendete Passwort stimmt nicht mit dem im Kubernetes-Secret gespeicherten überein, oder `authEnabled` ist auf dem Server nicht aktiviert, während der Client ein Passwort sendet (oder umgekehrt).

**Lösung**:

1. Rufen Sie das korrekte Passwort aus dem Secret ab:
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
2. Überprüfen Sie, dass `authEnabled: true` in Ihrem Manifest konfiguriert ist:
   ```yaml title="redis.yaml"
   spec:
     authEnabled: true
   ```
3. Stellen Sie sicher, dass Ihr Client genau das in Schritt 1 abgerufene Passwort verwendet.
4. Wenn Sie die `authEnabled`-Konfiguration geändert haben, müssen bestehende Clients aktualisiert werden, um die Änderung widerzuspiegeln.
