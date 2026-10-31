import os
import json
import logging
import joblib
import numpy as np
from typing import Dict, Any, List, Optional

logger = logging.getLogger("nyayagraph.ml_clustering")

class MLClusteringService:
    """
    Modular Unsupervised Machine Learning Clustering Service for Nexus AI.
    Loads trained clustering artifacts, leakage ablation benchmarks, GMM sanity checks,
    and provides real-time inductive prediction with Out-of-Distribution (OOD) flagging.
    """

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.artifacts_dir = os.path.join(self.base_dir, "ml_artifacts")
        self.joblib_path = os.path.join(self.artifacts_dir, "best_clustering_model.joblib")
        self.json_path = os.path.join(self.artifacts_dir, "clustering_results.json")
        
        self.model_data = None
        self.results_json = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads fitted model artifacts and experiment results from disk."""
        try:
            if os.path.exists(self.joblib_path):
                self.model_data = joblib.load(self.joblib_path)
                logger.info(f"Loaded ML model artifact from {self.joblib_path}")
            else:
                logger.warning(f"ML artifact not found at {self.joblib_path}")

            if os.path.exists(self.json_path):
                with open(self.json_path, "r", encoding="utf-8") as f:
                    self.results_json = json.load(f)
                logger.info(f"Loaded clustering results JSON from {self.json_path}")
            else:
                logger.warning(f"Clustering results JSON not found at {self.json_path}")
        except Exception as e:
            logger.error(f"Error loading ML clustering artifacts: {e}", exc_info=True)

    def get_models_comparison(self) -> Dict[str, Any]:
        """Returns the comparative evaluation and leakage ablation tables."""
        if not self.results_json:
            return {"error": "Clustering results not loaded", "leakage_ablation": {}}
        return {
            "title": self.results_json.get("title", "Comparative Evaluation"),
            "selection_rule": self.results_json.get("selection_rule", ""),
            "chosen_feature_set": self.results_json.get("chosen_feature_set", ""),
            "leakage_ablation": self.results_json.get("leakage_ablation", {}),
            "gmm_sanity_check": self.results_json.get("gmm_sanity_check", []),
            "numeric_verifications": self.results_json.get("numeric_verifications", {}),
            "total_dataset_nodes": self.results_json.get("total_nodes", 0)
        }

    def get_best_model_details(self) -> Dict[str, Any]:
        """Returns the selected best model, 70/30 metrics, and confusion matrix."""
        if not self.results_json:
            return {"error": "Best model details not loaded"}
        return self.results_json.get("best_model", {})

    def get_clustered_nodes(
        self,
        offset: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        cluster_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Returns paginated clustered nodes with PCA 2D coordinates and features."""
        if not self.results_json:
            return {"total": 0, "nodes": []}

        nodes = self.results_json.get("sample_clustered_nodes", [])
        filtered = nodes

        if category:
            cat_lower = category.lower().strip()
            filtered = [
                n for n in filtered
                if cat_lower in str(n.get("mapped_node_type", "")).lower()
                or cat_lower in str(n.get("node_type_label", "")).lower()
            ]

        if cluster_id is not None:
            filtered = [n for n in filtered if n.get("assigned_cluster") == cluster_id]

        total = len(filtered)
        paged = filtered[offset : offset + limit]

        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "nodes": paged,
            "pca_explained_variance": self.results_json.get("pca_explained_variance", [])
        }

    def get_visualizations(self) -> Dict[str, Any]:
        """Returns visualization catalog and explained variance metadata."""
        return {
            "plots": [
                {
                    "id": "metric_comparison",
                    "title": "Leakage Ablation Benchmarks (Set A vs Set B)",
                    "url": "/images/metric_comparison.png",
                    "description": "Comparison of Davies-Bouldin, Calinski-Harabasz, Silhouette, and Node-Type Agreement across 20 split seeds."
                },
                {
                    "id": "confusion_matrix",
                    "title": "Node-Type Agreement Matrix (Set B Structural Features)",
                    "url": "/images/confusion_matrix_best_model.png",
                    "description": "Agreement with dataset node-type labels (NOT independent ground truth)."
                },
                {
                    "id": "pca_clusters",
                    "title": "2D PCA Projection of Structural Clusters (Set B)",
                    "url": "/images/pca_clusters_gmm.png",
                    "description": "Principal Component Analysis projection of structural crime network clusters."
                },
                {
                    "id": "cluster_distribution",
                    "title": "Cluster Size & Category Distribution",
                    "url": "/images/cluster_distribution.png",
                    "description": "Distribution of entities categorized across discovered structural clusters."
                }
            ],
            "pca_explained_variance": self.results_json.get("pca_explained_variance", []) if self.results_json else []
        }

    def predict_entity(self, entity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies a new entity using the fitted StandardScaler + K-Means model on Set B.
        Requires all 8 structural features and checks for Out-of-Distribution (OOD) status.
        """
        if not self.model_data:
            return {"error": "Fitted model artifact not loaded"}

        try:
            feature_cols = self.model_data["feature_cols"]  # 8 structural features
            
            # REQUIRE ALL FEATURES (Reject missing values)
            missing_features = [col for col in feature_cols if entity_data.get(col) is None]
            if missing_features:
                raise ValueError(
                    f"All {len(feature_cols)} structural features are strictly required. Missing: {missing_features}"
                )

            feat_vector = [float(entity_data[col]) for col in feature_cols]
            X_raw = np.array([feat_vector])

            scaler = self.model_data["scaler"]
            model = self.model_data["model"]
            pca = self.model_data.get("pca")
            cluster_to_label_map = self.model_data["cluster_to_label_map"]
            density_estimator = self.model_data.get("density_estimator")
            ood_threshold = self.model_data.get("ood_threshold_5th_percentile", -14.4336)
            dist_thresh_95 = self.model_data.get("centroid_distance_threshold_95th", 2.6306)

            X_scaled = scaler.transform(X_raw)

            # Predict cluster via Voronoi centroids
            cluster_id = int(model.predict(X_scaled)[0])
            centroid = model.cluster_centers_[cluster_id]
            dist_to_centroid = float(np.linalg.norm(X_scaled[0] - centroid))
            is_dist_outlier = bool(dist_to_centroid > dist_thresh_95)

            # Density estimation & Out-of-Distribution (OOD) check
            log_prob = float(density_estimator.score_samples(X_scaled)[0]) if density_estimator else 0.0
            is_ood = bool(log_prob < ood_threshold)

            # Mapped node-type label
            mapped_label = cluster_to_label_map.get(cluster_id, "UNKNOWN")

            # 2D PCA projection coordinates
            pca_coords = [0.0, 0.0]
            if pca:
                pca_proj = pca.transform(X_scaled)
                pca_coords = [round(float(pca_proj[0, 0]), 4), round(float(pca_proj[0, 1]), 4)]

            return {
                "entity_label": entity_data.get("label", "Unknown"),
                "assigned_cluster": cluster_id,
                "mapped_node_type": mapped_label,
                "distance_to_centroid": round(dist_to_centroid, 4),
                "centroid_distance_threshold_95th": round(dist_thresh_95, 4),
                "is_distance_outlier": is_dist_outlier,
                "log_likelihood": round(log_prob, 4),
                "ood_threshold_5th_percentile": round(ood_threshold, 4),
                "is_out_of_distribution": is_ood,
                "pca_projection": {"x": pca_coords[0], "y": pca_coords[1]},
                "model_used": "K-Means (Set B Structural Features)"
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}", exc_info=True)
            return {"error": str(e)}
