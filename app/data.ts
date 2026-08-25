export type Category = "Place" | "Fabrication" | "Experience" | "Systems" | "Culture";

export type Project = {
  slug: string;
  title: string;
  year: string;
  eyebrow: string;
  descriptor?: [string, string];
  question: string;
  headline: string;
  summary: string;
  narrative: string;
  agency: string;
  role: string;
  outcome: string;
  image: string;
  artifactImage?: string;
  indexPill: string;
  categories: Category[];
  featured?: boolean;
  node: { x: number; y: number; size: number };
  metrics: string[];
  artifacts: string[];
  details: { title: string; body: string }[];
};

export type ConnectionKind = "handoff" | "cede" | "uphold" | "quorum" | "graft";

export type ProjectConnection = {
  from: string;
  to: string;
  kind: ConnectionKind;
  reason: string;
};

export const categories: ("All" | Category)[] = [
  "All",
  "Place",
  "Fabrication",
  "Experience",
  "Systems",
  "Culture",
];

export const projects: Project[] = [
  {
    slug: "charlesgate-park",
    title: "Charlesgate Park",
    year: "2019–20",
    eyebrow: "Public realm · Boston",
    question: "How do you repair a public space that was buried under a highway?",
    headline: "Archival evidence and point-cloud survey became the working geometry for a reparative park restoration.",
    summary: "The proposal recovered the buried course of the Muddy River and treated public testimony, ecological repair, and the highway itself as existing conditions—not background context.",
    narrative: "Charlesgate was once a connector in Boston’s park system. Urban Renewal put a highway through it, buried the Muddy River, and left a public landscape cut off from both its ecology and its history. The project began by refusing to treat the residual space under the road as a blank site. Archival plans were used to recover what had been displaced; point-cloud survey became a workable mesh of the highway; Grasshopper automated tree modeling and placement across a large, irregular landscape. Those technical models sat beside public hearings, agency coordination, maintenance planning, and a phased approach to reuse. Daylighting the river was both ecological infrastructure and a way to make the site’s loss legible. The accountable parties stayed visible throughout: the public shaped the brief, agencies held the long-term maintenance burden, and the design team translated that record into a sequence that could actually be delivered.",
    agency: "The model organized evidence and geometry; community stakeholders and city agencies retained the final say over what repair meant and how it would be maintained.",
    role: "Architectural designer · computational site modeling",
    outcome: "A phased restoration proposal grounded in archival research, survey geometry, public hearings, and maintenance planning.",
    image: "/work/charlesgate.jpg",
    indexPill: "a state, a city, and a community walk into a park",
    categories: ["Place", "Culture"],
    featured: true,
    node: { x: 25.3, y: 43.5, size: 32 },
    metrics: ["Point-cloud survey → highway mesh", "Grasshopper-automated tree placement", "Phased public-realm delivery"],
    artifacts: ["Historical river overlays", "Point-cloud / mesh comparison", "Public-hearing and phasing diagrams"],
    details: [
      { title: "Recover the record", body: "Historical plans and environmental research located the culverted river and made the site’s political history part of the design brief." },
      { title: "Build the site model", body: "Survey point clouds, a meshified highway, and automated tree placement turned an infrastructurally difficult site into geometry the team could reason with." },
      { title: "Return it in phases", body: "Public input, ecological repair, maintenance, and incremental access were coordinated as one delivery sequence rather than separate promises." },
    ],
  },
  {
    slug: "88-east-broadway",
    title: "88 East Broadway",
    year: "2023",
    eyebrow: "Adaptive reuse · New York",
    question: "How do you make a complicated envelope useful without pretending its constraints do not exist?",
    headline: "A roughly $5M reuse study reconciled zoning, licensing, structure, and digital-asset regulation in one operating proposal.",
    summary: "Historic plans and field conditions were cross-read against use restrictions, setbacks, competing-retail separation, and floor-area limits before the vision was packaged for filing and fundraising.",
    narrative: "The building sits beneath the Manhattan Bridge in a part of the city where almost every interesting idea collides with a different rule. The work was not a speculative image dropped into an empty shell. Existing structure, historic plans, school setbacks, competing-retail separation, licensing, digital-asset regulation, and floor-area ratio were tested against one another until the proposal had a credible operating envelope. That envelope supported a roughly $5M revitalization study combining food, gathering, work, and neighborhood uses. The project’s value was the translation: an open-ended ambition became a document an owner, regulator, investor, and design team could each interrogate from their own position. The study was used as input for DOB filing and fundraising, with every spatial move tied back to the evidence that made it possible.",
    agency: "The proposal surfaced viable options; the owner, regulators, and operators retained the final say over filing, capital, and use.",
    role: "Co-founder · business development · creative direction",
    outcome: "A regulatory and spatial reuse package used by the owner for DOB filing and fundraising.",
    image: "/work/88-east-broadway-main.webp",
    indexPill: "a delirious Chinatown building",
    categories: ["Place", "Culture"],
    node: { x: 36.7, y: 75.2, size: 28 },
    metrics: ["~$5M revitalization study", "Zoning + licensing + operating model", "Existing FAR verified"],
    artifacts: ["Historic-plan comparison", "Regulatory constraint matrix", "Filing and fundraising package"],
    details: [
      { title: "Find the envelope", body: "Structure, use, setbacks, licensing, and FAR were tested together so the concept began inside a defensible set of limits." },
      { title: "Reconcile the uses", body: "Food, gathering, work, and neighborhood programming were arranged as an operating model rather than a collage of possible tenants." },
      { title: "Package the argument", body: "The final document translated design intent into evidence legible to ownership, regulators, partners, and capital." },
    ],
  },
  {
    slug: "ouellette-bridge",
    title: "Ouellette Bridge",
    year: "2021",
    eyebrow: "Fabrication · Lowell",
    question: "How do you light a 19th-century landmark without touching it?",
    headline: "A reversible clamp-and-leg system let one local steel fabricator illuminate the country’s longest lenticular truss bridge.",
    summary: "Preservation rules prohibited drilling or welding, so the fabrication package had to carry the entire installation logic without modifying a single original component.",
    narrative: "Ouellette Bridge dates to the 1880s, remains fully functional, and is the longest lenticular truss bridge in the country. The lighting brief therefore came with one defining constraint: alter none of the original ironwork. Drilling and welding were ruled out. A family of reversible clamps and small legs instead supported custom light housings along the road barriers, casting warm light across the lattice without leaving a mark. The project was developed as a fabrication problem, not only a lighting concept. Details, dimensions, tolerances, cable paths, and repeatable parts were organized so a single local steel fabricator could build and install the system across five trusses and more than one hundred addressable lights. The drawings were the handoff: if they failed, the design failed in the field.",
    agency: "The drawing set defined a reversible system; the fabricator and preservation constraints governed every final attachment in the field.",
    role: "Architectural designer · fabrication-set author",
    outcome: "Five trusses and 100+ addressable lights installed with zero drilling or welding to original components.",
    image: "/work/ouellette.jpg",
    indexPill: "one fabricator, zero shortcuts",
    categories: ["Fabrication", "Place", "Experience"],
    node: { x: 46.2, y: 80.6, size: 26 },
    metrics: ["5 historic trusses", "100+ addressable lights", "0 original components modified"],
    artifacts: ["Clamp family and tolerance studies", "Fabrication sheets", "Installed night sequence"],
    details: [
      { title: "Respect the artifact", body: "The attachment logic preserved every original 1880s component and made reversibility a design requirement." },
      { title: "Draw the assembly", body: "Custom housings, clamps, legs, and cable routes became repeatable local parts rather than bespoke field improvisations." },
      { title: "Hand it to one maker", body: "The package was authored so a single local steel fabricator could understand, price, build, and install the full system." },
    ],
  },
  {
    slug: "flower-tower",
    title: "Flower Tower",
    year: "2021",
    eyebrow: "Public installation · Boston",
    question: "What should a monument to community actually provide?",
    headline: "A six-foot public monument was designed to disappear into 800+ flowers, seed packets, notes, and drawings over one weekend.",
    summary: "The competition-selected installation treated dismantling as participation: the public took resources away and authored what remained.",
    narrative: "Flower Tower was selected for the inPublic Festival in Downtown Crossing alongside work by more than sixty artists. It was a six-foot hollow cardboard structure perforated for 800+ cut stems and seed packets. Visitors could take a flower immediately, take seed home for later, and write or draw on the hand-mixed chalkboard surface revealed as the object emptied. By Monday the monument had been depleted and recycled. That disappearance was the project. Instead of asking the public to preserve a completed object, the work redistributed its material and authorship to the people around it. Built for roughly $400, it remains an early version of a question that now runs through the practice: how can a system increase someone’s capability without taking away their sense of authorship?",
    agency: "The structure set the conditions; the public decided how it changed, what left the site, and what remained on its surface.",
    role: "Grant writer · concept · construction · installation",
    outcome: "A competition-selected installation dismantled by the public and recycled after the festival.",
    image: "/work/flower-tower-single.jpg",
    indexPill: "a monument that disperses",
    categories: ["Fabrication", "Place", "Culture"],
    node: { x: 21.5, y: 38, size: 26 },
    metrics: ["800+ stems and seed packets", "6-foot cardboard structure", "~$400 material budget"],
    artifacts: ["Grant and competition submission", "Perforation / assembly logic", "Time-lapse of public depletion"],
    details: [
      { title: "Reverse permanence", body: "The object began with its end: every component anticipated removal, reuse, marking, or recycling." },
      { title: "Give something away", body: "Flowers and locally useful seed turned a monument from an image of civic value into a small distribution system." },
      { title: "Leave authorship open", body: "As the flowers disappeared, a writable surface emerged and the public completed the visual record." },
    ],
  },
  {
    slug: "caleta",
    title: "Caleta & Bad Habit",
    year: "2022–23",
    eyebrow: "Hospitality · New York",
    question: "How do you make a space for punk-rock ice cream?",
    headline: "A restaurant and scoop shop moved from concept through permitting, construction, inspection, and opening without sanding off its attitude.",
    summary: "Deep black finishes, silky plaster, mirrored bars, rated glass, and an ADA restroom disco ball held a deliberately subversive concept inside a code-compliant hospitality operation.",
    narrative: "Caleta & Bad Habit wanted the opposite of the clean white-tiled ice-cream parlor. The work translated that attitude into architecture and carried it through the full arc: concept, client review, permit drawings, construction, inspections, punch, and opening. Black finishes ran from the scooping counter into the lounge; silky plaster, exposed brick, mirrored bars, red light, warped grids, and a disco ball kept the room serious about atmosphere but not about itself. The harder design work sat behind the surfaces. Fire-rated walls had to separate the kitchen, while the experience depended on seeing the operation. Rated glass inserts preserved that sightline without weakening the code strategy. The role crossed 3D visualization, construction documents, fabricator coordination, city review, and field decisions. Design intent and fire/life safety pulled in different directions, and both had to win.",
    agency: "The design team held the concept; fabricators, code consultants, inspectors, and operators each kept control of the conditions they were accountable for.",
    role: "Business development · strategy · lead design · delivery",
    outcome: "A hospitality project delivered from schematic design through permitting, construction, and opening.",
    image: "/work/caleta-main-v2.webp",
    indexPill: "punk rock fully permitted",
    categories: ["Place", "Fabrication", "Culture"],
    featured: true,
    node: { x: 34.8, y: 56.5, size: 32 },
    metrics: ["Concept → permit → opening", "Rated kitchen separation", "ADA + fire/life safety coordination"],
    artifacts: ["Material and lighting studies", "Permit / construction set", "Rated-glass field detail"],
    details: [
      { title: "Translate attitude", body: "A black, reflective, red-lit palette rejected the expected genre without giving up hospitality or operational clarity." },
      { title: "Resolve the code", body: "Rated glass maintained the design-critical connection to the kitchen while satisfying fire separation." },
      { title: "Carry it through", body: "Modeling, drawings, fabricators, permits, inspections, and punch were treated as one continuous design responsibility." },
    ],
  },
  {
    slug: "wework-conversions",
    title: "WeWork Conversions",
    year: "2021–22",
    eyebrow: "Portfolio strategy · 900+ locations",
    question: "How do you scale design judgment without flattening every building into the same answer?",
    headline: "A Revit-driven analysis and operational playbook initiated 200+ higher-revenue conversions across a 900+ location portfolio.",
    summary: "Real-estate, product, leasing, and MEP data were combined into one decision surface, then translated into rules distributed teams could run without Patrick in the room.",
    narrative: "The assignment began as a portfolio problem: find locations where underperforming space could become a higher-revenue configuration without making the member experience worse. Data from real estate, product, leasing, engineering, and MEP was organized into a matrix across more than nine hundred locations. A custom Revit script flagged non-revenue space over-allocated relative to offices; the matrix identified where conversion was feasible; an operational playbook governed furniture, materials, finishes, electrical, ventilation, accessibility, and recurring building conditions. That sequence initiated more than two hundred conversions across offices ranging from two-person suites to 150-person floor plates. The playbook was the product. It let distributed teams make consistent decisions while preserving the cases that truly required local judgment, and it reduced the need to solve the same problem from zero in every building.",
    agency: "The analysis ranked opportunities and bounded repeatable decisions; local project teams retained judgment where building, code, or member conditions diverged.",
    role: "Spatial experience design lead · systems and playbook author",
    outcome: "200+ conversions initiated across a 900+ location portfolio, with repeatable delivery logic and no single universal layout.",
    image: "/work/wework.jpg",
    indexPill: "a playbook for 900 buildings",
    categories: ["Place", "Experience", "Systems"],
    node: { x: 69, y: 69.8, size: 27 },
    metrics: ["900+ locations analyzed", "200+ conversions initiated", "2–150 person floor plates"],
    artifacts: ["Portfolio opportunity matrix", "Custom Revit analysis", "Operational conversion playbook"],
    details: [
      { title: "See the portfolio", body: "Cross-department data made underperformance and viable conversion opportunities visible at the same scale." },
      { title: "Encode the repeatable", body: "Recurring MEP, material, accessibility, furniture, and amenity decisions became a system another team could own." },
      { title: "Protect the exception", body: "Standardization absorbed the common conditions so local judgment could focus on what was actually unique." },
    ],
  },
  {
    slug: "confidential-client",
    title: "Confidential Client",
    year: "2024–25",
    eyebrow: "Physical AI · New York",
    question: "How do you build a first-of-kind customer space while the storefront must stay alive?",
    headline: "A confidential client’s first customer-facing space enabled by physical AI was delivered alongside temporary activations running through active construction.",
    summary: "Discovery output became structured input for a trained image model—500+ visualizations narrowed to four decision-moving directions—while engineering, fabrication, landlord, and site work advanced in parallel.",
    narrative: "This confidential engagement delivered the client’s first customer-facing space enabled by physical AI anywhere in its global real-estate portfolio. There was no internal precedent for what the experience should be or how it should be delivered. Futures-workshop output was translated into structured input for a trained image model, producing more than five hundred visualizations. Four were curated because they moved the decision makers; the volume only mattered because a judgment layer made it useful. Meanwhile the permanent storefront was under active construction, and the brand could not disappear from the address. Temporary retail activations ran concurrently, each carrying its own fire/life-safety, landlord, creative, fabrication, and schedule requirements. The work therefore operated as two overlapping projects—one permanent, one disposable—held together by the same public promise.",
    agency: "The generative system expanded the option space; the project team curated four directions and remained accountable for the built experience and every site decision.",
    role: "Experiential project manager · AI strategy and technical coordination",
    outcome: "A first-of-kind enterprise physical-AI space advanced through construction without losing public presence at the site.",
    image: "/work/confidential-client.jpg",
    indexPill: "the enterprise’s first physical AI",
    categories: ["Experience", "Place", "Systems"],
    node: { x: 54.8, y: 61.5, size: 29 },
    metrics: ["500+ generated visualizations", "4 curated decision-moving images", "1st physical-AI customer space in portfolio"],
    artifacts: ["Workshop-to-prompt translation", "500→4 curation funnel", "Temporary / permanent delivery timeline"],
    details: [
      { title: "Structure the discovery", body: "Workshop language, references, and constraints became a repeatable input system rather than an open-ended image prompt." },
      { title: "Curate the useful four", body: "More than five hundred outputs were judged against the brief until four images could carry an actual stakeholder decision." },
      { title: "Run two sites at once", body: "Temporary activations maintained public presence while the permanent physical-AI storefront moved through active construction." },
    ],
  },
  {
    slug: "vanderbilt-passage",
    title: "Vanderbilt Passage",
    year: "2023–26",
    eyebrow: "Media architecture · 270 Park Avenue",
    question: "How do you make a real-time media system survive the last mile of a supertall?",
    headline: "Five hardware zones and fifteen generative modes landed inside a live enterprise headquarters as the final trade on site.",
    summary: "Unreal Engine, TouchDesigner, live data, generative audio, directional sound, custom playout, and a 150-year archive were coordinated as one permanent passage—not separate technical scopes.",
    narrative: "Vanderbilt Passage is a real-time media environment at the base of JPMorgan Chase’s new global headquarters. Five hardware zones run fifteen generative modes across Unreal Engine and TouchDesigner, with live data feeds, generative audio, directional sound, and a custom playout interface. A 150-year corporate archive was read and sorted into a working taxonomy so each mode had an intentional content language rather than a folder of available images. Some scenes exposed the mechanics of their particles; others used quiet local-time parallax. Live market APIs had to clear enterprise security review. The directional-audio workstream was the first the studio had attempted. The creative system was only half the problem: the team arrived downstream of the GC, electrical, AV, enclosure, finishes, and FF&E. Every upstream delay compressed commissioning. The installation still had to open as one calm, continuous experience rather than reveal the coordination stack underneath it.",
    agency: "The media system transformed approved data and archive content; operators retained a custom playout interface and the institution governed live feeds, security, and publication.",
    role: "Experiential project manager · media systems lead",
    outcome: "A permanent audiovisual passage delivered on schedule inside an active 1,388-foot enterprise headquarters.",
    image: "/work/vanderbilt.jpg",
    indexPill: "150-year archive, one multimodal generative experience",
    categories: ["Experience", "Systems", "Place"],
    featured: true,
    node: { x: 58.8, y: 46, size: 34 },
    metrics: ["5 hardware zones", "15 generative modes", "150-year archive taxonomy"],
    artifacts: ["Mode and content taxonomy", "Systems / commissioning map", "Directional-audio field study"],
    details: [
      { title: "Orchestrate the modes", body: "Live feeds, archive content, real-time engines, generative audio, and playout controls behaved as one operational media system." },
      { title: "Make complexity disappear", body: "Security, networks, speakers, hardware, content, enclosure, and maintenance were coordinated so the passage could feel calm." },
      { title: "Absorb the last mile", body: "As the final trade, the team took upstream schedule compression without passing that instability into the opening experience." },
    ],
  },
  {
    slug: "gymnast-cobot",
    title: "Gymnast CoBot",
    year: "2019–21",
    eyebrow: "Human–robot interaction · XD Lab",
    descriptor: ["Human–robot interaction", "XD Lab"],
    question: "How much agency should a robot have beside a tired worker?",
    headline: "A UR-10 projected its intent before moving and adjusted handover height and rhythm from live fatigue signals and worker preference.",
    summary: "The NSF-funded prototype combined biosignatures, gesture programming, projection, and physical adaptation so the robot supported the person without hiding its next move.",
    narrative: "The Gymnast CoBot explored collaborative automation in a physically demanding industrial setting. A biosignature pipeline combined heart rate and movement with worker attributes to estimate fatigue live. That estimate fed the UR-10’s handover height and rhythm, but it did not set a universal level of assistance. Workers selected how much support they wanted along a range, from strain reduction to something closer to exercise, and the robot micro-adjusted within that preference. Wristband-tracked arm gestures kept control hands-free. A projected interface cast the robot’s intended path and next action onto the work surface before it moved, making automation legible to the person beside it. Months of industry research—labor conditions, species trends, fishing grounds, and embodied carbon—preceded the interface. The system architecture, projection flow, and physical box had to be designed together because none of them could explain the robot alone.",
    agency: "The robot could adapt within a bounded support range; the worker set that range and could see the system’s intent before motion occurred.",
    role: "Research design engineer · HRI and interface design",
    outcome: "An NSF-funded live industrial prototype joining fatigue estimation, gesture control, projected intent, and worker-set assistance.",
    image: "/work/gallery/gymnast-cobot/03.webp",
    indexPill: "the robot asks first",
    categories: ["Experience", "Systems", "Fabrication"],
    featured: true,
    node: { x: 72.8, y: 59.5, size: 30 },
    metrics: ["NSF Award #1928654", "UR-10 live prototype", "Closed fatigue-to-adjustment loop"],
    artifacts: ["Fatigue-to-adjustment flowchart", "Gesture-programming studies", "Projected interface on physical box"],
    details: [
      { title: "Make intent legible", body: "Projection showed where the robot planned to move before that motion affected the worker beside it." },
      { title: "Close the loop", body: "Heart rate and movement informed micro-adjustments to height and rhythm inside a worker-selected support range." },
      { title: "Design the whole handoff", body: "Gestures, projection, system logic, industry research, and the physical UR-10 adaptation were developed as one interface." },
    ],
  },
  {
    slug: "mapping-investments",
    title: "Civic Investment Map",
    year: "2025–26",
    eyebrow: "Interactive research · Confidential client",
    question: "How do parcels become a navigable argument about why a place matters?",
    headline: "A 3D civic map translated thirteen sites, three eras, and ninety years of research into an investor-event experience.",
    summary: "MapLibre GL JS, terrain, building extrusions, custom WebGL layers, and a multi-phase site-selection state machine were directed through prompt contracts and iterative visual critique.",
    narrative: "A parcel map is data until it carries a reason for being navigated. This interactive 3D experience connected thirteen sites to three eras and ninety years of neighborhood history, revealing detail progressively as the viewer moved between place, time, and stewardship. The production stack combined MapLibre GL JS, OpenStreetMap building extrusions, AWS DEM terrain, custom WebGL animation layers, two programmatic cartographic systems, and a multi-phase site-selection state machine. The build was directed through structured AI-agent prompting: prompt contracts, regression guards, and iterative visual critique held the interface on-model across dozens of changes. That process resembled design direction more than code generation. The result shipped to a hard live-event deadline while maintaining one evidence chain from historical research to the interaction shown on screen.",
    agency: "AI agents accelerated implementation inside explicit prompt contracts; Patrick retained design direction, regression review, and responsibility for every public interaction.",
    role: "UX and interaction designer · AI-directed frontend builder",
    outcome: "A production 3D civic narrative delivered for a live investor event on a hard deadline.",
    image: "/work/gallery/mapping-investments/01.webp",
    artifactImage: "/work/mapping-investments.svg",
    indexPill: "history you can navigate",
    categories: ["Systems", "Place", "Culture"],
    node: { x: 61.4, y: 55.2, size: 26 },
    metrics: ["13 sites", "3 eras", "90 years of neighborhood history"],
    artifacts: ["Prompt contracts + regression guards", "Land-over-time state diagram", "Cartographic system comparison"],
    details: [
      { title: "Model the evidence", body: "Sites, eras, actors, terrain, and narrative sources became a spatial data structure rather than a linear report." },
      { title: "Direct the agents", body: "Prompt contracts and visual critique kept an AI-directed build stable across technical and aesthetic iteration." },
      { title: "Land the live moment", body: "Progressive disclosure and a constrained state machine made a dense historical argument navigable under event conditions." },
    ],
  },
  {
    slug: "release-intelligence",
    title: "Release Intelligence",
    year: "2026",
    eyebrow: "Tricky",
    descriptor: ["AI product", "Independent"],
    question: "How do you turn one release into five honest documents without rewriting it five times?",
    headline: "Deterministic classification replaced a black-box LLM step, cutting the unexplainable custom bucket from 40–60% to under 5%.",
    summary: "The model handles voice and format only. Python owns classification and grouping, verbatim narrative seeds constrain generation, and a proportional review gate routes the PM to the 2–3 items that matter.",
    narrative: "One release cycle required the same Linear tickets to be rewritten for five audiences: customer release notes, internal changelog, sales brief, support FAQ, and Slack. A first all-LLM approach failed in the useful way—tickets classified differently across runs, 40–60% fell into an unexplainable custom bucket, and nobody could see why. The fix was architectural, not another prompt. Classification and grouping moved into deterministic Python; the model became responsible only for voice and format. Six stages and a sixteen-field schema feed five audience-specific prompt contracts. Verbatim narrative seeds prevent unsupported feature claims. Three validation passes each target a failure the model had actually made. Across 12+ batches and 100+ tickets, the custom bucket fell below 5% and PM work dropped from 3–5 hours to 20–40 minutes. A review gate concentrates attention on the 2–3 high-risk items instead of pretending the system no longer needs an owner.",
    agency: "The pipeline classifies and drafts inside explicit bounds; a PM reviews the high-risk items and remains the publisher of record.",
    role: "AI systems designer · pipeline architect",
    outcome: "Five consistent outputs per cycle, a deterministic audit trail, and a workflow handed off for non-engineering ownership.",
    image: "/work/release-intelligence-pipeline.svg",
    artifactImage: "/work/release-intelligence-pipeline.svg",
    indexPill: "five honest documents",
    categories: ["Systems", "Experience"],
    node: { x: 77.2, y: 51.2, size: 28 },
    metrics: ["40–60% → <5% custom bucket", "3–5 hr → 20–40 min per cycle", "12+ batches / 100+ tickets"],
    artifacts: ["Pencil architecture → functional system", "Six-stage pipeline diagram", "Batch-by-batch error table"],
    details: [
      { title: "Move facts out of the model", body: "Deterministic Python owns classification and grouping, so identical tickets produce identical, auditable results." },
      { title: "Constrain generation", body: "Each audience has its own contract, but every claim must originate in a verbatim narrative seed from the source ticket." },
      { title: "Review proportionally", body: "Validation routes PM attention to 2–3 high-risk items instead of demanding blanket review or pretending review is unnecessary." },
    ],
  },
  {
    slug: "gleanings",
    title: "Gleanings",
    year: "2025–26",
    eyebrow: "Tricky",
    descriptor: ["AI product", "Independent"],
    question: "Can an agent read a whole project’s paperwork and tell you what is about to become expensive?",
    headline: "A reasoning agent reads schedules, drawings, budgets, and meeting notes together, then ranks conflicts by anticipated cost and schedule impact.",
    summary: "The interface is built for triage rather than exhaustiveness: a project manager needs the three discrepancies worth acting on, with the evidence chain still attached.",
    narrative: "Project risk rarely sits inside one document. It appears between a schedule and a drawing set, a budget and a field note, an RFI and the decision it is waiting on. Gleanings ingests those heterogeneous records together and surfaces the conflicts between them: scope drift, budget-to-actuals gaps, unresolved dependencies, and downstream cost that only becomes visible when several sources are read against one another. The ranking is the product. An unranked list of every discrepancy simply creates another coordination burden, so findings are ordered by anticipated cost and schedule impact and returned with their source trail intact. The system does not make the project decision. It routes scarce reviewer attention to the conflicts most likely to compound into change orders, preserving enough evidence for the accountable project manager to agree, reject, or investigate. The agent was handed off and put into use.",
    agency: "The agent ranks evidence-backed conflicts; the project manager remains responsible for interpreting context and authorizing action.",
    role: "Product design · reasoning architecture · build",
    outcome: "A handed-off project-reasoning workflow that turns cross-document conflict into a prioritized, inspectable action list.",
    image: "/work/gleanings-hero-v2.png",
    artifactImage: "/work/gleanings.svg",
    indexPill: "conflicts before they compound",
    categories: ["Systems", "Experience"],
    node: { x: 80.4, y: 66.2, size: 26 },
    metrics: ["4+ heterogeneous source classes", "Conflicts ranked by cost + schedule", "Human review before action"],
    artifacts: ["File-ingestion and reconciliation map", "Ranked discrepancy interface", "Finding-to-source evidence trail"],
    details: [
      { title: "Read across the project", body: "Schedules, drawings, budgets, RFIs, and notes stay distinct while the system searches for consequential disagreement between them." },
      { title: "Rank what compounds", body: "Findings are ordered by anticipated cost and schedule impact rather than by detection order or document type." },
      { title: "Keep the source attached", body: "Every proposed issue points back to the evidence a project manager needs to confirm or dismiss it." },
    ],
  },
  {
    slug: "string",
    title: "String",
    year: "2024–25",
    eyebrow: "Tricky",
    descriptor: ["AI product", "Collaboration"],
    question: "Can a signal system improve in public and leave an inspectable record of how?",
    headline: "Product strategy and model operations raised reported hit rate from 40% to 62% while scaling from zero to 5,000+ active traders.",
    summary: "A real-time Solana signal product translated trader behavior into ranked opportunities, improving reported hit rate from 40% to 62% while scaling to 5,000+ active traders and leaving an auditable eight-export model record.",
    narrative: "String was a real-time Solana intelligence product for identifying high-potential projects early. The product problem was not access to more calls; it was deciding which behavioral symptoms inside noisy on-chain activity were worth surfacing, and how much control an automated system should hold once it found them. Product strategy worked backward from the tools and routines used by high-value traders, translating research into model features, opportunity ranking, and a fee model. Reported hit rate rose from 40% to 62% as signal quality took priority over volume, and the platform scaled to more than five thousand active traders and roughly $250K in revenue. The durable artifact is now the development record: eight Telegram exports normalized into calls, contract addresses, timestamps, model labels, leaderboard snapshots, and reported outcomes. That record can compare precision, average maximum-X, call volume, and tail exposure without letting one flattering metric hide another.",
    agency: "The system surfaced and ranked candidates; confirmation and execution remained with traders, and performance claims stay tied to timestamped evidence.",
    role: "AI product strategist · co-founder · model operations",
    outcome: "A 0→5,000+ trader product with an auditable model-development archive and measurable improvement across its operating period.",
    image: "/work/string.jpg",
    indexPill: "eight exports, one ledger",
    categories: ["Systems", "Culture"],
    featured: true,
    node: { x: 84.2, y: 41, size: 32 },
    metrics: ["0 → 5,000+ active traders", "40% → 62% reported hit rate", "~$250K revenue"],
    artifacts: ["Model-version performance table", "Maximum-X distribution + denominator", "Call / leaderboard evidence ledger"],
    details: [
      { title: "Preserve the development record", body: "Eight exports were normalized into calls, contracts, model labels, timestamps, leaderboards, and outcome observations." },
      { title: "Compare like with like", body: "Precision, call volume, average maximum-X, and tail exposure sit beside one another so no single metric can carry the story alone." },
      { title: "Keep the human in execution", body: "The system narrowed and ranked opportunity; the trader remained the final actor rather than an invisible autonomous executor." },
    ],
  },
  {
    slug: "aintivirus",
    title: "AIntivirus",
    year: "2024–25",
    eyebrow: "Tricky",
    descriptor: ["AI product", "Collaboration"],
    question: "Can a real person’s archive become a convincing interactive character without becoming a caricature?",
    headline: "A character LLM, voice clone, and automated podcast pipeline moved from private corpus to published episode with minimal human touch.",
    summary: "Public writing, private unreleased material, reply constraints, voice synthesis, and cross-channel publishing formed one operated character system—not a standalone chatbot demo.",
    narrative: "AIntivirus brought John McAfee’s voice back as an interactive AI character. The significant work lived behind the provocation. A character model trained on public writing and a body of private, unreleased material—the specificity that separates a recognizably situated voice from a collage of famous quotes. Around that model sat reply selection, response constraints, stored interaction history, deployment operations, and a cross-channel interface spanning X, Telegram, and the web. A voice clone and automated podcast pipeline moved from script to synthesized voice to published audio with minimal human touch. The product reached roughly ten thousand active chatbot users while operating in front of an inherited audience of 1.2 million X followers; those are separate product and audience measures. The surrounding privacy products and crypto community shaped the tone, but the transferable project is a source-grounded character system and a multimodal production operation that could keep it coherent in public.",
    agency: "The character generated inside a bounded source and publishing system; product operators retained control of selection, safety, and release across every channel.",
    role: "AI product lead · interaction design · narrative strategy",
    outcome: "A cross-channel character product used by ~10,000 active chatbot users, supported by an automated media pipeline and a 1.2M-follower distribution surface.",
    image: "/work/aintivirus.jpg",
    indexPill: "a ghost with guardrails",
    categories: ["Systems", "Culture"],
    featured: true,
    node: { x: 54.2, y: 28.5, size: 34 },
    metrics: ["~10,000 active chatbot users", "1.2M X followers (audience)", "Script → voice → published episode"],
    artifacts: ["Private/public corpus boundary map", "Character runtime + channel architecture", "Podcast automation sequence"],
    details: [
      { title: "Ground the character", body: "Public work and private unreleased material formed a source corpus specific enough to produce a voice rather than an impression." },
      { title: "Operate the runtime", body: "Reply logic, constraints, stored interaction history, safety, and deployment surrounded the model with continuity across channels." },
      { title: "Publish at multiple speeds", body: "Live exchange, episodic voice media, and an always-on product surface let one character behave as conversation, show, and roadmap." },
    ],
  },
];

export const projectConnections: ProjectConnection[] = [
  // Handoff — the system had to work with its author absent.
  { from: "ouellette-bridge", to: "vanderbilt-passage", kind: "handoff", reason: "Installation logic has to survive the last mile without the designer standing beside it." },
  { from: "wework-conversions", to: "release-intelligence", kind: "handoff", reason: "Expert judgment becomes an auditable playbook another team can operate." },
  { from: "confidential-client", to: "vanderbilt-passage", kind: "handoff", reason: "First-of-kind systems pass into construction, compliance, and public operation." },
  { from: "mapping-investments", to: "gleanings", kind: "handoff", reason: "A structured decision surface lets operating teams continue the work after delivery." },
  { from: "release-intelligence", to: "gleanings", kind: "handoff", reason: "Both workflows preserve the evidence and reasoning another operator needs to act." },
  { from: "caleta", to: "ouellette-bridge", kind: "handoff", reason: "Design intent becomes a coordinated package that fabricators and field teams can execute without its author present." },

  // Cede — consequential choice is deliberately given to someone else.
  { from: "charlesgate-park", to: "flower-tower", kind: "cede", reason: "The project sets conditions for public authorship instead of treating participation as validation." },
  { from: "flower-tower", to: "gymnast-cobot", kind: "cede", reason: "The system holds a frame while the person inside it determines the outcome." },
  { from: "gymnast-cobot", to: "release-intelligence", kind: "cede", reason: "Automation proposes; an accountable person confirms the consequential action." },
  { from: "gymnast-cobot", to: "gleanings", kind: "cede", reason: "Machine intelligence routes attention while judgment remains with the worker." },
  { from: "gleanings", to: "aintivirus", kind: "cede", reason: "A bounded corpus shapes behavior while live users determine the conversation." },

  // Uphold — a prior record had authority and could not simply be rewritten.
  { from: "charlesgate-park", to: "ouellette-bridge", kind: "uphold", reason: "Both answer to physical and historical records that predate the brief." },
  { from: "ouellette-bridge", to: "vanderbilt-passage", kind: "uphold", reason: "New work remains accountable to an inherited architectural record." },
  { from: "vanderbilt-passage", to: "mapping-investments", kind: "uphold", reason: "The archive is a design authority rather than raw material to overwrite." },
  { from: "gymnast-cobot", to: "mapping-investments", kind: "uphold", reason: "Evidence and constraints remain visible while a new system is introduced." },
  { from: "mapping-investments", to: "aintivirus", kind: "uphold", reason: "A source record bounds what the new interpretive layer is allowed to claim." },
  { from: "88-east-broadway", to: "aintivirus", kind: "uphold", reason: "An inherited source record constrains what the project is allowed to propose or claim." },

  // Quorum — independent parties could each have stopped the work.
  { from: "charlesgate-park", to: "caleta", kind: "quorum", reason: "Public, regulatory, ownership, and technical constituencies define the design envelope together." },
  { from: "wework-conversions", to: "confidential-client", kind: "quorum", reason: "Distributed enterprise delivery depends on parties outside a single reporting line." },
  { from: "confidential-client", to: "vanderbilt-passage", kind: "quorum", reason: "Architecture, media, construction, compliance, and operations each control a necessary condition." },
  { from: "vanderbilt-passage", to: "gymnast-cobot", kind: "quorum", reason: "Technical, spatial, safety, and human-performance constraints must resolve together." },

  // Graft — new work enters a system that is already operating.
  { from: "charlesgate-park", to: "88-east-broadway", kind: "graft", reason: "The intervention enters a living civic or residential condition without suspending it." },
  { from: "charlesgate-park", to: "mapping-investments", kind: "graft", reason: "New decision infrastructure is attached to an existing public record." },
  { from: "mapping-investments", to: "string", kind: "graft", reason: "A live stream of evidence gains a new interpretive layer without stopping the underlying system." },
  { from: "string", to: "aintivirus", kind: "graft", reason: "Both products entered fast-moving public communities that were already operating." },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function projectDescriptor(project: Project) {
  const parts = project.descriptor ?? [project.eyebrow];
  return [...parts, project.year].filter(Boolean).join(" · ");
}

const constellationPhrases: Record<ConnectionKind, string> = {
  handoff: "shares a handoff with",
  cede: "cedes consequential choice beside",
  uphold: "upholds a prior record beside",
  quorum: "shares a quorum with",
  graft: "grafts into a live condition beside",
};

export function getProjectConstellationLine(slug: string) {
  const projectRelationships = projectConnections
    .filter((connection) => connection.from === slug || connection.to === slug);
  const relationships = (projectRelationships.length > 1
    ? [projectRelationships[0], projectRelationships[projectRelationships.length - 1]]
    : projectRelationships)
    .map((connection) => {
      const neighborSlug = connection.from === slug ? connection.to : connection.from;
      const neighbor = projects.find((project) => project.slug === neighborSlug);
      return `${constellationPhrases[connection.kind]} ${neighbor?.title ?? "another project"}`;
    });

  return relationships.length
    ? `In the constellation · ${relationships.join(" · ")}`
    : "In the constellation · one project among connected methods, handoffs, and constraints";
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
