"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { GeistMono } from "geist/font/mono";

const PROMPT_TEXT = "A close-up portrait of a woman with striking features, soft natural lighting from the left, shallow depth of field, photorealistic rendering";

// Node types
type NodeType = "input" | "output";

interface NodeConfig {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  image?: string;
  images?: string[];
  video?: string;
  noBackground?: boolean;
}

interface Connection {
  from: string;
  to: string;
}

// Node configurations
const nodes: NodeConfig[] = [
  {
    id: "system-prompt",
    label: "System prompt",
    type: "input",
    x: 0,
    y: 18,
    width: 19,
    height: 225,
    content:
      "- Interpret user descriptions accurately and translate them into detailed visual compositions - Default to photorealistic style unless otherwise specified - Consider lighting, composition, and color harmony in all generations",
  },
  {
    id: "prompt",
    label: "prompt",
    type: "input",
    x: 8,
    y: 62,
    width: 22,
    height: 182,
  },
  {
    id: "img-output",
    label: "[IMG] output",
    type: "output",
    x: 39,
    y: 13,
    width: 22,
    height: 358,
    image: "/images/face.png",
  },
  {
    id: "alt-img-output",
    label: "[alt.IMG] output",
    type: "output",
    x: 72,
    y: 0,
    width: 28,
    height: 174,
    images: ["/images/alt1.png", "/images/alt2.png", "/images/alt3.png"],
    noBackground: true,
  },
  {
    id: "vid-output",
    label: "[VID] output",
    type: "output",
    x: 71,
    y: 50,
    width: 14,
    height: 228,
    video: "/videos/smile.mp4",
  },
];

// Connections between nodes
const connections: Connection[] = [
  { from: "system-prompt", to: "img-output" },
  { from: "prompt", to: "img-output" },
  { from: "img-output", to: "alt-img-output" },
  { from: "img-output", to: "vid-output" },
];

function Label({ children, type, blink }: { children: React.ReactNode; type: NodeType; blink?: boolean }) {
  return (
    <div className="flex gap-[11px] items-center mb-2 pointer-events-none select-none">
      <div
        className={`size-[14px] rounded-full ${
          type === "input" ? "bg-[#e74c3c]" : "bg-[#2ecc71]"
        } ${blink ? "animate-pulse" : ""}`}
        style={blink ? { animationDuration: "1s" } : undefined}
      />
      <p className={`${GeistMono.className} text-[14px] whitespace-nowrap`} style={{ color: '#000000' }}>
        {children}
      </p>
    </div>
  );
}

function TypingPrompt({ text, isActive, onComplete }: { text: string; isActive: boolean; onComplete?: (complete: boolean) => void }) {
  const [charIndex, setCharIndex] = useState(0);
  const isComplete = charIndex >= text.length;

  // Typing animation - only runs while active (frame hovered) and not complete
  useEffect(() => {
    if (!isActive || isComplete) return;

    const interval = setInterval(() => {
      setCharIndex((prev) => Math.min(prev + 1, text.length));
    }, 50);

    return () => clearInterval(interval);
  }, [text, isActive, isComplete]);

  // Notify parent of completion state
  useEffect(() => {
    onComplete?.(isComplete);
  }, [isComplete, onComplete]);

  return (
    <div className="bg-[#3d3b3b] rounded-[25px] w-full px-[15px] py-[24px] min-h-[60px]">
      <p className={`text-[12px] leading-normal ${GeistMono.className}`} style={{ color: '#ffffff' }}>
        {text.slice(0, charIndex)}
        {!isComplete && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
}

export default function IntelligenceDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const timeOffsets = useRef<Map<string, number>>(new Map());
  const [, forceUpdate] = useState(0);
  const [isFrameHovered, setIsFrameHovered] = useState(false);
  const [promptComplete, setPromptComplete] = useState(false);

  // Initialize time offsets for each node
  useEffect(() => {
    nodes.forEach((node) => {
      timeOffsets.current.set(node.id, Math.random() * 1000);
    });
    forceUpdate((n) => n + 1);
  }, []);

  // Animation loop for floating and line updates
  useAnimationFrame((time) => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    const containerRect = container.getBoundingClientRect();

    // Calculate positions for all nodes
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();

    nodes.forEach((node) => {
      const el = nodeRefs.current.get(node.id);
      if (!el) return;

      const timeOffset = timeOffsets.current.get(node.id) || 0;

      // Calculate float offset
      const speed = 0.0008;
      const amplitude = 6;
      const t = time * speed + timeOffset;
      const floatX = Math.sin(t) * amplitude;
      const floatY = Math.cos(t * 0.7) * amplitude;

      // Apply transform
      el.style.transform = `translate(${floatX}px, ${floatY}px)`;

      // Get position for line drawing
      const rect = el.getBoundingClientRect();
      positions.set(node.id, {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      });
    });

    // Update SVG paths
    const pathElements = svg.querySelectorAll("path");
    const circleGroups = svg.querySelectorAll("g");

    connections.forEach((conn, i) => {
      const fromPos = positions.get(conn.from);
      const toPos = positions.get(conn.to);

      if (!fromPos || !toPos) return;

      // Connection points (right side to left side)
      const x1 = fromPos.x + fromPos.width;
      const y1 = fromPos.y + fromPos.height / 2;
      const x2 = toPos.x;
      const y2 = toPos.y + toPos.height / 2;

      // Bezier curve
      const midX = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

      if (pathElements[i]) {
        pathElements[i].setAttribute("d", path);
      }

      // Update dots
      if (circleGroups[i]) {
        const circles = circleGroups[i].querySelectorAll("circle");
        if (circles[0]) {
          circles[0].setAttribute("cx", String(x1));
          circles[0].setAttribute("cy", String(y1));
        }
        if (circles[1]) {
          circles[1].setAttribute("cx", String(x2));
          circles[1].setAttribute("cy", String(y2));
        }
      }
    });
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsFrameHovered(true)}
      onMouseLeave={() => setIsFrameHovered(false)}
    >
      {/* Radial gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(229,210,210,1) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* Connection lines SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {connections.map((_, i) => (
          <path
            key={`path-${i}`}
            d=""
            fill="none"
            stroke="#3d3b3b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        {connections.map((_, i) => (
          <g key={`dots-${i}`}>
            <circle r="3" fill="#3d3b3b" />
            <circle r="3" fill="#3d3b3b" />
          </g>
        ))}
      </svg>

      {/* Nodes */}
      <div className="absolute left-[6%] top-[12%] w-[88%] h-[80%]">
        {nodes.map((node) => (
          <div
            key={node.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
            }}
            className="absolute"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.width}%`,
            }}
          >
            <motion.div
              whileHover={node.images ? undefined : { scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ transformOrigin: "center center" }}
            >
              <Label type={node.type} blink={node.id === "prompt" && !promptComplete}>{node.label}</Label>
              {node.images ? (
                <div
                  className="flex gap-2 w-full"
                  style={{ height: node.height }}
                >
                  {node.images.map((img, i) => (
                    <motion.img
                      key={i}
                      src={img}
                      alt=""
                      className="h-full w-auto object-contain rounded-[25px]"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  ))}
                </div>
              ) : node.id === "prompt" ? (
                <TypingPrompt text={PROMPT_TEXT} isActive={isFrameHovered} onComplete={setPromptComplete} />
              ) : (
                <div
                  className="bg-[#3d3b3b] rounded-[25px] w-full relative overflow-hidden"
                  style={{ height: node.height }}
                >
                  {node.content && (
                    <p className={`absolute left-[15px] top-[24px] right-[15px] text-[12px] leading-normal pointer-events-none ${GeistMono.className}`} style={{ color: '#ffffff' }}>
                      {node.content}
                    </p>
                  )}
                  {node.image && (
                    <img
                      src={node.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  )}
                  {node.video && (
                    <video
                      src={node.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
