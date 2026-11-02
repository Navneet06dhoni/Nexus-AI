import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score, calinski_harabasz_score,
    accuracy_score, f1_score, adjusted_rand_score
)
from scipy.optimize import linear_sum_assignment
from scipy.spatial.distance import cdist
import warnings
warnings.filterwarnings('ignore')

# Resolve repo root paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.environ.get(
    "ML_FEATURES_CSV",
    os.path.join(BASE_DIR, "backend", "app", "ml_artifacts", "features_df.csv")
)

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
        return 0.0, 0.0
    u_clusters = np.unique(cluster_labels[mask])
    cost_matrix = np.zeros((len(u_clusters), n_classes))
    for i, c in enumerate(u_clusters):
        c_mask = cluster_labels == c
        for j in range(n_classes):
            cost_matrix[i, j] = -np.sum((y_true == j) & c_mask)
    r_ind, c_ind = linear_sum_assignment(cost_matrix)
    c_map = {u_clusters[r]: c_ind[r] for r in range(len(r_ind))}
    y_pred = np.array([c_map.get(c, -1) for c in cluster_labels])
    
    # Agreement on non-noise
    valid = y_pred != -1
    acc = accuracy_score(y_true[valid], y_pred[valid]) if np.sum(valid) > 0 else 0.0
    f1 = f1_score(y_true[valid], y_pred[valid], average='weighted', zero_division=0) if np.sum(valid) > 0 else 0.0
    return acc, f1

def evaluate_70_30(features, feat_name, n_seeds=20):
    X_full = df[features].values
    
    results = {
        "K-Means": {"sil": [], "db": [], "ch": [], "agr_acc": [], "agr_f1": [], "noise": [], "ari": []},
        "DBSCAN": {"sil": [], "db": [], "ch": [], "agr_acc": [], "agr_f1": [], "noise": [], "ari": []},
        "GMM": {"sil": [], "db": [], "ch": [], "agr_acc": [], "agr_f1": [], "noise": [], "ari": []},
        "Spectral": {"sil": [], "db": [], "ch": [], "agr_acc": [], "agr_f1": [], "noise": [], "ari": []}
    }
    
    # Store predictions on test points across seeds for pairwise ARI
    test_preds_by_model = {"K-Means": [], "DBSCAN": [], "GMM": [], "Spectral": []}
    test_indices_by_seed = []

    print(f"\nRunning 70/30 split across {n_seeds} seeds for {feat_name}...")
    
    for seed in range(1, n_seeds + 1):
        idx_train, idx_test = train_test_split(
            np.arange(len(df)), test_size=0.30, random_state=seed, stratify=y_all
        )
        test_indices_by_seed.append(idx_test)
        
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_full[idx_train])
        X_test = scaler.transform(X_full[idx_test])
        y_test = y_all[idx_test]
        
        # 1. K-Means
        km = KMeans(n_clusters=4, init='k-means++', n_init=5, random_state=seed)
        km.fit(X_train)
        km_test = km.predict(X_test)
        test_preds_by_model["K-Means"].append(km_test)
        
        results["K-Means"]["sil"].append(silhouette_score(X_test, km_test))
        results["K-Means"]["db"].append(davies_bouldin_score(X_test, km_test))
        results["K-Means"]["ch"].append(calinski_harabasz_score(X_test, km_test))
        km_acc, km_f1 = hungarian_agreement(y_test, km_test, n_classes)
        results["K-Means"]["agr_acc"].append(km_acc)
        results["K-Means"]["agr_f1"].append(km_f1)
        results["K-Means"]["noise"].append(0.0)
        
        # 2. DBSCAN
        db = DBSCAN(eps=1.5, min_samples=10)
        db_train_labels = db.fit_predict(X_train)
        valid_train = db_train_labels != -1
        u_clusters = [c for c in np.unique(db_train_labels) if c != -1]
        
        if len(u_clusters) > 0:
            centroids = np.array([X_train[db_train_labels == c].mean(axis=0) for c in u_clusters])
            dists = cdist(X_test, centroids, metric='euclidean')
            nearest = np.argmin(dists, axis=1)
            min_dist = np.min(dists, axis=1)
            # if distance to nearest centroid > eps * 1.5, mark as noise
            db_test = np.array([u_clusters[nearest[i]] if min_dist[i] <= 2.0 else -1 for i in range(len(X_test))])
        else:
            db_test = np.full(len(X_test), -1)
            
        test_preds_by_model["DBSCAN"].append(db_test)
        noise_pct = np.mean(db_test == -1) * 100.0
        results["DBSCAN"]["noise"].append(noise_pct)
        
        mask = db_test != -1
        if len(np.unique(db_test[mask])) > 1:
            results["DBSCAN"]["sil"].append(silhouette_score(X_test[mask], db_test[mask]))
            results["DBSCAN"]["db"].append(davies_bouldin_score(X_test[mask], db_test[mask]))
            results["DBSCAN"]["ch"].append(calinski_harabasz_score(X_test[mask], db_test[mask]))
        else:
            results["DBSCAN"]["sil"].append(0.0)
            results["DBSCAN"]["db"].append(99.0)
            results["DBSCAN"]["ch"].append(0.0)
        db_acc, db_f1 = hungarian_agreement(y_test, db_test, n_classes)
        results["DBSCAN"]["agr_acc"].append(db_acc)
        results["DBSCAN"]["agr_f1"].append(db_f1)
        
        # 3. GMM (using regularized covariance reg_covar=1e-3 to prevent singularity)
        gmm = GaussianMixture(n_components=4, covariance_type='full', reg_covar=1e-3, random_state=seed, n_init=3)
        gmm.fit(X_train)
        gmm_test = gmm.predict(X_test)
        test_preds_by_model["GMM"].append(gmm_test)
        
        results["GMM"]["sil"].append(silhouette_score(X_test, gmm_test))
        results["GMM"]["db"].append(davies_bouldin_score(X_test, gmm_test))
        results["GMM"]["ch"].append(calinski_harabasz_score(X_test, gmm_test))
        gmm_acc, gmm_f1 = hungarian_agreement(y_test, gmm_test, n_classes)
        results["GMM"]["agr_acc"].append(gmm_acc)
        results["GMM"]["agr_f1"].append(gmm_f1)
        results["GMM"]["noise"].append(0.0)
        
        # 4. Spectral (nearest centroid out-of-sample)
        sc = SpectralClustering(n_clusters=4, affinity='rbf', random_state=seed, n_init=3)
        sc_train_labels = sc.fit_predict(X_train)
        centroids_sc = np.array([X_train[sc_train_labels == c].mean(axis=0) for c in range(4)])
        dists_sc = cdist(X_test, centroids_sc, metric='euclidean')
        sc_test = np.argmin(dists_sc, axis=1)
        test_preds_by_model["Spectral"].append(sc_test)
        
        if len(np.unique(sc_test)) > 1:
            results["Spectral"]["sil"].append(silhouette_score(X_test, sc_test))
            results["Spectral"]["db"].append(davies_bouldin_score(X_test, sc_test))
            results["Spectral"]["ch"].append(calinski_harabasz_score(X_test, sc_test))
        else:
            results["Spectral"]["sil"].append(0.0)
            results["Spectral"]["db"].append(99.0)
            results["Spectral"]["ch"].append(0.0)
        sc_acc, sc_f1 = hungarian_agreement(y_test, sc_test, n_classes)
        results["Spectral"]["agr_acc"].append(sc_acc)
        results["Spectral"]["agr_f1"].append(sc_f1)
        results["Spectral"]["noise"].append(0.0)
        
    # Pairwise test stability (ARI across common test indices between seeds)
    for model_name in ["K-Means", "DBSCAN", "GMM", "Spectral"]:
        aris = []
        for i in range(n_seeds):
            for j in range(i + 1, min(i + 6, n_seeds)):
                common_idx = np.intersect1d(test_indices_by_seed[i], test_indices_by_seed[j])
                if len(common_idx) > 20:
                    map_i = {test_indices_by_seed[i][k]: test_preds_by_model[model_name][i][k] for k in range(len(test_indices_by_seed[i]))}
                    map_j = {test_indices_by_seed[j][k]: test_preds_by_model[model_name][j][k] for k in range(len(test_indices_by_seed[j]))}
                    labels_i = [map_i[idx] for idx in common_idx]
                    labels_j = [map_j[idx] for idx in common_idx]
                    aris.append(adjusted_rand_score(labels_i, labels_j))
        results[model_name]["ari"] = aris
        
    # Summarize mean +- sd
    summary = []
    for model_name in ["K-Means", "DBSCAN", "GMM", "Spectral"]:
        m = results[model_name]
        summary.append({
            "Feature Set": feat_name,
            "Model": model_name,
            "Silhouette": f"{np.mean(m['sil']):.4f} ± {np.std(m['sil']):.4f}",
            "Davies-Bouldin": f"{np.mean(m['db']):.4f} ± {np.std(m['db']):.4f}",
            "Calinski-Harabasz": f"{np.mean(m['ch']):.1f} ± {np.std(m['ch']):.1f}",
            "Agreement Rate": f"{np.mean(m['agr_acc'])*100:.2f}% ± {np.std(m['agr_acc'])*100:.2f}%",
            "Agreement Weighted F1": f"{np.mean(m['agr_f1'])*100:.2f}% ± {np.std(m['agr_f1'])*100:.2f}%",
            "Noise %": f"{np.mean(m['noise']):.2f}% ± {np.std(m['noise']):.2f}%",
            "Stability (Test ARI)": f"{np.mean(m['ari']):.4f} ± {np.std(m['ari']):.4f}"
        })
    return pd.DataFrame(summary), results

if __name__ == "__main__":
    df_sum_A, raw_A = evaluate_70_30(features_A, "Set A (15 features with ratios/leakage)")
    df_sum_B, raw_B = evaluate_70_30(features_B, "Set B (8 structural features)")

    print("\n" + "="*80)
    print("LEAKAGE ABLATION: 70/30 SPLIT (20 SEEDS MEAN ± SD)")
    print("="*80)
    print("\n--- SET A (15 Features) ---")
    print(df_sum_A.to_string(index=False))

    print("\n--- SET B (8 Structural Features) ---")
    print(df_sum_B.to_string(index=False))

