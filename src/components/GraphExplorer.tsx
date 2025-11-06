import React, { useEffect, useRef, useState, useMemo } from "react";
import { Graphin } from "@antv/graphin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    const graphRef = useRef<any>(null);
    const containerRef = useRef<any>(null);
    const hullLayerRef = useRef<SVGGElement>(null);
    const [layout, setLayout] = useState("d3-force");
    const [graphInstance, setGraphInstance] = useState<any>(null);
    const [heatMapMode, setHeatMapMode] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [activeCluster, setActiveCluster] = useState<string | null>(null);
    const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
    const [showHulls, setShowHulls] = useState(true);
    const [layoutStable, setLayoutStable] = useState(false);

    // API data state
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NEW: Depth exploration state
    const [explorationMode, setExplorationMode] = useState(false);
    const [explorationDepth, setExplorationDepth] = useState(1);
    const [exploredFromNode, setExploredFromNode] = useState<string | null>(null);
    const [lastClickedNode, setLastClickedNode] = useState<string | null>(null);

    // Use ref as backup for state (more reliable across re-renders)
    const lastClickedNodeRef = useRef<string | null>(null);

    // Fetch graph data from ArangoDB
    useEffect(() => {
        async function fetchGraphData() {
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
                setLoading(false);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : "Failed to fetch graph data";
                console.error('❌ Failed to load graph:', err);
                setError(errorMsg);
                setLoading(false);
            }
        }

        fetchGraphData();
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

    // NEW: Explore neighbors at specific depth
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

            onNodeSelect([]);

            // THEN: Update graph
            setGraphData({
                nodes: data.nodes,
                edges: data.edges
            });

            setExplorationMode(true);
            setExploredFromNode(nodeId);

            // FINALLY: Set new selection after a brief delay
            setTimeout(() => {
                const nodeIds = data.nodes.map((n: any) => n.id);
                onNodeSelect(nodeIds);
            }, 10);

            // Update graph to show only explored nodes
            setGraphData({
                nodes: data.nodes,
                edges: data.edges
            });

            setExplorationMode(true);
            setExploredFromNode(nodeId);

            // Select all discovered nodes
            const nodeIds = data.nodes.map((n: any) => n.id);
            onNodeSelect(nodeIds);

        } catch (err) {
            console.error('❌ Failed to explore neighbors:', err);
            alert(`Failed to explore: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // NEW: Reset to full graph view
    const resetToFullGraph = async () => {
        try {
            console.log('🔄 Resetting to full graph...');
            const response = await fetch(`${API_BASE}/graph`);
            const data = await response.json();
            setGraphData(data);
            setExplorationMode(false);
            setExploredFromNode(null);
            onNodeSelect([]);
            console.log('✅ Reset complete');
        } catch (err) {
            console.error('Failed to reset graph:', err);
        }
    };

    // Layout configurations
    const layoutConfigs: Record<string, any> = {
        "d3-force": {
            type: "d3-force",
            preventOverlap: true,
            nodeStrength: -1500,
            linkDistance: 200,
            collide: {
                strength: 1,
                iterations: 5,
            },
            alpha: 0.3,
            alphaDecay: 0.028,
            alphaMin: 0.001,
        },
        dagre: {
            type: "dagre",
            rankdir: "TB",
            nodesep: 80,
            ranksep: 120,
        },
        circular: {
            type: "circular",
            radius: 300,
            divisions: 7,
        },
        concentric: {
            type: "concentric",
            minNodeSpacing: 100,
            preventOverlap: true,
        },
        grid: {
            type: "grid",
            preventOverlap: true,
            nodeSpacing: 120,
            sortBy: "cluster",
        },
    };

    // Convert data to Graphin format
    const prepareGraphData = useMemo(() => {
        if (!graphData.nodes.length) {
            return { nodes: [], edges: [] };
        }

        const nodes = graphData.nodes.map((node: any) => {
            const clusterData = clusterInfo[node.cluster as keyof typeof clusterInfo];
            const isInActiveCluster = activeCluster === node.cluster;
            const isDimmed = activeCluster && !isInActiveCluster;

            return {
                id: node.id,
                data: {
                    label: node.label,
                    type: node.type,
                    cluster: node.cluster,
                    importance: node.importance,
                },
                style: {
                    fill: clusterData?.color || "#999",
                    stroke: isInActiveCluster ? "#000" : clusterData?.color || "#999",
                    lineWidth: isInActiveCluster ? 4 : 2,
                    opacity: isDimmed ? 0.2 : 1,
                    size: node.size || 40,
                },
            };
        });

        const edges = graphData.edges.map((edge: any, idx: number) => {
            const sourceNode = graphData.nodes.find((n: any) => n.id === edge.source);
            const targetNode = graphData.nodes.find((n: any) => n.id === edge.target);
            const isCrossCluster = sourceNode?.cluster !== targetNode?.cluster;
            const isInActiveCluster = activeCluster &&
                (sourceNode?.cluster === activeCluster || targetNode?.cluster === activeCluster);
            const isDimmed = activeCluster && !isInActiveCluster;

            return {
                id: edge.id || `edge-${idx}`,
                source: edge.source,
                target: edge.target,
                data: {
                    type: edge.type,
                    weight: edge.weight,
                },
                style: {
                    stroke: isCrossCluster ? "#ff6b6b" : "#99ADD1",
                    lineWidth: edge.weight * 3,
                    opacity: isDimmed ? 0.1 : (isCrossCluster ? 0.6 : 0.4),
                    lineDash: isCrossCluster ? [5, 5] : undefined,
                },
            };
        });

        return { nodes, edges };
    }, [graphData, activeCluster]);

    // Graph options
    const graphOptions = useMemo(() => ({
        autoResize: true,
        data: prepareGraphData,
        layout: layoutConfigs[layout],
        node: {
            style: {
                labelText: (d: any) => d.data?.label || d.id,
                labelPlacement: "bottom",
                labelFill: "#333",
                labelFontSize: 11,
                labelBackground: true,
                labelBackgroundFill: "#ffffffdd",
                labelBackgroundRadius: 4,
                labelPadding: [2, 4],
            },
            state: {
                selected: {
                    lineWidth: 5,
                    halo: true,
                    stroke: "#667eea",
                    shadowBlur: 20,
                    shadowColor: "#667eea",
                },
                active: {
                    halo: true,
                    lineWidth: 3,
                },
            },
        },
        edge: {
            style: {
                labelText: (d: any) => heatMapMode ? d.data?.type : "",
                labelFontSize: 9,
                labelBackground: true,
                labelBackgroundFill: "#ffffffcc",
                endArrow: true,
            },
        },
        behaviors: [
            "drag-canvas",
            "zoom-canvas",
            "drag-element",
            "click-select",
        ],
        animation: true,
    }), [prepareGraphData, layout, heatMapMode]);

    // Draw cluster hulls
    const drawClusterHullsSVG = () => {
        if (!graphInstance || !hullLayerRef.current || !showHulls || !graphData.nodes.length) return;

        hullLayerRef.current.innerHTML = '';

        const clusters = Object.keys(clusterInfo);

        clusters.forEach((clusterId) => {
            const clusterNodes = graphData.nodes.filter(
                (n: any) => n.cluster === clusterId
            );

            if (clusterNodes.length < 2) return;

            const positions: Array<{ x: number; y: number }> = [];
            clusterNodes.forEach((n: any) => {
                try {
                    const node = graphInstance.findById(n.id);
                    if (node) {
                        const model = node.getModel();
                        if (model.x !== undefined && model.y !== undefined) {
                            positions.push({ x: model.x, y: model.y });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            });

            if (positions.length < 2) return;

            const xs = positions.map(p => p.x);
            const ys = positions.map(p => p.y);
            const minX = Math.min(...xs) - 80;
            const maxX = Math.max(...xs) + 80;
            const minY = Math.min(...ys) - 80;
            const maxY = Math.max(...ys) + 80;
            const width = maxX - minX;
            const height = maxY - minY;

            const clusterData = clusterInfo[clusterId as keyof typeof clusterInfo];
            const isActive = activeCluster === clusterId;
            const isHovered = hoveredCluster === clusterId;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', minX.toString());
            rect.setAttribute('y', minY.toString());
            rect.setAttribute('width', width.toString());
            rect.setAttribute('height', height.toString());
            rect.setAttribute('rx', '20');
            rect.setAttribute('ry', '20');
            rect.setAttribute('fill', clusterData?.color || '#999');
            rect.setAttribute('fill-opacity', isActive ? '0.15' : isHovered ? '0.1' : '0.05');
            rect.setAttribute('stroke', clusterData?.color || '#999');
            rect.setAttribute('stroke-opacity', isActive ? '0.8' : isHovered ? '0.6' : '0.3');
            rect.setAttribute('stroke-width', isActive ? '3' : isHovered ? '2' : '1');
            rect.setAttribute('stroke-dasharray', '10,5');
            rect.style.pointerEvents = 'none';
            rect.style.transition = 'all 0.3s ease';

            hullLayerRef.current?.appendChild(rect);
        });
    };

    // Handle graph initialization
    const handleInit = (graph: any) => {
        // Graphin passes the graph instance as a parameter to onInit
        console.log('🎨 Graph initialized:', graph);
        setGraphInstance(graph);

        let stabilizeTimer: NodeJS.Timeout;
        graph.on('afterlayout', () => {
            clearTimeout(stabilizeTimer);
            stabilizeTimer = setTimeout(() => {
                setLayoutStable(true);
                drawClusterHullsSVG();
            }, 1000);
        });
    };

    // Handle node clicks - separate useEffect for better reliability
    useEffect(() => {
        if (!graphInstance) return;

        const handleNodeClick = (evt: any) => {
            console.log("🎯 Node click event fired!", evt);

            let nodeId = null;
            let model = null;

            try {
                // Method 1: Standard getModel approach
                if (evt?.item?.getModel) {
                    model = evt.item.getModel();
                    nodeId = model?.id;
                }

                // Method 2: Direct _cfg access (some Graphin versions)
                if (!nodeId && evt?.item?._cfg?.id) {
                    nodeId = evt.item._cfg.id;
                    model = evt.item._cfg.model;
                }

                // Method 3: Alternative get method
                if (!nodeId && evt?.item?.get) {
                    model = evt.item.get('model');
                    nodeId = model?.id;
                }
            } catch (err) {
                console.warn("⚠️ Could not parse node event:", err);
            }

            console.log("🧩 Event details:", { evt, model, nodeId });

            if (!nodeId) {
                console.warn("⚠️ No valid node ID found in click event");
                return;
            }

            console.log("✅ Node clicked:", nodeId);
            setLastClickedNode(nodeId);
            lastClickedNodeRef.current = nodeId;

            // Update selection to include this node
            onNodeSelect([nodeId]);

            // Optional: Flash highlight
            try {
                graphInstance.setItemState(evt.item, "active", true);
                setTimeout(() => {
                    graphInstance.setItemState(evt.item, "active", false);
                }, 600);
            } catch (e) {
                console.warn("Could not set active state:", e);
            }
        };

        // Bind the event
        console.log("🔧 Binding node:click event handler to graph instance");
        graphInstance.on("node:click", handleNodeClick);

        // Cleanup function
        return () => {
            console.log("🧹 Cleaning up node:click event handler");
            graphInstance.off("node:click", handleNodeClick);
        };
    }, [graphInstance, onNodeSelect]);

    // Redraw hulls when needed
    useEffect(() => {
        if (layoutStable && showHulls && graphData.nodes.length) {
            const timer = setTimeout(() => {
                drawClusterHullsSVG();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeCluster, hoveredCluster, layoutStable, showHulls, graphInstance, graphData]);

    // Handle cluster drill-down
    const handleClusterDrillDown = (cluster: string) => {
        if (activeCluster === cluster) {
            setActiveCluster(null);
            const clusterNodes = graphData.nodes
                .filter((n: any) => n.cluster === cluster)
                .map((n: any) => n.id);
            onNodeSelect(selectedNodes.filter(id => !clusterNodes.includes(id)));
        } else {
            setActiveCluster(cluster);
            const clusterNodes = graphData.nodes
                .filter((n: any) => n.cluster === cluster)
                .map((n: any) => n.id);
            onNodeSelect(clusterNodes);
        }
    };

    // Update selected node states
    useEffect(() => {
        if (graphInstance && graphData.nodes.length > 0) {
            // Filter selectedNodes to only include nodes that exist in graphData
            const validSelectedNodes = selectedNodes.filter(nodeId =>
                graphData.nodes.some(node => node.id === nodeId)
            );

            // Only try to set state on nodes that actually exist in graphData
            graphData.nodes.forEach((node: any) => {
                const isSelected = validSelectedNodes.includes(node.id);
                try {
                    graphInstance.setItemState(node.id, "selected", isSelected);
                } catch (e) {
                    // Node might not be rendered yet, ignore
                }
            });
        }
    }, [selectedNodes, graphInstance, graphData.nodes]);

    // Power BI sync
    useEffect(() => {
        if (selectedNodes.length > 0) {
            notifyPowerBIUpdate("node_selection", selectedNodes);
        }
    }, [selectedNodes]);

    const handleLayoutChange = (newLayout: string) => {
        setLayout(newLayout);
        setLayoutStable(false);
    };

    const handleZoomIn = () => {
        if (graphInstance) {
            const zoom = graphInstance.getZoom();
            graphInstance.zoomTo(zoom * 1.2, { x: 0, y: 0 }, true, { duration: 300 });
        }
    };

    const handleZoomOut = () => {
        if (graphInstance) {
            const zoom = graphInstance.getZoom();
            graphInstance.zoomTo(zoom * 0.8, { x: 0, y: 0 }, true, { duration: 300 });
        }
    };

    const handleFitView = () => {
        if (graphInstance) {
            graphInstance.fitView(20, { duration: 300 });
        }
    };

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

                        {/* NEW: Depth Explorer Controls - Only show in discovery mode */}
                        {mode === 'discovery' && (
                            <div className="neo-card p-1 flex items-center gap-2 bg-card">
                                {/* Exploration Toggle */}
                                <button
                                    onClick={() => {
                                        console.log('🔘 Explore button clicked');
                                        console.log('📍 selectedNodes:', selectedNodes);

                                        if (explorationMode) {
                                            // Turn off exploration
                                            console.log('🔄 Turning off exploration');
                                            resetToFullGraph();
                                        } else {
                                            // Use the selectedNodes prop - it's already populated!
                                            if (selectedNodes && selectedNodes.length > 0) {
                                                const nodeId = selectedNodes[0]; // Use first selected node
                                                console.log('✅ Starting exploration with node:', nodeId);
                                                exploreNeighbors(nodeId, explorationDepth);
                                            } else {
                                                console.log('❌ No node selected');
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

                                {/* Depth selector - Always visible */}
                                <div className="flex items-center gap-1 border-l border-border pl-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Depth:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setExplorationDepth(d);
                                                    // If already exploring, re-explore at new depth
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

                        {/* NEW: Exploration Mode Indicator */}
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
                        <button
                            onClick={() => setShowHulls(!showHulls)}
                            className={`neo-button-secondary flex items-center gap-2 ${showHulls ? 'bg-accent-teal/20 text-foreground' : ''
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span className="text-sm">Clusters: {showHulls ? 'ON' : 'OFF'}</span>
                        </button>

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

                        <select
                            value={layout}
                            onChange={(e) => handleLayoutChange(e.target.value)}
                            className="neo-button-secondary text-sm px-3 py-2"
                        >
                            <option value="d3-force">Force</option>
                            <option value="dagre">Hierarchy</option>
                            <option value="circular">Circular</option>
                            <option value="concentric">Concentric</option>
                            <option value="grid">Grid</option>
                        </select>

                        <div className="flex items-center gap-1 neo-card p-1 bg-card">
                            <button onClick={handleZoomIn} className="p-1 hover:bg-muted rounded">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button onClick={handleZoomOut} className="p-1 hover:bg-muted rounded">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <button onClick={handleFitView} className="p-1 hover:bg-muted rounded">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>

                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Maximize2 className="w-4 h-4" />
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
                                <strong>Shift+Click</strong> to drill into cluster. Use <strong>Depth buttons</strong> to change exploration range!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Graph Container */}
            <div ref={containerRef} className="flex-1 relative bg-background/50 overflow-hidden">
                {/* SVG Overlay for hulls */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                >
                    <g ref={hullLayerRef} />
                </svg>

                <Graphin
                    ref={graphRef}
                    options={graphOptions}
                    onInit={handleInit}
                    style={{ width: "100%", height: "100%", position: 'relative', zIndex: 1 }}
                />

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
                        <div>💡 Shift+Click node → cluster | Double-Click → explore</div>
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
                    Layout: {layout} | Clusters: {Object.keys(clusterInfo).length}
                </div>
            </div>


        </div>
    );
};

export default GraphExplorer;