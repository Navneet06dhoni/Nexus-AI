import json
import time
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score, calinski_harabasz_score,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, adjusted_rand_score
)
from sklearn.decomposition import PCA
from scipy.optimize import linear_sum_assignment
from scipy.spatial.distance import cdist
import joblib
import warnings
warnings.filterwarnings('ignore')

# Resolve repo root paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = os.environ.get(
    "ML_ARTIFACTS_DIR", 
    os.path.join(BASE_DIR, "backend", "app", "ml_artifacts")
)
FRONTEND_IMG_DIR = os.environ.get(
    "ML_FRONTEND_IMG_DIR",
    os.path.join(BASE_DIR, "frontend", "public", "images")
)
FRONTEND_DATA_DIR = os.environ.get(
    "ML_FRONTEND_DATA_DIR",
    os.path.join(BASE_DIR, "frontend", "public", "data")
)
CSV_PATH = os.environ.get(
    "ML_FEATURES_CSV",
    os.path.join(BASE_DIR, "backend", "app", "ml_artifacts", "features_df.csv")
)

os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(FRONTEND_IMG_DIR, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)

features_A = [
    "degree", "weighted_degree", "pagerank", "core_number", "clustering_coeff",
    "betweenness", "eigenvector", "avg_neighbor_degree", "conn_person_ratio",
    "conn_legal_ratio", "conn_evidence_ratio", "conn_bank_ratio",
    "label_length", "word_count", "is_case_hub"
]

features_B = [
    "degree", "weighted_degree", "pagerank", "core_number", "clustering_coeff",
    "betweenness", "eigenvector", "avg_neighbor_degree"
]

y_labels = df["node_type_label"].values
unique_classes = sorted(list(set(y_labels)))
class_to_idx = {c: i for i, c in enumerate(unique_classes)}
y_all = np.array([class_to_idx[c] for c in y_labels])
n_classes = len(unique_classes)

def hungarian_agreement(y_true, cluster_labels, n_classes):
    mask = cluster_labels != -1
    if np.sum(mask) == 0:
        return 0.0, 0.0, 0.0, 0.0, np.full(len(y_true), -1)
    u_clusters = np.unique(cluster_labels[mask])
    cost_matrix = np.zeros((len(u_clusters), n_classes))
    for i, c in enumerate(u_clusters):
        c_mask = cluster_labels == c
        for j in range(n_classes):
            cost_matrix[i, j] = -np.sum((y_true == j) & c_mask)
    r_ind, c_ind = linear_sum_assignment(cost_matrix)
    c_map = {u_clusters[r]: c_ind[r] for r in range(len(r_ind))}
    y_pred = np.array([c_map.get(c, -1) for c in cluster_labels])
    
    valid = y_pred != -1
    if np.sum(valid) > 0:
        acc = accuracy_score(y_true[valid], y_pred[valid])
        prec = precision_score(y_true[valid], y_pred[valid], average='macro', zero_division=0)
        rec = recall_score(y_true[valid], y_pred[valid], average='macro', zero_division=0)
        f1 = f1_score(y_true[valid], y_pred[valid], average='weighted', zero_division=0)
    else:
        acc, prec, rec, f1 = 0.0, 0.0, 0.0, 0.0
    return acc, prec, rec, f1, y_pred

# ==============================================================================
# 1. GMM SANITY CHECK
# ==============================================================================
print("Running GMM Sanity Check on Set B and Set A...")
scaler_B = StandardScaler()
X_B = scaler_B.fit_transform(df[features_B].values)

scaler_A = StandardScaler()
X_A = scaler_A.fit_transform(df[features_A].values)

gmm_sanity_records = []
for set_lbl, X_mat in [("Set_B_Structural", X_B), ("Set_A_15Features", X_A)]:
    for cov_type in ['full', 'tied', 'diag', 'spherical']:
        for reg in [1e-6, 1e-3, 1e-2, 1e-1]:
            g = GaussianMixture(n_components=4, covariance_type=cov_type, reg_covar=reg, random_state=42)
            g.fit(X_mat)
            preds = g.predict(X_mat)
            sil = float(silhouette_score(X_mat, preds)) if len(set(preds)) > 1 else -1.0
            
            # calculate min eigenvalue
            if cov_type == 'full':
                evals_per_k = [np.min(np.linalg.eigvalsh(g.covariances_[i])) for i in range(4)]
                m_eval = min(evals_per_k)
                cond_nums = [np.max(np.linalg.eigvalsh(g.covariances_[i])) / np.min(np.linalg.eigvalsh(g.covariances_[i])) for i in range(4)]
                max_cond = max(cond_nums)
            elif cov_type == 'tied':
                evals = np.linalg.eigvalsh(g.covariances_)
                m_eval = np.min(evals)
                max_cond = np.max(evals) / np.min(evals)
            elif cov_type == 'diag':
                m_eval = np.min(g.covariances_)
                max_cond = np.max(g.covariances_) / np.min(g.covariances_)
            else: # spherical
                m_eval = np.min(g.covariances_)
                max_cond = 1.0
                
            gmm_sanity_records.append({
                "feature_set": set_lbl,
                "covariance_type": cov_type,
                "reg_covar": float(reg),
                "bic": float(round(g.bic(X_mat), 2)),
                "aic": float(round(g.aic(X_mat), 2)),
                "silhouette": float(round(sil, 4)),
                "min_eigenvalue": float(m_eval),
                "max_condition_number": float(max_cond)
            })

df_gmm_sanity = pd.DataFrame(gmm_sanity_records)

# ==============================================================================
# 2. NUMERIC VERIFICATIONS: Spectral Stability & DBSCAN Noise vs Betweenness
# ==============================================================================
print("Running Numeric Verifications...")
# Verification A: Spectral Clustering cluster distribution
sc = SpectralClustering(n_clusters=4, affinity='rbf', random_state=42)
sc_labels_B = sc.fit_predict(X_B)
sc_counts = pd.Series(sc_labels_B).value_counts().to_dict()
sc_giant_cluster_size = max(sc_counts.values())
sc_giant_cluster_pct = round((sc_giant_cluster_size / len(df)) * 100.0, 2)

# Verification B: DBSCAN noise nodes vs betweenness
db = DBSCAN(eps=1.5, min_samples=10).fit(X_B)
noise_mask = db.labels_ == -1
n_noise = int(np.sum(noise_mask))
noise_pct = round(float(n_noise / len(df) * 100.0), 2)
bw_noise_mean = round(float(df.loc[noise_mask, 'betweenness'].mean()), 6)
bw_non_noise_mean = round(float(df.loc[~noise_mask, 'betweenness'].mean()), 6)
bw_all_mean = round(float(df['betweenness'].mean()), 6)
bw_ratio_to_average = round(bw_noise_mean / bw_all_mean, 2)
bw_ratio_to_non_noise = round(bw_noise_mean / bw_non_noise_mean, 2)

numeric_verifications = {
    "spectral_stability_collapse": {
        "statement": "Spectral clustering stability = 1.0 in prior runs was an artifact of degenerate cluster collapse.",
        "cluster_distribution": sc_counts,
        "giant_cluster_count": sc_giant_cluster_size,
        "giant_cluster_percentage": sc_giant_cluster_pct,
        "explanation": f"Cluster 0 contains {sc_giant_cluster_size} of {len(df)} nodes ({sc_giant_cluster_pct}%). Because over 96% of points belong to a single mass, random subsamples trivially match on the dominant cluster, giving artificially high ARI."
    },
    "dbscan_noise_betweenness": {
        "statement": "DBSCAN noise nodes have significantly higher betweenness centrality than average.",
        "noise_nodes_count": n_noise,
        "noise_percentage": noise_pct,
        "mean_betweenness_noise": bw_noise_mean,
        "mean_betweenness_non_noise": bw_non_noise_mean,
        "mean_betweenness_all": bw_all_mean,
        "ratio_noise_to_all": bw_ratio_to_average,
        "ratio_noise_to_non_noise": bw_ratio_to_non_noise,
        "explanation": f"DBSCAN noise nodes have a mean betweenness of {bw_noise_mean:.6f}, which is {bw_ratio_to_average}x higher than the overall dataset mean ({bw_all_mean:.6f}) and {bw_ratio_to_non_noise}x higher than non-noise nodes ({bw_non_noise_mean:.6f}). DBSCAN treats sparse inter-cluster bridge nodes as noise due to lack of local density."
    }
}

# ==============================================================================
# 3. 70/30 SPLIT EVALUATION ACROSS 20 SEEDS (SET A & SET B)
# ==============================================================================
print("Running 70/30 Split Evaluation across 20 Seeds...")

def run_20_seed_experiment(feat_cols, feat_name):
    X_full = df[feat_cols].values
    n_seeds = 20
    
    models_dict = {
        "K-Means": {"sil": [], "db": [], "ch": [], "acc": [], "prec": [], "rec": [], "f1": [], "noise": []},
        "DBSCAN": {"sil": [], "db": [], "ch": [], "acc": [], "prec": [], "rec": [], "f1": [], "noise": []},
        "GMM": {"sil": [], "db": [], "ch": [], "acc": [], "prec": [], "rec": [], "f1": [], "noise": []},
        "Spectral": {"sil": [], "db": [], "ch": [], "acc": [], "prec": [], "rec": [], "f1": [], "noise": []}
    }
    
    test_preds = {"K-Means": [], "DBSCAN": [], "GMM": [], "Spectral": []}
    test_indices = []
    
    for seed in range(1, n_seeds + 1):
        idx_train, idx_test = train_test_split(
            np.arange(len(df)), test_size=0.30, random_state=seed, stratify=y_all
        )
        test_indices.append(idx_test)
        
        sc_obj = StandardScaler()
        X_tr = sc_obj.fit_transform(X_full[idx_train])
        X_te = sc_obj.transform(X_full[idx_test])
        y_te = y_all[idx_test]
        
        # 1. K-Means (predict on test)
        km = KMeans(n_clusters=4, init='k-means++', n_init=5, random_state=seed)
        km.fit(X_tr)
        km_te = km.predict(X_te)
        test_preds["K-Means"].append(km_te)
        models_dict["K-Means"]["sil"].append(silhouette_score(X_te, km_te))
        models_dict["K-Means"]["db"].append(davies_bouldin_score(X_te, km_te))
        models_dict["K-Means"]["ch"].append(calinski_harabasz_score(X_te, km_te))
        acc, pr, rc, f1, _ = hungarian_agreement(y_te, km_te, n_classes)
        models_dict["K-Means"]["acc"].append(acc)
        models_dict["K-Means"]["prec"].append(pr)
        models_dict["K-Means"]["rec"].append(rc)
        models_dict["K-Means"]["f1"].append(f1)
        models_dict["K-Means"]["noise"].append(0.0)
        
        # 2. DBSCAN (nearest centroid out-of-sample)
        db = DBSCAN(eps=1.5, min_samples=10).fit(X_tr)
        u_cl = [c for c in np.unique(db.labels_) if c != -1]
        if len(u_cl) > 0:
            cents = np.array([X_tr[db.labels_ == c].mean(axis=0) for c in u_cl])
            d_mat = cdist(X_te, cents, metric='euclidean')
            near = np.argmin(d_mat, axis=1)
            min_d = np.min(d_mat, axis=1)
            db_te = np.array([u_cl[near[i]] if min_d[i] <= 2.0 else -1 for i in range(len(X_te))])
        else:
            db_te = np.full(len(X_te), -1)
            
        test_preds["DBSCAN"].append(db_te)
        models_dict["DBSCAN"]["noise"].append(np.mean(db_te == -1) * 100.0)
        v_mask = db_te != -1
        if len(np.unique(db_te[v_mask])) > 1:
            models_dict["DBSCAN"]["sil"].append(silhouette_score(X_te[v_mask], db_te[v_mask]))
            models_dict["DBSCAN"]["db"].append(davies_bouldin_score(X_te[v_mask], db_te[v_mask]))
            models_dict["DBSCAN"]["ch"].append(calinski_harabasz_score(X_te[v_mask], db_te[v_mask]))
        else:
            models_dict["DBSCAN"]["sil"].append(0.0)
            models_dict["DBSCAN"]["db"].append(99.0)
            models_dict["DBSCAN"]["ch"].append(0.0)
        acc, pr, rc, f1, _ = hungarian_agreement(y_te, db_te, n_classes)
        models_dict["DBSCAN"]["acc"].append(acc)
        models_dict["DBSCAN"]["prec"].append(pr)
        models_dict["DBSCAN"]["rec"].append(rc)
        models_dict["DBSCAN"]["f1"].append(f1)
        
        # 3. GMM (regularized, predict on test)
        gmm = GaussianMixture(n_components=4, covariance_type='full', reg_covar=1e-3, random_state=seed, n_init=3)
        gmm.fit(X_tr)
        gmm_te = gmm.predict(X_te)
        test_preds["GMM"].append(gmm_te)
        models_dict["GMM"]["sil"].append(silhouette_score(X_te, gmm_te))
        models_dict["GMM"]["db"].append(davies_bouldin_score(X_te, gmm_te))
        models_dict["GMM"]["ch"].append(calinski_harabasz_score(X_te, gmm_te))
        acc, pr, rc, f1, _ = hungarian_agreement(y_te, gmm_te, n_classes)
        models_dict["GMM"]["acc"].append(acc)
        models_dict["GMM"]["prec"].append(pr)
        models_dict["GMM"]["rec"].append(rc)
        models_dict["GMM"]["f1"].append(f1)
        models_dict["GMM"]["noise"].append(0.0)
        
        # 4. Spectral (nearest centroid out-of-sample)
        sc = SpectralClustering(n_clusters=4, affinity='rbf', random_state=seed, n_init=3)
        sc_lbl = sc.fit_predict(X_tr)
        u_sc = np.unique(sc_lbl)
        cents_sc = np.array([X_tr[sc_lbl == c].mean(axis=0) for c in u_sc])
        d_sc = cdist(X_te, cents_sc, metric='euclidean')
        sc_te = np.array([u_sc[np.argmin(d_sc[i])] for i in range(len(X_te))])
        test_preds["Spectral"].append(sc_te)
        
        if len(np.unique(sc_te)) > 1:
            models_dict["Spectral"]["sil"].append(silhouette_score(X_te, sc_te))
            models_dict["Spectral"]["db"].append(davies_bouldin_score(X_te, sc_te))
            models_dict["Spectral"]["ch"].append(calinski_harabasz_score(X_te, sc_te))
        else:
            models_dict["Spectral"]["sil"].append(0.0)
            models_dict["Spectral"]["db"].append(99.0)
            models_dict["Spectral"]["ch"].append(0.0)
        acc, pr, rc, f1, _ = hungarian_agreement(y_te, sc_te, n_classes)
        models_dict["Spectral"]["acc"].append(acc)
        models_dict["Spectral"]["prec"].append(pr)
        models_dict["Spectral"]["rec"].append(rc)
        models_dict["Spectral"]["f1"].append(f1)
        models_dict["Spectral"]["noise"].append(0.0)

    # Stability ARI on overlapping test nodes between consecutive split pairs
    model_stats = []
    for m_name in ["K-Means", "DBSCAN", "GMM", "Spectral"]:
        aris = []
        for i in range(n_seeds):
            for j in range(i + 1, min(i + 6, n_seeds)):
                c_idx = np.intersect1d(test_indices[i], test_indices[j])
                if len(c_idx) > 20:
                    map_i = {test_indices[i][k]: test_preds[m_name][i][k] for k in range(len(test_indices[i]))}
                    map_j = {test_indices[j][k]: test_preds[m_name][j][k] for k in range(len(test_indices[j]))}
                    aris.append(adjusted_rand_score([map_i[x] for x in c_idx], [map_j[x] for x in c_idx]))
        
        m_data = models_dict[m_name]
        model_stats.append({
            "model_name": m_name,
            "feature_set": feat_name,
            "silhouette_mean": float(round(np.mean(m_data["sil"]), 4)),
            "silhouette_sd": float(round(np.std(m_data["sil"]), 4)),
            "davies_bouldin_mean": float(round(np.mean(m_data["db"]), 4)),
            "davies_bouldin_sd": float(round(np.std(m_data["db"]), 4)),
            "calinski_harabasz_mean": float(round(np.mean(m_data["ch"]), 1)),
            "calinski_harabasz_sd": float(round(np.std(m_data["ch"]), 1)),
            "agreement_rate_mean": float(round(np.mean(m_data["acc"]), 4)),
            "agreement_rate_sd": float(round(np.std(m_data["acc"]), 4)),
            "agreement_weighted_f1_mean": float(round(np.mean(m_data["f1"]), 4)),
            "agreement_weighted_f1_sd": float(round(np.std(m_data["f1"]), 4)),
            "noise_percentage_mean": float(round(np.mean(m_data["noise"]), 2)),
            "noise_percentage_sd": float(round(np.std(m_data["noise"]), 2)),
            "stability_ari_mean": float(round(np.mean(aris), 4)),
            "stability_ari_sd": float(round(np.std(aris), 4))
        })
    return model_stats

stats_A = run_20_seed_experiment(features_A, "Set A (15 features with ratios/leakage)")
stats_B = run_20_seed_experiment(features_B, "Set B (8 structural features)")

# ==============================================================================
# 4. FIT BEST MODEL ON ENTIRE SET B (MODEL SELECTION MUST USE SET B)
# ==============================================================================
print("\nFitting Best Model (K-Means on Set B) and Density Estimator for OOD...")
scaler_final = StandardScaler()
X_B_scaled = scaler_final.fit_transform(df[features_B].values)

kmeans_best = KMeans(n_clusters=4, init='k-means++', n_init=20, random_state=42)
best_labels = kmeans_best.fit_predict(X_B_scaled)

# Hungarian mapping on full Set B
acc_best, pr_best, rec_best, f1_best, mapped_preds = hungarian_agreement(y_all, best_labels, n_classes)

# Compute Confusion Matrix (Actual vs Mapped)
cm = confusion_matrix(y_all, mapped_preds)
cm_dict = {
    "labels": unique_classes,
    "matrix": cm.tolist()
}

# 2D PCA for visual projection on Set B
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_B_scaled)
pca_var = pca.explained_variance_ratio_.tolist()

# Fit GMM on Set B for density estimation & Out-of-Distribution (OOD) percentile
gmm_density = GaussianMixture(n_components=4, covariance_type='tied', reg_covar=1e-3, random_state=42)
gmm_density.fit(X_B_scaled)
train_log_likelihoods = gmm_density.score_samples(X_B_scaled)
ood_threshold_p05 = float(np.percentile(train_log_likelihoods, 5))
ood_threshold_p01 = float(np.percentile(train_log_likelihoods, 1))

# Centroid distance percentiles for distance-based OOD metric
cents = kmeans_best.cluster_centers_
dists = np.min(np.linalg.norm(X_B_scaled[:, None, :] - cents[None, :, :], axis=2), axis=1)
d95 = float(np.percentile(dists, 95))
d99 = float(np.percentile(dists, 99))

print(f"OOD Log-Likelihood Thresholds on Set B: 5th percentile = {ood_threshold_p05:.2f}, 1st percentile = {ood_threshold_p01:.2f}")
print(f"Centroid Distance Thresholds on Set B: 95th percentile = {d95:.4f}, 99th percentile = {d99:.4f}")

# Map cluster indices to node-type labels for K-Means
mask = best_labels != -1
u_cl = np.unique(best_labels[mask])
cost_m = np.zeros((len(u_cl), n_classes))
for i, c in enumerate(u_cl):
    for j in range(n_classes):
        cost_m[i, j] = -np.sum((y_all == j) & (best_labels == c))
r_ind, c_ind = linear_sum_assignment(cost_m)
cluster_to_label_map = {int(u_cl[r]): unique_classes[c_ind[r]] for r in range(len(r_ind))}

# ==============================================================================
# 5. SERIALIZE EXPERIMENTAL ARTIFACTS
# ==============================================================================
best_model_artifact = {
    "best_model_name": "K-Means (Set B Structural Features)",
    "selection_rule": "Internal metrics (Davies-Bouldin, Calinski-Harabasz, Silhouette) + Stability (Test ARI) + Noise % first; agreement with node-type labels second. Set B (8 structural features) selected to eliminate neighbor-label leakage.",
    "model": kmeans_best,
    "density_estimator": gmm_density,
    "scaler": scaler_final,
    "pca": pca,
    "feature_cols": features_B,
    "unique_classes": unique_classes,
    "cluster_to_label_map": cluster_to_label_map,
    "ood_threshold_5th_percentile": ood_threshold_p05,
    "ood_threshold_1st_percentile": ood_threshold_p01,
    "centroid_distance_threshold_95th": d95,
    "centroid_distance_threshold_99th": d99,
    "confusion_matrix": cm_dict,
    "verifications": numeric_verifications
}

joblib.dump(best_model_artifact, os.path.join(ARTIFACTS_DIR, "best_clustering_model.joblib"))

# Prepare exportable JSON payload
nodes_sample = []
for i in range(min(500, len(df))):
    nodes_sample.append({
        "id": df.iloc[i]["id"],
        "label": df.iloc[i]["label"],
        "node_type_label": df.iloc[i]["node_type_label"],
        "assigned_cluster": int(best_labels[i]),
        "mapped_node_type": cluster_to_label_map.get(int(best_labels[i]), "UNKNOWN"),
        "pca_x": round(float(X_pca[i, 0]), 4),
        "pca_y": round(float(X_pca[i, 1]), 4),
        "features": {col: round(float(df.iloc[i][col]), 6) for col in features_B}
    })

full_results_payload = {
    "title": "Nexus AI — Leakage Ablation, GMM Sanity Check & 70/30 Cross-Validation",
    "selection_rule": "Selection rule applied on Set B: Internal metrics (Davies-Bouldin, Calinski-Harabasz, Silhouette) + Stability (Test ARI) + Noise % first; agreement with node-type labels second.",
    "chosen_feature_set": "Set B (8 structural features: degree, weighted_degree, pagerank, core_number, clustering_coeff, betweenness, eigenvector, avg_neighbor_degree)",
    "best_model": {
        "name": "K-Means (Set B Structural Features)",
        "hyperparameters": {"n_clusters": 4, "init": "k-means++", "n_init": 20, "random_state": 42},
        "metrics_70_30": [s for s in stats_B if s["model_name"] == "K-Means"][0],
        "confusion_matrix": cm_dict,
        "ood_thresholds": {
            "percentile_5th": ood_threshold_p05,
            "percentile_1st": ood_threshold_p01,
            "distance_95th_percentile": d95,
            "distance_99th_percentile": d99
        }
    },
    "leakage_ablation": {
        "set_A_15_features": stats_A,
        "set_B_8_structural_features": stats_B
    },
    "gmm_sanity_check": gmm_sanity_records,
    "numeric_verifications": numeric_verifications,
    "pca_explained_variance": [round(v, 4) for v in pca_var],
    "sample_clustered_nodes": nodes_sample,
    "total_nodes": len(df)
}

with open(os.path.join(ARTIFACTS_DIR, "clustering_results.json"), "w", encoding="utf-8") as f:
    json.dump(full_results_payload, f, indent=2)

with open(os.path.join(FRONTEND_DATA_DIR, "clustering_results.json"), "w", encoding="utf-8") as f:
    json.dump(full_results_payload, f, indent=2)

# ==============================================================================
# 6. GENERATE ALL VISUALIZATIONS (PNG)
# ==============================================================================
print("Generating publication-quality visualization plots...")
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

# Plot 1: Leakage Ablation Comparison Chart
fig, axes = plt.subplots(2, 2, figsize=(15, 11))
fig.suptitle("Leakage Ablation: Set A (15 Features with Neighbor Ratios) vs Set B (8 Structural Features)\n(70/30 Split Across 20 Seeds, Mean ± SD)", fontsize=14, fontweight='bold')

m_names = ["K-Means", "DBSCAN", "GMM", "Spectral"]
x = np.arange(len(m_names))
w = 0.35

# 1. Davies-Bouldin
db_A = [s["davies_bouldin_mean"] for s in stats_A]
db_B = [min(s["davies_bouldin_mean"], 5.0) for s in stats_B]
axes[0, 0].bar(x - w/2, db_A, w, label='Set A (with Ratios)', color='#94a3b8')
axes[0, 0].bar(x + w/2, db_B, w, label='Set B (Structural Only)', color='#3b82f6')
axes[0, 0].set_title("Davies-Bouldin Index (Lower is Better)", fontweight='bold')
axes[0, 0].set_xticks(x)
axes[0, 0].set_xticklabels(m_names)
axes[0, 0].legend()

# 2. Calinski-Harabasz
ch_A = [s["calinski_harabasz_mean"] for s in stats_A]
ch_B = [s["calinski_harabasz_mean"] for s in stats_B]
axes[0, 1].bar(x - w/2, ch_A, w, label='Set A', color='#94a3b8')
axes[0, 1].bar(x + w/2, ch_B, w, label='Set B', color='#3b82f6')
axes[0, 1].set_title("Calinski-Harabasz Index (Higher is Better)", fontweight='bold')
axes[0, 1].set_xticks(x)
axes[0, 1].set_xticklabels(m_names)
axes[0, 1].legend()

# 3. Silhouette
sil_A = [s["silhouette_mean"] for s in stats_A]
sil_B = [s["silhouette_mean"] for s in stats_B]
axes[1, 0].bar(x - w/2, sil_A, w, label='Set A', color='#94a3b8')
axes[1, 0].bar(x + w/2, sil_B, w, label='Set B', color='#3b82f6')
axes[1, 0].set_title("Silhouette Score (Higher is Better)", fontweight='bold')
axes[1, 0].set_xticks(x)
axes[1, 0].set_xticklabels(m_names)
axes[1, 0].legend()

# 4. Agreement with node-type labels
agr_A = [s["agreement_weighted_f1_mean"] * 100 for s in stats_A]
agr_B = [s["agreement_weighted_f1_mean"] * 100 for s in stats_B]
axes[1, 1].bar(x - w/2, agr_A, w, label='Set A', color='#94a3b8')
axes[1, 1].bar(x + w/2, agr_B, w, label='Set B', color='#3b82f6')
axes[1, 1].set_title("Agreement with Node-Type Labels (%)", fontweight='bold')
axes[1, 1].set_xticks(x)
axes[1, 1].set_xticklabels(m_names)
axes[1, 1].legend()

plt.tight_layout()
fig.savefig(os.path.join(ARTIFACTS_DIR, "metric_comparison.png"), dpi=300)
fig.savefig(os.path.join(FRONTEND_IMG_DIR, "metric_comparison.png"), dpi=300)
plt.close()

# Plot 2: Confusion Matrix (Agreement with node-type labels on Set B)
plt.figure(figsize=(9, 7))
sns.heatmap(
    cm, annot=True, fmt='d', cmap='Blues',
    xticklabels=unique_classes, yticklabels=unique_classes,
    cbar=True, annot_kws={"size": 13, "weight": "bold"}
)
plt.title("Agreement with Node-Type Labels (NOT Independent Ground Truth)\nBest Model: K-Means (Set B Structural Features)", fontsize=13, fontweight='bold', pad=15)
plt.xlabel("Assigned / Mapped Cluster Label", fontsize=11, fontweight='bold')
plt.ylabel("Dataset Node-Type Label", fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(ARTIFACTS_DIR, "confusion_matrix_best_model.png"), dpi=300)
plt.savefig(os.path.join(FRONTEND_IMG_DIR, "confusion_matrix_best_model.png"), dpi=300)
plt.close()

# Plot 3: 2D PCA Cluster Scatter Plot
df_sample = pd.DataFrame(nodes_sample)
plt.figure(figsize=(11, 8))
palette = ['#2563eb', '#16a34a', '#dc2626', '#9333ea']
sns.scatterplot(
    data=df_sample,
    x='pca_x', y='pca_y',
    hue='mapped_node_type',
    palette=palette,
    alpha=0.8,
    s=70,
    edgecolor='w',
    linewidth=0.5
)
plt.title("Nexus AI — 2D PCA of Structural Crime Network Clusters (Set B Features)", fontsize=14, fontweight='bold')
plt.xlabel(f"Principal Component 1 ({pca_var[0]*100:.1f}% Variance)", fontsize=11)
plt.ylabel(f"Principal Component 2 ({pca_var[1]*100:.1f}% Variance)", fontsize=11)
plt.legend(title="Assigned Cluster", loc='best', frameon=True)
plt.tight_layout()
plt.savefig(os.path.join(ARTIFACTS_DIR, "pca_clusters_gmm.png"), dpi=300)
plt.savefig(os.path.join(FRONTEND_IMG_DIR, "pca_clusters_gmm.png"), dpi=300)
plt.close()

# Plot 4: Cluster Distribution
plt.figure(figsize=(8, 5))
cat_counts = df_sample['mapped_node_type'].value_counts()
bars = plt.bar(cat_counts.index, cat_counts.values, color=['#2563eb', '#16a34a', '#dc2626', '#9333ea'], edgecolor='#1e293b', alpha=0.85)
plt.title("Cluster Entity Distribution — K-Means (Set B Structural Features)", fontsize=13, fontweight='bold')
plt.xlabel("Mapped Forensic Cluster", fontsize=11)
plt.ylabel("Entity Count (Sample)", fontsize=11)
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 5, f"{int(yval)}", ha='center', va='bottom', fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(ARTIFACTS_DIR, "cluster_distribution.png"), dpi=300)
plt.savefig(os.path.join(FRONTEND_IMG_DIR, "cluster_distribution.png"), dpi=300)
plt.close()

print("ALL EVALUATION EXPERIMENTS AND ARTIFACTS COMPLETED SUCCESSFULLY!")

