import { useState, useEffect, useCallback } from "react";

// ─── PALETTE ORACOLARE ────────────────────────────────────────────────────────
const T = {
  obsidian: "#0D0B08", obsidianLight: "#1A1610", smoke: "#2A2420", ash: "#3D3530",
  stone: "#5A5248", fog: "#8A8078", parchment: "#F2E8D0", parchmentDark: "#DDD0AC",
  parchmentDeep: "#C9BA94", gold: "#C9A84C", goldLight: "#E8C97A", goldDim: "#9B7A2A",
  goldPale: "#F5E8B0", ember: "#8B3020", agree: "#4A7C59", disagree: "#7C4A5E", neutral: "#8A8078",
};

// ─── IMMAGINI DIVINITÀ CON FALLBACK ──────────────────────────────────────────
const DEITY_IMAGES = {
  "Zeus": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Jupiter_Smyrna_Louvre_Ma13.jpg/600px-Jupiter_Smyrna_Louvre_Ma13.jpg", fallback: "⚡" },
  "Apollo": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Apollo_Belvedere_vatican.jpg/600px-Apollo_Belvedere_vatican.jpg", fallback: "☀" },
  "Atena": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Athena_Giustiniani_Musei_Capitolini_MC278.jpg/600px-Athena_Giustiniani_Musei_Capitolini_MC278.jpg", fallback: "🦉" },
  "Hermes": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hermes_Ingenui_Pio-Clementino_Inv544.jpg/600px-Hermes_Ingenui_Pio-Clementino_Inv544.jpg", fallback: "☿" },
  "Era": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hera_Campana_Louvre_Ma2283.jpg/600px-Hera_Campana_Louvre_Ma2283.jpg", fallback: "👑" },
  "Demetra": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Demeter_Altemps_Inv8546.jpg/600px-Demeter_Altemps_Inv8546.jpg", fallback: "🌾" },
  "Ade": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hades_with_cerberus.jpg/600px-Hades_with_cerberus.jpg", fallback: "⚫" },
  "Estia": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Hestia_Giustiniani.jpg/600px-Hestia_Giustiniani.jpg", fallback: "🔥" },
  "Ares": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Ares_Borghese_cropped.jpg/600px-Ares_Borghese_cropped.jpg", fallback: "⚔" },
  "Afrodite": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Aphrodite_Braschi_Glyptothek_Munich_258.jpg/600px-Aphrodite_Braschi_Glyptothek_Munich_258.jpg", fallback: "♀" },
  "Efesto": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Vulcan_Coustou_Louvre_MR1814.jpg/600px-Vulcan_Coustou_Louvre_MR1814.jpg", fallback: "🔨" },
  "Artemide": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Diana_of_Versailles.jpg/600px-Diana_of_Versailles.jpg", fallback: "🌙" },
  "Poseidone": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Poseidon_sculpture_Copenhagen_2005.jpg/600px-Poseidon_sculpture_Copenhagen_2005.jpg", fallback: "🔱" },
  "Dioniso": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Michelangelo_Bacchus.jpg/600px-Michelangelo_Bacchus.jpg", fallback: "🍇" },
  "Persefone": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Isis-Persephone.jpg/600px-Isis-Persephone.jpg", fallback: "🌑" },
  "Pan": { google: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Pan_and_Daphne.jpg/600px-Pan_and_Daphne.jpg", fallback: "🪈" },
};

function DeityImage({ name, style, className }) {
  const [failed, setFailed] = useState(false);
  const info = DEITY_IMAGES[name] || { fallback: "◎" };
  
  if (failed || !info.google) {
    return (
      <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle at 40% 30%, ${T.gold}22, ${T.obsidian})`, fontSize: style?.height ? parseInt(style.height) * 0.4 : 80 }}>
        {info.fallback}
      </div>
    );
  }
  return <img src={info.google} alt={name} style={{ ...style, filter: "sepia(15%) contrast(1.1) brightness(0.95)", transition: "transform 0.3s ease" }} onError={() => setFailed(true)} loading="lazy" />;
}

// ─── LOCALIZZAZIONE (UI) ─────────────────────────────────────────────────────
const LANGS = {
  it: { name: "Italiano", ui: { login: "Accedi", register: "Registrati", name: "Nome", surname: "Cognome", email: "Email", password: "Password", start: "Interroga l'Oracolo", resume: "Riprendi il Cammino", history: "I tuoi Respici", logout: "Esci", back: "Indietro", next: "Prosegui", reveal: "Rivela il Verdetto", admin: "Pannello Admin", timeEst: "Tempo stimato" } },
  en: { name: "English", ui: { login: "Login", register: "Register", name: "Name", surname: "Surname", email: "Email", password: "Password", start: "Consult the Oracle", resume: "Resume Journey", history: "Your Oracles", logout: "Exit", back: "Back", next: "Continue", reveal: "Reveal Verdict", admin: "Admin Panel", timeEst: "Estimated time" } },
  es: { name: "Español", ui: { login: "Acceder", register: "Registrarse", name: "Nombre", surname: "Apellido", email: "Correo", password: "Contraseña", start: "Consultar al Oráculo", resume: "Reanudar", history: "Tus Oráculos", logout: "Salir", back: "Atrás", next: "Continuar", reveal: "Revelar Veredicto", admin: "Panel Admin", timeEst: "Tiempo estimado" } },
  fr: { name: "Français", ui: { login: "Connexion", register: "S'inscrire", name: "Prénom", surname: "Nom", email: "E-mail", password: "Mot de passe", start: "Consulter l'Oracle", resume: "Reprendre", history: "Vos Oracles", logout: "Quitter", back: "Retour", next: "Continuer", reveal: "Révéler le Verdict", admin: "Panneau Admin", timeEst: "Temps estimé" } },
  de: { name: "Deutsch", ui: { login: "Anmelden", register: "Registrieren", name: "Vorname", surname: "Nachname", email: "E-Mail", password: "Passwort", start: "Orakel befragen", resume: "Fortsetzen", history: "Deine Orakel", logout: "Beenden", back: "Zurück", next: "Weiter", reveal: "Urteil enthüllen", admin: "Admin-Panel", timeEst: "Geschätzte Zeit" } },
  pt: { name: "Português", ui: { login: "Entrar", register: "Registrar", name: "Nome", surname: "Sobrenome", email: "E-mail", password: "Senha", start: "Consultar o Oráculo", resume: "Retomar", history: "Seus Oráculos", logout: "Sair", back: "Voltar", next: "Continuar", reveal: "Revelar Veredito", admin: "Painel Admin", timeEst: "Tempo estimado" } },
  ru: { name: "Русский", ui: { login: "Войти", register: "Регистрация", name: "Имя", surname: "Фамилия", email: "Эл. почта", password: "Пароль", start: "Спросить Оракула", resume: "Продолжить", history: "Ваши Оракулы", logout: "Выйти", back: "Назад", next: "Далее", reveal: "Узнать вердикт", admin: "Панель админа", timeEst: "Расчетное время" } },
  zh: { name: "中文", ui: { login: "登录", register: "注册", name: "名字", surname: "姓氏", email: "电子邮件", password: "密码", start: "咨询神谕", resume: "继续旅程", history: "你的神谕", logout: "退出", back: "返回", next: "继续", reveal: "揭示裁决", admin: "管理面板", timeEst: "预计时间" } },
};

// ─── DATABASE DIVINITÀ (Struttura multi-lingua pronta) ───────────────────────
// Per brevità, le descrizioni sono in IT. In produzione, espandere con chiavi 'en', 'es', ecc.
const DEITIES = {
  "Oikos-Nous-Logos-Cosmos": { name: "Apollo", epithetBase: "Il Dio della Luce", animal: "Cigno, Corvo, Delfino", desc: "Sei guidato dal nume della luce e della musica matematica. Cerchi la perfezione delle forme e l'accordatura esatta dello strumento cosmico.", color: "#D4AF37", accentColor: "#D4AF37" },
  "Agora-Nous-Logos-Cosmos": { name: "Zeus", epithetBase: "Il Sovrano Cosmico", animal: "Aquila e Toro", desc: "La tua anima risuona con il Sovrano dell'Olimpo. Estroverso e visionario, la tua mente abbraccia l'intero cosmo come un architetto.", color: "#C9A84C", accentColor: "#C9A84C" },
  "Oikos-Nous-Logos-Chaos": { name: "Atena", epithetBase: "La Stratega", animal: "Civetta e Serpente", desc: "Incarni la Stratega Adattabile. Hai la rara capacità di navigare il caos trasformandolo in vantaggio tattico senza perdere il filo della ragione.", color: "#7B9EA3", accentColor: "#7B9EA3" },
  "Agora-Nous-Logos-Chaos": { name: "Hermes", epithetBase: "Il Messaggero", animal: "Tartaruga, Gallo, Ariete", desc: "Sei il Messaggero Alchemico. La tua mente vola tra idee, linguaggi e discipline con la leggerezza dei sandali alati.", color: "#A8C090", accentColor: "#A8C090" },
  "Agora-Physis-Logos-Cosmos": { name: "Era", epithetBase: "La Custode dell'Ordine", animal: "Pavone e Mucca sacra", desc: "Incarni la Protettrice delle Regole. Usi la mente fredda e la logica degli accordi per amministrare e preservare le istituzioni.", color: "#9B7BA3", accentColor: "#9B7BA3" },
  "Agora-Physis-Sympatheia-Cosmos": { name: "Demetra", epithetBase: "La Madre Nutrice", animal: "Serpente, Maiale, Gru", desc: "La tua anima appartiene alla Madre Nutrice. Sei un pilastro per chi ami, dispensando cura e stabilità con la certezza dei cicli naturali.", color: "#7A9E6A", accentColor: "#7A9E6A" },
  "Oikos-Physis-Logos-Cosmos": { name: "Ade", epithetBase: "Il Giudice Implacabile", animal: "Cane a tre teste, Cavalli neri", desc: "Sei affine al Signore del Mondo Sotterraneo. Gestisci i tuoi domini con integrità assoluta nel silenzio del tuo regno inalterabile.", color: "#5A6A7A", accentColor: "#5A6A7A" },
  "Oikos-Physis-Sympatheia-Cosmos": { name: "Estia", epithetBase: "Il Focolare Sacro", animal: "Asino e Maiale", desc: "Trovi il divino nell'essenza del Focolare. Sei la presenza silenziosa che custodisce il fuoco al centro di tutto.", color: "#C4856A", accentColor: "#C4856A" },
  "Agora-Physis-Logos-Chaos": { name: "Ares", epithetBase: "Il Guerriero Impetuoso", animal: "Cane, Avvoltoio, Picchio", desc: "In te arde il Guerriero Impetuoso. Usi la cruda logica del momento per dominare il caos e distruggere il vecchio ordine.", color: "#8B3030", accentColor: "#8B3030" },
  "Agora-Physis-Sympatheia-Chaos": { name: "Afrodite", epithetBase: "L'Esteta dell'Amore", animal: "Colomba, Cigno, Lepre", desc: "Sei figlio/a dell'Esteta dell'Amore. Cerchi la bellezza sensoriale e le connessioni umane con una passione che brucia autentica.", color: "#C47A85", accentColor: "#C47A85" },
  "Oikos-Physis-Logos-Chaos": { name: "Efesto", epithetBase: "L'Artefice", animal: "Asino e Gru", desc: "La tua anima è quella dell'Artefice Divino. Usi una logica meccanica rigorosa in un processo creativo caotico e vigoroso.", color: "#8B6030", accentColor: "#8B6030" },
  "Oikos-Physis-Sympatheia-Chaos": { name: "Artemide", epithetBase: "La Cacciatrice Selvaggia", animal: "Cerva, Orsa, Cinghiale", desc: "Incarni la Cacciatrice Selvaggia. Solitaria, fisica, profondamente empatica verso la natura e indipendente.", color: "#5A8060", accentColor: "#5A8060" },
  "Agora-Nous-Sympatheia-Cosmos": { name: "Poseidone", epithetBase: "L'Impeto dell'Oceano", animal: "Cavallo, Toro, Delfino", desc: "In te vive l'Impeto dell'Oceano. Governato da passioni emotive che possono sollevare tempeste o generare porti sicuri.", color: "#3A6080", accentColor: "#3A6080" },
  "Agora-Nous-Sympatheia-Chaos": { name: "Dioniso", epithetBase: "Il Mistico dell'Estasi", animal: "Pantera, Toro, Serpente", desc: "Sei il Mistico dell'Estasi. Rompi le regole per fonderti col vitale disordine del mondo, cercando l'intensità suprema.", color: "#7A3A8A", accentColor: "#7A3A8A" },
  "Oikos-Nous-Sympatheia-Cosmos": { name: "Persefone", epithetBase: "La Guida dei Due Mondi", animal: "Pipistrello e Civetta", desc: "Sei la Guida dei Due Mondi. Oscilli tra luce e ombra accettando quel dualismo come un ordine ciclico e necessario.", color: "#6A4A7A", accentColor: "#6A4A7A" },
  "Oikos-Nous-Sympatheia-Chaos": { name: "Pan", epithetBase: "Lo Spirito dell'Ispirazione", animal: "Capra", desc: "La tua natura è quella dello Spirito dell'Ispirazione. Rifiuti le strutture per suonare la tua melodia selvaggia nel flusso del tempo.", color: "#6A8A4A", accentColor: "#6A8A4A" },
};

const EPITHETS = {
  "Apollo": { TA: { t: "L'Armonizzatore", s: "La Lira d'oro", q: "Sono la perfezione. Accordi bene il tuo strumento?", p: "Studia proporzioni e accordatura. L'arte calcolata è la tua via." }, TP: { t: "Il Solare", s: "Il Disco Solare", q: "Il disordine mi annoia. Io splendo per natura.", p: "Pratica 'Nulla di troppo'. L'atarassia è il tuo scudo." }, PA: { t: "Il Saettatore", s: "L'Arco d'argento", q: "Il mio arco non manca mai.", p: "Componi opere che critichino la superficialità moderna." }, PP: { t: "L'Elegiaco", s: "Il Ramo di Alloro", q: "Tutto ciò che è bello è destinato a svanire.", p: "Abbraccia la malinconia. Trasformala in elegia." } },
  "Zeus": { TA: { t: "Polieus — Il Costruttore", s: "Lo Scettro", q: "Abbandona il caos e impara a governare te stesso.", p: "Mantieni le promesse. Usa l'intelletto per fondare." }, TP: { t: "Olimpio — Il Distaccato", s: "Il Trono", q: "Io guardo le nuvole scorrere, sapendo che l'ordine non muta.", p: "Osserva dall'alto. Non scinderti nelle meschinità." }, PA: { t: "Ceraunio — Il Tonante", s: "La Folgore", q: "Se non capiscono con la logica, capiranno con la folgore.", p: "Smascherare l'ignoranza è il tuo compito." }, PP: { t: "Moiragete — La Guida", s: "La Bilancia", q: "Anche il re degli dèi deve inchinarsi al fato.", p: "Accetta ciò che non puoi cambiare con dignità stoica." } },
  // ... (Gli altri epiteti seguono la stessa struttura TA, TP, PA, PP per ogni divinità)
};
// Fallback epiteto generico per brevità
const getEpithet = (deityName, epKey) => (EPITHETS[deityName] && EPITHETS[deityName][epKey]) || { t: "Il Mistero", s: "?", q: "Ascolta il silenzio.", p: "Esplora la tua via." };

// ─── 90 DOMANDE OTTIMIZZATE (15 per asse) ────────────────────────────────────
const QUESTIONS_RAW = [
  // Asse 1: Oikos/Agora (15)
  {a:1,t:"Le interazioni sociali prolungate mi prosciugano, anche quando sono piacevoli."}, {a:1,t:"Ho bisogno di solitudine per ricaricarmi dopo una giornata intensa."}, {a:1,t:"Preferisco una cena con una persona di fiducia a una festa con molti conoscenti."}, {a:1,t:"Il silenzio non mi spaventa: è nutrimento per la mente."}, {a:1,t:"Studio o lavoro meglio in isolamento che in presenza di altri."}, {a:1,t:"Il mio spazio privato è quasi sacro: detesto che venga violato."}, {a:1,t:"Rivelo le mie passioni solo a chi ritengo davvero degno."}, {a:1,t:"Una giornata intera da solo non mi annoia: è realizzazione pura."}, {a:1,t:"Osservare gli altri dall'esterno mi appaga più che stare al centro."}, {a:1,t:"Preferisco elaborare i problemi in silenzio prima di parlarne."}, {a:1,t:"Tengo stretta la mia cerchia sociale: pochi, scelti, profondi."}, {a:1,t:"L'ispirazione mi assiste meglio nel ritiro che nel confronto vivace."}, {a:-1,t:"Sono energizzato dalla compagnia: più gente, più mi sento vivo."}, {a:-1,t:"Mi annoio rapidamente quando sono solo troppo a lungo."}, {a:-1,t:"Amo fare nuove conoscenze: ogni persona è un mondo da esplorare."},
  // Asse 2: Nous/Physis (15)
  {a:2,t:"Non mi basta la superficie: cerco sempre il significato nascosto delle cose."}, {a:2,t:"I fatti concreti mi annoiano se non celano una verità più profonda."}, {a:2,t:"Mi perdo nei simboli e nelle strutture invisibili prima ancora di godere l'aspetto sensibile."}, {a:2,t:"Capire perché qualcosa esiste mi interessa più del come si usa."}, {a:2,t:"Spesso mi distraggo dal presente proiettandomi in visioni di epoche lontane."}, {a:2,t:"Lo studio teorico puro mi attrae più della risoluzione di problemi pratici."}, {a:2,t:"Considero il regno delle idee superiore alla realtà tangibile."}, {a:2,t:"Cosmogonia e natura dell'anima mi appassionano più delle questioni materiali."}, {a:2,t:"La pura speculazione intellettuale mi basta."}, {a:2,t:"Le verità che cerco non si raggiungono con i sensi, ma con la mente elevata."}, {a:2,t:"Preferisco cogliere le grandi leggi di un sistema piuttosto che i dettagli."}, {a:2,t:"Collego discipline lontane nel tentativo di forgiare una teoria unificata."}, {a:-2,t:"Preferisco la concretezza: i dati misurabili mi danno più certezza."}, {a:-2,t:"Mi oriento meglio con esempi pratici e tangibili."}, {a:-2,t:"Il lavoro manuale o artigianale mi soddisfa quanto quello intellettuale."},
  // Asse 3: Logos/Sympatheia (15)
  {a:3,t:"Cerco la verità assoluta anche quando è scomoda da accettare."}, {a:3,t:"L'onestà tagliente è superiore all'adattare il giudizio per non ferire."}, {a:3,t:"Valuto le idee sulla loro struttura logica, non sulle simpatie personali."}, {a:3,t:"Preferisco essere confutato con argomenti solidi che incoraggiato per gentilezza."}, {a:3,t:"Diffido delle affermazioni basate solo sul 'sentire': la verità esige evidenza."}, {a:3,t:"In crisi, attivo la fredda analisi piuttosto che cedere all'emozione."}, {a:3,t:"Vengo visto come distaccato perché rifiuto il disordine emotivo."}, {a:3,t:"Applicare la regola mi appare più giusto che esaminare le scuse sentimentali."}, {a:3,t:"La mente forte domina le passioni tramite l'intelletto."}, {a:3,t:"Le manifestazioni emotive eccessive mi causano imbarazzo intellettuale."}, {a:3,t:"Le leggi dell'arte e del vivere civile devono fondarsi su principi universali."}, {a:3,t:"Giudico con gli stessi criteri un estraneo e la persona a me più cara."}, {a:-3,t:"L'empatia è la mia bussola principale nel prendere decisioni importanti."}, {a:-3,t:"Capire come si sente qualcuno mi importa almeno quanto capire se ha ragione."}, {a:-3,t:"Il contesto emotivo di una situazione cambia il giudizio che ne do."},
  // Asse 4: Chaos/Cosmos (15)
  {a:4,t:"Pianificare ogni tappa di un progetto mi sembra costruire la mia stessa prigione."}, {a:4,t:"Preferisco che la forma nasca spontaneamente lungo il percorso."}, {a:4,t:"Una routine ferrea è nemica di ogni autentica ispirazione."}, {a:4,t:"Evito gli impegni irrevocabili: tengo le opzioni aperte fino all'ultimo."}, {a:4,t:"Se mi impongono un metodo rigido, il mio istinto è aggirarlo."}, {a:4,t:"Lavoro meglio sotto pressione, improvvisando all'ultimo minuto."}, {a:4,t:"Cercare di controllare gli eventi è uno sforzo vano e filosoficamente sbagliato."}, {a:4,t:"Cambiare argomento a metà percorso non mi spaventa se l'intuizione mi guida altrove."}, {a:4,t:"Un imprevisto che sconvolge i piani mi dà sollievo: è un'opportunità."}, {a:4,t:"Le mie migliori opere nascono dal caos ispirato, non dalla pianificazione."}, {a:4,t:"Iniziare qualcosa di nuovo mi entusiasma più che finire ciò che ho già cominciato."}, {a:4,t:"Avere opere in sospeso sparpagliate ovunque non mi angoscia: è fermento."}, {a:-4,t:"Senza un piano chiaro mi sento a disagio e perdo efficacia."}, {a:-4,t:"Le liste, le scadenze e le strutture mi liberano più che opprimermi."}, {a:-4,t:"Preferisco portare a termine ciò che ho iniziato prima di aprire nuovi fronti."},
  // Asse 5: Pathos/Atarassia (15)
  {a:5,t:"La decadenza del mondo mi ferisce come un'offesa personale."}, {a:5,t:"La malinconia per ciò che è perduto mi mantiene connesso al sacro."}, {a:5,t:"Il dolore del cosmo mi attraversa: non riesco a tenerlo a distanza."}, {a:5,t:"L'arte che mi eleva è quella che trasuda tensione tragica, non serenità."}, {a:5,t:"Un peso esistenziale sotterraneo mi impedisce di scivolare nella leggerezza."}, {a:5,t:"Corazzare il cuore per non soffrire significa inaridire il genio."}, {a:5,t:"La mia vita interiore oscilla tra picchi estatici e abissi di sconforto."}, {a:5,t:"Creare è sempre un travaglio dell'anima, mai una pacifica esecuzione."}, {a:5,t:"Anche nelle scelte logiche, un fremito emotivo di fondo non si spegne mai."}, {a:5,t:"La vera saggezza nasce dal Pathei Mathos: conoscenza attraverso il dolore."}, {a:5,t:"Preferisco la placida osservazione delle cose al coinvolgimento emotivo intenso."}, {a:5,t:"L'imperturbabilità è per me un valore, non una forma di freddezza."}, {a:-5,t:"Riesco a distanziarmi dalle mie emozioni quando serve, senza sentirmi diminuito."}, {a:-5,t:"Preferisco la stabilità interiore all'intensità emotiva, anche a costo di perdere."}, {a:-5,t:"Il declino del mondo mi rattrista, ma non mi destabilizza: osservo e accetto."},
  // Asse 6: Praxis/Theoria (15)
  {a:6,t:"Di fronte alla decadenza, scendo in campo per forgiare qualcosa che la contrasti."}, {a:6,t:"Devo tradurre ogni pensiero in azione concreta: la sola contemplazione non mi basta."}, {a:6,t:"Il senso della mia vita è lasciare un'impronta attraverso l'attività creatrice."}, {a:6,t:"Davanti a un'ingiustizia, il mio spirito assume subito un assetto battagliero."}, {a:6,t:"La vera virtù si esprime trasformando e correggendo il mondo, non ritirandosi."}, {a:6,t:"Chi dice 'le cose andranno come devono andare' mi irrita profondamente."}, {a:6,t:"Impugno le armi dell'intelletto per difendere il mio mondo ideale fino all'ultimo."}, {a:6,t:"Anche se la mia azione non cambierà le masse, il gesto di insorgere ha valore."}, {a:6,t:"La solitudine è il laboratorio in cui combatto e realizzo i miei progetti."}, {a:6,t:"Essere un artefice infaticabile è il sommo onore, superiore a ogni contemplazione."}, {a:6,t:"Trovo pace nell'osservazione profonda più che nell'azione continua."}, {a:6,t:"Contemplare un'idea a lungo prima di agire mi sembra saggio, non pigro."}, {a:-6,t:"L'esperienza interiore ha un valore in sé, indipendentemente da ciò che produce."}, {a:-6,t:"Preferisco capire bene prima di intervenire, anche se questo significa perdere tempo."}, {a:-6,t:"La riflessione silenziosa può cambiare il mondo quanto l'azione diretta."},
];
const QUESTIONS = QUESTIONS_RAW.map((q, i) => ({ id: i + 1, ...q }));

// ─── DATABASE & NETLIFY MANAGER ──────────────────────────────────────────────
const ADMIN_CREDENTIALS = { email: "admin@oracolo.delphi", password: "Delphi2024!Oracle" };

const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("oracle_users") || "{}"),
  saveUsers: (u) => localStorage.setItem("oracle_users", JSON.stringify(u)),
  getResults: (userId) => JSON.parse(localStorage.getItem(`oracle_results_${userId}`) || "[]"),
  saveResult: (userId, result) => {
    const arr = DB.getResults(userId);
    arr.unshift(result);
    localStorage.setItem(`oracle_results_${userId}`, JSON.stringify(arr.slice(0, 20)));
  },
  getAllResults: () => JSON.parse(localStorage.getItem("oracle_all_results") || "[]"),
  saveAllResults: (results) => localStorage.setItem("oracle_all_results", JSON.stringify(results)),
  getDraft: (userId) => JSON.parse(localStorage.getItem(`oracle_draft_${userId}`) || "null"),
  saveDraft: (userId, draft) => localStorage.setItem(`oracle_draft_${userId}`, JSON.stringify(draft)),
  clearDraft: (userId) => localStorage.removeItem(`oracle_draft_${userId}`),
  
  async submitToNetlify(data) {
    try {
      // Configurazione per Netlify Forms (aggiungi data-netlify="true" al form nell'HTML)
      const formBody = new FormData();
      formBody.append("form-name", "oracle-results");
      formBody.append("name", data.userName);
      formBody.append("surname", data.userSurname);
      formBody.append("email", data.userEmail);
      formBody.append("deity", data.deity.name);
      formBody.append("epithet", data.ep.t);
      formBody.append("date", data.date);
      
      await fetch("/", { method: "POST", body: formBody });
      console.log("Inviato a Netlify Forms");
      return true;
    } catch (error) {
      console.warn("Netlify submit skipped (expected in dev):", error);
      return false;
    }
  },
};

// ─── COMPONENTI GRAFICI ──────────────────────────────────────────────────────
function RadarChart({ data, size = 280, accentColor = T.gold }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const labels = ["Oikos/Agorà", "Nous/Physis", "Logos/Sympath.", "Chaos/Cosmos", "Pathos/Atarassia", "Praxis/Theoria"];
  const n = labels.length;
  const pts = data.map((v, i) => { const angle = (Math.PI * 2 * i) / n - Math.PI / 2; return { x: cx + r * (v / 100) * Math.cos(angle), y: cy + r * (v / 100) * Math.sin(angle) }; });
  const gridPts = (scale) => labels.map((_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`; });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((s) => <polygon key={s} points={gridPts(s).join(" ")} fill="none" stroke={accentColor} strokeWidth="1" opacity={s === 1 ? 0.4 : 0.2} />)}
      {labels.map((_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke={accentColor} strokeWidth="1" opacity="0.3" />; })}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill={accentColor} fillOpacity="0.2" stroke={accentColor} strokeWidth="2.5" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={accentColor} stroke={T.obsidian} strokeWidth="1.5" />)}
      {labels.map((l, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return <text key={i} x={cx + (r + 26) * Math.cos(a)} y={cy + (r + 26) * Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill={T.parchment} fontFamily="Georgia, serif" fontWeight="600" opacity="0.85">{l}</text>; })}
    </svg>
  );
}

function StarProfile({ axes, accentColor = T.gold }) {
  const axesDefs = [{ id: 1, left: "Oikos", right: "Agorà" }, { id: 2, left: "Nous", right: "Physis" }, { id: 3, left: "Logos", right: "Sympath." }, { id: 4, left: "Chaos", right: "Cosmos" }, { id: 5, left: "Pathos", right: "Atarassia" }, { id: 6, left: "Praxis", right: "Theoria" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {axesDefs.map((ax) => {
        const pct = axes[ax.id], leftDom = pct > 50;
        return (
          <div key={ax.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, fontFamily: "Georgia, serif" }}>
              <span style={{ color: leftDom ? accentColor : T.stone, fontWeight: leftDom ? 700 : 400 }}>{pct}% {ax.left}</span>
              <span style={{ color: !leftDom ? accentColor : T.stone, fontWeight: !leftDom ? 700 : 400 }}>{ax.right} {100 - pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: T.ash, display: "flex", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, background: leftDom ? accentColor : T.ash, transition: "width 1.2s ease", borderRight: "2px solid " + T.obsidian }} />
              <div style={{ width: `${100 - pct}%`, background: !leftDom ? accentColor : T.ash, transition: "width 1.2s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LikertOption({ qId, val, selected, onChange, size, type }) {
  const dim = { 3: 46, 2: 36, 1: 28, 0: 22 }[size];
  const color = type === "agree" ? T.gold : type === "disagree" ? T.ember : T.stone;
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 0 }}>
      <input type="radio" name={`q${qId}`} value={val} checked={selected} onChange={() => onChange(qId, val)} style={{ display: "none" }} />
      <div style={{ width: dim, height: dim, borderRadius: "50%", border: `2px solid ${color}`, background: selected ? color : "transparent", transition: "all 0.18s", boxShadow: selected ? `0 0 14px ${color}88` : "none" }} />
    </label>
  );
}

function OracleQuote({ quote, deityName, accentColor, symbol }) {
  return (
    <div style={{ position: "relative", margin: "40px 0", padding: "48px 40px 36px", background: `linear-gradient(135deg, ${T.obsidian} 0%, ${T.obsidianLight} 100%)`, border: `1px solid ${accentColor}44`, borderLeft: `4px solid ${accentColor}`, borderRadius: "2px 12px 12px 2px", boxShadow: `0 0 40px ${accentColor}22, inset 0 0 60px rgba(0,0,0,0.5)` }}>
      <div style={{ position: "absolute", top: 0, left: 40, right: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)` }} />
      <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", background: T.obsidian, padding: "4px 20px", border: `1px solid ${accentColor}66`, borderRadius: 4, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: accentColor, fontFamily: "Georgia, serif" }}>{symbol}</div>
      <div style={{ position: "absolute", top: 16, left: 24, fontSize: 72, color: accentColor, opacity: 0.15, fontFamily: "Georgia, serif", lineHeight: 1 }}>"</div>
      <p style={{ fontSize: "clamp(1.05rem,2.5vw,1.3rem)", fontStyle: "italic", lineHeight: 1.8, color: T.parchment, margin: 0, textAlign: "center", position: "relative", zIndex: 1, textShadow: `0 0 30px ${accentColor}44` }}>{quote}</p>
      <div style={{ marginTop: 20, textAlign: "right", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: accentColor, opacity: 0.7, fontFamily: "Georgia, serif" }}>— {deityName}</div>
      <div style={{ position: "absolute", bottom: 0, left: 40, right: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}44, transparent)` }} />
    </div>
  );
}

function InfoTile({ label, value, accentColor }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px 18px", borderRadius: 4, border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${accentColor}66` }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: accentColor, marginBottom: 6, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#DDD0AC" }}>{value}</div>
    </div>
  );
}

// ─── STILI ────────────────────────────────────────────────────────────────────
const inputStyle = { padding: "12px 16px", borderRadius: 4, border: `1px solid ${T.ash}`, fontSize: 15, fontFamily: "Georgia, serif", outline: "none", width: "100%", background: "rgba(255,255,255,0.04)", color: T.parchment, transition: "border-color .2s" };
const btnGold = { background: `linear-gradient(135deg, ${T.goldDim}, ${T.gold})`, color: T.obsidian, border: "none", borderRadius: 3, padding: "0 36px", height: 50, fontSize: "clamp(13px,2vw,14px)", fontFamily: "Georgia, serif", fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: `0 4px 20px ${T.gold}33`, transition: "all .2s" };
const btnGhost = { background: "transparent", color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 3, padding: "0 28px", height: 50, fontSize: "clamp(13px,2vw,14px)", fontFamily: "Georgia, serif", fontWeight: 400, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", transition: "all .2s" };
const btnFade = { background: "transparent", color: T.stone, border: `1px solid ${T.ash}`, borderRadius: 3, padding: "0 24px", height: 46, fontSize: "clamp(12px,2vw,13px)", fontFamily: "Georgia, serif", fontWeight: 400, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", transition: "all .2s" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("it");
  const t = LANGS[lang].ui;
  
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", surname: "" });
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
  const [adminView, setAdminView] = useState(false);
  const [allResults, setAllResults] = useState([]);

  // Auto-save draft
  useEffect(() => {
    if (screen === "quiz" && currentUser) {
      DB.saveDraft(currentUser.id, { responses, page });
    }
  }, [responses, page, screen, currentUser]);

  // Load draft on mount
  useEffect(() => {
    if (currentUser && screen === "start") {
      const draft = DB.getDraft(currentUser.id);
      if (draft && Object.keys(draft.responses).length > 0) {
        // Draft exists, user can choose to resume
      }
    }
  }, [currentUser, screen]);

  useEffect(() => { if (screen === "result") setTimeout(() => setBarsVisible(true), 400); }, [screen]);

  const currentQs = QUESTIONS.slice(page * QPerPage, (page + 1) * QPerPage);
  const answered = Object.keys(responses).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);
  const timeEstMin = Math.ceil((QUESTIONS.length - answered) * 0.25); // ~15 sec per question

  const handleAuth = () => {
    setAuthError("");
    if (authForm.email === ADMIN_CREDENTIALS.email && authForm.password === ADMIN_CREDENTIALS.password) {
      setAdminView(true); setScreen("admin"); setAllResults(DB.getAllResults()); return;
    }
    const users = DB.getUsers();
    if (authMode === "register") {
      if (!authForm.name.trim()) return setAuthError(t.name + " richiesto.");
      if (!authForm.email.includes("@")) return setAuthError("Email non valida.");
      if (authForm.password.length < 6) return setAuthError("Password: min 6 caratteri.");
      if (users[authForm.email]) return setAuthError("Email già registrata.");
      const user = { id: Math.random().toString(36).slice(2, 10), name: authForm.name.trim(), surname: authForm.surname?.trim() || "", email: authForm.email };
      users[authForm.email] = { ...user, pw: authForm.password };
      DB.saveUsers(users); setCurrentUser(user); setScreen("start");
    } else {
      const u = users[authForm.email];
      if (!u || u.pw !== authForm.password) return setAuthError("Credenziali errate.");
      setCurrentUser({ id: u.id, name: u.name, surname: u.surname || "", email: u.email }); setScreen("start");
    }
  };

  const saveAnswer = (qId, val) => setResponses((r) => ({ ...r, [qId]: parseInt(val) }));
  
  const startQuiz = () => { setResponses({}); setPage(0); setBarsVisible(false); setFeedbackSent(false); setFeedback({ rating: 0, note: "" }); DB.clearDraft(currentUser.id); setScreen("quiz"); };
  
  const resumeQuiz = () => {
    const draft = DB.getDraft(currentUser.id);
    if (draft) { setResponses(draft.responses); setPage(draft.page); setBarsVisible(false); setScreen("quiz"); }
  };

  const nextPage = () => {
    const start = page * QPerPage, end = Math.min(start + QPerPage, QUESTIONS.length);
    for (let i = start; i < end; i++) if (responses[QUESTIONS[i].id] === undefined) { alert("Rispondi a tutte le affermazioni."); return; }
    if (page < totalPages - 1) { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else processResults();
  };

  const prevPage = () => { if (page > 0) { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const processResults = () => {
    const start = page * QPerPage, end = Math.min(start + QPerPage, QUESTIONS.length);
    for (let i = start; i < end; i++) if (responses[QUESTIONS[i].id] === undefined) { alert("Rispondi a tutte."); return; }
    setScreen("loading"); setTimeout(calculateAndShow, 3000 + Math.random() * 2000);
  };

  const calculateAndShow = () => {
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    QUESTIONS.forEach((q) => { scores[q.a] += (responses[q.id] || 0); counts[Math.abs(q.a)]++; });
    const resolve = (s, pos, neg) => s > 0 ? pos : s < 0 ? neg : Math.random() > 0.5 ? pos : neg;
    const pol1 = resolve(scores[1], "Oikos", "Agora"), pol2 = resolve(scores[2], "Nous", "Physis");
    const pol3 = resolve(scores[3], "Logos", "Sympatheia"), pol4 = resolve(scores[4], "Chaos", "Cosmos");
    const pol5 = resolve(scores[5], "Pathos", "Tranquillita"), pol6 = resolve(scores[6], "Attivo", "Passivo");
    const deityKey = `${pol1}-${pol2}-${pol3}-${pol4}`;
    const deity = DEITIES[deityKey] || DEITIES["Oikos-Nous-Logos-Cosmos"];
    const epKey = (pol5 === "Pathos" ? "P" : "T") + (pol6 === "Attivo" ? "A" : "P");
    const ep = getEpithet(deity.name, epKey);
    const axes = {};
    for (let ax = 1; ax <= 6; ax++) { const maxScore = counts[ax] * 3; axes[ax] = Math.round(((scores[ax] + maxScore) / (maxScore * 2)) * 100); }
    
    const r = { id: Math.random().toString(36).slice(2, 10), date: new Date().toISOString(), deity, ep, axes, deityKey, epKey, scores, userName: currentUser?.name || "", userSurname: currentUser?.surname || "", userEmail: currentUser?.email || "" };
    DB.saveResult(currentUser.id, r);
    const all = DB.getAllResults(); all.unshift(r); DB.saveAllResults(all);
    DB.submitToNetlify(r);
    DB.clearDraft(currentUser.id);
    setResult(r); setScreen("result"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendFeedback = () => {
    const results = DB.getResults(currentUser.id);
    if (results.length && result) { results[0].feedback = { rating: feedback.rating, note: feedback.note }; localStorage.setItem(`oracle_results_${currentUser.id}`, JSON.stringify(results)); }
    setFeedbackSent(true);
  };

  const loadHistory = () => { setHistory(DB.getResults(currentUser?.id || "")); setScreen("history"); };
  const logout = () => { setCurrentUser(null); setAdminView(false); setScreen("auth"); setAuthForm({ email: "", password: "", name: "", surname: "" }); };

  return (
    <div style={{ minHeight: "100vh", background: T.obsidian, fontFamily: "Georgia, serif", color: T.parchment }}>
      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} } @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:0.85} 92%{opacity:0.95} } @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} } * { box-sizing: border-box; } input, textarea { font-family: Georgia, serif !important; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${T.obsidian}; } ::-webkit-scrollbar-thumb { background: ${T.ash}; border-radius: 3px; }`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, width: 3, height: "100vh", background: `linear-gradient(to bottom, transparent, ${T.gold}44, transparent)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: 3, height: "100vh", background: `linear-gradient(to bottom, transparent, ${T.gold}44, transparent)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}66, transparent)`, pointerEvents: "none", zIndex: 10 }} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 80px", position: "relative", zIndex: 1 }}>
        
        {/* Language Selector */}
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 20 }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "6px 12px", fontSize: 12, background: T.obsidianLight, color: T.gold, border: `1px solid ${T.gold}44` }}>
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>

        {/* ── AUTH ── */}
        {screen === "auth" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 72, color: T.gold, letterSpacing: 2, fontFamily: "Georgia, serif", lineHeight: 1, animation: "flicker 4s ease-in-out infinite", textShadow: `0 0 30px ${T.gold}88` }}>Ω</div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", color: T.parchment, margin: "14px 0 8px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 400 }}>L'Oracolo di Delfi</h1>
              <div style={{ width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin: "12px auto" }} />
              <p style={{ color: T.goldDim, fontSize: 14, fontStyle: "italic", letterSpacing: 1 }}>Γνῶθι σεαυτόν — Conosci te stesso</p>
            </div>
            <div style={{ background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`, borderRadius: 8, padding: "clamp(28px,4vw,44px)", width: "100%", maxWidth: 420, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 80px ${T.gold}11`, border: `1px solid ${T.gold}33` }}>
              <div style={{ display: "flex", marginBottom: 28, borderBottom: `1px solid ${T.ash}` }}>
                {["login", "register"].map((m) => (
                  <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: authMode === m ? `2px solid ${T.gold}` : "2px solid transparent", marginBottom: -1, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", color: authMode === m ? T.gold : T.stone, fontWeight: authMode === m ? 700 : 400, transition: "all .2s", letterSpacing: 1, textTransform: "uppercase" }}>{t[m]}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {authMode === "register" && (<>
                  <input placeholder={t.name} value={authForm.name} onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  <input placeholder={t.surname} value={authForm.surname} onChange={(e) => setAuthForm((f) => ({ ...f, surname: e.target.value }))} style={inputStyle} />
                </>)}
                <input placeholder={t.email} type="email" value={authForm.email} onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
                <input placeholder={t.password} type="password" value={authForm.password} onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleAuth()} style={inputStyle} />
                {authError && <div style={{ color: "#C47A7A", fontSize: 13, textAlign: "center", fontStyle: "italic" }}>{authError}</div>}
                <button onClick={handleAuth} style={btnGold}>{authMode === "login" ? t.login : t.register}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN PANEL ── */}
        {screen === "admin" && adminView && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: "clamp(1.3rem,4vw,2rem)", margin: 0, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: T.parchment }}>{t.admin}</h2>
              <button onClick={logout} style={btnFade}>← {t.logout}</button>
            </div>
            {allResults.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: T.stone, fontStyle: "italic" }}>Nessun risultato raccolto.</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allResults.map((r, i) => {
                  const acc = r.deity.accentColor || T.gold;
                  return (
                    <div key={r.id || i} style={{ background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`, borderRadius: 8, padding: "20px 24px", border: `1px solid ${T.ash}`, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ width: 60, height: 60, borderRadius: 4, overflow: "hidden", border: `1px solid ${acc}44`, flexShrink: 0, background: T.ash }}>
                        <DeityImage name={r.deity.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 700, color: acc }}>{r.deity.name}</div>
                        <div style={{ fontSize: 13, color: T.parchmentDark, fontStyle: "italic", marginBottom: 4 }}>{r.ep?.t}</div>
                        <div style={{ fontSize: 12, color: T.stone }}><strong>Utente:</strong> {r.userName} {r.userSurname} ({r.userEmail})</div>
                        <div style={{ fontSize: 11, color: T.fog, marginTop: 4 }}>{new Date(r.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── START ─ */}
        {screen === "start" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 0 }}>
            <div style={{ fontSize: 80, color: T.gold, animation: "flicker 5s ease-in-out infinite", textShadow: `0 0 40px ${T.gold}88` }}>Ω</div>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", margin: "16px 0 8px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 400, color: T.parchment }}>L'Oracolo di Delfi</h1>
            <div style={{ width: 200, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, margin: "16px auto 24px" }} />
            <p style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", color: T.parchmentDark, lineHeight: 1.9, maxWidth: 520, marginBottom: 20 }}>
              Benvenuto, <span style={{ color: T.gold, fontStyle: "italic" }}>{currentUser?.name}</span>. <br />
              {QUESTIONS.length} affermazioni attendono la tua risposta. <br />
              <span style={{ color: T.stone, fontSize: "0.9em" }}>Rispondi d'istinto, guidato dal tuo Daimon interiore.</span>
            </p>
            <div style={{ fontSize: 14, color: T.goldDim, marginBottom: 32, fontStyle: "italic" }}>
              ⏱ {t.timeEst}: ~{Math.ceil(QUESTIONS.length * 0.25)} min
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {DB.getDraft(currentUser?.id) && Object.keys(DB.getDraft(currentUser?.id).responses || {}).length > 0 && (
                <button onClick={resumeQuiz} style={{ ...btnGhost, borderColor: T.agree, color: T.agree }}>↺ {t.resume}</button>
              )}
              <button onClick={startQuiz} style={btnGold}>{t.start}</button>
              <button onClick={loadHistory} style={btnGhost}>{t.history}</button>
              <button onClick={logout} style={btnFade}>{t.logout}</button>
            </div>
          </div>
        )}

        {/* ── PROGRESS BAR ── */}
        {screen === "quiz" && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000, background: `${T.obsidian}F0`, backdropFilter: "blur(8px)", padding: "10px 0 8px", borderBottom: `1px solid ${T.ash}` }}>
            <div style={{ textAlign: "center", fontSize: 12, fontFamily: "Georgia, serif", color: T.goldDim, marginBottom: 6, letterSpacing: 1 }}>
              {progress}% · Pagina {page + 1} di {totalPages} {timeEstMin > 0 && `· ~${timeEstMin} min rimasti`}
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
                <div key={q.id} style={{ background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`, borderRadius: 8, padding: "clamp(20px,4vw,32px)", marginBottom: 16, boxShadow: `0 4px 20px rgba(0,0,0,0.5)`, border: `1px solid ${sel !== undefined ? T.gold + "44" : T.ash}`, transition: "border-color .3s" }}>
                  <div style={{ fontSize: "clamp(0.95rem,2.5vw,1.1rem)", fontWeight: 400, marginBottom: 24, lineHeight: 1.65, color: T.parchment }}>
                    <span style={{ color: T.goldDim, marginRight: 8, fontSize: "0.85em", letterSpacing: 1 }}>{q.id}.</span>{q.t}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "clamp(6px,2vw,14px)" }}>
                    {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
                      <LikertOption key={v} qId={q.id} val={v} selected={sel === v} onChange={saveAnswer} size={Math.abs(v)} type={v < 0 ? "disagree" : v > 0 ? "agree" : "neutral"} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: T.stone, letterSpacing: 1, textTransform: "uppercase" }}>
                    <span style={{ color: T.ember + "CC" }}>Disaccordo</span>
                    <span style={{ color: T.gold + "CC" }}>Accordo</span>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {page > 0 && <button onClick={prevPage} style={btnGhost}>← {t.back}</button>}
              <button onClick={nextPage} style={{ ...btnGold, minWidth: 240 }}>{page < totalPages - 1 ? `${t.next} →` : t.reveal}</button>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {screen === "loading" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 28 }}>
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <div style={{ position: "absolute", inset: 0, border: `2px solid ${T.gold}44`, borderRadius: "50%", animation: "spin 8s linear infinite" }} />
              <div style={{ position: "absolute", inset: 8, border: `1px solid ${T.gold}33`, borderRadius: "50%", animation: "spin 5s linear infinite reverse" }} />
              <div style={{ position: "absolute", inset: 16, border: `2px solid ${T.gold}66`, borderRadius: "50%", animation: "spin 3s linear infinite" }} />
              <div style={{ position: "absolute", inset: "50%", transform: "translate(-50%,-50%)", fontSize: 28, color: T.gold, animation: "flicker 2s ease-in-out infinite" }}>Ω</div>
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", color: T.parchment, fontWeight: 400, letterSpacing: 2 }}>Consultando l'Oracolo…</h2>
            <p style={{ fontStyle: "italic", color: T.stone, fontSize: 15, letterSpacing: 0.5 }}>La Pizia è in trance. Attendi la parola degli dèi.</p>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "result" && result && (() => {
          const acc = result.deity.accentColor || T.gold;
          return (
            <div style={{ paddingTop: 40, animation: "fadeInUp 0.8s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 0, position: "relative" }}>
                <div style={{ fontSize: 11, color: acc, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, opacity: 0.8 }}>L'Oracolo ha parlato</div>
                <h1 style={{ fontSize: "clamp(3.5rem,10vw,6rem)", color: acc, margin: "0 0 4px", letterSpacing: 4, fontWeight: 400, textTransform: "uppercase", textShadow: `0 0 60px ${acc}66, 0 2px 4px rgba(0,0,0,0.8)`, lineHeight: 1 }}>{result.deity.name}</h1>
                <div style={{ width: 200, height: 1, background: `linear-gradient(90deg, transparent, ${acc}, transparent)`, margin: "16px auto" }} />
                <h2 style={{ fontSize: "clamp(1rem,3vw,1.5rem)", color: T.parchmentDark, margin: "0 0 4px", fontStyle: "italic", fontWeight: 400 }}>{result.ep.t}</h2>
                <div style={{ fontSize: 13, color: acc, letterSpacing: 2, opacity: 0.7, marginBottom: 4 }}>{result.deity.epithetBase}</div>
              </div>

              <div style={{ borderRadius: 4, overflow: "hidden", margin: "28px 0 0", border: `1px solid ${acc}44`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 80px ${acc}22`, background: T.smoke, maxHeight: 420, position: "relative" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: `linear-gradient(to top, ${T.obsidian}, transparent)`, zIndex: 1, pointerEvents: "none" }} />
                <DeityImage name={result.deity.name} style={{ width: "100%", height: "100%", maxHeight: 420, objectFit: "cover", objectPosition: "center top", display: "block" }} />
              </div>

              <OracleQuote quote={result.ep.q} deityName={`${result.deity.name}, ${result.ep.t}`} accentColor={acc} symbol={result.ep.s} />

              <div style={{ background: `linear-gradient(160deg, ${T.obsidianLight} 0%, ${T.smoke} 100%)`, borderRadius: 8, padding: "clamp(24px,4vw,44px)", border: `1px solid ${T.ash}`, boxShadow: `0 8px 40px rgba(0,0,0,0.6)` }}>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: acc, marginBottom: 12, opacity: 0.7 }}>◈ Il tuo Archetipo Divino</div>
                  <p style={{ fontSize: "clamp(0.95rem,2vw,1.1rem)", lineHeight: 1.9, color: T.parchmentDark, margin: 0 }}>{result.deity.desc}</p>
                </div>
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${acc}33, transparent)`, margin: "32px 0" }} />
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: acc, marginBottom: 12, opacity: 0.7 }}>◈ La Via Oracolare</div>
                  <p style={{ fontSize: "clamp(0.9rem,1.8vw,1.05rem)", lineHeight: 1.85, color: T.parchmentDark, margin: 0 }}>{result.ep.p}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 32 }}>
                  <InfoTile label="Animale Sacro" value={result.deity.animal} accentColor={acc} />
                  <InfoTile label="Il tuo Simbolo" value={result.ep.s} accentColor={acc} />
                  <InfoTile label="Epiteto Divino" value={result.deity.epithetBase} accentColor={acc} />
                </div>
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${acc}33, transparent)`, margin: "0 0 36px" }} />
                <h3 style={{ textAlign: "center", fontSize: "clamp(1.1rem,2.5vw,1.5rem)", marginBottom: 32, letterSpacing: 2, textTransform: "uppercase", fontWeight: 400, color: T.parchment }}>L'Architettura della tua Anima</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: T.stone, letterSpacing: 2, textTransform: "uppercase" }}>Mappa Stellare</div>
                    <RadarChart data={[1, 2, 3, 4, 5, 6].map((ax) => result.axes[ax])} size={Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 400) - 80)} accentColor={acc} />
                  </div>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 10, color: T.stone, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Polarità degli Assi</div>
                    {barsVisible && <StarProfile axes={result.axes} accentColor={acc} />}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", margin: "40px 0", color: acc, opacity: 0.4, letterSpacing: 8, fontSize: 12 }}>◆ ◆ ◆</div>

              <div style={{ background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`, borderRadius: 8, padding: "clamp(20px,4vw,36px)", border: `1px solid ${T.ash}` }}>
                {!feedbackSent ? (
                  <div>
                    <h3 style={{ fontSize: "clamp(1rem,2.5vw,1.3rem)", marginBottom: 16, textAlign: "center", fontWeight: 400, letterSpacing: 1, color: T.parchment }}>Il tuo Giudizio sull'Oracolo</h3>
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                      {[1, 2, 3, 4, 5].map((s) => (<button key={s} onClick={() => setFeedback((f) => ({ ...f, rating: s }))} style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: s <= feedback.rating ? T.gold : T.ash, transition: "color .15s" }}>★</button>))}
                    </div>
                    <textarea value={feedback.note} onChange={(e) => setFeedback((f) => ({ ...f, note: e.target.value }))} placeholder="Impressioni, risonanze, disaccordi con il verdetto…" rows={3} style={{ ...inputStyle, width: "100%", resize: "vertical" }} />
                    <button onClick={sendFeedback} style={{ ...btnGold, marginTop: 14, display: "block", margin: "14px auto 0" }}>Consegna al Tempio</button>
                  </div>
                ) : <p style={{ textAlign: "center", color: T.gold, fontStyle: "italic", opacity: 0.8 }}>✦ Il tuo giudizio è stato consegnato agli dèi.</p>}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
                <button onClick={() => setScreen("start")} style={btnGold}>Torna all'Inizio</button>
                <button onClick={startQuiz} style={btnGhost}>Ripeti il Test</button>
                <button onClick={loadHistory} style={btnFade}>{t.history}</button>
              </div>
            </div>
          );
        })()}

        {/* ── HISTORY ─ */}
        {screen === "history" && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: "clamp(1.3rem,4vw,2rem)", margin: 0, fontWeight: 400, letterSpacing: 2, textTransform: "uppercase", color: T.parchment }}>{t.history}</h2>
              <button onClick={() => setScreen("start")} style={btnFade}>← {t.back}</button>
            </div>
            {history.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: T.stone, fontStyle: "italic" }}>Nessun oracolo consultato ancora.</div> : history.map((h, i) => {
              const acc = h.deity.accentColor || T.gold;
              return (
                <div key={h.id || i} style={{ background: `linear-gradient(160deg, ${T.obsidianLight}, ${T.smoke})`, borderRadius: 8, padding: "20px 24px", marginBottom: 12, border: `1px solid ${T.ash}`, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 4, overflow: "hidden", border: `1px solid ${acc}44`, flexShrink: 0, background: T.ash }}>
                    <DeityImage name={h.deity.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: "clamp(1rem,3vw,1.3rem)", fontWeight: 700, color: acc }}>{h.deity.name}</div>
                    <div style={{ fontSize: 13, color: T.parchmentDark, fontStyle: "italic", marginBottom: 4 }}>{h.ep?.t}</div>
                    <div style={{ fontSize: 11, color: T.stone, letterSpacing: 1 }}>{new Date(h.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</div>
                    {h.feedback && <div style={{ marginTop: 6, fontSize: 12, color: T.stone }}><span style={{ color: T.gold }}>{ "★ ".repeat(h.feedback.rating) }</span>{ "☆ ".repeat(5 - h.feedback.rating) }{h.feedback.note && <span style={{ marginLeft: 8, color: T.stone }}> "{h.feedback.note.slice(0, 60)}{h.feedback.note.length > 60 ? "…" : " "}"</span>}</div>}
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