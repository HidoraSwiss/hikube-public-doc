---
sidebar_position: 4
title: Fehler
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Fehler der API

Eine fehlgeschlagene Anfrage gibt einen **HTTP-Code** und einen **JSON-Body** zurück, der einen stabilen **numerischen Code** enthält. Stützen Sie die Logik Ihrer Skripte auf den HTTP-Code und auf diesen numerischen Code, niemals auf den Text der Meldung, der sich ändern kann.

Dieses Format gilt für alle Fehler, einschließlich abgelehnter Authentifizierungen und Überschreitungen der [Ratenbegrenzung](#limites-de-debit).

---

## Format

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 30101,
  "message": "invalid name: must start with a letter, end with a letter or digit, and contain only lowercase letters, digits, and hyphens",
  "details": []
}
```

| Feld | Typ | Beschreibung |
|-------|------|-------------|
| `requestId` | Zeichenkette | Kennung der Anfrage. Teilen Sie sie dem Support bei jeder Analyseanfrage mit |
| `code` | Ganzzahl | Numerischer Code des Fehlers (siehe unten). Fehlt, wenn der Fehler keinen eigenen Code hat |
| `message` | Zeichenkette | Lesbare Beschreibung, auf Englisch. Bei einem Validierungsfehler nennt sie das betroffene Feld |
| `details` | Array | Zusätzliche Informationen, meist leer. Zum Beispiel die Liste der VMs, die ein VPC noch verwenden, oder die nicht verfügbaren GPU-Typen |

### Kennung der Anfrage {#identifiant-de-requete}

Jede Antwort, auch eine `2xx`-Antwort, trägt einen Header `x-request-id`. Der Body eines Fehlers enthält zusätzlich eine `requestId`, die nicht immer denselben Wert wie der Header hat. Teilen Sie dem Support bei jeder Analyseanfrage die eine oder die andere mit, und beide, wenn Sie sie haben: Bewahren Sie den Header in den Logs Ihrer Werkzeuge auf, damit lässt sich auch eine erfolgreiche Anfrage wiederfinden.

```bash
curl -sS -D - -o /dev/null "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | grep -i '^x-request-id'
```

---

## HTTP-Codes

| HTTP-Code | Bedeutung | Was tun |
|-----------|---------------|-----------|
| `400` | Ungültige Anfrage: fehlendes oder fehlerhaftes Feld, Wert außerhalb der Grenzen, Operation im aktuellen Zustand der Ressource nicht möglich | Korrigieren Sie die Anfrage anhand von `message`; wiederholen Sie sie nicht unverändert |
| `401` | Ungültiges oder abgelaufenes Benutzertoken (Code `10001`). Betrifft nur Sitzungen der Konsole, nicht API-Schlüssel | Senden Sie mit einem API-Schlüssel keinen Header `Authorization` |
| `403` | Zugriff verweigert (Code `10002`), auch für eine Anfrage ohne Schlüssel | Siehe [Zugriff verweigert](#acces-refuse) |
| `404` | Ressource im Projekt nicht gefunden | Prüfen Sie den Namen der Ressource im Pfad |
| `409` | Konflikt: Eine Ressource mit diesem Namen existiert bereits, wird noch verwendet oder wurde gleichzeitig geändert | Wählen Sie einen anderen Namen, geben Sie die Ressource frei oder lesen Sie sie erneut, bevor Sie es noch einmal versuchen |
| `429` | Zu viele Anfragen (Code `10008`) | Warten Sie die im Header `Retry-After` angegebene Zeit ab und versuchen Sie es dann erneut. Siehe [Ratenbegrenzungen](#limites-de-debit) |
| `500` | Interner Fehler | Versuchen Sie es später erneut; wenn der Fehler bestehen bleibt, wenden Sie sich mit der `requestId` an den Support |
| `503` | Dienst vorübergehend nicht verfügbar. Mit dem Code `10004` konnte der Schlüssel nicht geprüft werden: Er wird nicht als ungültig eingestuft | Versuchen Sie es mit zunehmender Wartezeit erneut (zum Beispiel 1 s, 2 s, 4 s…) |

---

## Zugriff verweigert {#acces-refuse}

Jede schlüsselbezogene Zugriffsverweigerung gibt **dieselbe** Antwort `403` mit dem Code `10002` zurück, unabhängig vom Grund:

- kein Schlüssel übermittelt (Header `X-Hikube-Api-Key` fehlt oder ist leer);
- Schlüssel fehlerhaft, unbekannt, widerrufen oder abgelaufen;
- Schlüssel eines anderen Projekts als dem im Pfad, oder nicht existierendes Projekt;
- unzureichender Scope (zum Beispiel ein `read`-Schlüssel für eine Erstellung);
- Operation, die für API-Schlüssel nicht zugänglich ist (Verwaltung des Kontos, der Organisation, der Projekte oder der Schlüssel).

Diese einheitliche Antwort ist gewollt: Sie verrät nichts über die Existenz eines Projekts oder eines Schlüssels. Prüfen Sie zur Diagnose der Reihe nach den Schlüssel (`HIKUBE_API_KEY`), die Kennung des Projekts (`PROJECT_ID`) und dann den erforderlichen Scope (siehe [Scopes](./authentication.md#scopes)).

---

## Allgemeine Codes

| Code | HTTP | Bedeutung |
|------|------|---------------|
| `10001` | 401 | Ungültiges oder abgelaufenes Benutzertoken. Eine Anfrage ohne Schlüssel und ohne Token erhält `10002`, nicht `10001` |
| `10002` | 403 | Zugriff verweigert (siehe oben) |
| `10004` | 503 | Der Schlüssel konnte vorübergehend nicht geprüft werden. Dies ist keine Ablehnung: Der Schlüssel ist nicht die Ursache, versuchen Sie es erneut |
| `10008` | 429 | Zu viele Anfragen: Warten Sie die Zeit aus `Retry-After` ab und versuchen Sie es dann erneut (siehe [Ratenbegrenzungen](#limites-de-debit)) |
| `10005` | 403 oder 400 | Ablehnung durch eine Regel der Plattform: Die Meldung nennt das abgelehnte Feld, `details` die Regel und ihren Grund |
| `10006` | 400 | Ein Pfad in `updateMask` bezeichnet kein änderbares Feld der `PATCH`-Anfrage (siehe [Teilweise Aktualisierungen](./overview.md#mises-a-jour-partielles)) |

Ein Client, der seine Anfrage abbricht oder seine eigene Zeitüberschreitung erreicht, erhält `499` oder `504`, ohne numerischen Code.

---

## Ratenbegrenzungen {#limites-de-debit}

Die Anfragen sind **pro API-Schlüssel** und **pro IP-Adresse** begrenzt. Beide Grenzen gelten gleichzeitig: Eine Anfrage wird abgelehnt, sobald eine von ihnen erreicht ist. Aktuelle Werte, die sich ändern können:

| Grenze | Burst | Dauerrate |
|--------|-------|---------------|
| Pro API-Schlüssel | 120 Anfragen | 300 Anfragen pro Minute |
| Pro IP-Adresse | 300 Anfragen | 600 Anfragen pro Minute |

Der Burst ist die Anzahl der Anfragen, die auf einmal akzeptiert werden. Er füllt sich anschließend im Takt der Dauerrate wieder auf.

Jede Antwort trägt zwei Header, die die für den Aufrufer restriktivste Grenze beschreiben:

| Header | Beschreibung |
|---------|-------------|
| `X-RateLimit-Limit` | Anzahl der von dieser Grenze erlaubten Anfragen |
| `X-RateLimit-Remaining` | Anzahl der noch verfügbaren Anfragen |

Darüber hinaus wird die Anfrage mit `429` und dem Code `10008` abgelehnt. Die Antwort trägt einen Header `Retry-After` in Sekunden (derzeit 5): Warten Sie diese Zeit ab und versuchen Sie es dann erneut. Versuchen Sie es nicht sofort erneut, die Anfrage würde wieder abgelehnt.

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 10008,
  "message": "Too many requests. Please slow down.",
  "details": []
}
```

Mehrere Werkzeuge, die sich einen Schlüssel oder eine IP-Adresse teilen (zum Beispiel die Jobs derselben Pipeline hinter einem NAT-Gateway), teilen sich auch deren Grenze. Geben Sie jedem Werkzeug einen eigenen Schlüssel und verteilen Sie die `GET`-Anfragen, die den Zustand einer Ressource verfolgen, zeitlich.

---

## Codes der Dienste

Jeder Dienst hat seinen eigenen Codebereich. Die letzten Ziffern folgen überall derselben Logik:

| Ende des Codes | Kategorie | Beispiele |
|-------------|-----------|----------|
| `001` bis `099` | Zustand der Plattform: nicht gefunden (`…001`), existiert bereits (`…002`), Zugriff verweigert (`…003`), nicht verfügbar (`…005`), Bereitstellung fehlgeschlagen (`…006`) | `30001` Disk nicht gefunden, `80002` PostgreSQL-Cluster existiert bereits |
| `100` bis `199` | Validierung der Anfrage: ungültige Projektkennung (`…100`), ungültiger Name (`…101`), dann ein Code pro Feld | `20103` unbekannter Instanztyp, `70103` nicht unterstützte Kubernetes-Version |
| `200` bis `299` | Geschäftsregel: Operation im aktuellen Zustand nicht möglich | `20200` Disk bereits an eine andere VM angehängt, `20201` VM bereits gestartet |

| Präfix | Dienst |
|---------|---------|
| `20xxx` | Virtuelle Maschinen |
| `30xxx` | Disks |
| `50xxx` | Buckets |
| `60xxx` | API-Schlüssel |
| `70xxx` | Kubernetes |
| `80xxx` | PostgreSQL |
| `110xxx` | MariaDB |
| `120xxx` | Redis |
| `140xxx` | RabbitMQ |
| `150xxx` | MongoDB |
| `160xxx` | Netzwerk |
| `170xxx` | Preise |
| `180xxx` | Backups |

Einige nützliche fachliche Codes:

| Code | HTTP | Bedeutung |
|------|------|---------------|
| `20200` | 400 | Die Disk ist bereits an eine andere VM angehängt |
| `20201` / `20202` | 400 | Die VM ist bereits gestartet / bereits gestoppt |
| `20204`, `20205`, `20207` | 400 | Angeforderte GPU nicht verfügbar, in unzureichender Anzahl oder nicht auf demselben Server zusammenführbar |
| `20206` | 400 | Keine öffentliche IPv4-Adresse mehr verfügbar |
| `30007` | 400 | Die Disk ist an eine VM angehängt: Trennen Sie sie, bevor Sie sie löschen |
| `80201`, `110201`, `120201`, `140201`, `150201` | 400 | Wechsel von einer einzelnen Instanz zu einem replizierten Cluster (oder umgekehrt) nach der Erstellung nicht möglich |
| `80205`, `110205`, `120205`, `140205`, `150205` | 400 | Neustart einer Datenbank, die noch erstellt wird: Es gibt nichts neu zu starten, versuchen Sie es erneut, sobald der Cluster bereit ist |
| `160003` / `160012` | 409 | Das VPC / das Subnetz wird noch von VMs verwendet, die in `details` aufgeführt sind |
| `160152` | 400 | Der Adressbereich überschneidet sich mit einem bestehenden Subnetz |
| `180200` | 400 | Das Backup-Ziel ist noch nicht bereit |
| `180205` | 400 | Für diese Anwendung läuft bereits eine Wiederherstellung |
| `180214` | 400 | Der angeforderte Wiederherstellungszeitpunkt liegt außerhalb des Wiederherstellungsfensters |

Die [API-Referenz](/api/reference/hikube-api/) gibt für jede Operation die möglichen HTTP-Codes an.

---

## Codes zu API-Schlüsseln

Diese Codes betreffen die Verwaltung der Schlüssel (Erstellung, Auflistung, Widerruf), die den Administratoren des Projekts vorbehalten ist, über die Konsole oder mit ihrer Benutzersitzung (siehe [Einen Schlüssel erhalten](./authentication.md#obtenir)).

| Code | HTTP | Bedeutung |
|------|------|---------------|
| `60003` | 403 | Angeforderter Scope übersteigt die Rechte der Person, die den Schlüssel erstellt |
| `60005` | 503 | Schlüsselgrenze des Projekts vorübergehend nicht lesbar; versuchen Sie es erneut |
| `60006` | 404 | Schlüssel in diesem Projekt nicht gefunden |
| `60007` | 503 | Speichern vorübergehend nicht möglich. Bei einem Widerruf kann dieser bereits angewendet worden sein: Versuchen Sie es erneut, die Operation kann gefahrlos wiederholt werden |
| `60008` | 400 | API-Schlüssel in dieser Umgebung nicht aktiviert |
| `60009` | 400 | Maximale Anzahl aktiver Schlüssel für das Projekt erreicht |
| `60106` | 400 | Ungültiger Scope (zulässige Werte: `read`, `write`, `admin`, `superadmin`) |
| `60107` | 400 | Ungültige Schlüsselkennung (32 Hexadezimalzeichen in Kleinbuchstaben) |
| `60108` | 400 | Ungültiger Schlüsselname (Pflichtfeld, höchstens 255 Zeichen, ohne Steuerzeichen) |
| `60109` | 400 | Ungültige Gültigkeitsdauer (zulässige Werte: `1d`, `7d`, `30d`, `90d`, `180d`, `365d`) |

---

## Gefahrlos wiederholen

- Wiederholen Sie Antworten `503` und `10004` mit zunehmender Wartezeit und einer begrenzten Anzahl von Versuchen.
- Warten Sie nach einer `429` die Zeit aus dem Header `Retry-After` ab, bevor Sie es erneut versuchen.
- Wiederholen Sie eine `400` oder eine `403` nicht unverändert: Die Anfrage oder der Schlüssel muss zuerst korrigiert werden.
- Rufen Sie nach einer Erstellung, die wegen einer Zeitüberschreitung fehlgeschlagen ist, die Ressource mit `GET` ab, bevor Sie sie erneut erstellen: Sie kann erstellt worden sein, und ein neuer Versuch würde `409` zurückgeben.

<NavigationFooter
  nextSteps={[
    {label: "FAQ zur API", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Authentifizierung", href: "../authentication"},
    {label: "API-Referenz", href: "../reference/hikube-api"},
  ]}
/>
