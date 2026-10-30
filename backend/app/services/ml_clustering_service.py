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
    Loads trained clustering artifacts, comparative metrics, and provides
    real-time inductive prediction with posterior probability confidence.
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
        """Returns the 4-model comparative evaluation table and metadata."""
        if not self.results_json:
            return {"error": "Clustering results not loaded", "comparison": []}
        return {
            "title": "Unsupervised Clustering Comparative Evaluation (SIH26189)",
            "models_count": len(self.results_json.get("comparison", [])),
            "comparison": self.results_json.get("comparison", []),
            "total_dataset_nodes": self.results_json.get("total_nodes", 0)
        }

    def get_best_model_details(self) -> Dict[str, Any]:
        """Returns the selected best model, justification, and confusion matrix."""
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
            filtered = [n for n in filtered if cat_lower in n.get("gmm_predicted_category", "").lower() or cat_lower in n.get("actual_category", "").lower()]

        if cluster_id is not None:
            filtered = [n for n in filtered if n.get("gmm_cluster") == cluster_id]

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
        """Returns image URLs and data for frontend visualization widgets."""
        return {
            "plots": [
                {
                    "id": "metric_comparison",
                    "title": "4-Model Performance Metric Benchmarks",
                    "url": "/images/metric_comparison.png",
                    "description": "Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Index, and Ground-Truth Hungarian F1."
                },
                {
                    "id": "confusion_matrix",
                    "title": "Best Model Confusion Matrix (GMM)",
                    "url": "/images/confusion_matrix_best_model.png",
                    "description": "Actual CBI Ground-Truth Classes vs Hungarian Mapped Predicted Classes."
                },
                {
                    "id": "pca_clusters",
                    "title": "2D PCA Projection of Clustered Crime Network",
                    "url": "/images/pca_clusters_gmm.png",
                    "description": "Principal Component Analysis projection of 2,258 network entities."
                },
                {
                    "id": "cluster_distribution",
                    "title": "Cluster Size & Category Distribution",
                    "url": "/images/cluster_distribution.png",
                    "description": "Distribution of entities categorized across Gaussian mixture components."
                }
            ],
            "pca_explained_variance": self.results_json.get("pca_explained_variance", []) if self.results_json else []
        }

    def predict_entity(self, entity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies a new or unseen entity/node using the fitted StandardScaler
        and Gaussian Mixture Model (GMM). Returns predicted cluster, mapped forensic
        category, and posterior probability confidence.
        """
        if not self.model_data:
            return {"error": "Fitted model artifact not loaded"}

        try:
            model = self.model_data["model"]
            scaler = self.model_data["scaler"]
            pca = self.model_data.get("pca")
            feature_cols = self.model_data["feature_cols"]
            cluster_to_class = self.model_data["cluster_to_class"]
            unique_classes = self.model_data["unique_classes"]

            # Extract or default feature vector
            feat_vector = []
            for col in feature_cols:
                val = entity_data.get(col)
                if val is None:
                    # Provide intuitive defaults if caller provides partial features
                    if col == "label_length":
                        val = len(str(entity_data.get("label", "")))
                    elif col == "word_count":
                        val = len(str(entity_data.get("label", "")).split())
                    elif col == "is_case_hub":
                        val = 1.0 if "hub" in str(entity_data.get("label", "")).lower() else 0.0
                    else:
                        val = 0.0
                feat_vector.append(float(val))

            X_raw = np.array([feat_vector])
            X_scaled = scaler.transform(X_raw)

            # GMM prediction & probabilities
            cluster_id = int(model.predict(X_scaled)[0])
            probs = model.predict_proba(X_scaled)[0].tolist()
            log_prob = float(model.score_samples(X_scaled)[0])

            # Map cluster to class
            class_idx = cluster_to_class.get(cluster_id, 0)
            mapped_category = unique_classes[class_idx] if class_idx < len(unique_classes) else "UNKNOWN"

            # 2D PCA projection for live visual positioning
            pca_coords = [0.0, 0.0]
            if pca:
                pca_proj = pca.transform(X_scaled)
                pca_coords = [round(float(pca_proj[0, 0]), 4), round(float(pca_proj[0, 1]), 4)]

            return {
                "entity_label": entity_data.get("label", "Unknown"),
                "predicted_cluster": cluster_id,
                "forensic_category": mapped_category,
                "confidence_score": round(float(max(probs)), 4),
                "posterior_probabilities": {f"cluster_{i}": round(float(p), 4) for i, p in enumerate(probs)},
                "log_likelihood": round(log_prob, 4),
                "pca_projection": {"x": pca_coords[0], "y": pca_coords[1]},
                "model_used": "Gaussian Mixture Model (full covariance)"
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}", exc_info=True)
            return {"error": str(e)}
