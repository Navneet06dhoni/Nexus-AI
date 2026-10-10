# ⚖️ Nexus AI — AI Criminal Network Profiler & Detective Workbench

> **SIH26189 — Ministry of Home Affairs, Blockchain & Cybersecurity**  
> *Transforming messy multilingual police FIRs, Call Detail Records (CDRs), and financial ledgers into an actionable, court-admissible criminal relationship network.*

---

## 🌟 Executive Overview

**NyayaGraph-GN** is an AI-powered investigative intelligence system engineered for Indian Law Enforcement. It eliminates the single biggest bottleneck in link-analysis tools: **extracting and normalizing entities from low-quality, multilingual (Hindi/English), and handwritten police documents**.

```
[Raw Scanned FIRs + CDRs + Bank CSVs] 
           │
           ▼
[Closed-World Entity Extractor & Normalizer] (Zero LLM Hallucination)
           │
           ▼
[Multi-Source Bipartite Graph Engine] ──► [In-Case Suspicious Pattern Spotter]
           │                                 • Central Broker (Betweenness)
           │                                 • Burner Phone Burst Activity
           │                                 • Cell Tower Co-Presence
           │                                 • Rapid Mule Fund Layering
           ▼
[Cross-Case Resemblance Engine] ──► "82% Resemblance to FIR 45/2024"
           │                        (Actionable IO-to-IO Guidance)
           ▼
[BSA 2023 Sec 63(4) Blockchain Certificate] ──► Tamper-Proof Court Admissibility
```

---

## 🚀 Key Features

1. **Messy Ingestion & Closed-World Normalization:**
   - Handles Hindi/English mixed FIRs, Indian phone numbers (+91/0), 15-digit IMEIs, state vehicle plates (`UP16-XX-XXXX`, `DL`), UPI IDs, and aliases (`"Mohd. Tariq @ Chotu"`).
   - **Zero-Hallucination Guarantee:** Every entity is verified against verbatim character spans in source documents.

2. **In-Case Detective Pattern Analysis:**
   - **Central Broker Identification:** Computes Betweenness Centrality to highlight the key middleman bridging disparate criminal cells.
   - **Burner Phone Detection:** Identifies burst calling patterns around crime windows with short lifespans.
   - **Cell Tower Co-Presence:** Flags suspect and victim phones pinging the same cell tower within 15 minutes of the crime.
   - **Mule Account Layering:** Visualizes rapid sequential fund dispersal.

3. **Conditional Cross-Case Resemblance & IO Guidance:**
   - Compares active case Modus Operandi (MO) and shared identifiers against historical archives.
   - Surfaces high-probability resemblance scores (e.g. *82% resemblance to FIR 45/2024 handled by Inspector Sharma*).
   - Recommends direct investigator guidance on syndicate hierarchies and interrogation strategies.

4. **BSA 2023 Section 63(4) Legal Admissibility:**
   - Calculates cryptographic SHA-256 hashes of all ingested raw files.
   - Anchors evidence on a local/Web3 blockchain ledger (`EvidenceLedger.sol`).
   - Exports a signed, court-admissible Section 63(4) Electronic Evidence Certificate PDF.

---

## 📁 Repository Structure

```
NyayaGraph/
├── backend/                  # FastAPI Application & Analysis Pipelines
│   ├── app/
│   │   ├── api/              # API Routers (ingest, extract, graph, patterns, cross_case, export)
│   │   ├── core/             # App Config & Logging
│   │   ├── models/           # Pydantic Data Schemas
│   │   └── services/         # Core AI, OCR, Graph & Blockchain Services
│   │       ├── ocr_service.py
│   │       ├── extractor_service.py
│   │       ├── fusion_service.py
│   │       ├── graph_service.py
│   │       ├── pattern_service.py
│   │       ├── cross_case_service.py
│   │       └── blockchain_service.py
│   ├── data/                 # Backend local cache & mock stores
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment template
│   └── main.py               # FastAPI entry point
│
├── frontend/                 # Next.js 14 Detective Workbench (Tailwind, Lucide, Cytoscape)
│   ├── src/
│   │   ├── app/              # Next.js App Router Pages
│   │   ├── components/       # UI Components (Graph Canvas, Timeline, Dossier, Certificate)
│   │   ├── lib/              # API Client & Graph Utilities
│   │   └── types/            # TypeScript Interface Definitions
│   ├── package.json
│   └── tsconfig.json
│
├── data/                     # Realistic Indian Law Enforcement Datasets
│   ├── sample_firs/          # Bilingual Hindi/English FIR test documents
│   ├── sample_cdrs/          # CDR Call Detail Records CSVs
│   ├── sample_bank/          # Bank & UPI Transaction CSVs
│   └── historical_cases/     # Past case archive (FIR 45/2024, etc.)
│
├── contracts/                # Smart Contracts for Evidence Anchoring
│   └── EvidenceLedger.sol    # BSA 2023 Sec 63(4) Immutable Ledger
│
├── docs/                     # Full Technical Documentation & PRDs
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   ├── ROADMAP.md
│   ├── IDEA.md
│   └── TECH_COMPARISON.md
│
└── README.md                 # Project Overview & Setup Guide
```

---

## 🛠️ Environment Setup & Quickstart

### 1. Python Conda Environment Setup (`agentic_Env`)

> **Recommended Python Version:** We use **Python 3.11** (or 3.12) because standard AI, Data Science, and Blockchain packages (`torch`, `pydantic`, `networkx`, `fastapi`, `langchain`, `reportlab`, `web3`) are fully stable with pre-built binary wheels.

Open your **Anaconda Prompt** or **PowerShell** and run:

```bash
# 1. Create the new conda environment
conda create -n agentic_Env python=3.11 -y

# 2. Activate the environment
conda activate agentic_Env

# 3. Navigate to the backend directory and install dependencies
cd e:\NyayaGraph\backend
pip install -r requirements.txt
```

### 2. Launching Backend (FastAPI)

```bash
# In e:\NyayaGraph\backend with agentic_Env active:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`

### 3. Launching Frontend (Next.js)

```bash
# In a new terminal, navigate to frontend:
cd e:\NyayaGraph\frontend
npm install
npm run dev
```
- Detective Workbench UI: `http://localhost:3000`

---

## ⚖️ Legal & Compliance Note
Built in compliance with the **Bharatiya Nyaya Sanhita (BNS) 2023**, **Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023**, and **Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63(4)** for electronic records admissibility in Indian Courts.
