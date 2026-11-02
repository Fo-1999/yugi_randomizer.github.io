(() => {
  "use strict";

  const STORAGE_KEY = "deckRandomizerByFo1999.v2";
  const $ = id => document.getElementById(id);

  const state = {
    decks: [],
    drawn: [],
    sourceName: "",
    signature: ""
  };

  const el = {
    file: $("json-file"),
    draw: $("draw-button"),
    reset: $("reset-button"),
    status: $("status-message"),
    dbTitle: $("database-title"),
    dbSubtitle: $("database-subtitle"),
    remaining: $("remaining-count"),
    drawnCount: $("drawn-count"),
    total: $("total-count"),
    progress: $("progress-fill"),
    list: $("extracted-list"),
    toast: $("toast"),
    currentDraw: $("current-draw"),
    currentDrawName: $("current-draw-name"),
    currentDrawLink: $("current-draw-link")
  };

  function validateDatabase(input) {
    if (!Array.isArray(input)) {
      throw new Error("Il JSON deve contenere un array di deck.");
    }

    const result = [];
    input.forEach((item, index) => {
      if (!item || typeof item.name !== "string" || typeof item.url !== "string") {
        throw new Error(`Elemento ${index + 1}: sono richiesti "name" e "url".`);
      }

      const name = item.name.trim();
      const url = item.url.trim();
      let parsedUrl;

      try {
        parsedUrl = new URL(url);
      } catch {
        throw new Error(`URL non valido per il deck "${name || index + 1}".`);
      }

      if (!name) throw new Error(`Il deck alla posizione ${index + 1} non ha un nome.`);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(`Il link di "${name}" deve essere un URL HTTP o HTTPS.`);
      }

      result.push({ name, url });
    });

    if (result.length === 0) throw new Error("Il JSON non contiene deck.");
    return result;
  }

  function getSignature(decks) {
    return JSON.stringify(decks);
  }

  function saveState() {
    const data = {
      signature: state.signature,
      sourceName: state.sourceName,
      drawn: state.drawn
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      showToast("Il browser non ha permesso di salvare i dati locali.");
    }
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || saved.signature !== state.signature) {
        state.drawn = [];
        saveState();
        return;
      }
      state.drawn = Array.isArray(saved.drawn)
        ? [...new Set(saved.drawn)].filter(i => Number.isInteger(i) && i >= 0 && i < state.decks.length)
        : [];
    } catch {
      state.drawn = [];
    }
  }

  function randomIndex(max) {
    if (window.crypto?.getRandomValues) {
      const range = 0x100000000;
      const limit = range - (range % max);
      const buffer = new Uint32Array(1);
      let value;
      do {
        window.crypto.getRandomValues(buffer);
        value = buffer[0];
      } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
  }

  function render() {
    const total = state.decks.length;
    const drawn = state.drawn.length;
    const remaining = Math.max(0, total - drawn);

    el.dbTitle.textContent = state.sourceName || "Nessuna lista caricata";
    el.dbSubtitle.textContent = total
      ? `${total} deck nel pool · formato definito dal file JSON`
      : "Seleziona il JSON del formato che vuoi giocare.";
    el.remaining.textContent = total ? remaining : "—";
    el.drawnCount.textContent = drawn;
    el.total.textContent = total || "—";
    el.progress.style.width = total ? `${(drawn / total) * 100}%` : "0%";
    el.draw.disabled = remaining < 1;
    el.reset.disabled = drawn === 0;

    if (!total) {
      el.status.textContent = "Carica un file JSON per iniziare.";
    } else if (remaining === 0) {
      el.status.textContent = "Hai estratto tutti i deck di questa lista. Puoi resettare il tuo pool.";
    } else {
      el.status.textContent = "Pronto!?";
    }

    renderCurrentDraw();
    renderDrawnList();
  }

  function renderCurrentDraw() {
    const lastIndex = state.drawn[state.drawn.length - 1];
    const deck = Number.isInteger(lastIndex) ? state.decks[lastIndex] : null;

    if (!deck) {
      el.currentDraw.hidden = true;
      return;
    }

    el.currentDrawName.textContent = deck.name;
    el.currentDrawLink.href = deck.url;
    el.currentDraw.hidden = false;
  }

  function renderDrawnList() {
    if (!state.drawn.length) {
      el.list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">◇</span>
          <p>Non hai ancora estratto nessun deck.</p>
          <small>I tuoi deck estratti appariranno qui.</small>
        </div>`;
      return;
    }

    el.list.replaceChildren();
    state.drawn.forEach((deckIndex, index) => {
      const deck = state.decks[deckIndex];
      if (!deck) return;

      const row = document.createElement("div");
      row.className = "extracted-entry";

      const main = document.createElement("div");
      main.className = "extracted-main";

      const number = document.createElement("span");
      number.className = "entry-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const nameWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "entry-name";
      name.textContent = deck.name;

      const date = document.createElement("small");
      date.className = "entry-date";
      date.textContent = "Estratto da te · non disponibile fino al reset";

      nameWrap.append(name, date);
      main.append(number, nameWrap);

      const link = document.createElement("a");
      link.className = "entry-link";
      link.href = deck.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "APRI DECK ↗";

      row.append(main, link);
      el.list.append(row);
    });
  }

  function drawOne() {
    const available = state.decks
      .map((deck, index) => index)
      .filter(index => !state.drawn.includes(index));

    if (!available.length) return;

    const selectedIndex = available[randomIndex(available.length)];
    state.drawn.push(selectedIndex);
    saveState();
    render();

    const selected = state.decks[selectedIndex];
    el.status.textContent = `Deck estratto: ${selected.name}. Buon duello!`;
    showToast(`Hai estratto: ${selected.name}`);
  }

  function resetDrawnDecks() {
    if (!state.drawn.length) return;
    const confirmed = window.confirm(
      "Vuoi resettare la tua lista? Tutti i deck torneranno disponibili per le tue prossime estrazioni."
    );
    if (!confirmed) return;

    state.drawn = [];
    saveState();
    render();
    showToast("La tua lista è stata resettata.");
  }

  async function loadJsonFile(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = validateDatabase(JSON.parse(text));
      const nextSignature = getSignature(parsed);

      if (state.decks.length && nextSignature !== state.signature) {
        const confirmed = window.confirm(
          "Stai caricando una lista diversa. I deck già estratti per la lista precedente non verranno applicati alla nuova lista. Continuare?"
        );
        if (!confirmed) return;
      }

      state.decks = parsed;
      state.signature = nextSignature;
      state.sourceName = file.name;
      restoreState();
      saveState();
      render();
      showToast(`Lista caricata: ${parsed.length} deck.`);
    } catch (error) {
      const message = error instanceof SyntaxError
        ? "JSON non valido: controlla parentesi, virgole e virgolette."
        : error.message;
      showToast(message);
    } finally {
      el.file.value = "";
    }
  }

  el.file.addEventListener("change", event => loadJsonFile(event.target.files?.[0]));
  el.draw.addEventListener("click", drawOne);
  el.reset.addEventListener("click", resetDrawnDecks);

  // La lista dei deck estratti viene ripristinata quando si ricarica lo stesso JSON.
  render();
})();
