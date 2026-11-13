---
sidebar_position: 6
title: "Eine Domain verifizieren"
description: "Per DNS-TXT-Eintrag _hikube-challenge nachweisen, dass Ihre Organisation eine Domain besitzt: Hinzufügen, Verifizierung, Ablauf, Neustart, Delegation per CNAME und Entfernen."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Eine Domain verifizieren

Eine Organisation weist nach, dass sie eine Domain besitzt, zum Beispiel `acme.com`, indem sie einen DNS-TXT-Eintrag veröffentlicht. Eine verifizierte Domain dient:

- der [SSO-Verbindung](../quick-start.md): Nur die Adressen verifizierter Domains können sie verwenden;
- der [Übertragung eines Kontos](./transfer-account.md) an die Organisation.

Voraussetzung: der Rang **Admin** oder höher.

## 1. Die Domain hinzufügen

1. Öffnen Sie **Organization members**, Registerkarte **Domains**.
2. Klicken Sie in der Karte **Verified domains** auf **Add a domain**.
3. **Domain**: `acme.com`, ohne `http://` und ohne `@`.
4. Klicken Sie auf **Add**.

Die Konsole zeigt den zu veröffentlichenden Eintrag an:

| Typ | Name | Wert |
|---|---|---|
| `TXT` | `_hikube-challenge.acme.com` | `hikube-verify=<Token>` |

Jedes Feld hat eine Schaltfläche zum Kopieren. Das Token ist spezifisch für Ihre Organisation und diese Domain. Die Domain ist **Pending**.

![Registerkarte Domains: acme.com ausstehend, mit dem zu veröffentlichenden TXT-Eintrag](/img/console/access/domain-pending.en.png)

## 2. Den Eintrag veröffentlichen

Veröffentlichen Sie den `TXT`-Eintrag **innerhalb von 7 Tagen** in der DNS-Zone von `acme.com`.

Prüfen Sie, ob er über einen öffentlichen Resolver sichtbar ist:

```bash
dig +short TXT _hikube-challenge.acme.com @9.9.9.9
```

Erwartetes Ergebnis:

```text
"hikube-verify=<Token>"
```

Nach einer Antwort „nicht vorhanden“ speichert ein Resolver diese Antwort für die Dauer der negativen TTL der Zone (das Minimum ihres SOA-Eintrags): oft einige Minuten, manchmal bis zu einer Stunde. Veröffentlichen Sie den Eintrag, bevor Sie die Verifizierung starten.

## 3. Verifizieren

Klicken Sie auf **Verify**. Die Konsole zeigt **acme.com is verified.** an, und der Status wechselt zu **Verified**.

## Status

| Status | Bedeutung | Was zu tun ist |
|---|---|---|
| **Pending** | Eintrag vor dem angezeigten Datum zu veröffentlichen | Veröffentlichen Sie ihn, dann **Verify** |
| **Expired** | Nicht innerhalb von 7 Tagen verifiziert | **Restart the verification**: neues Token, neue Frist von 7 Tagen |
| **Verified** | Die Organisation besitzt die Domain | Lassen Sie den Eintrag bestehen |

Das Menü **Actions** einer ausstehenden Domain bietet außerdem **Issue a new record** an. Der alte Eintrag ist dann wertlos: Veröffentlichen Sie den neuen, bevor Sie verifizieren.

## Regeln

- **Eine Subdomain ist eine eigene Domain.** Die Verifizierung von `acme.com` verifiziert nicht `eu.acme.com`. Jede Subdomain hat ihren eigenen Eintrag. Eine Adresse `bob@eu.acme.com` gehört nicht zur Domain `acme.com`.
- **Abgelehnte Domains.** Öffentliche E-Mail-Dienste (`gmail.com`, `outlook.com` …) und öffentliche Suffixe (`co.uk`, `github.io` …). Eine Subdomain eines öffentlichen Suffixes, wie `acme.github.io`, wird akzeptiert.
- **Länge.** Höchstens 235 Zeichen. Eine Domain mit Akzenten wird in ihre ASCII-Form umgewandelt: `bücher.ch` wird zu `xn--bcher-kva.ch`.
- **Höchstens 20 Domains** pro Organisation, unabhängig von ihrem Status.
- **Eine Domain, eine Organisation.** Hat eine andere Organisation die Domain bereits verifiziert, wird die Verifizierung abgelehnt.

## Den Eintrag bestehen lassen

:::warning Löschen Sie den Eintrag nicht
Der Eintrag muss veröffentlicht bleiben, solange die Organisation die Domain behält. Hikube prüft ihn vor jedem Vorgang erneut, der der Domain eine neue Wirkung verleiht.
:::

Vorgänge, die den Eintrag erneut prüfen:

- die Aktivierung der SSO-Verbindung, für jede Domain, die sie bedient;
- das Hinzufügen einer Domain zu den **Allowed domains** der SSO-Verbindung;
- die Übertragung eines Kontos an die Organisation.

Das Senden einer Einladung prüft ihn nicht. Eine erfolgreiche Prüfung gilt für die Domain eine Stunde lang.

Die Konsole zeigt die letzte Prüfung unter der Domain an: **record found**, **record missing** oder **the DNS did not answer**.

### Wenn der Eintrag verschwunden ist

Der Vorgang wird abgelehnt. Sonst ändert sich nichts:

- Die Domain bleibt **Verified**;
- die Konten, ihre Zugriffe und ihre Anmeldungen funktionieren weiterhin.

Veröffentlichen Sie den Eintrag mit demselben Token erneut, das bei der Domain angezeigt wird, und wiederholen Sie dann den Vorgang. Hat das DNS nicht geantwortet, versuchen Sie es etwas später erneut.

## Den Eintrag per CNAME delegieren

Einem `CNAME` auf `_hikube-challenge.acme.com` wird gefolgt: Sie können den `TXT`-Eintrag in einer anderen Zone veröffentlichen. Der Wert muss genau übereinstimmen.

:::warning Wildcard-CNAME
Ein Wildcard-`CNAME`, zum Beispiel `*.acme.com CNAME saas.exemple.net`, deckt auch `_hikube-challenge.acme.com` ab. Wer die `TXT`-Einträge von `saas.exemple.net` kontrolliert, kann dann die Verifizierung von `acme.com` beantworten. Veröffentlichen Sie bei einem Wildcard-`CNAME` den `TXT`-Eintrag explizit auf `_hikube-challenge.acme.com`: Ein expliziter Name hat Vorrang vor dem Wildcard-Eintrag.
:::

## Eine von einer anderen Organisation verifizierte Domain

Eine Domain wechselt die Organisation nur über den **Hidora-Support**, zum Beispiel nach einer Übernahme oder dem Verkauf der Domain. Der Support entzieht sie der Organisation, die sie hält, mit Zustimmung ihres Super-Administrators oder gegen Nachweis des Besitzes. Ihre Organisation verifiziert sie danach ganz normal. Die Konten, die die frühere Organisation bereits verwaltet, bleiben ihre.

## Eine Domain entfernen

1. Klicken Sie im Menü **Actions** der Domain auf **Remove**.
2. Bestätigen Sie mit **Remove**.

Die Domain wird für eine andere Organisation wieder frei. Die Konten dieser Domain, die der Organisation gehören, bleiben ihr.

Eine in den **Allowed domains** der SSO-Verbindung genannte Domain kann nicht entfernt werden: Entfernen Sie sie zuerst aus der Verbindung. Eine Verbindung, die keine Domain mehr bedient, wird deaktiviert.

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung erstellen", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Schnellstart", href: "../../quick-start"},
    {label: "Fehlerbehebung", href: "../../troubleshooting"},
  ]}
/>
