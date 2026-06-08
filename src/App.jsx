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
  agree: "#4A7C59",
  disagree: "#7C4A5E",
  neutral: "#8A8078",
};

// ─── IMMAGINI CON FALLBACK SVG ─────────────────────────────────────────────────
const DEITY_IMAGES = {
  "Zeus": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Jupiter_Smyrna_Louvre_Ma13.jpg/330px-Jupiter_Smyrna_Louvre_Ma13.jpg",
    fallbackSymbol: "⚡",
    fallbackColor: "#C9A84C",
  },
  "Apollo": {
    google: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Apollo_Belvedere_3.jpg",
    fallbackSymbol: "☀",
    fallbackColor: "#D4AF37",
  },
  "Atena": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Athena_Giustiniani_Musei_Capitolini_MC278.jpg/340px-Athena_Giustiniani_Musei_Capitolini_MC278.jpg",
    fallbackSymbol: "🦉",
    fallbackColor: "#7B9EA3",
  },
  "Hermes": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hermes_Ingenui_Pio-Clementino_Inv544.jpg/300px-Hermes_Ingenui_Pio-Clementino_Inv544.jpg",
    fallbackSymbol: "☿",
    fallbackColor: "#A8C090",
  },
  "Era": {
    google: "https://upload.wikimedia.org/wikipedia/commons/7/76/Hera_Campana_Louvre_Ma2283.jpg",
    fallbackSymbol: "👑",
    fallbackColor: "#9B7BA3",
  },
  "Demetra": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Demeter_Altemps_Inv8546.jpg/300px-Demeter_Altemps_Inv8546.jpg",
    fallbackSymbol: "🌾",
    fallbackColor: "#7A9E6A",
  },
  "Ade": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hades_with_cerberus.jpg/250px-Hades_with_cerberus.jpg",
    fallbackSymbol: "⚫",
    fallbackColor: "#5A6A7A",
  },
  "Estia": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Statua_di_divinit%C3%A0_con_peplo%2C_detta_hestia_giustiniani%2C_120-140_dc_ca.%2C_da_un_orig._del_470-460_ac_ca%2C_dalla_coll._giustiniani%2C_MT_490%2C_01.jpg/250px-Statua_di_divinit%C3%A0_con_peplo%2C_detta_hestia_giustiniani%2C_120-140_dc_ca.%2C_da_un_orig._del_470-460_ac_ca%2C_dalla_coll._giustiniani%2C_MT_490%2C_01.jpg",
    fallbackSymbol: "🔥",
    fallbackColor: "#C4856A",
  },
  "Ares": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Ares_Borghese_cropped.jpg/300px-Ares_Borghese_cropped.jpg",
    fallbackSymbol: "⚔",
    fallbackColor: "#8B3030",
  },
  "Afrodite": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Aphrodite_Braschi_Glyptothek_Munich_258.jpg/300px-Aphrodite_Braschi_Glyptothek_Munich_258.jpg",
    fallbackSymbol: "♀",
    fallbackColor: "#C47A85",
  },
  "Efesto": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Vulcan_Coustou_Louvre_MR1814.jpg/300px-Vulcan_Coustou_Louvre_MR1814.jpg",
    fallbackSymbol: "🔨",
    fallbackColor: "#8B6030",
  },
  "Artemide": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Diana_of_Versailles.jpg/250px-Diana_of_Versailles.jpg",
    fallbackSymbol: "🌙",
    fallbackColor: "#5A8060",
  },
  "Poseidone": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Poseidon_sculpture_Copenhagen_2005.jpg/300px-Poseidon_sculpture_Copenhagen_2005.jpg",
    fallbackSymbol: "🔱",
    fallbackColor: "#3A6080",
  },
  "Dioniso": {
    google: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Michelangelo_Bacchus.jpg/250px-Michelangelo_Bacchus.jpg",
    fallbackSymbol: "🍇",
    fallbackColor: "#7A3A8A",
  },
  "Persefone": {
    google: "https://upload.wikimedia.org/wikipedia/commons/c/ce/AMI_-_Isis-Persephone.jpg",
    fallbackSymbol: "🌑",
    fallbackColor: "#6A4A7A",
  },
  "Pan": {
    google: "https://upload.wikimedia.org/wikipedia/commons/f/f2/6329_-_Naples_-_Pan_and_Daphne.jpg",
    fallbackSymbol: "🪈",
    fallbackColor: "#6A8A4A",
  },
};

function DeityImage({ name, style, className }) {
  const [failed, setFailed] = useState(false);
  const info = DEITY_IMAGES[name] || { fallbackSymbol: "◎", fallbackColor: T.gold };
  if (failed || !info.google) {
    return (
      <div style={{
        ...style,
        background: `radial-gradient(circle at 40% 30%, ${info.fallbackColor}33, ${T.obsidian})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: style?.height ? parseInt(style.height) * 0.4 : 80,
      }}>
        {info.fallbackSymbol}
      </div>
    );
  }
  return (
    <img
      src={info.google}
      alt={name}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

// ─── 150 DOMANDE ──────────────────────────────────────────────────────────────
const QUESTIONS_RAW = [
  {a:1,t:"Le interazioni sociali prolungate mi prosciugano, anche quando sono piacevoli."},
  {a:1,t:"Ho bisogno di solitudine per ricaricarmi dopo una giornata intensa."},
  {a:1,t:"Preferisco una cena con una persona di fiducia a una festa con molti conoscenti."},
  {a:1,t:"Il silenzio non mi spaventa: è nutrimento per la mente."},
  {a:1,t:"Studio o lavoro meglio in isolamento che in presenza di altri."},
  {a:1,t:"Il mio spazio privato è quasi sacro: detesto che venga violato."},
  {a:1,t:"Rivelo le mie passioni solo a chi ritengo davvero degno di ascoltarle."},
  {a:1,t:"Una giornata intera da solo non mi annoia: è realizzazione pura."},
  {a:1,t:"Osservare gli altri dall'esterno mi appaga più che stare al centro della scena."},
  {a:1,t:"Preferisco elaborare i problemi in silenzio prima di parlarne."},
  {a:1,t:"Tengo stretta la mia cerchia sociale: pochi, scelti, profondi."},
  {a:1,t:"L'ispirazione mi assiste meglio nel ritiro che nel confronto vivace."},
  {a:1,t:"Spesso mi congedo presto dagli eventi per tornare al mio spazio."},
  {a:1,t:"Un lungo studio solitario mi stanca meno di una riunione di gruppo."},
  {a:1,t:"Parlo solo quando sono sicuro che ciò che dico sia maturo e inattaccabile."},
  {a:1,t:"Sono energizzato dalla compagnia: più gente, più mi sento vivo."},
  {a:1,t:"Mi annoio rapidamente quando sono solo troppo a lungo."},
  {a:1,t:"Amo fare nuove conoscenze: ogni persona è un mondo da esplorare."},
  {a:1,t:"Penso meglio ragionando ad alta voce con qualcuno."},
  {a:1,t:"Una serata da solo mi pesa se ho avuto già pochi contatti quel giorno."},
  {a:1,t:"La varietà di stimoli sociali mi ricarica invece di svuotarmi."},
  {a:1,t:"Tendo ad aprirmi facilmente anche con persone appena conosciute."},
  {a:1,t:"Preferisco lavorare in team piuttosto che da solo."},
  {a:1,t:"Mi sento a mio agio al centro dell'attenzione."},
  {a:1,t:"Ampliare la mia rete di conoscenze è qualcosa che mi stimola attivamente."},
  {a:1,t:"Il silenzio prolungato mi mette a disagio."},
  {a:1,t:"Trovo le dinamiche di gruppo più stimolanti del lavoro solitario."},
  {a:1,t:"Elaboro meglio le emozioni parlandone subito con qualcuno."},
  {a:1,t:"Mi piace condividere progetti e idee appena nascono, senza aspettare che siano perfetti."},
  {a:1,t:"La solitudine mi pesa: ho bisogno di presenza umana per sentirmi radicato."},
  {a:2,t:"Non mi basta la superficie: cerco sempre il significato nascosto delle cose."},
  {a:2,t:"I fatti concreti mi annoiano se non celano una verità più profonda."},
  {a:2,t:"Mi perdo nei simboli e nelle strutture invisibili prima ancora di godere l'aspetto sensibile."},
  {a:2,t:"Capire *perché* qualcosa esiste mi interessa più del *come* si usa."},
  {a:2,t:"Spesso mi distraggo dal presente proiettandomi in visioni di epoche lontane."},
  {a:2,t:"Lo studio teorico puro mi attrae più della risoluzione di problemi pratici."},
  {a:2,t:"Considero il regno delle idee superiore alla realtà tangibile."},
  {a:2,t:"Cosmogonia e natura dell'anima mi appassionano più delle questioni materiali."},
  {a:2,t:"La pura speculazione intellettuale mi basta: non sempre sento bisogno di realizzarla."},
  {a:2,t:"Le verità che cerco non si raggiungono con i sensi, ma con la mente elevata."},
  {a:2,t:"Preferisco cogliere le grandi leggi di un sistema piuttosto che i dettagli marginali."},
  {a:2,t:"Collego discipline lontane nel tentativo di forgiare una teoria unificata del cosmo."},
  {a:2,t:"Mi fido di un'intuizione improvvisa più che di dati raccolti con fatica."},
  {a:2,t:"Ogni evento del presente lo inquadro in un ciclo storico o mitologico più vasto."},
  {a:2,t:"Sono attratto dall'antico, dall'insolito, dall'inesplicabile con le categorie ordinarie."},
  {a:2,t:"Uso metafora e allegoria perché solo il simbolo può sfiorare la verità assoluta."},
  {a:2,t:"Il mio genio si accende creando sistemi originali, non eseguendo compiti standardizzati."},
  {a:2,t:"Il mondo fisico mi sembra insufficiente a descrivere la vastità del reale."},
  {a:2,t:"Immagino come le cose *dovrebbero* essere nella loro forma ideale."},
  {a:2,t:"La matematica astratta o la teoria musicale pura mi affascinano profondamente."},
  {a:2,t:"Preferisco la concretezza: i dati misurabili mi danno più certezza delle teorie."},
  {a:2,t:"Mi oriento meglio con esempi pratici e tangibili che con costruzioni astratte."},
  {a:2,t:"Il presente fisico e i suoi stimoli mi bastano: non cerco senso nascosto ovunque."},
  {a:2,t:"Il lavoro manuale o artigianale mi soddisfa quanto quello intellettuale."},
  {a:2,t:"Valuto le idee in base alla loro utilità pratica, non alla loro eleganza teorica."},
  {a:2,t:"Preferisco sperimentare direttamente piuttosto che theorizzare a lungo."},
  {a:2,t:"Il corpo e i sensi sono per me fonti di conoscenza affidabili quanto la mente."},
  {a:2,t:"Mi annoio facilmente con le speculazioni astratte che non portano a nulla di concreto."},
  {a:2,t:"Un buon progetto tangibile mi soddisfa più di una bella teoria."},
  {a:2,t:"Preferisco costruire cose reali piuttosto che sistemi concettuali."},
  {a:3,t:"Cerco la verità assoluta anche quando è scomoda da accettare."},
  {a:3,t:"L'onestà tagliente è superiore all'adattare il giudizio per non ferire."},
  {a:3,t:"Valuto le idee sulla loro struttura logica, non sulle simpatie personali."},
  {a:3,t:"Preferisco essere confutato con argomenti solidi che incoraggiato per gentilezza."},
  {a:3,t:"Diffido delle affermazioni basate solo sul 'sentire': la verità esige evidenza."},
  {a:3,t:"In crisi, attivo la fredda analisi piuttosto che cedere all'emozione."},
  {a:3,t:"Vengo visto come distaccato perché rifiuto il disordine emotivo."},
  {a:3,t:"Applicare la regola mi appare più giusto che esaminare le scuse sentimentali."},
  {a:3,t:"La mente forte domina le passioni tramite l'intelletto."},
  {a:3,t:"Le manifestazioni emotive eccessive mi causano imbarazzo intellettuale."},
  {a:3,t:"Le leggi dell'arte e del vivere civile devono fondarsi su principi universali."},
  {a:3,t:"Giudico con gli stessi criteri un estraneo e la persona a me più cara."},
  {a:3,t:"Razionalità e competenza valgono più di tolleranza incondizionata."},
  {a:3,t:"Una contraddizione logica non può essere perdonata in nome delle buone intenzioni."},
  {a:3,t:"Nelle scelte importanti, la logica batte sempre il comfort emotivo."},
  {a:3,t:"L'eleganza è ordine e proporzione, non espressione emotiva intensa."},
  {a:3,t:"Il disordine logico mi provoca un fastidio estetico oltre che intellettuale."},
  {a:3,t:"La proporzione matematica mi esalta più dell'impeto istintivo."},
  {a:3,t:"Di fronte all'incomprensibile, analizzo le cause razionali anziché affidarmi al cuore."},
  {a:3,t:"L'intelletto che dubita e disseziona è superiore all'anima empatica."},
  {a:3,t:"L'empatia è la mia bussola principale nel prendere decisioni importanti."},
  {a:3,t:"Capire come si sente qualcuno mi importa almeno quanto capire se ha ragione."},
  {a:3,t:"Il contesto emotivo di una situazione cambia il giudizio che ne do."},
  {a:3,t:"Una risposta compassionevole vale più di una risposta formalmente corretta."},
  {a:3,t:"Le relazioni umane non si governano con la logica senza perdere qualcosa di essenziale."},
  {a:3,t:"Ascolto prima di argomentare: capire l'altro è il primo passo verso la verità."},
  {a:3,t:"L'intelligenza emotiva è una forma di conoscenza sofisticata, non un'alternativa alla logica."},
  {a:3,t:"Preferisco una decisione sbagliata ma presa con cura delle persone a una giusta ma fredda."},
  {a:3,t:"Il legame tra le persone è più prezioso della coerenza logica di un sistema."},
  {a:3,t:"Tollero l'imperfezione logica quando nasce da autentica umanità."},
  {a:4,t:"Pianificare ogni tappa di un progetto mi sembra costruire la mia stessa prigione."},
  {a:4,t:"Preferisco che la forma nasca spontaneamente lungo il percorso."},
  {a:4,t:"Una routine ferrea è nemica di ogni autentica ispirazione."},
  {a:4,t:"Evito gli impegni irrevocabili: tengo le opzioni aperte fino all'ultimo."},
  {a:4,t:"Se mi impongono un metodo rigido, il mio istinto è aggirarlo."},
  {a:4,t:"Lavoro meglio sotto pressione, improvvisando all'ultimo minuto."},
  {a:4,t:"Cercare di controllare gli eventi è uno sforzo vano e filosoficamente sbagliato."},
  {a:4,t:"Cambiare argomento a metà percorso non mi spaventa se l'intuizione mi guida altrove."},
  {a:4,t:"Un imprevisto che sconvolge i piani mi dà sollievo: è un'opportunità di ricominciare."},
  {a:4,t:"Le mie migliori opere nascono dal caos ispirato, non dalla pianificazione metodica."},
  {a:4,t:"Iniziare qualcosa di nuovo mi entusiasma più che finire ciò che ho già cominciato."},
  {a:4,t:"Avere opere in sospeso sparpagliate ovunque non mi angoscia: è fermento creativo."},
  {a:4,t:"La fase finale di rifinitura mi annoia: capito il principio, cerco già il prossimo."},
  {a:4,t:"La 'scrivania pulita' è il segno di una mente arida, non di efficienza."},
  {a:4,t:"L'esplorazione infinita vale più di una conclusione definitiva."},
  {a:4,t:"L'irregolarità e la dissonanza mi attraggono più della simmetria levigata."},
  {a:4,t:"L'ossessione per la precisione è un tentativo patetico di sfuggire al caos necessario."},
  {a:4,t:"Abiterei in un bosco intricato più che in una villa geometricamente perfetta."},
  {a:4,t:"Le norme sociali e i cerimoniali rigidi soffocano la vera essenza dello spirito."},
  {a:4,t:"La vera grandezza è danzare sull'abisso del caos senza esserne distrutto."},
  {a:4,t:"Senza un piano chiaro mi sento a disagio e perdo efficacia."},
  {a:4,t:"Le liste, le scadenze e le strutture mi liberano più che opprimermi."},
  {a:4,t:"Preferisco portare a termine ciò che ho iniziato prima di aprire nuovi fronti."},
  {a:4,t:"La disciplina quotidiana è la base della mia creatività, non il suo ostacolo."},
  {a:4,t:"I progetti incompiuti mi pesano: li vivo come doveri insoluti."},
  {a:4,t:"Apprezzo la prevedibilità: so cosa aspettarmi e posso prepararmi."},
  {a:4,t:"Un ambiente ordinato mi aiuta a pensare meglio."},
  {a:4,t:"Stabilire priorità chiare è il primo passo verso qualsiasi obiettivo."},
  {a:4,t:"Preferisco un itinerario preciso a un viaggio senza meta."},
  {a:4,t:"Completare qualcosa con cura mi dà una soddisfazione profonda."},
  {a:5,t:"La decadenza del mondo mi ferisce come un'offesa personale."},
  {a:5,t:"La malinconia per ciò che è perduto mi mantiene connesso al sacro."},
  {a:5,t:"Il dolore del cosmo mi attraversa: non riesco a tenerlo a distanza."},
  {a:5,t:"L'arte che mi eleva è quella che trasuda tensione tragica, non serenità."},
  {a:5,t:"Un peso esistenziale sotterraneo mi impedisce di scivolare nella leggerezza."},
  {a:5,t:"Corazzare il cuore per non soffrire significa inaridire il genio."},
  {a:5,t:"La mia vita interiore oscilla tra picchi estatici e abissi di sconforto."},
  {a:5,t:"Creare è sempre un travaglio dell'anima, mai una pacifica esecuzione."},
  {a:5,t:"Anche nelle scelte logiche, un fremito emotivo di fondo non si spegne mai."},
  {a:5,t:"La vera saggezza nasce dal Pathei Mathos: conoscenza conquistata attraverso il dolore."},
  {a:5,t:"Preferisco la placida osservazione delle cose al coinvolgimento emotivo intenso."},
  {a:5,t:"L'imperturbabilità è per me un valore, non una forma di freddezza."},
  {a:5,t:"Riesco a distanziarmi dalle mie emozioni quando serve, senza sentirmi diminuito."},
  {a:5,t:"Preferisco la stabilità interiore all'intensità emotiva, anche a costo di perdere qualcosa."},
  {a:5,t:"Il declino del mondo mi rattrista, ma non mi destabilizza: osservo e accetto."},
  {a:6,t:"Di fronte alla decadenza, scendo in campo per forgiare qualcosa che la contrasti."},
  {a:6,t:"Devo tradurre ogni pensiero in azione concreta: la sola contemplazione non mi basta."},
  {a:6,t:"Il senso della mia vita è lasciare un'impronta attraverso l'attività creatrice."},
  {a:6,t:"Davanti a un'ingiustizia, il mio spirito assume subito un assetto battagliero."},
  {a:6,t:"La vera virtù si esprime trasformando e correggendo il mondo, non ritirandosi."},
  {a:6,t:"Chi dice 'le cose andranno come devono andare' mi irrita profondamente."},
  {a:6,t:"Impugno le armi dell'intelletto per difendere il mio mondo ideale fino all'ultimo."},
  {a:6,t:"Anche se la mia azione non cambierà le masse, il gesto di insorgere ha valore assoluto."},
  {a:6,t:"La solitudine è il laboratorio in cui combatto e realizzo i miei progetti ambiziosi."},
  {a:6,t:"Essere un artefice infaticabile è il sommo onore, superiore a ogni contemplazione."},
  {a:6,t:"Trovo pace nell'osservazione profonda più che nell'azione continua."},
  {a:6,t:"Contemplare un'idea a lungo prima di agire mi sembra saggio, non pigro."},
  {a:6,t:"L'esperienza interiore ha un valore in sé, indipendentemente da ciò che produce."},
  {a:6,t:"Preferisco capire bene prima di intervenire, anche se questo significa perdere tempo prezioso."},
  {a:6,t:"La riflessione silenziosa può cambiare il mondo quanto l'azione diretta."},
];
const QUESTIONS = QUESTIONS_RAW.map((q, i) => ({ id: i + 1, ...q }));

// ─── DATABASE DEI DEI ──────────────────────────────────────────────────────────
const DEITIES = {
  "Agora-Nous-Logos-Cosmos": {
    name: "Zeus", epithetBase: "Il Sovrano Cosmico",
    animal: "Aquila e Toro",
    img: DEITY_IMAGES["Zeus"]?.google,
    desc: "La tua anima risuona con il Sovrano dell'Olimpo, il Padre degli dèi e degli uomini. Estroverso e visionario, la tua mente abbraccia l'intero cosmo come un architetto che contempla la propria opera dall'alto del cielo. Non ti basta governare un angolo del mondo: il tuo spirito esige l'orizzonte completo, il quadro totale, la legge che regge ogni cosa. La logica è il tuo scettro, la struttura il tuo trono. Dove gli altri vedono caos, tu intravedi un ordine ancora da compiere. Questo dono porta con sé un'ombra: la tentazione della hybris, di credere che la tua visione sia l'unica possibile. Il vero Zeus non impone la sua legge per vanità, ma la forgia nel fuoco della responsabilità. Il tuo destino è costruire istituzioni che durino oltre la tua vita.",
    color: "#C9A84C",
    bgPattern: "radial-gradient(ellipse at 20% 0%, #C9A84C22 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, #C9A84C11 0%, transparent 50%)",
    accentColor: "#C9A84C",
  },
  "Oikos-Nous-Logos-Cosmos": {
    name: "Apollo", epithetBase: "Il Dio della Luce",
    animal: "Cigno, Corvo, Delfino",
    img: DEITY_IMAGES["Apollo"]?.google,
    desc: "Sei guidato dal nume della luce, della musica matematica e della profezia. La tua anima è apollinea nel senso più profondo: cerchi la perfezione delle forme, l'accordatura esatta dello strumento cosmico, il punto in cui la bellezza e la verità coincidono. Introverso e astratto, costruisci il tuo tempio interiore con proporzioni geometriche e silenzi misurati. Ogni incoerenza ti ferisce esteticamente, ogni dissonanza ti disturba come una nota stonata in una sinfonia altrimenti perfetta. Il tuo dono è la chiarezza visionaria, la capacità di vedere il pattern dietro il caos apparente. La tua ombra è la distanza olimpica: puoi diventare freddo, giudicante, incapace di accettare l'imperfezione necessaria dell'umano. Ricorda che anche Apollo pianse la morte di Giacinto. La perfezione che cerchi non esclude il dolore.",
    color: "#D4AF37",
    bgPattern: "radial-gradient(ellipse at 50% -20%, #D4AF3733 0%, transparent 60%)",
    accentColor: "#D4AF37",
  },
  "Oikos-Nous-Logos-Chaos": {
    name: "Atena", epithetBase: "La Stratega",
    animal: "Civetta e Serpente",
    img: DEITY_IMAGES["Atena"]?.google,
    desc: "Incarni la Stratega Adattabile, nata già armata dalla testa del padre. Introverso e dominato dall'intelletto puro, hai la rara capacità di navigare il caos trasformandolo in vantaggio tattico, senza mai perdere il filo della ragione. Non pianifichi in modo rigido come Zeus: la tua intelligenza è fluida, improvvisativa, capace di riscrivere il piano a metà battaglia senza perdere di vista l'obiettivo finale. La civetta che ti accompagna vede nell'oscurità perché gli occhi chiari vedono dove la luce è assente. Il tuo dono è la sintesi tra rigore intellettuale e flessibilità operativa. La tua ombra è la razionalizzazione: puoi costruire argomenti logici impeccabili per giustificare qualunque cosa il tuo istinto già desiderava. Usa la spada dell'intelletto per tagliare le tue stesse illusioni, non solo quelle degli altri.",
    color: "#7B9EA3",
    bgPattern: "radial-gradient(ellipse at 30% 70%, #7B9EA322 0%, transparent 50%)",
    accentColor: "#7B9EA3",
  },
  "Agora-Nous-Logos-Chaos": {
    name: "Hermes", epithetBase: "Il Messaggero",
    animal: "Tartaruga, Gallo, Ariete",
    img: DEITY_IMAGES["Hermes"]?.google,
    desc: "Sei il Messaggero Alchemico, il dio che attraversa tutte le frontiere senza appartenervi. Estroverso e astratto, la tua mente vola tra idee, linguaggi e discipline con la leggerezza dei sandali alati. Non hai un territorio fisso: il confine stesso è il tuo territorio. Nasci traduttore tra mondi diversi, capace di portare la saggezza degli dèi agli uomini e le preghiere degli uomini agli dèi. Il caos non ti spaventa perché sei tu a definire le regole del gioco in tempo reale. La tua ombra è l'inaffidabilità: il dio che non può essere catturato da nessuna struttura rischia di non essere mai veramente presente in niente. Il ladro più brillante dell'Olimpo deve ricordare che non tutto ciò che si può prendere vale la pena di portare. La tua velocità è un dono, ma anche il tuo limite: fermati a volte. Ascolta la tartaruga che diventa lira.",
    color: "#A8C090",
    bgPattern: "radial-gradient(ellipse at 70% 30%, #A8C09022 0%, transparent 50%)",
    accentColor: "#A8C090",
  },
  "Agora-Physis-Logos-Cosmos": {
    name: "Era", epithetBase: "La Custode dell'Ordine",
    animal: "Pavone e Mucca sacra",
    img: DEITY_IMAGES["Era"]?.google,
    desc: "Incarni la Protettrice delle Regole, la Regina dell'Olimpo che custodisce i patti sacri su cui si regge la civiltà. Pratica, estroversa, ancorata alla realtà concreta: usi la mente fredda e la logica degli accordi per amministrare e preservare le istituzioni umane. Non sei amata come Zeus o adorata come Afrodite, ma senza di te il cosmo sociale collasserebbe. Il tuo dono è la memoria istituzionale, la capacità di tenere fede ai patti anche quando nessuno sta guardando. La tua ombra è la gelosia del potere: quando l'ordine che custodisci diventa il tuo ordine, quando la legge diventa capriccio, perdi il principio che ti rende grande. La vera Era non punisce per vendicarsi, ma per ristabilire l'equilibrio. Riconosci la differenza tra custodire e controllare.",
    color: "#9B7BA3",
    bgPattern: "radial-gradient(ellipse at 60% 20%, #9B7BA322 0%, transparent 50%)",
    accentColor: "#9B7BA3",
  },
  "Agora-Physis-Sympatheia-Cosmos": {
    name: "Demetra", epithetBase: "La Madre Nutrice",
    animal: "Serpente, Maiale, Gru",
    img: DEITY_IMAGES["Demetra"]?.google,
    desc: "La tua anima appartiene alla Madre Nutrice, la dea che insegnò agli uomini l'agricoltura e trasformò il nomadismo in civiltà. Estroversa, concreta, profondamente empatica: sei un pilastro per chi ami, dispensando cura e stabilità con la certezza dei cicli naturali. Non ami l'astratto e non cerchi la gloria olimpica: il tuo trionfo è il grano che cresce, il bambino che mangia, la comunità che sopravvive all'inverno. La tua forza è radicata nella terra nel senso più letterale: sai che la vita richiede lavoro costante, non intuizioni fulminee. La tua ombra è la dipendenza dall'essere necessaria: quando Persefone fu rapita, il mondo congelò perché Demetra non sapeva come continuare senza qualcuno da nutrire. Impara a ricevere cura, non solo a darla. La terra ha bisogno di pioggia come di sole.",
    color: "#7A9E6A",
    bgPattern: "radial-gradient(ellipse at 30% 80%, #7A9E6A22 0%, transparent 50%)",
    accentColor: "#7A9E6A",
  },
  "Oikos-Physis-Logos-Cosmos": {
    name: "Ade", epithetBase: "Il Giudice Implacabile",
    animal: "Cane a tre teste, Cavalli neri",
    img: DEITY_IMAGES["Ade"]?.google,
    desc: "Sei affine al Signore del Mondo Sotterraneo, il Giudice Implacabile che amministra l'irrevocabile. Introverso, concreto, logico: gestisci i tuoi domini con integrità assoluta nel silenzio del tuo regno inalterabile. A differenza dei suoi fratelli olimpici, Ade non disputa il potere altrui, non si vanta, non cerca adoratori. La sua giustizia non è crudele: è semplicemente definitiva. Il tuo dono è questa incorruttibilità, questa capacità di vedere le cose come sono senza abbellirle. Non menti nemmeno a te stesso. La tua ombra è l'isolamento volontario: chi governa i morti raramente impara a relazionarsi con i vivi. Il regno sotterraneo contiene anche le ricchezze nascoste della terra — oro, gemme, radici. Ricorda che sei anche Plutone, il Ricco. La tua profondità può nutrire chi ha il coraggio di scendere.",
    color: "#5A6A7A",
    bgPattern: "radial-gradient(ellipse at 50% 100%, #5A6A7A33 0%, transparent 60%)",
    accentColor: "#5A6A7A",
  },
  "Oikos-Physis-Sympatheia-Cosmos": {
    name: "Estia", epithetBase: "Il Focolare Sacro",
    animal: "Asino e Maiale",
    img: DEITY_IMAGES["Estia"]?.google,
    desc: "Trovi il divino nell'essenza del Focolare, la dea che rinunciò a un posto sull'Olimpo per restare il centro pulsante di ogni casa. Introversa, concreta, empatica, ordinata: sei la presenza silenziosa che custodisce il fuoco al centro di tutto. Non troverai Estia nelle battaglie o nelle avventure: la sua grandezza sta nel continuare a bruciare anche quando nessuno guarda, nel garantire che ci sia sempre un centro caldo verso cui tornare. Il tuo dono è la capacità di essere una presenza che stabilizza, un fuoco che orienta. Ogni grande civiltà ha bisogno di qualcuno come te, anche se raramente lo riconosce esplicitamente. La tua ombra è l'invisibilità dell'essenziale: potresti restare ignorata proprio perché svolgi il tuo ruolo così bene che nessuno si accorge quando manca. Pretendi di essere vista. Il focolare sacro merita onori.",
    color: "#C4856A",
    bgPattern: "radial-gradient(ellipse at 50% 50%, #C4856A22 0%, transparent 50%)",
    accentColor: "#C4856A",
  },
  "Agora-Physis-Logos-Chaos": {
    name: "Ares", epithetBase: "Il Guerriero Impetuoso",
    animal: "Cane, Avvoltoio, Picchio",
    img: DEITY_IMAGES["Ares"]?.google,
    desc: "In te arde il Guerriero Impetuoso, il dio che gli Olimpici temevano non per la sua forza ma per la sua imprevedibilità. Estroverso, fisico, tattico: usi la cruda logica del momento per dominare il caos e distruggere il vecchio ordine. Ares non è un brutale senza intelligenza: è un combattente che sa che l'eccessiva pianificazione può essere un punto di debolezza in un conflitto reale. La sua forza è la capacità di agire senza esitazione, di lanciare il corpo nella mischia prima che la mente abbia finito di calcolare i rischi. Il tuo dono è questo coraggio viscerale, questa disponibilità a sacrificare la sicurezza per l'azione immediata. La tua ombra è che la guerra senza saggezza è massacro. Ares ferito si lamenta come un bambino. Impara quando combattere e quando restare fermo: non ogni battaglia vale il sangue.",
    color: "#8B3030",
    bgPattern: "radial-gradient(ellipse at 80% 20%, #8B303033 0%, transparent 50%)",
    accentColor: "#8B3030",
  },
  "Agora-Physis-Sympatheia-Chaos": {
    name: "Afrodite", epithetBase: "L'Esteta dell'Amore",
    animal: "Colomba, Cigno, Lepre",
    img: DEITY_IMAGES["Afrodite"]?.google,
    desc: "Sei figlio/a dell'Esteta dell'Amore, la dea nata dalla spuma del mare, che portò nel cosmo la forza che nemmeno gli dèi più potenti riescono a resistere. Estroverso, empatico, mosso dal flusso del presente: cerchi la bellezza sensoriale e le connessioni umane con una passione che brucia autentica. Afrodite non è leggera: la sua forza è sconvolgente. Ha fatto innamorare Zeus stesso, ha guidato le guerre più devastanti della storia, ha spezzato famiglie e fondato civiltà. Il tuo dono è il magnetismo vitale, la capacità di creare legami che trasformano. La tua ombra è che il caos emotivo che genera bellezza può anche distruggere. La dea che nasce dal mare porta con sé anche le tempeste. Impara a distinguere il desiderio dalla volontà, l'attrazione dalla manipolazione. La bellezza più grande crea, non consuma.",
    color: "#C47A85",
    bgPattern: "radial-gradient(ellipse at 40% 30%, #C47A8533 0%, transparent 50%)",
    accentColor: "#C47A85",
  },
  "Oikos-Physis-Logos-Chaos": {
    name: "Efesto", epithetBase: "L'Artefice",
    animal: "Asino e Gru",
    img: DEITY_IMAGES["Efesto"]?.google,
    desc: "La tua anima è quella dell'Artefice Divino, il dio che fu gettato dall'Olimpo e costruì il suo trono con le proprie mani nel fuoco della fornace. Solitario, legato alla materia bruta che forgi, usi una logica meccanica rigorosa in un processo creativo caotico e vigoroso. Efesto è l'unico dio che lavora, il solo che conosce la trasformazione della materia attraverso il sacrificio fisico. Dalle sue mani uscirono le armature di Achille, le catene che imprigionarono Ares, gli automi d'oro che lo assistevano. Il tuo dono è la capacità di trasformare la ferita in capolavoro, l'esclusione in potere artigianale ineguagliabile. La tua ombra è l'amarezza del genio incompreso: il più abile tra gli dèi sposò la più bella ed era il meno amato. Non lasciare che le cicatrici diventino la tua unica identità. La fornace che ti ha formato non ti definisce interamente.",
    color: "#8B6030",
    bgPattern: "radial-gradient(ellipse at 20% 80%, #8B603033 0%, transparent 50%)",
    accentColor: "#8B6030",
  },
  "Oikos-Physis-Sympatheia-Chaos": {
    name: "Artemide", epithetBase: "La Cacciatrice Selvaggia",
    animal: "Cerva, Orsa, Cinghiale",
    img: DEITY_IMAGES["Artemide"]?.google,
    desc: "Incarni la Cacciatrice Selvaggia, la dea che ottenne da Zeus la libertà prima ancora di chiedere qualsiasi altro dono. Solitaria, fisica, profondamente empatica verso la natura e le creature non umane, indipendente con una determinazione che nessuna pressione sociale scalfisce. Artemide non rifiuta il mondo per paura: lo rifiuta perché ha scelto qualcosa di più vasto. Il suo dominio è la luna, la caccia, i parti, i riti di passaggio: tutte le soglie dove la vita si trasforma. Il tuo dono è questa purezza di intento, questa capacità di muoverti libera nel tuo territorio senza dover giustificare la tua autonomia. La tua ombra è la spietatezza verso chi viola la tua libertà: Artemide trasformò Atteone in cervo per essere stato visto mentre si bagnava. Impara che non ogni sguardo è una violazione. La luna brilla anche per chi guarda dal basso.",
    color: "#5A8060",
    bgPattern: "radial-gradient(ellipse at 10% 40%, #5A806022 0%, transparent 50%)",
    accentColor: "#5A8060",
  },
  "Agora-Nous-Sympatheia-Cosmos": {
    name: "Poseidone", epithetBase: "L'Impeto dell'Oceano",
    animal: "Cavallo, Toro, Delfino",
    img: DEITY_IMAGES["Poseidone"]?.google,
    desc: "In te vive l'Impeto dell'Oceano, il dio che governa le acque abissali e fa tremare la terra con un colpo del suo tridente. Estroverso, astratto, governato da passioni emotive che possono sollevare tempeste o generare porti sicuri: esigi di dominare gerarchicamente il tuo vasto impero con grandiosità che non ammette compromessi. Poseidone è il eterno secondo tra i fratelli, il dio che dovette accontentarsi del mare dopo che Zeus prese il cielo. Questa ferita primordiale lo alimenta: ogni fondazione di città, ogni cavallo creato, ogni maremoto è anche un modo per dimostrare che il suo dominio non è inferiore a quello celeste. Il tuo dono è la potenza emotiva trasformativa, la capacità di muovere masse umane con la tua visione. La tua ombra è l'orgoglio ferito che diventa distruzione. Le onde più alte e quelle più calme appartengono allo stesso dio.",
    color: "#3A6080",
    bgPattern: "radial-gradient(ellipse at 60% 80%, #3A608033 0%, transparent 60%)",
    accentColor: "#3A6080",
  },
  "Agora-Nous-Sympatheia-Chaos": {
    name: "Dioniso", epithetBase: "Il Mistico dell'Estasi",
    animal: "Pantera, Toro, Serpente",
    img: DEITY_IMAGES["Dioniso"]?.google,
    desc: "Sei il Mistico dell'Estasi, il dio che morì e rinacque, che fu smembrato dai Titani e ricostituito da Zeus, che portò nel mondo il dono terribile e meraviglioso della perdita di sé. Estroverso, astratto, emotivo, caotico: rompi le regole per fonderti col vitale disordine del mondo, cercando l'intensità suprema che dissolve i confini tra il sé e il tutto. Dioniso è l'unico dio che attraversò l'Ade da vivo per riportarne sua madre: conosce la morte non come astrazione ma come esperienza vissuta. Il tuo dono è la capacità di liberare gli altri dalla prigione della propria identità rigida, di aprire fessure nell'ordinario attraverso cui filtra il divino. La tua ombra è che la stessa forza che libera può distruggere: il tiaso dionisiaco che celebra può diventare il tiaso che sbrana. Porta con te il vino, non solo il delirio.",
    color: "#7A3A8A",
    bgPattern: "radial-gradient(ellipse at 50% 30%, #7A3A8A33 0%, transparent 50%)",
    accentColor: "#7A3A8A",
  },
  "Oikos-Nous-Sympatheia-Cosmos": {
    name: "Persefone", epithetBase: "La Guida dei Due Mondi",
    animal: "Pipistrello e Civetta",
    img: DEITY_IMAGES["Persefone"]?.google,
    desc: "Sei la Guida dei Due Mondi, colei che conosce il linguaggio della luce e quello dell'oscurità perché li ha abitati entrambi, non come metafora ma come realtà vissuta nel corpo e nell'anima. Introversa, intuitiva, compassionevole: oscilli tra luce e ombra accettando quel dualismo come un ordine ciclico e necessario. Prima era Kore, la fanciulla: ignara, luminosa, raccoglitrice di fiori. Dopo il rapimento divenne Persefone, la Regina: sapiente, autorevole, guida dei morti. Questa trasformazione attraverso la discesa è il tuo archetipo fondamentale. Il tuo dono è la comprensione profonda della trasformazione, la capacità di accompagnare chi attraversa soglie difficili senza aver paura dell'oscurità. La tua ombra è la divisione: chi vive tra due mondi rischia di non appartenere mai completamente a nessuno. Il chicco di melograno non è solo una prigione. È anche la scelta di restare.",
    color: "#6A4A7A",
    bgPattern: "radial-gradient(ellipse at 40% 60%, #6A4A7A33 0%, transparent 50%)",
    accentColor: "#6A4A7A",
  },
  "Oikos-Nous-Sympatheia-Chaos": {
    name: "Pan", epithetBase: "Lo Spirito dell'Ispirazione",
    animal: "Capra",
    img: DEITY_IMAGES["Pan"]?.google,
    desc: "La tua natura è quella dello Spirito dell'Ispirazione, il dio che suona il flauto alle porte del cosmo e il cui grido improvviso genera il panico sacro nei cuori umani. Solitario, visionario, guidato dal cuore: rifiuti le strutture per suonare la tua melodia selvaggia nel flusso del tempo, consapevole che la nota più vera non può essere pianificata, solo accolta. Pan è l'unico dio della cui morte si fece annuncio: qualcuno navigando sull'Egeo udì una voce che gridava che il grande Pan era morto, e il mondo pianse. Ma Pan non muore: si trasforma, si ritira nei boschi interni dell'anima quando la civiltà diventa troppo rumorosa. Il tuo dono è la connessione con i ritmi primordiali che precedono ogni cultura. La tua ombra è la solitudine assoluta di chi suona una musica che non tutti possono udire. Non ogni silenzio intorno a te è incomprensione: a volte le persone giuste non sono ancora arrivate.",
    color: "#6A8A4A",
    bgPattern: "radial-gradient(ellipse at 20% 60%, #6A8A4A22 0%, transparent 50%)",
    accentColor: "#6A8A4A",
  },
};

// ─── EPITETI ──────────────────────────────────────────────────────────────────
const EPITHETS = {
  "Zeus": {
    TA: { t: "Polieus — Il Costruttore", s: "Lo Scettro e la Città", q: "Il cielo non mi è caduto in mano per caso. Abbandona il caos e impara a governare te stesso.", p: "Mantieni le promesse. Usa l'intelletto per fondare, non per prevaricare. Le istituzioni durevoli si costruiscono sul rispetto reciproco, non sull'autorità imposta." },
    TP: { t: "Olimpio — Il Distaccato", s: "Il Trono tra le nuvole", q: "I mortali si agitano per nulla. Io guardo le nuvole scorrere, sapendo che l'ordine non muta.", p: "Osserva dall'alto. Non scinderti nelle meschinità quotidiane. La tua prospettiva lunga è un dono raro che molti vorrebbero comprare." },
    PA: { t: "Ceraunio — Il Tonante", s: "La Folgore fiammeggiante", q: "Ancora superbia? Se non capiscono con la logica, capiranno con la folgore.", p: "Smascherare l'ignoranza è il tuo compito. Non tollerare la Hybris — ma ricorda che anche il fulmine deve essere mirato, non disperso." },
    PP: { t: "Moiragete — La Guida del Fato", s: "La Bilancia del Destino", q: "Anche il re degli dèi deve inchinarsi al fato. Affronta il declino con gravità.", p: "Accetta ciò che non puoi cambiare. Custodisci il dolore con dignità stoica. La saggezza vera inizia dove il controllo finisce." },
  },
  "Apollo": {
    TA: { t: "L'Armonizzatore", s: "La Lira d'oro", q: "Sono la perfezione. Ma puoi avvicinarti, se accordi bene il tuo strumento.", p: "Studia proporzioni e accordatura. L'arte calcolata è la tua via. La perfezione non è meta irraggiungibile: è il processo stesso di tendere verso di essa." },
    TP: { t: "Il Solare", s: "Il Disco Solare", q: "Il disordine mi annoia. Io splendo per natura. Chi vuole la luce deve salire fin qui.", p: "Pratica 'Nulla di troppo'. L'atarassia è il tuo scudo. La luce più utile non abbaglia: illumina senza bruciare." },
    PA: { t: "Il Saettatore", s: "L'Arco d'argento", q: "Il mio arco non manca mai. E l'ignoranza del tuo secolo è un bersaglio troppo grande.", p: "Componi opere che critichino la superficialità moderna. La freccia di Apollo non è solo arma: è rivelazione che vola dritta al cuore della questione." },
    PP: { t: "L'Elegiaco", s: "Il Ramo di Alloro", q: "Tutto ciò che è bello è destinato a svanire. Non mi resta che cantare di un mondo perduto.", p: "Abbraccia la malinconia. Trasformala in elegia, non in rancore. Giacinto non tornò, ma la musica che Apollo compose per lui risuona ancora." },
  },
  "Atena": {
    TA: { t: "Ergane — L'Inventrice", s: "Il Telaio", q: "L'ispirazione è per i deboli. Progettiamo, misuriamo, costruiamo.", p: "Crea con geometria e metodo. Il processo è la tua meditazione. Ogni artefatto della mente è un tempio costruito dall'interno." },
    TP: { t: "Glaucopide — La Saggia", s: "Gli Occhi color del mare", q: "Ho già calcolato quattordici scenari. Siediti e usa il cervello, se ne sei provvisto.", p: "Ritirati nel silenzio prima di agire. La saggezza guarda oltre le illusioni. La civetta vede nell'oscurità perché non cerca la luce dove non c'è." },
    PA: { t: "Promachos — La Stratega", s: "La Lancia e lo Scudo", q: "L'ignoranza è un nemico peggiore di un esercito. Impugna la logica.", p: "Difendi le arti e la ragione contro chi le vuole distruggere. Atena non combatte per la gloria: combatte per l'ordine che rende possibile la bellezza." },
    PP: { t: "Poliade — La Memoria", s: "Il Tempio in rovina", q: "Hanno dimenticato le proporzioni, hanno dimenticato il sacro. Resto qui a custodire le ceneri.", p: "Diventa archivio vivente. Studia e preserva ciò che gli altri dimenticano. La memoria è l'unica forma di immortalità che non richiede l'approvazione degli dèi." },
  },
  "Hermes": {
    TA: { t: "Logios — L'Oratore", s: "Il Caduceo", q: "Le parole sono monete. Se le sai spendere, compri il perdono anche di un dio.", p: "Usa umorismo e diplomazia. Impara nuove lingue per espandere i confini. Il confine tra le culture è il tuo habitat naturale: abitalo con grazia." },
    TP: { t: "Odos — Il Viaggiatore", s: "I Sandali Alati", q: "Mettetevi d'accordo tra voi. Io ho confini da attraversare e alfabeti da decifrare.", p: "Rimani in movimento. Non attaccarti ai dogmi: viaggia tra i concetti. Ogni sistema di pensiero è una città straniera da esplorare, non un domicilio permanente." },
    PA: { t: "Trismegisto — L'Alchimista", s: "La Tavola di Smeraldo", q: "Il mondo è piombo, ma noi abbiamo il fuoco. Dammi un testo antico e lo trasmuterò in oro.", p: "Studia i codici perduti. Usa la conoscenza antica per creare avanguardia. La vera alchimia non trasforma metalli: trasforma la coscienza di chi la pratica." },
    PP: { t: "Psicopompo — La Guida", s: "La Verga d'oro", q: "Tutto ciò che inizia, prima o poi, mi segue nell'ombra. La fine non deve farti paura.", p: "Accetta le chiusure. Usa la tua sensibilità per aiutare altri ad accettarle. La guida più gentile accompagna senza spingere." },
  },
  "Era": {
    TA: { t: "Teleia — La Custode", s: "Il Diadema Reale", q: "Il mondo si regge su patti e lealtà. Se non sai mantenere la parola, non sederti al mio tavolo.", p: "Onora le tradizioni. Richiedi lealtà assoluta e rispettala per primo. La fedeltà non è debolezza: è la fondamenta su cui i regni durano." },
    TP: { t: "Pelasgica — L'Antica", s: "Il Trono di Marmo", q: "Le mode passano, i ribelli si stancano. Le mie radici sono antiche quanto il mondo.", p: "Sii una presenza solida e inamovibile. Non farti scalfire dalle mode. La vera autorità non deve urlare: basta restare in piedi quando tutto trema." },
    PA: { t: "La Vendicatrice", s: "L'Occhio del Pavone", q: "Pensavano di offendermi impunemente? Vi mostrerò cosa significa l'ira di una regina.", p: "Difendi i tuoi ideali. Non tollerare chi porta disordine nel tuo spazio. Ma distingui la giustizia dalla rappresaglia: una punisce, l'altra si vendica." },
    PP: { t: "Chera — La Solitaria", s: "Il Velo da vedova", q: "Tutti hanno perso l'onore. Mi ritiro finché questo mondo non imparerà di nuovo il rispetto.", p: "Ritirati dai luoghi corrotti. La rettitudine a volte deve esiliare sé stessa per sopravvivere. Ma non dimenticare di tornare." },
  },
  "Demetra": {
    TA: { t: "La Nutrice", s: "Le Spighe di Grano", q: "Non c'è niente che un lavoro concreto e un buon pasto non possano sistemare.", p: "Coltiva fisicamente qualcosa. Nutrimento e cura sono la tua forza. Il pane che dai non è solo cibo: è la tua forma di amore reso tangibile." },
    TP: { t: "Ctonia — La Radice", s: "La Falce", q: "Ogni cosa ha la sua stagione. Lascia che la terra riposi. I semi germoglieranno.", p: "Accetta i cicli di calo energetico. Riposa d'inverno per sbocciare. La pazienza agraria è una virtù che questa epoca ha quasi dimenticato." },
    PA: { t: "Erinni — La Furente", s: "Le Torce Infiammate", q: "Hanno toccato ciò che ho di più sacro. Finché non lo riavranno, farò seccare i loro cuori.", p: "Canalizza la frustrazione difendendo i vulnerabili a ogni costo. La furia di chi ha perso un figlio è la più giusta delle ire." },
    PP: { t: "La Dolente", s: "Il Mantello scuro", q: "C'è troppo freddo in questo mondo per me oggi. Aspetto qui che torni la primavera.", p: "Consenti a te stesso il lutto. Non forzarti alla socialità quando l'animo è in inverno. Anche la terra si ferma prima di rifiorire." },
  },
  "Ade": {
    TA: { t: "Plutone — L'Amministratore", s: "La Cornucopia e le Gemme", q: "Sotto la superficie c'è immensa ricchezza. Ma richiede oscurità e imparzialità totale.", p: "Gestisci le tue responsabilità con disciplina rigorosa. Sii incorruttibile. Le ricchezze che non si vedono valgono spesso più di quelle esposte." },
    TP: { t: "Il Silenzioso — L'Invisibile", s: "L'Elmo dell'Invisibilità", q: "I mortali bramano i riflettori. Il vero potere governa dall'ombra, invisibile.", p: "Sii l'eminenza grigia. Non cercare i riflettori. Chi governa senza esibirsi governa più a lungo e più saggiamente." },
    PA: { t: "L'Inesorabile", s: "Lo Scettro Bidente", q: "Credete di infrangere le regole del mio mondo? Avrete l'eternità per pentirvi.", p: "Taglia via i rami secchi. Non tollerare compromessi. La giustizia di Ade non è crudele: è definitiva. Distingui i due." },
    PP: { t: "L'Ospite", s: "Le Chiavi del Regno", q: "Tutti, alla fine, arrivano da me. Entra pure, qui non c'è più nulla di cui aver paura.", p: "Diventa rifugio per chi soffre. Accogli senza giudizio. Il regno dei morti è anche il luogo dove ogni ferita trova finalmente pace." },
  },
  "Estia": {
    TA: { t: "La Custode del Fuoco", s: "Il Focolare circolare", q: "Voi fate pure le vostre guerre. Io ho un fuoco da alimentare. La vera pace è nell'ordine.", p: "Pulisci e ordina il tuo spazio. Il minimalismo sacro calma lo spirito. Ogni cosa al suo posto è una preghiera silenziosa." },
    TP: { t: "L'Ascetica", s: "Il Velo bianco", q: "Non voglio potere, non voglio passioni. Voglio solo il silenzio del mio santuario.", p: "Pratica l'introversione come cura. Isola la mente dal frastuono. Il silenzio di Estia non è vuoto: è pienezza senza forma." },
    PA: { t: "La Purificatrice", s: "La Scopa di saggina", q: "Quanta volgarità! Non azzardarti a portare questo fango nel mio tempio.", p: "Elimina ciò che è tossico. Non far entrare chi sporca la tua energia. La sacralità dello spazio interiore va difesa con la stessa cura di un altare." },
    PP: { t: "La Dimenticata", s: "La Cenere fredda", q: "Preferiscono l'ubriachezza alla sacralità del silenzio. Custodirò la brace da sola.", p: "Accetta che la massa non ti comprenderà. Mantieni la tua purezza. La brace che resta sotto la cenere può riaccendere l'intera foresta." },
  },
  "Ares": {
    TA: { t: "Il Difensore", s: "Lo Scudo di bronzo", q: "Le parole non fermano eserciti. Mettiti l'elmo, c'è un lavoro da fare.", p: "Usa la forza per difendere chi non sa lottare per sé stesso. Il guerriero più rispettato non è quello che ama combattere: è quello che combatte quando è necessario." },
    TP: { t: "Il Veterano", s: "La Spada riposta", q: "Ho già versato abbastanza sangue. Non ho bisogno di dimostrare chi sono. Ma non sfidarmi.", p: "Scegli le tue battaglie. Conserva le energie per le vere sfide. La saggezza del soldato che ha visto troppo è più preziosa dell'entusiasmo del recluta." },
    PA: { t: "Il Distruttore", s: "La Lancia macchiata", q: "Tutto questo è corrotto! Raderò al suolo queste false strutture e ballerò sulle rovine.", p: "Incanala la rabbia. Abbatti un progetto corrotto per ricominciare da zero. Ma ricorda: non si costruisce niente di durevole mentre si balla sulle macerie." },
    PP: { t: "Il Vinto", s: "L'Elmo ammaccato", q: "Ho combattuto i mostri di quest'epoca. Sono stanco. Non ho armi in questo tempo.", p: "Concediti di guarire. Le cicatrici dimostrano che hai lottato, non la debolezza. Anche Ares tornò sull'Olimpo dopo essere stato ferito." },
  },
  "Afrodite": {
    TA: { t: "Urania — L'Ispiratrice", s: "La Conchiglia e la Stella", q: "La bellezza è l'unica arma che non versa sangue ma conquista i regni.", p: "Circondati di arte. Crea forme che elevino lo spirito. La bellezza non è ornamento: è la forma visibile dell'invisibile che conta davvero." },
    TP: { t: "Pandemia — La Serena", s: "Lo Specchio di rame", q: "Perché cercare l'eternità nelle stelle quando hai la pelle calda e le rose qui, ora?", p: "Apprezza i piccoli piaceri sensoriali senza complicazioni astratte. La gioia semplice non è meno profonda di quella filosfica." },
    PA: { t: "Areia — La Guerriera", s: "L'Armatura foderata d'oro", q: "Pensi che l'Amore sia solo dolcezze? Se minacci ciò che amo, so maneggiare una lancia.", p: "Combatti la bruttezza estetica e morale con vigore. La dea dell'amore conosce anche l'odio: la differenza è che lei sceglie quando usarlo." },
    PP: { t: "Melainis — L'Oscura", s: "La Rosa Nera", q: "Il mio cuore è spezzato e il mondo è gelido. Non chiedermi di sorridere oggi.", p: "Trasforma il mal d'amore in poesia. Sii indulgente con le tue debolezze. Afrodite nata dalla schiuma del mare sa che il mare non è sempre calmo." },
  },
  "Efesto": {
    TA: { t: "Il Forgiatore", s: "L'Incudine e il Martello", q: "Poche chiacchiere. Dai qui quel metallo. Ti mostro io come si dà forma al caos.", p: "Trova la meditazione nel gesto ripetitivo dell'artigianato. Ogni colpo di martello sull'incudine è un mantra che trasforma la materia grezza in capolavoro." },
    TP: { t: "Il Progettista", s: "Il Compasso divino", q: "Tutto è geometria e meccanica. Anche il cuore degli dèi batte secondo ritmi che posso calcolare.", p: "Studia teoria e meccanica. Disegna senza l'ansia di dover realizzare subito. Il progetto è già metà dell'opera." },
    PA: { t: "L'Ignigeno", s: "Il Vulcano in eruzione", q: "Mi hanno chiamato deforme, mi hanno scacciato. Ma l'arte forgiata dal mio dolore li mette in catene.", p: "Prendi il torto subìto e trasformalo in un'opera monumentale inattaccabile. La fornace di Efesto brucia più caldo proprio dove è stata ferita." },
    PP: { t: "L'Esiliato", s: "Le Tenaglie rotte", q: "Non capiscono il mio lavoro. Che si tengano i loro banchetti. Io chiudo la bottega.", p: "Va bene essere fuori sincronia con questo mondo. Accetta la tua unicità. Il dio più abile dell'Olimpo lavorava lontano dall'Olimpo." },
  },
  "Artemide": {
    TA: { t: "Agrotera — La Cacciatrice", s: "L'Arco di corno", q: "Silenzio. Tendi la corda, fissa il bersaglio. Il mondo è mio se so prendere la mira.", p: "Esci nei boschi. Concentrati su un obiettivo e colpiscilo con precisione. La freccia di Artemide non manca perché è perfetta: non manca perché aspetta il momento giusto." },
    TP: { t: "Selene — La Custode", s: "Lo Spicchio di Luna", q: "Le loro beghe sono rumorose e inutili. Io brillo nell'oscurità, lontana anni luce.", p: "Sii lunare. Guarda la grettezza umana dall'altopiano della mente ghiacciata. La luna non smette di brillare perché i cani le abbaiano contro." },
    PA: { t: "La Difenditrice", s: "Gli Artigli dell'Orsa", q: "Hai osato varcare i miei confini? Preparati a correre. I miei cani hanno fame.", p: "Imponi confini feroci. Chi viola il tuo spazio sacro deve pagarne le conseguenze. La dea della caccia conosce la differenza tra la preda e l'intruso." },
    PP: { t: "L'Eremita", s: "Il Rovo spinoso", q: "Questa umanità è corrotta. Non scoccherò un'altra freccia per loro. Mi ritiro.", p: "Va bene tagliare i ponti con la civiltà se ti fa stare male. Il bosco interiore è un diritto. Ma la cacciatrice che non caccia perde il suo dono." },
  },
  "Poseidone": {
    TA: { t: "Il Fondatore", s: "Il Tridente di bronzo", q: "Sorgi, opera mia. La mia volontà crea isole dove prima c'era solo il nulla.", p: "Avvia grandi progetti. Sii il leader che non mostra incertezze. Ma ricorda che le isole che Poseidone crea devono essere abitate, non solo possedute." },
    TP: { t: "Pelagico — L'Oceano Calmo", s: "L'Acqua profonda e immobile", q: "Le onde in superficie si infrangano. Nel mio abisso regna un silenzio maestoso.", p: "Cova la tua grandezza in silenzio. Le acque calme nascondono gli abissi più profondi. La forza che non deve dimostrare sé stessa è la più convincente." },
    PA: { t: "Enosigèo — Lo Scuotiterra", s: "L'Onda Anomala", q: "Siete troppo compiacenti! Lasciate che scuota le fondamenta della vostra realtà!", p: "Usa la tua empatia per creare opere sismiche che rompano lo status quo. Lo tsunami che distrugge risana anche: porta via ciò che non serviva più." },
    PP: { t: "Il Ritirato", s: "Lo Scoglio solitario", q: "Hanno preferito un ulivo al mio immenso mare. Che si tengano la loro polvere.", p: "Se il mondo non è pronto per il tuo maremoto, ritirati finché non avrà sete. Ma il dio del mare non può restare lontano dall'acqua per sempre." },
  },
  "Dioniso": {
    TA: { t: "Liseo — Il Liberatore", s: "La Coppa e i Tralci", q: "Siete tutti tesi, aggrappati alle regole. Bevete, suonate, ballate! Sciogliete i nodi!", p: "Porta gioia intellettuale in ambienti rigidi. Insegna l'arte dell'improvvisazione. Il vino di Dioniso non è fuga: è la verità che emerge quando le difese cadono." },
    TP: { t: "Il Mistico", s: "La Maschera vuota", q: "Chiudi gli occhi. Senti il respiro della terra? Il divino è nel brivido estatico.", p: "Fidati delle tue intuizioni irrazionali. Contempla il mistero senza spiegarlo. La maschera vuota di Dioniso contiene tutti i volti che non sapevi di avere." },
    PA: { t: "Zagreus — Il Furioso", s: "Il Tirso", q: "Pensavate di ingabbiare l'infinito? Guardate come crolla la sanità davanti al mio furore!", p: "Usa l'arte d'avanguardia per scandalizzare. Sfoga l'inquietudine in creazione. Il furore dionisiaco che non trova la sua arte trova solo la distruzione." },
    PP: { t: "Il Decadente", s: "L'Edera velenosa", q: "Il mondo mi ha fatto a pezzi. Flutto in questo mare di malinconia. Ma c'è bellezza nell'abisso.", p: "Vivi il tuo dramma — è il seme della vera tragedia. Ma non innamorarti del dolore. Dioniso conosce l'abisso perché è anche il dio della risurrezione." },
  },
  "Persefone": {
    TA: { t: "Kore — La Rinnovatrice", s: "Il Bocciolo primaverile", q: "Sono stata nell'ombra. Ma ora sono qui e porto i fiori. Ricostruiamo la bellezza.", p: "Usa la conoscenza delle tenebre per aiutare chi sta attraversando il buio. Chi è già tornato dall'Ade sa guidare gli altri nel cammino." },
    TP: { t: "La Mediatrice", s: "La Mezzaluna", q: "Né la luce mi esalta né l'oscurità mi spaventa. Tutto appartiene allo stesso ciclo.", p: "Riconosci la dualità senza giudicarla. Trova equilibrio nell'accettazione. La regina dei due mondi sa che ogni confine è anche un luogo di incontro." },
    PA: { t: "La Regina Ferrea", s: "La Corona di ferro nero", q: "Tu, mortale, non sai nulla dell'oscurità. Inchina il capo. Non tollero arroganza.", p: "Mostra l'autorità gelida di chi ha visitato gli Inferi quando necessario. Chi ha attraversato la morte non teme nessuna forma di resistenza." },
    PP: { t: "La Prigioniera", s: "Il Melograno sanguigno", q: "Ho mangiato il seme dell'ombra. Non sarò mai più del tutto intera. Metà di me piange il sole.", p: "Esprimi la scissione attraverso l'arte elegiaca. Accetta il chicco che ti lega. La divisione è anche moltiplicazione: sei due regni in una persona sola." },
  },
  "Pan": {
    TA: { t: "Nomios — Il Pastore", s: "Il Flauto di Pan", q: "Lasciate le vostre città d'acciaio. Sedetevi sull'erba. Ascoltate questa scala.", p: "Costruisci il tuo flauto. Coltiva le arti artigianali in solitaria dedizione. La musica di Pan nasce dalla canna tagliata — dalla perdita trasformata in voce." },
    TP: { t: "Il Silvestre", s: "Il Pino secolare", q: "Shhhh. Il sole è alto, le cicale cantano. Smettila di pensare e lasciami dormire.", p: "Abbandona il bisogno di essere civilizzato. Rifugiati nella natura in silenzio. L'ora di Pan è mezzogiorno: il momento in cui tutto tace e il sacro si avvicina." },
    PA: { t: "Il Panico — Il Terrore", s: "Le Corna caprine", q: "Vi siete addormentati! Vi sveglierò con un urlo così atroce che vi ricorderete di essere vivi!", p: "Non temere la tua stranezza. L'arte deve anche spaventare e disorientare. Il panico di Pan è sacro: ricorda all'uomo che esiste qualcosa di più grande." },
    PP: { t: "Il Morente", s: "Il Flauto spezzato", q: "Il bosco è stato abbattuto, gli dèi sono fuggiti. Suonerò un'ultima nota prima del silenzio.", p: "Sei l'ultima eco di un mondo perduto. Custodisci il suono antico come reliquia. Ma ricorda: Pan non è morto. Si è solo ritirato in attesa che il bosco ricrescesse." },
  },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("oracle_users") || "{}"),
  saveUsers: (u) => localStorage.setItem("oracle_users", JSON.stringify(u)),
  getResults: (userId) => JSON.parse(localStorage.getItem(`oracle_results_${userId}`) || "[]"),
  saveResult: (userId, result) => {
    const arr = DB.getResults(userId);
    arr.unshift(result);
    localStorage.setItem(`oracle_results_${userId}`, JSON.stringify(arr.slice(0, 20)));
  },
};

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
function RadarChart({ data, size = 280, accentColor = T.gold }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const labels = ["Oikos/Agorà", "Nous/Physis", "Logos/Sympath.", "Chaos/Cosmos", "Pathos/Atarassia", "Praxis/Theoria"];
  const n = labels.length;
  const pts = data.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * (v / 100) * Math.cos(angle), y: cy + r * (v / 100) * Math.sin(angle) };
  });
  const gridPts = (scale) =>
    labels.map((_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`;
    });
  const polyStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={gridPts(s).join(" ")} fill="none" stroke={accentColor} strokeWidth="1" opacity={s === 1 ? 0.4 : 0.2} />
      ))}
      {labels.map((_, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke={accentColor} strokeWidth="1" opacity="0.3" />;
      })}
      <polygon points={polyStr} fill={accentColor} fillOpacity="0.2" stroke={accentColor} strokeWidth="2.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={accentColor} stroke={T.obsidian} strokeWidth="1.5" />)}
      {labels.map((l, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (r + 26) * Math.cos(a), ly = cy + (r + 26) * Math.sin(a);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill={T.parchment} fontFamily="Georgia, serif" fontWeight="600" opacity="0.85">{l}</text>
        );
      })}
    </svg>
  );
}

// ─── STAR PROFILE ─────────────────────────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {axesDefs.map((ax) => {
        const pct = axes[ax.id];
        const leftPct = pct;
        const rightPct = 100 - pct;
        const leftDom = leftPct > 50;
        return (
          <div key={ax.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, fontFamily: "Georgia, serif" }}>
              <span style={{ color: leftDom ? accentColor : T.stone, fontWeight: leftDom ? 700 : 400 }}>{leftPct}% {ax.left}</span>
              <span style={{ color: !leftDom ? accentColor : T.stone, fontWeight: !leftDom ? 700 : 400 }}>{ax.right} {rightPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: T.ash, display: "flex", overflow: "hidden" }}>
              <div style={{ width: `${leftPct}%`, background: leftDom ? accentColor : T.ash, transition: "width 1.2s ease", borderRight: "2px solid " + T.obsidian }} />
              <div style={{ width: `${rightPct}%`, background: !leftDom ? accentColor : T.ash, transition: "width 1.2s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── LIKERT SCALE ─────────────────────────────────────────────────────────────
function LikertOption({ qId, val, selected, onChange, size, type }) {
  const dim = { 3: 46, 2: 36, 1: 28, 0: 22 }[size];
  const color = type === "agree" ? T.gold : type === "disagree" ? T.ember : T.stone;
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 0 }}>
      <input type="radio" name={`q${qId}`} value={val} checked={selected} onChange={() => onChange(qId, val)} style={{ display: "none" }} />
      <div style={{
        width: dim, height: dim, borderRadius: "50%",
        border: `2px solid ${color}`,
        background: selected ? color : "transparent",
        transition: "all 0.18s",
        boxShadow: selected ? `0 0 14px ${color}88` : "none",
      }} />
    </label>
  );
}

// ─── ORACLE QUOTE COMPONENT ───────────────────────────────────────────────────
function OracleQuote({ quote, deityName, accentColor, symbol }) {
  return (
    <div style={{
      position: "relative",
      margin: "40px 0",
      padding: "48px 40px 36px",
      background: `linear-gradient(135deg, ${T.obsidian} 0%, ${T.obsidianLight} 100%)`,
      border: `1px solid ${accentColor}44`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: "2px 12px 12px 2px",
      boxShadow: `0 0 40px ${accentColor}22, inset 0 0 60px rgba(0,0,0,0.5)`,
    }}>
      {/* Decorative top line */}
      <div style={{
        position: "absolute", top: 0, left: 40, right: 40, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
      }} />
      {/* Symbol */}
      <div style={{
        position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
        background: T.obsidian, padding: "4px 20px",
        border: `1px solid ${accentColor}66`,
        borderRadius: 4,
        fontSize: 13, letterSpacing: 3, textTransform: "uppercase",
        color: accentColor, fontFamily: "Georgia, serif",
      }}>
        {symbol}
      </div>
      {/* Big quote mark */}
      <div style={{
        position: "absolute", top: 16, left: 24,
        fontSize: 72, color: accentColor, opacity: 0.15,
        fontFamily: "Georgia, serif", lineHeight: 1,
      }}>"</div>
      {/* Quote text */}
      <p style={{
        fontSize: "clamp(1.05rem,2.5vw,1.3rem)",
        fontStyle: "italic",
        lineHeight: 1.8,
        color: T.parchment,
        margin: 0,
        textAlign: "center",
        position: "relative", zIndex: 1,
        textShadow: `0 0 30px ${accentColor}44`,
      }}>
        {quote}
      </p>
      {/* Attribution */}
      <div style={{
        marginTop: 20, textAlign: "right",
        fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
        color: accentColor, opacity: 0.7, fontFamily: "Georgia, serif",
      }}>
        — {deityName}
      </div>
      {/* Decorative bottom line */}
      <div style={{
        position: "absolute", bottom: 0, left: 40, right: 40, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)`,
      }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [responses, setResponses] = useState({});
  const [page, setPage] = useState(0);
  const QPerPage = 10;
  const totalPages = Math.ceil(QUESTIONS.length / QPerPage);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, note: "" });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [history, setHistory] = useState([]);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => { if (screen === "result") { setTimeout(() => setBarsVisible(true), 400); } }, [screen]);

  const currentQs = QUESTIONS.slice(page * QPerPage, (page + 1) * QPerPage);
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

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

  const saveAnswer = (qId, val) => setResponses((r) => ({ ...r, [qId]: parseInt(val) }));

  const startQuiz = () => {
    setResponses({}); setPage(0); setBarsVisible(false);
    setFeedbackSent(false); setFeedback({ rating: 0, note: "" });
    setScreen("quiz");
  };

  const nextPage = () => {
    const start = page * QPerPage;
    const end = Math.min(start + QPerPage, QUESTIONS.length);
    for (let i = start; i < end; i++) {
      if (responses[QUESTIONS[i].id] === undefined) { alert("Rispondi a tutte le affermazioni prima di avanzare."); return; }
    }
    if (page < totalPages - 1) { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else { processResults(); }
  };

  const processResults = () => {
    const start = page * QPerPage;
    const end = Math.min(start + QPerPage, QUESTIONS.length);
    for (let i = start; i < end; i++) {
      if (responses[QUESTIONS[i].id] === undefined) { alert("Rispondi a tutte le affermazioni."); return; }
    }
    setScreen("loading");
    setTimeout(calculateAndShow, 3000 + Math.random() * 4000);
  };

  const calculateAndShow = () => {
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    QUESTIONS.forEach((q) => { scores[q.a] += (responses[q.id] || 0); counts[q.a]++; });
    const resolve = (s, pos, neg) => s > 0 ? pos : s < 0 ? neg : Math.random() > 0.5 ? pos : neg;
    const pol1 = resolve(scores[1], "Oikos", "Agora");
    const pol2 = resolve(scores[2], "Nous", "Physis");
    const pol3 = resolve(scores[3], "Logos", "Sympatheia");
    const pol4 = resolve(scores[4], "Chaos", "Cosmos");
    const pol5 = resolve(scores[5], "Pathos", "Tranquillita");
    const pol6 = resolve(scores[6], "Attivo", "Passivo");
    const deityKey = `${pol1}-${pol2}-${pol3}-${pol4}`;
    const deity = DEITIES[deityKey] || DEITIES["Oikos-Nous-Logos-Cosmos"];
    const epKey = (pol5 === "Pathos" ? "P" : "T") + (pol6 === "Attivo" ? "A" : "P");
    const ep = (EPITHETS[deity.name] || {})[epKey] || { t: "Il Mistero", s: "?", q: "...", p: "Esplora." };
    const axes = {};
    for (let ax = 1; ax <= 6; ax++) {
      const maxScore = counts[ax] * 3;
      axes[ax] = Math.round(((scores[ax] + maxScore) / (maxScore * 2)) * 100);
    }
    const r = { id: uid(), date: now(), deity, ep, axes, deityKey, epKey, scores };
    DB.saveResult(currentUser.id, r);
    setResult(r);
    setScreen("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendFeedback = () => {
    const results = DB.getResults(currentUser.id);
    if (results.length && result) {
      results[0].feedback = { rating: feedback.rating, note: feedback.note };
      localStorage.setItem(`oracle_results_${currentUser.id}`, JSON.stringify(results));
    }
    setFeedbackSent(true);
  };

  const loadHistory = () => {
    setHistory(DB.getResults(currentUser?.id || ""));
    setScreen("history");
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.obsidian, fontFamily: "Georgia, serif", color: T.parchment }}>
      <style>{`
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.85} 92%{opacity:0.95} }
        @keyframes smokeRise { 0%{transform:translateY(0) scaleX(1);opacity:0.6} 100%{transform:translateY(-60px) scaleX(1.5);opacity:0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(201,168,76,0.2)} 50%{box-shadow:0 0 40px rgba(201,168,76,0.5)} }
        * { box-sizing: border-box; }
        input, textarea { font-family: Georgia, serif !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.obsidian}; }
        ::-webkit-scrollbar-thumb { background: ${T.ash}; border-radius: 3px; }
      `}</style>

      {/* Meander borders */}
      <div style={{ position: "fixed", top: 0, left: 0, width: 3, height: "100vh", background: `linear-gradient(to bottom, transparent, ${T.gold}44, transparent)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: 3, height: "100vh", background: `linear-gradient(to bottom, transparent, ${T.gold}44, transparent)`, pointerEvents: "none", zIndex: 0 }} />
      {/* Top ornament */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}66, transparent)`, pointerEvents: "none", zIndex: 10 }} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 80px", position: "relative", zIndex: 1 }}>

        {/* ── AUTH ── */}
        {screen === "auth" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 72, color: T.gold, letterSpacing: 2, fontFamily: "Georgia, serif", lineHeight: 1, animation: "flicker 4s ease-in-out infinite", textShadow: `0 0 30px ${T.gold}88` }}>Ω</div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", color: T.parchment, margin: "14px 0 8px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 400 }}>L'Oracolo di Delfi</h1>
              <div style={{ width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin: "12px auto" }} />
              <p style={{ color: T.goldDim, fontSize: 14, fontStyle: "italic", letterSpacing: 1 }}>Γνῶθι σεαυτόν — Conosci te stesso</p>
            </div>
            <div style={{
              background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`,
              borderRadius: 8, padding: "clamp(28px,4vw,44px)",
              width: "100%", maxWidth: 420,
              boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 80px ${T.gold}11`,
              border: `1px solid ${T.gold}33`,
            }}>
              <div style={{ display: "flex", marginBottom: 28, borderBottom: `1px solid ${T.ash}` }}>
                {["login", "register"].map((m) => (
                  <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{
                    flex: 1, padding: "10px 0", background: "none", border: "none",
                    borderBottom: authMode === m ? `2px solid ${T.gold}` : "2px solid transparent",
                    marginBottom: -1, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif",
                    color: authMode === m ? T.gold : T.stone, fontWeight: authMode === m ? 700 : 400,
                    transition: "all .2s", letterSpacing: 1, textTransform: "uppercase",
                  }}>
                    {m === "login" ? "Accedi" : "Registrati"}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {authMode === "register" && (
                  <input placeholder="Il tuo nome" value={authForm.name} onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
                )}
                <input placeholder="Email" type="email" value={authForm.email} onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                <input placeholder="Password" type="password" value={authForm.password} onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()} style={inputStyle} />
                {authError && <div style={{ color: "#C47A7A", fontSize: 13, textAlign: "center", fontStyle: "italic" }}>{authError}</div>}
                <button onClick={handleAuth} style={btnGold}>
                  {authMode === "login" ? "Varca la Soglia" : "Consacrati all'Oracolo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── START ── */}
        {screen === "start" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 0 }}>
            <div style={{ fontSize: 80, color: T.gold, animation: "flicker 5s ease-in-out infinite", textShadow: `0 0 40px ${T.gold}88` }}>Ω</div>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", margin: "16px 0 8px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 400, color: T.parchment }}>
              L'Oracolo di Delfi
            </h1>
            <div style={{ width: 200, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin: "16px auto 24px" }} />
            <p style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", color: T.parchmentDark, lineHeight: 1.9, maxWidth: 520, marginBottom: 40 }}>
              Benvenuto, <span style={{ color: T.gold, fontStyle: "italic" }}>{currentUser?.name}</span>.<br />
              Centocinquanta affermazioni attendono la tua risposta.<br />
              <span style={{ color: T.stone, fontSize: "0.9em" }}>Rispondi d'istinto, guidato dal tuo Daimon interiore.</span>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={startQuiz} style={btnGold}>Interroga l'Oracolo</button>
              <button onClick={loadHistory} style={btnGhost}>I tuoi Respici</button>
              <button onClick={() => { setCurrentUser(null); setScreen("auth"); }} style={btnFade}>Esci dal Tempio</button>
            </div>
          </div>
        )}

        {/* ── PROGRESS BAR ── */}
        {screen === "quiz" && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000, background: `${T.obsidian}F0`, backdropFilter: "blur(8px)", padding: "10px 0 8px", borderBottom: `1px solid ${T.ash}` }}>
            <div style={{ textAlign: "center", fontSize: 12, fontFamily: "Georgia, serif", color: T.goldDim, marginBottom: 6, letterSpacing: 1 }}>
              {progress}% · Pagina {page + 1} di {totalPages}
            </div>
            <div style={{ width: "90%", maxWidth: 700, margin: "0 auto", height: 3, background: T.ash, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${T.goldDim}, ${T.gold})`, transition: "width .4s ease" }} />
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {screen === "quiz" && (
          <div style={{ paddingTop: 72 }}>
            {currentQs.map((q) => {
              const sel = responses[q.id];
              return (
                <div key={q.id} style={{
                  background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`,
                  borderRadius: 8, padding: "clamp(20px,4vw,32px)", marginBottom: 16,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
                  border: `1px solid ${sel !== undefined ? T.gold + "44" : T.ash}`,
                  transition: "border-color .3s",
                }}>
                  <div style={{ fontSize: "clamp(0.95rem,2.5vw,1.1rem)", fontWeight: 400, marginBottom: 24, lineHeight: 1.65, color: T.parchment }}>
                    <span style={{ color: T.goldDim, marginRight: 8, fontSize: "0.85em", letterSpacing: 1 }}>{q.id}.</span>{q.t}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "clamp(6px,2vw,14px)" }}>
                    {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
                      <LikertOption key={v} qId={q.id} val={v} selected={sel === v} onChange={saveAnswer}
                        size={Math.abs(v)} type={v < 0 ? "disagree" : v > 0 ? "agree" : "neutral"} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: T.stone, letterSpacing: 1, textTransform: "uppercase" }}>
                    <span style={{ color: T.ember + "CC" }}>Disaccordo</span>
                    <span style={{ color: T.gold + "CC" }}>Accordo</span>
                  </div>
                </div>
              );
            })}
            <button onClick={nextPage} style={{ ...btnGold, margin: "16px auto 0", display: "block", minWidth: 240 }}>
              {page < totalPages - 1 ? "Prosegui il Cammino →" : "Rivela il Verdetto"}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {screen === "loading" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 28 }}>
            {/* Animated oracle smoke */}
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <div style={{ position: "absolute", inset: 0, border: `2px solid ${T.gold}44`, borderRadius: "50%", animation: "spin 8s linear infinite" }} />
              <div style={{ position: "absolute", inset: 8, border: `1px solid ${T.gold}33`, borderRadius: "50%", animation: "spin 5s linear infinite reverse" }} />
              <div style={{ position: "absolute", inset: 16, border: `2px solid ${T.gold}66`, borderRadius: "50%", animation: "spin 3s linear infinite" }} />
              <div style={{ position: "absolute", inset: "50%", transform: "translate(-50%,-50%)", fontSize: 28, color: T.gold, animation: "flicker 2s ease-in-out infinite" }}>Ω</div>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", color: T.parchment, fontWeight: 400, letterSpacing: 2 }}>Consultando l'Oracolo…</h2>
            <p style={{ fontStyle: "italic", color: T.stone, fontSize: 15, letterSpacing: 0.5 }}>La Pizia è in trance. Attendi la parola degli dèi.</p>
            <p style={{ fontSize: 13, color: T.ash, letterSpacing: 1, textTransform: "uppercase" }}>Non farti prendere dalla Hybris</p>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "result" && result && (() => {
          const acc = result.deity.accentColor || T.gold;
          return (
            <div style={{ paddingTop: 40, animation: "fadeInUp 0.8s ease" }}>

              {/* Hero Section */}
              <div style={{ textAlign: "center", marginBottom: 0, position: "relative" }}>
                {/* Top label */}
                <div style={{ fontSize: 11, color: acc, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, opacity: 0.8 }}>
                  L'Oracolo ha parlato
                </div>
                {/* Deity name */}
                <h1 style={{
                  fontSize: "clamp(3.5rem,10vw,6rem)", color: acc,
                  margin: "0 0 4px", letterSpacing: 4, fontWeight: 400, textTransform: "uppercase",
                  textShadow: `0 0 60px ${acc}66, 0 2px 4px rgba(0,0,0,0.8)`,
                  lineHeight: 1,
                }}>{result.deity.name}</h1>
                {/* Epithet title */}
                <div style={{ width: 200, height: 1, background: `linear-gradient(90deg, transparent, ${acc}, transparent)`, margin: "16px auto" }} />
                <h2 style={{ fontSize: "clamp(1rem,3vw,1.5rem)", color: T.parchmentDark, margin: "0 0 4px", fontStyle: "italic", fontWeight: 400 }}>
                  {result.ep.t}
                </h2>
                <div style={{ fontSize: 13, color: acc, letterSpacing: 2, opacity: 0.7, marginBottom: 4 }}>
                  {result.deity.epithetBase}
                </div>
              </div>

              {/* Hero Image */}
              <div style={{
                borderRadius: 4, overflow: "hidden", margin: "28px 0 0",
                border: `1px solid ${acc}44`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 80px ${acc}22`,
                background: T.smoke,
                maxHeight: 420, position: "relative",
              }}>
                {/* Gradient overlay on image */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                  background: `linear-gradient(to top, ${T.obsidian}, transparent)`,
                  zIndex: 1, pointerEvents: "none",
                }} />
                <DeityImage
                  name={result.deity.name}
                  style={{ width: "100%", height: "100%", maxHeight: 420, objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
              </div>

              {/* Oracle Quote — THE STAR OF THE SHOW */}
              <OracleQuote
                quote={result.ep.q}
                deityName={`${result.deity.name}, ${result.ep.t}`}
                accentColor={acc}
                symbol={result.ep.s}
              />

              {/* Content Section */}
              <div style={{
                background: `linear-gradient(160deg, ${T.obsidianLight} 0%, ${T.smoke} 100%)`,
                borderRadius: 8, padding: "clamp(24px,4vw,44px)",
                border: `1px solid ${T.ash}`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.6)`,
              }}>
                {/* Section: Archetipo */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: acc, marginBottom: 12, opacity: 0.7 }}>
                    ◈ Il tuo Archetipo Divino
                  </div>
                  <p style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: 1.9, color: T.parchmentDark, margin: 0 }}>
                    {result.deity.desc}
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${acc}33, transparent)`, margin: "32px 0" }} />

                {/* Section: Oracolo pratico */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: acc, marginBottom: 12, opacity: 0.7 }}>
                    ◈ La Via Oracolare
                  </div>
                  <p style={{ fontSize: "clamp(0.9rem,1.8vw,1.05rem)", lineHeight: 1.85, color: T.parchmentDark, margin: 0 }}>
                    {result.ep.p}
                  </p>
                </div>

                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 32 }}>
                  <InfoTile label="Animale Sacro" value={result.deity.animal} accentColor={acc} />
                  <InfoTile label="Il tuo Simbolo" value={result.ep.s} accentColor={acc} />
                  <InfoTile label="Epiteto Divino" value={result.deity.epithetBase} accentColor={acc} />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${acc}33, transparent)`, margin: "0 0 36px" }} />

                {/* Profilo dell'anima */}
                <h3 style={{ textAlign: "center", fontSize: "clamp(1.1rem,2.5vw,1.5rem)", marginBottom: 32, letterSpacing: 2, textTransform: "uppercase", fontWeight: 400, color: T.parchment }}>
                  L'Architettura della tua Anima
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: T.stone, letterSpacing: 2, textTransform: "uppercase" }}>Mappa Stellare</div>
                    <RadarChart
                      data={[1, 2, 3, 4, 5, 6].map((ax) => result.axes[ax])}
                      size={Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 400) - 80)}
                      accentColor={acc}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 10, color: T.stone, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Polarità degli Assi</div>
                    {barsVisible && <StarProfile axes={result.axes} accentColor={acc} />}
                  </div>
                </div>
              </div>

              {/* Divider ornament */}
              <div style={{ textAlign: "center", margin: "40px 0", color: acc, opacity: 0.4, letterSpacing: 8, fontSize: 12 }}>
                ◆ ◆ ◆
              </div>

              {/* Feedback */}
              <div style={{
                background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`,
                borderRadius: 8, padding: "clamp(20px,4vw,36px)",
                border: `1px solid ${T.ash}`,
              }}>
                {!feedbackSent ? (
                  <div>
                    <h3 style={{ fontSize: "clamp(1rem,2.5vw,1.3rem)", marginBottom: 16, textAlign: "center", fontWeight: 400, letterSpacing: 1, color: T.parchment }}>
                      Il tuo Giudizio sull'Oracolo
                    </h3>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setFeedback((f) => ({ ...f, rating: s }))} style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: s <= feedback.rating ? T.gold : T.ash, transition: "color .15s" }}>★</button>
                      ))}
                    </div>
                    <textarea value={feedback.note} onChange={(e) => setFeedback((f) => ({ ...f, note: e.target.value }))} placeholder="Impressioni, risonanze, disaccordi con il verdetto…" rows={3} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
                    <button onClick={sendFeedback} style={{ ...btnGold, marginTop: 14, display: "block", margin: "14px auto 0" }}>
                      Consegna al Tempio
                    </button>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: T.gold, fontStyle: "italic", opacity: 0.8 }}>✦ Il tuo giudizio è stato consegnato agli dèi.</p>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
                <button onClick={() => setScreen("start")} style={btnGold}>Torna all'Inizio</button>
                <button onClick={startQuiz} style={btnGhost}>Ripeti il Test</button>
                <button onClick={loadHistory} style={btnFade}>Storico</button>
              </div>
            </div>
          );
        })()}

        {/* ── HISTORY ── */}
        {screen === "history" && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: "clamp(1.3rem,4vw,2rem)", margin: 0, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: T.parchment }}>I tuoi Respici Oracolari</h2>
              <button onClick={() => setScreen("start")} style={btnFade}>← Indietro</button>
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: T.stone, fontStyle: "italic" }}>Nessun oracolo consultato ancora.</div>
            ) : history.map((h, i) => {
              const acc = h.deity.accentColor || T.gold;
              return (
                <div key={h.id || i} style={{
                  background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`,
                  borderRadius: 8, padding: "20px 24px", marginBottom: 12,
                  border: `1px solid ${T.ash}`,
                  display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                }}>
                  <div style={{ width: 60, height: 60, borderRadius: 4, overflow: "hidden", border: `1px solid ${acc}44`, flexShrink: 0, background: T.ash }}>
                    <DeityImage name={h.deity.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 700, color: acc }}>{h.deity.name}</div>
                    <div style={{ fontSize: 13, color: T.parchmentDark, fontStyle: "italic", marginBottom: 4 }}>{h.ep?.t}</div>
                    <div style={{ fontSize: 11, color: T.stone, letterSpacing: 1 }}>{new Date(h.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</div>
                    {h.feedback && (
                      <div style={{ marginTop: 6, fontSize: 12, color: T.stone }}>
                        <span style={{ color: T.gold }}>{"★".repeat(h.feedback.rating)}</span>{"☆".repeat(5 - h.feedback.rating)}
                        {h.feedback.note && <span style={{ marginLeft: 8, color: T.stone }}>"{h.feedback.note.slice(0, 60)}{h.feedback.note.length > 60 ? "…" : ""}"</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── INFO TILE ────────────────────────────────────────────────────────────────
function InfoTile({ label, value, accentColor }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      padding: "14px 18px", borderRadius: 4,
      borderLeft: `3px solid ${accentColor}66`,
      border: `1px solid rgba(255,255,255,0.06)`,
      borderLeft: `3px solid ${accentColor}66`,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, marginBottom: 6, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#DDD0AC" }}>{value}</div>
    </div>
  );
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const inputStyle = {
  padding: "12px 16px", borderRadius: 4,
  border: `1px solid ${T.ash}`,
  fontSize: 15, fontFamily: "Georgia, serif", outline: "none",
  width: "100%",
  background: "rgba(255,255,255,0.04)", color: T.parchment,
  transition: "border-color .2s",
};

const btnGold = {
  background: `linear-gradient(135deg, ${T.goldDim}, ${T.gold})`,
  color: T.obsidian, border: "none", borderRadius: 3,
  padding: "0 36px", height: 50,
  fontSize: "clamp(13px,2vw,14px)", fontFamily: "Georgia, serif",
  fontWeight: 700, cursor: "pointer", letterSpacing: 1,
  textTransform: "uppercase", whiteSpace: "nowrap",
  boxShadow: `0 4px 20px ${T.gold}33`,
  transition: "all .2s",
};

const btnGhost = {
  background: "transparent",
  color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 3,
  padding: "0 28px", height: 50,
  fontSize: "clamp(13px,2vw,14px)", fontFamily: "Georgia, serif",
  fontWeight: 400, cursor: "pointer", letterSpacing: 1,
  textTransform: "uppercase", whiteSpace: "nowrap",
  transition: "all .2s",
};

const btnFade = {
  background: "transparent",
  color: T.stone, border: `1px solid ${T.ash}`, borderRadius: 3,
  padding: "0 24px", height: 46,
  fontSize: "clamp(12px,2vw,13px)", fontFamily: "Georgia, serif",
  fontWeight: 400, cursor: "pointer", letterSpacing: 1,
  textTransform: "uppercase", whiteSpace: "nowrap",
  transition: "all .2s",
};
