import networkx as nx
from pyvis.network import Network
from typing import Dict, List, Any
from pydantic import BaseModel, Field

# Schema definitions for API delivery to React frontend
class GraphNode(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Display label for the node")
    type: str = Field(..., description="Type of node: injury, body_part, exercise, nutrition, recovery")
    color: str = Field(..., description="Hex color value for styling")
    size: int = Field(default=20, description="Size of the node in the visualization")

class GraphEdge(BaseModel):
    source: str = Field(..., description="ID of the source node")
    target: str = Field(..., description="ID of the target node")
    label: str = Field(..., description="Description of the relationship (e.g., 'strengthens', 'occurs_in')")
    relation: str = Field(..., description="Description of the relationship for the React frontend")

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Premium color palette for graph nodes
COLOR_PALETTE = {
    "body_part": "#6366F1",  # Sleek Indigo
    "injury": "#F43F5E",     # Rose Pink (Vibrant)
    "exercise": "#10B981",   # Emerald Green
    "nutrition": "#F59E0B",  # Amber Gold
    "recovery": "#06B6D4"    # Bright Cyan
}

# Node size configuration by type
NODE_SIZES = {
    "body_part": 25,
    "injury": 30,  # Center of attention
    "exercise": 20,
    "nutrition": 20,
    "recovery": 20
}

# Pre-defined Knowledge Graph database for common athletic conditions
KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "patellar_tendonitis": {
        "injury_name": "Patellar Tendonitis",
        "body_part": "Knee Joint",
        "exercises": [
            {"name": "Isometric Wall Sits", "relation": "relieves load on"},
            {"name": "Spanish Squats", "relation": "strengthens tendon for"},
            {"name": "Leg Extensions (Slow Eccentric)", "relation": "rebuilds collagen in"}
        ],
        "nutrition": [
            {"name": "Collagen Peptides", "relation": "synthesizes tendon tissue"},
            {"name": "Vitamin C", "relation": "catalyzes collagen absorption"},
            {"name": "Omega-3 Fatty Acids", "relation": "reduces tendon inflammation"}
        ],
        "recovery": [
            {"name": "Flossing / Occlusion", "relation": "increases local blood flow to"},
            {"name": "Patellar Counterforce Strap", "relation": "disperses mechanical stress on"},
            {"name": "Ice Massage", "relation": "numbs acute pain in"}
        ]
    },
    "acl_sprain": {
        "injury_name": "ACL Sprain",
        "body_part": "Knee Joint",
        "exercises": [
            {"name": "Hamstring Curls", "relation": "compensates stability for"},
            {"name": "Straight Leg Raises", "relation": "activates quadriceps around"},
            {"name": "Single-Leg Balance", "relation": "restores proprioception to"}
        ],
        "nutrition": [
            {"name": "Whey Protein", "relation": "prevents muscle atrophy"},
            {"name": "Creatine Monohydrate", "relation": "maintains muscle strength"},
            {"name": "Vitamin D & Calcium", "relation": "supports joint bone health"}
        ],
        "recovery": [
            {"name": "Neuromuscular Electrical Stimulation (NMES)", "relation": "prevents quad shutdown"},
            {"name": "Compression Knee Sleeve", "relation": "reduces joint effusion in"},
            {"name": "Progressive Knee Flexion/Extension", "relation": "restores range of motion to"}
        ]
    },
    "rotator_cuff_tendonitis": {
        "injury_name": "Rotator Cuff Tendonitis",
        "body_part": "Shoulder (Glenohumeral)",
        "exercises": [
            {"name": "External Shoulder Rotation (Banded)", "relation": "stabilizes rotator cuff"},
            {"name": "Scapular Y-T-W Raises", "relation": "improves scapular movement"},
            {"name": "Face Pulls", "relation": "strengthens rear deltoid and cuff"}
        ],
        "nutrition": [
            {"name": "Curcumin / Turmeric", "relation": "lowers systemic joint inflammation"},
            {"name": "Magnesium Bisglycinate", "relation": "relaxes surrounding muscle tension"},
            {"name": "Water / Hydration", "relation": "maintains joint lubrication"}
        ],
        "recovery": [
            {"name": "Postural Correction", "relation": "prevents subacromial impingement"},
            {"name": "Active Mobility Drills", "relation": "increases synovial fluid flow"},
            {"name": "Heat Therapy", "relation": "relaxes stiff shoulder muscles"}
        ]
    }
}

def generate_graph_data(injury_key: str) -> GraphDataResponse:
    """
    Constructs a GraphDataResponse (nodes & edges) for a given injury.
    Returns an empty graph if the injury key is not found.
    """
    # Normalize input key
    key = injury_key.lower().replace(" ", "_")
    if key not in KNOWLEDGE_BASE:
        # Fallback to returning a default empty structure or first key
        key = "patellar_tendonitis"
        
    data = KNOWLEDGE_BASE[key]
    
    nodes = []
    edges = []
    
    # 1. Add the central Injury Node
    injury_id = "injury_node"
    nodes.append(GraphNode(
        id=injury_id,
        label=data["injury_name"],
        type="injury",
        color=COLOR_PALETTE["injury"],
        size=NODE_SIZES["injury"]
    ))
    
    # 2. Add the Body Part Node
    body_part_id = "body_part_node"
    nodes.append(GraphNode(
        id=body_part_id,
        label=data["body_part"],
        type="body_part",
        color=COLOR_PALETTE["body_part"],
        size=NODE_SIZES["body_part"]
    ))
    
    # Edge between injury and body part
    edges.append(GraphEdge(
        source=injury_id,
        target=body_part_id,
        label="located_in",
        relation="located_in"
    ))
    
    # 3. Add Exercise Nodes and Edges
    for i, item in enumerate(data["exercises"]):
        node_id = f"exercise_{i}"
        nodes.append(GraphNode(
            id=node_id,
            label=item["name"],
            type="exercise",
            color=COLOR_PALETTE["exercise"],
            size=NODE_SIZES["exercise"]
        ))
        edges.append(GraphEdge(
            source=node_id,
            target=injury_id,
            label=item["relation"],
            relation=item["relation"]
        ))
        
    # 4. Add Nutrition Nodes and Edges
    for i, item in enumerate(data["nutrition"]):
        node_id = f"nutrition_{i}"
        nodes.append(GraphNode(
            id=node_id,
            label=item["name"],
            type="nutrition",
            color=COLOR_PALETTE["nutrition"],
            size=NODE_SIZES["nutrition"]
        ))
        edges.append(GraphEdge(
            source=node_id,
            target=injury_id,
            label=item["relation"],
            relation=item["relation"]
        ))
        
    # 5. Add Recovery Nodes and Edges
    for i, item in enumerate(data["recovery"]):
        node_id = f"recovery_{i}"
        nodes.append(GraphNode(
            id=node_id,
            label=item["name"],
            type="recovery",
            color=COLOR_PALETTE["recovery"],
            size=NODE_SIZES["recovery"]
        ))
        edges.append(GraphEdge(
            source=node_id,
            target=injury_id,
            label=item["relation"],
            relation=item["relation"]
        ))
        
    return GraphDataResponse(nodes=nodes, edges=edges)

def generate_local_html_visualization(injury_key: str, output_path: str = "graph.html") -> str:
    """
    Generates a local interactive HTML graph using NetworkX and PyVis.
    Saves the file to output_path and returns the path.
    """
    graph_response = generate_graph_data(injury_key)
    
    # Create NetworkX graph representation
    g = nx.DiGraph()
    
    # Add nodes to NetworkX
    for node in graph_response.nodes:
        # Use pyvis specific fields like color, title, and size
        g.add_node(
            node.id,
            label=node.label,
            color=node.color,
            size=node.size,
            title=f"Type: {node.type.replace('_', ' ').title()}"
        )
        
    # Add edges to NetworkX
    for edge in graph_response.edges:
        g.add_edge(
            edge.source,
            edge.target,
            label=edge.label,
            title=edge.label
        )
        
    # Build PyVis interactive representation
    # Using dark background and clean interactive physics
    net = Network(height="750px", width="100%", bgcolor="#0F172A", font_color="#F8FAFC", directed=True)
    net.from_nx(g)
    
    # Customize edge colors and layout behaviors
    for edge in net.edges:
        edge["color"] = "#475569" # Slate edge color
        edge["arrows"] = "to"
        
    # Force layout settings for premium aesthetics
    net.set_options("""
    var options = {
      "physics": {
        "forceAtlas2Based": {
          "gravitationalConstant": -70,
          "centralGravity": 0.01,
          "springLength": 130,
          "springConstant": 0.08
        },
        "minVelocity": 0.75,
        "solver": "forceAtlas2Based"
      },
      "interaction": {
        "hover": true,
        "navigationButtons": true
      }
    }
    """)
    
    net.save_graph(output_path)
    return output_path

if __name__ == "__main__":
    print("Testing Knowledge Graph Visualizer...")
    # Generate structured JSON for React
    json_data = generate_graph_data("patellar_tendonitis")
    print(f"Generated {len(json_data.nodes)} nodes and {len(json_data.edges)} edges for Patellar Tendonitis.")
    
    # Try generating HTML for local debugging
    try:
        path = generate_local_html_visualization("patellar_tendonitis", "patellar_tendonitis_graph.html")
        print(f"Successfully generated local HTML graph at: {path}")
    except Exception as e:
        print(f"Could not generate local HTML visualization: {e}")
