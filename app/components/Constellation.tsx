"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { projectConnections, projects, type ConnectionKind } from "../data";
import { MapBody3D } from "../map/MapBodyMesh3D";

const relationColor: Record<ConnectionKind, string> = {
  handoff: "#D63C49",
  cede: "#B85C91",
  uphold: "#7A3FAE",
  quorum: "#FFC94D",
  graft: "#3A9971",
};

const relationLabel: Record<ConnectionKind, string> = {
  handoff: "Handoff",
  cede: "Cede",
  uphold: "Uphold",
  quorum: "Quorum",
  graft: "Graft",
};

const relationDescription: Record<ConnectionKind, string> = {
  handoff: "The work evolves with its next stakeholder",
  cede: "The work gives its outcome to other people.",
  uphold: "The work answers a record that predates it.",
  quorum: "The work pursues stakeholder alignment.",
  graft: "The work merges immediately into the system.",
};

const relationKinds: ConnectionKind[] = ["handoff", "cede", "uphold", "quorum", "graft"];

type AxisKey = "story" | "compute" | "atmosphere" | "architecture" | "center";
type AxisPositions = Readonly<Record<AxisKey, { x: number; y: number; visible: boolean }>>;

function trimAxisLines(layer: HTMLDivElement, positions: AxisPositions) {
  const setTrimmedLine = (
    name: "horizontal" | "vertical",
    fromKey: "story" | "atmosphere",
    toKey: "compute" | "architecture",
  ) => {
    const line = layer.querySelector<SVGLineElement>(`line[data-axis-line="${name}"]`);
    const fromLabel = layer.querySelector<HTMLElement>(`[data-axis-label="${fromKey}"]`);
    const toLabel = layer.querySelector<HTMLElement>(`[data-axis-label="${toKey}"]`);
    if (!line || !fromLabel || !toLabel) return;

    const from = positions[fromKey];
    const to = positions[toKey];
    line.style.visibility = from.visible && to.visible ? "visible" : "hidden";
    if (!from.visible || !to.visible) return;

    const layerRect = layer.getBoundingClientRect();
    if (!layerRect.width || !layerRect.height) return;
    const anchorPoint = (label: HTMLElement) => ({
      x: layerRect.left + (Number.parseFloat(label.style.left) / 100) * layerRect.width,
      y: layerRect.top + (Number.parseFloat(label.style.top) / 100) * layerRect.height,
    });
    const fromPoint = anchorPoint(fromLabel);
    const toPoint = anchorPoint(toLabel);
    const distance = Math.hypot(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);
    if (!distance) return;
    const unit = {
      x: (toPoint.x - fromPoint.x) / distance,
      y: (toPoint.y - fromPoint.y) / distance,
    };
    const projectionBounds = (rect: DOMRect) => {
      const values = [
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
        { x: rect.left, y: rect.bottom },
        { x: rect.right, y: rect.bottom },
      ].map((point) => point.x * unit.x + point.y * unit.y);
      return { min: Math.min(...values), max: Math.max(...values) };
    };
    const fromBounds = projectionBounds(fromLabel.getBoundingClientRect());
    const toBounds = projectionBounds(toLabel.getBoundingClientRect());
    const fromProjection = fromPoint.x * unit.x + fromPoint.y * unit.y;
    const toProjection = toPoint.x * unit.x + toPoint.y * unit.y;
    const gap = 12;
    const fromTrim = Math.max(0, fromBounds.max - fromProjection + gap);
    const toTrim = Math.max(0, toProjection - toBounds.min + gap);
    const start = { x: fromPoint.x + unit.x * fromTrim, y: fromPoint.y + unit.y * fromTrim };
    const end = { x: toPoint.x - unit.x * toTrim, y: toPoint.y - unit.y * toTrim };
    line.setAttribute("x1", String(((start.x - layerRect.left) / layerRect.width) * 100));
    line.setAttribute("y1", String(((start.y - layerRect.top) / layerRect.height) * 100));
    line.setAttribute("x2", String(((end.x - layerRect.left) / layerRect.width) * 100));
    line.setAttribute("y2", String(((end.y - layerRect.top) / layerRect.height) * 100));
  };

  setTrimmedLine("horizontal", "story", "compute");
  setTrimmedLine("vertical", "atmosphere", "architecture");
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function restingPath(fromSlug: string, toSlug: string, strand: number) {
  const from = projects.find((project) => project.slug === fromSlug) ?? projects[0];
  const to = projects.find((project) => project.slug === toSlug) ?? projects[0];
  const dx = to.node.x - from.node.x;
  const dy = to.node.y - from.node.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const seed = hashText(`${fromSlug}-${toSlug}`);
  const direction = seed % 2 ? 1 : -1;
  const bend = direction * (5.5 + seed % 7) + strand * 1.35;
  const controlX = (from.node.x + to.node.x) / 2 - dy / length * bend;
  const controlY = (from.node.y + to.node.y) / 2 + dx / length * bend;
  return `M ${from.node.x} ${from.node.y} Q ${controlX} ${controlY} ${to.node.x} ${to.node.y}`;
}

function RestingGeometry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let resizeFrame = 0;

    const pointFor = (slug: string) => {
      const project = projects.find((item) => item.slug === slug) ?? projects[0];
      return { x: project.node.x / 100 * width, y: project.node.y / 100 * height };
    };

    const distanceToSegment = (
      x: number,
      y: number,
      start: { x: number; y: number },
      end: { x: number; y: number },
    ) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy || 1;
      const amount = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared));
      const px = start.x + amount * dx;
      const py = start.y + amount * dy;
      return Math.hypot(x - px, y - py);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height);
      const points = projects.map((project) => ({ ...pointFor(project.slug), size: project.node.size }));
      const segments = projectConnections.map((connection) => ({
        start: pointFor(connection.from),
        end: pointFor(connection.to),
        kind: connection.kind,
      }));

      const elevationAt = (x: number, y: number) => {
        let elevation = 0;
        points.forEach((point) => {
          const sigma = scale * (0.032 + point.size / 2500);
          const distance = (x - point.x) ** 2 + (y - point.y) ** 2;
          elevation += 0.68 * Math.exp(-distance / (2 * sigma ** 2));
        });
        segments.forEach((segment) => {
          const sigma = scale * 0.022;
          const distance = distanceToSegment(x, y, segment.start, segment.end);
          elevation += 0.17 * Math.exp(-(distance * distance) / (2 * sigma ** 2));
        });
        return Math.min(1.7, elevation);
      };

      const cell = Math.max(10, Math.min(15, Math.round(scale / 68)));
      const columns = Math.ceil(width / cell) + 2;
      const rows = Math.ceil(height / cell) + 2;
      const surface = document.createElement("canvas");
      surface.width = columns;
      surface.height = rows;
      const surfaceContext = surface.getContext("2d");
      if (!surfaceContext) return;
      const imageData = surfaceContext.createImageData(columns, rows);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = column / Math.max(1, columns - 1) * width;
          const y = row / Math.max(1, rows - 1) * height;
          const elevation = elevationAt(x, y);
          const body = Math.max(0, Math.min(1, (elevation - 0.055) / 1.12));
          const crest = Math.pow(body, 1.75);
          const shoulder = Math.pow(body, 0.72);
          const offset = (row * columns + column) * 4;
          imageData.data[offset] = 20 + shoulder * 34 + crest * 128;
          imageData.data[offset + 1] = 25 + shoulder * 46 + crest * 151;
          imageData.data[offset + 2] = 56 + shoulder * 92 + crest * 95;
          imageData.data[offset + 3] = Math.min(232, shoulder * 205);
        }
      }
      surfaceContext.putImageData(imageData, 0, 0);

      context.save();
      context.filter = "blur(24px)";
      context.globalAlpha = 0.54;
      context.drawImage(surface, 8, 30, width, height);
      context.restore();

      context.save();
      context.globalCompositeOperation = "screen";
      context.filter = "blur(5px) saturate(1.28) contrast(1.16)";
      context.drawImage(surface, -8, -13, width + 16, height + 20);
      context.restore();

      context.save();
      context.globalCompositeOperation = "screen";
      context.lineCap = "round";
      segments.forEach((segment, index) => {
        const dx = segment.end.x - segment.start.x;
        const dy = segment.end.y - segment.start.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const normalX = -dy / length;
        const normalY = dx / length;
        const seed = hashText(`${index}-${segment.kind}`);
        const bend = ((seed % 29) - 14) * 1.8;
        const center = {
          x: (segment.start.x + segment.end.x) / 2 + normalX * bend,
          y: (segment.start.y + segment.end.y) / 2 + normalY * bend,
        };
        const color = relationColor[segment.kind];

        context.save();
        context.filter = "blur(17px)";
        context.globalAlpha = 0.12;
        context.strokeStyle = color;
        context.lineWidth = Math.max(44, scale * 0.072);
        context.beginPath();
        context.moveTo(segment.start.x, segment.start.y + 13);
        context.quadraticCurveTo(center.x, center.y + 24, segment.end.x, segment.end.y + 13);
        context.stroke();
        context.restore();

        for (let strand = -16; strand <= 16; strand += 1) {
          const amount = strand / 16;
          const spread = amount * Math.min(74, length * 0.15);
          const flutter = Math.sin((strand + index) * 1.7) * 7;
          context.beginPath();
          context.moveTo(
            segment.start.x + normalX * spread * 0.18,
            segment.start.y + normalY * spread * 0.18,
          );
          context.quadraticCurveTo(
            center.x + normalX * (spread + flutter),
            center.y + normalY * (spread + flutter) - Math.cos(amount * Math.PI) * 12,
            segment.end.x + normalX * spread * 0.18,
            segment.end.y + normalY * spread * 0.18,
          );
          context.strokeStyle = strand % 5 === 0 ? "rgba(230,238,255,.34)" : color;
          context.globalAlpha = 0.055 + (1 - Math.abs(amount)) * 0.055;
          context.lineWidth = strand % 5 === 0 ? 0.72 : 0.38;
          context.stroke();
        }
      });
      context.restore();
    };

    const resize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="field-resting-geometry" aria-hidden="true" />;
}

function SelectedGeometry({ activeSlug }: { activeSlug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let animation = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seed = hashText(activeSlug);
    const phase = (seed % 997) / 997;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const pointFor = (slug: string) => {
      const project = projects.find((item) => item.slug === slug) ?? projects[0];
      return { x: project.node.x / 100 * width, y: project.node.y / 100 * height };
    };

    const activeConnections = projectConnections.filter(
      (connection) => connection.from === activeSlug || connection.to === activeSlug,
    );
    const connectedSlugs = new Set([
      activeSlug,
      ...activeConnections.flatMap((connection) => [connection.from, connection.to]),
    ]);

    const curve = (start: { x: number; y: number }, end: { x: number; y: number }, index: number) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const bend = (((seed >> (index % 12)) & 15) - 7.5) * 4.4 + (index % 2 ? 24 : -24);
      return {
        x: (start.x + end.x) / 2 - dy / length * bend,
        y: (start.y + end.y) / 2 + dx / length * bend,
      };
    };

    const drawSurface = (time: number) => {
      const cell = Math.max(14, Math.min(20, Math.round(Math.min(width, height) / 58)));
      const columns = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      const surface = document.createElement("canvas");
      surface.width = columns;
      surface.height = rows;
      const surfaceContext = surface.getContext("2d");
      if (!surfaceContext) return;
      const imageData = surfaceContext.createImageData(columns, rows);
      const pulse = reduceMotion ? 1 : 0.96 + Math.sin(time * 0.0022) * 0.07;
      const scale = Math.min(width, height);

      const elevationAt = (x: number, y: number) => {
        let value = 0;
        projects.forEach((project) => {
          const point = pointFor(project.slug);
          const selected = connectedSlugs.has(project.slug);
          const sigma = scale * (selected ? 0.055 : 0.04);
          const distance = (x - point.x) ** 2 + (y - point.y) ** 2;
          value += (selected ? 1.12 * pulse : 0.15) * Math.exp(-distance / (2 * sigma ** 2));
        });
        return value + Math.sin(x * 0.005 + y * 0.0034 + phase * 8) * 0.025;
      };

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = column / Math.max(1, columns - 1) * width;
          const y = row / Math.max(1, rows - 1) * height;
          const value = elevationAt(x, y);
          const ridge = Math.max(0, Math.min(1, (value - 0.18) / 1.35));
          const crest = Math.pow(ridge, 1.65);
          const offset = (row * columns + column) * 4;
          imageData.data[offset] = 34 + crest * 125;
          imageData.data[offset + 1] = 44 + crest * 116;
          imageData.data[offset + 2] = 83 + crest * 148;
          imageData.data[offset + 3] = Math.min(225, ridge * 230);
        }
      }
      surfaceContext.putImageData(imageData, 0, 0);
      context.save();
      context.globalCompositeOperation = "screen";
      context.filter = "blur(7px) saturate(1.18) contrast(1.16)";
      context.drawImage(surface, -12, -12, width + 24, height + 24);
      context.restore();

      const projected = (x: number, y: number) => {
        const elevation = Math.max(0, elevationAt(x, y) - 0.08);
        return {
          x: x + (x / Math.max(width, 1) - 0.5) * elevation * 25,
          y: y - elevation * 68,
          elevation,
        };
      };

      context.save();
      context.globalCompositeOperation = "screen";
      context.lineWidth = 0.48;
      for (let row = 0; row <= 18; row += 1) {
        context.beginPath();
        for (let column = 0; column <= 42; column += 1) {
          const point = projected(column / 42 * width, row / 18 * height);
          if (column === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.strokeStyle = `rgba(188,215,242,${0.045 + row % 3 * 0.012})`;
        context.stroke();
      }
      for (let column = 0; column <= 30; column += 1) {
        context.beginPath();
        for (let row = 0; row <= 34; row += 1) {
          const point = projected(column / 30 * width, row / 34 * height);
          if (row === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.strokeStyle = `rgba(115,172,226,${0.038 + column % 4 * 0.009})`;
        context.stroke();
      }
      context.restore();

      connectedSlugs.forEach((slug, index) => {
        const point = pointFor(slug);
        const relatedConnection = activeConnections.find((connection) => connection.from === slug || connection.to === slug);
        const color = slug === activeSlug ? "#e8fbff" : relationColor[relatedConnection?.kind ?? "graft"];
        context.save();
        context.globalCompositeOperation = "screen";
        context.strokeStyle = color;
        context.shadowColor = color;
        context.shadowBlur = slug === activeSlug ? 10 : 4;
        for (let ring = 0; ring < 10; ring += 1) {
          const lift = (9 - ring) * (slug === activeSlug ? 5.4 : 3.8);
          context.globalAlpha = 0.055 + (10 - ring) * 0.013;
          context.lineWidth = ring % 3 === 0 ? 0.8 : 0.42;
          context.beginPath();
          context.ellipse(
            point.x + lift * 0.24,
            point.y - lift,
            23 + ring * (slug === activeSlug ? 10.5 : 7.5),
            11 + ring * (slug === activeSlug ? 5.1 : 3.5),
            phase * Math.PI + index * 0.17,
            0,
            Math.PI * 2,
          );
          context.stroke();
        }
        context.restore();
      });

      const activePoint = pointFor(activeSlug);
      context.save();
      context.strokeStyle = "rgba(216,234,248,.2)";
      context.lineWidth = 0.58;
      for (let ring = 0; ring < 13; ring += 1) {
        context.beginPath();
        context.ellipse(
          activePoint.x,
          activePoint.y,
          34 + ring * 15,
          18 + ring * 9,
          phase * Math.PI,
          0,
          Math.PI * 2,
        );
        context.stroke();
      }
      context.restore();
    };

    const drawConnections = (time: number) => {
      activeConnections.forEach((connection, index) => {
        const start = pointFor(connection.from);
        const end = pointFor(connection.to);
        const control = curve(start, end, index);
        const color = relationColor[connection.kind];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.max(1, Math.hypot(dx, dy));

        context.save();
        context.globalCompositeOperation = "screen";
        for (let strand = -9; strand <= 9; strand += 1) {
          const spread = strand * 4.2;
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.quadraticCurveTo(
            control.x - dy / length * spread,
            control.y + dx / length * spread,
            end.x,
            end.y,
          );
          context.strokeStyle = color;
          context.globalAlpha = 0.08 + (1 - Math.abs(strand) / 10) * 0.22;
          context.lineWidth = strand === 0 ? 1.35 : 0.42;
          context.stroke();
        }

        for (let loose = 0; loose < 4; loose += 1) {
          const side = loose % 2 ? 1 : -1;
          const extension = 28 + loose * 17 + (seed % 19);
          context.beginPath();
          context.moveTo(end.x, end.y);
          context.quadraticCurveTo(
            end.x + dx / length * extension * 0.5 + side * dy / length * 20,
            end.y + dy / length * extension * 0.5 - side * dx / length * 20,
            end.x + dx / length * extension,
            end.y + dy / length * extension,
          );
          context.globalAlpha = 0.12;
          context.lineWidth = 0.45;
          context.stroke();
        }

        const progress = reduceMotion ? 0.62 : (time * (0.00009 + index * 0.000008) + phase) % 1;
        const inverse = 1 - progress;
        const px = inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x;
        const py = inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y;
        context.fillStyle = color;
        context.globalAlpha = 0.98;
        context.shadowColor = color;
        context.shadowBlur = 16;
        context.beginPath();
        context.arc(px, py, 2.8, 0, Math.PI * 2);
        context.fill();
        context.restore();

        const midpoint = 0.5;
        const inverseMid = 1 - midpoint;
        const labelX = inverseMid * inverseMid * start.x + 2 * inverseMid * midpoint * control.x + midpoint * midpoint * end.x;
        const labelY = inverseMid * inverseMid * start.y + 2 * inverseMid * midpoint * control.y + midpoint * midpoint * end.y;
        const tangentX = 2 * inverseMid * (control.x - start.x) + 2 * midpoint * (end.x - control.x);
        const tangentY = 2 * inverseMid * (control.y - start.y) + 2 * midpoint * (end.y - control.y);
        let angle = Math.atan2(tangentY, tangentX);
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;
        context.save();
        context.translate(labelX, labelY);
        context.rotate(angle);
        context.fillStyle = color;
        context.globalAlpha = 0.92;
        const label = relationLabel[connection.kind].toUpperCase();
        const measure = context.measureText(label);
        context.fillStyle = "rgba(8,11,13,.88)";
        context.fillRect(-measure.width / 2 - 6, -9, measure.width + 12, 16);
        context.fillStyle = color;
        context.fillText(label, -measure.width / 2, 3);
        context.restore();
      });
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      drawSurface(time);
      drawConnections(time);
      if (!reduceMotion) animation = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) draw(0);
    else animation = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, [activeSlug]);

  return <canvas ref={canvasRef} className="field-selected-geometry" aria-hidden="true" />;
}

export function Constellation() {
  void SelectedGeometry;
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showNodeNames, setShowNodeNames] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [relationFilter, setRelationFilter] = useState<ConnectionKind | "all">("all");
  const [bodyReady, setBodyReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const connectionLayerRef = useRef<SVGSVGElement | null>(null);
  const axisLayerRef = useRef<HTMLDivElement | null>(null);
  const axisPositionsRef = useRef<AxisPositions | null>(null);
  const axisTrimFrameRef = useRef<number | null>(null);
  const backgroundPointerRef = useRef({ x: 0, y: 0 });
  const handleBodyReady = useCallback((ready: boolean) => setBodyReady(ready), []);
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => { cancelled = true; };
  }, []);
  const handleNodePositions = useCallback((positions: ReadonlyArray<{ x: number; y: number; visible: boolean }>) => {
    positions.forEach((position, index) => {
      const element = nodeRefs.current[index];
      if (!element) return;
      element.style.left = `${position.x}%`;
      element.style.top = `${position.y}%`;
      element.style.visibility = position.visible ? "visible" : "hidden";
    });
    connectionLayerRef.current?.querySelectorAll<SVGLineElement>("line[data-from-index]").forEach((line) => {
      const from = positions[Number(line.dataset.fromIndex)];
      const to = positions[Number(line.dataset.toIndex)];
      if (!from || !to) return;
      line.setAttribute("x1", String(from.x));
      line.setAttribute("y1", String(from.y));
      line.setAttribute("x2", String(to.x));
      line.setAttribute("y2", String(to.y));
      line.style.visibility = from.visible && to.visible ? "visible" : "hidden";
    });
  }, []);
  const handleAxisPositions = useCallback((positions: AxisPositions, rotationAmount: number) => {
    const layer = axisLayerRef.current;
    if (!layer) return;
    axisPositionsRef.current = positions;
    const readableAngle = (from: typeof positions.story, to: typeof positions.story) => {
      let angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
      return angle;
    };
    const horizontalAngle = readableAngle(positions.story, positions.compute);
    const verticalAngle = readableAngle(positions.architecture, positions.atmosphere);
    const mobile = window.matchMedia("(max-width: 580px)").matches;
    const layerRect = layer.getBoundingClientRect();
    const axisUnit = (from: typeof positions.story, to: typeof positions.story) => {
      const dx = (to.x - from.x) * layerRect.width / 100;
      const dy = (to.y - from.y) * layerRect.height / 100;
      const distance = Math.hypot(dx, dy) || 1;
      return { x: dx / distance, y: dy / distance };
    };
    const horizontalUnit = axisUnit(positions.story, positions.compute);
    const verticalUnit = axisUnit(positions.architecture, positions.atmosphere);
    const restingProgress = mobile ? Math.max(0, Math.min(1, rotationAmount / 0.22)) : 1;
    const restingViewBlend = mobile ? 1 - restingProgress * restingProgress * (3 - 2 * restingProgress) : 0;
    (["story", "compute", "atmosphere", "architecture"] as const).forEach((key) => {
      const label = layer.querySelector<HTMLElement>(`[data-axis-label="${key}"]`);
      if (!label) return;
      const horizontal = key === "story" || key === "compute";
      const safeX = mobile || horizontal
        ? positions[key].x
        : Math.max(6, Math.min(94, positions[key].x));
      const safeY = mobile || horizontal
        ? positions[key].y
        : Math.max(9, Math.min(91, positions[key].y));
      label.style.left = `${safeX}%`;
      label.style.top = `${safeY}%`;
      label.style.visibility = positions[key].visible ? "visible" : "hidden";
      label.style.setProperty("--axis-angle", `${key === "story" || key === "compute" ? horizontalAngle : verticalAngle}deg`);
      if (mobile) {
        const unit = horizontal ? horizontalUnit : verticalUnit;
        const direction = key === "story" || key === "architecture" ? -1 : 1;
        const offset = label.offsetWidth / 2 + 4;
        label.style.marginLeft = `${unit.x * offset * direction}px`;
        label.style.marginTop = `${unit.y * offset * direction}px`;
      } else {
        label.style.marginLeft = "0px";
        label.style.marginTop = "0px";
      }
    });
    trimAxisLines(layer, positions);
    if (axisTrimFrameRef.current !== null) cancelAnimationFrame(axisTrimFrameRef.current);
    axisTrimFrameRef.current = requestAnimationFrame(() => {
      if (restingViewBlend > 0) {
        const fieldRect = layer.closest<HTMLElement>(".field")?.getBoundingClientRect();
        if (fieldRect) {
          layer.querySelectorAll<HTMLElement>("[data-axis-label]").forEach((label) => {
            const rect = label.getBoundingClientRect();
            const nudgeX = rect.left < fieldRect.left + 6
              ? fieldRect.left + 6 - rect.left
              : rect.right > fieldRect.right - 6
                ? fieldRect.right - 6 - rect.right
                : 0;
            const nudgeY = rect.top < fieldRect.top + 6
              ? fieldRect.top + 6 - rect.top
              : rect.bottom > fieldRect.bottom - 6
                ? fieldRect.bottom - 6 - rect.bottom
                : 0;
            label.style.marginLeft = `${Number.parseFloat(label.style.marginLeft || "0") + nudgeX * restingViewBlend}px`;
            label.style.marginTop = `${Number.parseFloat(label.style.marginTop || "0") + nudgeY * restingViewBlend}px`;
          });
        }
      }
      trimAxisLines(layer, positions);
      axisTrimFrameRef.current = null;
    });
    const center = layer.querySelector<HTMLElement>("[data-axis-center]");
    if (center) {
      center.style.left = `${positions.center.x}%`;
      center.style.top = `${positions.center.y}%`;
    }
  }, []);
  useEffect(() => {
    const layer = axisLayerRef.current;
    if (!layer) return;
    let cancelled = false;
    const remeasure = () => {
      const positions = axisPositionsRef.current;
      if (!cancelled && positions) trimAxisLines(layer, positions);
    };
    const resizeObserver = new ResizeObserver(remeasure);
    layer.querySelectorAll<HTMLElement>("[data-axis-label]").forEach((label) => resizeObserver.observe(label));
    void document.fonts.ready.then(() => requestAnimationFrame(remeasure));
    window.addEventListener("resize", remeasure);
    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener("resize", remeasure);
      if (axisTrimFrameRef.current !== null) cancelAnimationFrame(axisTrimFrameRef.current);
    };
  }, []);
  const resetMap = useCallback(() => {
    setActiveSlug(null);
    setRelationFilter("all");
  }, []);
  const selectRelationFilter = useCallback((filter: "all" | ConnectionKind) => {
    setActiveSlug(null);
    setRelationFilter(filter);
  }, []);
  const active = useMemo(
    () => projects.find((project) => project.slug === activeSlug) ?? null,
    [activeSlug],
  );
  const visibleConnections = useMemo(() => relationFilter === "all"
    ? projectConnections
    : projectConnections.filter((connection) => connection.kind === relationFilter), [relationFilter]);
  const activeConnections = useMemo(() => activeSlug
    ? visibleConnections
      .filter((connection) => connection.from === activeSlug || connection.to === activeSlug)
      .map((connection) => ({
        ...connection,
        neighbor: projects.find((project) => project.slug === (connection.from === activeSlug ? connection.to : connection.from)),
      }))
    : [], [activeSlug, visibleConnections]);
  const highlightedNeighbors = useMemo(() => activeConnections
    .flatMap((connection) => connection.neighbor?.slug ? [connection.neighbor.slug] : []), [activeConnections]);
  const emphasizedSlugs = useMemo(() => relationFilter === "all" ? [] : [...new Set(
    visibleConnections.flatMap((connection) => [connection.from, connection.to]),
  )], [relationFilter, visibleConnections]);
  const relationshipProjectCounts = useMemo(() => Object.fromEntries(relationKinds.map((kind) => [
    kind,
    new Set(projectConnections
      .filter((connection) => connection.kind === kind)
      .flatMap((connection) => [connection.from, connection.to])).size,
  ])) as Record<ConnectionKind, number>, []);

  useEffect(() => {
    if (!activeSlug) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveSlug(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeSlug]);

  return (
    // The full graphical field is one pointer-driven application surface.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      className={`field ${active ? "is-constellation" : ""} ${bodyReady && fontsReady ? "has-sculptural-body" : ""} ${showNodeNames ? "show-node-names" : ""} ${showAxes ? "" : "hide-axes"} ${showNodes ? "" : "hide-nodes"}`}
      id="map"
      aria-labelledby="field-title"
      role="application"
      tabIndex={-1}
      onPointerDownCapture={(event) => {
        backgroundPointerRef.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={(event) => {
        if (!active) return;
        const target = event.target as HTMLElement;
        if (target.closest("button, a, .map-selection-band, .field-relation-filter, .site-header")) return;
        const start = backgroundPointerRef.current;
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
        setActiveSlug(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveSlug(null);
      }}
    >
      <MapBody3D activeSlug={activeSlug} emphasizedSlugs={emphasizedSlugs} filterColor={relationFilter === "all" ? null : relationColor[relationFilter]} highlightedNeighbors={highlightedNeighbors} onAxisPositionsChange={handleAxisPositions} onNodePositionsChange={handleNodePositions} onReadyChange={handleBodyReady} onResetMap={resetMap} onToggleAxes={() => setShowAxes((current) => !current)} onToggleNodes={() => setShowNodes((current) => !current)} onToggleNodeNames={() => setShowNodeNames((current) => !current)} showAxes={showAxes} showNodes={showNodes} showNodeNames={showNodeNames} />
      <div className="field-copy">
        <h1 id="field-title">It Grows</h1>
      </div>

      <div className="field-relation-filter" role="group" aria-label="Filter the Corpus by relationship">
        <span>Filter by</span>
        <div>
          <button aria-pressed={relationFilter === "all"} className={`control-pill ${relationFilter === "all" ? "is-active" : ""}`} onClick={() => selectRelationFilter("all")} type="button">
            <span className="control-pill__content">All</span>
          </button>
          {relationKinds.map((kind) => (
            <span className="field-filter-option" key={kind}>
              <button
                aria-describedby={`relation-help-${kind}`}
                aria-pressed={relationFilter === kind}
                className={`control-pill ${relationFilter === kind ? "is-active" : ""}`}
                onClick={() => selectRelationFilter(kind)}
                style={{ "--relation-color": relationColor[kind] } as CSSProperties}
                type="button"
              >
                <span className="control-pill__content"><i />{relationLabel[kind]}</span>
              </button>
              <span className="field-filter-tooltip" id={`relation-help-${kind}`} role="tooltip">
                <strong>{relationLabel[kind]}:</strong> {relationDescription[kind]}
              </span>
            </span>
          ))}
        </div>
      </div>
      <p className="field-filter-announcement" aria-live="polite">
        {relationFilter === "all"
          ? `Showing all ${projects.length} projects.`
          : `Emphasizing ${relationshipProjectCounts[relationFilter]} projects connected by ${relationLabel[relationFilter].toLowerCase()}.`}
      </p>

      <div className="field-axes" ref={axisLayerRef} aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <line data-axis-line="horizontal" />
          <line data-axis-line="vertical" />
        </svg>
        <span className="field-axis field-axis--story" data-axis-label="story">Storytelling</span>
        <span className="field-axis field-axis--compute" data-axis-label="compute">Computation</span>
        <span className="field-axis field-axis--atmosphere" data-axis-label="atmosphere">Atmosphere</span>
        <span className="field-axis field-axis--architecture" data-axis-label="architecture">Architecture</span>
        <i data-axis-center />
      </div>

      {active && (
        <svg className="field-active-connections" ref={connectionLayerRef} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {activeConnections.map((connection) => {
            const fromIndex = projects.findIndex((project) => project.slug === active.slug);
            const toIndex = projects.findIndex((project) => project.slug === connection.neighbor?.slug);
            return (
              <g key={`${connection.from}-${connection.to}-${connection.kind}`} style={{ "--relation-color": relationColor[connection.kind] } as CSSProperties}>
                <line className="field-active-connection-dash" data-from-index={fromIndex} data-to-index={toIndex} />
              </g>
            );
          })}
        </svg>
      )}

      <div className="field-nodes">
        {projects.map((project, index) => {
          const isActive = active?.slug === project.slug;
          const isRelated = activeConnections.some((connection) => connection.neighbor?.slug === project.slug);
          const matchesFilter = relationFilter === "all" || visibleConnections.some((connection) => connection.from === project.slug || connection.to === project.slug);
          const isQuiet = !isActive && ((active && !isRelated) || !matchesFilter);
          return (
            <button
              className={`field-node ${isActive ? "is-active" : ""} ${isRelated ? "is-related" : ""} ${isQuiet ? "is-quiet" : ""} ${relationFilter !== "all" && !matchesFilter ? "is-filter-muted" : ""}`}
              key={project.slug}
              onClick={() => {
                if (relationFilter !== "all" && !matchesFilter) setRelationFilter("all");
                if (activeSlug === project.slug) {
                  window.location.assign(`/work/${project.slug}`);
                  return;
                }
                setActiveSlug(project.slug);
              }}
              ref={(element) => { nodeRefs.current[index] = element; }}
              style={{
                left: `${project.node.x}%`,
                top: `${project.node.y}%`,
                width: project.node.size,
                height: project.node.size,
                "--node-order": index,
              } as CSSProperties}
              type="button"
              aria-label={`${isActive ? "Open" : "Select"} ${project.title}${relationFilter !== "all" && matchesFilter ? `, connected by ${relationLabel[relationFilter].toLowerCase()}` : ""}`}
            >
              <strong>{project.title}</strong>
            </button>
          );
        })}
      </div>

      {active && (
        <aside className="map-selection-band" aria-live="polite">
          <div className="map-selection-band__identity">
            <div className="map-selection-band__identity-title">
              <h2>{active.title}</h2>
              <img
                className="map-selection-band__image"
                src={active.image}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/corpus-icon-20260825.png";
                }}
              />
            </div>
            <p className="map-selection-band__one-liner">{active.indexPill}</p>
          </div>
          <div className="map-selection-band__relations" aria-label="Related projects">
            <h3>Related</h3>
            <div className="map-selection-band__relation-list">
              {activeConnections.length ? activeConnections.map((connection) => (
                <button className="control-pill" key={`${connection.from}-${connection.to}-${connection.kind}`} onClick={() => connection.neighbor && setActiveSlug(connection.neighbor.slug)} type="button">
                  <i style={{ background: relationColor[connection.kind] }} />
                  <span><small>{relationLabel[connection.kind]}</small>{connection.neighbor?.title}</span>
                </button>
              )) : <p className="map-selection-band__empty">No {relationFilter === "all" ? "related" : relationLabel[relationFilter].toLowerCase()} links recorded.</p>}
            </div>
          </div>
          <a className="map-selection-band__open project-open-pill control-pill" href={`/work/${active.slug}`}><span className="control-pill__content">Open project →</span></a>
        </aside>
      )}

    </section>
  );
}
