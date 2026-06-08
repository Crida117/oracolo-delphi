import { useState, useEffect, useRef, useCallback } from "react";

// ─── PALETTE ORACOLARE ────────────────────────────────────────────────────────
const T = {
  obsidian: "#0D0B08",
  obsidianLight: "#1A1610",
  smoke: "#2A2420",
  ash: "#3D3530",
  stone: "#5A5248",
  fog: "#8A8078",
  parchment: "#F2E8D0",
  parchmentDark: "#DDD0AC",
  parchmentDeep: "#C9BA94",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "#9B7A2A",
  goldPale: "#F5E8B0",
  ember: "#8B3020",
  shadow: "rgba(0,0,0,0.6)",
  shadowSoft: "rgba(0,0,0,0.3)",
};

const L = {
  background: "#F5F0E6",
  surface: "#E8E0D0",
  surfaceDeep: "#D8CEB8",
  text: "#2A2420",
  textSecondary: "#5A5248",
  border: "#C4B898",
};

// ─── WIKIPEDIA IMAGE FETCHER ──────────────────────────────────────────────────
const DEITY_WIKI_EN = {
  "Zeus": "Zeus",
  "Apollo": "Apollo",
  "Atena": "Athena",
  "Hermes": "Hermes",
  "Era": "Hera",
  "Demetra": "Demeter",
  "Ade": "Hades",
  "Estia": "Hestia",
  "Ares": "Ares",
  "Afrodite": "Aphrodite",
  "Efesto": "Hephaestus",
  "Artemide": "Artemis",
  "Poseidone": "Poseidon",
  "Dioniso": "Dionysus",
  "Persefone": "Persephone",
  "Pan": "Pan_(god)",
};

const DEITY_FALLBACK = {
  "Zeus": { symbol: "⚡", color: "#C9A84C" },
  "Apollo": { symbol: "☀", color: "#D4AF37" },
  "Atena": { symbol: "🦉", color: "#7B9EA3" },
  "Hermes": { symbol: "☿", color: "#A8C090" },
  "Era": { symbol: "👑", color: "#9B7BA3" },
  "Demetra": { symbol: "🌾", color: "#7A9E6A" },
  "Ade": { symbol: "⚫", color: "#5A6A7A" },
  "Estia": { symbol: "🔥", color: "#C4856A" },
  "Ares": { symbol: "⚔", color: "#8B3030" },
  "Afrodite": { symbol: "♀", color: "#C47A85" },
  "Efesto": { symbol: "🔨", color: "#8B6030" },
  "Artemide": { symbol: "🌙", color: "#5A8060" },
  "Poseidone": { symbol: "🔱", color: "#3A6080" },
  "Dioniso": { symbol: "🍇", color: "#7A3A8A" },
  "Persefone": { symbol: "🌑", color: "#6A4A7A" },
  "Pan": { symbol: "🪈", color: "#6A8A4A" },
};

// Cache immagini in memoria per la sessione
const imageCache = {};

async function fetchWikiImage(deityName) {
  if (imageCache[deityName] !== undefined) return imageCache[deityName];
  const wikiTitle = DEITY_WIKI_EN[deityName];
  if (!wikiTitle) { imageCache[deityName] = null; return null; }
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];
    const src = page?.thumbnail?.source || null;
    imageCache[deityName] = src;
    return src;
  } catch {
    imageCache[deityName] = null;
    return null;
  }
}

function DeityImage({ name, style }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const fallback = DEITY_FALLBACK[name] || { symbol: "◎", color: T.gold };

  useEffect(() => {
    setSrc(null); setLoading(true); setFailed(false);
    fetchWikiImage(name).then(url => {
      setSrc(url);
      setLoading(false);
      if (!url) setFailed(true);
    });
  }, [name]);

  if (loading) {
    return (
      <div style={{ ...style, background: `radial-gradient(circle at 40% 30%, ${fallback.color}22, ${T.obsidian})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${fallback.color}44`, borderTop: `2px solid ${fallback.color}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (failed || !src) {
    return (
      <div style={{ ...style, background: `radial-gradient(circle at 40% 30%, ${fallback.color}33, ${T.obsidian})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: style?.height ? Math.min(parseInt(style.height) * 0.35, 120) : 80 }}>
        {fallback.symbol}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      style={{ ...style, objectFit: "cover", objectPosition: "center top" }}
      onError={() => setFailed(true)}
    />
  );
}

// ─── 150 DOMANDE ──────────────────────────────────────────────────────────────
// Asse 1: Oikos (introversione) vs Agora (estroversione)  → score positivo = Oikos
// Asse 2: Nous (razionale) vs Physis (istintivo)           → score positivo = Nous
// Asse 3: Logos (logica) vs Sympatheia (empatia)           → score positivo = Logos
// Asse 4: Chaos (creatività) vs Cosmos (ordine)            → score positivo = Chaos
// Asse 5: Pathos (emotivo) vs Ataraxia (stoico)            → score positivo = Pathos
// Asse 6: Praxis (azione) vs Theoria (riflessione)         → score positivo = Praxis
// Il valore di risposta: -3 a +3 (scala Likert 7 punti rietichettata)

const QUESTIONS = [
  // Asse 1: Oikos vs Agora (25 domande)
  {id:1,a:1,t:"Le interazioni sociali prolungate mi prosciugano, anche quando sono piacevoli."},
  {id:2,a:1,t:"Ho bisogno di solitudine per ricaricarmi dopo una giornata intensa."},
  {id:3,a:1,t:"Preferisco conversazioni profonde con poche persone piuttosto che socializzare in grandi gruppi."},
  {id:4,a:1,t:"Prima di parlare, tendo a elaborare i pensieri internamente."},
  {id:5,a:1,t:"Il silenzio non mi mette a disagio: lo trovo spesso prezioso."},
  {id:6,a:1,t:"Evito di portare attenzione su di me in contesti pubblici."},
  {id:7,a:1,t:"Dopo una serata sociale intensa, ho bisogno di tempo per me."},
  {id:8,a:1,t:"Lavoro meglio quando sono solo piuttosto che in gruppo."},
  {id:9,a:1,t:"Spesso mi sento incompreso nelle interazioni superficiali."},
  {id:10,a:1,t:"La mia casa è il mio rifugio, ci sto volentieri per giorni."},
  {id:11,a:1,t:"Mi piace essere al centro dell'attenzione in un gruppo.",inv:true},
  {id:12,a:1,t:"Conosco facilmente nuove persone e mi sento subito a mio agio.",inv:true},
  {id:13,a:1,t:"Le energie del gruppo mi stimolano più della solitudine.",inv:true},
  {id:14,a:1,t:"Penso ad alta voce e mi aiuta molto parlare con gli altri.",inv:true},
  {id:15,a:1,t:"Mi annoio rapidamente quando sono solo troppo a lungo.",inv:true},
  {id:16,a:1,t:"Le occasioni sociali mi danno energia, non me la tolgono.",inv:true},
  {id:17,a:1,t:"Preferisco lavorare in team: il confronto mi stimola.",inv:true},
  {id:18,a:1,t:"Mi piace fare rete e allargare la mia cerchia di conoscenze.",inv:true},
  {id:19,a:1,t:"Parlo spesso prima di pensare a fondo.",inv:true},
  {id:20,a:1,t:"Sono animato da una forte vita sociale e ne ho bisogno.",inv:true},
  {id:21,a:1,t:"Trovo più senso nel ritiro che nell'esposizione pubblica."},
  {id:22,a:1,t:"Elaboro le emozioni internamente prima di condividerle."},
  {id:23,a:1,t:"Preferisco scrivere piuttosto che parlare per comunicare cose importanti."},
  {id:24,a:1,t:"Il mio mondo interiore è ricco almeno quanto quello esteriore."},
  {id:25,a:1,t:"Una lunga passeggiata solitaria mi ricarica più di una cena con amici."},

  // Asse 2: Nous (razionale) vs Physis (istintivo) (25 domande)
  {id:26,a:2,t:"Quando prendo decisioni importanti, seguo prima i dati e la logica."},
  {id:27,a:2,t:"Analizo i problemi sistematicamente prima di agire."},
  {id:28,a:2,t:"Mi fido più delle prove concrete che delle impressioni."},
  {id:29,a:2,t:"Trovo soddisfazione nello smontare un problema nei suoi componenti."},
  {id:30,a:2,t:"Le emozioni non dovrebbero guidare le decisioni importanti."},
  {id:31,a:2,t:"Tendo a fare piani dettagliati prima di intraprendere qualsiasi cosa."},
  {id:32,a:2,t:"Preferisco comprendere il perché di una cosa prima di accettarla."},
  {id:33,a:2,t:"Nelle discussioni, porto fatti piuttosto che impressioni."},
  {id:34,a:2,t:"La mente è lo strumento più affidabile che ho."},
  {id:35,a:2,t:"Preferisco teorie chiare a esperienze ambigue."},
  {id:36,a:2,t:"Le prime impressioni mi guidano spesso più di qualsiasi analisi.",inv:true},
  {id:37,a:2,t:"Il mio corpo sa cose che la mia mente fatica a spiegare.",inv:true},
  {id:38,a:2,t:"Agisco per istinto e raramente me ne pento.",inv:true},
  {id:39,a:2,t:"Mi fido più del mio intuito che di qualsiasi piano.",inv:true},
  {id:40,a:2,t:"L'istinto è più veloce e spesso più preciso del pensiero.",inv:true},
  {id:41,a:2,t:"Il corpo e i sensi mi dicono più della ragione in certi momenti.",inv:true},
  {id:42,a:2,t:"Spesso so la risposta prima ancora di ragionarci sopra.",inv:true},
  {id:43,a:2,t:"Nella natura mi sento più a casa che nelle aule o negli uffici.",inv:true},
  {id:44,a:2,t:"L'istinto animale è saggezza, non debolezza.",inv:true},
  {id:45,a:2,t:"Sento il mondo attraverso il corpo prima che attraverso la mente.",inv:true},
  {id:46,a:2,t:"Cerco sempre spiegazioni razionali anche per i fenomeni emotivi."},
  {id:47,a:2,t:"Non mi convinco facilmente senza prove solide."},
  {id:48,a:2,t:"L'ambiguità mi disturba: preferisco certezze e chiarezza."},
  {id:49,a:2,t:"I sogni e le visioni mi sembrano irrilevanti rispetto alla realtà concreta."},
  {id:50,a:2,t:"Il pensiero critico è la mia difesa principale contro l'inganno."},

  // Asse 3: Logos (logica/principi) vs Sympatheia (empatia/connessione) (25 domande)
  {id:51,a:3,t:"La verità è più importante della gentilezza quando si deve scegliere."},
  {id:52,a:3,t:"Valuto le situazioni in base a principi oggettivi, non a sentimenti."},
  {id:53,a:3,t:"Riesco a criticare le idee di qualcuno senza che questo intacchi il mio rapporto con lui."},
  {id:54,a:3,t:"Le regole e i principi devono valere per tutti, senza eccezioni personali."},
  {id:55,a:3,t:"Preferisco essere onesto anche quando fa male."},
  {id:56,a:3,t:"Nelle controversie, cerco la soluzione più logica piuttosto che quella che soddisfa tutti."},
  {id:57,a:3,t:"Mi è difficile lasciare che le emozioni degli altri cambino il mio giudizio."},
  {id:58,a:3,t:"Credo nella giustizia più che nella compassione quando sono in conflitto."},
  {id:59,a:3,t:"Argomento in modo preciso: distinguo sempre tra i fatti e le opinioni."},
  {id:60,a:3,t:"Mantengo la mia posizione anche quando gli altri si sentono feriti."},
  {id:61,a:3,t:"Percepisco subito come si sente qualcuno, ancora prima che parli.",inv:true},
  {id:62,a:3,t:"Il benessere degli altri mi tocca profondamente, spesso più del mio.",inv:true},
  {id:63,a:3,t:"Metto spesso il bisogno altrui prima del mio.",inv:true},
  {id:64,a:3,t:"Nelle decisioni difficili, il fattore umano pesa più di quello razionale.",inv:true},
  {id:65,a:3,t:"Sento le emozioni degli altri come se fossero le mie.",inv:true},
  {id:66,a:3,t:"Preferisco una soluzione che rispetti tutti a una logicamente perfetta ma dolorosa.",inv:true},
  {id:67,a:3,t:"Le relazioni sono il tessuto che dà senso alla vita.",inv:true},
  {id:68,a:3,t:"Modifico il mio approccio a seconda della sensibilità dell'altra persona.",inv:true},
  {id:69,a:3,t:"Posso cambiare idea se capisco che la mia posizione fa stare male qualcuno.",inv:true},
  {id:70,a:3,t:"Sono bravo/a a consolare: le persone vengono da me quando soffrono.",inv:true},
  {id:71,a:3,t:"Critico le idee sbagliate anche se so che questo ferirà chi le sostiene."},
  {id:72,a:3,t:"Riesco a distinguere tra la persona e le sue azioni in modo netto."},
  {id:73,a:3,t:"Il rigore concettuale è più utile della simpatia nelle decisioni."},
  {id:74,a:3,t:"Non mi piace quando le decisioni vengono distorte dall'emotività del momento."},
  {id:75,a:3,t:"Preferisco essere rispettato che essere amato, se devo scegliere."},

  // Asse 4: Chaos (creatività/rottura) vs Cosmos (ordine/struttura) (25 domande)
  {id:76,a:4,t:"Le regole sono punti di partenza, non gabbie: le infrago quando serve."},
  {id:77,a:4,t:"Mi annoio facilmente con le routine e cerco sempre qualcosa di nuovo."},
  {id:78,a:4,t:"Preferisco l'improvvisazione alla pianificazione."},
  {id:79,a:4,t:"Il caos mi stimola: ci vedo possibilità dove altri vedono disordine."},
  {id:80,a:4,t:"Ho idee originali anche quando non sono richieste."},
  {id:81,a:4,t:"Mi piace sperimentare e non temo di sbagliare."},
  {id:82,a:4,t:"Trovo le istituzioni e le strutture rigide soffocanti."},
  {id:83,a:4,t:"Il mio spazio ideale è disordinato ma creativo."},
  {id:84,a:4,t:"Seguo le ispirazioni del momento più che i piani prestabiliti."},
  {id:85,a:4,t:"Spesso reinvento il mio stile di vita o lavoro da zero."},
  {id:86,a:4,t:"Trovo sicurezza nelle routine e nei ritmi stabili.",inv:true},
  {id:87,a:4,t:"L'ordine è una precondizione per la mia produttività.",inv:true},
  {id:88,a:4,t:"Preferisco un sistema ben definito all'improvvisazione.",inv:true},
  {id:89,a:4,t:"Mi fido più di ciò che ha resistito alla prova del tempo che delle novità.",inv:true},
  {id:90,a:4,t:"Il disordine mi crea ansia e riduce la mia efficienza.",inv:true},
  {id:91,a:4,t:"Rispetto le norme sociali: reggono il mondo.",inv:true},
  {id:92,a:4,t:"Un buon piano vale più di mille ispirazioni spontanee.",inv:true},
  {id:93,a:4,t:"Preferisco sistemi collaudati a approcci innovativi non testati.",inv:true},
  {id:94,a:4,t:"Cerco la stabilità nelle relazioni e nelle situazioni di vita.",inv:true},
  {id:95,a:4,t:"Mi piace costruire cose durature più che sperimentare continuamente.",inv:true},
  {id:96,a:4,t:"Sfido le convenzioni quando le ritengo arbitrarie."},
  {id:97,a:4,t:"Le idee più interessanti vengono dall'unire cose apparentemente inconciliabili."},
  {id:98,a:4,t:"Vivo bene con l'incertezza: la vedo come terreno fertile."},
  {id:99,a:4,t:"Sono affascinato/a da ciò che è ai margini, insolito, non catalogato."},
  {id:100,a:4,t:"Preferisco una vita piena di sorprese a una prevedibile e sicura."},

  // Asse 5: Pathos (emotivo) vs Ataraxia (stoico) (25 domande)
  {id:101,a:5,t:"Le mie emozioni sono intense e influenzano profondamente le mie giornate."},
  {id:102,a:5,t:"Piango facilmente davanti a film, musica o belle storie."},
  {id:103,a:5,t:"Le perdite e i distacchi mi segnano a lungo."},
  {id:104,a:5,t:"Vivo le relazioni con grande intensità emotiva."},
  {id:105,a:5,t:"La bellezza estetica mi commuove profondamente."},
  {id:106,a:5,t:"Le ingiustizie mi indignano con forza, a volte fisicamente."},
  {id:107,a:5,t:"Ho una vita emotiva ricca che si esprime in vari modi."},
  {id:108,a:5,t:"L'entusiasmo e la passione guidano molte mie scelte."},
  {id:109,a:5,t:"Mi lascio trascinare dall'emozione del momento spesso."},
  {id:110,a:5,t:"Le delusioni mi colpiscono duramente, anche se poi mi riprendo."},
  {id:111,a:5,t:"Mantengo la calma anche nei momenti più tesi.",inv:true},
  {id:112,a:5,t:"Le emozioni degli altri raramente mi destabilizzano.",inv:true},
  {id:113,a:5,t:"Riesco a osservare le mie emozioni senza esserne travolto/a.",inv:true},
  {id:114,a:5,t:"Di fronte a una crisi, rimango freddo/a e funzionale.",inv:true},
  {id:115,a:5,t:"Non mi lascio trascinare dall'euforia: mantengo la prospettiva.",inv:true},
  {id:116,a:5,t:"Raramente reagisco impulsivamente: valuto prima di rispondere.",inv:true},
  {id:117,a:5,t:"Il distacco interiore è per me una risorsa, non un difetto.",inv:true},
  {id:118,a:5,t:"Le critiche mi toccano, ma non mi abbattono.",inv:true},
  {id:119,a:5,t:"Riesco a essere equanime di fronte a notizie brutte.",inv:true},
  {id:120,a:5,t:"Non ho bisogno di continue rassicurazioni emotive.",inv:true},
  {id:121,a:5,t:"La gioia mi prende in modo travolgente: quando sono felice, si vede."},
  {id:122,a:5,t:"Mi immedesimo facilmente in personaggi di romanzi o film."},
  {id:123,a:5,t:"L'amore e l'amicizia mi sembrano la cosa più importante nella vita."},
  {id:124,a:5,t:"La musica può cambiarmi l'umore in pochi secondi."},
  {id:125,a:5,t:"Tendo a vivere il presente con grande intensità."},

  // Asse 6: Praxis (azione/esterno) vs Theoria (contemplazione/interno) (25 domande)
  {id:126,a:6,t:"Preferisco fare che riflettere: l'azione mi insegna più della teoria."},
  {id:127,a:6,t:"Mi annoio se resto troppo a lungo fermo a pensare."},
  {id:128,a:6,t:"Imparo meglio facendo le cose che leggendo o studiando."},
  {id:129,a:6,t:"La mia soddisfazione viene principalmente dal vedere risultati concreti."},
  {id:130,a:6,t:"Sono orientato/a all'obiettivo: voglio sapere come arrivarci."},
  {id:131,a:6,t:"Trovo le discussioni puramente teoriche frustranti se non portano da nessuna parte."},
  {id:132,a:6,t:"La mia energia si esprime meglio nei progetti pratici."},
  {id:133,a:6,t:"Preferisco affrontare i problemi immediatamente piuttosto che rimuginarci."},
  {id:134,a:6,t:"Mi definisco più un esecutore che un pensatore."},
  {id:135,a:6,t:"L'impatto nel mondo reale è la misura del valore di un'idea."},
  {id:136,a:6,t:"Trovo più significato nella contemplazione che nell'azione.",inv:true},
  {id:137,a:6,t:"Amo approfondire un argomento molto oltre ciò che è strettamente necessario.",inv:true},
  {id:138,a:6,t:"Potrei passare ore a riflettere su un'idea senza sentire il bisogno di applicarla.",inv:true},
  {id:139,a:6,t:"Per me capire qualcosa è già di per sé un fine, non solo un mezzo.",inv:true},
  {id:140,a:6,t:"Mi affascina il sapere astratto, la filosofia, la teoria pura.",inv:true},
  {id:141,a:6,t:"La vita interiore mi interessa più di quella esteriore.",inv:true},
  {id:142,a:6,t:"Preferisco meditare su un problema che risolverlo frettolosamente.",inv:true},
  {id:143,a:6,t:"Mi piace esplorare idee senza uno scopo pratico immediato.",inv:true},
  {id:144,a:6,t:"La contemplazione della bellezza mi sembra un'attività piena in sé.",inv:true},
  {id:145,a:6,t:"Trovo il processo di pensiero spesso più interessante del risultato.",inv:true},
  {id:146,a:6,t:"Sono pragmatico/a: valuto le cose per ciò che producono."},
  {id:147,a:6,t:"Preferisco risolvere problemi concreti a discutere di principi astratti."},
  {id:148,a:6,t:"L'efficacia è per me un valore in sé."},
  {id:149,a:6,t:"Mi piace avere ruoli operativi, non solo consultivi."},
  {id:150,a:6,t:"Tendo ad agire con decisione anche senza avere tutte le informazioni."},
];

// ─── DATABASE DEI DEI (16 divinità, 4 assi binari → 16 combinazioni) ──────────
const DEITIES = {
  // Agora-Nous-Logos-Cosmos
  "Agora-Nous-Logos-Cosmos": {
    name: "Zeus", epithetBase: "Il Sovrano Cosmico",
    animal: "Aquila e Toro",
    accentColor: "#C9A84C",
    desc: "La tua anima risuona con il Sovrano dell'Olimpo. Sei portato/a a guardare il quadro d'insieme, a governare con distacco regale e a imporre ordine dove regna il caos. Come Zeus, eserciti un'autorità naturale che gli altri tendono a riconoscere senza che tu la rivendichi. La tua mente è strategica, la tua presenza autorevole. Il pericolo è la tentazione di trattare il potere come un fine piuttosto che come un mezzo al servizio di qualcosa di più grande.",
    myth: "Zeus abbatté Crono e divise il mondo con i fratelli. Il suo fulmine non è rabbia cieca ma giudizio cosmico.",
  },
  // Agora-Nous-Logos-Chaos
  "Agora-Nous-Logos-Chaos": {
    name: "Hermes", epithetBase: "Il Messaggero Trickster",
    animal: "Serpenti e Caduceo",
    accentColor: "#A8C090",
    desc: "Sei fluido come Hermes: attraversi confini, porti idee da un mondo all'altro, connetti l'incompatibile. La tua mente è veloce, brillante, capace di vedere connessioni che altri non vedono. Sei eloquente, curioso, adattabile. Ami i giochi intellettuali e raramente ti lasci fermare dai limiti convenzionali. Il rischio è la superficialità o il relativismo: quando tutto diventa gioco, niente ha peso.",
    myth: "Hermes nacque all'alba e a mezzogiorno aveva già inventato la lira e rubato il bestiame di Apollo.",
  },
  // Agora-Nous-Sympatheia-Cosmos
  "Agora-Nous-Sympatheia-Cosmos": {
    name: "Era", epithetBase: "La Regina dell'Alleanza",
    animal: "Pavone e Cuculo",
    accentColor: "#9B7BA3",
    desc: "La tua forza è nella costruzione di legami duraturi e strutture sociali coese. Come Era, tieni insieme ciò che rischia di frammentarsi, e lo fai con dignità e intelligenza. Non ti perdi nell'emozione: senti profondamente ma agisci con saggezza. La tua autorità viene dalla fedeltà ai valori che hai scelto. L'ombra è la rigidità: quando il legame diventa catena.",
    myth: "Era era la garante dei matrimoni e dei patti: senza di lei, le alleanze si dissolvono.",
  },
  // Agora-Nous-Sympatheia-Chaos
  "Agora-Nous-Sympatheia-Chaos": {
    name: "Afrodite", epithetBase: "La Forza del Desiderio",
    animal: "Colomba e Cigno",
    accentColor: "#C47A85",
    desc: "La tua anima vibra all'unisono con Afrodite: sei attratto/a dalla bellezza, dalla connessione, dall'amore in tutte le sue forme. Capisci le persone istintivamente, senti i loro bisogni e sai come rispondervi. Porti armonia e piacere dove vai. La sfida è la dipendenza dal piacere e dalla conferma altrui: quando l'attrazione diventa necessità, perdi potere su te stesso/a.",
    myth: "Nata dalla spuma del mare, Afrodite porta con sé il principio cosmico dell'attrazione che tiene insieme gli opposti.",
  },
  // Agora-Physis-Logos-Cosmos
  "Agora-Physis-Logos-Cosmos": {
    name: "Ares", epithetBase: "Il Guerriero della Volontà",
    animal: "Lupo e Avvoltoio",
    accentColor: "#8B3030",
    desc: "In te brucia l'energia di Ares: forza, determinazione, presenza fisica. Non eviti il conflitto, lo abbracci come mezzo di chiarezza. Sei diretto, coraggioso, capace di agire dove altri esitano. Il tuo corpo è uno strumento di volontà. L'ombra è la distruttività cieca quando la forza non è guidata da saggezza o scopo.",
    myth: "Ares non è solo violenza: è il principio della vita che resiste, che non si arrende.",
  },
  // Agora-Physis-Logos-Chaos
  "Agora-Physis-Logos-Chaos": {
    name: "Dioniso", epithetBase: "Il Dio dell'Estasi",
    animal: "Toro e Pantera",
    accentColor: "#7A3A8A",
    desc: "Sei un canale per le energie più profonde e sconvolgenti dell'esistenza. Come Dioniso, porti il dono dell'ebbrezza, dell'estasi, della dissoluzione dei confini. Sei capace di liberare gli altri dalle loro gabbie. La tua presenza è magnetica, trasgressiva, liberatoria. Il rischio è perdersi nell'eccesso o trascinare gli altri oltre il limite che non riescono a gestire.",
    myth: "Dioniso fu smembrato e rinacque: la sua storia è quella della morte e resurrezione del sé.",
  },
  // Agora-Physis-Sympatheia-Cosmos
  "Agora-Physis-Sympatheia-Cosmos": {
    name: "Demetra", epithetBase: "La Madre della Terra",
    animal: "Serpente e Maiale",
    accentColor: "#7A9E6A",
    desc: "La tua forza è nel nutrimento: nutre le persone, i progetti, la comunità. Come Demetra, dai vita a ciò che semini con pazienza e cura. Sei profondamente legato/a alla terra, ai cicli naturali, alla continuità. La tua empatia è concreta: non solo senti il dolore altrui, lo alleggerisci con azioni. Il rischio è sacrificare te stesso/a per nutrire gli altri finché non rimane più niente.",
    myth: "Quando Persefone fu rapita, Demetra smise di far crescere il grano: il mondo capì che senza cura, non c'è vita.",
  },
  // Agora-Physis-Sympatheia-Chaos
  "Agora-Physis-Sympatheia-Chaos": {
    name: "Pan", epithetBase: "Lo Spirito Selvatico",
    animal: "Capra e Toro",
    accentColor: "#6A8A4A",
    desc: "Sei l'energia primordiale che non si lascia addomesticare. Come Pan, vivi nella pienezza dei sensi, del ritmo, della natura. Non ti adatti ai sistemi: li attraversi. La tua gioia è fisica e immediata. Sei capace di un'allegria contagiosa e di una sensualità spontanea. L'ombra è la mancanza di direzione e il terrore (panico) che nasce quando la libertà assoluta non trova forma.",
    myth: "Pan suona il flauto ai margini del bosco dove la civiltà finisce e l'istinto ricomincia.",
  },
  // Oikos-Nous-Logos-Cosmos
  "Oikos-Nous-Logos-Cosmos": {
    name: "Apollo", epithetBase: "Il Dio della Luce e della Forma",
    animal: "Cigno e Delfino",
    accentColor: "#D4AF37",
    desc: "La tua anima è apollinea: tende alla forma, alla bellezza, alla chiarezza. Come Apollo, cerchi l'armonia attraverso la ragione e l'arte. Il tuo mondo interiore è ricco e strutturato: ami la musica, la poesia, la matematica, tutto ciò che ha una forma perfetta. Porti luce dove c'è confusione. L'ombra è il freddo distacco: quando la perfezione diventa ossessione e l'errore umano diventa intollerabile.",
    myth: "Apollo suona la lira e le Muse lo seguono: la forma è l'unico modo che ha il caos di diventare bellezza.",
  },
  // Oikos-Nous-Logos-Chaos
  "Oikos-Nous-Logos-Chaos": {
    name: "Efesto", epithetBase: "Il Dio del Fuoco Creatore",
    animal: "Asino e Gru",
    accentColor: "#8B6030",
    desc: "Sei il creatore solitario che forgia il mondo. Come Efesto, trasformi materia grezza in opere d'arte attraverso tecnica, pazienza e genio. Lavori nel silenzio, spesso in disparte, e produci qualcosa che nessun altro avrebbe potuto creare. Sei innovativo, preciso, instancabile. L'ombra è il risentimento: il genio trascurato che si chiude nell'officina e dimentica il mondo.",
    myth: "Efesto, reietto dall'Olimpo, forgiò la rete che intrappolò Ares e Afrodite: la sua 'deformità' era il suo potere.",
  },
  // Oikos-Nous-Sympatheia-Cosmos
  "Oikos-Nous-Sympatheia-Cosmos": {
    name: "Atena", epithetBase: "La Dea della Saggezza Pratica",
    animal: "Gufo e Serpente",
    accentColor: "#7B9EA3",
    desc: "La tua mente è quella di Atena: acuta, strategica, capace di sintesi tra pensiero e azione. Non sei solo teorica/o: la tua intelligenza si traduce in scelte concrete e ben calibrate. Senti la responsabilità verso gli altri e verso la comunità. Hai la capacità rara di essere sia empatica/o che razionale, senza sacrificare l'una all'altra. L'ombra è il controllo eccessivo: la saggezza che diventa incapacità di lasciar andare.",
    myth: "Atena nacque armata dalla testa di Zeus: il pensiero che porta già in sé la sua applicazione.",
  },
  // Oikos-Nous-Sympatheia-Chaos
  "Oikos-Nous-Sympatheia-Chaos": {
    name: "Persefone", epithetBase: "La Regina della Soglia",
    animal: "Cervo e Pipistrello",
    accentColor: "#6A4A7A",
    desc: "Come Persefone, abiti due mondi: la luce e l'ombra, il conscio e l'inconscio. La tua capacità di attraversare trasformazioni profonde è il tuo dono più raro. Capisci il dolore senza temerlo, e questo ti rende una guida naturale per chi affronta transizioni difficili. L'ombra è rimanere bloccata/o negli inferi: quando la profondità diventa ritiro permanente dal mondo.",
    myth: "Persefone non fu solo vittima: scelse di tornare ogni anno, portando con sé la primavera.",
  },
  // Oikos-Physis-Logos-Cosmos
  "Oikos-Physis-Logos-Cosmos": {
    name: "Poseidone", epithetBase: "Il Signore delle Profondità",
    animal: "Cavallo e Delfino",
    accentColor: "#3A6080",
    desc: "Sei come l'oceano: in superficie calmo, in profondità in moto perpetuo. Come Poseidone, la tua forza viene dall'interno, dagli strati profondi della psiche e del corpo. Hai una presenza fisica potente e una vita emotiva intensa che raramente mostri. Puoi essere terribilmente distruttivo quando violato/a, e altrettanto generoso quando rispettato/a. L'ombra è il risentimento sotterraneo che esplode in terremoti improvvisi.",
    myth: "Poseidone batté il tridente e creò il cavallo: dalla profondità nasce ciò che è più selvaggio e più bello.",
  },
  // Oikos-Physis-Logos-Chaos
  "Oikos-Physis-Logos-Chaos": {
    name: "Ade", epithetBase: "Il Guardiano dell'Invisibile",
    animal: "Cipresso e Narciso",
    accentColor: "#5A6A7A",
    desc: "Come Ade, governi il regno di ciò che non si vede: l'inconscio, i segreti, le radici profonde. Non cerchi la luce del riconoscimento: lavori in silenzio e la tua ricchezza è invisibile finché non viene cercata. Hai una forza serena e imperturbabile che nasce dall'aver accettato la realtà nelle sue forme più dure. L'ombra è l'isolamento assoluto, il mondo degli inferi che diventa prigione.",
    myth: "Ade non era crudele: era semplicemente il custode di ciò che la vita non può sopportare di guardare.",
  },
  // Oikos-Physis-Sympatheia-Cosmos
  "Oikos-Physis-Sympatheia-Cosmos": {
    name: "Estia", epithetBase: "La Custode del Fuoco Sacro",
    animal: "Asino e Fuoco",
    accentColor: "#C4856A",
    desc: "Come Estia, il tuo dono è creare casa: non un luogo fisico, ma uno spazio interiore di calore e raccoglimento. Sei il centro tranquillo attorno a cui gli altri si riuniscono senza che tu debba farlo esplicitamente. La tua forza è nella coerenza, nella continuità, nella presenza silenziosa. L'ombra è la paura del cambiamento: quando il focolare diventa rifugio dal mondo invece che base per uscirci.",
    myth: "Estia rinunciò al suo posto nell'Olimpo per stare nel focolare di ogni casa: il sacrificio silenzioso che tiene il mondo al caldo.",
  },
  // Oikos-Physis-Sympatheia-Chaos
  "Oikos-Physis-Sympatheia-Chaos": {
    name: "Artemide", epithetBase: "La Cacciatrice Libera",
    animal: "Cerva e Orso",
    accentColor: "#5A8060",
    desc: "Come Artemide, sei radicalmente fedele a te stessa. Non hai bisogno di approvazione: sai chi sei e non lo metti in discussione per nessuno. Sei a tuo agio nella natura, nel corpo, nella solitudine. Il tuo istinto è affilato e la tua autonomia è totale. Proteggi con ferocia ciò che ami. L'ombra è la selvatichezza difensiva: l'autonomia che diventa incapacità di lasciare entrare qualcuno.",
    myth: "Artemide trasformò Atteone in cervo per averla vista nuda: i confini del sé non si violano impunemente.",
  },
};

// ─── EPITETI ──────────────────────────────────────────────────────────────────
const EPITHETS = {
  "Zeus": {
    PA: { t: "Polieus — Il Costruttore di Città", s: "Lo Scettro", q: "Il cielo non mi è caduto in mano per caso. Ho imparato a reggere il peso di ciò che governa.", p: "La tua sfida è distinguere l'autorità dal controllo. Costruisci strutture che sopravvivano alla tua assenza." },
    PP: { t: "Xenios — Il Custode dell'Ospitalità", s: "La Bilancia", q: "Chi governa bene impara prima ad accogliere chi è diverso da lui.", p: "Il tuo potere è più solido quando include. Apri le porte prima di issare le mura." },
    TA: { t: "Keraunios — Il Fulminatore", s: "Il Fulmine", q: "Agisco quando la decisione è chiara. L'esitazione non è prudenza: è paura mascherata.", p: "Attenzione: la certezza che ti muove può diventare arroganza. Ascolta prima di colpire." },
    TP: { t: "Soter — Il Salvatore", s: "L'Aquila", q: "Il mio potere esiste perché qualcuno ne ha bisogno. Senza scopo, il fulmine è solo rumore.", p: "Sei portato/a alla contemplazione del bene comune. Traducila in azione concreta." },
  },
  "Apollo": {
    PA: { t: "Phoebus — Il Luminoso", s: "L'Arco d'Oro", q: "La chiarezza non è semplicità. È il risultato di un lungo lavoro di sottrazione.", p: "Usa la tua nitidezza per costruire, non solo per valutare. Non tutti reggono la tua luce." },
    PP: { t: "Musagete — Guida delle Muse", s: "La Lira", q: "Non guido le Muse con la forza. Le ispiro mostrandogli dove guarda la mia attenzione.", p: "La tua forza è nell'esempio silenzioso. Continua a creare: qualcuno ti segue senza che tu lo sappia." },
    TA: { t: "Agyieus — Il Protettore delle Strade", s: "Il Delfino", q: "La bellezza richiede coraggio. Non ogni via è sicura ma ogni via vale la pena.", p: "Sei orientato/a all'azione attraverso la forma. Agisci quando l'ispirazione è chiara: non aspettare la perfezione." },
    TP: { t: "Lykeios — Il Lupo della Luce", s: "Il Cigno", q: "Contemplo il bello non per fuggire dal reale, ma per vedere più chiaramente.", p: "La tua sensibilità è un dono che richiede protezione. Crea spazi dove può esprimersi senza difese." },
  },
  "Atena": {
    PA: { t: "Pallas — La Guerriera Saggia", s: "L'Elmo e la Lancia", q: "La strategia non è freddezza. È il modo in cui la saggezza si prende cura.", p: "Porta la tua intelligenza al servizio delle relazioni, non solo dei problemi. Le persone non sono equazioni." },
    PP: { t: "Ergane — La Tessitrice", s: "Il Telaio", q: "Ogni progetto è una tessitura. La pazienza è parte dell'arte, non un ostacolo.", p: "La tua maestria si esprime nella cura del processo. Non accelerare dove la lentezza è precisione." },
    TA: { t: "Promachos — La Prima in Battaglia", s: "Lo Scudo di Medusa", q: "Non aspetto che qualcuno risolva il problema. Vedo cosa va fatto e lo faccio.", p: "Il tuo coraggio è strategico, non impulsivo. Continua a calibrare azione e riflessione." },
    TP: { t: "Parthenos — La Vergine Integra", s: "Il Gufo", q: "La mia indipendenza non è mancanza. È la condizione che mi permette di vedere chiaramente.", p: "Lascia che la tua autonomia si apra a qualcosa. La vera saggezza conosce anche i propri limiti." },
  },
  "Hermes": {
    PA: { t: "Diaktoros — Il Messaggero", s: "Il Caduceo", q: "Porto idee tra mondi che non si parlano. Questo è il mio potere.", p: "La tua fluidità è un dono raro. Attenzione a non diventare solo un ponte: hai anche una direzione tua." },
    PP: { t: "Psychopomp — La Guida delle Anime", s: "I Sandali Alati", q: "Guido senza impormi. La guida migliore è quella che non si sente.", p: "Il tuo talento nel facilitare va usato anche verso te stesso/a. Dove stai andando tu?" },
    TA: { t: "Dolios — Il Furbetto Divino", s: "Il Petaso", q: "Le regole sono mappe, non il territorio. Io vivo nel territorio.", p: "La tua intelligenza laterale è potente. Canalizzala: il genio senza struttura disperde." },
    TP: { t: "Empolaios — Il Dio dei Mercanti", s: "La Borsa", q: "Il valore si crea nello scambio. Ogni transazione è un atto creativo.", p: "Sei un osservatore acuto del valore. Punta a qualcosa che vale anche quando non sei in movimento." },
  },
  "Era": {
    PA: { t: "Basileia — La Regina", s: "Il Diadema", q: "L'autorità vera non si impone. Si guadagna con la coerenza nel tempo.", p: "La tua forza è nella fedeltà ai valori. Attenzione che la lealtà non diventi rigidità." },
    PP: { t: "Teleia — La Dea del Matrimonio", s: "Il Melograno", q: "I legami che costruisco durano. Non perché li forzo, ma perché li coltivo.", p: "Investi nelle relazioni con la stessa strategia che usi nel resto. Le alleanze si costruiscono nel tempo." },
    TA: { t: "Zygia — L'Unificatrice", s: "Il Giogo", q: "Ciò che unisco è più forte della somma delle parti.", p: "Il tuo talento nell'armonizzare è raro. Usalo anche su te stessa/o: quali parti di te non si parlano?" },
    TP: { t: "Chera — La Vedova Dignitosa", s: "Il Pavone", q: "Ho imparato ad esistere nella perdita senza dissolvermi.", p: "La tua resilienza è una risorsa preziosa. Condividila: insegna agli altri come si regge il peso." },
  },
  "Afrodite": {
    PA: { t: "Pandemos — L'Amore Universale", s: "La Rosa", q: "L'amore non è debolezza. È il principio più potente dell'universo.", p: "La tua capacità di connettere è straordinaria. Ricorda che anche tu hai bisogno di essere nutrita/o." },
    PP: { t: "Ourania — L'Amore Celeste", s: "Il Cigno", q: "La bellezza che cerco non è superficie. È la forma che il divino prende quando si mostra.", p: "Il tuo senso estetico profondo è una guida. Fidati di ciò che ti commuove come di una bussola." },
    TA: { t: "Apostrophia — Colei che Allontana", s: "La Mela d'Oro", q: "Scelgo chi fa parte della mia vita con cura. Non ogni desiderio merita risposta.", p: "La tua capacità di desiderio è potente: usala selettivamente. Il confine è una forma di rispetto." },
    TP: { t: "Morpho — La Bellezza che Cambia Forma", s: "La Colomba", q: "La bellezza non è fissa. Si rivela nel momento in cui ci si apre alla sorpresa.", p: "Sei sensibile alle sfumature. Lascia che questa sensibilità ti guidi: sa cose che la mente non sa ancora." },
  },
  "Ares": {
    PA: { t: "Enyalios — Il Bellicoso", s: "La Lancia", q: "Il conflitto non è male. È il modo in cui la realtà si chiarisce.", p: "La tua forza è autentica. Mettila al servizio di qualcosa più grande della vittoria immediata." },
    PP: { t: "Brotoloigos — Il Flagello", s: "L'Elmo", q: "A volte la pace si compra solo con la forza.", p: "Attenzione alla distruttività fine a sé stessa. La guerra è uno strumento, non un fine." },
    TA: { t: "Alke — Il Coraggio in Azione", s: "Lo Scudo", q: "Agisco perché è giusto agire, non perché sono sicuro/a dell'esito.", p: "Il tuo coraggio è la tua risorsa più preziosa. Uniscilo alla saggezza: il guerriero che pensa vince più spesso." },
    TP: { t: "Thrax — Il Guerriero del Nord", s: "La Spada", q: "Rimango fermo nel mio valore anche quando il mondo cambia.", p: "La tua stabilità nel conflitto è ammirevole. Porta questa solidità nelle relazioni: è rara." },
  },
  "Dioniso": {
    PA: { t: "Lyaeus — Il Liberatore", s: "Il Tirso", q: "La libertà non si concede. Si riprende.", p: "La tua energia liberatoria è un dono per chi ti circonda. Attenzione a non dissolvere anche i confini necessari." },
    PP: { t: "Bromios — Il Fragoroso", s: "La Maschera", q: "Non esiste estasi senza resa. La trasformazione richiede che tu ti perda prima di ritrovarti.", p: "Le tue profondità sono ricche. Impara a tornare dal viaggio: non ogni abisso è da abitare." },
    TA: { t: "Zagreus — Il Grande Cacciatore", s: "La Pantera", q: "Sono stato smembrato e risorto. Questa è la mia forza: sopravvivo alla dissoluzione.", p: "Sei capace di rinascite potenti. Usale: ogni crisi è materiale grezzo per una versione nuova di te." },
    TP: { t: "Bassareus — Il Dio della Vigna", s: "L'Uva", q: "Il piacere non è distrazione. È una delle forme più oneste di presenza.", p: "La tua capacità di godere è una saggezza in sé. Difendila dalla cultura che la svaluta." },
  },
  "Demetra": {
    PA: { t: "Chloe — La Verde Germogliante", s: "La Spiga", q: "Ciò che coltivo cresce. Ciò che trascuro appassisce. Questa è tutta la saggezza.", p: "La tua dedizione alla cura è un dono. Ricorda di coltivare anche te stessa/o con la stessa attenzione." },
    PP: { t: "Thesmophoros — La Portatrice di Leggi", s: "Il Papavero", q: "Il ciclo della vita ha le sue leggi. Non si possono forzare: si possono solo seguire con grazia.", p: "La tua pazienza con i ritmi naturali è una virtù rara. Applicala anche dove vuoi vedere cambiamenti veloci." },
    TA: { t: "Erinys — La Furiosa", s: "La Falce", q: "Quando mi tolgono ciò che proteggo, il mondo smette di crescere.", p: "La tua ferocia a protezione di ciò che ami è legittima. Canalizzala: la rabbia giusta crea cambiamento." },
    TP: { t: "Malophoros — La Portatrice di Frutti", s: "Il Melograno", q: "I frutti non arrivano prima della loro stagione. Aspetto con piena fiducia.", p: "La tua capacità di aspettare è rara e potente. Assicurati che sia pazienza autentica, non evitamento." },
  },
  "Poseidone": {
    PA: { t: "Hippios — Il Signore dei Cavalli", s: "Il Tridente", q: "La forza non ha bisogno di urlare. La sento sotto la superficie, sempre pronta.", p: "La tua potenza è autentica. Impara a mostrarla con più frequenza: non tutti vedono ciò che non viene dichiarato." },
    PP: { t: "Asphaleios — Il Protettore", s: "L'Ancora", q: "Proteggo ciò che è mio con la stessa forza con cui l'oceano protegge le sue profondità.", p: "La tua lealtà è profonda. Assicurati che chi proteggi sappia quanto vali: la forza silenziosa spesso non viene vista." },
    TA: { t: "Ennosigaios — Lo Scuotitore della Terra", s: "Il Delfino", q: "Quando agisco, cambia il paesaggio. È la mia natura.", p: "Il tuo impatto è concreto e permanente. Usalo con intenzionalità: i terremoti non discriminano." },
    TP: { t: "Pelagaios — Il Dio del Mare Aperto", s: "Le Onde", q: "Non controllo ogni corrente. Ma so navigare.", p: "La tua relazione con la profondità è una risorsa preziosa. Condividila: pochi sanno dove sei stato." },
  },
  "Ade": {
    PA: { t: "Klymenos — Il Famoso", s: "Il Cerbero", q: "Il mio regno non è un luogo di punizione. È un luogo di trasformazione.", p: "Porta la tua profondità nel mondo. Chi ti conosce davvero capisce che le tue tenebre contengono più saggezza di molte luci." },
    PP: { t: "Polydegmon — Il Ricevitore di Molti", s: "Il Narciso", q: "Accolgo tutto ciò che viene. Non rifiuto la realtà nelle sue forme più dure.", p: "La tua capacità di accettare è rara. Applicala anche alle parti di te che vorresti fossero diverse." },
    TA: { t: "Chthonios — Il Sotterraneo", s: "Il Cipresso", q: "Agisco nelle fondamenta, dove nessuno guarda. Ma senza fondamenta, niente regge.", p: "Il tuo lavoro spesso non viene riconosciuto. Inizia a chiederti se questo ti va bene o se è tempo di emergere." },
    TP: { t: "Pluto — Il Ricco", s: "La Cornucopia", q: "La ricchezza vera sta nei recessi profondi, non in superficie.", p: "Sei in possesso di risorse interiori straordinarie. Smetti di nasconderle." },
  },
  "Estia": {
    PA: { t: "Prytaneia — Custode del Focolare Pubblico", s: "La Fiamma Eterna", q: "Il mio fuoco brucia per tutti. Non chiedo riconoscimento. Chiedo continuità.", p: "La tua dedizione è preziosa. Assicurati che ci sia qualcuno a prendersi cura anche di te." },
    PP: { t: "Kallistephone — La Corona della Bellezza Quieta", s: "Il Velo", q: "La pace non è assenza di conflitto. È sapere come tornare a sé dopo.", p: "Il tuo senso del centro è una guida per gli altri. Usalo come ancora anche nelle tempeste personali." },
    TA: { t: "Oikouros — La Guardiana della Casa", s: "Il Ramo d'Ulivo", q: "Preservo ciò che vale. Il tempo non scalfisce ciò che è autenticamente fondato.", p: "La tua capacità di creare stabilità è un dono reale. Concedi anche il cambiamento: il fuoco non è statico." },
    TP: { t: "Hestia Aethiopike — La Fiamma che Contempla", s: "Il Carbone Ardente", q: "Osservo il fuoco e capisco cose che le parole non possono dire.", p: "La tua vita interiore è profonda e ricca. Trova uno o due spazi per condividerla: il focolare è più caldo quando è condiviso." },
  },
  "Artemide": {
    PA: { t: "Agrotera — La Cacciatrice Selvatica", s: "L'Arco d'Argento", q: "Sono precisa perché conosco l'obiettivo. Non spreco frecce su ciò che non vale.", p: "La tua autonomia è autentica. Apriti a qualcosa o qualcuno che la testa dall'interno: cresci quando scegli di essere vulnerabile." },
    PP: { t: "Kourotrophos — La Nutrice dei Giovani", s: "La Cerva", q: "Proteggo ciò che è ancora fragile e non ancora formato.", p: "Il tuo istinto protettivo è potente. Applicalo con discernimento: non tutto ciò che è fragile ha bisogno di essere salvato." },
    TA: { t: "Phosphoros — La Portatrice di Luce Lunare", s: "La Luna Crescente", q: "Illumino la notte quel tanto che basta per trovare la via. Non di più.", p: "La tua misura è preziosa. In un mondo di eccessi, la tua moderazione è una forma di saggezza." },
    TP: { t: "Selene — La Luna Piena", s: "La Stella d'Argento", q: "Osservo il mondo di notte, quando abbassa le difese. Vedo ciò che di giorno si nasconde.", p: "La tua capacità di vedere nel buio è un dono. Fidati di ciò che percepisci quando gli altri dormono." },
  },
  "Dioniso": {
    PA: { t: "Lyaeus — Il Liberatore", s: "Il Tirso", q: "La libertà non si concede. Si riprende.", p: "La tua energia liberatoria è un dono per chi ti circonda. Attenzione a non dissolvere anche i confini necessari." },
    PP: { t: "Bromios — Il Fragoroso", s: "La Maschera", q: "Non esiste estasi senza resa. La trasformazione richiede che tu ti perda prima di ritrovarti.", p: "Le tue profondità sono ricche. Impara a tornare dal viaggio: non ogni abisso è da abitare." },
    TA: { t: "Zagreus — Il Grande Cacciatore", s: "La Pantera", q: "Sono stato smembrato e risorto. Questa è la mia forza: sopravvivo alla dissoluzione.", p: "Sei capace di rinascite potenti. Usale: ogni crisi è materiale grezzo per una versione nuova di te." },
    TP: { t: "Bassareus — Il Dio della Vigna", s: "L'Uva", q: "Il piacere non è distrazione. È una delle forme più oneste di presenza.", p: "La tua capacità di godere è una saggezza in sé. Difendila dalla cultura che la svaluta." },
  },
  "Persefone": {
    PA: { t: "Kore — La Fanciulla che Scende", s: "Il Melograno", q: "Scendo negli inferi non per caso. Ogni discesa è una scelta che non tutti capiscono.", p: "La tua capacità di attraversare le trasformazioni è eccezionale. Non trascurare il lato luminoso: ha diritto di esistere quanto il buio." },
    PP: { t: "Praxidike — Colei che Esegue Giustizia", s: "Il Grano Invernale", q: "La giustizia non è sempre visibile. Spesso lavora sotto la superficie, nell'oscurità.", p: "Il tuo senso di giustizia profonda è autentico. Portalo alla luce: il mondo ha bisogno di chi vede chiaro nel buio." },
    TA: { t: "Despoina — La Signora", s: "La Torcia", q: "Reggo due regni perché so chi sono in entrambi.", p: "La tua identità è solida anche nelle transizioni. Insegnalo: molti perdono sé stessi quando il contesto cambia." },
    TP: { t: "Melitode — La Dolce come il Miele", s: "Il Narciso", q: "C'è dolcezza anche nell'ombra. Ci vuole coraggio per trovarla.", p: "La tua sensibilità è una forza, non una fragilità. Coltivala nei periodi tranquilli: ti servirà nei periodi difficili." },
  },
  "Pan": {
    PA: { t: "Aigipan — Il Capra-Tutto", s: "Il Flauto di Pan", q: "Sono ovunque e da nessuna parte. Questo è il mio potere.", p: "La tua vitalità è contagiosa. Canalizzala in qualcosa: l'energia senza direzione diventa ansia." },
    PP: { t: "Nomios — Il Pastore", s: "Il Bastone del Pastore", q: "Conosco ogni sentiero di questo bosco. Non perché li ho studiati. Perché li ho vissuti.", p: "La tua saggezza è incarnata, non libresca. Fidati di essa e condividila: è rara quanto preziosa." },
    TA: { t: "Sirinx — La Voce del Bosco", s: "La Canna", q: "La musica nasce dalla perdita. Il flauto era una ninfa. Non ho dimenticato.", p: "Sei capace di trasformare il dolore in bellezza. Riconosci questo dono: non tutti ce l'hanno." },
    TP: { t: "Agreus — Il Selvaggio", s: "La Rete da Caccia", q: "Non ho bisogno di un piano. Ho bisogno di un bosco.", p: "La tua libertà è autentica. Assicurati che sia libertà vera e non evitamento: i confini giusti amplificano, non limitano." },
  },
  "Efesto": {
    PA: { t: "Klytotechnes — Il Famoso Artigiano", s: "L'Incudine", q: "La perfezione non è un punto di arrivo. È il modo in cui si lavora ogni giorno.", p: "La tua dedizione alla qualità è ammirevole. Esci dall'officina ogni tanto: il mondo ha bisogno di vedere cosa fai." },
    PP: { t: "Amphigaeis — Il Claudicante", s: "La Tenaglia", q: "Il mio limite fisico è diventato la mia forza. Ho costruito ciò che nessun dio integro avrebbe potuto.", p: "Le tue vulnerabilità sono state la tua fucina. Non nasconderle: sono la prova della tua trasformazione." },
    TA: { t: "Polyphrôn — Il Dai Molti Pensieri", s: "Il Fuoco della Fucina", q: "Ogni problema ha una soluzione. Spesso è solo una questione di trovare il materiale giusto.", p: "La tua inventiva è potente. Applicala anche alle tue relazioni: hanno bisogno della stessa cura dei tuoi progetti." },
    TP: { t: "Chalkeus — Il Bronzista", s: "Il Martello", q: "Lavoro in silenzio. Ma ciò che creo dura più delle parole di chiunque altro.", p: "Il tuo impatto è duraturo. Impara a comunicarlo: non tutti vedono il valore di ciò che non brilla subito." },
  },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ─── DATABASE ─────────────────────────────────────────────────────────────────
const DB = {
  getUsers: () => { try { return JSON.parse(localStorage.getItem("oracle_users") || "{}"); } catch { return {}; } },
  saveUsers: (u) => { try { localStorage.setItem("oracle_users", JSON.stringify(u)); } catch {} },
  getResults: (userId) => { try { return JSON.parse(localStorage.getItem(`oracle_results_${userId}`) || "[]"); } catch { return []; } },
  saveResult: (userId, result) => {
    try {
      const arr = DB.getResults(userId);
      arr.unshift(result);
      localStorage.setItem(`oracle_results_${userId}`, JSON.stringify(arr.slice(0, 20)));
    } catch {}
  },
};

// ─── GRAPHIC COMPONENTS ───────────────────────────────────────────────────────
function RadarChart({ data, size = 260, accentColor = T.gold }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const labels = ["Oikos/Agorà", "Nous/Physis", "Logos/Sympath.", "Chaos/Cosmos", "Pathos/Atarassia", "Praxis/Theoria"];
  const n = labels.length;
  const pts = data.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * (v / 100) * Math.cos(angle), y: cy + r * (v / 100) * Math.sin(angle) };
  });
  const gridPts = (scale) => labels.map((_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={gridPts(s).join(" ")} fill="none" stroke={accentColor} strokeWidth="1" opacity={s === 1 ? 0.4 : 0.2} />
      ))}
      {labels.map((_, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke={accentColor} strokeWidth="1" opacity="0.3" />;
      })}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill={accentColor} fillOpacity="0.2" stroke={accentColor} strokeWidth="2.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={accentColor} stroke={T.obsidian} strokeWidth="1.5" />)}
      {labels.map((l, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (r + 28) * Math.cos(a), ly = cy + (r + 28) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={T.parchment} fontFamily="Georgia, serif" fontWeight="600" opacity="0.85">{l}</text>
        );
      })}
    </svg>
  );
}

function StarProfile({ axes, accentColor = T.gold }) {
  const axesDefs = [
    { id: 1, left: "Oikos", right: "Agorà" },
    { id: 2, left: "Nous", right: "Physis" },
    { id: 3, left: "Logos", right: "Sympath." },
    { id: 4, left: "Chaos", right: "Cosmos" },
    { id: 5, left: "Pathos", right: "Atarassia" },
    { id: 6, left: "Praxis", right: "Theoria" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 240, flex: 1 }}>
      {axesDefs.map((ax) => {
        const pct = axes[ax.id] ?? 50;
        const leftDom = pct > 50;
        return (
          <div key={ax.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, fontFamily: "Georgia, serif" }}>
              <span style={{ color: leftDom ? accentColor : T.stone, fontWeight: leftDom ? 700 : 400 }}>{pct}% {ax.left}</span>
              <span style={{ color: !leftDom ? accentColor : T.stone, fontWeight: !leftDom ? 700 : 400 }}>{ax.right} {100 - pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: T.ash, display: "flex", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, background: leftDom ? accentColor : T.ash, transition: "width 1.2s ease", borderRight: `1px solid ${T.obsidian}` }} />
              <div style={{ width: `${100 - pct}%`, background: !leftDom ? accentColor : T.ash, transition: "width 1.2s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OracleQuote({ quote, deityName, accentColor, symbol }) {
  return (
    <div style={{
      position: "relative", margin: "36px 0", padding: "44px 36px 32px",
      background: `linear-gradient(135deg, ${T.obsidian} 0%, ${T.obsidianLight} 100%)`,
      border: `1px solid ${accentColor}44`, borderLeft: `4px solid ${accentColor}`,
      borderRadius: "2px 12px 12px 2px",
      boxShadow: `0 0 40px ${accentColor}18, inset 0 0 60px rgba(0,0,0,0.4)`,
    }}>
      <div style={{ position: "absolute", top: 0, left: 40, right: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)` }} />
      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", background: T.obsidian, padding: "3px 18px", border: `1px solid ${accentColor}66`, borderRadius: 3, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: accentColor, fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>{symbol}</div>
      <div style={{ position: "absolute", top: 14, left: 20, fontSize: 64, color: accentColor, opacity: 0.12, fontFamily: "Georgia, serif", lineHeight: 1 }}>"</div>
      <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", fontStyle: "italic", lineHeight: 1.85, color: T.parchment, margin: 0, textAlign: "center", position: "relative", zIndex: 1, textShadow: `0 0 30px ${accentColor}33` }}>{quote}</p>
      <div style={{ marginTop: 18, textAlign: "right", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: accentColor, opacity: 0.65, fontFamily: "Georgia, serif" }}>— {deityName}</div>
      <div style={{ position: "absolute", bottom: 0, left: 40, right: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)` }} />
    </div>
  );
}

function InfoTile({ label, value, accentColor }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 4, border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${accentColor}66` }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: accentColor, marginBottom: 5, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#DDD0AC" }}>{value}</div>
    </div>
  );
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const inputBase = {
  padding: "11px 15px", borderRadius: 4, border: `1px solid ${T.ash}`,
  fontSize: 15, fontFamily: "Georgia, serif", outline: "none", width: "100%",
  background: "rgba(255,255,255,0.04)", color: T.parchment, transition: "border-color .2s",
};

const btnGold = {
  background: `linear-gradient(135deg, ${T.goldDim}, ${T.gold})`,
  color: T.obsidian, border: "none", borderRadius: 3,
  padding: "0 22px", height: 44,
  fontSize: "clamp(12px,2vw,13px)", fontFamily: "Georgia, serif",
  fontWeight: 700, cursor: "pointer", letterSpacing: 1,
  textTransform: "uppercase", whiteSpace: "nowrap",
  boxShadow: `0 4px 20px ${T.gold}33`, transition: "all .2s",
};

const btnGhost = {
  background: "transparent", color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 3,
  padding: "0 22px", height: 44, fontSize: "clamp(12px,2vw,13px)", fontFamily: "Georgia, serif",
  fontWeight: 400, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", transition: "all .2s",
};

const btnFade = {
  background: "transparent", color: T.stone, border: `1px solid ${T.ash}`, borderRadius: 3,
  padding: "0 22px", height: 44, fontSize: "clamp(11px,2vw,12px)", fontFamily: "Georgia, serif",
  fontWeight: 400, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", transition: "all .2s",
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const QPerPage = 10;

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [responses, setResponses] = useState({});
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [barsVisible, setBarsVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const totalPages = Math.ceil(QUESTIONS.length / QPerPage);

  useEffect(() => {
    try { const t = localStorage.getItem("oracle_theme"); if (t) setDarkMode(t === "dark"); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("oracle_theme", darkMode ? "dark" : "light"); } catch {}
  }, [darkMode]);
  useEffect(() => {
    if (screen === "result") setTimeout(() => setBarsVisible(true), 500);
  }, [screen]);

  const theme = {
    bg: darkMode ? T.obsidian : L.background,
    surface: darkMode ? T.obsidianLight : L.surface,
    surfaceDeep: darkMode ? T.smoke : L.surfaceDeep,
    text: darkMode ? T.parchment : L.text,
    textSecondary: darkMode ? T.parchmentDark : L.textSecondary,
    border: darkMode ? T.ash : L.border,
    inputBg: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    inputColor: darkMode ? T.parchment : L.text,
  };

  const currentQs = QUESTIONS.slice(page * QPerPage, (page + 1) * QPerPage);
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  // ── AUTH ───────────────────────────────────────────────────────────────────
  const handleAuth = () => {
    setAuthError("");
    const users = DB.getUsers();
    if (authMode === "register") {
      if (!authForm.name.trim()) return setAuthError("Inserisci un nome.");
      if (!authForm.email.includes("@")) return setAuthError("Email non valida.");
      if (authForm.password.length < 6) return setAuthError("Password: almeno 6 caratteri.");
      if (users[authForm.email]) return setAuthError("Email già registrata.");
      const user = { id: uid(), name: authForm.name.trim(), email: authForm.email };
      users[authForm.email] = { ...user, pw: authForm.password };
      DB.saveUsers(users);
      setCurrentUser(user);
      setScreen("start");
    } else {
      const u = users[authForm.email];
      if (!u || u.pw !== authForm.password) return setAuthError("Credenziali errate.");
      setCurrentUser({ id: u.id, name: u.name, email: u.email });
      setScreen("start");
    }
  };

  const continueAsGuest = () => {
    const user = { id: uid(), name: "Ospite", email: "" };
    setCurrentUser(user);
    setScreen("start");
  };

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  const saveAnswer = (qId, val) => setResponses(r => ({ ...r, [qId]: parseInt(val) }));

  const startQuiz = () => {
    setResponses({}); setPage(0); setBarsVisible(false); setScreen("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextPage = () => {
    const start = page * QPerPage;
    const end = Math.min(start + QPerPage, QUESTIONS.length);
    for (let i = start; i < end; i++) {
      if (responses[QUESTIONS[i].id] === undefined) {
        alert("Rispondi a tutte le affermazioni prima di avanzare."); return;
      }
    }
    if (page < totalPages - 1) {
      setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      processResults();
    }
  };

  const prevPage = () => {
    if (page > 0) { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  // ── CALCOLO RISULTATO ──────────────────────────────────────────────────────
  const processResults = () => {
    setScreen("loading");
    setTimeout(calculateAndShow, 2800 + Math.random() * 2000);
  };

  const calculateAndShow = () => {
    // Accumula score per asse
    // Domande normali: risposta 1=+3, 2=+2, 3=+1, 4=0, 5=-1, 6=-2, 7=-3
    // Domande inv: risposta 1=-3 ... 7=+3
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    QUESTIONS.forEach((q) => {
      const raw = responses[q.id];
      if (raw === undefined) return;
      // raw è -3 a +3 già dalla saveAnswer
      const val = q.inv ? -raw : raw;
      scores[q.a] += val;
      counts[q.a]++;
    });

    // Polarità su 4 assi diagnostici (1-4)
    const resolve = (s) => s >= 0;  // true = polo sinistro
    const pol1 = resolve(scores[1]) ? "Oikos" : "Agora";
    const pol2 = resolve(scores[2]) ? "Nous" : "Physis";
    const pol3 = resolve(scores[3]) ? "Logos" : "Sympatheia";
    const pol4 = resolve(scores[4]) ? "Chaos" : "Cosmos";

    const deityKey = `${pol1}-${pol2}-${pol3}-${pol4}`;
    const deity = DEITIES[deityKey] || DEITIES["Oikos-Nous-Logos-Cosmos"];

    // Epiteto da assi 5 e 6
    const epAxis5 = resolve(scores[5]) ? "P" : "T"; // Pathos o Tranquillità
    const epAxis6 = resolve(scores[6]) ? "A" : "P"; // Attivo o Passivo (Praxis o Passivo)
    const epKey = epAxis5 + epAxis6;
    const deityEpithets = EPITHETS[deity.name] || {};
    const ep = deityEpithets[epKey] || deityEpithets["PA"] || {
      t: "Il Mistero Svelato", s: "◎", q: "Conosci te stesso.", p: "La via è tua."
    };

    // Percentuali per gli assi (0-100, 50 = neutro)
    const axes = {};
    for (let ax = 1; ax <= 6; ax++) {
      const maxScore = counts[ax] * 3;
      if (maxScore === 0) { axes[ax] = 50; continue; }
      axes[ax] = Math.round(((scores[ax] + maxScore) / (maxScore * 2)) * 100);
    }

    const r = { id: uid(), date: now(), deity, ep, axes, deityKey, epKey, scores };
    DB.saveResult(currentUser.id, r);
    setResult(r);
    setScreen("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── SHARE ──────────────────────────────────────────────────────────────────
  const shareText = result ? `L'Oracolo di Delfi ha parlato: sono ${result.deity.name} — ${result.ep.t}\n\n"${result.ep.q}"\n\nScopri anche tu la tua divinità greca!` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText + "\n\n" + window.location.href);
      setCopiedMsg("Copiato!");
      setTimeout(() => setCopiedMsg(""), 2500);
    } catch { setCopiedMsg("Errore."); }
  };

  const shareToTwitter = () => {
    if (!result) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToWhatsApp = () => {
    if (!result) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + window.location.href)}`, "_blank");
  };

  const shareToFacebook = () => {
    if (!result) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "width=600,height=400");
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Oracolo di Delfi: ${result?.deity.name}`, text: shareText, url: window.location.href }); }
      catch {}
    } else { handleCopyLink(); }
  };

  const loadHistory = () => {
    setHistory(DB.getResults(currentUser?.id || ""));
    setScreen("history");
  };

  // ─── RENDERS ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "Georgia, serif", color: theme.text, transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:.82} 92%{opacity:.95} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        * { box-sizing:border-box; }
        input, textarea { font-family: Georgia, serif !important; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${theme.bg}; }
        ::-webkit-scrollbar-thumb { background:${theme.border}; border-radius:3px; }
        button:hover { opacity:.88; transform:translateY(-1px); }
        button:active { transform:translateY(0); }
      `}</style>

      {/* Decorative borders */}
      <div style={{ position:"fixed", top:0, left:0, width:2, height:"100vh", background:`linear-gradient(to bottom, transparent, ${T.gold}33, transparent)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:0, right:0, width:2, height:"100vh", background:`linear-gradient(to bottom, transparent, ${T.gold}33, transparent)`, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${T.gold}55, transparent)`, pointerEvents:"none", zIndex:10 }} />

      {/* Theme toggle */}
      <button onClick={() => setDarkMode(d => !d)} style={{ position:"fixed", top:16, right:16, zIndex:1000, background:theme.surface, border:`1px solid ${theme.border}`, borderRadius:"50%", width:40, height:40, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 2px 8px rgba(0,0,0,0.25)", transition:"all .3s" }} title={darkMode ? "Tema chiaro" : "Tema scuro"}>
        {darkMode ? "☀" : "☾"}
      </button>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 80px", position: "relative", zIndex: 1 }}>

        {/* ────────── AUTH ────────── */}
        {screen === "auth" && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ fontSize:72, color:T.gold, letterSpacing:2, lineHeight:1, animation:"flicker 4s ease-in-out infinite", textShadow:`0 0 30px ${T.gold}88` }}>Ω</div>
              <h1 style={{ fontSize:"clamp(1.8rem,5vw,3rem)", color:theme.text, margin:"14px 0 8px", letterSpacing:3, textTransform:"uppercase", fontWeight:400 }}>L'Oracolo di Delfi</h1>
              <div style={{ width:100, height:1, background:`linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin:"10px auto" }} />
              <p style={{ color:T.goldDim, fontSize:13, fontStyle:"italic", letterSpacing:1 }}>Γνῶθι σεαυτόν — Conosci te stesso</p>
            </div>

            <div style={{ width:"100%", maxWidth:420, background:theme.surface, borderRadius:8, padding:"clamp(24px,5vw,40px)", border:`1px solid ${theme.border}` }}>
              {/* Tab toggle */}
              <div style={{ display:"flex", marginBottom:28, borderRadius:4, overflow:"hidden", border:`1px solid ${theme.border}` }}>
                {["login","register"].map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{ flex:1, height:40, border:"none", cursor:"pointer", fontFamily:"Georgia, serif", fontSize:13, letterSpacing:1, textTransform:"uppercase", background: authMode===m ? T.gold : "transparent", color: authMode===m ? T.obsidian : theme.textSecondary, fontWeight: authMode===m ? 700 : 400, transition:"all .2s" }}>
                    {m === "login" ? "Accedi" : "Registrati"}
                  </button>
                ))}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {authMode === "register" && (
                  <input placeholder="Nome" value={authForm.name} onChange={e => setAuthForm(f => ({...f, name:e.target.value}))}
                    style={{ ...inputBase, background:theme.inputBg, color:theme.inputColor, borderColor:theme.border }} />
                )}
                <input type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm(f => ({...f, email:e.target.value}))}
                  onKeyDown={e => e.key==="Enter" && handleAuth()}
                  style={{ ...inputBase, background:theme.inputBg, color:theme.inputColor, borderColor:theme.border }} />
                <input type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm(f => ({...f, password:e.target.value}))}
                  onKeyDown={e => e.key==="Enter" && handleAuth()}
                  style={{ ...inputBase, background:theme.inputBg, color:theme.inputColor, borderColor:theme.border }} />
                {authError && <p style={{ color:"#C94A4A", fontSize:13, margin:0 }}>{authError}</p>}
                <button onClick={handleAuth} style={{ ...btnGold, width:"100%", height:46, fontSize:14 }}>
                  {authMode === "login" ? "Entra nel Tempio" : "Crea il tuo Profilo"}
                </button>
                <button onClick={continueAsGuest} style={{ ...btnFade, width:"100%", height:40, fontSize:12 }}>
                  Continua come Ospite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ────────── START ────────── */}
        {screen === "start" && (
          <div style={{ paddingTop:80, textAlign:"center", animation:"fadeInUp .7s ease" }}>
            <div style={{ fontSize:56, color:T.gold, animation:"flicker 4s ease-in-out infinite", marginBottom:20 }}>Ω</div>
            <h1 style={{ fontSize:"clamp(2rem,6vw,4rem)", color:theme.text, margin:"0 0 8px", letterSpacing:3, textTransform:"uppercase", fontWeight:400 }}>Benvenuto/a, {currentUser?.name}</h1>
            <div style={{ width:80, height:1, background:`linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin:"12px auto 20px" }} />
            <p style={{ color:T.goldDim, fontSize:13, fontStyle:"italic", letterSpacing:1, marginBottom:48 }}>Γνῶθι σεαυτόν — L'oracolo ha 150 domande. Rispondi con onestà.</p>

            <div style={{ background:theme.surface, borderRadius:8, padding:"clamp(24px,4vw,40px)", border:`1px solid ${theme.border}`, marginBottom:32, textAlign:"left" }}>
              <h3 style={{ color:T.gold, fontSize:16, letterSpacing:2, textTransform:"uppercase", marginTop:0, marginBottom:16 }}>Come funziona</h3>
              <p style={{ color:theme.textSecondary, lineHeight:1.8, fontSize:14, margin:"0 0 12px" }}>Risponderai a 150 affermazioni usando una scala da <strong style={{color:theme.text}}>Molto in disaccordo</strong> a <strong style={{color:theme.text}}>Molto d'accordo</strong>.</p>
              <p style={{ color:theme.textSecondary, lineHeight:1.8, fontSize:14, margin:"0 0 12px" }}>Le tue risposte vengono analizzate su <strong style={{color:theme.text}}>6 assi psicologici</strong> ispirat alle dicotomie filosofiche greche.</p>
              <p style={{ color:theme.textSecondary, lineHeight:1.8, fontSize:14, margin:0 }}>L'oracolo ti rivelerà la <strong style={{color:theme.text}}>divinità greca</strong> che meglio incarna la tua architettura interiore — e il tuo epiteto specifico.</p>
            </div>

            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={startQuiz} style={{ ...btnGold, height:50, fontSize:15, padding:"0 32px" }}>Inizia l'Oracolo</button>
              {DB.getResults(currentUser?.id||"").length > 0 && (
                <button onClick={loadHistory} style={{ ...btnGhost, height:50 }}>Storico Responsi</button>
              )}
              <button onClick={() => setScreen("auth")} style={{ ...btnFade, height:50 }}>Cambia Utente</button>
            </div>
          </div>
        )}

        {/* ────────── QUIZ ────────── */}
        {screen === "quiz" && (
          <div style={{ paddingTop:40, animation:"fadeInUp .5s ease" }}>
            {/* Progress */}
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:12, color:T.goldDim, letterSpacing:2, textTransform:"uppercase" }}>Pagina {page+1} di {totalPages}</span>
                <span style={{ fontSize:12, color:T.goldDim, letterSpacing:1 }}>{answered} / {QUESTIONS.length} risposte</span>
              </div>
              <div style={{ height:3, background:T.ash, borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg, ${T.goldDim}, ${T.gold})`, transition:"width .4s ease", borderRadius:2 }} />
              </div>
            </div>

            {/* Scale header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", marginBottom:24, padding:"10px 0", borderBottom:`1px solid ${theme.border}` }}>
              <span style={{ fontSize:11, color:T.agree, letterSpacing:1, textTransform:"uppercase" }}>← D'accordo</span>
              <span style={{ fontSize:10, color:T.stone, letterSpacing:1 }}>Neutro</span>
              <span style={{ fontSize:11, color:T.ember, letterSpacing:1, textTransform:"uppercase", textAlign:"right" }}>In disaccordo →</span>
            </div>

            {/* Questions */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {currentQs.map((q, qi) => {
                const curr = responses[q.id];
                return (
                  <div key={q.id} style={{ background:theme.surface, borderRadius:6, padding:"clamp(16px,3vw,24px)", border:`1px solid ${theme.border}`, transition:"border-color .2s", borderColor: curr !== undefined ? `${T.gold}44` : theme.border }}>
                    <p style={{ margin:"0 0 16px", fontSize:"clamp(13px,2vw,15px)", lineHeight:1.7, color:theme.text }}>
                      <span style={{ color:T.goldDim, fontSize:11, marginRight:8 }}>{q.id}.</span>{q.t}
                    </p>
                    {/* 7-point Likert: values -3 to +3 */}
                    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:4 }}>
                      {[-3,-2,-1,0,1,2,3].map(val => {
                        const abs = Math.abs(val);
                        const dim = [22,30,38,26,38,30,22][val+3];
                        const isAgree = val > 0;
                        const isNeutral = val === 0;
                        const color = isNeutral ? T.stone : isAgree ? T.agree : T.ember;
                        const selected = curr === val;
                        return (
                          <label key={val} style={{ display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", flex:1 }}>
                            <input type="radio" name={`q${q.id}`} value={val} checked={selected} onChange={() => saveAnswer(q.id, val)} style={{ display:"none" }} />
                            <div style={{ width:dim, height:dim, borderRadius:"50%", border:`2px solid ${color}`, background: selected ? color : "transparent", transition:"all .15s", boxShadow: selected ? `0 0 12px ${color}88` : "none", margin:"0 auto" }} />
                          </label>
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:T.stone }}>
                      <span>Molto d'accordo</span>
                      <span>Molto in disaccordo</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:32, gap:12 }}>
              <button onClick={prevPage} disabled={page===0} style={{ ...btnFade, opacity: page===0 ? 0.3 : 1, cursor: page===0 ? "default" : "pointer" }}>← Precedente</button>
              <button onClick={nextPage} style={btnGold}>
                {page < totalPages-1 ? "Avanti →" : "Consulta l'Oracolo ⚡"}
              </button>
            </div>
          </div>
        )}

        {/* ────────── LOADING ────────── */}
        {screen === "loading" && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, animation:"fadeInUp .8s ease" }}>
            <div style={{ fontSize:72, color:T.gold, animation:"flicker 2s ease-in-out infinite" }}>Ω</div>
            <div style={{ textAlign:"center" }}>
              <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", color:theme.text, margin:"0 0 12px", letterSpacing:3, textTransform:"uppercase", fontWeight:400 }}>L'Oracolo sta consultando</h2>
              <p style={{ color:T.goldDim, fontSize:13, fontStyle:"italic", animation:"pulse 2s ease-in-out infinite" }}>Le Moire tessono il filo del tuo destino...</p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.gold, animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* ────────── RESULT ────────── */}
        {screen === "result" && result && (
          <div style={{ paddingTop:48, animation:"fadeInUp .9s ease" }}>
            {/* Hero */}
            <div style={{ textAlign:"center", marginBottom:4 }}>
              <div style={{ fontSize:11, color:result.deity.accentColor, letterSpacing:4, textTransform:"uppercase", marginBottom:14, opacity:0.8 }}>L'Oracolo ha parlato</div>
              <h1 style={{ fontSize:"clamp(3rem,10vw,5.5rem)", color:result.deity.accentColor, margin:"0 0 4px", letterSpacing:4, fontWeight:400, textTransform:"uppercase", textShadow:`0 0 50px ${result.deity.accentColor}55`, lineHeight:1 }}>
                {result.deity.name}
              </h1>
              <div style={{ width:180, height:1, background:`linear-gradient(90deg, transparent, ${result.deity.accentColor}, transparent)`, margin:"14px auto" }} />
              <h2 style={{ fontSize:"clamp(.95rem,2.5vw,1.4rem)", color:theme.textSecondary, margin:"0 0 4px", fontStyle:"italic", fontWeight:400 }}>{result.ep.t}</h2>
              <p style={{ fontSize:13, color:result.deity.accentColor, opacity:.6, margin:0, letterSpacing:1 }}>{result.deity.epithetBase}</p>
            </div>

            {/* Image */}
            <div style={{ borderRadius:6, overflow:"hidden", margin:"28px 0", border:`1px solid ${result.deity.accentColor}44`, boxShadow:`0 20px 60px rgba(0,0,0,.7)`, height:380, background:T.obsidian }}>
              <DeityImage name={result.deity.name} style={{ width:"100%", height:"100%", display:"block" }} />
            </div>

            {/* Quote */}
            <OracleQuote quote={result.ep.q} deityName={`${result.deity.name}, ${result.ep.t}`} accentColor={result.deity.accentColor} symbol={result.ep.s || "◎"} />

            {/* Content */}
            <div style={{ background:theme.surface, borderRadius:8, padding:"clamp(22px,4vw,40px)", border:`1px solid ${theme.border}`, marginBottom:24 }}>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:result.deity.accentColor, marginBottom:10, opacity:.7 }}>◈ Il tuo Archetipo Divino</div>
                <p style={{ fontSize:"clamp(.92rem,2vw,1.05rem)", lineHeight:1.9, color:theme.textSecondary, margin:0 }}>{result.deity.desc}</p>
              </div>

              {result.deity.myth && (
                <div style={{ background:`${result.deity.accentColor}08`, borderRadius:4, padding:"14px 18px", border:`1px solid ${result.deity.accentColor}22`, marginBottom:28 }}>
                  <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:result.deity.accentColor, opacity:.7, marginBottom:6 }}>Il Mito</div>
                  <p style={{ fontSize:13, color:theme.textSecondary, fontStyle:"italic", margin:0, lineHeight:1.7 }}>{result.deity.myth}</p>
                </div>
              )}

              <div style={{ background:`${result.deity.accentColor}0A`, borderRadius:4, padding:"16px 20px", border:`1px solid ${result.deity.accentColor}22`, marginBottom:28 }}>
                <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:result.deity.accentColor, opacity:.7, marginBottom:8 }}>La Via Oracolare</div>
                <p style={{ fontSize:14, color:theme.text, lineHeight:1.75, margin:0 }}>{result.ep.p}</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:10, marginBottom:32 }}>
                <InfoTile label="Animale Sacro" value={result.deity.animal} accentColor={result.deity.accentColor} />
                <InfoTile label="Il tuo Simbolo" value={result.ep.s || "◎"} accentColor={result.deity.accentColor} />
                <InfoTile label="Combinazione" value={result.deityKey.replace(/-/g," · ")} accentColor={result.deity.accentColor} />
              </div>

              {/* Charts */}
              <h3 style={{ textAlign:"center", fontSize:"clamp(1rem,2.5vw,1.3rem)", marginBottom:28, letterSpacing:2, textTransform:"uppercase", fontWeight:400, color:theme.text }}>L'Architettura della tua Anima</h3>
              <div style={{ display:"flex", flexWrap:"wrap", gap:28, justifyContent:"center", alignItems:"center" }}>
                <RadarChart data={[1,2,3,4,5,6].map(ax => result.axes[ax] ?? 50)} accentColor={result.deity.accentColor} />
                {barsVisible && <StarProfile axes={result.axes} accentColor={result.deity.accentColor} />}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
              <button onClick={() => setShowShareModal(true)} style={btnGold}>🔗 Condividi</button>
              <button onClick={loadHistory} style={btnGhost}>Storico</button>
              <button onClick={startQuiz} style={btnGhost}>Rifai il Test</button>
              <button onClick={() => setScreen("start")} style={btnFade}>← Inizio</button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }} onClick={() => setShowShareModal(false)}>
                <div style={{ background:theme.surface, borderRadius:10, padding:32, maxWidth:380, width:"100%", border:`1px solid ${theme.border}` }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ marginTop:0, textAlign:"center", color:theme.text, letterSpacing:2, textTransform:"uppercase", fontSize:16 }}>Condividi il Responso</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {navigator.share && (
                      <button onClick={() => { nativeShare(); setShowShareModal(false); }} style={{ ...btnGold, width:"100%" }}>📱 Condividi</button>
                    )}
                    <button onClick={() => { shareToTwitter(); setShowShareModal(false); }} style={{ ...btnGold, width:"100%", background:"linear-gradient(135deg,#1a1a2e,#16213e)" }}>𝕏 Twitter / X</button>
                    <button onClick={() => { shareToWhatsApp(); setShowShareModal(false); }} style={{ ...btnGold, width:"100%", background:"linear-gradient(135deg,#1B5E20,#2E7D32)" }}>💬 WhatsApp</button>
                    <button onClick={() => { shareToFacebook(); setShowShareModal(false); }} style={{ ...btnGold, width:"100%", background:"linear-gradient(135deg,#0D47A1,#1565C0)" }}>Facebook</button>
                    <button onClick={handleCopyLink} style={{ ...btnGhost, width:"100%" }}>
                      {copiedMsg || "📋 Copia Testo"}
                    </button>
                    <button onClick={() => setShowShareModal(false)} style={{ ...btnFade, width:"100%" }}>Annulla</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────── HISTORY ────────── */}
        {screen === "history" && (
          <div style={{ paddingTop:48, animation:"fadeInUp .6s ease" }}>
            <h2 style={{ fontSize:"clamp(1.4rem,4vw,2.2rem)", color:theme.text, margin:"0 0 8px", letterSpacing:3, textTransform:"uppercase", fontWeight:400 }}>Storico Responsi</h2>
            <div style={{ width:60, height:1, background:`linear-gradient(90deg, ${T.gold}, transparent)`, marginBottom:32 }} />

            {history.length === 0 ? (
              <p style={{ color:theme.textSecondary, fontStyle:"italic" }}>Nessun responso ancora consultato.</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {history.map((h, i) => (
                  <div key={h.id} style={{ background:theme.surface, borderRadius:6, padding:"clamp(16px,3vw,24px)", border:`1px solid ${theme.border}`, borderLeft:`4px solid ${h.deity?.accentColor || T.gold}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                      <div>
                        <div style={{ fontSize:"clamp(1.1rem,3vw,1.4rem)", color:h.deity?.accentColor || T.gold, fontWeight:400, letterSpacing:2 }}>{h.deity?.name}</div>
                        <div style={{ fontSize:13, color:theme.textSecondary, fontStyle:"italic", marginTop:2 }}>{h.ep?.t}</div>
                      </div>
                      <div style={{ fontSize:11, color:T.stone, whiteSpace:"nowrap" }}>{new Date(h.date).toLocaleDateString("it-IT")}</div>
                    </div>
                    {h.ep?.q && (
                      <p style={{ fontSize:13, fontStyle:"italic", color:theme.textSecondary, margin:"12px 0 0", lineHeight:1.6, borderTop:`1px solid ${theme.border}`, paddingTop:10 }}>"{h.ep.q}"</p>
                    )}
                    <button onClick={() => { setResult(h); setBarsVisible(false); setScreen("result"); setTimeout(()=>setBarsVisible(true),500); }} style={{ ...btnGhost, marginTop:14, height:36, fontSize:11 }}>Vedi completo →</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:12, marginTop:32, flexWrap:"wrap" }}>
              <button onClick={() => setScreen("start")} style={btnGhost}>← Torna all'inizio</button>
              <button onClick={startQuiz} style={btnGold}>Nuovo Test</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
