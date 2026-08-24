import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "app", "data.ts");
const outputDirectory = path.join(root, "content", "project-pages");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const compiledModule = { exports: {} };
new Function("module", "exports", compiled)(compiledModule, compiledModule.exports);
const { projects } = compiledModule.exports;

fs.mkdirSync(outputDirectory, { recursive: true });

for (const project of projects) {
  const details = project.details
    .map((detail, index) => `### ${String(index + 1).padStart(2, "0")} · ${detail.title}\n\n${detail.body}`)
    .join("\n\n");
  const metrics = project.metrics.map((item) => `- ${item}`).join("\n");
  const artifacts = project.artifacts.map((item) => `- ${item}`).join("\n");
  const categories = project.categories.map((item) => `- ${item}`).join("\n");
  const markdown = `# ${project.title}\n\n> Editable copy snapshot for the dedicated project page. Send edits back to sync them with \`app/data.ts\`.\n\n## Page label\n\n${project.eyebrow} · ${project.year}\n\n## Question\n\n${project.question}\n\n## Headline\n\n${project.headline}\n\n## Summary\n\n${project.summary}\n\n## Role\n\n${project.role}\n\n## Outcome\n\n${project.outcome}\n\n## Categories\n\n${categories}\n\n## Operating story\n\n${project.narrative}\n\n## Where authorship stays human\n\n${project.agency}\n\n## By the numbers\n\n${metrics}\n\n## Artifacts that carry the case\n\n${artifacts}\n\n## Details\n\n${details}\n`;
  fs.writeFileSync(path.join(outputDirectory, `${project.slug}.md`), markdown);
}

fs.writeFileSync(path.join(outputDirectory, "README.md"), `# Project-page copy\n\nThese ${projects.length} Markdown files mirror the text on each dedicated project page. Edit them directly and send the revised files back to sync into the live data source. Regenerate snapshots with \`npm run copy:export\`.\n`);
console.log(`Exported ${projects.length} project-page copy files to ${outputDirectory}`);
