import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import * as d3 from "d3-force";
import { Button } from "@/components/ui/button";
import { notifyPowerBIUpdate } from "@/lib/powerbiSync";

import {
    Maximize2, Layers, Sparkles, Zap, Palette, Search,
    ZoomIn, ZoomOut, Minimize2, Activity, Database,
    Shield, Server, Cloud, Globe, Lock, Users, Loader2
} from "lucide-react";
import { Pickaxe, Gem } from "lucide-react";

// API Configuration
const API_BASE = "http://localhost:8000";

// Cluster metadata
const clusterInfo = {
    content_dev: {
        name: "Content Dev",
        color: "#ed50d3ff",
        description: "Scenario research, design, and handbook creation"
    },
    opfor: {
        name: "OPFOR",
        color: "#33ee42ff",
        description: "Red team operations and attack execution"
    },
    automation: {
        name: "Automation",
        color: "#d12727ff",
        description: "Attack automation scripts and C2 integration"
    },
    range: {
        name: "Range",
        color: "#1943b4ff",
        description: "Infrastructure management and environment setup"
    }
};

interface GraphExplorerProps {
    selectedNodes: string[];
    onNodeSelect: (nodes: string[]) => void;
    mode: "mining" | "discovery";
    onModeChange: (mode: "mining" | "discovery") => void;
    onCaptureGem?: (nodeData: {
        id: string;
        label: string;
        type: string;
        cluster: string;
        importance?: number;
    }) => void;
}

interface GraphData {
    nodes: Array<{
        id: string;
        label: string;
        cluster: string;
        type: string;
        importance: number;
        size: number;
    }>;
    edges: Array<{
        id: string;
        source: string;
        target: string;
        type: string;
        weight: number;
    }>;
}

const GraphExplorer: React.FC<GraphExplorerProps> = ({
    selectedNodes,
    onNodeSelect,
    mode,
    onModeChange,
    onCaptureGem,
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const simulationRef = useRef<any>(null);
    const isDraggingRef = useRef(false);
    const draggedNodeRef = useRef<string | null>(null);

    const [heatMapMode, setHeatMapMode] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [activeCluster, setActiveCluster] = useState<string | null>(null);
    const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
    const [showHulls, setShowHulls] = useState(true);

    // Depth exploration state
    const [explorationMode, setExplorationMode] = useState(false);
    const [explorationDepth, setExplorationDepth] = useState(1);
    const [exploredFromNode, setExploredFromNode] = useState<string | null>(null);
    const [lastClickedNode, setLastClickedNode] = useState<string | null>(null);

    // API data state
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });

    // Fetch graph data from ArangoDB
    const fetchGraphData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Fetching graph data from ArangoDB...');

            const response = await fetch(`${API_BASE}/graph`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: GraphData = await response.json();
            console.log('✅ Graph data loaded:', data);
            console.log(`   📊 ${data.nodes.length} nodes, ${data.edges.length} edges`);

            setGraphData(data);
            return data;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to fetch graph data";
            console.error('❌ Failed to load graph:', err);
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if first visit
    useEffect(() => {
        const hasVisited = localStorage.getItem('graph-explorer-visited');
        if (!hasVisited) {
            setIsFirstVisit(true);
            localStorage.setItem('graph-explorer-visited', 'true');
            setTimeout(() => setIsFirstVisit(false), 5000);
        }
    }, []);

    // Explore neighbors at specific depth
    const exploreNeighbors = async (nodeId: string, depth: number) => {
        try {
            const nodeKey = nodeId.replace('nodes/', '');
            console.log(`🔍 Exploring neighbors of ${nodeKey} at depth ${depth}...`);

            const response = await fetch(`${API_BASE}/neighbors/${nodeKey}?depth=${depth}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch neighbors: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Neighbors found:', data);

            // Clear selection first
            onNodeSelect([]);

            // Update graph data
            setGraphData({
                nodes: data.nodes,
                edges: data.edges
            });

            setExplorationMode(true);
            setExploredFromNode(nodeId);

            // Select all discovered nodes after a brief delay
            setTimeout(() => {
                const nodeIds = data.nodes.map((n: any) => n.id);
                onNodeSelect(nodeIds);
            }, 100);

        } catch (err) {
            console.error('❌ Failed to explore neighbors:', err);
            alert(`Failed to explore: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Reset to full graph view
    const resetToFullGraph = async () => {
        try {
            console.log('🔄 Resetting to full graph...');
            const data = await fetchGraphData();
            setExplorationMode(false);
            setExploredFromNode(null);
            onNodeSelect([]);
            console.log('✅ Reset complete');
        } catch (err) {
            console.error('Failed to reset graph:', err);
        }
    };

    // Create physics simulation with D3
    const createPhysicsSimulation = useCallback((initialNodes: any[], initialEdges: any[]) => {
        const simulationNodes = initialNodes.map((n) => ({
            ...n,
            x: n.position.x,
            y: n.position.y,
            vx: 0,
            vy: 0,
        }));

        const simulationEdges = initialEdges.map((e) => ({
            source: e.source,
            target: e.target,
        }));

        const simulation = d3
            .forceSimulation(simulationNodes)
            .force(
                "link",
                d3.forceLink(simulationEdges)
                    .id((d: any) => d.id)
                    .distance(200)
                    .strength(0.5)
            )
            .force(
                "charge",
                d3.forceManyBody()
                    .strength(-500)
            )
            .force(
                "collision",
                d3.forceCollide()
                    .radius(50)
                    .strength(0.7)
            )
            .force(
                "center",
                d3.forceCenter(0, 0)
            )
            .alphaDecay(0.0228)
            .velocityDecay(0.4)
            .alpha(1)
            .alphaMin(0.001);

        simulation.on("tick", () => {
            requestAnimationFrame(() => {
                setNodes((prevNodes) =>
                    prevNodes.map((node) => {
                        const simNode = simulationNodes.find((n) => n.id === node.id);
                        if (simNode) {
                            // Skip updating the dragged node
                            if (isDraggingRef.current && draggedNodeRef.current === node.id) {
                                return node;
                            }

                            return {
                                ...node,
                                position: {
                                    x: simNode.x,
                                    y: simNode.y,
                                },
                            };
                        }
                        return node;
                    })
                );
            });
        });

        return { simulation, simulationNodes };
    }, [setNodes]);

    // Convert API data to ReactFlow format and start simulation
    const processGraphData = useCallback((data: GraphData) => {
        console.log('🎨 Processing graph data for ReactFlow...');

        // Create ReactFlow nodes
        const rfNodes = data.nodes.map((n) => {
            const clusterData = clusterInfo[n.cluster as keyof typeof clusterInfo];
            const isInActiveCluster = activeCluster === n.cluster;
            const isDimmed = activeCluster && !isInActiveCluster;
            const isSelected = selectedNodes.includes(n.id);

            return {
                id: n.id,
                data: {
                    label: n.label,
                    type: n.type,
                    cluster: n.cluster,
                    importance: n.importance,
                },
                position: {
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                },
                style: {
                    background: clusterData?.color || "#999",
                    color: "#1a1a1a",
                    border: isSelected ? "3px solid #667eea" : "2px solid #000",
                    borderRadius: "50%",
                    width: n.size || 60,
                    height: n.size || 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    fontSize: "9px",
                    fontWeight: "700",
                    textAlign: "center",
                    lineHeight: "1.1",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    boxShadow: isSelected
                        ? `0 0 20px ${clusterData?.color || "#667eea"}`
                        : `0 0 8px ${clusterData?.color || "#999"}`,
                    opacity: isDimmed ? 0.3 : 1,
                    transition: "transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease",
                },
            };
        });

        // Create ReactFlow edges
        const rfEdges = data.edges.map((e) => {
            const sourceNode = data.nodes.find((n) => n.id === e.source);
            const targetNode = data.nodes.find((n) => n.id === e.target);
            const isCrossCluster = sourceNode?.cluster !== targetNode?.cluster;
            const isInActiveCluster = activeCluster &&
                (sourceNode?.cluster === activeCluster || targetNode?.cluster === activeCluster);
            const isDimmed = activeCluster && !isInActiveCluster;

            return {
                id: e.id,
                source: e.source,
                target: e.target,
                type: "straight",
                animated: false,
                style: {
                    stroke: isCrossCluster ? "#ff6b6b" : "#99ADD1",
                    strokeWidth: Math.max(1.5, e.weight * 2),
                    strokeOpacity: isDimmed ? 0.1 : (isCrossCluster ? 0.5 : 0.3),
                    strokeDasharray: isCrossCluster ? "5,5" : undefined,
                },
                label: heatMapMode ? e.type : undefined,
                labelStyle: {
                    fill: "#999",
                    fontSize: 9,
                    fontWeight: 500,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                },
                labelBgStyle: {
                    fill: "#1a1a1a",
                    fillOpacity: 0.8,
                },
            };
        });

        // Set nodes and edges
        setNodes(rfNodes);
        setEdges(rfEdges);

        // Stop previous simulation
        if (simulationRef.current) {
            simulationRef.current.simulation.stop();
        }

        // Create and start new simulation
        const { simulation, simulationNodes } = createPhysicsSimulation(rfNodes, rfEdges);
        simulationRef.current = { simulation, simulationNodes };

        console.log('✅ Graph processed and simulation started');
    }, [activeCluster, selectedNodes, heatMapMode, setNodes, setEdges, createPhysicsSimulation]);

    // Load initial graph
    useEffect(() => {
        fetchGraphData().then((data) => {
            processGraphData(data);
        });

        return () => {
            if (simulationRef.current) {
                simulationRef.current.simulation.stop();
            }
        };
    }, []);

    // Reprocess when filters change
    // Reprocess when filters change — but don't restart the simulation
    useEffect(() => {
        if (graphData.nodes.length > 0 && simulationRef.current) {
            // Update node styles instead of restarting physics
            setNodes((prevNodes) =>
                prevNodes.map((node) => {
                    const n = graphData.nodes.find((gn: any) => gn.id === node.id);
                    if (!n) return node;

                    const clusterData = clusterInfo[n.cluster as keyof typeof clusterInfo];
                    const isInActiveCluster = activeCluster === n.cluster;
                    const isDimmed = activeCluster && !isInActiveCluster;
                    const isSelected = selectedNodes.includes(n.id);

                    return {
                        ...node,
                        style: {
                            ...node.style,
                            border: isSelected ? "3px solid #667eea" : "2px solid #000",
                            boxShadow: isSelected
                                ? `0 0 20px ${clusterData?.color || "#667eea"}`
                                : `0 0 8px ${clusterData?.color || "#999"}`,
                            opacity: isDimmed ? 0.3 : 1,
                        },
                    };
                })
            );

            // Optionally, update edges in a similar way
            setEdges((prevEdges) =>
                prevEdges.map((edge) => {
                    const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
                    const targetNode = graphData.nodes.find((n) => n.id === edge.target);
                    const isCrossCluster = sourceNode?.cluster !== targetNode?.cluster;
                    const isInActiveCluster =
                        activeCluster &&
                        (sourceNode?.cluster === activeCluster || targetNode?.cluster === activeCluster);
                    const isDimmed = activeCluster && !isInActiveCluster;

                    return {
                        ...edge,
                        style: {
                            ...edge.style,
                            strokeOpacity: isDimmed ? 0.1 : (isCrossCluster ? 0.5 : 0.3),
                        },
                    };
                })
            );
        }
    }, [activeCluster, selectedNodes, heatMapMode]);


    // Handle node drag start
    const handleNodeDragStart = useCallback((event: any, node: Node) => {
        isDraggingRef.current = true;
        draggedNodeRef.current = node.id;

        if (!simulationRef.current) return;

        const { simulation, simulationNodes } = simulationRef.current;
        const simNode = simulationNodes.find((n: any) => n.id === node.id);

        if (simNode) {
            simNode.fx = simNode.x;
            simNode.fy = simNode.y;
        }

        // Gentle reheat - just enough for neighbors to adjust
        // Don't use .alpha() which could scatter the graph
        simulation.alphaTarget(0.3).restart();
    }, []);

    // Handle node drag
    const handleNodeDrag = useCallback((event: any, node: Node) => {
        if (!simulationRef.current) return;

        const { simulationNodes } = simulationRef.current;
        const simNode = simulationNodes.find((n: any) => n.id === node.id);

        if (simNode) {
            simNode.fx = node.position.x;
            simNode.fy = node.position.y;
            simNode.x = node.position.x;
            simNode.y = node.position.y;
        }

        // Immediate React update
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id
                    ? { ...n, position: { x: node.position.x, y: node.position.y } }
                    : n
            )
        );
    }, [setNodes]);

    // Handle node drag stop
    const handleNodeDragStop = useCallback((event: any, node: Node) => {
        if (!simulationRef.current) return;

        const { simulation, simulationNodes } = simulationRef.current;
        const simNode = simulationNodes.find((n: any) => n.id === node.id);

        if (simNode) {
            simNode.fx = null;
            simNode.fy = null;
        }

        simulation.alphaTarget(0);

        isDraggingRef.current = false;
        draggedNodeRef.current = null;
    }, []);

    // Handle node click
    const handleNodeClick = useCallback((event: any, node: Node) => {
        console.log("🎯 Node clicked:", node.id);
        setLastClickedNode(node.id);

        // Single click = select
        onNodeSelect([node.id]);
    }, [onNodeSelect]);

    // Prevent double-click from scattering the graph
    const handleNodeDoubleClick = useCallback((event: any, node: Node) => {
        console.log("🎯 Double-click detected on:", node.id);
        // Prevent default behavior and just treat as single click
        event.stopPropagation();
        event.preventDefault();

        // Just select the node, don't restart simulation
        setLastClickedNode(node.id);
        onNodeSelect([node.id]);
    }, [onNodeSelect]);

    // Handle cluster drill-down
    const handleClusterDrillDown = (cluster: string) => {
        if (activeCluster === cluster) {
            setActiveCluster(null);
            onNodeSelect([]);
        } else {
            setActiveCluster(cluster);
            const clusterNodes = graphData.nodes
                .filter((n: any) => n.cluster === cluster)
                .map((n: any) => n.id);
            onNodeSelect(clusterNodes);
        }
    };

    // Power BI sync
    useEffect(() => {
        if (selectedNodes.length > 0) {
            notifyPowerBIUpdate("node_selection", selectedNodes);
        }
    }, [selectedNodes]);

    // Loading state
    if (loading) {
        return (
            <div className="h-[calc(100%-2.5rem)] neo-card overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-accent-pink mx-auto mb-4" />
                    <p className="text-lg font-bold mb-2">Loading Graph from ArangoDB</p>
                    <p className="text-sm text-muted-foreground">Fetching nodes and edges...</p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Connected to {API_BASE}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-[calc(100%-2.5rem)] neo-card overflow-hidden flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-bold mb-2">Failed to Load Graph</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="neo-button"
                    >
                        Retry
                    </button>
                    <div className="mt-4 text-xs text-muted-foreground space-y-1">
                        <p>Make sure your backend is running:</p>
                        <code className="bg-muted px-2 py-1 rounded">uvicorn api_service:app --reload</code>
                        <p className="mt-2">API URL: {API_BASE}/graph</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!graphData.nodes.length) {
        return (
            <div className="h-[calc(100%-2.5rem)] neo-card overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Graph Data</h3>
                    <p className="text-sm text-muted-foreground">The database appears to be empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100%-2.5rem)] neo-card overflow-hidden flex flex-col">
            {/* Graph Controls */}
            <div className="px-3 py-2 border-b border-border bg-secondary/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                            </button>
                            <button
                                onClick={() => onModeChange('discovery')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${mode === 'discovery'
                                    ? 'bg-accent-pink text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-transparent hover:bg-muted text-foreground'
                                    }`}
                            >
                                <Gem className="w-4 h-5" />
                            </button>
                        </div>

                        {/* Depth Explorer Controls - Only show in discovery mode */}
                        {mode === 'discovery' && (
                            <div className="neo-card p-1 flex items-center gap-2 bg-card">
                                <button
                                    onClick={() => {
                                        console.log('🔘 Explore button clicked');
                                        console.log('📍 selectedNodes:', selectedNodes);

                                        if (explorationMode) {
                                            resetToFullGraph();
                                        } else {
                                            if (selectedNodes && selectedNodes.length > 0) {
                                                const nodeId = selectedNodes[0];
                                                console.log('✅ Starting exploration with node:', nodeId);
                                                exploreNeighbors(nodeId, explorationDepth);
                                            } else {
                                                alert('Please click on any node first');
                                            }
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded font-semibold text-xs transition-all ${explorationMode
                                        ? 'bg-accent-teal text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : lastClickedNode
                                            ? 'bg-accent-pink text-white hover:bg-accent-pink/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                            : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                                        }`}
                                >
                                    <Search className="w-4 h-4" />
                                    {explorationMode ? 'Exploring' : 'Explore Neighbors'}
                                    {explorationMode && <span className="opacity-70">✓</span>}
                                </button>

                                {/* Depth selector */}
                                <div className="flex items-center gap-1 border-l border-border pl-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Depth:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setExplorationDepth(d);
                                                    if (explorationMode && exploredFromNode) {
                                                        exploreNeighbors(exploredFromNode, d);
                                                    }
                                                }}
                                                disabled={!explorationMode}
                                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${explorationDepth === d
                                                    ? 'bg-accent-pink text-foreground'
                                                    : !explorationMode
                                                        ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                                                        : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Helper text */}
                                {!explorationMode && !lastClickedNode && (
                                    <span className="text-xs text-muted-foreground">
                                        ← Select node, then click Explore Neighbors
                                    </span>
                                )}
                                {!explorationMode && lastClickedNode && (
                                    <span className="text-xs text-accent-pink font-semibold">
                                        ✓ Ready to explore! Click the button →
                                    </span>
                                )}
                                {explorationMode && exploredFromNode && (
                                    <span className="text-xs text-accent-teal font-semibold">
                                        🔍 Viewing {graphData.nodes.length} nodes
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Title */}
                        <div className="relative">
                            {mode === 'discovery' && (
                                <h3 className="font-extrabold text-xl">Discovery Mode</h3>
                            )}
                            {mode === 'mining' && (
                                <h3 className="font-extrabold text-xl">Prospector Mode</h3>
                            )}
                        </div>

                        {activeCluster && (
                            <div className="neo-card px-3 py-1 bg-accent-pink/20 flex items-center gap-2">
                                <span className="text-sm font-bold">
                                    Viewing: {clusterInfo[activeCluster as keyof typeof clusterInfo]?.name}
                                </span>
                                <button
                                    onClick={() => {
                                        setActiveCluster(null);
                                        onNodeSelect([]);
                                    }}
                                    className="text-xs hover:bg-muted px-2 py-0.5 rounded"
                                >
                                    ✕ Exit
                                </button>
                            </div>
                        )}

                        {explorationMode && exploredFromNode && (
                            <div className="neo-card px-3 py-1 bg-accent-teal/20 flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                <span className="text-xs font-bold">
                                    Exploring: Depth {explorationDepth}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2">
                        {mode === 'mining' && (
                            <button
                                onClick={() => setHeatMapMode(!heatMapMode)}
                                className={`neo-button-secondary flex items-center gap-2 ${heatMapMode ? 'bg-accent-pink text-foreground' : ''
                                    }`}
                            >
                                <Palette className="w-4 h-4" />
                                <span className="text-sm">{heatMapMode ? '🔥 Labels' : 'Clean'}</span>
                            </button>
                        )}

                        <button
                            onClick={() => fetchGraphData().then(processGraphData)}
                            className="neo-button-secondary text-sm flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* First Visit Tooltip */}
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
                                ✨ Exploring {graphData.nodes.length} services from ArangoDB!
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                <strong>Click</strong> a node to select it. <strong>Click "Explore Neighbors"</strong> to filter the graph.
                                Use <strong>Depth buttons</strong> to change exploration range!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Graph Container */}
            <div className="flex-1 relative bg-background/50 overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStart={handleNodeDragStart}
                    onNodeDrag={handleNodeDrag}
                    onNodeDragStop={handleNodeDragStop}
                    onNodeClick={handleNodeClick}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    fitView
                    fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    zoomOnScroll={true}
                    panOnScroll={false}
                    minZoom={0.1}
                    maxZoom={4}
                    nodeOrigin={[0.5, 0.5]}
                    selectNodesOnDrag={false}
                >
                    <Background
                        variant="dots"
                        gap={20}
                        size={0.5}
                        color="#2a2a2a"
                    />
                    <Controls
                        style={{
                            button: {
                                background: "#333",
                                borderColor: "#444",
                                color: "#999",
                            }
                        }}
                    />
                    <MiniMap
                        nodeStrokeColor="#333"
                        nodeColor={(n) => n.style?.background || "#666"}
                        maskColor="rgba(26, 26, 26, 0.9)"
                        style={{
                            background: "#1a1a1a",
                            border: "1px solid #333",
                        }}
                    />
                </ReactFlow>

                {/* Cluster Legend */}
                <div className="absolute top-4 left-4 neo-card p-3 bg-card max-w-xs z-10">
                    <div className="text-xs font-bold mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Service Clusters
                        <div className="ml-auto flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-muted-foreground">Live</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {Object.entries(clusterInfo).map(([key, info]) => {
                            const count = graphData.nodes.filter((n: any) => n.cluster === key).length;
                            const isActive = activeCluster === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleClusterDrillDown(key)}
                                    onMouseEnter={() => setHoveredCluster(key)}
                                    onMouseLeave={() => setHoveredCluster(null)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left ${isActive ? 'bg-accent-pink/20 ring-2 ring-accent-pink' : ''
                                        }`}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: info.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold truncate">{info.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{count} services</div>
                                    </div>
                                    {isActive && <span className="text-xs">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground">
                        <div>💡 Click node → explore | Drag to move</div>
                    </div>

                    {/* Save as Gem Button */}
                    {selectedNodes.length > 0 && mode === 'discovery' && (
                        <div className="mt-3 pt-2 border-t border-border">
                            <button
                                onClick={() => {
                                    const nodeId = selectedNodes[0];
                                    const node = graphData.nodes.find((n: any) => n.id === nodeId);
                                    if (node && onCaptureGem) {
                                        onCaptureGem({
                                            id: node.id,
                                            label: node.label,
                                            type: node.type,
                                            cluster: node.cluster,
                                            importance: node.importance,
                                        });
                                    }
                                }}
                                className="neo-button w-full text-xs flex items-center justify-center gap-2"
                            >
                                <Gem className="w-3 h-3" />
                                Save as Hidden Gem
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-1 text-center">
                                {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 border-t-[3px] border-border bg-secondary/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Services: {graphData.nodes.length}</span>
                    <span className="font-semibold">Connections: {graphData.edges.length}</span>
                    <span className="font-semibold">Selected: {selectedNodes.length}</span>
                    {activeCluster && (
                        <span className="font-semibold text-accent-pink">
                            📍 {clusterInfo[activeCluster as keyof typeof clusterInfo]?.name}
                        </span>
                    )}
                    {mode === 'discovery' && (
                        <span className="font-semibold text-accent-pink">
                            ✨ AI-guided
                        </span>
                    )}
                    {explorationMode && (
                        <span className="font-semibold text-accent-teal flex items-center gap-1">
                            <Search className="w-3 h-3" />
                            Depth {explorationDepth} View
                        </span>
                    )}
                    <span className="font-semibold text-green-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live from ArangoDB
                    </span>
                </div>
                <div className="text-muted-foreground">
                    D3 Force Physics | Clusters: {Object.keys(clusterInfo).length}
                </div>
            </div>

            <style>{`
                .react-flow__node {
                    cursor: grab;
                    will-change: transform;
                    transform: translateZ(0);
                }
                
                .react-flow__node:active {
                    cursor: grabbing;
                }

                .react-flow__node:hover {
                    filter: brightness(1.2);
                    transform: scale(1.1) translateZ(0);
                }

                .react-flow__node.selected {
                    filter: brightness(1.3);
                }

                .react-flow__edge {
                    will-change: transform;
                }

                .react-flow__edge.selected .react-flow__edge-path {
                    stroke: #fff !important;
                    stroke-width: 2 !important;
                    stroke-opacity: 0.8 !important;
                }

                .react-flow__edge-text {
                    font-size: 9px;
                }

                .react-flow__controls {
                    background: #1a1a1a;
                    border: 1px solid #333;
                }

                .react-flow__controls-button {
                    background: #333;
                    border-bottom: 1px solid #444;
                    color: #999;
                }

                .react-flow__controls-button:hover {
                    background: #444;
                }

                .react-flow__attribution {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default GraphExplorer;