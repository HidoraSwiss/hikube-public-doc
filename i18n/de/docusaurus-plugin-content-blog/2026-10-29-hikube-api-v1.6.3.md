---
title: Hikube API v1.6.3
authors: [hikube]
tags: [release]
---

Diese Version sagt Ihnen über das neue Feld `statusDetail`, warum eine Ressource nicht bereit ist, und liefert den Zustand der Control Plane eines Kubernetes-Clusters. Jeder Dienst gibt sein Standard-Preset an. Außerdem behebt sie das Hinzufügen von SSH-Schlüsseln auf einer Windows-VM, das ihr Passwort ersetzte, sowie die Rotation der Zugangsdaten eines Bucket-Benutzers. Die Ergänzungen entfernen nichts aus dem bestehenden Vertrag.

**Verhaltensänderung**: Die Passwortrotation eines MariaDB- oder RabbitMQ-Benutzers wird jetzt abgelehnt, weil sie nie angewendet wurde (siehe *Sicherheit*).

<!-- truncate -->

## Hinzugefügt

- **Detaillierter Status** — Projekte, VPCs, Buckets, Kubernetes-Cluster sowie PostgreSQL-, MariaDB-, MongoDB-, Redis- und RabbitMQ-Cluster liefern ein Feld `statusDetail`, das die Ursache hinter `status` angibt. Sein Feld `reason` nimmt einen der Werte `install_failed` (die Ressource konnte nicht erstellt werden), `update_failed` (die letzte Änderung konnte nicht angewendet werden; die Ressource kann noch mit ihrer vorherigen Konfiguration laufen), `workloads_not_ready` (die Ressource ist angewendet, aber einige ihrer Komponenten laufen nicht) und, nur für einen Kubernetes-Cluster, `quota_exceeded` (Knoten können nicht starten, weil das Projektkontingent erschöpft ist) oder `node_failed` (ein Knoten ist fehlerhaft) an. `reason` ist leer, wenn es nichts zu melden gibt. `message` liefert einen englischen Satz zur Anzeige und `since` den Zeitpunkt, seit dem die Ursache gilt. Treffen Sie Ihre Entscheidungen anhand von `reason`: Der Wortlaut von `message` kann sich ändern. Weitere Werte können hinzukommen: Behandeln Sie einen unbekannten Wert als allgemeinen Fehler.

- **Kubernetes: Zustand der Control Plane** — `GET /kubernetes/v1alpha1/projects/{project_id}/clusters/{name}/control-plane/status` liefert den Zustand der Control Plane eines Clusters: `healthy`, `degraded` oder `critical`, mit seinem Grund, zum Beispiel `replicas_not_ready`, `out_of_memory` oder `memory_near_limit`. Die Antwort beschreibt jedes Replikat im Einzelnen (Zustand, Neustarts und Ursache des letzten, genutzter Arbeitsspeicher und CPU im Verhältnis zum Limit) sowie den Zustand des etcd des Clusters. Dieser Zustand wird bei Bedarf abgefragt: Er ist nicht Teil der Cluster-Ressource.

- **Standard-Presets** — `GET /{service}/v1alpha1/presets` liefert zusätzlich `default`, das Preset, das angeboten werden soll, wenn nichts für eine andere Wahl spricht, für Kubernetes, PostgreSQL, MariaDB, MongoDB, Redis und RabbitMQ. Es ist immer eines der Presets der Liste. Die API wendet diesen Standard nicht von sich aus an: Eine Erstellung ohne Preset wird weiterhin abgelehnt.

- **Fehlercodes** — Sie werden mit HTTP 400 zurückgegeben. Das Fehlerformat ist unter [Fehler](/api/errors/) beschrieben.

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `70209` | Kubernetes | Das Projektkontingent lässt keinen Platz, um die Änderung der Größe oder der Replikate der Control Plane abzuschließen: Erhöhen Sie das Kontingent |
| `110206` | MariaDB | Passwortrotation eines Benutzers noch nicht verfügbar: Das neue Passwort würde nicht angewendet |
| `110207` | MariaDB | Cluster gerade erst erstellt: Wiederholen Sie die Erstellung des Benutzers in einigen Sekunden |
| `140206` | RabbitMQ | Passwortrotation eines Benutzers noch nicht verfügbar: Das neue Passwort würde nicht angewendet |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus Ihren eigenen Werkzeugen aufrufen.

- **Kubernetes** — Eine Änderung der Größe oder der Anzahl der Replikate der Control Plane wird geprüft, bevor sie angewendet wird. Während des schrittweisen Austauschs reserviert die Control Plane mehr Ressourcen aus dem Projektkontingent. Lässt das Kontingent dies nicht zu, wird die Aktualisierung mit dem Code `70209` abgelehnt, und nichts wird geändert. Die Meldung gibt für jede Ressource an, um wie viel das Kontingent zu erhöhen ist, und `details.quotaShortfall` liefert dieselbe Information als JSON.

- **MariaDB und RabbitMQ** — `POST .../clusters/{cluster}/users/{user}/rotate-password` wird mit dem Code `110206` (MariaDB) oder `140206` (RabbitMQ) abgelehnt, ohne das Passwort zu verändern. Die Rotation wird wieder freigegeben, sobald sie angewendet werden kann.

- **MariaDB** — Das Passwort eines neuen Benutzers wird gespeichert, bevor sein Konto erstellt wird. So ist sichergestellt, dass das zurückgegebene Passwort tatsächlich das des Kontos ist. Auf einem gerade erst erstellten Cluster kann die Erstellung eines Benutzers mit dem Code `110207` abgelehnt werden: Versuchen Sie es einige Sekunden später erneut.

## Behoben

- **Compute** — Auf einer Windows-VM ersetzt das Hinzufügen oder Entfernen eines SSH-Schlüssels nicht mehr das bei der Erstellung vergebene Administratorpasswort. Die Schlüssel gelten ab dem nächsten Start der VM (Neustart, oder Stoppen und anschließendes Starten), was `restartRequired` in der Antwort der Aktualisierung meldet. Ein unter Windows hinzugefügter Schlüssel bleibt erhalten. Das Neuladen der UserData (`reload-userdata`) stellt das Passwort der Erstellung wieder her, statt es zu verlieren.

- **Buckets** — Das Erstellen eines Bucket-Benutzers und die Rotation seiner Zugangsdaten schlagen nicht mehr nach einer Wartezeit von etwa zwei Minuten fehl, wenn die Schlüssel verzögert ausgestellt werden. Eine Rotation liefert immer Schlüssel, die sich von den bisherigen unterscheiden.

- **Verwaltete Datenbanken** — Die Adresse (`host`) einer exponierten Datenbank erscheint in den Echtzeit-Aktualisierungen der Konsole nicht mehr leer. Die Antworten der API waren nicht betroffen.

## Sicherheit

- **MariaDB und RabbitMQ** — Die Passwortrotation eines Benutzers lieferte ein neues Passwort, das nie angewendet wurde: Das alte blieb gültig. Wenn Sie vor dieser Version eine Rotation durchgeführt haben, ist das Passwort des Kontos weiterhin das alte. Wenn Sie es für kompromittiert halten, wenden Sie sich an den Support.

- **Buckets** — Eine Rotation der Zugangsdaten eines Bucket-Benutzers konnte die alten Schlüssel zurückgeben, als wären sie neu, ohne sie zu widerrufen. Wenn Ihnen eine vor dieser Version durchgeführte Rotation dieselben Schlüssel wie zuvor geliefert hat, führen Sie sie erneut durch.

:::warning Windows-VMs, die vor dieser Version erstellt wurden
Damit Änderungen an SSH-Schlüsseln beim Neustart gelten, laden Sie die UserData der VM einmal neu. Dieses Neuladen stellt das bei der Erstellung vergebene Administratorpasswort wieder her: Wenn Sie es unter Windows geändert haben, ändern Sie es danach erneut.
:::
