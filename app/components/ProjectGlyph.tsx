import { projectConnections, projects } from "../data";

function yearTick(year: string) {
  const value = Number(year.match(/\d{4}/)?.[0] ?? 2020);
  return 7 + Math.max(0, Math.min(36, (value - 2010) / 16 * 36));
}

export function ProjectGlyph({ slug }: { slug: string }) {
  const project = projects.find((item) => item.slug === slug) ?? projects[0];
  const connections = projectConnections.filter((item) => item.from === slug || item.to === slug);
  const center = {
    x: 12 + project.node.x / 100 * 26,
    y: 12 + project.node.y / 100 * 26,
  };

  return (
    <svg className="project-glyph" viewBox="0 0 50 50" role="img" aria-label={`${project.title} position and connections`}>
      <rect x="1" y="1" width="48" height="48" rx="2" />
      {connections.map((connection) => {
        const neighborSlug = connection.from === slug ? connection.to : connection.from;
        const neighbor = projects.find((item) => item.slug === neighborSlug) ?? projects[0];
        return (
          <line
            key={`${connection.from}-${connection.to}`}
            x1={center.x}
            y1={center.y}
            x2={12 + neighbor.node.x / 100 * 26}
            y2={12 + neighbor.node.y / 100 * 26}
          />
        );
      })}
      <circle cx={center.x} cy={center.y} r="2.7" />
      <path d={`M ${yearTick(project.year)} 42 v 5`} />
    </svg>
  );
}
