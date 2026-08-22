import { projectConnections, projects } from "../data";

export type MapNode3D = {
  slug: string;
  x: number;
  y: number;
  z: number;
  chronologicalZ: number;
  degree: number;
  radius: number;
};

export type MapEdge3D = {
  from: MapNode3D;
  to: MapNode3D;
  relationshipCount: number;
  thickness: number;
};

function yearMidpoint(year: string) {
  const range = year.match(/\b(\d{4})(?:[–-](\d{2,4}))?/);
  if (!range) return 2023;
  const start = Number(range[1]);
  if (!range[2]) return start;
  const end = range[2].length === 2
    ? Math.floor(start / 100) * 100 + Number(range[2])
    : Number(range[2]);
  return (start + end) / 2;
}

const midpoints = projects.map((project) => yearMidpoint(project.year));
const earliest = Math.min(...midpoints);
const latest = Math.max(...midpoints);
const span = Math.max(1, latest - earliest);

const degrees = new Map(projects.map((project) => [project.slug, 0]));
projectConnections.forEach((connection) => {
  degrees.set(connection.from, (degrees.get(connection.from) ?? 0) + 1);
  degrees.set(connection.to, (degrees.get(connection.to) ?? 0) + 1);
});

const minimumDegree = Math.min(...degrees.values());
const maximumDegree = Math.max(...degrees.values());
const degreeSpan = Math.max(1, maximumDegree - minimumDegree);

const baseNodes: MapNode3D[] = projects.map((project, index) => {
  const chronologicalZ = ((midpoints[index] - earliest) / span) * 2 - 1;
  const degree = degrees.get(project.slug) ?? 0;
  const degreeAmount = (degree - minimumDegree) / degreeSpan;
  return {
    slug: project.slug,
    x: project.node.x / 100,
    y: 1 - project.node.y / 100,
    z: chronologicalZ,
    chronologicalZ,
    degree,
    radius: 1 + degreeAmount * 0.72,
  };
});

const nodeBySlug = new Map(baseNodes.map((node) => [node.slug, node]));

// Chronology establishes depth. This short deterministic relaxation only
// separates projected neighbors and gently gathers explicitly connected work.
for (let iteration = 0; iteration < 54; iteration += 1) {
  const force = new Map(baseNodes.map((node) => [node.slug, (node.chronologicalZ - node.z) * 0.24]));

  for (let left = 0; left < baseNodes.length; left += 1) {
    for (let right = left + 1; right < baseNodes.length; right += 1) {
      const a = baseNodes[left];
      const b = baseNodes[right];
      const projectedDistance = Math.hypot(a.x - b.x, a.y - b.y);
      if (projectedDistance > 0.16) continue;
      const overlap = 1 - projectedDistance / 0.16;
      const direction = Math.abs(a.z - b.z) > 0.018
        ? Math.sign(a.z - b.z)
        : ((left + right) % 2 ? 1 : -1);
      const repulsion = overlap * 0.026 * direction;
      force.set(a.slug, (force.get(a.slug) ?? 0) + repulsion);
      force.set(b.slug, (force.get(b.slug) ?? 0) - repulsion);
    }
  }

  projectConnections.forEach((connection) => {
    const from = nodeBySlug.get(connection.from);
    const to = nodeBySlug.get(connection.to);
    if (!from || !to) return;
    const attraction = (to.z - from.z) * 0.012;
    force.set(from.slug, (force.get(from.slug) ?? 0) + attraction);
    force.set(to.slug, (force.get(to.slug) ?? 0) - attraction);
  });

  baseNodes.forEach((node) => {
    node.z = Math.max(-1.1, Math.min(1.1, node.z + (force.get(node.slug) ?? 0)));
  });
}

const edgeGroups = new Map<string, { from: string; to: string; count: number }>();
projectConnections.forEach((connection) => {
  const key = [connection.from, connection.to].sort().join("::");
  const current = edgeGroups.get(key);
  if (current) current.count += 1;
  else edgeGroups.set(key, { from: connection.from, to: connection.to, count: 1 });
});

export const mapNodes3D = baseNodes;

export const mapEdges3D: MapEdge3D[] = [...edgeGroups.values()].flatMap((edge) => {
  const from = nodeBySlug.get(edge.from);
  const to = nodeBySlug.get(edge.to);
  if (!from || !to) return [];
  return [{
    from,
    to,
    relationshipCount: edge.count,
    thickness: 1 + Math.min(2, edge.count - 1) * 0.32,
  }];
});

export const mapNode3DBySlug = new Map(mapNodes3D.map((node) => [node.slug, node]));
