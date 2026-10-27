---
sidebar_position: 6
title: FAQ
---

# FAQ — Öffentliche API

### Ist die API bereit für die Produktion?

Sie ist eine **Vorschauversion** (`v1alpha1`): Pfade, Felder und die öffentliche URL können sich noch ändern. Sie können sie für Ihre Automatisierungen verwenden, sofern Sie ihre Änderungen im [Changelog](/blog) verfolgen.

---

### Wie erhalte ich einen API-Schlüssel?

Ein Administrator des Projekts oder der Organisation erstellt ihn in der Konsole, über die Karte **API keys** in den Einstellungen des Projekts, und wählt dabei seinen Namen, seine Berechtigungsstufe und seine Gültigkeitsdauer (siehe [Einen Schlüssel erhalten](./authentication.md#obtenir)).

---

### Wo finde ich die Kennung meines Projekts?

Im Beispielaufruf, den die Konsole bei der Erstellung eines API-Schlüssels anzeigt: Es ist die UUID nach `/projects/`. Sie unterscheidet sich vom Namen des Projekts und von der **Organization ID**, die unter **My Account** angezeigt wird.

---

### Kann ich denselben Schlüssel für mehrere Projekte verwenden?

Nein. Ein Schlüssel ist an ein einziges Projekt gebunden, und jede Anfrage, die auf ein anderes Projekt zielt, wird abgelehnt. Verwenden Sie einen Schlüssel pro Projekt.

---

### Kann ich einen API-Schlüssel mit einem anderen API-Schlüssel erstellen?

Nein. Die Verwaltung der Schlüssel ist den Administratoren vorbehalten, über ihre Sitzung in der Konsole: Ein Schlüssel kann keinen Schlüssel erstellen oder widerrufen. Das verhindert, dass sich ein kompromittierter Schlüssel neue Zugänge verschafft.

---

### Welchen Scope sollte ich wählen?

`read` zum Abrufen (Inventar, Überwachung), `admin` zum Erstellen, Ändern oder Löschen von Ressourcen (Bereitstellung). Siehe [Scopes](./authentication.md#scopes).

---

### Warum kann ein Schlüssel nicht unbegrenzt gültig sein?

So läuft ein vergessener oder offengelegter Schlüssel irgendwann von selbst ab. Die maximale Dauer beträgt ein Jahr (`365d`); planen Sie den Austausch der Schlüssel Ihrer Integrationen vor ihrem Ablauf.

---

### Ich habe das Secret meines Schlüssels verloren. Kann es mir erneut zugesandt werden?

Nein. Hikube speichert nur einen Hash des Secrets, das nur bei der Erstellung angezeigt wird. Widerrufen Sie den verlorenen Schlüssel und erstellen Sie einen neuen, oder verwenden Sie **Renew** in der Karte **API keys**: Die Konsole erstellt einen Schlüssel mit demselben Namen und derselben Stufe und schlägt dann vor, den alten zu widerrufen.

---

### Mein Schlüssel wurde offengelegt. Was tun?

**Widerrufen Sie ihn sofort** in der Karte **API keys** der Projekteinstellungen. Wenn Sie sich an den Support wenden, geben Sie seine `keyId` an, niemals das Secret. Der Widerruf wird ab der nächsten Anfrage wirksam. Erstellen Sie anschließend einen neuen Schlüssel und ermitteln Sie, wo der alte verwendet worden sein könnte.

---

### Alle meine Anfragen geben `403` mit dem Code `10002` zurück. Warum?

Diese einheitliche Antwort deckt alle Ablehnungen ab: fehlender, ungültiger, abgelaufener oder widerrufener Schlüssel, falsche Projektkennung, unzureichender Scope oder eine für Schlüssel nicht zugängliche Operation. Prüfen Sie zuerst, ob der Header `X-Hikube-Api-Key` tatsächlich gesendet wird: Auch eine Anfrage ohne Schlüssel erhält `403`, nicht `401`. Siehe [Zugriff verweigert](./errors.md#acces-refuse).

---

### Sind alle Operationen der Konsole in der API verfügbar?

Nein. Die API deckt die Ressourcen der Projekte (VMs, Disks, Buckets, Kubernetes, Netzwerk, Datenbanken, RabbitMQ) und die Kataloge ab. Die Verwaltung des Kontos, der Organisation, der Projekte, der Mitglieder und der Schlüssel bleibt in der Konsole. Die [API-Referenz](/api/reference/hikube-api/) listet genau die verfügbaren Operationen auf.

---

### Gibt es einen offiziellen Client oder einen Terraform-Provider?

Noch nicht. Sie können aus der [OpenAPI-Spezifikation](pathname:///openapi/hikube-public.swagger.json) einen Client in Ihrer Programmiersprache generieren. Ein auf der öffentlichen API basierender Terraform-Provider ist geplant (siehe [Terraform](../../tools/terraform)).

---

### Gibt die API eine maximale Anzahl von Anfragen vor?

Ja. Die Anfragen sind pro API-Schlüssel (derzeit ein Burst von 120 Anfragen, dann 300 pro Minute) und pro IP-Adresse (ein Burst von 300, dann 600 pro Minute) begrenzt. Diese Werte können sich ändern. Darüber hinaus antwortet die API mit `429` und dem Code `10008`: Warten Sie die Zeit aus dem Header `Retry-After` ab und versuchen Sie es dann erneut. Die Header `X-RateLimit-Limit` und `X-RateLimit-Remaining` jeder Antwort zeigen Ihnen, wo Sie stehen. Siehe [Ratenbegrenzungen](./errors.md#limites-de-debit).

Um eine Erstellung zu verfolgen, genügt ein Abstand von einigen Sekunden zwischen zwei `GET`-Anfragen.

---

### Was gebe ich dem Support, damit er eine Anfrage analysieren kann?

Die Kennung der Anfrage: den Header `x-request-id`, der in jeder Antwort vorhanden ist, und das Feld `requestId` im Body eines Fehlers. Eines von beiden genügt; geben Sie beide an, wenn Sie sie haben. Niemals das Secret des Schlüssels. Siehe [Kennung der Anfrage](./errors.md#identifiant-de-requete).
