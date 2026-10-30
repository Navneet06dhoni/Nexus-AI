import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Body
from pydantic import BaseModel, Field

from ..services.ml_clustering_service import MLClusteringService

logger = logging.getLogger("nyayagraph.api.clustering")

router = APIRouter(prefix="/api/v1/clustering", tags=["Unsupervised ML Clustering"])
ml_service = MLClusteringService()


class EntityPredictionRequest(BaseModel):
    label: str = Field("Mohd. Tariq @ Chotu", description="Entity name or identifier")
    degree: Optional[float] = Field(2.0, description="Node degree (connected links)")
    weighted_degree: Optional[float] = Field(6.0, description="Sum of link weights")
    pagerank: Optional[float] = Field(0.0004, description="PageRank centrality score")
    core_number: Optional[float] = Field(1.0, description="K-core decomposition number")
    clustering_coeff: Optional[float] = Field(0.0, description="Local clustering coefficient")
    betweenness: Optional[float] = Field(0.001, description="Betweenness centrality")
    eigenvector: Optional[float] = Field(0.008, description="Eigenvector centrality")
    avg_neighbor_degree: Optional[float] = Field(15.0, description="Average neighbor degree")
    conn_person_ratio: Optional[float] = Field(0.1, description="Ratio of connections to persons")
    conn_legal_ratio: Optional[float] = Field(0.0, description="Ratio of connections to legal sections")
    conn_evidence_ratio: Optional[float] = Field(0.9, description="Ratio of connections to evidence hubs")
    conn_bank_ratio: Optional[float] = Field(0.0, description="Ratio of connections to banks")
    is_case_hub: Optional[float] = Field(0.0, description="1 if FIR case hub, 0 otherwise")


@router.get("/models-comparison")
def get_models_comparison():
    """
    Returns the comparative evaluation of all four unsupervised clustering models:
    K-Means, DBSCAN, Gaussian Mixture Model (GMM), and Spectral Clustering.
    """
    return ml_service.get_models_comparison()


@router.get("/best-model")
def get_best_model():
    """
    Returns the selected best-performing model (Gaussian Mixture Model),
    hyperparameters, performance metrics, technical justification, and confusion matrix.
    """
    return ml_service.get_best_model_details()


@router.get("/cluster-nodes")
def get_cluster_nodes(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    category: Optional[str] = Query(None, description="Filter by forensic category"),
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID (0-3)")
):
    """
    Returns clustered graph nodes with their cluster assignments across algorithms,
    2D PCA visualization coordinates, and original features.
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
    Inference endpoint: Preprocesses and classifies a new entity record using the
    saved best model (GMM) with posterior probability confidence scoring.
    """
    res = ml_service.predict_entity(request.dict())
    if "error" in res:
        raise HTTPException(status_code=500, detail=res["error"])
    return res
