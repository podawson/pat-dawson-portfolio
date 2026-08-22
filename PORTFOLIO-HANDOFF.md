# Pat Dawson Portfolio — Current-State Handoff

**State captured:** 2026-08-20  
**Public site:** https://pat-dawson-portfolio.podawson.chatgpt.site  
**Local repository:** `/Users/patrickdawson/Documents/Codex/patrick-portfolio-site`  
**Hosting:** OpenAI Sites, public access  
**Primary source of truth for project content:** `app/data.ts`

This document supersedes the generic starter `README.md` as the working handoff for the portfolio. It records the conceptual intent, current public state, newer unpublished work, information architecture, visual system, interactions, project data, implementation shape, and the most important open decisions.

## 1. The portfolio in one paragraph

The site presents Patrick Dawson as a designer and product lead whose practice moves between architecture, fabrication, experiential systems, applied AI, and cultural work. It is deliberately organized in two complementary ways. **Work** is the direct, legible index: fourteen case studies that can be filtered by discipline. **The Map** is the exploratory view: the same projects positioned between Storytelling and Computation, and between Atmosphere and Architecture, with explicit relationships that reveal shared methods, handoffs, agency boundaries, constraints, and lineages. **Play** is a live shader study that exposes Patrick's interest in procedural geometry and inspectable systems. **About** supplies the professional and conceptual frame. The operating line is: **Nothing here is ever finished.**

## 2. Critical state-of-truth warning

There are two valid states. They must not be confused.

### Public production state

- The live site is **version 12**.
- It was deployed successfully on 2026-08-17.
- It corresponds exactly to commit `fa2f25d0f6a29da5863f8947b4cea2af2a8a4658`.
- It is publicly accessible at the URL above.
- Its navigation reads **Work / Play / Studies / About**. In that version, **Play** points to the map and **Studies** points to the water study.
- The map is labeled **The Field**.
- The wordmark uses AMS; display/editorial headings use Yaplux Type.
- The default map combines a generated field image, an elevation canvas, topographic/grid lines, and explicit relationship paths.

### Newer local working state — not published

The local `main` branch still points to the same version-12 commit, but the working tree contains a coherent, unpublished correction pass:

- Modified: `app/components/Constellation.tsx`
- Modified: `app/components/ProjectGrid.tsx`
- Modified: `app/components/SiteHeader.tsx`
- Modified: `app/globals.css`
- Modified: `app/work/page.tsx`
- Added but untracked: `public/fonts/idaf-regular.otf`

This local pass changes the navigation to **Map / Work / Play / About**, relabels **The Field** as **The Map**, moves the wordmark to IDAF, removes the pre-generated field image and arbitrary resting topographic grid, makes the node detail window dark with a white outline, reduces map dimming after selection, compresses the Work page so all fourteen projects can fit in a desktop viewport, and makes nonmatching category results disappear rather than fade.

The local pass has built successfully in a previous session, but its final visual adjustment was not completed or published. **Do not discard, reset, or overwrite the dirty working tree.** The next version should begin by reviewing this exact local state.

## 3. Experience architecture

| Route | User-facing name | Purpose | Current status |
|---|---|---|---|
| `/` and `/#field` | Map + selected work | Exploratory project graph followed by six featured case studies | Live and locally revised |
| `/work` | Work | Fast, filterable index of all fourteen projects | Live and locally revised |
| `/work/[slug]` | Project case study | Data-driven detail page for every project | Live |
| `/studies` | Play | Interactive procedural water/shader study | Live |
| `/playground` | Legacy alias | Re-exports `/studies`; retained for old links | Live but not in the intended nav |
| `/about` | About | Practice statement, principles, experience, focus areas, education | Live |

The intended primary navigation order is **Map / Work / Play / About**. Map should precede Work. “Play” is the public label for the route currently stored under `/studies`.

## 4. Homepage and Map

### Purpose

The Map is not a decorative splash screen. It is a navigable thesis about the practice: projects differ in medium but share operating methods. The graph should let a visitor see those connections before opening a case study.

### Coordinate system

- Horizontal axis: **Storytelling → Computation**
- Vertical axis: **Atmosphere → Architecture**
- The same four terms appear in the plus-sign diagram on About.
- Project positions and sizes are stored under each project's `node` object in `app/data.ts`.

### Default state

- Fourteen numbered nodes are visible at once.
- Twenty explicit links exist beneath the composition.
- The default graph should hint at those links without turning into a diagram of literal straight lines.
- The intended geometry is a dimensional, continuous, blue-violet body generated from the real project graph: a hybrid of soft field, hyperstructure, fiber bundle, and minimal-surface logic.
- The clearest visual target remains the user-provided styleframe with a continuous lavender body, luminous clusters, fine connective fibers, and legible project beads on black.
- The geometry must be **data-derived**. Decorative lines that do not correspond to nodes, relationships, elevation, or interaction should not return.

### Selected-node state

Clicking a node:

1. Marks it active and raises its immediate constellation.
2. Keeps connected nodes legible and quiets unrelated nodes without blacking out the full map.
3. Produces a more prominent selected geometry with pulse, elevation, saturation, fibers, and moving particles.
4. Labels the active relationships on the canvas.
5. Opens a dark project window with a white outline.
6. Shows the project artifact, title, case-study link, neighboring projects, relationship types, and the written reason for each connection.
7. Lets the user jump directly to a related node from the relationship list.

The detail window can be closed by its **Full Field ×** control, by clicking the active node again, or with the Escape key. That close behavior is already present locally.

### Current local rendering approach

`app/components/Constellation.tsx` contains two canvas renderers:

- `RestingGeometry`: samples Gaussian influence around project nodes and actual relationship segments, rasterizes a low-resolution elevation/color field, scales it up into a soft blue-violet body, then draws fine colored fibers along the real connections.
- `SelectedGeometry`: generates a higher-contrast animated surface around the active project and its neighbors, adds projected elevation lines, fiber strands, moving particles, rings, and relationship labels.

The local resting state is clearer and more semantically honest than version 12 because it removes the unrelated pre-generated field image and global grid. It is not yet the final aesthetic. It can still read as a soft or filamentary network rather than the desired continuous three-dimensional hyperstructure. The next visual pass should alter the surface generation itself, not layer more unrelated graphics on top.

### Homepage continuation

Below the Map is a linear **Selected work** sequence containing six featured projects:

1. Charlesgate Park
2. Caleta & Bad Habit
3. Vanderbilt Passage
4. Gymnast CoBot
5. String
6. AIntivirus

Each has a full-bleed image, eyebrow/year, title, a red/orange constellation-derived line, summary, and case-study link. The page ends with an archive call-to-action and a black footer. The homepage background should remain black throughout the curated section; it should not change color when moving from the Map into selected work.

## 5. Relationship model

The Map has five named relationship types. These terms are intentional and should remain stable unless the overall taxonomy is reconsidered.

| Type | Meaning | Color |
|---|---|---|
| `method` | A repeatable way of researching, ranking, modeling, or building appears in both projects | Cyan |
| `handoff` | A design becomes real through documentation, coordination, installation, or ownership transfer | Coral |
| `agency` | The system helps, proposes, or structures while an accountable person retains authorship or decision authority | Periwinkle |
| `constraint` | Regulation, preservation, safety, source bounds, or field conditions define what the work can truthfully do | Pale gray-blue |
| `lineage` | One project directly anticipates or informs another | Pink-lilac |

“Authority” was deliberately rejected as a relationship name. “Agency” is used in its ordinary design/governance sense and should not be described as “agentic.”

The twenty explicit links are stored in `projectConnections` in `app/data.ts`, and every link includes a human-readable reason. The red/orange sentence under each project title on the homepage and case-study pages is generated from this same constellation system so that the signal is consistent across the site.

## 6. Work index

The Work page is the fast, conventional way through the portfolio.

### Content and interaction

- The headline is **Fourteen projects. Many ways through.**
- Lens filters: **All (14), Place (9), Fabrication (4), Experience (7), AI systems (9), Culture (7)**.
- In the unpublished local state, choosing a lens removes nonmatching projects completely.
- Hover, keyboard focus, and arrow keys change the active preview without leaving the page.
- The active row connects visually to a preview image and short description.
- The local desktop layout compresses the introduction, row height, headline sizing, and preview so all fourteen projects can fit in one normal desktop viewport. Mobile deliberately returns to a vertical, scrollable layout.

### Outstanding verification

The “all fourteen without scrolling” goal needs one final browser check at common desktop heights, especially 768, 800, 900, and 1080 pixels. Do not solve a tight viewport by making the type too small to scan.

## 7. Project case-study template

Every project page is generated from `app/data.ts` by `app/work/[slug]/page.tsx`. No case study is separately hard-coded.

The page structure is:

1. Eyebrow and year
2. Project title
3. Constellation-derived relationship line
4. Evidence-led headline
5. Short summary
6. Lens tags directly beneath the introduction
7. Hero image
8. Role and Outcome
9. “The operating story” narrative
10. Agency boundary
11. Three quantitative/evidentiary metrics
12. Three recommended artifacts
13. Three operating-detail modules
14. Full image break
15. Next project

Typography on detail pages follows a strict hierarchy: short title-scale editorial text may use the display face; questions, role, outcome, lenses, long narrative, captions, and explanatory material use Geist. The earlier all-display-font treatment was rejected because it turned content into texture and impaired reading.

Images used for projects should be clean source images. **Do not use a full portfolio slide or any image containing baked-in explanatory text when a clean extracted project image exists.** This is especially important for Charlesgate Park and other projects originally imported from the PDF portfolio.

## 8. Project inventory

| # | Project | Date | Primary evidence / outcome | Lenses |
|---:|---|---|---|---|
| 01 | Charlesgate Park | 2019–20 | Archival research, point-cloud site model, public hearings, phased ecological repair | Place, Culture |
| 02 | 88 East Broadway | 2023 | Roughly $5M reuse study joining zoning, licensing, structure, use, filing, and fundraising | Place, Culture |
| 03 | Ouellette Bridge | 2021 | Five historic trusses and 100+ addressable lights installed with no drilling or welding to original fabric | Fabrication, Place, Experience |
| 04 | Flower Tower | 2021 | Six-foot public installation distributing 800+ flowers/seed packets before recycling | Fabrication, Place, Culture |
| 05 | Caleta & Bad Habit | 2022–23 | Hospitality project carried from concept through permits, construction, inspections, and opening | Place, Fabrication, Culture |
| 06 | WeWork Conversions | 2021–22 | 900+ locations analyzed and 200+ revenue-generating conversions initiated through a repeatable playbook | Place, Experience, AI systems |
| 07 | Intuit Astor Place | 2024–25 | First-of-kind enterprise physical-AI environment advanced through active construction | Experience, Place, AI systems |
| 08 | Vanderbilt Passage | 2023–26 | Permanent audiovisual passage with five hardware zones and fifteen generative modes inside 270 Park Avenue | Experience, AI systems, Place |
| 09 | Gymnast CoBot | 2019–21 | NSF-funded UR-10 prototype linking fatigue estimation, gesture control, projected intent, and worker-set assistance | Experience, AI systems, Fabrication |
| 10 | Civic Investment Map | 2025–26 | Thirteen sites, three eras, and ninety years of research translated into a live 3D civic narrative | AI systems, Place, Culture |
| 11 | Release Intelligence | 2026 | Five release outputs; custom classification bucket reduced from 40–60% to under 5%; PM cycle reduced from 3–5 hours to 20–40 minutes | AI systems, Experience |
| 12 | Gleanings | 2025–26 | Cross-document project conflicts ranked by cost and schedule with source evidence attached | AI systems, Experience |
| 13 | String | 2024–25 | 0→5,000+ traders; reported hit rate improved from 40% to 62%; eight-export model/call evidence archive | AI systems, Culture |
| 14 | AIntivirus | 2024–25 | Cross-channel AI character used by ~10,000 active chatbot users across a 1.2M-follower distribution surface | AI systems, Culture |

The portfolio copy is intentionally asynchronous: a fast reader should understand title, evidence headline, role, outcome, and tags; a deeper reader can continue through the operating story, metrics, artifacts, and details.

## 9. Play: procedural water study

The Play section is implemented by `app/components/WaterStudy.tsx` using Three.js and custom GLSL vertex/fragment shaders.

### Concept

One repeated isosceles triangle becomes a dimensional water field. Wave height lengthens its equal sides; sine/cosine terms, current, chop, wind, rain, light, fog, and lens settings deform the shared surface. The point is not simulated photographic water. It is an inspectable geometry study with visible controls.

### Current interaction

- Nineteen explicit parameters grouped under water, weather, light, and lens controls
- Four presets, selectable by buttons or number keys 1–4
- Clear, cloud, and fog sky states
- Pointer movement alters/rotates the field and produces a local wave response
- `H` hides/shows controls
- `R` resets
- PNG capture is available
- Control panel can be closed and reopened
- A WebGL failure falls back to a static gradient state

The visual stage should occupy most of the viewport. The title and introduction are limited to one line each on desktop. “Storm” must alter choppiness and speed, not only palette; the shader currently includes cross-waves, storm rake, current, gust, rain, and amplitude terms for this reason.

## 10. About

The About page currently opens with:

> I do my best where it comes crashing together.

The supporting line frames Patrick as working where architecture, atmosphere, storytelling, and computation have to become one deliverable. A plus-sign diagram maps those same four terms and explicitly notes that it is also the coordinate system of the Map.

The remainder includes:

- Four practice principles: find what is already there; make it work well with others; foster connective tissue; show the work.
- Six focus areas spanning experiential/media architecture, AI product systems, fabrication/delivery, spatial computing, evidence-led product management, and rapid 0→1 prototyping.
- Experience chronology from independent AI practice and String/AIntivirus through Downstream, WeWork, MassRobotics, and Landing Studio/independent fabrication.
- Northeastern University M.Arch (2021) and B.S. Architecture (2019).

The older phrase “I am useful at the plus sign” is obsolete and should not return.

## 11. Typography and identity

The local unpublished type system is the intended direction:

| Role | Typeface | Use |
|---|---|---|
| Identity accent | IDAF | “Pat Dawson” wordmark and rare, very short identity moments only |
| Editorial display | Yaplux Type | Major page/project titles and selected short, dramatic headers |
| Interface and body | Geist Sans | Navigation, questions, summaries, captions, role/outcome, narratives, controls |
| Taxonomy and metrics | Geist Mono | Kickers, filters, tags, axes, numbers, technical labels |

AMS remains in `public/fonts` from the live version but is no longer the intended wordmark face locally. Anelix Decoratif also remains as an asset but should not be used. It has been removed from the local CSS type system.

The design principle is selective contrast: expressive type establishes identity; restrained type carries information. IDAF is not a body face and should not be used for long headers, navigation, or data-rich interface copy.

## 12. Color, material, and motion

### Light pages

- Cream ground: `#f5f1e8`
- Paper: `#fbfaf6`
- Ink: `#17201b`
- Muted text: `#6d756f`
- Rust/red accent: `#a34d33`

### Dark pages

- Near-black night: `#090b0a`
- Cream text: `#f5f1e8`
- Map relationship colors: cyan, coral, periwinkle, pale gray-blue, and pink-lilac
- Map body: dark navy through blue-violet, with restrained white/cyan crests

The site alternates between a warm editorial paper system and a black, atmospheric interactive system. The homepage itself stays black from Map through selected work and footer. Motion should indicate state or system behavior: node pulse, flowing relationship particles, selected elevation, image hover, shader deformation. Avoid generic ambient motion that has no data or interaction meaning.

## 13. Media and assets

- Project imagery lives in `public/work/`.
- Some AI/product projects have both `.jpg` and diagrammatic `.svg`/`.png` artifacts.
- Map seed SVGs remain in `public/field/` but the local Map no longer references them.
- Fonts live in `public/fonts/`.
- Social sharing image: `public/og.png`.
- Site icon: `public/icon.png`.

The data model supports both `image` and optional `artifactImage`. Use `image` for clean photography or the primary case-study visual. Use `artifactImage` in the Map window when a system diagram is more informative than the hero image.

## 14. Accessibility and responsive behavior

Implemented behaviors include semantic navigation labels, button labels for every node, keyboard-focus states, Escape-to-close, arrow-key navigation in the Work index, descriptive group labels for filters/controls, reduced-motion handling in the selected Map animation, and mobile rearrangement of Map panel, Work index, Play controls, About lists, and case-study layouts.

Remaining QA should include:

- Complete keyboard traversal through all Map nodes and relation jumps
- Focus return after closing the Map window
- Visible focus at every inverse/dark control
- Mobile Map legibility and collision review
- Mobile project-window height/scroll behavior
- Reduced-motion review for resting node animation and the water shader
- Color contrast for quiet nodes, relationship labels, and mono captions
- Meaningful image alt text where images carry project-specific evidence; many current images intentionally use empty alt text and should be audited

## 15. Technical shape

- React 19 / TypeScript
- vinext on Vite for Cloudflare-compatible output
- Three.js for the Play shader
- No active database or object-store binding
- No persistent user accounts or content-management system
- Project content and graph data are compiled from `app/data.ts`
- Styling is centralized in `app/globals.css`
- Hosting identity is stored in `.openai/hosting.json`
- The site is public and anonymous-compatible
- Git branch: `main`
- No persistent Git remote is configured in the local repository; Sites publishing uses temporary repository credentials

Key commands:

```bash
npm run dev
npm run build
npm run lint
```

The inherited `tests/rendered-html.test.mjs` still describes the original vinext starter/loading skeleton and is not a meaningful portfolio regression suite. It should be replaced before anyone treats `npm test` as authoritative.

## 16. Files a new contributor should read first

1. `PORTFOLIO-HANDOFF.md` — this document
2. `app/data.ts` — all project copy, metrics, images, categories, nodes, and graph relationships
3. `app/components/Constellation.tsx` — Map rendering and selection behavior
4. `app/components/ProjectGrid.tsx` — Work filtering, keyboard movement, preview, connector
5. `app/components/WaterStudy.tsx` — Play shader and controls
6. `app/work/[slug]/page.tsx` — case-study template
7. `app/globals.css` — complete visual system and responsive behavior
8. `app/layout.tsx` — metadata and Geist loading
9. `.openai/hosting.json` — Sites project binding

## 17. Known issues and unresolved decisions

### P0 — protect and finish the local correction pass

- Preserve the dirty working tree.
- Review the local diff visually before committing.
- Confirm the local navigation is Map / Work / Play / About everywhere.
- Confirm the IDAF wordmark is legible at header scale. It is intentionally flashy, but should still read as a name.
- Confirm all fourteen Work items fit common desktop viewports without sacrificing scanability.
- Confirm category filters remove nonmatching items and maintain a valid active preview.

### P0 — Map body still needs one sculptural pass

The unresolved issue is not clarity; it is dimensional form. The local default Map is semantically cleaner but can still feel too soft, flat, or filamentary. The next pass should make the real graph read as one continuous three-dimensional body with distinct lobes and bridges. Recommended direction:

- Widen influence fields along meaningful connected paths, not every background line.
- Use node degree, category overlap, or connection density to control local radius/elevation.
- Treat graph edges as geodesic spines inside a meshed or metaball-like body.
- Add topology/contour lines only where they describe that generated body.
- Preserve generous black negative space and keep the headline readable.
- On selection, increase local extrusion, saturation, pulse, and fiber density while leaving the rest of the map visible.
- Do not reintroduce the random pre-generated SVG backdrop or full-screen grid.

### P1 — content and evidence QA

- Verify every public metric against its source before external promotion.
- Continue replacing diagram placeholders with primary artifacts, especially String, AIntivirus, Release Intelligence, and Gleanings.
- Expand clean image sets per project so case studies do not repeat the same hero image at top and bottom.
- Audit project titles, relationship lines, captions, and asset crops on mobile.

### P1 — engineered visibility is planned, not implemented

The site already has basic dynamic title/description metadata and an Open Graph image. It does not yet implement the broader “engineered visibility” strategy discussed for answer engines and search. That future phase may include structured project/schema markup, question-led landing pages, clean canonical URLs, comparison/approach articles, crawlable transcripts, directory/profile consistency, GitHub documentation for public tools, and source-rich project pages. Keep this separate from the immediate visual QA so search work does not destabilize the portfolio experience.

## 18. Safe next sequence

1. Open the local site without modifying the working tree.
2. Compare the unpublished local state with production version 12 at desktop and mobile sizes.
3. Resolve the default Map body only; preserve the local semantic cleanup.
4. Run build and lint.
5. Commit the six local changes plus `idaf-regular.otf` as one coherent version.
6. Save and deploy it as the next Sites version.
7. Verify the live URL, navigation, Map close behavior, Work filters, Play controls, About headline, and all fourteen case-study routes.
8. Only then begin content/artifact expansion or engineered-visibility work.

## 19. Acceptance checklist for the next public version

- [ ] Nav reads Map / Work / Play / About, in that order
- [ ] “Map” opens `/#field`; “Play” opens `/studies`
- [ ] Map is labeled “The Map,” not “The Field”
- [ ] Footer beneath the homepage remains black
- [ ] Default Map hints at all real relationships and reads as a continuous dimensional body
- [ ] No arbitrary sweep lines, meaningless topographic grid, or unrelated seed image
- [ ] Selected-node geometry becomes visibly more dimensional without excessively darkening the rest
- [ ] Detail window is dark, white outlined, and closable by control, active node, and Escape
- [ ] Relationship type `agency` is used; `authority` is absent
- [ ] Work page shows all fourteen projects at a normal desktop height
- [ ] Work filters fully remove nonmatching projects
- [ ] IDAF is limited to the name/identity accent
- [ ] Yaplux is limited to short editorial display moments
- [ ] Geist carries long-form and interface copy
- [ ] Anelix is not used
- [ ] Play gives most of the viewport to the animation
- [ ] Storm settings change water speed/choppiness, not only color
- [ ] About headline reads “I do my best where it comes crashing together.”
- [ ] No project hero uses a portfolio slide with baked-in text
- [ ] Build and lint pass
- [ ] Production URL is checked after deployment

## 20. Editorial rule of thumb

The portfolio works best when each project answers four questions in sequence:

1. **What was the difficult condition?**
2. **What system or handoff did Patrick create?**
3. **What changed, preferably by the numbers?**
4. **Where did human judgment remain?**

That structure is the throughline between a historic bridge, an enterprise media passage, a robot, a release pipeline, a trading signal product, and an AI character. The site should preserve the heterogeneity of the work while making that operating logic unmistakable.
