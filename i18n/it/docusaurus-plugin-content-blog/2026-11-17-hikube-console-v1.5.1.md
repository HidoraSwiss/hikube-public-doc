---
title: Console Hikube v1.5.1
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.7.1. Diventa più accessibile, da tastiera come con un lettore di schermo, e si visualizza meglio sugli schermi piccoli. Il tema può seguire quello del sistema, e la console conserva meno dati nel browser.

<!-- truncate -->

## Aggiunto

- **Tema** — Il menu del tema propone **Light**, **Dark** o **System**. In modalità **System**, la console segue il tema del computer, anche quando cambia, e una modifica fatta in una scheda si applica alle altre schede aperte.

- **GPU** — La GPU NVIDIA L4 si sceglie nelle procedure guidate di creazione delle istanze VM e dei cluster Kubernetes.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Moduli** — Un errore di inserimento compare dopo aver lasciato il campo, e non più dalla prima lettera digitata. Scompare non appena viene corretto. I messaggi di errore sono collegati al loro campo, e i campi obbligatori vengono annunciati dai lettori di schermo.

- **Navigazione** — Le azioni che portano a una pagina, come **View** e **Edit** negli elenchi, sono veri link: il clic centrale e **Apri in una nuova scheda** funzionano.

- **Accessibilità** — Ogni pagina ha il proprio titolo di scheda. Le aree di navigazione, lo stato dei menu e i passaggi delle procedure guidate vengono annunciati dai lettori di schermo, come le azioni in corso. Il contrasto e il contorno di focus sono più marcati, i tooltip si aprono da tastiera e al tocco, e i testi seguono la dimensione del carattere impostata nel browser.

- **Schermi piccoli** — Su uno schermo stretto, le tabelle dei membri, degli inviti, dei role binding SSO e delle chiavi API passano a una disposizione impilata, senza scorrimento orizzontale. L'altezza delle pagine tiene conto delle barre del browser mobile.

- **Tema scuro** — Le barre di scorrimento, gli elenchi a discesa, i selettori di data e i campi compilati automaticamente dal browser seguono il tema scuro.

- **Prestazioni** — Le pagine si caricano più velocemente, e gli aggiornamenti periodici si fermano finché la scheda è nascosta.

## Corretto

- **Console dell'istanza** — A schermo intero, le finestre di dialogo, le notifiche e i tooltip vengono mostrati sopra la console.

- **Istanze VM** — La finestra che mostra una sola volta la password Windows non si chiude più con il tasto Esc.

## Sicurezza

- **Console** — Le bozze delle procedure guidate, password di inizializzazione comprese, restano in memoria e non vengono più scritte nella memoria del browser, tranne durante un cambio di lingua. Il file kubeconfig non viene più tenuto in cache. Una disconnessione cancella i dati del sito nel browser.

- **Console** — La politica di sicurezza dei contenuti è più restrittiva, e la console è isolata dagli altri siti. Le misurazioni delle prestazioni non inviano più i nomi di organizzazioni, progetti o risorse.
