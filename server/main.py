from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import ollama
import os
from datetime import datetime
from typing import List, Dict, Optional
from collections import defaultdict

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== OLLAMA CONFIGURATION ==========

OLLAMA_HOST = "http://10.10.80.99:4001"
OLLAMA_MODEL = "gpt-oss:120b"

# Initialize Ollama client
ollama_client = ollama.Client(host=OLLAMA_HOST)

# ========== MODELS ==========

class ChatRequest(BaseModel):
    message: str
    context: str | None = None

class UpdateNotification(BaseModel):
    change_type: str
    affected_nodes: List[str] = []
    timestamp: str

# ========== MOCK GRAPH DATA ==========

MOCK_GRAPH_DATA = {
    "nodes": [
        # Content Dev
        {"id": "cd-dlo", "label": "DLO Requirements", "cluster": "content_dev", "importance": 0.95},
        {"id": "cd-apt", "label": "APT Profile", "cluster": "content_dev", "importance": 0.9},
        {"id": "cd-narrative", "label": "Scenario Narrative", "cluster": "content_dev", "importance": 0.85},
        {"id": "cd-blue-hb", "label": "Blue Team Handbook", "cluster": "content_dev", "importance": 0.9},
        # Range
        {"id": "rng-topo", "label": "Network Topology", "cluster": "range", "importance": 0.9},
        {"id": "rng-vm-setup", "label": "VM Configuration", "cluster": "range", "importance": 0.85},
        {"id": "rng-validation", "label": "Dead Range Validation", "cluster": "range", "importance": 0.8},
        # OPFOR
        {"id": "opfor-obj", "label": "Adversarial Objectives", "cluster": "opfor", "importance": 0.9},
        {"id": "opfor-campaign", "label": "Campaign Plan", "cluster": "opfor", "importance": 0.9},
        {"id": "opfor-live", "label": "Live Range Execution", "cluster": "opfor", "importance": 0.95},
        {"id": "opfor-mitre", "label": "MITRE ATT&CK TTPs", "cluster": "opfor", "importance": 0.85},
        # Automation
        {"id": "auto-req", "label": "Automation Requirements", "cluster": "automation", "importance": 0.8},
        {"id": "auto-ttp", "label": "TTP Automation Scripts", "cluster": "automation", "importance": 0.9},
        {"id": "auto-playbook", "label": "Attack Playbook", "cluster": "automation", "importance": 0.9},
    ],
    "edges": [
        # Content Dev -> OPFOR
        {"source": "cd-apt", "target": "opfor-obj", "weight": 0.95},
        {"source": "cd-narrative", "target": "opfor-campaign", "weight": 0.9},
        # Content Dev -> Range
        {"source": "cd-narrative", "target": "rng-topo", "weight": 0.9},
        {"source": "cd-blue-hb", "target": "rng-validation", "weight": 0.85},
        # OPFOR -> Automation
        {"source": "opfor-mitre", "target": "auto-ttp", "weight": 0.9},
        {"source": "opfor-campaign", "target": "auto-playbook", "weight": 0.95},
        # Automation -> OPFOR
        {"source": "auto-playbook", "target": "opfor-live", "weight": 0.95},
        # Automation -> Range
        {"source": "auto-playbook", "target": "rng-validation", "weight": 0.85},
        {"source": "auto-ttp", "target": "rng-vm-setup", "weight": 0.8},
        # OPFOR -> Range
        {"source": "opfor-live", "target": "rng-validation", "weight": 0.95},
    ]
}

# ========== HELPER FUNCTIONS ==========

def format_team_name(cluster_id: str) -> str:
    """Convert cluster IDs to display names"""
    name_map = {
        "content_dev": "Content Dev",
        "range": "Range",
        "opfor": "OPFOR",
        "automation": "Automation"
    }
    return name_map.get(cluster_id, cluster_id.replace("_", " ").title())

def calculate_coupling_matrix(graph_data: Dict) -> Dict[str, Dict[str, float]]:
    """
    Calculate weighted coupling between teams based on:
    - Number of cross-team edges
    - Edge weights
    - Node importance
    """
    edges = graph_data["edges"]
    nodes = {n["id"]: n for n in graph_data["nodes"]}
    
    coupling = defaultdict(lambda: defaultdict(float))
    
    for edge in edges:
        source_node = nodes.get(edge["source"])
        target_node = nodes.get(edge["target"])
        
        if not source_node or not target_node:
            continue
            
        source_cluster = source_node["cluster"]
        target_cluster = target_node["cluster"]
        
        # Only count cross-team edges
        if source_cluster != target_cluster:
            # Weight = edge weight * average node importance
            avg_importance = (source_node.get("importance", 0.5) + 
                            target_node.get("importance", 0.5)) / 2
            coupling_score = edge.get("weight", 0.5) * avg_importance
            
            coupling[source_cluster][target_cluster] += coupling_score
            coupling[target_cluster][source_cluster] += coupling_score
    
    # Normalize to 0-100 scale
    max_coupling = max(
        (max(targets.values()) if targets else 0) 
        for targets in coupling.values()
    )
    
    if max_coupling > 0:
        for source in coupling:
            for target in coupling[source]:
                coupling[source][target] = (coupling[source][target] / max_coupling) * 100
    
    return coupling

def get_edge_count(graph_data: Dict, cluster1: str, cluster2: str) -> int:
    """Count direct edges between two clusters"""
    edges = graph_data["edges"]
    nodes = {n["id"]: n for n in graph_data["nodes"]}
    
    count = 0
    for edge in edges:
        source_cluster = nodes.get(edge["source"], {}).get("cluster")
        target_cluster = nodes.get(edge["target"], {}).get("cluster")
        
        if (source_cluster == cluster1 and target_cluster == cluster2) or \
           (source_cluster == cluster2 and target_cluster == cluster1):
            count += 1
    
    return count

# ========== CHAT ENDPOINT ==========

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint using local Ollama instance via official library
    """
    try:
        # Build system message
        system_msg = (
            "You are a graph exploration assistant for ProtoGraph, a tool that helps teams "
            "understand relationships in their operational data. "
            "Use the provided node context to explain relationships and insights. "
            "Be concise and actionable in your responses."
        )
        
        # Build messages array
        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": f"Context: {request.context}\n\nQuestion: {request.message}"}
        ]
        
        # Call Ollama using the official library
        response = ollama_client.chat(
            model=OLLAMA_MODEL,
            messages=messages
        )
        
        return {"reply": response['message']['content']}
        
    except ollama.ResponseError as e:
        return {"reply": f"⚠️ Ollama error: {e.error}"}
    except Exception as e:
        return {"reply": f"⚠️ Error: {str(e)}. Check if Ollama is running at {OLLAMA_HOST}"}

# ========== ANALYTICS ENDPOINTS ==========

@app.get("/analytics/team-coupling")
async def get_team_coupling():
    """
    Calculate team coupling scores based on cross-cluster edge weights
    Updates in real-time as graph changes
    """
    
    graph_data = MOCK_GRAPH_DATA
    coupling_matrix = calculate_coupling_matrix(graph_data)
    
    # Format for Power BI consumption
    power_bi_format = []
    for source_team, targets in coupling_matrix.items():
        for target_team, weight in targets.items():
            if weight > 0:
                power_bi_format.append({
                    "source": format_team_name(source_team),
                    "target": format_team_name(target_team),
                    "weight": round(weight, 2),
                    "connection_count": get_edge_count(graph_data, source_team, target_team),
                    "last_updated": datetime.now().isoformat()
                })
    
    return {
        "visualization_type": "matrix_heatmap",
        "metric": "Team Coupling Score",
        "data_points": power_bi_format,
        "metadata": {
            "total_teams": len(coupling_matrix),
            "total_connections": len(power_bi_format),
            "calculation_timestamp": datetime.now().isoformat()
        }
    }

@app.get("/analytics/team-coupling-table")
async def get_team_coupling_table():
    """
    Flattened table format for easier Power BI consumption
    """
    coupling_data = await get_team_coupling()
    
    rows = []
    for dp in coupling_data["data_points"]:
        rows.append({
            "Source Team": dp["source"],
            "Target Team": dp["target"],
            "Coupling Score": dp["weight"],
            "Connection Count": dp["connection_count"],
            "Last Updated": dp["last_updated"]
        })
    
    return {
        "rows": rows,
        "refresh_time": datetime.now().isoformat()
    }

@app.post("/analytics/notify-update")
async def notify_powerbi_update(update_data: UpdateNotification):
    """
    Called by ProtoGraph frontend when graph changes
    Logs update for Power BI refresh triggers
    """
    print(f"🔄 Graph update received: {update_data.change_type}")
    print(f"   Affected nodes: {update_data.affected_nodes}")
    
    return {
        "status": "acknowledged",
        "will_refresh": True,
        "timestamp": datetime.now().isoformat()
    }

# ========== OLLAMA HEALTH CHECK ==========

@app.get("/health/ollama")
async def check_ollama():
    """
    Check if Ollama is accessible and list available models
    """
    try:
        # List available models
        models_response = ollama_client.list()
        model_names = [m['name'] for m in models_response.get('models', [])]
        
        return {
            "status": "online",
            "host": OLLAMA_HOST,
            "available_models": model_names,
            "current_model": OLLAMA_MODEL,
            "model_exists": OLLAMA_MODEL in model_names
        }
    except ollama.ResponseError as e:
        return {
            "status": "error",
            "message": f"Ollama error: {e.error}",
            "host": OLLAMA_HOST
        }
    except Exception as e:
        return {
            "status": "offline",
            "message": str(e),
            "host": OLLAMA_HOST,
            "suggestion": "Check if Ollama is running and OLLAMA_HOST is correct"
        }

# ========== ROOT ENDPOINT ==========

@app.get("/")
async def root():
    return {
        "service": "ProtoGraph Analytics API",
        "status": "online",
        "llm_backend": "Ollama (official library)",
        "ollama_host": OLLAMA_HOST,
        "ollama_model": OLLAMA_MODEL,
        "endpoints": {
            "chat": "/chat",
            "team_coupling": "/analytics/team-coupling",
            "team_coupling_table": "/analytics/team-coupling-table",
            "notify_update": "/analytics/notify-update",
            "ollama_health": "/health/ollama"
        }
    }