---
sidebar_position: 2
title: Authentifizierung
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Authentifizierung per API-Schlüssel

Ein Client der öffentlichen API (Skript, CI/CD-Pipeline, Automatisierungswerkzeug) authentifiziert sich mit einem **API-Schlüssel**. Ein Schlüssel gehört zu einem **Projekt** und gewährt ausschließlich auf diesem Projekt die Rechte seiner **Scopes**.

Die Administratoren des Projekts erstellen und widerrufen seine Schlüssel in der Konsole, über die Karte **API keys** in den Einstellungen des Projekts: siehe [Einen Schlüssel erhalten](#obtenir).

---

## Den Schlüssel übermitteln

Der Schlüssel wird bei jeder Anfrage im Header `X-Hikube-Api-Key` übermittelt:

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Verwenden Sie nicht den Header `Authorization`: Er ist den Sitzungen der Konsole vorbehalten. Enthält eine Anfrage beide, gilt der API-Schlüssel.

Eine Anfrage ohne Schlüssel wird wie ein ungültiger Schlüssel mit `403` und dem Code `10002` abgelehnt (siehe [Zugriff verweigert](./errors.md#acces-refuse)). Die Ablehnung folgt dem Fehlerformat der API, mit ihrer `requestId`.

Ein Schlüssel hat die Form `sk_hk_<keyId>_<secret>`:

- `sk_hk_` ist ein festes Präfix, mit dem Werkzeuge zur Erkennung von Secrets einen Hikube-Schlüssel erkennen, der in einem Repository oder einem Log vergessen wurde;
- `<keyId>` identifiziert den Schlüssel (32 Hexadezimalzeichen); er steht in der Liste der Schlüssel des Projekts und dient zum Widerrufen;
- `<secret>` ist der geheime Teil. Hikube speichert davon nur einen Hash: Das Secret wird **nur ein einziges Mal** bei der Erstellung des Schlüssels angezeigt und kann danach nicht wiederhergestellt werden.

---

## Scopes {#scopes}

Ein Schlüssel trägt einen oder mehrere Scopes. Jeder Scope entspricht einer Berechtigungsstufe auf dem Projekt, von der niedrigsten zur höchsten; ein Scope schließt die Rechte der niedrigeren Scopes ein.

| Scope | Entspricht der Rolle | Verwendung |
|-------|--------------------|-------|
| `read` | Read | Alle `GET`-Operationen: Ressourcen, Zustand, Kataloge |
| `write` | Use | Die Rechte von `read`, dazu eine VM starten, stoppen und neu starten. Weder Erstellen noch Ändern noch Löschen noch Lesen von Zugangsdaten |
| `admin` | Admin | Ressourcen erstellen, ändern und löschen; eine verwaltete Datenbank neu starten; Benutzer erstellen und ihre Passwörter rotieren; Zugangsdaten lesen (kubeconfig, Passwörter, S3-Schlüssel) |
| `superadmin` | Super admin | Alle Rechte auf dem Projekt |

Für eine Pipeline, die Ressourcen bereitstellt, benötigen Sie also einen `admin`-Schlüssel. Für ein Werkzeug, das VMs nach einem Zeitplan ein- und ausschaltet, genügt ein `write`-Schlüssel; für ein Überwachungs- oder Inventarwerkzeug ein `read`-Schlüssel.

:::warning Auch ein `read`-Schlüssel ist ein Secret
Jeder API-Schlüssel ist ein Secret, unabhängig von seinen Scopes: Geben Sie ihn nicht weiter und bewahren Sie ihn in einem Secret-Manager auf.
:::

Ein Schlüssel hat nie mehr Rechte als seine Scopes, unabhängig von den Rechten der Person, die ihn erstellt hat. Umgekehrt behält ein Schlüssel seine Scopes, wenn diese Person ihre Rechte verliert: Um einen Zugriff zu entziehen, widerrufen Sie den Schlüssel.

:::tip Minimale Rechte
Geben Sie jedem Schlüssel den niedrigsten Scope, der für seine Verwendung ausreicht, und verwenden Sie einen Schlüssel pro Verwendung (eine Pipeline, ein Werkzeug): So können Sie einen widerrufen, ohne die anderen zu unterbrechen.
:::

---

## Gültigkeit

Jeder Schlüssel läuft ab. Seine Gültigkeitsdauer wird bei der Erstellung gewählt aus:

| Wert | Dauer |
|--------|-------|
| `1d` | 1 Tag |
| `7d` | 7 Tage |
| `30d` | 30 Tage |
| `90d` | 90 Tage (Standard) |
| `180d` | 180 Tage |
| `365d` | 1 Jahr (Maximum) |

Es gibt keinen Schlüssel ohne Ablaufdatum. Ein abgelaufener Schlüssel wird wie ein ungültiger Schlüssel abgelehnt. Eine langfristige Integration muss daher den Austausch ihres Schlüssels vor dem Ablauf vorsehen: Erstellen Sie den neuen Schlüssel, stellen Sie ihn bereit und widerrufen Sie dann den alten.

Die Liste der Schlüssel eines Projekts zeigt für jeden Schlüssel sein Ablaufdatum (`expiresAt`) und seine letzte Verwendung (`lastUsedAt`, auf die Minute genau) an: So erkennen Sie einen nicht mehr genutzten Schlüssel, bevor Sie ihn widerrufen.

---

## Grenzen

- **Ein Schlüssel, ein Projekt.** Ein Schlüssel wirkt nur auf sein Projekt. Eine Anfrage, die auf ein anderes Projekt oder auf die Organisation zielt, wird abgelehnt.
- **Zugängliche Operationen.** Ein Schlüssel ruft nur die Operationen der [API-Referenz](/api/reference/hikube-api/) auf. Die Verwaltung des Kontos, der Organisation, der Projekte, der Mitglieder und der Schlüssel selbst bleibt angemeldeten Benutzern vorbehalten: **Ein Schlüssel kann keinen Schlüssel erstellen oder widerrufen.**
- **Anzahl der Schlüssel pro Projekt.** Die Anzahl der aktiven Schlüssel eines Projekts ist je nach Angebot der Organisation begrenzt: **1** für das Testangebot Starter, **16** für das Angebot Enterprise. Abgelaufene Schlüssel zählen nicht. Darüber hinaus wird die Erstellung abgelehnt (Code `60009`); widerrufen Sie einen Schlüssel, um einen Platz freizugeben, oder wenden Sie sich an den Support, um die Grenze anzupassen.
- **Anfragerate.** Die Anfragen sind pro Schlüssel und pro IP-Adresse begrenzt. Darüber hinaus antwortet die API mit `429`, dem Code `10008` und einem Header `Retry-After`: siehe [Ratenbegrenzungen](./errors.md#limites-de-debit).
- **Wer die Schlüssel verwaltet.** Nur die Administratoren des Projekts oder seiner Organisation erstellen, listen und widerrufen die Schlüssel eines Projekts. Niemand kann einen Schlüssel erstellen, dessen Scopes die eigenen Rechte übersteigen (Code `60003`).

:::note Angebot Starter
Da nur ein Schlüssel erlaubt ist, erfordert der Austausch eines Schlüssels eine kurze Unterbrechung: Widerrufen Sie den alten, bevor Sie den neuen erstellen.
:::

---

## Einen Schlüssel erhalten {#obtenir}

Die Administratoren des Projekts oder seiner Organisation erstellen die Schlüssel in der [Hikube-Konsole](https://console.hikube.cloud):

1. Öffnen Sie die Einstellungen des Projekts. Die Karte **API keys** listet seine Schlüssel auf.
2. Klicken Sie auf **Create a key** und geben Sie dann Folgendes an:
   - einen Namen (zum Beispiel `ci-deploiement`);
   - das **Access level**: **Read** (`read`), **Use** (`write`), **Admin** (`admin`) oder **Super admin** (`superadmin`), nie höher als Ihr eigenes;
   - die **Validity**, von 1 Tag bis 1 Jahr.
3. Kopieren Sie den Schlüssel: Er wird nur ein einziges Mal angezeigt, zusammen mit einem Beispielaufruf. Bewahren Sie ihn sofort in Ihrem Secret-Manager auf.

Die Liste zeigt für jeden Schlüssel seine Stufe, seine Erstellung, seinen Ablauf (**Expires soon** in den letzten 7 Tagen, dann **Expired**) und seine letzte Verwendung an. **Renew** erstellt einen neuen Schlüssel mit demselben Namen und derselben Stufe und schlägt dann vor, den alten zu widerrufen.

Ein angemeldeter Administrator kann die Schlüssel auch per `POST`, `GET` und `DELETE` auf `/iam/v1alpha1/projects/{projectId}/api-keys` verwalten, mit seiner Benutzersitzung und nicht mit einem API-Schlüssel. Der Erstellungskörper enthält `name`, `scopes` (zum Beispiel `["read"]`) und `validity` (`1d` bis `365d`, standardmäßig `90d`); die Antwort gibt den vollständigen Schlüssel einmalig in `secret` zurück.

Die Kennung des Projekts (`projectId`), die in den Pfaden der API verwendet wird, steht im Beispielaufruf, der mit dem Schlüssel angezeigt wird: Es ist die UUID nach `/projects/`.

---

## Einen Schlüssel widerrufen {#révoquer-une-clé}

Ein widerrufener Schlüssel wird ab der nächsten Anfrage abgelehnt. Widerrufen Sie einen Schlüssel:

- sobald er offengelegt worden sein könnte (Commit, Log, Screenshot, verlorener Rechner);
- wenn das Werkzeug, das ihn verwendete, außer Betrieb genommen wird;
- wenn die Person oder das Team, die dafür verantwortlich war, wechselt.

Widerrufen Sie den Schlüssel in der Karte **API keys** der Projekteinstellungen und bestätigen Sie dann durch Eingabe seines Namens. Mit einer Benutzersitzung bewirkt `DELETE /iam/v1alpha1/projects/{projectId}/api-keys/{keyId}` dasselbe: Die `keyId` ist der Teil des Schlüssels zwischen `sk_hk_` und dem letzten `_`. Übermitteln Sie niemals das Secret, auch nicht an den Support.

Die Schlüssel eines gelöschten Projekts werden ab der Löschung abgelehnt und anschließend entfernt.

---

## Bewährte Praktiken

- **Speichern Sie den Schlüssel in einem Secret-Manager** (Vault, Team-Passwortmanager, Secrets Ihrer CI/CD-Plattform), niemals in einem Git-Repository, einem Container-Image, einer versionierten Konfigurationsdatei oder einem Ticket.
- **In CI/CD** deklarieren Sie den Schlüssel als maskierte und geschützte geheime Variable, beschränkt auf die Branches oder Umgebungen, die ihn benötigen. Beispiel für GitLab CI:

  ```yaml title=".gitlab-ci.yml"
  deploy:
    stage: deploy
    image: alpine:3.20
    # HIKUBE_API_KEY: maskierte und geschützte CI/CD-Variable, definiert in den
    # Einstellungen des GitLab-Projekts. PROJECT_ID ist kein Secret.
    variables:
      HIKUBE_API: "<Basis-URL der API>"   # siehe „Übersicht“
      PROJECT_ID: "<project_id>"
    script:
      - apk add --no-cache curl jq
      - >
        curl -sS --fail-with-body
        "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks"
        -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.totalCount'
  ```

- **Protokollieren Sie den Schlüssel nicht**: Vermeiden Sie `curl -v` und `set -x` in Skripten, die ihn verwenden, da diese die Header anzeigen.
- **Ein Schlüssel pro Verwendung**, mit dem minimalen Scope und der kürzesten Dauer, die mit der Verwendung vereinbar ist.
- **Überwachen Sie den Ablauf** und planen Sie den Austausch langfristiger Schlüssel.
- **Reagieren Sie auf ein Leck**, indem Sie zuerst den Schlüssel widerrufen und dann ermitteln, wo er verwendet wurde.

<NavigationFooter
  nextSteps={[
    {label: "Schnellstart", href: "../quick-start"},
    {label: "Fehler", href: "../errors"},
  ]}
  seeAlso={[
    {label: "Übersicht der API", href: "../overview"},
  ]}
/>
