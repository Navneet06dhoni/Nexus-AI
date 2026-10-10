'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GraphNode, GraphEdge } from '../types';
import { CASE_CLUSTERS } from '../lib/casesData';
import { 
  ZoomIn, ZoomOut, RotateCcw, HelpCircle, X, Sparkles, Flame
} from 'lucide-react';
import * as d3Force from 'd3-force';

interface DetroitCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode | null) => void;
  caseId?: string;
  externalShowLegend?: boolean;
}

interface SimNode extends d3Force.SimulationNodeDatum {
  id: string;
  raw: GraphNode;
  radius: number;
  isBroker: boolean;
  centrality: number;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  id: string;
  raw: GraphEdge;
  isSuspicious: boolean;
  weight: number;
}

export const DetroitCanvas: React.FC<DetroitCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  caseId = "CASE_2026_NOIDA_112",
  externalShowLegend = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan & Zoom state (screen coordinates)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [legendUserOverride, setLegendUserOverride] = useState<boolean | null>(null);
  const showLegend = legendUserOverride !== null ? legendUserOverride : externalShowLegend;
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [priorityHeat, setPriorityHeat] = useState<boolean>(false);
  const [syncTime, setSyncTime] = useState<number>(1);
  const [isDraggingNode, setIsDraggingNode] = useState<boolean>(false);

  // Dragging a node in the physics simulation
  const draggedNodeRef = useRef<SimNode | null>(null);
  const isDraggingNodeRef = useRef<boolean>(false);

  // Precompute Adjacency Map for O(1) connection lookups
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    nodes.forEach(n => map.set(n.id, new Set<string>()));
    edges.forEach(e => {
      if (!map.has(e.source)) map.set(e.source, new Set<string>());
      if (!map.has(e.target)) map.set(e.target, new Set<string>());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    });
    return map;
  }, [nodes, edges]);

  // Precompute Incident Edge Map for O(1) edge lookups
  const incidentEdgeMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    nodes.forEach(n => map.set(n.id, new Set<string>()));
    edges.forEach(e => {
      if (!map.has(e.source)) map.set(e.source, new Set<string>());
      if (!map.has(e.target)) map.set(e.target, new Set<string>());
      map.get(e.source)!.add(e.id);
      map.get(e.target)!.add(e.id);
    });
    return map;
  }, [nodes, edges]);

  // Active focus target: hovered node takes priority, else selected node
  const activeFocusId = hoveredNodeId || selectedNodeId;

  // Connected nodes of the active focus target
  const activeConnectedNodeIds = useMemo(() => {
    if (!activeFocusId) return null;
    const set = new Set<string>();
    set.add(activeFocusId);
    const neighbors = adjacencyMap.get(activeFocusId);
    if (neighbors) {
      neighbors.forEach(id => set.add(id));
    }
    return set;
  }, [activeFocusId, adjacencyMap]);

  // Connected edges of the active focus target
  const activeConnectedEdgeIds = useMemo(() => {
    if (!activeFocusId) return null;
    return incidentEdgeMap.get(activeFocusId) || new Set<string>();
  }, [activeFocusId, incidentEdgeMap]);

  // D3 Force Simulation references
  const simulationRef = useRef<d3Force.Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);

  // Sync live telemetry counter (ticks 1s to 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncTime(prev => (prev >= 5 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize and update simulation when nodes or edges change
  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || 800;
    const height = rect?.height || 600;

    // Center pan initially
    setPan({ x: width / 2, y: height / 2 });

    // Build SimNodes
    const simNodes: SimNode[] = nodes.map((n) => {
      const isBroker = !!n.is_broker || n.betweenness_score > 0.5;
      // Sizing scales with Betweenness Centrality
      let radius = 7;
      if (isBroker) {
        radius = 16;
      } else if (n.node_type === 'ANCHOR') {
        radius = 12;
      } else if (n.betweenness_score > 0.15) {
        radius = 10;
      } else if (n.betweenness_score > 0.05) {
        radius = 8.5;
      }

      // Initial coordinates: preserve previous if existed or randomize around center
      const existing = simNodesRef.current.find(sn => sn.id === n.id);
      return {
        id: n.id,
        raw: n,
        radius,
        isBroker,
        centrality: n.betweenness_score,
        x: existing?.x ?? (width / 2 + (Math.random() - 0.5) * 260),
        y: existing?.y ?? (height / 2 + (Math.random() - 0.5) * 260),
        vx: 0,
        vy: 0,
      };
    });

    // Build SimLinks
    const simLinks: SimLink[] = edges.map((e) => ({
      id: e.id,
      raw: e,
      source: e.source,
      target: e.target,
      isSuspicious: !!e.is_suspicious,
      weight: e.weight || 1,
    }));

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;

    // Create D3 Force Simulation
    const simulation = d3Force.forceSimulation<SimNode, SimLink>(simNodes)
      // Charge force: nodes repel each other
      .force('charge', d3Force.forceManyBody<SimNode>().strength((d) => d.isBroker ? -480 : -140))
      // Link force: pulls connected nodes to ideal distance
      .force('link', d3Force.forceLink<SimNode, SimLink>(simLinks)
        .id(d => d.id)
        .distance((l) => (l.isSuspicious ? 130 : 85))
        .strength(0.65)
      )
      // Collision force: prevents overlap
      .force('collide', d3Force.forceCollide<SimNode>().radius(d => d.radius + 6).strength(0.8))
      // Gentle centering force
      .force('center', d3Force.forceCenter<SimNode>(0, 0).strength(0.04))
      // Gentle breathing drift: keeps the Obsidian-style living feel
      .velocityDecay(0.35)
      .alpha(1)
      .alphaMin(0.001);

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  // Subtle continuous breathing motion at rest (Obsidian living feel)
  useEffect(() => {
    const interval = setInterval(() => {
      const sim = simulationRef.current;
      if (sim && sim.alpha() < 0.02 && !isDraggingNodeRef.current) {
        // Gently pulse the simulation with tiny energy
        sim.alphaTarget(0.015).restart();
        setTimeout(() => {
          sim.alphaTarget(0);
        }, 1200);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Main Canvas Rendering Loop (60 FPS with label collision avoidance & living telemetry)
  useEffect(() => {
    let animationFrameId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Apply Pan & Zoom Transform
      ctx.translate(pan.x, pan.y);
      ctx.scale(scale, scale);

      // 1. Draw Blueprint Background Grid
      const gridSize = 32;
      const minX = (-pan.x) / scale - 200;
      const maxX = (width - pan.x) / scale + 200;
      const minY = (-pan.y) / scale - 200;
      const maxY = (height - pan.y) / scale + 200;

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1 / scale;
      ctx.beginPath();
      const startX = Math.floor(minX / gridSize) * gridSize;
      const endX = Math.ceil(maxX / gridSize) * gridSize;
      for (let gx = startX; gx <= endX; gx += gridSize) {
        ctx.moveTo(gx, minY);
        ctx.lineTo(gx, maxY);
      }
      const startY = Math.floor(minY / gridSize) * gridSize;
      const endY = Math.ceil(maxY / gridSize) * gridSize;
      for (let gy = startY; gy <= endY; gy += gridSize) {
        ctx.moveTo(minX, gy);
        ctx.lineTo(maxX, gy);
      }
      ctx.stroke();

      // 1b. Ambient Horizontal Radar Scan Line (sweeps top-to-bottom every 7s)
      const scanCycle = 7000;
      const scanProgress = (time % scanCycle) / scanCycle;
      const scanY = minY + scanProgress * (maxY - minY);

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 209, 255, 0.22)';
      ctx.lineWidth = 1.2 / scale;
      ctx.beginPath();
      ctx.moveTo(minX, scanY);
      ctx.lineTo(maxX, scanY);
      ctx.stroke();

      // Faint trailing scan wash
      const trailHeight = 44 / scale;
      const grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
      grad.addColorStop(0, 'rgba(0, 209, 255, 0)');
      grad.addColorStop(1, 'rgba(0, 209, 255, 0.035)');
      ctx.fillStyle = grad;
      ctx.fillRect(minX, scanY - trailHeight, maxX - minX, trailHeight);
      ctx.restore();

      // 2. Draw Cluster Boundaries (Convex / Bounding annotations with rotating containment field)
      const boundaries = CASE_CLUSTERS[caseId] || CASE_CLUSTERS["CASE_2026_NOIDA_112"];
      if (boundaries) {
        // Group nodes by community
        const communityPoints = new Map<number, { x: number; y: number }[]>();
        simNodesRef.current.forEach(sn => {
          if (sn.x !== undefined && sn.y !== undefined) {
            const cid = sn.raw.community_id ?? 0;
            if (!communityPoints.has(cid)) communityPoints.set(cid, []);
            communityPoints.get(cid)!.push({ x: sn.x, y: sn.y });
          }
        });

        // Draw faint rotating dashed bounding oval for clusters
        communityPoints.forEach((pts, cid) => {
          if (pts.length < 2) return;
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          pts.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          });

          const pad = 38;
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const rx = Math.max((maxX - minX) / 2 + pad, 48);
          const ry = Math.max((maxY - minY) / 2 + pad, 36);

          ctx.save();
          ctx.setLineDash([5 / scale, 5 / scale]);
          ctx.lineDashOffset = -(time / 45) / scale; // Continuous slow rotation (~15s)
          ctx.strokeStyle = '#D5D5D2';
          ctx.lineWidth = 1 / scale;
          ctx.fillStyle = 'rgba(247, 247, 245, 0.4)';
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Cluster Label
          const b = boundaries[cid % boundaries.length];
          if (b && scale > 0.65) {
            ctx.font = `500 ${Math.max(9, 10 / scale)}px 'IBM Plex Mono', monospace`;
            ctx.fillStyle = '#8A8A8A';
            ctx.textAlign = 'left';
            ctx.fillText(`[ ${b.label} ]`, minX - 10, minY - 14);
          }
          ctx.restore();
        });
      }

      // 3. Draw Edges / Links with Data Packets & Priority Heat Map
      const currentLinks = simLinksRef.current;
      currentLinks.forEach((link) => {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return;

        const isHighlighted = activeConnectedEdgeIds !== null && activeConnectedEdgeIds.has(link.id);
        const hasFocus = activeFocusId !== null;
        const isDimmed = hasFocus && !isHighlighted;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.08 : isHighlighted ? 1.0 : 0.65;

        // Color & style
        if (priorityHeat) {
          const maxCentrality = Math.max(source.centrality, target.centrality);
          if (maxCentrality > 0.35 || source.isBroker || target.isBroker) {
            ctx.strokeStyle = '#DC2626';
            ctx.lineWidth = (isHighlighted ? 2.8 : 1.8) / scale;
            ctx.setLineDash([]);
          } else if (maxCentrality > 0.1) {
            ctx.strokeStyle = '#EAB308';
            ctx.lineWidth = (isHighlighted ? 2.2 : 1.4) / scale;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 1 / scale;
            ctx.setLineDash([]);
          }
        } else if (link.isSuspicious) {
          ctx.strokeStyle = '#D6483C';
          ctx.lineWidth = (isHighlighted ? 2.5 : 1.6) / scale;
          ctx.setLineDash([4 / scale, 3 / scale]);
        } else if (isHighlighted) {
          ctx.strokeStyle = '#00C2E0';
          ctx.lineWidth = 2.4 / scale;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = '#C7CDD2';
          ctx.lineWidth = 1.2 / scale;
          ctx.setLineDash(link.raw.source_type === 'BANK' ? [3 / scale, 3 / scale] : []);
        }

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        // Arrowhead on highlighted edges
        if (isHighlighted) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const angle = Math.atan2(dy, dx);
          const headLen = 7 / scale;
          const arrowX = target.x - Math.cos(angle) * (target.radius + 5);
          const arrowY = target.y - Math.sin(angle) * (target.radius + 5);

          ctx.fillStyle = priorityHeat ? '#DC2626' : (link.isSuspicious ? '#D6483C' : '#00C2E0');
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - headLen * Math.cos(angle - Math.PI / 6),
            arrowY - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - headLen * Math.cos(angle + Math.PI / 6),
            arrowY - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();

          // Data-Flow Packet Dots traveling along active link (1.4s loop)
          const packetProgress1 = ((time / 1400) % 1);
          const packetProgress2 = (((time / 1400) + 0.5) % 1);
          [packetProgress1, packetProgress2].forEach(p => {
            const px = source.x! + (target.x! - source.x!) * p;
            const py = source.y! + (target.y! - source.y!) * p;
            ctx.beginPath();
            ctx.arc(px, py, 2.2 / scale, 0, 2 * Math.PI);
            ctx.fillStyle = priorityHeat ? '#DC2626' : (link.isSuspicious ? '#D6483C' : '#00C2E0');
            ctx.fill();
          });
        }

        ctx.restore();
      });

      // 4. Draw Nodes with Confidence Rings & Scan Proximity Flash
      const currentNodes = simNodesRef.current;
      currentNodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;

        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNodeId === node.id;
        const isConnected = activeConnectedNodeIds !== null && activeConnectedNodeIds.has(node.id);
        const hasFocus = activeFocusId !== null;
        const isDimmed = hasFocus && !isConnected;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.18 : 1.0;

        // Scan line proximity highlight pulse (~150ms flash as scan crosses node)
        const distToScan = Math.abs(node.y - scanY);
        const isNearScan = distToScan < 22 / scale;
        const scanPulseAlpha = isNearScan ? (1 - distToScan / (22 / scale)) * 0.45 : 0;

        if (scanPulseAlpha > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6 / scale, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(0, 209, 255, ${scanPulseAlpha * 0.35})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 209, 255, ${scanPulseAlpha * 0.9})`;
          ctx.lineWidth = 1.5 / scale;
          ctx.stroke();
        }

        // Node Confidence Ring (Minority Report certainty indicator)
        const confidence = node.raw.confidence ?? (node.isBroker ? 0.92 : Math.min(0.96, Math.max(0.42, 0.45 + node.centrality * 1.8)));
        const ringRadius = node.radius + 3.2 / scale;
        const isHighConfidence = confidence >= 0.75 || node.isBroker;

        // Track (faint background circle)
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(218, 218, 216, 0.45)';
        ctx.lineWidth = 1 / scale;
        ctx.stroke();

        // Partial confidence arc
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * confidence);
        ctx.strokeStyle = isHighConfidence ? '#00D1FF' : '#9CA3AF';
        ctx.lineWidth = 1.4 / scale;
        ctx.stroke();

        // Outer Ring / Glow for selected or hovered node
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6 / scale, 0, 2 * Math.PI);
          ctx.strokeStyle = isSelected ? '#00C2E0' : '#1BA8D1';
          ctx.lineWidth = 2.5 / scale;
          ctx.stroke();
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

        if (priorityHeat) {
          if (node.isBroker || node.centrality > 0.35) {
            ctx.fillStyle = '#DC2626'; // High Priority: Red
            ctx.fill();
            ctx.strokeStyle = '#991B1B';
            ctx.lineWidth = 2.5 / scale;
            ctx.stroke();
          } else if (node.centrality > 0.1) {
            ctx.fillStyle = '#EAB308'; // Medium: Amber Gold
            ctx.fill();
            ctx.strokeStyle = '#CA8A04';
            ctx.lineWidth = 2 / scale;
            ctx.stroke();
          } else {
            ctx.fillStyle = '#94A3B8'; // Low: Slate Grey
            ctx.fill();
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 1 / scale;
            ctx.stroke();
          }
        } else if (node.isBroker) {
          // Central structural broker: Charcoal #1A1A1A with cyan border
          ctx.fillStyle = '#1A1A1A';
          ctx.fill();
          ctx.strokeStyle = '#00C2E0';
          ctx.lineWidth = 2.5 / scale;
          ctx.stroke();
        } else if (isHovered || (isConnected && hasFocus)) {
          // Connected active nodes: Electric Cyan fill
          ctx.fillStyle = '#00C2E0';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5 / scale;
          ctx.stroke();
        } else if (node.raw.node_type === 'ANCHOR') {
          // Complainant Anchor: Navy / White
          ctx.fillStyle = '#1E3A5F';
          ctx.fill();
          ctx.strokeStyle = '#DADAD8';
          ctx.lineWidth = 1 / scale;
          ctx.stroke();
        } else if (node.raw.is_locked) {
          // Gated lead: Pale Grey with Red Padlock Ring
          ctx.fillStyle = '#ECECE8';
          ctx.fill();
          ctx.strokeStyle = '#D6483C';
          ctx.lineWidth = 1.5 / scale;
          ctx.stroke();
        } else if (node.raw.category === 'BANK_ACCOUNT') {
          // Bank accounts: Navy
          ctx.fillStyle = '#1E3A5F';
          ctx.fill();
          ctx.strokeStyle = '#DADAD8';
          ctx.lineWidth = 1 / scale;
          ctx.stroke();
        } else {
          // Default node: Diagram Grey Fill, 1px darker stroke
          ctx.fillStyle = '#C7CDD2';
          ctx.fill();
          ctx.strokeStyle = '#8A8A8A';
          ctx.lineWidth = 1 / scale;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 5. Draw Labels with Collision Avoidance
      // Priority sorting: Focus node first, then Broker, then by centrality descending
      const sortedForLabels = [...currentNodes].sort((a, b) => {
        if (a.id === activeFocusId) return -1;
        if (b.id === activeFocusId) return 1;
        if (a.isBroker && !b.isBroker) return -1;
        if (!a.isBroker && b.isBroker) return 1;
        return b.centrality - a.centrality;
      });

      // Occupied bounding boxes for collision avoidance
      const occupiedBoxes: { x1: number; y1: number; x2: number; y2: number }[] = [];

      sortedForLabels.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;

        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNodeId === node.id;
        const isConnected = activeConnectedNodeIds !== null && activeConnectedNodeIds.has(node.id);
        const hasFocus = activeFocusId !== null;

        // Label visibility rules:
        // - In focus mode: Only hovered and directly connected nodes show labels
        // - At rest: Structural broker always shows label; others show if high centrality or scale >= 0.8
        let showLabel = false;
        if (hasFocus) {
          showLabel = isConnected;
        } else {
          showLabel = node.isBroker || (node.centrality > 0.12 && scale > 0.65) || scale >= 0.95;
        }

        if (!showLabel) return;

        ctx.save();
        const fontSize = Math.max(9, (node.isBroker ? 12 : 10) / scale);
        ctx.font = `${isHovered || isSelected || node.isBroker ? '600' : '400'} ${fontSize}px 'IBM Plex Mono', monospace`;

        const labelText = node.raw.label;
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize * 1.2;

        const padX = 6 / scale;
        const padY = 3 / scale;
        const boxWidth = textWidth + padX * 2;
        const boxHeight = textHeight + padY * 2;

        const labelX = node.x - boxWidth / 2;
        let labelY = node.y + node.radius + 4 / scale;

        // Collision avoidance check against already drawn labels
        let collides = occupiedBoxes.some(box => (
          labelX < box.x2 &&
          labelX + boxWidth > box.x1 &&
          labelY < box.y2 &&
          labelY + boxHeight > box.y1
        ));

        // If collides, try offsetting vertically
        if (collides && !isHovered && !isSelected && !node.isBroker) {
          labelY = node.y - node.radius - boxHeight - 4 / scale;
          collides = occupiedBoxes.some(box => (
            labelX < box.x2 &&
            labelX + boxWidth > box.x1 &&
            labelY < box.y2 &&
            labelY + boxHeight > box.y1
          ));
        }

        // If still collides and not high priority, skip to keep graph clean
        if (collides && !isHovered && !isSelected && !node.isBroker) {
          ctx.restore();
          return;
        }

        // Register box
        occupiedBoxes.push({
          x1: labelX,
          y1: labelY,
          x2: labelX + boxWidth,
          y2: labelY + boxHeight,
        });

        // Pill Backdrop: Dark charcoal pill for active/connected, clean white for rest
        const isHighlight = isHovered || isSelected || (hasFocus && isConnected);
        ctx.fillStyle = isHighlight ? '#1A1A1A' : 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = isHighlight ? '#00C2E0' : '#DADAD8';
        ctx.lineWidth = 1 / scale;

        // Rounded pill box
        const r = 3 / scale;
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, boxWidth, boxHeight, [r, r, r, r]);
        ctx.fill();
        ctx.stroke();

        // Label Text
        ctx.fillStyle = isHighlight ? '#FFFFFF' : '#1A1A1A';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, labelX + padX, labelY + boxHeight / 2);

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pan, scale, hoveredNodeId, selectedNodeId, activeFocusId, activeConnectedNodeIds, activeConnectedEdgeIds, caseId, priorityHeat]);

  // Convert client coordinate to simulation world coordinate
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / scale;
    const y = (clientY - rect.top - pan.y) / scale;
    return { x, y };
  }, [pan, scale]);

  // Find node under cursor
  const findNodeAtScreenPos = useCallback((clientX: number, clientY: number) => {
    const { x, y } = screenToWorld(clientX, clientY);
    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.x !== undefined && node.y !== undefined) {
        const dx = node.x - x;
        const dy = node.y - y;
        const hitRadius = Math.max(node.radius + 6, 14);
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return node;
        }
      }
    }
    return null;
  }, [screenToWorld]);

  // Mouse Handlers: Canvas Panning vs Node Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const hitNode = findNodeAtScreenPos(e.clientX, e.clientY);
    if (hitNode) {
      // Start Dragging Node & Pin in Simulation
      isDraggingNodeRef.current = true;
      setIsDraggingNode(true);
      draggedNodeRef.current = hitNode;
      hitNode.fx = hitNode.x;
      hitNode.fy = hitNode.y;

      const sim = simulationRef.current;
      if (sim) {
        // Reheat simulation so surrounding graph re-settles around dragged node
        sim.alphaTarget(0.3).restart();
      }
    } else {
      // Start Canvas Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNodeRef.current && draggedNodeRef.current) {
      // Update pinned coordinates to follow cursor
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      draggedNodeRef.current.fx = x;
      draggedNodeRef.current.fy = y;
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Hover detection
    const hitNode = findNodeAtScreenPos(e.clientX, e.clientY);
    if (hitNode) {
      setHoveredNodeId(hitNode.id);
    } else {
      setHoveredNodeId(null);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingNodeRef.current && draggedNodeRef.current) {
      // Release pinned node back into physics simulation
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      isDraggingNodeRef.current = false;
      setIsDraggingNode(false);

      const sim = simulationRef.current;
      if (sim) {
        sim.alphaTarget(0); // Cool simulation back down
      }
    }

    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const hitNode = findNodeAtScreenPos(e.clientX, e.clientY);
    if (hitNode) {
      onSelectNode(hitNode.raw);
      // Gentle center pan towards selected node
      if (containerRef.current && hitNode.x !== undefined && hitNode.y !== undefined) {
        const rect = containerRef.current.getBoundingClientRect();
        const targetX = rect.width / 2 - hitNode.x * scale;
        const targetY = rect.height / 2 - hitNode.y * scale;
        setPan({ x: targetX, y: targetY });
      }
    } else {
      // Clicked empty canvas: deselect
      onSelectNode(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 
      ? Math.min(scale * zoomFactor, 3.0) 
      : Math.max(scale / zoomFactor, 0.35);

    // Zoom centered on cursor position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
      const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);
      setPan({ x: newPanX, y: newPanY });
    }
    setScale(newScale);
  };

  const handleZoomIn = () => setScale(s => Math.min(s * 1.15, 3.0));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.15, 0.35));
  const handleReset = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    setPan({ x: (rect?.width || 800) / 2, y: (rect?.height || 600) / 2 });
    setScale(1.0);
    const sim = simulationRef.current;
    if (sim) sim.alpha(0.5).restart();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[640px] overflow-hidden border border-[#DADAD8] bg-[#F2F2F0] select-none ${
        isDraggingNode ? 'cursor-grabbing' : isPanning ? 'cursor-grabbing' : hoveredNodeId ? 'cursor-pointer' : 'cursor-grab'
      }`}
    >
      {/* Viewfinder L-Corner Marks */}
      <div className="corner-bracket-tl" />
      <div className="corner-bracket-tr" />
      <div className="corner-bracket-bl" />
      <div className="corner-bracket-br" />

      {/* Peripheral Vision Telemetry (Person of Interest Machine Aesthetic) */}
      <div className="absolute top-1 left-28 right-96 pointer-events-none opacity-[0.045] text-[8px] font-mono tracking-widest text-[#1A1A1A] select-none truncate">
        SYS.THREAD 0x88F2 // MESH.TOPOLOGY 42.8ms // PARSING FIR 112/2026 // NODE.BC.RECALC // STREAM LATENCY 1.2ms // COORD VECTOR 85.9°
      </div>
      <div className="absolute bottom-2 left-6 right-6 pointer-events-none opacity-[0.045] text-[8px] font-mono tracking-widest text-[#1A1A1A] select-none flex justify-between">
        <span>HEX.STREAM: 0x4E594159414752415048 // MEM.ALLOC 24.8MB // ENCRYPTION AES-GCM-256</span>
        <span>RADAR.SWEEP 7000ms // CONVEX.DECOMPOSITION LOUVAIN // ANCHOR BNS.63(4)</span>
      </div>

      {/* Top Left HUD Schematic Header */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-3 text-[11px] font-mono tracking-[0.14em] text-[#8A8A8A] uppercase pointer-events-none">
        <span className="text-[#1A1A1A] font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00D1FF]" />
          <span>[ D3 FORCE-DIRECTED GRAPH SIMULATION ]</span>
        </span>
        <span>•</span>
        <span className="text-[#00D1FF]">DRAGGABLE PHYSICS // LIVING DRIFT</span>
        <span>•</span>
        <span>{nodes.length} NODES // {edges.length} TIES</span>
        <span>•</span>
        <span className="text-[#00D1FF] flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
          <span>LAST SYNC: {syncTime}s AGO</span>
        </span>
      </div>

      {/* Top Right Zoom Controls, Priority Heat & Legend Toggle */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5 bg-[#F7F7F5] border border-[#DADAD8] p-1 rounded-[2px] shadow-none">
        <button
          onClick={() => setPriorityHeat(v => !v)}
          title="Toggle Priority Heat Map (Centrality Heat Analysis)"
          className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-[1px] transition-colors flex items-center gap-1 ${
            priorityHeat 
              ? 'bg-[#DC2626] text-white font-bold' 
              : 'text-[#8A8A8A] hover:text-[#DC2626] hover:bg-[#FEE2E2]'
          }`}
        >
          <Flame className="w-3 h-3 text-current" />
          <span>PRIORITY HEAT</span>
        </button>
        <div className="h-3 w-[1px] bg-[#DADAD8] mx-0.5" />
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#EAEAE8] rounded-[1px] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1 text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#EAEAE8] rounded-[1px] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="px-2 py-0.5 text-[10px] font-mono text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#EAEAE8] rounded-[1px] transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{Math.round(scale * 100)}%</span>
        </button>
        <div className="h-3 w-[1px] bg-[#DADAD8] mx-0.5" />
        <button
          onClick={() => setLegendUserOverride(v => (v !== null ? !v : !externalShowLegend))}
          title="Toggle Legend"
          className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-[1px] transition-colors flex items-center gap-1 ${
            showLegend ? 'bg-[#00D1FF] text-[#1A1A1A] font-bold' : 'text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#EAEAE8]'
          }`}
        >
          <HelpCircle className="w-3 h-3" />
          <span>LEGEND</span>
        </button>
      </div>

      {/* Floating Legend Panel */}
      {showLegend && (
        <div className="absolute top-14 right-6 z-30 w-80 bg-white border border-[#DADAD8] p-4 rounded-[2px] shadow-none font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#E7E7E5] pb-2 mb-3">
            <span className="text-[10px] tracking-widest text-[#1A1A1A] uppercase font-bold">
              PHYSICS GRAPH TOPOLOGY LEGEND
            </span>
            <button onClick={() => setLegendUserOverride(false)} className="text-[#8A8A8A] hover:text-[#1A1A1A]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-[11px]">
            {priorityHeat && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] p-2 rounded-[1px]">
                <div className="text-[9px] text-[#DC2626] uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> PRIORITY HEAT GRADIENT ACTIVE
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-[#1A1A1A]">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-[#DC2626] rounded-full" />
                    <span>BROKER / HIGH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-[#EAB308] rounded-full" />
                    <span>MEDIUM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-[#94A3B8] rounded-full" />
                    <span>PERIPHERAL</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider mb-1.5 font-semibold">
                NODE ENTITY TYPES
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#00C2E0] rounded-full" />
                  <span className="text-[10px] text-[#1A1A1A]">ACTIVE / HOVER</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#1A1A1A] border border-[#00C2E0] rounded-full flex items-center justify-center text-[7px] text-white">
                    ★
                  </div>
                  <span className="text-[10px] text-[#1A1A1A] font-bold">BROKER (HUB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#1E3A5F] rounded-full" />
                  <span className="text-[10px] text-[#1A1A1A]">BANK / ANCHOR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#C7CDD2] border border-[#8A8A8A] rounded-full" />
                  <span className="text-[10px] text-[#8A8A8A]">PERIPHERAL</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E7E7E5] pt-2.5">
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider mb-1.5 font-semibold">
                EVIDENTIARY RELATIONSHIPS
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-[2px] bg-[#00C2E0]" />
                    <span className="text-[10px] text-[#00C2E0] font-semibold">ACTIVE PATH</span>
                  </div>
                  <span className="text-[9px] text-[#8A8A8A]">CYAN WIRE</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-[2px] border-b border-dashed border-[#D6483C]" />
                    <span className="text-[10px] text-[#D6483C]">MULE ESCROW</span>
                  </div>
                  <span className="text-[9px] text-[#8A8A8A]">DASHED RED</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-[1px] bg-[#C7CDD2]" />
                    <span className="text-[10px] text-[#8A8A8A]">STANDARD LINK</span>
                  </div>
                  <span className="text-[9px] text-[#8A8A8A]">GREY WIRE</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E7E7E5] pt-2 text-[9px] text-[#8A8A8A] leading-tight">
              * Click and drag any node to pin it. Hover to spotlight direct connections; click to lock inspection dossier. Ambient radar line checks live entity certainty every 7s.
            </div>
          </div>
        </div>
      )}

      {/* Main High-Performance HTML5 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
