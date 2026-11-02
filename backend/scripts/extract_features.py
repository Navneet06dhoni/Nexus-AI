import json
import os
import networkx as nx
import pandas as pd
import numpy as np

# Resolve repo root paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GRAPH_PATH = os.path.join(BASE_DIR, "data", "cbi_aggregate_graph.json")
OUTPUT_PATH = os.environ.get(
    "ML_FEATURES_CSV", 
    os.path.join(BASE_DIR, "backend", "app", "ml_artifacts", "features_df.csv")
)

# Load aggregate graph
with open(GRAPH_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

nodes = data["nodes"]
edges = data["edges"]

G = nx.Graph()
for n in nodes:
    G.add_node(n["id"], category=n.get("category", "UNKNOWN"), label=n.get("label", ""))

for e in edges:
    src = e.get("source") or e.get("from")
    tgt = e.get("target") or e.get("to")
    w = float(e.get("weight", 1.0))
    if src in G and tgt in G:
        G.add_edge(src, tgt, weight=w)

degrees = dict(G.degree())
weighted_degrees = dict(G.degree(weight='weight'))
pageranks = nx.pagerank(G, weight='weight')
core_numbers = nx.core_number(G)
clustering_coeffs = nx.clustering(G)
betweenness = nx.betweenness_centrality(G, weight='weight', k=min(len(G), 500), seed=42)
eigenvector = nx.eigenvector_centrality(G, max_iter=1000, tol=1e-4)

feature_list = []
for n in nodes:
    nid = n["id"]
    cat = n.get("category", "UNKNOWN")
    lbl = n.get("label", "")
    nbrs = list(G.neighbors(nid))
    nbr_count = len(nbrs)
    nbr_cats = [G.nodes[nbr].get("category", "") for nbr in nbrs]
    
    person_ratio = sum(1 for c in nbr_cats if c == "PERSON") / max(1, nbr_count)
    legal_ratio = sum(1 for c in nbr_cats if c == "LEGAL_SECTION") / max(1, nbr_count)
    evidence_ratio = sum(1 for c in nbr_cats if c == "EVIDENCE") / max(1, nbr_count)
    bank_ratio = sum(1 for c in nbr_cats if c == "BANK_ACCOUNT") / max(1, nbr_count)
    avg_nbr_deg = np.mean([degrees.get(nbr, 0) for nbr in nbrs]) if nbrs else 0.0

    feature_list.append({
        "id": nid,
        "label": lbl,
        "node_type_label": cat,
        # Structure-only (Set B - 8 features)
        "degree": float(degrees.get(nid, 0)),
        "weighted_degree": float(weighted_degrees.get(nid, 0.0)),
        "pagerank": float(pageranks.get(nid, 0.0)),
        "core_number": float(core_numbers.get(nid, 0)),
        "clustering_coeff": float(clustering_coeffs.get(nid, 0.0)),
        "betweenness": float(betweenness.get(nid, 0.0)),
        "eigenvector": float(eigenvector.get(nid, 0.0)),
        "avg_neighbor_degree": float(avg_nbr_deg),
        # Leakage/Metadata (in Set A only - 7 features)
        "conn_person_ratio": float(person_ratio),
        "conn_legal_ratio": float(legal_ratio),
        "conn_evidence_ratio": float(evidence_ratio),
        "conn_bank_ratio": float(bank_ratio),
        "label_length": float(len(lbl)),
        "word_count": float(len(lbl.split())),
        "is_case_hub": float(1 if "HUB_CASE" in nid else 0)
    })

df = pd.DataFrame(feature_list)
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
df.to_csv(OUTPUT_PATH, index=False)
print(f"Extracted {len(df)} nodes successfully to {OUTPUT_PATH}.")

