#!/usr/bin/env python3
"""
ProtoGraph API Service
FastAPI backend for serving graph data from ArangoDB
"""

import os
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from arango import ArangoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ProtoGraph API",
    description="Graph data service for ProtoGraph dashboard",
    version="1.0.0"
)

# CORS Configuration - Updated to include port 8080
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Your frontend
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
ARANGO_HOST = os.getenv("ARANGO_HOST", "http://localhost:8529")
ARANGO_USER = os.getenv("ARANGO_USER", "root")
ARANGO_PASSWORD = os.getenv("ARANGO_PASSWORD", "")
ARANGO_DB = os.getenv("ARANGO_DB", "protograph")
ARANGO_GRAPH = os.getenv("ARANGO_GRAPH", "protoGraph")

# Initialize ArangoDB connection
try:
    client = ArangoClient(hosts=ARANGO_HOST)
    db = client.db(ARANGO_DB, username=ARANGO_USER, password=ARANGO_PASSWORD)
    print(f" ✓ Connected to ArangoDB: {ARANGO_DB}")
except Exception as e:
    print(f" ✗ Failed to connect to ArangoDB: {e}")
    db = None


@app.get("/")
def root():
    """API status endpoint"""
    return {
        "service": "ProtoGraph API",
        "status": "running",
        "database": ARANGO_DB,
        "graph": ARANGO_GRAPH,
        "connected": db is not None
    }


@app.get("/graph")
def get_graph():
    """
    🌐 Get the complete graph data
    
    Returns all nodes and edges in the graph.
    """
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        # Get all nodes
        nodes_query = "FOR node IN nodes RETURN node"
        nodes_cursor = db.aql.execute(nodes_query)
        nodes = []
        
        for node in nodes_cursor:
            nodes.append({
                "id": node["_id"],
                "label": node.get("label", node["_key"]),
                "cluster": node.get("cluster"),
                "type": node.get("type"),
                "importance": node.get("importance", 0.5),
                "size": node.get("size", 40)
            })
        
        # Get all edges
        edges_query = "FOR edge IN edges RETURN edge"
        edges_cursor = db.aql.execute(edges_query)
        edges = []
        
        for edge in edges_cursor:
            edges.append({
                "id": edge["_id"],
                "source": edge["_from"],
                "target": edge["_to"],
                "type": edge.get("type", "relation"),
                "weight": edge.get("weight", 1.0)
            })
        
        return {
            "nodes": nodes,
            "edges": edges
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {str(e)}")


@app.post("/analytics/notify-update")
def notify_update(payload: Dict[str, Any]):
    """
    🔔 Receive update notifications from frontend (e.g. PowerBI sync or telemetry)
    """
    print(f"📩 Received analytics update: {payload}")
    return {"status": "ok", "received": payload}


@app.get("/neighbors/{node_key}")
def get_neighbors(node_key: str, depth: int = Query(1, ge=1, le=5)):
    """
    🔍 Get all connected nodes within N hops
    
    Args:
        node_key: The node key (without 'nodes/' prefix)
        depth: How many hops to traverse (1-5)
    
    Returns:
        Subgraph containing the center node and all neighbors within depth
    
    Example:
        /neighbors/cd-apt?depth=2
    """
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        # Clean node_key if it includes 'nodes/' prefix
        clean_key = node_key.replace('nodes/', '')
        
        # AQL query to get neighbors at specified depth
        query = """
            FOR v, e, p IN 1..@depth ANY CONCAT('nodes/', @key) edges
                RETURN DISTINCT {
                    node: v,
                    edge: e,
                    distance: LENGTH(p.edges)
                }
        """
        
        results = list(db.aql.execute(query, bind_vars={
            'key': clean_key,
            'depth': depth
        }))
        
        # Format for frontend
        nodes = []
        edges = []
        seen_nodes = set()
        seen_edges = set()
        
        # Add the center node first
        center_node_query = """
            RETURN DOCUMENT(CONCAT('nodes/', @key))
        """
        center = list(db.aql.execute(center_node_query, bind_vars={'key': clean_key}))
        
        if center and center[0]:
            center_node = center[0]
            nodes.append({
                "id": center_node["_id"],
                "label": center_node.get("label", center_node["_key"]),
                "cluster": center_node.get("cluster"),
                "type": center_node.get("type"),
                "importance": center_node.get("importance", 0.5),
                "size": center_node.get("size", 40)
            })
            seen_nodes.add(center_node["_id"])
        
        # Add neighbors
        for item in results:
            node = item['node']
            if node['_id'] not in seen_nodes:
                nodes.append({
                    "id": node["_id"],
                    "label": node.get("label", node["_key"]),
                    "cluster": node.get("cluster"),
                    "type": node.get("type"),
                    "importance": node.get("importance", 0.5),
                    "size": node.get("size", 40),
                    "distance": item["distance"]
                })
                seen_nodes.add(node['_id'])
            
            edge = item['edge']
            if edge and edge['_id'] not in seen_edges:
                edges.append({
                    "id": edge["_id"],
                    "source": edge["_from"],
                    "target": edge["_to"],
                    "type": edge.get("type", "relation"),
                    "weight": edge.get("weight", 1.0)
                })
                seen_edges.add(edge['_id'])
        
        return {
            "center": clean_key,
            "depth": depth,
            "nodes": nodes,
            "edges": edges,
            "count": len(nodes)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch neighbors: {str(e)}")


@app.get("/stats")
def get_stats():
    """
    📊 Get graph statistics
    
    Returns counts and metrics about the graph.
    """
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        # Get node count
        node_count_query = "RETURN LENGTH(nodes)"
        node_count = list(db.aql.execute(node_count_query))[0]
        
        # Get edge count
        edge_count_query = "RETURN LENGTH(edges)"
        edge_count = list(db.aql.execute(edge_count_query))[0]
        
        # Get cluster counts
        cluster_query = """
            FOR node IN nodes
                COLLECT cluster = node.cluster WITH COUNT INTO count
                RETURN {cluster: cluster, count: count}
        """
        clusters = list(db.aql.execute(cluster_query))
        
        return {
            "total_nodes": node_count,
            "total_edges": edge_count,
            "clusters": clusters
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@app.get("/search")
def search_nodes(q: str):
    """
    🔍 Search nodes by label
    
    Args:
        q: Search query string
    
    Returns:
        List of nodes matching the search
    """
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
    
    try:
        query = """
            FOR node IN nodes
                FILTER CONTAINS(LOWER(node.label), LOWER(@q))
                RETURN node
        """
        results = list(db.aql.execute(query, bind_vars={'q': q}))
        
        nodes = []
        for node in results:
            nodes.append({
                "id": node["_id"],
                "label": node.get("label", node["_key"]),
                "cluster": node.get("cluster"),
                "type": node.get("type"),
                "importance": node.get("importance", 0.5)
            })
        
        return {"results": nodes}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)