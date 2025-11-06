import React, { useState, useRef, useEffect } from 'react';
import Graphin, { Utils } from '@antv/graphin';
import {
    Toolbar,
    ContextMenu,
    MiniMap,
    Legend,
    FishEye,
    Tooltip,
    EdgeBundling,
    Hull
} from '@antv/graphin-components';

/**
 * EXAMPLE 1: Basic Force-Directed Graph
 * Demonstrates the simplest Graphin implementation
 */
export const BasicGraphExample = () => {
    const data = {
        nodes: [
            { id: '1', label: 'Node 1' },
            { id: '2', label: 'Node 2' },
            { id: '3', label: 'Node 3' },
            { id: '4', label: 'Node 4' },
        ],
        edges: [
            { source: '1', target: '2' },
            { source: '1', target: '3' },
            { source: '2', target: '4' },
            { source: '3', target: '4' },
        ],
    };

    return (
        <Graphin
            data={data}
            layout={{ type: 'force' }}
            style={{ height: 400 }}
        />
    );
};

/**
 * EXAMPLE 2: Hierarchical Tree Layout
 * Shows parent-child relationships in a tree structure
 */
export const HierarchicalTreeExample = () => {
    const treeData = {
        nodes: [
            { id: 'root', label: 'CEO', level: 0 },
            { id: 'vp1', label: 'VP Engineering', level: 1 },
            { id: 'vp2', label: 'VP Sales', level: 1 },
            { id: 'eng1', label: 'Engineering Manager', level: 2 },
            { id: 'eng2', label: 'Engineering Manager', level: 2 },
            { id: 'sales1', label: 'Sales Manager', level: 2 },
        ],
        edges: [
            { source: 'root', target: 'vp1' },
            { source: 'root', target: 'vp2' },
            { source: 'vp1', target: 'eng1' },
            { source: 'vp1', target: 'eng2' },
            { source: 'vp2', target: 'sales1' },
        ],
    };

    return (
        <Graphin
            data={treeData}
            layout={{
                type: 'dagre',
                rankdir: 'TB', // Top to Bottom
                align: 'UL', // Upper Left
                nodesep: 50,
                ranksep: 100,
            }}
            style={{ height: 500 }}
        >
            <Toolbar />
        </Graphin>
    );
};

/**
 * EXAMPLE 3: Interactive Node Expansion
 * Click nodes to dynamically expand and show connected nodes
 */
export const NodeExpansionExample = () => {
    const [data, setData] = useState({
        nodes: [
            { id: '1', label: 'Central Node', expanded: false },
        ],
        edges: [],
    });

    const graphRef = useRef<any>(null);

    useEffect(() => {
        if (graphRef.current) {
            const { graph } = graphRef.current;

            graph.on('node:click', (evt: any) => {
                const node = evt.item;
                const model = node.getModel();

                if (!model.expanded) {
                    // Generate connected nodes
                    const newNodes = Array.from({ length: 5 }, (_, i) => ({
                        id: `${model.id}-child-${i}`,
                        label: `Child ${i + 1}`,
                    }));

                    const newEdges = newNodes.map(n => ({
                        source: model.id,
                        target: n.id,
                    }));

                    setData({
                        nodes: [...data.nodes, ...newNodes],
                        edges: [...data.edges, ...newEdges],
                    });

                    // Mark as expanded
                    graph.updateItem(model.id, { expanded: true });
                }
            });
        }
    }, [data]);

    return (
        <Graphin
            ref={graphRef}
            data={data}
            layout={{ type: 'force' }}
            style={{ height: 500 }}
        >
            <Toolbar />
            <Tooltip bindType="node" />
        </Graphin>
    );
};

/**
 * EXAMPLE 4: Clustering and Community Detection
 * Visualize clusters/communities in the graph
 */
export const ClusteringExample = () => {
    const clusterData = {
        nodes: [
            // Cluster 1 - Development
            { id: 'd1', label: 'Dev 1', cluster: 'development', style: { keyshape: { fill: '#5B8FF9' } } },
            { id: 'd2', label: 'Dev 2', cluster: 'development', style: { keyshape: { fill: '#5B8FF9' } } },
            { id: 'd3', label: 'Dev 3', cluster: 'development', style: { keyshape: { fill: '#5B8FF9' } } },

            // Cluster 2 - Testing
            { id: 't1', label: 'Test 1', cluster: 'testing', style: { keyshape: { fill: '#61DDAA' } } },
            { id: 't2', label: 'Test 2', cluster: 'testing', style: { keyshape: { fill: '#61DDAA' } } },

            // Cluster 3 - Operations
            { id: 'o1', label: 'Ops 1', cluster: 'operations', style: { keyshape: { fill: '#F6BD16' } } },
            { id: 'o2', label: 'Ops 2', cluster: 'operations', style: { keyshape: { fill: '#F6BD16' } } },
        ],
        edges: [
            // Intra-cluster edges
            { source: 'd1', target: 'd2' },
            { source: 'd2', target: 'd3' },
            { source: 't1', target: 't2' },
            { source: 'o1', target: 'o2' },

            // Inter-cluster edges
            { source: 'd3', target: 't1' },
            { source: 't2', target: 'o1' },
        ],
    };

    return (
        <Graphin
            data={clusterData}
            layout={{
                type: 'force',
                clustering: true,
                nodeClusterBy: 'cluster',
            }}
            style={{ height: 500 }}
        >
            <Toolbar />
            <Legend
                options={[
                    { label: 'Development', value: 'development', color: '#5B8FF9' },
                    { label: 'Testing', value: 'testing', color: '#61DDAA' },
                    { label: 'Operations', value: 'operations', color: '#F6BD16' },
                ]}
            />
            <Hull
                options={[
                    { id: 'development-hull', members: ['d1', 'd2', 'd3'], type: 'bubble' },
                    { id: 'testing-hull', members: ['t1', 't2'], type: 'bubble' },
                    { id: 'operations-hull', members: ['o1', 'o2'], type: 'bubble' },
                ]}
            />
        </Graphin>
    );
};

/**
 * EXAMPLE 5: Search and Highlight
 * Search for nodes and highlight matching results
 */
export const SearchExample = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const graphRef = useRef<any>(null);

    const data = Utils.mock(20).graphin();

    useEffect(() => {
        if (graphRef.current && searchTerm) {
            const { graph } = graphRef.current;

            // Clear previous highlights
            graph.getNodes().forEach((node: any) => {
                graph.clearItemStates(node);
            });

            // Highlight matching nodes
            graph.getNodes().forEach((node: any) => {
                const model = node.getModel();
                if (model.label.toLowerCase().includes(searchTerm.toLowerCase())) {
                    graph.setItemState(node, 'highlight', true);
                }
            });
        }
    }, [searchTerm]);

    return (
        <div>
            <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 10, padding: 8, width: '100%' }}
            />
            <Graphin
                ref={graphRef}
                data={data}
                layout={{ type: 'force' }}
                style={{ height: 500 }}
            >
                <Toolbar />
                <FishEye options={{ trigger: 'mousemove', d: 1.5, r: 200 }} />
            </Graphin>
        </div>
    );
};

/**
 * EXAMPLE 6: Time-based Animation
 * Animate the graph to show temporal changes
 */
export const TimelineAnimationExample = () => {
    const [timeStep, setTimeStep] = useState(0);
    const graphRef = useRef<any>(null);

    const timelineData = [
        {
            nodes: [{ id: '1', label: 'Start' }],
            edges: [],
        },
        {
            nodes: [
                { id: '1', label: 'Start' },
                { id: '2', label: 'Step 1' },
            ],
            edges: [{ source: '1', target: '2' }],
        },
        {
            nodes: [
                { id: '1', label: 'Start' },
                { id: '2', label: 'Step 1' },
                { id: '3', label: 'Step 2' },
            ],
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
            ],
        },
    ];

    useEffect(() => {
        if (graphRef.current) {
            const { graph } = graphRef.current;
            graph.changeData(timelineData[timeStep]);
        }
    }, [timeStep]);

    return (
        <div>
            <div style={{ marginBottom: 10 }}>
                <button onClick={() => setTimeStep(Math.max(0, timeStep - 1))}>← Previous</button>
                <span style={{ margin: '0 10px' }}>Step {timeStep + 1} / {timelineData.length}</span>
                <button onClick={() => setTimeStep(Math.min(timelineData.length - 1, timeStep + 1))}>Next →</button>
            </div>
            <Graphin
                ref={graphRef}
                data={timelineData[timeStep]}
                layout={{ type: 'dagre' }}
                style={{ height: 400 }}
                animate={true}
            />
        </div>
    );
};

/**
 * EXAMPLE 7: Multi-Layer Graph
 * Show different layers of information
 */
export const MultiLayerExample = () => {
    const [activeLayer, setActiveLayer] = useState('all');

    const fullData = {
        nodes: [
            { id: '1', label: 'User', layer: 'user' },
            { id: '2', label: 'Service', layer: 'service' },
            { id: '3', label: 'Database', layer: 'database' },
            { id: '4', label: 'API', layer: 'service' },
        ],
        edges: [
            { source: '1', target: '2' },
            { source: '2', target: '3' },
            { source: '1', target: '4' },
            { source: '4', target: '3' },
        ],
    };

    const filteredData = activeLayer === 'all'
        ? fullData
        : {
            nodes: fullData.nodes.filter(n => n.layer === activeLayer),
            edges: fullData.edges.filter(e =>
                fullData.nodes.find(n => n.id === e.source)?.layer === activeLayer &&
                fullData.nodes.find(n => n.id === e.target)?.layer === activeLayer
            ),
        };

    return (
        <div>
            <div style={{ marginBottom: 10 }}>
                <button onClick={() => setActiveLayer('all')}>All Layers</button>
                <button onClick={() => setActiveLayer('user')}>User Layer</button>
                <button onClick={() => setActiveLayer('service')}>Service Layer</button>
                <button onClick={() => setActiveLayer('database')}>Database Layer</button>
            </div>
            <Graphin
                data={filteredData}
                layout={{ type: 'dagre' }}
                style={{ height: 400 }}
            >
                <Toolbar />
            </Graphin>
        </div>
    );
};

/**
 * EXAMPLE 8: Path Finding
 * Find and highlight the shortest path between two nodes
 */
export const PathFindingExample = () => {
    const [startNode, setStartNode] = useState('');
    const [endNode, setEndNode] = useState('');
    const graphRef = useRef<any>(null);

    const data = Utils.mock(15).graphin();

    const findPath = () => {
        if (graphRef.current && startNode && endNode) {
            const { graph } = graphRef.current;

            // Clear previous highlights
            graph.getNodes().forEach((node: any) => {
                graph.clearItemStates(node);
            });
            graph.getEdges().forEach((edge: any) => {
                graph.clearItemStates(edge);
            });

            // Find shortest path (simplified - you'd use a proper algorithm)
            const path = graph.findShortestPath(startNode, endNode);

            if (path) {
                path.forEach((nodeId: string) => {
                    graph.setItemState(nodeId, 'highlight', true);
                });
            }
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 10 }}>
                <input
                    placeholder="Start node ID"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                />
                <input
                    placeholder="End node ID"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                />
                <button onClick={findPath}>Find Path</button>
            </div>
            <Graphin
                ref={graphRef}
                data={data}
                layout={{ type: 'force' }}
                style={{ height: 500 }}
            >
                <Toolbar />
                <MiniMap />
            </Graphin>
        </div>
    );
};

/**
 * EXAMPLE 9: Dynamic Data Loading
 * Load graph data from an API
 */
export const DynamicDataExample = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            fetch('https://assets.antv.antgroup.com/g6/graph.json')
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                });
        }, 1000);
    }, []);

    if (loading) {
        return <div>Loading graph data...</div>;
    }

    return (
        <Graphin
            data={data}
            layout={{ type: 'force' }}
            style={{ height: 500 }}
        >
            <Toolbar />
            <MiniMap />
        </Graphin>
    );
};

/**
 * EXAMPLE 10: Custom Node Styling Based on Data
 * Style nodes dynamically based on their properties
 */
export const CustomStylingExample = () => {
    const rawData = {
        nodes: [
            { id: '1', label: 'Critical', status: 'critical', importance: 10 },
            { id: '2', label: 'Warning', status: 'warning', importance: 7 },
            { id: '3', label: 'Normal', status: 'normal', importance: 5 },
            { id: '4', label: 'Low', status: 'low', importance: 3 },
        ],
        edges: [
            { source: '1', target: '2', weight: 5 },
            { source: '2', target: '3', weight: 3 },
            { source: '3', target: '4', weight: 1 },
        ],
    };

    const statusColors = {
        critical: '#FF4D4F',
        warning: '#FFA940',
        normal: '#52C41A',
        low: '#1890FF',
    };

    const styledData = {
        nodes: rawData.nodes.map(node => ({
            ...node,
            style: {
                keyshape: {
                    size: node.importance * 5, // Size by importance
                    fill: statusColors[node.status as keyof typeof statusColors],
                    stroke: '#000',
                    lineWidth: 2,
                },
                label: {
                    value: `${node.label} (${node.importance})`,
                    fill: '#000',
                    fontSize: 12,
                },
            },
        })),
        edges: rawData.edges.map(edge => ({
            ...edge,
            style: {
                keyshape: {
                    stroke: '#999',
                    lineWidth: edge.weight,
                },
            },
        })),
    };

    return (
        <Graphin
            data={styledData}
            layout={{ type: 'circular' }}
            style={{ height: 500 }}
        >
            <Toolbar />
            <Legend
                options={Object.entries(statusColors).map(([status, color]) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: status,
                    color,
                }))}
            />
        </Graphin>
    );
};

// Export all examples
export const GraphinExamples = {
    BasicGraphExample,
    HierarchicalTreeExample,
    NodeExpansionExample,
    ClusteringExample,
    SearchExample,
    TimelineAnimationExample,
    MultiLayerExample,
    PathFindingExample,
    DynamicDataExample,
    CustomStylingExample,
};

export default GraphinExamples;