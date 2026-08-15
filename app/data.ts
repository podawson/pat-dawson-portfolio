export type Category = "Place" | "Fabrication" | "Experience" | "AI systems" | "Culture";

export type Project = {
  slug: string;
  title: string;
  year: string;
  eyebrow: string;
  question: string;
  summary: string;
  role: string;
  outcome: string;
  image: string;
  categories: Category[];
  featured?: boolean;
  node: { x: number; y: number; size: number };
  details: { title: string; body: string }[];
};

export const categories: ("All" | Category)[] = [
  "All",
  "Place",
  "Fabrication",
  "Experience",
  "AI systems",
  "Culture",
];

export const projects: Project[] = [
  {
    slug: "charlesgate-park",
    title: "Charlesgate Park",
    year: "2019–20",
    eyebrow: "Public realm · Boston",
    question: "How do you repair a stolen public space?",
    summary: "A proposal to recover a buried piece of the Emerald Necklace by treating site history as design material.",
    role: "Architectural designer",
    outcome: "Surveyed, modeled, and proposed a phased return of water, habitat, and public access.",
    image: "/work/charlesgate.jpg",
    categories: ["Place", "Culture"],
    featured: true,
    node: { x: 18, y: 72, size: 60 },
    details: [
      { title: "Read the record", body: "Cultural, legal, structural, and ecological histories established the real design constraints before form-making began." },
      { title: "Make the loss visible", body: "Mapping and three-dimensional studies showed how road infrastructure displaced the Muddy River and fragmented public space." },
      { title: "Return in phases", body: "The proposal connected remediation, daylighting, access, and stewardship instead of treating the park as a blank site." },
    ],
  },
  {
    slug: "88-east-broadway",
    title: "88 East Broadway",
    year: "2023",
    eyebrow: "Adaptive reuse · New York",
    question: "How do you make the most of what is already there?",
    summary: "A proposal for a building under the Manhattan Bridge that began with archival plans, setbacks, and latent neighborhood uses.",
    role: "Co-founder · business development · creative direction",
    outcome: "Produced a reuse proposal and package for filing and fundraising.",
    image: "/work/east-broadway.jpg",
    categories: ["Place", "Culture"],
    node: { x: 34, y: 64, size: 48 },
    details: [
      { title: "Recover", body: "Historic plans and neighborhood patterns clarified what the building had been and what its structure could still permit." },
      { title: "Frame", body: "The proposal balanced public gathering, food, play, and flexible work beneath an unusually infrastructural address." },
      { title: "Package", body: "The work translated an open-ended vision into a credible document for approvals, partners, and capital." },
    ],
  },
  {
    slug: "ouellette-bridge",
    title: "Ouellette Bridge",
    year: "2021",
    eyebrow: "Fabrication · Lowell",
    question: "How do you attach something to a landmark you cannot touch?",
    summary: "A clamp-and-leg installation system for a lenticular bridge, drawn and packaged so one local steel fabricator could build the work.",
    role: "Architectural designer · fabrication-set author",
    outcome: "Five trusses, more than 100 individually addressable lights, and a public opening.",
    image: "/work/ouellette.jpg",
    categories: ["Fabrication", "Place", "Experience"],
    node: { x: 22, y: 52, size: 44 },
    details: [
      { title: "Respect the artifact", body: "The attachment logic avoided welding to historic components while staying legible to installers and inspectors." },
      { title: "Draw the assembly", body: "Fabrication details turned a long spatial idea into repeatable local parts." },
      { title: "Sequence the light", body: "Physical craft and addressable lighting worked as one public experience rather than separate scopes." },
    ],
  },
  {
    slug: "flower-tower",
    title: "Flower Tower",
    year: "2021",
    eyebrow: "Public installation · Boston",
    question: "What does a monument provide for the people who live with it?",
    summary: "A cardboard monument wrapped in dried plants, locally rooted pollinator-friendly seed, and the expectation of its own dismantling.",
    role: "Grant writer · concept · coordination · installation",
    outcome: "More than 800 stems and seed packets distributed at a public festival.",
    image: "/work/flower-tower.jpg",
    categories: ["Fabrication", "Place", "Culture"],
    node: { x: 14, y: 38, size: 42 },
    details: [
      { title: "Reverse permanence", body: "The monument began with its end: every component anticipated disassembly, reuse, or dispersal." },
      { title: "Build collectively", body: "A volunteer assembly process turned construction itself into a civic event." },
      { title: "Leave something living", body: "The final exchange was not an object but seed distributed back into the city." },
    ],
  },
  {
    slug: "caleta",
    title: "Caleta",
    year: "2022–23",
    eyebrow: "Hospitality · New York",
    question: "How do you merge a punk-rock attitude with an ice cream scoop shop and tapas bar?",
    summary: "A small hospitality space where black tile, silky plaster, red light, and an ADA-compliant disco-ball bathroom make the brand physical.",
    role: "Business development · strategy · lead design · delivery",
    outcome: "Opened January 2023; countless scoops, plates, and late nights followed.",
    image: "/work/caleta.jpg",
    categories: ["Place", "Fabrication", "Culture"],
    featured: true,
    node: { x: 34, y: 40, size: 62 },
    details: [
      { title: "Translate attitude", body: "The work rejected the expected white-tile ice-cream palette without giving up hospitality or function." },
      { title: "Negotiate reality", body: "Drawings, permits, rated assemblies, fabricators, inspections, and punch work carried the concept through opening." },
      { title: "Design the surprise", body: "Lighting, warped grids, custom furniture, and a disco ball made room for moments no mood board could fully explain." },
    ],
  },
  {
    slug: "wework-conversions",
    title: "WeWork Conversions",
    year: "2021–22",
    eyebrow: "Portfolio strategy · North America",
    question: "How do you scale design ambition across hundreds of locations?",
    summary: "A conversion playbook built from portfolio analysis, recurring building types, and the work of many specialist teams.",
    role: "Strategic experience design lead · playbook contributor",
    outcome: "More than 200 properties converted without leaving one repeatable solution behind.",
    image: "/work/wework.jpg",
    categories: ["Place", "Experience"],
    node: { x: 50, y: 67, size: 46 },
    details: [
      { title: "See the portfolio", body: "Property patterns and operational constraints were compared before design attention was assigned." },
      { title: "Write the playbook", body: "Recurring MEP, material, accessibility, and amenity decisions became a coordinated framework." },
      { title: "Protect the exception", body: "The system created enough consistency to preserve the moments that actually needed local judgment." },
    ],
  },
  {
    slug: "intuit-astor-place",
    title: "Intuit Astor Place",
    year: "2024",
    eyebrow: "Temporary activation · New York",
    question: "What does a storefront do when the product is invisible?",
    summary: "A temporary public activation and workshop process that translated an abstract technology brand into a physical sequence.",
    role: "Project manager · technical project coordinator",
    outcome: "A working storefront activation delivered for a small-business audience in New York.",
    image: "/work/intuit.jpg",
    categories: ["Experience", "Place"],
    node: { x: 61, y: 52, size: 50 },
    details: [
      { title: "Gather the signal", body: "Stakeholder workshops converted memories, words, and references into a structured set of spatial directions." },
      { title: "Coordinate the handoff", body: "Design, fabrication, brand, landlord, and site requirements were kept coherent through delivery." },
      { title: "Maintain presence", body: "The temporary activation kept a public face active while the permanent location was under construction." },
    ],
  },
  {
    slug: "vanderbilt-passage",
    title: "Vanderbilt Passage",
    year: "2023–25",
    eyebrow: "Media architecture · New York",
    question: "How do you turn a hallway into a destination inside a 60-story tower?",
    summary: "Eight hardware zones, fifteen generative modes, directional audio, and a shared control system delivered inside an active supertall.",
    role: "Experiential project manager · media systems lead",
    outcome: "A continuous audiovisual passage spanning the tower’s main exchange.",
    image: "/work/vanderbilt.jpg",
    categories: ["Experience", "AI systems", "Place"],
    featured: true,
    node: { x: 68, y: 36, size: 66 },
    details: [
      { title: "One system, many scenes", body: "Real-time media moved between atmospheric, narrative, and place-based modes without exposing the operational complexity." },
      { title: "Coordinate the invisible", body: "AV, networks, enclosure, finishes, content, code, sound, and maintenance were treated as one spatial system." },
      { title: "Deliver in place", body: "The work was installed and commissioned inside a live construction and real-estate environment." },
    ],
  },
  {
    slug: "gymnast-cobot",
    title: "Gymnast Cobot",
    year: "2019–21",
    eyebrow: "Human–robot interaction · Boston",
    question: "How much help does someone actually want?",
    summary: "A collaborative robot projected its intended motion and adjusted assistance in response to worker fatigue and preference.",
    role: "Experience design · human-robot interaction research",
    outcome: "An interface, fatigue loop, research boards, and a live industrial prototype supported by NSF funding.",
    image: "/work/gymnast.jpg",
    categories: ["Experience", "AI systems", "Fabrication"],
    featured: true,
    node: { x: 76, y: 55, size: 58 },
    details: [
      { title: "Make intent legible", body: "Projection mapping showed where the robot planned to move before its motion affected a nearby worker." },
      { title: "Close the loop", body: "Fatigue and preference informed assistance instead of assuming that more automation was always better." },
      { title: "Test the handoff", body: "Gesture programming, interface studies, research boards, and a live box made the system inspectable." },
    ],
  },
  {
    slug: "mapping-investments",
    title: "Mapping Investments",
    year: "2026",
    eyebrow: "Interactive research · Confidential client",
    question: "What constellation appears from nodes of history?",
    summary: "An interactive map that turns cultural research and institutional narratives into a navigable record.",
    role: "Sole designer and interactive developer",
    outcome: "Thirteen sites, three eras, thirty years, and one community’s record of stewardship and return.",
    image: "/work/mapping-investments.jpg",
    categories: ["AI systems", "Place", "Culture"],
    node: { x: 58, y: 22, size: 44 },
    details: [
      { title: "Research", body: "Public and client sources were gathered into a record that could survive beyond a conventional report." },
      { title: "Model", body: "Locations, themes, actors, and eras became a spatial data structure rather than a linear chronology." },
      { title: "Navigate", body: "The interface made relationships discoverable without pretending history had only one path." },
    ],
  },
  {
    slug: "release-intelligence",
    title: "Release Intelligence",
    year: "2024–present",
    eyebrow: "Independent AI product practice",
    question: "Can a system ingest ambiguity and still wait for a human to confirm?",
    summary: "Five documents became one release record, one reviewable screen, and five downstream outputs without hiding contradictions.",
    role: "Systems architect · product builder",
    outcome: "Sixteen classification fields, five outputs per release, and human review before distribution.",
    image: "/work/release-intelligence.jpg",
    categories: ["AI systems", "Experience"],
    node: { x: 82, y: 28, size: 50 },
    details: [
      { title: "Sketch first", body: "Messy pencil diagrams established the functional architecture before a product interface existed." },
      { title: "Ingest disagreement", body: "Release documents were reconciled without forcing uncertainty into a falsely clean source of truth." },
      { title: "Confirm before action", body: "A git-inspired review state kept human judgment in the loop before outputs reached downstream systems." },
    ],
  },
  {
    slug: "gleanings",
    title: "Gleanings",
    year: "2025–present",
    eyebrow: "Independent AI product practice",
    question: "What knowledge is embedded in a project, then lost in coordination?",
    summary: "A document system that reconciles uploaded project records before retrieval, so contradictions remain visible and useful.",
    role: "Product design and build",
    outcome: "A working upload, reconciliation, retrieval, and execution flow for project knowledge.",
    image: "/work/gleanings.jpg",
    categories: ["AI systems", "Experience"],
    node: { x: 88, y: 42, size: 48 },
    details: [
      { title: "Upload", body: "Schedules, drawings, budgets, and field notes enter one workspace without pretending to be one format." },
      { title: "Reconcile", body: "Conflicts surface before they compound, preserving the difference between retrieval and agreement." },
      { title: "Execute", body: "Answers retain their source trail so project knowledge can become action instead of another archive." },
    ],
  },
  {
    slug: "string",
    title: "String",
    year: "2024–25",
    eyebrow: "Independent AI product practice",
    question: "Can an algorithm leave a legible record of how it improved?",
    summary: "A model-development practice for high-velocity on-chain calls, reconstructed from exported conversations, model labels, and leaderboard snapshots.",
    role: "Product strategy · model operations · evidence design",
    outcome: "A reproducible archive of calls, model transitions, reported outcomes, and maximum-upside comparisons.",
    image: "/work/string.png",
    categories: ["AI systems", "Culture"],
    featured: true,
    node: { x: 72, y: 16, size: 64 },
    details: [
      { title: "Preserve the development record", body: "Eight Telegram exports were normalized into calls, contracts, model labels, timestamps, and leaderboard snapshots." },
      { title: "Compare like with like", body: "Average maximum-X, precision, call volume, and tail exposure were separated so one metric could not hide another." },
      { title: "Keep the outliers", body: "Extreme upside was not deleted as noise; it was shown beside the denominator and evidence source that made the claim inspectable." },
    ],
  },
  {
    slug: "aintivirus",
    title: "AIntivirus",
    year: "2024–25",
    eyebrow: "Independent AI product practice",
    question: "Can a public identity become an interface?",
    summary: "A dormant public identity returned as a trained character, bounded reply system, automated media operation, and product-launch surface.",
    role: "AI product lead · interaction design · narrative strategy",
    outcome: "A cross-channel character system reaching a large inherited audience through conversation, media, and privacy-product releases.",
    image: "/work/aintivirus.jpg",
    categories: ["AI systems", "Culture"],
    featured: true,
    node: { x: 88, y: 12, size: 70 },
    details: [
      { title: "Treat the account as interface", body: "The first experience happened where the audience already was: mentions and messages, not a newly invented product shell." },
      { title: "Bound the character", body: "Selection logic, response constraints, stored reply history, and deployment operations surrounded the model with continuity." },
      { title: "Publish at three speeds", body: "Live exchange, episodic voice media, and an always-on website world let one identity behave as conversation, show, and roadmap." },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

