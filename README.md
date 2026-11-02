# Deck Randomizer by Fo1999 — v2

Applicazione web statica: non richiede Python, installazione, server o backend.

## Avvio
1. Estrai la cartella.
2. Apri `index.html` con Chrome, Firefox o Edge.
3. Premi **Carica lista JSON** e seleziona il file JSON del formato che vuoi giocare.
4. Premi **RANDOMIZZA DECK**.

## Formato del JSON
Il formato del gioco è determinato esclusivamente dalla lista JSON caricata. Il programma non impone una banlist o un formato specifico.

Ogni voce contiene soltanto `name` e `url`:

```json
[
  {
    "name": "Blackwing",
    "url": "https://ygoprodeck.com/..."
  },
  {
    "name": "Lightsworn",
    "url": "https://ygoprodeck.com/..."
  }
]
```

Il file `data/decks.json` contiene tre voci dimostrative con URL generici: sostituiscili con i link alle pagine specifiche dei deck su YGOPRODeck.

## Regole
- Ogni click estrae **un solo deck**.
- Il deck viene rimosso soltanto dal pool locale di chi lo ha estratto.
- L'estrazione di un giocatore non influenza quella dell'altro: i mirror match sono possibili.
- I deck estratti da te restano nella tua lista personale e non vengono riproposti fino al reset.
- Lo storico mostra soltanto i tuoi deck estratti, non le partite né le estrazioni dell'altra persona.
- **Reset lista** rende nuovamente disponibili tutti i deck del JSON caricato.

## Persistenza e uso su due computer
I deck estratti vengono salvati nel `localStorage` del browser. Ogni persona ha quindi il proprio pool e il proprio storico, separati dagli altri computer e browser.

Per giocare con lo stesso formato, condividete lo stesso file JSON. Non c'è sincronizzazione tra dispositivi.

## Nota
Il caricamento del JSON avviene tramite il selettore file del browser, quindi funziona aprendo direttamente `index.html` anche con protocollo `file://`.
