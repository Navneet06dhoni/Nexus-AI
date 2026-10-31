import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Body
from pydantic import BaseModel, Field

from ..services.ml_clustering_service import MLClusteringService

logger = logging.getLogger("nyayagraph.api.clustering")

router = APIRouter(prefix="/api/v1/clustering", tags=["Unsupervised ML Clustering"])
ml_service = MLClusteringService()


class EntityPredictionRequest(BaseModel):
    label: str = Field("Accused Entity / Broker Node", description="Entity name or label")
    degree: float = Field(..., description="Node degree (connected links) - REQUIRED")
    weighted_degree: float = Field(..., description="Sum of incident link weights - REQUIRED")
    pagerank: float = Field(..., description="PageRank centrality score - REQUIRED")
    core_number: float = Field(..., description="K-core decomposition number - REQUIRED")
    clustering_coeff: float = Field(..., description="Local clustering coefficient - REQUIRED")
    betweenness: float = Field(..., description="Betweenness centrality score - REQUIRED")
    eigenvector: float = Field(..., description="Eigenvector centrality score - REQUIRED")
    avg_neighbor_degree: float = Field(..., description="Average neighbor degree - REQUIRED")


@router.get("/models-comparison")
def get_models_comparison():
    """
    Returns the comparative evaluation and leakage ablation of all four unsupervised models:
    K-Means, DBSCAN, Gaussian Mixture Model (GMM), and Spectral Clustering on both
    Set A (15 features with neighbor ratios) and Set B (8 structural features).
    """
    return ml_service.get_models_comparison()


@router.get("/best-model")
def get_best_model():
    """
    Returns the selected best-performing model (K-Means on Set B structural features),
    selection rule, 70/30 split evaluation metrics (mean ± sd over 20 seeds),
    out-of-distribution log-likelihood thresholds, and agreement matrix.
    """
    return ml_service.get_best_model_details()


@router.get("/cluster-nodes")
def get_cluster_nodes(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    category: Optional[str] = Query(None, description="Filter by node-type label"),
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID (0-3)")
):
    """
    Returns clustered graph nodes with their structural cluster assignments,
    2D PCA visualization coordinates, and original Set B structural features.
    """
    return ml_service.get_clustered_nodes(offset=offset, limit=limit, category=category, cluster_id=cluster_id)


@router.get("/visualizations")
def get_visualizations():
    """
    Returns pre-rendered high-resolution visualization charts and metadata.
    """
    return ml_service.get_visualizations()


@router.post("/predict")
def predict_entity_cluster(request: EntityPredictionRequest):
    """
    Inference endpoint: Requires all 8 structural features, classifies the entity
    into a structural cluster via K-Means centroids, and flags Out-of-Distribution (OOD)
    records based on the log-likelihood percentile threshold.
    """
    res = ml_service.predict_entity(request.dict())
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res
