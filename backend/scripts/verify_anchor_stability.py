import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score, calinski_harabasz_score,
    adjusted_rand_score
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
features_B = [
    "degree", "weighted_degree", "pagerank", "core_number", "clustering_coeff",
    "betweenness", "eigenvector", "avg_neighbor_degree"
]

y_labels = df["node_type_label"].values
unique_classes = sorted(list(set(y_labels)))
class_to_idx = {c: i for i, c in enumerate(unique_classes)}
y_all = np.array([class_to_idx[c] for c in y_labels])
n_classes = len(unique_classes)

X_all = df[features_B].values

# Fixed Anchor Test Set: 30% of the dataset (678 observations) fixed with seed=42
idx_pool, idx_anchor_test = train_test_split(
    np.arange(len(df)), test_size=0.30, random_state=42, stratify=y_all
)
y_anchor = y_all[idx_anchor_test]

print(f"Fixed Anchor Test Set size: {len(idx_anchor_test)} observations.")
print(f"Training Pool size: {len(idx_pool)} observations.")

# Across 20 training seeds, sample 70% from the pool or split the pool
n_seeds = 20
seed_records = []
preds_anchor = {"K-Means": [], "DBSCAN": [], "GMM": [], "Spectral": []}

for s in range(1, n_seeds + 1):
    rng = np.random.RandomState(s)
    # Subsample 70% of dataset as training set
    tr_sub_idx = rng.choice(idx_pool, size=int(0.85 * len(idx_pool)), replace=False)
    
    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_all[tr_sub_idx])
    X_anchor = scaler.transform(X_all[idx_anchor_test])
    
    # 1. K-Means
    km = KMeans(n_clusters=4, init='k-means++', n_init=5, random_state=s).fit(X_tr)
    km_preds = km.predict(X_anchor)
    preds_anchor["K-Means"].append(km_preds)
    km_counts = pd.Series(km_preds).value_counts().to_dict()
    
    # 2. DBSCAN
    db = DBSCAN(eps=1.5, min_samples=10).fit(X_tr)
    u_db = [c for c in np.unique(db.labels_) if c != -1]
    if len(u_db) > 0:
        cents_db = np.array([X_tr[db.labels_ == c].mean(axis=0) for c in u_db])
        d_mat = cdist(X_anchor, cents_db, metric='euclidean')
        near = np.argmin(d_mat, axis=1)
        min_d = np.min(d_mat, axis=1)
        db_preds = np.array([u_db[near[i]] if min_d[i] <= 2.0 else -1 for i in range(len(X_anchor))])
    else:
        db_preds = np.full(len(X_anchor), -1)
    preds_anchor["DBSCAN"].append(db_preds)
    db_counts = pd.Series(db_preds).value_counts().to_dict()
    
    # 3. GMM
    gmm = GaussianMixture(n_components=4, covariance_type='tied', reg_covar=1e-3, random_state=s).fit(X_tr)
    gmm_preds = gmm.predict(X_anchor)
    preds_anchor["GMM"].append(gmm_preds)
    gmm_counts = pd.Series(gmm_preds).value_counts().to_dict()
    
    # 4. Spectral
    sc = SpectralClustering(n_clusters=4, affinity='rbf', random_state=s, n_init=3).fit(X_tr)
    u_sc = np.unique(sc.labels_)
    cents_sc = np.array([X_tr[sc.labels_ == c].mean(axis=0) for c in u_sc])
    d_sc = cdist(X_anchor, cents_sc, metric='euclidean')
    sc_preds = np.array([u_sc[np.argmin(d_sc[i])] for i in range(len(X_anchor))])
    preds_anchor["Spectral"].append(sc_preds)
    sc_counts = pd.Series(sc_preds).value_counts().to_dict()
    
    seed_records.append({
        "seed": s,
        "km_clusters": len(km_counts),
        "km_dist": km_counts,
        "db_clusters": len([k for k in db_counts if k != -1]),
        "db_dist": db_counts,
        "gmm_clusters": len(gmm_counts),
        "gmm_dist": gmm_counts,
        "sc_clusters": len(sc_counts),
        "sc_dist": sc_counts
    })

print("\n--- Stability ARI over identical 678 anchor observations across 20 seeds ---")
stability_results = {}
for m_name in ["K-Means", "DBSCAN", "GMM", "Spectral"]:
    aris = []
    for i in range(n_seeds):
        for j in range(i + 1, n_seeds):
            ari = adjusted_rand_score(preds_anchor[m_name][i], preds_anchor[m_name][j])
            aris.append(ari)
    stability_results[m_name] = {
        "mean_ari": np.mean(aris),
        "std_ari": np.std(aris)
    }
    print(f"{m_name}: Anchor Test ARI = {np.mean(aris):.4f} ± {np.std(aris):.4f}")

print("\n--- Seed Cluster Size Distributions Sample (Seeds 1, 5, 10, 15, 20) ---")
df_seeds = pd.DataFrame(seed_records)
for s_idx in [0, 4, 9, 14, 19]:
    row = seed_records[s_idx]
    print(f"Seed {row['seed']}:")
    print(f"  K-Means  ({row['km_clusters']} clusters): {row['km_dist']}")
    print(f"  DBSCAN   ({row['db_clusters']} clusters + noise): {row['db_dist']}")
    print(f"  GMM      ({row['gmm_clusters']} clusters): {row['gmm_dist']}")
    print(f"  Spectral ({row['sc_clusters']} clusters): {row['sc_dist']}")

