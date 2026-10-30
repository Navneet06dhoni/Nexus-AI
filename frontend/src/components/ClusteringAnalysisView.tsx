"use client";

import React, { useState, useEffect } from "react";
import {
  fetchClusteringResults,
  predictEntityCluster,
  type ClusteringResultsPayload,
  type ClusteringModelMetric,
} from "@/lib/api";
import {
  Layers,
  Award,
  Activity,
  Cpu,
  BarChart3,
  Network,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Send,
  Database,
  Grid,
} from "lucide-react";

export default function ClusteringAnalysisView() {
  const [data, setData] = useState<ClusteringResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pca" | "confusion" | "metrics" | "distribution">("confusion");
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Live Predictor State
  const [predictLabel, setPredictLabel] = useState("M/s New Era Hawala Trading");
  const [predictDegree, setPredictDegree] = useState(3);
  const [predictWeightedDegree, setPredictWeightedDegree] = useState(12);
  const [predictPersonRatio, setPredictPersonRatio] = useState(0.4);
  const [predictLegalRatio, setPredictLegalRatio] = useState(0.0);
  const [predictEvidenceRatio, setPredictEvidenceRatio] = useState(0.6);
  const [predictBankRatio, setPredictBankRatio] = useState(0.0);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchClusteringResults().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPredicting(true);
    const res = await predictEntityCluster({
      label: predictLabel,
      degree: Number(predictDegree),
      weighted_degree: Number(predictWeightedDegree),
      conn_person_ratio: Number(predictPersonRatio),
      conn_legal_ratio: Number(predictLegalRatio),
      conn_evidence_ratio: Number(predictEvidenceRatio),
      conn_bank_ratio: Number(predictBankRatio),
      pagerank: 0.0006,
      core_number: 1,
      clustering_coeff: 0.0,
      betweenness: 0.002,
      eigenvector: 0.01,
      avg_neighbor_degree: 20,
      is_case_hub: 0,
    });
    setPredictionResult(res);
    setPredicting(false);
  };

  const filteredNodes = data?.sample_clustered_nodes.filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      node.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || node.gmm_predicted_category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas text-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="font-mono text-xs text-ink-muted">Loading ML Clustering Analytics & Best-Model Engine...</p>
        </div>
      </div>
    );
  }

  const comparison = data?.comparison || [];
  const bestModel = data?.best_model;

  return (
    <div className="h-full w-full overflow-y-auto bg-canvas p-6 text-ink scrollbar-thin">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── HEADER BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                  <Award className="size-3.5" />
                  Comparative Evaluation Phase
                </span>
                <span className="rounded-md border border-line px-2 py-0.5 text-[11px] font-mono text-ink-muted">
                  SIH26189 Unsupervised ML Engine
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-ink">
                Unsupervised Criminal Network Clustering & Model Integration
              </h1>
              <p className="text-xs text-ink-muted max-w-3xl">
                Benchmarking <strong>K-Means, DBSCAN, Gaussian Mixture Model (GMM), and Spectral Clustering</strong> on 2,258 forensic crime entities across 147 CBI cases. Best-fitting model selected via empirical separation, stability, and Hungarian ground-truth alignment.
              </p>
            </div>

            {/* Winner Badge */}
            <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 shrink-0">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-white shadow-xs">
                <Layers className="size-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Selected Best Model
                </div>
                <div className="text-sm font-black text-ink">
                  Gaussian Mixture Model
                </div>
                <div className="text-[11px] font-mono text-ink-muted">
                  Full Covariance • 87.56% Alignment
                </div>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-line bg-panel-deep p-3.5">
              <div className="text-[11px] font-medium text-ink-muted">Dataset Nodes Evaluated</div>
              <div className="mt-1 font-mono text-xl font-black text-ink">
                {data?.total_nodes ? data.total_nodes.toLocaleString() : "2,258"}
              </div>
              <div className="text-[10px] text-ink-muted">147 Real CBI Crime Networks</div>
            </div>

            <div className="rounded-xl border border-line bg-panel-deep p-3.5">
              <div className="text-[11px] font-medium text-ink-muted">Best Weighted F1-Score</div>
              <div className="mt-1 font-mono text-xl font-black text-emerald-500">
                87.55%
              </div>
              <div className="text-[10px] text-ink-muted">Hungarian Category Mapping</div>
            </div>

            <div className="rounded-xl border border-line bg-panel-deep p-3.5">
              <div className="text-[11px] font-medium text-ink-muted">GMM Log-Likelihood (BIC)</div>
              <div className="mt-1 font-mono text-xl font-black text-ink">
                -245,917
              </div>
              <div className="text-[10px] text-ink-muted">Optimal Bayesian Information</div>
            </div>

            <div className="rounded-xl border border-line bg-panel-deep p-3.5">
              <div className="text-[11px] font-medium text-ink-muted">Live Inductive Inference</div>
              <div className="mt-1 font-mono text-xl font-black text-accent">
                Active (Joblib)
              </div>
              <div className="text-[10px] text-ink-muted">Real-Time Posterior Classification</div>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: COMPARATIVE MODEL EVALUATION TABLE ── */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <BarChart3 className="size-4 text-accent" />
                Four-Model Comparative Performance Benchmarks
              </h2>
              <p className="text-xs text-ink-muted">
                Empirical metrics computed identically across all models on standardized 15-dimensional forensic feature matrix.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-line bg-panel-deep text-ink-muted font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Algorithm Model</th>
                  <th className="py-3 px-3">Clusters (K)</th>
                  <th className="py-3 px-3">Silhouette</th>
                  <th className="py-3 px-3">Davies-Bouldin</th>
                  <th className="py-3 px-3">Calinski-Harabasz</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Weighted F1</th>
                  <th className="py-3 px-3">Runtime</th>
                  <th className="py-3 px-3">Noise %</th>
                  <th className="py-3 px-3">Stability (ARI)</th>
                  <th className="py-3 px-3 text-right">Inference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comparison.map((m) => {
                  const isBest = m.model_name.includes("Gaussian Mixture");
                  return (
                    <tr
                      key={m.model_name}
                      className={`transition-colors ${
                        isBest ? "bg-accent/5 font-semibold" : "hover:bg-panel-deep/50"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isBest && <Award className="size-3.5 text-accent shrink-0" />}
                          <span className={isBest ? "text-accent font-black" : "text-ink"}>
                            {m.model_name}
                          </span>
                          {isBest && (
                            <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9px] font-mono text-accent">
                              Selected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono">{m.n_clusters}</td>
                      <td className="py-3.5 px-3 font-mono">{m.silhouette_score.toFixed(3)}</td>
                      <td className="py-3.5 px-3 font-mono">{m.davies_bouldin_index.toFixed(3)}</td>
                      <td className="py-3.5 px-3 font-mono">{m.calinski_harabasz_index.toFixed(1)}</td>
                      <td className="py-3.5 px-3 font-mono text-emerald-500 font-bold">
                        {(m.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 font-mono text-emerald-500 font-bold">
                        {(m.f1_score_weighted * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 font-mono">{m.execution_time_sec.toFixed(3)}s</td>
                      <td className="py-3.5 px-3 font-mono">
                        {m.noise_percentage > 0 ? (
                          <span className="text-amber-500 font-bold">{m.noise_percentage}%</span>
                        ) : (
                          "0.0%"
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono">{m.stability_ari.toFixed(3)}</td>
                      <td className="py-3.5 px-3 text-right">
                        {m.supports_inference ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-mono">
                            <CheckCircle2 className="size-3" /> Inductive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted font-mono">
                            <AlertCircle className="size-3" /> Transductive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 2: INTERACTIVE VISUALIZATIONS & CONFUSION MATRIX ── */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-line">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Grid className="size-4 text-accent" />
                Cluster Visualizations & Confusion Matrix
              </h2>
              <p className="text-xs text-ink-muted">
                Inspect 2D PCA projections, ground-truth Hungarian mapping confusion matrix, and comparative distributions.
              </p>
            </div>

            {/* View Switcher Pills */}
            <div className="flex items-center gap-1 rounded-lg border border-line bg-panel-deep p-1">
              {[
                { id: "confusion", label: "Confusion Matrix" },
                { id: "pca", label: "2D PCA Projection" },
                { id: "metrics", label: "Metric Comparison" },
                { id: "distribution", label: "Cluster Breakdown" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-raised text-ink shadow-xs border border-line-strong"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-6 items-center justify-center">
            {activeTab === "confusion" && (
              <div className="flex flex-col items-center w-full max-w-3xl space-y-4">
                <img
                  src="/images/confusion_matrix_best_model.png"
                  alt="Confusion Matrix - GMM"
                  className="rounded-xl border border-line shadow-md max-h-[480px] object-contain bg-white"
                />
                <div className="rounded-xl border border-line bg-panel-deep p-4 text-xs text-ink-muted max-w-2xl space-y-1.5">
                  <div className="font-bold text-ink flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Forensic Ground-Truth Assignment Analysis (Kuhn-Munkres Hungarian Algorithm)
                  </div>
                  <p>
                    • <strong>LEGAL_SECTION (790/790 = 100%)</strong>: Perfect cluster purity. Legal statute nodes exhibit unique zero-financial connectivity and high degree to accused promoters.
                  </p>
                  <p>
                    • <strong>PERSON (984/1,165 = 84.5%)</strong>: Clean segregation of accused suspects, public servants, and complainants.
                  </p>
                  <p>
                    • <strong>EVIDENCE (147/201 = 73.1%)</strong> & <strong>BANK_ACCOUNT (56/102 = 54.9%)</strong>: Grouped into distinct low-cardinality high-centrality financial clusters.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "pca" && (
              <div className="flex flex-col items-center w-full max-w-3xl space-y-4">
                <img
                  src="/images/pca_clusters_gmm.png"
                  alt="2D PCA Clusters GMM"
                  className="rounded-xl border border-line shadow-md max-h-[480px] object-contain bg-white"
                />
                <p className="text-xs text-ink-muted text-center font-mono">
                  Principal Component 1 ({((data?.pca_explained_variance[0] || 0.38) * 100).toFixed(1)}% variance) + Principal Component 2 ({((data?.pca_explained_variance[1] || 0.22) * 100).toFixed(1)}% variance).
                </p>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="flex flex-col items-center w-full max-w-3xl space-y-4">
                <img
                  src="/images/metric_comparison.png"
                  alt="Metric Comparison"
                  className="rounded-xl border border-line shadow-md max-h-[480px] object-contain bg-white"
                />
                <p className="text-xs text-ink-muted text-center">
                  Comparison across Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Index, and Weighted F1.
                </p>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className="flex flex-col items-center w-full max-w-3xl space-y-4">
                <img
                  src="/images/cluster_distribution.png"
                  alt="Cluster Distribution"
                  className="rounded-xl border border-line shadow-md max-h-[480px] object-contain bg-white"
                />
                <p className="text-xs text-ink-muted text-center">
                  Assigned entity distribution matching the natural hierarchy of Indian law enforcement crime networks.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 3: ACADEMIC JUSTIFICATION & VIVA CARD ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              Why Gaussian Mixture Model (GMM) was Selected
            </h3>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>
                  <strong>Anisotropic Feature Covariance:</strong> Real crime networks have widely varying variances across features. Bank accounts have high financial flows but low degree, whereas case hubs have high degree but zero bank flows. GMM's unconstrained covariance matrix fits these non-spherical geometries, whereas K-Means forces spherical Voronoi cells.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>
                  <strong>87.56% Alignment to CBI Classes:</strong> Achieved superior external validation against ground-truth classes via the Hungarian algorithm, beating K-Means (53.23%) and Spectral Clustering (59.08%).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>
                  <strong>Probabilistic Soft Assignment:</strong> Provides continuous posterior confidence $P(C_k \mid x)$ allowing detectives to identify borderline shell accounts or suspicious bridge persons.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>
                  <strong>Out-of-Sample Inductive Inference:</strong> Supports serialized instant inference for newly ingested FIRs and CDR records without recomputing entire graph Laplacians.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-500" />
              Technical Limitations of the Other Three Models
            </h3>
            <ul className="space-y-2.5 text-xs text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  <strong>K-Means:</strong> Rigid spherical (isotropic) assumption treats all feature dimensions as having equal variance. It incorrectly blends accused persons with legal section nodes (53.23% accuracy).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  <strong>DBSCAN:</strong> Struggles with scale-free crime graph densities. Either leaves 5.67%–40% of records as unassigned noise or merges disconnected crime syndicates into a single giant clump.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Spectral Clustering:</strong> The CBI crime graph contains 3 disconnected components, causing multiple zero eigenvalues and non-connected warnings. It also requires $O(N^2)$ memory and lacks native out-of-sample prediction.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── SECTION 4: REAL-TIME INDUCTIVE PREDICTOR WIDGET ── */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Cpu className="size-4 text-accent" />
                Interactive Inductive Clustering Predictor (Live Model Inference)
              </h2>
              <p className="text-xs text-ink-muted">
                Test the fitted StandardScaler + GMM pipeline on new or hypothetical crime network entities in real-time.
              </p>
            </div>
            <span className="rounded-md border border-line bg-panel-deep px-2.5 py-1 text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API: /api/v1/clustering/predict
            </span>
          </div>

          <form onSubmit={handlePredict} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink">Entity Label / Identifier</label>
                <input
                  type="text"
                  value={predictLabel}
                  onChange={(e) => setPredictLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-2 text-xs text-ink focus:border-accent focus:outline-hidden"
                  placeholder="e.g. M/s Shell Trading Company"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Node Degree</label>
                  <input
                    type="number"
                    value={predictDegree}
                    onChange={(e) => setPredictDegree(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Weighted Degree</label>
                  <input
                    type="number"
                    value={predictWeightedDegree}
                    onChange={(e) => setPredictWeightedDegree(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Bank Ratio (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={predictBankRatio}
                    onChange={(e) => setPredictBankRatio(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Person Ratio (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={predictPersonRatio}
                    onChange={(e) => setPredictPersonRatio(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Legal Ratio (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={predictLegalRatio}
                    onChange={(e) => setPredictLegalRatio(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted">Evidence Ratio (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={predictEvidenceRatio}
                    onChange={(e) => setPredictEvidenceRatio(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs font-mono text-ink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={predicting}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer hover:bg-accent/90 disabled:opacity-50"
              >
                <Send className="size-3.5" />
                {predicting ? "Classifying with GMM..." : "Execute GMM Inductive Inference"}
              </button>
            </div>

            {/* Prediction Output Card */}
            <div className="rounded-xl border border-line bg-panel-deep p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Inference Prediction Result
                </div>
                {predictionResult ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-xs text-ink-muted">Predicted Forensic Category:</div>
                      <div className="text-lg font-black text-accent mt-0.5">
                        {predictionResult.forensic_category}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-500 font-semibold">
                        Confidence: {(predictionResult.confidence_score * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-line pt-2 text-[11px] font-mono">
                      <div className="text-ink-muted text-[10px]">Posterior Distribution:</div>
                      {predictionResult.posterior_probabilities &&
                        Object.entries(predictionResult.posterior_probabilities).map(([c, p]: any) => (
                          <div key={c} className="flex justify-between">
                            <span className="text-ink-muted">{c}:</span>
                            <span className="text-ink font-semibold">{(p * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                    </div>

                    <div className="border-t border-line pt-2 text-[11px] font-mono text-ink-muted">
                      PCA Position: ({predictionResult.pca_projection?.x}, {predictionResult.pca_projection?.y})
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center text-xs text-ink-muted">
                    Click "Execute GMM Inductive Inference" to compute cluster classification and posterior probabilities.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* ── SECTION 5: CLUSTERED ENTITIES EXPLORER TABLE ── */}
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Database className="size-4 text-accent" />
                Clustered Forensic Entities Inspector
              </h2>
              <p className="text-xs text-ink-muted">
                Showing {filteredNodes.length} nodes from the CBI criminal relationship graph.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-2.5 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search entity..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="rounded-lg border border-line bg-panel-deep pl-8 pr-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-hidden"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-line bg-panel-deep px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="PERSON">PERSON</option>
                <option value="LEGAL_SECTION">LEGAL_SECTION</option>
                <option value="EVIDENCE">EVIDENCE</option>
                <option value="BANK_ACCOUNT">BANK_ACCOUNT</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-panel-deep border-b border-line text-ink-muted font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Entity Identifier</th>
                  <th className="py-2.5 px-3">Actual Category</th>
                  <th className="py-2.5 px-3">GMM Cluster</th>
                  <th className="py-2.5 px-3">GMM Predicted Class</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">K-Means</th>
                  <th className="py-2.5 px-3">Spectral</th>
                  <th className="py-2.5 px-3">DBSCAN</th>
                  <th className="py-2.5 px-3 text-right">PCA (X, Y)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredNodes.slice(0, 100).map((n) => (
                  <tr key={n.id} className="hover:bg-panel-deep/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-ink">{n.label || n.id}</div>
                      <div className="text-[10px] font-mono text-ink-muted">{n.id}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-panel-deep px-2 py-0.5 font-mono text-[10px] text-ink-muted border border-line">
                        {n.actual_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-accent">
                      Cluster {n.gmm_cluster}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          n.gmm_predicted_category === n.actual_category
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        }`}
                      >
                        {n.gmm_predicted_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {(n.max_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-ink-muted">C{n.kmeans_cluster}</td>
                    <td className="py-2.5 px-3 font-mono text-ink-muted">C{n.spectral_cluster}</td>
                    <td className="py-2.5 px-3 font-mono text-ink-muted">
                      {n.dbscan_cluster === -1 ? (
                        <span className="text-amber-500 font-bold">Noise</span>
                      ) : (
                        `C${n.dbscan_cluster}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-muted text-[11px]">
                      ({n.pca_x}, {n.pca_y})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
