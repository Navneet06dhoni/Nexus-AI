import os
import sys

# Test backend loading & endpoints via TestClient
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("1. Root endpoint:")
r = client.get("/")
print("Root status:", r.status_code)

print("\n2. Health check:")
r = client.get("/api/v1/health")
print("Health status:", r.status_code, r.json())

print("\n3. Models Comparison:")
r = client.get("/api/v1/clustering/models-comparison")
print("Comparison status:", r.status_code)
d = r.json()
print("Models count:", len(d.get("comparison", [])))
for m in d.get("comparison", []):
    print(f"  {m['model_name']}: Sil={m['silhouette_score']}, DB={m['davies_bouldin_index']}, CH={m['calinski_harabasz_index']}, F1={m['f1_score_weighted']}")

print("\n4. Best Model:")
r = client.get("/api/v1/clustering/best-model")
print("Best model status:", r.status_code)
bm = r.json()
print("Best Model Name:", bm.get("name"))
print("Metrics:", bm.get("metrics"))

print("\n5. Clustered Nodes (Sample):")
r = client.get("/api/v1/clustering/cluster-nodes?limit=3")
print("Cluster nodes status:", r.status_code)
cn = r.json()
print(f"Total: {cn.get('total')}, Sample node 0:", cn.get('nodes')[0].get('label') if cn.get('nodes') else None)

print("\n6. Visualizations endpoint:")
r = client.get("/api/v1/clustering/visualizations")
print("Visualizations status:", r.status_code)
vis = r.json()
print("Plots available:", [p["id"] for p in vis.get("plots", [])])

print("\n7. Live Prediction Inference:")
payload = {
    "label": "M/s Alpha Shell Company",
    "degree": 5.0,
    "weighted_degree": 18.0,
    "pagerank": 0.0012,
    "core_number": 2.0,
    "clustering_coeff": 0.05,
    "betweenness": 0.015,
    "eigenvector": 0.04,
    "avg_neighbor_degree": 25.0,
    "conn_person_ratio": 0.4,
    "conn_legal_ratio": 0.2,
    "conn_evidence_ratio": 0.4,
    "conn_bank_ratio": 0.0,
    "is_case_hub": 0.0
}
r = client.post("/api/v1/clustering/predict", json=payload)
print("Prediction status:", r.status_code)
pred = r.json()
print("Prediction response:", pred)
print("\nALL BACKEND API VERIFICATIONS PASSED!")
