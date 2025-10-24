import { useState, useEffect } from "react";
import { Maximize2, Layers, Palette, Search, Sparkles } from "lucide-react";
import { Pickaxe, Gem, Mountain, Drill } from "lucide-react";


interface Node {
  id: string;
  type: "process" | "step" | "artifact" | "ttp";
  label: string;
  x: number;
  y: number;
}

interface GraphExplorerProps {
  selectedNodes: string[];
  onNodeSelect: (nodes: string[]) => void;
  mode: 'mining' | 'discovery';
  onModeChange: (mode: 'mining' | 'discovery') => void;
}

// Mock data for demonstration
const mockNodes: Node[] = [
  { id: "p1", type: "process", label: "C2 Library Dev", x: 200, y: 150 },
  { id: "p2", type: "process", label: "Network Detection", x: 500, y: 150 },
  { id: "s1", type: "step", label: "Refactor Module", x: 150, y: 300 },
  { id: "s2", type: "step", label: "Unit Testing", x: 350, y: 300 },
  { id: "s3", type: "step", label: "Deploy Agent", x: 550, y: 300 },
  { id: "a1", type: "artifact", label: "test_results.json", x: 100, y: 450 },
  { id: "a2", type: "artifact", label: "sliver_agent_v2", x: 300, y: 450 },
  { id: "a3", type: "artifact", label: "pcap_analysis", x: 500, y: 450 },
  { id: "t1", type: "ttp", label: "T1071 - C&C", x: 700, y: 300 },
];

const GraphExplorer = ({ selectedNodes, onNodeSelect, mode, onModeChange }: GraphExplorerProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [heatMapMode, setHeatMapMode] = useState(false);
  const [aiHighlightedNodes, setAiHighlightedNodes] = useState<string[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // AI-detected patterns for Discovery mode
  const automationNodes = ["s1", "s2", "a2"];
  const similarityNodes = ["s1", "s2"]; // Similar scripts
  const bottleneckNodes = ["a2"]; // Bottleneck in process

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('graph-explorer-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('graph-explorer-visited', 'true');

      // Auto-dismiss tooltip after 5 seconds
      setTimeout(() => setIsFirstVisit(false), 5000);
    }
  }, []);

  // Discovery mode: Auto-highlight patterns on mode switch
  useEffect(() => {
    if (mode === 'discovery') {
      // Simulate AI analysis - highlight interesting nodes
      setAiHighlightedNodes([...automationNodes, ...similarityNodes, ...bottleneckNodes]);
    } else {
      setAiHighlightedNodes([]);
    }
  }, [mode]);

  const getNodeColor = (type: string) => {
    const colors = {
      process: "hsl(var(--node-process))",
      step: "hsl(var(--node-step))",
      artifact: "hsl(var(--node-artifact))",
      ttp: "hsl(var(--node-ttp))",
    };
    return colors[type as keyof typeof colors];
  };

  const getNodeBadge = (nodeId: string) => {
    if (mode === 'discovery') {
      if (automationNodes.includes(nodeId)) return "🤖";
      if (similarityNodes.includes(nodeId)) return "🔄";
      if (bottleneckNodes.includes(nodeId)) return "⚠️";
    }
    return null;
  };

  const handleNodeClick = (nodeId: string) => {
    if (mode === 'mining') {
      // Mining mode: Manual selection toggle
      if (selectedNodes.includes(nodeId)) {
        onNodeSelect(selectedNodes.filter(id => id !== nodeId));
      } else {
        onNodeSelect([...selectedNodes, nodeId]);
      }
    } else {
      // Discovery mode: Show insight about why this node is interesting
      // This would trigger the ChatAssistant to explain the node
      console.log("Discovery mode: Explaining node", nodeId);
      onNodeSelect([nodeId]);
    }
  };

  const isAiHighlighted = (nodeId: string) => {
    return mode === 'discovery' && aiHighlightedNodes.includes(nodeId);
  };

  return (
    <div className="h-full neo-card overflow-hidden flex flex-col">
      {/* Graph Controls */}
      <div className="p-4 border-b-[3px] border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="neo-card p-1 flex gap-1 bg-card">
              <button
                onClick={() => onModeChange('mining')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${mode === 'mining'
                  ? 'bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-transparent hover:bg-muted text-foreground'
                  }`}
              >
                <Pickaxe className="w-4 h-4" />
                Mining
              </button>
              <button
                onClick={() => onModeChange('discovery')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${mode === 'discovery'
                  ? 'bg-accent-pink text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-transparent hover:bg-muted text-foreground'
                  }`}
              >
                <Gem className="w-4 h-4" />
                Discovery
              </button>
            </div>

            <div className="relative">
              {mode === 'discovery' && (
                <>
                  <svg className="sparkle w-6 h-6 absolute -top-2 -left-3 rotate-12" viewBox="0 0 24 24" fill="hsl(var(--accent-pink))">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                  <h3 className="font-extrabold text-xl">Data Discovery</h3>
                  <svg className="sparkle w-5 h-5 absolute -top-1 -right-6 -rotate-12" viewBox="0 0 24 24" fill="hsl(var(--accent-teal))">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                </>
              )}
              {mode === 'mining' && (
                <h3 className="font-extrabold text-xl">Data Mining</h3>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'mining' && (
              <button
                onClick={() => setHeatMapMode(!heatMapMode)}
                className={`neo-button-secondary flex items-center gap-2 ${heatMapMode ? 'bg-accent-pink text-foreground' : ''}`}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">{heatMapMode ? '🔥 Heat Map' : 'Color by Type'}</span>
              </button>
            )}
            <button className="neo-button-secondary flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="text-sm">Layout</span>
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* First Visit Tooltip for Discovery Mode */}
      {isFirstVisit && mode === 'discovery' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 neo-card p-4 z-50 bg-card animate-bounce max-w-md">
          <button
            onClick={() => setIsFirstVisit(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
          >
            ×
          </button>
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-accent-pink mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">
                ✨ Discovery mode is active!
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I'm highlighting interesting patterns with badges and glows. Click nodes to learn why they're important.
                Switch to <Search className="w-3 h-3 inline" /> Mining mode for manual control.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <div className="flex-1 relative bg-background/50 overflow-hidden">
        <svg className="w-full h-full">
          {/* Draw connections */}
          <g opacity={mode === 'discovery' ? 0.3 : 0.4}>
            <line x1="200" y1="150" x2="150" y2="300" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="200" y1="150" x2="350" y2="300" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="500" y1="150" x2="550" y2="300" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="150" y1="300" x2="100" y2="450" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="350" y1="300" x2="300" y2="450" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="550" y1="300" x2="500" y2="450" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="500" y1="150" x2="700" y2="300" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
          </g>

          {/* Discovery mode: Highlight connections between similar nodes */}
          {mode === 'discovery' && (
            <g className="animate-pulse">
              <line
                x1="150" y1="300" x2="350" y2="300"
                stroke="hsl(var(--accent-pink))"
                strokeWidth="3"
                opacity="0.6"
                strokeDasharray="5,5"
              />
            </g>
          )}

          {/* Draw nodes */}
          {mockNodes.map((node) => {
            const isSelected = selectedNodes.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const isHighlighted = isAiHighlighted(node.id);
            const radius = node.type === "process" ? 40 : 30;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Discovery mode: AI highlight glow */}
                {isHighlighted && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke="hsl(var(--accent-pink))"
                    strokeWidth="2"
                    opacity="0.4"
                    className="animate-pulse"
                  />
                )}

                <circle
                  r={radius}
                  fill={getNodeColor(node.type)}
                  fillOpacity={isSelected ? 1 : 0.7}
                  stroke="hsl(var(--border))"
                  strokeWidth={isSelected ? 4 : 2}
                  className={`transition-all ${isSelected ? "animate-pulse-border" : ""}`}
                  style={{
                    filter: isHighlighted
                      ? "brightness(1.2) drop-shadow(0 0 12px hsl(var(--accent-pink)))"
                      : isHovered
                        ? "brightness(1.2) drop-shadow(0 0 8px hsl(var(--accent-pink)))"
                        : isSelected
                          ? "drop-shadow(0 0 6px hsl(var(--accent-pink)))"
                          : "none",
                    transform: isHovered ? "scale(1.1)" : isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                />

                {/* Node Badge (Discovery mode) */}
                {getNodeBadge(node.id) && (
                  <text
                    y={-radius - 5}
                    textAnchor="middle"
                    className="text-lg"
                    style={{ pointerEvents: "none" }}
                  >
                    {getNodeBadge(node.id)}
                  </text>
                )}

                <text
                  y={radius + 20}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-current"
                  style={{ pointerEvents: "none" }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 neo-card p-4 space-y-2 bg-card">
          <div className="text-xs font-bold mb-2">
            {mode === 'discovery' ? 'AI Insights' : 'Node Types'}
          </div>
          {mode === 'discovery' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span className="text-xs">Automation Opportunity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">🔄</span>
                <span className="text-xs">Similar Pattern</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="text-xs">Bottleneck</span>
              </div>
            </>
          ) : (
            <>
              {["process", "step", "artifact", "ttp"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{ backgroundColor: getNodeColor(type) }}
                  />
                  <span className="text-xs capitalize">{type}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Mini Map */}
        <div className="absolute bottom-4 right-4 neo-card p-2 bg-card">
          <div className="w-32 h-24 bg-secondary/50 rounded-lg relative overflow-hidden">
            {mockNodes.map((node) => (
              <div
                key={node.id}
                className={`absolute w-2 h-2 rounded-full ${isAiHighlighted(node.id) ? 'ring-2 ring-accent-pink' : ''
                  }`}
                style={{
                  backgroundColor: getNodeColor(node.type),
                  left: `${(node.x / 800) * 100}%`,
                  top: `${(node.y / 600) * 100}%`,
                }}
              />
            ))}
          </div>
          <div className="text-[10px] text-center mt-1 font-semibold">Mini Map</div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t-[3px] border-border bg-secondary/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Nodes: {mockNodes.length}</span>
          <span className="font-semibold">Selected: {selectedNodes.length}</span>
          {mode === 'discovery' && (
            <span className="font-semibold text-accent-pink">
              ✨ {aiHighlightedNodes.length} AI Insights
            </span>
          )}
        </div>
        <div className="text-muted-foreground">
          {mode === 'discovery' ? 'AI-guided exploration' : 'Manual exploration'} | Zoom: 100%
        </div>
      </div>
    </div>
  );
};

export default GraphExplorer;