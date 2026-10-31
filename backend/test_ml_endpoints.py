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
print("Health status:", r.status_code)

print("\n3. Models Comparison & Leakage Ablation:")
r = client.get("/api/v1/clustering/models-comparison")
print("Comparison status:", r.status_code)
d = r.json()
print("Leakage ablation keys:", list(d.get("leakage_ablation", {}).keys()))
print("Set B models:")
for m in d.get("leakage_ablation", {}).get("set_B_8_structural_features", []):
    print(f"  {m['model_name']}: DB={m['davies_bouldin_mean']}±{m['davies_bouldin_sd']}, CH={m['calinski_harabasz_mean']}±{m['calinski_harabasz_sd']}, Sil={m['silhouette_mean']}±{m['silhouette_sd']}, AgrF1={m['agreement_weighted_f1_mean']}±{m['agreement_weighted_f1_sd']}")

print("\nNumeric Verifications in response:")
print("  Spectral Collapse:", d.get("numeric_verifications", {}).get("spectral_stability_collapse", {}).get("giant_cluster_percentage"), "% in single cluster")
print("  DBSCAN Noise BW Ratio:", d.get("numeric_verifications", {}).get("dbscan_noise_betweenness", {}).get("ratio_noise_to_all"), "x higher than average")

print("\n4. Best Model:")
r = client.get("/api/v1/clustering/best-model")
print("Best model status:", r.status_code)
bm = r.json()
print("Best Model Name:", bm.get("name"))
print("70/30 Metrics:", bm.get("metrics_70_30"))
print("OOD Thresholds:", bm.get("ood_thresholds"))

print("\n5. Clustered Nodes (Sample):")
r = client.get("/api/v1/clustering/cluster-nodes?limit=3")
print("Cluster nodes status:", r.status_code)
cn = r.json()
print(f"Total: {cn.get('total')}, Sample node 0:", cn.get('nodes')[0].get('label') if cn.get('nodes') else None)

print("\n6. Live Prediction Inference - In-Distribution:")
payload_normal = {
    "label": "Accused Syndicate Hub",
    "degree": 3.0,
    "weighted_degree": 9.0,
    "pagerank": 0.0005,
    "core_number": 1.0,
    "clustering_coeff": 0.0,
    "betweenness": 0.001,
    "eigenvector": 0.01,
    "avg_neighbor_degree": 25.0
}
r = client.post("/api/v1/clustering/predict", json=payload_normal)
print("Normal prediction status:", r.status_code)
pred = r.json()
print("Normal prediction response:", pred)
assert "is_out_of_distribution" in pred, "OOD flag missing!"
print("is_out_of_distribution:", pred["is_out_of_distribution"])

print("\n7. Live Prediction Inference - Out-of-Distribution (Extreme Outlier):")
payload_outlier = {
    "label": "Synthetic Anomalous Entity",
    "degree": 150.0,
    "weighted_degree": 900.0,
    "pagerank": 0.5,
    "core_number": 50.0,
    "clustering_coeff": 0.9,
    "betweenness": 0.8,
    "eigenvector": 0.9,
    "avg_neighbor_degree": 200.0
}
r = client.post("/api/v1/clustering/predict", json=payload_outlier)
print("Outlier prediction status:", r.status_code)
pred_outlier = r.json()
print("Outlier prediction response:", pred_outlier)
print("is_out_of_distribution:", pred_outlier["is_out_of_distribution"])
assert pred_outlier["is_out_of_distribution"] is True, "Outlier should be flagged as OOD!"

print("\n8. Live Prediction Inference - Reject Missing Features:")
payload_incomplete = {
    "label": "Incomplete Entity",
    "degree": 3.0
    # missing other 7 features
}
r = client.post("/api/v1/clustering/predict", json=payload_incomplete)
print("Incomplete request status (Expected 422 Unprocessable Entity):", r.status_code)
assert r.status_code == 422, f"Expected 422, got {r.status_code}"

print("\nALL BACKEND API VERIFICATIONS PASSED!")
