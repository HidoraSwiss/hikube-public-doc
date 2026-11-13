---
title: "Die Konsole einer VM öffnen"
description: "Den Bildschirm oder die serielle Schnittstelle einer VM in der Hikube-Konsole anzeigen, um eine VM zu reparieren, die per SSH oder RDP nicht mehr antwortet, oder eine Installation oder einen Startvorgang zu verfolgen."
---

# Die Konsole einer VM öffnen

Der Reiter **Console** auf der Seite einer VM zeigt in Ihrem Browser den Bildschirm der VM und ihre serielle Schnittstelle. Das entspricht einem Bildschirm und einer Tastatur, die an die Maschine angeschlossen sind: Es funktioniert auch dann, wenn die VM über das Netzwerk nicht mehr erreichbar ist.

Verwenden Sie die Konsole, um:

- eine VM zu reparieren, die per SSH oder RDP nicht mehr antwortet: zu strenge interne Firewall, fehlerhafte Netzwerkkonfiguration, System bleibt beim Start hängen;
- eine Installation oder einen Startvorgang zu verfolgen und die angezeigten Meldungen zu lesen;
- das Bootmenü oder das BIOS der VM zu bedienen;
- Strg+Alt+Entf an eine Windows-VM zu senden.

Für längere Arbeiten bleiben SSH (Linux) oder RDP (Windows) komfortabler und schneller.

## Voraussetzungen

- Eine VM im Status **Running** unter **Infrastructure** > **VM Instances**
- Mindestens die Rolle **Use** im Projekt (siehe [Erforderliche Rechte](#droits))
- Für die serielle Konsole: ein Konto mit Passwort in der VM (siehe [An der seriellen Schnittstelle anmelden](#mot-de-passe))

## Schritte

### 1. Den Reiter Console öffnen

1. Öffnen Sie **Infrastructure** > **VM Instances** und klicken Sie auf die VM.
2. Klicken Sie auf den Reiter **Console**, zwischen **Overview** und **Backups**.
3. Wählen Sie die Ansicht:
   - **Screen (VNC)**: der grafische Bildschirm der VM;
   - **Serial console**: die serielle Schnittstelle der VM im Textmodus.

Der Reiter **Console** erscheint nur, solange die VM läuft (oder migriert wird). Eine gestoppte VM hat keine Konsole: Starten Sie sie zuerst (siehe [Eine VM starten](./manage-lifecycle.md#2-eine-vm-starten)).

![Reiter Console einer VM, Ansicht Screen (VNC): Werkzeugleiste und Anmeldeaufforderung der VM](/img/console/compute/vm-console-vnc.en.png)

Bildschirm und serielle Schnittstelle sind unabhängig voneinander: Sie können beide gleichzeitig öffnen, zum Beispiel in zwei Browser-Tabs.

### 2. Den Bildschirm verwenden

Die Ansicht **Screen (VNC)** zeigt den Bildschirm der VM. Klicken Sie in den Bildschirm, um Tastatur und Maus an die VM zu senden. Die Werkzeugleiste bietet:

| Schaltfläche | Wirkung |
|--------------|---------|
| **Ctrl+Alt+Del** | Sendet die Tastenkombination an die VM. Unter Windows unverzichtbar: Auf Ihrer Tastatur gedrückt, wird sie von Ihrem eigenen System abgefangen. |
| **Paste clipboard** | Tippt den Text Ihrer Zwischenablage in die VM (siehe unten). |
| **Full screen** | Zeigt den Bildschirm der VM im Vollbild. Halten Sie Esc gedrückt, um es zu verlassen. |
| **New tab** | Öffnet die Konsole allein in einem neuen Browser-Tab. |

**Tastatur.** Ihre Tastenanschläge werden nach dem in der VM eingestellten Tastaturlayout interpretiert, nicht nach dem Ihres Computers. Stimmen die angezeigten Zeichen nicht mit den Tasten überein (zum Beispiel `z` und `y` vertauscht), ändern Sie das Layout im System der VM.

**Einfügen.** Es gibt keine gemeinsame Zwischenablage zwischen Ihrem Computer und der VM. **Paste clipboard** umgeht diese Grenze, indem der Text Taste für Taste getippt wird, wie auf einer US-Tastatur:

- nur ASCII-Zeichen, Enter und Tab werden übertragen: Umlaute, Akzente und andere Zeichen werden übersprungen, und die Konsole zeigt an, wie viele nicht getippt werden konnten;
- höchstens 4000 Zeichen;
- verwendet die VM ein anderes Layout als US, können manche Zeichen anders ankommen.

Verweigert der Browser den Zugriff auf die Zwischenablage, öffnet sich ein Fenster **Paste text**: Fügen Sie den Text dort ein und klicken Sie auf **Type the text**.

### 3. Die serielle Schnittstelle verwenden

Die Ansicht **Serial console** zeigt die serielle Schnittstelle der VM in einem Terminal. Beim Öffnen nennt ein Banner die Organisation, das Projekt und die VM und zeigt dann: „Press Enter to show the login prompt.“

![Reiter Console einer VM, Ansicht Serial console: Hikube-Banner und Anmeldeaufforderung](/img/console/compute/vm-console-serial.en.png)

Drücken Sie Enter: Die Anmeldeaufforderung der VM erscheint, sofern ihr System eine auf der seriellen Schnittstelle anbietet (bei gängigen Linux-Images der Fall). Melden Sie sich mit einem Benutzer der VM und dessen Passwort an.

Die Werkzeugleiste bietet:

| Schaltfläche | Wirkung |
|--------------|---------|
| **–** / **+** | Verkleinert oder vergrößert die Schrift des Terminals. |
| **Full screen** | Zeigt das Terminal im Vollbild. |
| **New tab** | Öffnet die Konsole allein in einem neuen Browser-Tab. |
| **Fit the VM to C×R** | Teilt dem System der VM die Größe des Terminals mit (C Spalten, R Zeilen). |

**Größe anpassen.** Die serielle Schnittstelle überträgt die Größe Ihres Fensters nicht: Ohne Anpassung nutzen Vollbildprogramme (`vim`, `less`, `top`) nur einen Teil des Terminals. Die Schaltfläche **Fit the VM to C×R** tippt für Sie `stty rows R cols C` in die Sitzung. Verwenden Sie sie **erst nach der Anmeldung an einer Shell**: An der Anmeldeaufforderung würde der Befehl als Benutzername verstanden. Wiederholen Sie es, nachdem Sie die Fenster- oder Schriftgröße geändert haben.

**Was die serielle Schnittstelle nicht kann**:

- sie hat keinen Verlauf: Angezeigt wird nur, was die VM nach dem Öffnen schreibt;
- ihr Durchsatz liegt bei etwa 40 KB/s: Ein Befehl mit viel Ausgabe scrollt langsam. Für längere Arbeiten verwenden Sie SSH.

#### An der seriellen Schnittstelle anmelden {#mot-de-passe}

Die serielle Schnittstelle verlangt einen Benutzer **und ein Passwort**. Cloud-Images definieren oft keines: Man meldet sich per SSH-Schlüssel an, und der Standardbenutzer hat kein Passwort. Dann erscheint zwar die Anmeldeaufforderung, aber kein Passwort wird akzeptiert.

Legen Sie ein Passwort fest, **bevor** Sie es brauchen, solange die VM erreichbar ist:

- **aus einer SSH-Sitzung**: `sudo passwd <benutzer>`;
- **beim Erstellen der VM** im Feld **Cloud-Init script (User Data)** (siehe [cloud-init konfigurieren](./configure-cloud-init.md)). Zum Beispiel für den Standardbenutzer des Images:

```yaml title="user-data.yaml"
#cloud-config
password: "<temporaeres-passwort>"
chpasswd:
  expire: true
ssh_pwauth: false
```

`expire: true` erzwingt eine Passwortänderung bei der ersten Anmeldung; `ssh_pwauth: false` lässt SSH nur per Schlüssel zu: Das Passwort dient nur an der Konsole. Bewahren Sie kein echtes Passwort in einem cloud-init-Skript auf: Ersetzen Sie es bei der ersten Anmeldung.

## Erforderliche Rechte {#droits}

Das Öffnen der Konsole erfordert mindestens die Rolle **Use** im Projekt: Über die Konsole kann man wie mit einer Tastatur auf die VM einwirken. Ein Mitglied mit nur der Rolle **Read** sieht die VM, aber das Öffnen ihrer Konsole wird mit der Meldung „You are not allowed to open this console.“ abgelehnt.

:::info Verfügbarkeit
Die Konsole einer VM lässt sich nur in der Hikube-Webkonsole öffnen. Sie ist weder mit einem API-Schlüssel noch über die Kommandozeile erreichbar.
:::

## Eine Sitzung pro Konsole {#une-seule-session-par-console}

Jede Konsole einer VM, der Bildschirm wie die serielle Schnittstelle, nimmt jeweils nur eine Sitzung an. Wird sie anderswo geöffnet, in einem anderen Tab oder von einer anderen Person, schließt sich die vorherige Sitzung. Diese zeigt:

> The console was closed, perhaps opened elsewhere.

mit einer Schaltfläche **Reconnect**. Sie verbindet sich nicht von selbst neu: Ein Klick auf **Reconnect** übernimmt die Konsole wieder und schließt seinerseits die Sitzung des anderen Tabs oder der anderen Person. Vergewissern Sie sich vorher, dass niemand sonst die Konsole verwendet.

Die Schaltfläche **New tab** folgt derselben Regel: Die Konsole öffnet sich im neuen Tab, und der ursprüngliche Tab zeigt „The console is open in another tab.“ mit einer Schaltfläche **Open here**, um sie zurückzuholen.

## Dauer und Neuverbindungen

| Situation | Verhalten der Konsole |
|-----------|-----------------------|
| Etwa alle 12 Minuten | Die gesicherte Verbindung wird erneuert: Die Sitzung öffnet sich von selbst neu, in etwa einer Sekunde. |
| Wartung der Plattform | Automatische Neuverbindung. |
| Migration der VM auf einen anderen Server | Automatische Neuverbindung. |
| VM über die Hikube-Konsole gestoppt oder neu gestartet | Die Konsole zeigt „The instance is not running. The console will open as soon as it has started.“ und öffnet sich von selbst, sobald die VM wieder läuft. |
| Sitzung seit 8 Stunden offen | Die Sitzung schließt sich („The session reached its maximum duration of 8 hours.“): Klicken Sie auf **Reconnect**. |

Am Bildschirm geht bei einer Neuverbindung nichts verloren: Das Bild wird neu gezeichnet. An der seriellen Schnittstelle geht verloren, was die VM während der Sekunde der Neuverbindung schreibt; Ihre Sitzung in der VM bleibt geöffnet.

:::tip Den Startvorgang von Anfang an sehen
Nach einem **Restart** über die Hikube-Konsole öffnet sich die Konsole erst wieder, wenn die VM läuft: Die ersten Sekunden des Starts (Bootmenü, BIOS) können dann schon vorbei sein. Um sie zu sehen, lassen Sie die Konsole offen und starten Sie aus dem System der VM neu (`sudo reboot`, oder unter Windows **Ctrl+Alt+Del** und dann Neustart).
:::

## FAQ

### Auf dem Bildschirm ist nichts zu sehen

- Der Bildschirm der VM ist vielleicht im Ruhezustand: Klicken Sie in den Bildschirm oder drücken Sie eine Taste, zum Beispiel Umschalt.
- Eine Linux-VM ohne grafische Oberfläche zeigt eine einfache Text-Anmeldeaufforderung; bleibt der Bildschirm schwarz, versuchen Sie die **Serial console**.
- Wurde die VM gerade erst gestartet, hat ihr System vielleicht noch nichts angezeigt: Warten Sie einige Sekunden.

### An der seriellen Schnittstelle ist nichts zu sehen

Die serielle Schnittstelle hat keinen Verlauf: Drücken Sie Enter, um die Anmeldeaufforderung anzuzeigen. Erscheint nichts, nutzt das System der VM ihre serielle Schnittstelle vielleicht nicht (so bei Windows und manchen eigenen Images): Verwenden Sie **Screen (VNC)**.

### Die Konsole hat sich geschlossen

Je nach angezeigter Meldung:

- „The console was closed, perhaps opened elsewhere.“: Dieselbe Konsole wurde in einem anderen Tab oder von einer anderen Person geöffnet (siehe [Eine Sitzung pro Konsole](#une-seule-session-par-console));
- „The session reached its maximum duration of 8 hours.“: Klicken Sie auf **Reconnect**;
- „The connection was too slow to keep up with the screen: the session was closed.“: Ihre Internetverbindung kam mit dem Datenstrom des Bildschirms nicht mit. Klicken Sie auf **Reconnect**; wiederholt sich das, schließen Sie Anwendungen, die Ihre Verbindung belasten, oder verringern Sie die Aktivität auf dem Bildschirm der VM.

In allen drei Fällen öffnet sich die Konsole nicht von selbst wieder.

### Ich habe kein Passwort für die serielle Schnittstelle

Das ist bei Cloud-Images, die für die Anmeldung per SSH-Schlüssel gedacht sind, der häufigste Fall. Legen Sie ein Passwort fest, wie unter [An der seriellen Schnittstelle anmelden](#mot-de-passe) beschrieben. Ist die VM per SSH nicht mehr erreichbar und hat kein Passwort, kann die Konsole Sie nicht anmelden: Beheben Sie die Ursache über das cloud-init-Skript (**Edit** > **Advanced Configuration**, dann **Reload UserData** und **Restart**, siehe [Fehlerbehebung](../troubleshooting.md)) oder wenden Sie sich an den [Support](mailto:support@hidora.io).

### Der Reiter Console erscheint nicht

Die VM läuft nicht: Der Reiter wird nur für eine VM im Status **Running** (oder in Migration) angeboten. Starten Sie sie und öffnen Sie dann ihre Seite erneut.

## Nutzungsbedingungen

Die Konsole ist ein Hikube-Dienst und unterliegt den [Allgemeinen Geschäftsbedingungen der Hidora SA](https://hikube.cloud/en/terms).

## Weiterführende Informationen

- [Eine VM starten, stoppen, ändern und löschen](./manage-lifecycle.md)
- [cloud-init konfigurieren](./configure-cloud-init.md)
- [Fehlerbehebung](../troubleshooting.md)
