---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Einen RabbitMQ-Cluster in 5 Minuten erstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten **RabbitMQ-Clusters** in der [Hikube-Konsole](https://console.hikube.cloud) bis zum Senden einer ersten Nachricht.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen betriebsbereiten **RabbitMQ-Cluster** in Ihrem Projekt
- Einen **VHost** und einen **Benutzer** mit seinen Rechten
- Das **Passwort** dieses Benutzers und die **Verbindungsadresse** des Clusters
- Eine erste mit einem AMQP-Client veröffentlichte Nachricht

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe den [Hikube-Schnellstart](../../../getting-started/quick-start.md))
- Eine ausreichende Projekt-Quota für den Cluster (CPU, Arbeitsspeicher und Speicher)
- **Python 3** mit installiertem Modul `pika` für den Test in Schritt 5 (`pip install pika`)

---

## Schritt 1: Den Erstellungsassistenten öffnen

1. Melden Sie sich in der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **DB & Messaging** → **RabbitMQ**. Die Seite **RabbitMQ Clusters** wird angezeigt.
3. Klicken Sie auf **Create a cluster**. Der Assistent **Create a RabbitMQ cluster** öffnet sich.

---

## Schritt 2: Den Cluster konfigurieren und erstellen

Der Assistent umfasst fünf Schritte. Ein Banner zeigt die geschätzten Kosten und im Schritt **Configuration** den Quota-Verbrauch des Projekts an.

### General

Geben Sie den **Cluster Name** ein (standardmäßig wird ein Name vorgeschlagen). Er muss 3 bis 16 Zeichen umfassen: Kleinbuchstaben, Ziffern und Bindestriche, mit einem Buchstaben beginnen und mit einem Buchstaben oder einer Ziffer enden. Beispiel: `rabbit-demo`.

### Configuration

| Feld | Empfohlener Wert für diese Anleitung | Hinweis |
|-------|--------------------------------|----------|
| **RabbitMQ Version** | 4.2 | Angebotene Versionen: 4.2, 4.1, 4.0, 3.13 |
| **Preset** | Small | Nach der Erstellung nicht änderbar |
| **Disk size (GB)** | 10 | Kapazität pro Knoten |
| **Number of replicas** | 3 (Max High Availability) | 1 (Standalone), 3 oder 5; nach der Erstellung nicht änderbar |
| **External access** | Aktiviert | Macht den Cluster im Internet erreichbar; erforderlich für den Test von Ihrem Rechner aus |

:::note
Wenn die Speicher-Quota des Projekts überschritten ist, zeigt die Konsole „Storage quota exceeded for this project“ an und die Schaltfläche **Next** bleibt inaktiv. Verringern Sie die Größe oder die Anzahl der Replicas oder lassen Sie die Quota des Projekts erhöhen.
:::

### VHosts

Geben Sie einen **VHost Name** ein (zum Beispiel `demo`) und klicken Sie auf **Add**. Mindestens ein VHost ist erforderlich, um zum nächsten Schritt zu gelangen.

### Users

1. Geben Sie unter **Add a new user** den **Username** ein (zum Beispiel `app-user`; Kleinbuchstaben, Ziffern und Bindestriche).
2. Wählen Sie unter **VHost access** für den VHost `demo` die Option **Administrator**.
3. Klicken Sie auf **Add user**.

Mindestens ein Benutzer ist erforderlich, um fortzufahren.

### Summary

Prüfen Sie die Zusammenfassung (Name, Version, Preset, Replicas, Größe, Netzwerk **Public** oder **Private**, geschätzte Kosten, Anzahl der zu erstellenden VHosts und Benutzer) und klicken Sie dann auf **Create cluster**.

### Done: das Passwort kopieren

Am Ende der Bereitstellung zeigt der Bildschirm **Done** die Meldung **Creation complete!** und für jeden erstellten Benutzer sein **Password** an.

:::warning Passwort wird nur einmal angezeigt
Kopieren Sie das Passwort sofort und bewahren Sie es in einem Passwort-Manager auf. Es wird nach dem Verlassen dieses Bildschirms nicht mehr angezeigt. Bei Verlust generieren Sie mit der Aktion **Change Password** ein neues (siehe [VHosts und Benutzer verwalten](./how-to/manage-vhosts-users.md)).
:::

Klicken Sie anschließend auf **Finish**, um zur Liste der Cluster zurückzukehren.

---

## Schritt 3: Den Status des Clusters prüfen

1. In der Liste **RabbitMQ Clusters** erscheint der Cluster mit dem Status **Creating** und anschließend **Ready**, sobald er betriebsbereit ist.
2. Klicken Sie auf den Cluster, um seine Detailseite zu öffnen:
   - **General Information**: **Version**, **Replicas**, **Volume Size**;
   - **VHosts** und **Users**: die vom Assistenten erstellten Elemente;
   - **Connection**: **Host**, **Status** und **External Access** (**Enabled** oder **Disabled**).

---

## Schritt 4: Zugangsdaten abrufen

Für die Verbindung benötigen Sie:

| Information | Fundort |
|-------------|---------------|
| **Username** | Abschnitt **Users** der Clusterseite |
| **Password** | Im Bildschirm **Done** des Assistenten kopiert (Schritt 2) |
| **VHost** | Abschnitt **VHosts** der Clusterseite |
| **Host** | Feld **Host** im Abschnitt **Connection** |
| **Port** | 5672 (AMQP) |

Solange die Adresse nicht zugewiesen ist, zeigt das Feld **Host** „Not available / Creating“ an. Sobald die Adresse zugewiesen ist, kopieren Sie sie mit der Kopierschaltfläche.

:::note
Das Feld **Host** ist ausgefüllt, wenn der **External Access** aktiviert ist. Ohne externen Zugriff bleibt der Cluster von den VMs des Projekts über eine interne Adresse erreichbar, die die Konsole nicht anzeigt: [Wenden Sie sich an den Support](mailto:support@hidora.io), um sie zu erhalten.
:::

Der Bildschirm **Done** des Assistenten zeigt außerdem, sofern der Host bereits bekannt ist, eine Verbindungszeichenfolge der folgenden Form an:

```text
amqp://app-user:<password>@<host>:5672
```

---

## Schritt 5: Verbindung und Test

Erstellen Sie das folgende Skript und ersetzen Sie dabei Host und Passwort durch Ihre Werte:

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('app-user', '<password>')
parameters = pika.ConnectionParameters(
    host='<host>',
    port=5672,
    virtual_host='demo',
    credentials=credentials,
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Deklaration einer Quorum Queue (auf die Knoten des Clusters repliziert)
channel.queue_declare(queue='test', durable=True, arguments={'x-queue-type': 'quorum'})

# Senden einer Nachricht
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Nachricht erfolgreich gesendet")

# Lesen der Nachricht
method, properties, body = channel.basic_get(queue='test', auto_ack=True)
print(f"Nachricht empfangen: {body.decode()}")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Erwartetes Ergebnis:**

```console
Nachricht erfolgreich gesendet
Nachricht empfangen: Hello Hikube!
```

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Häufige Ursachen | Maßnahme |
|----------|-------------------|--------|
| Der Cluster bleibt im Status **Creating** | Bereitstellung läuft | Warten Sie einige Minuten; ändert sich der Status nicht, lesen Sie die [Fehlerbehebung](./troubleshooting.md) |
| Status **Error** | Bereitstellung fehlgeschlagen | [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen und die Kennung des Clusters an |
| `ACCESS_REFUSED` beim Verbinden | Falsches Passwort oder Benutzer ohne Rechte auf dem VHost | Prüfen Sie den VHost unter **Manage Access**; generieren Sie bei Bedarf das Passwort neu |
| Verbindung nicht möglich (Timeout) | Externer Zugriff deaktiviert, falscher Host oder Port | Prüfen Sie **External Access** und **Host** im Abschnitt **Connection**; der AMQP-Port ist 5672 |
| `NOT_FOUND - no vhost` | Falscher VHost-Name im Client | Verwenden Sie exakt den im Abschnitt **VHosts** angezeigten Namen |

---

## Schritt 7: Bereinigung

1. Öffnen Sie die Detailseite des Clusters und klicken Sie auf **Delete** (oder öffnen Sie in der Liste das Aktionsmenü des Clusters und wählen Sie **Delete cluster**).
2. Geben Sie im Bestätigungsfenster den exakten Namen des Clusters in **Resource name to confirm** ein.
3. Klicken Sie auf **Permanently delete**.

:::warning
Diese Aktion ist unwiderruflich: Der Cluster, seine VHosts, seine Benutzer und alle gespeicherten Nachrichten werden endgültig gelöscht.
:::

---

## Zusammenfassung

Sie haben in der Konsole Folgendes erstellt:

- Einen hochverfügbaren RabbitMQ-Cluster mit **3 Knoten**
- Einen **VHost** und einen **Administrator-Benutzer** für diesen VHost
- Eine funktionierende **AMQP-Verbindung** von Ihrem Rechner aus

<NavigationFooter
  nextSteps={[
    {label: "VHosts und Benutzer verwalten", href: "../how-to/manage-vhosts-users"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
