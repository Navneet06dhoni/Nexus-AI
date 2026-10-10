# Product Requirements Document (PRD)
## Project: NyayaGraph-GN — AI Criminal Network Profiler & Detective Workbench
**Problem Statement ID:** SIH26189 — Ministry of Home Affairs, Blockchain & Cybersecurity  
**Document Version:** 1.0 (Hackathon Edition)  
**Authors:** Mindhunter SIH Team  
**Target Milestone:** Working Prototype / Proof of Concept on a Single Laptop

---

## 1. Executive Summary & Vision

**NyayaGraph-GN** is an AI-powered detective intelligence system engineered to transform raw, fragmented law enforcement data (messy scanned FIRs, Call Detail Records, and financial transactions) into an actionable, court-admissible criminal relationship network.

Unlike generic link-analysis tools that demand structured inputs, NyayaGraph-GN attacks the **actual real-world bottleneck: robust entity extraction from messy, handwritten, and code-switched (Hindi-English) police documents**. It automatically uncovers operational cells, flags burner phones and co-location patterns, spotlights the **central criminal broker** bridging disparate syndicates, conditionally links relevant past offenses, and cryptographically secures the evidentiary chain under **Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63(4)**.

---

## 2. Target Personas & User Scenarios

### Persona 1: Sub-Inspector Rajesh (Investigating Officer - IO)
* **Context:** Stationed at Cyber Crime Police Station, Gautam Buddha Nagar.
* **Pain Point:** Receives an FIR with 5 accused, 8 phone numbers, 3 vehicle numbers, and 2 bank accounts. Spends 48 hours manually cross-referencing CDR spreadsheets and case diaries.
* **Desired Outcome:** Upload the FIR PDF and CDR CSV, get an instant interactive suspect network, and immediately see who the mastermind and call center agents are.

### Persona 2: Analyst Priya (Cyber Crime Cell Intelligence Specialist)
* **Context:** Analyzing interstate cyber fraud syndicates operating out of Knowledge Park & Noida Sector 62.
* **Pain Point:** Fraud calls originate from Call Center A, but stolen money moves into Mule Accounts managed by Group B. She cannot pinpoint the hawala operator or SIM supplier who links them.
* **Desired Outcome:** Automated graph centrality analysis that instantly highlights the single "Broker" node connecting the two clusters, backed by verifiable CDR call logs.

---

## 3. Product Scope: Hackathon Prototype vs. Enterprise

```
[In-Scope for Hackathon Prototype]
├── Messy Scanned FIR Parsing (Baidu Unlimited-OCR with Hindi/English R-SWA)
├── Indian Identifier Normalization (Phones, IMEIs, State Vehicles, Aliases)
├── Closed-World Verbatim Span Matching (Zero LLM Hallucination)
├── Multi-Source Fusion (FIR Text + CDR CSV + Bank Transfers CSV)
├── In-Case Pattern Detection (Burner burst, tower co-presence, mule hops)
├── Graph Link Analysis (Louvain Communities + Betweenness Centrality Broker)
├── Conditional Cross-Case Linking (Mem0 trigger on shared identifiers)
└── BSA 2023 Sec 63(4) Blockchain Evidence Certificate (Smart Contract / Local Ledger)

[Explicitly Out of Scope for Hackathon]
├── Multi-tenant enterprise police department SSO / CCTNS live API integration
├── Distributed Hyperledger Fabric consortium (substituted by Web3.py / Local Ledger)
├── Heavy GPU-cluster orchestration (SGLang, Triton, Kubernetes)
└── Live telecom tower triangulation hardware
```

---

## 4. Key Functional Requirements (FR)

### FR 1: Messy Document Ingestion & Unlimited-OCR
* **FR 1.1:** The system shall accept scanned multi-page PDFs or image files of FIRs and case diaries.
* **FR 1.2:** The system shall use **Baidu Unlimited-OCR** to transcribe both printed Devanagari (Hindi) and English text in one pass without token length memory crashes.
* **FR 1.3:** The system shall retain paragraph sequence and table coordinate bounding boxes.

### FR 2: Robust Indian Law Enforcement Entity Normalization
* **FR 2.1:** Extract structured entities into Pydantic models:
  * Suspects/Accused (Full name, aliases e.g., *"Mohammad Tariq @ Chotu"*, father's name, age).
  * Telecom Identifiers (10-digit mobile numbers, +91 normalization, 15-digit IMEIs).
  * Vehicles (State registration codes, e.g., `UP14`, `UP16`, `DL`, `HR`).
  * Financial Accounts (Bank names, Account numbers, IFSC, UPI IDs).
  * Offenses (BNS 2023 sections e.g., `318(4)` and IPC equivalents e.g., `420`).
* **FR 2.2:** **Closed-World Verifier:** Every extracted entity must be verified against verbatim character spans in the OCR text. Entities failing verification must be routed to `needs_review`.

### FR 3: Multi-Source Operational Data Fusion
* **FR 3.1:** Ingest structured CDR logs (CSV: Caller, Receiver, Call Duration, Cell Tower ID, Timestamp).
* **FR 3.2:** Ingest structured bank/UPI logs (CSV: Sender, Receiver, Amount, Timestamp).
* **FR 3.3:** Fuse unstructured FIR entities with structured logs into a unified bipartite relationship graph.

### FR 4: Active Case Pattern Spotting & Graph Analytics
* **FR 4.1 (Louvain Modularity):** Automatically segment the graph into operational clusters (e.g., Call Center Scam Gang vs. Bank Account Mule Ring).
* **FR 4.2 (Betweenness Centrality):** Compute centrality scores and visually flag the **Structural Hole Spanner (The Broker)** connecting isolated clusters with a glowing badge.
* **FR 4.3 (Burner Phone Detector):** Flag numbers with high call bursts around the crime window and low lifetime duration.
* **FR 4.4 (Cell Tower Co-Presence):** Identify whenever suspect and victim phones pinged the same cell tower within 15 minutes of the crime.

### FR 5: Conditional Cross-Case Intelligence (Mem0)
* **FR 5.1:** Do NOT dump all historical cases onto the active graph.
* **FR 5.2:** When an identifier (phone, IMEI, vehicle, or alias) in the current FIR collides with an archived case, trigger a **"Prior Offender Alert"**.
* **FR 5.3:** Project only the relevant bridge node onto the graph with historical case references.

### FR 6: Blockchain Admissibility & BSA 2023 Section 63(4) Export
* **FR 6.1:** Anchor SHA-256 hashes of all ingested files on `EvidenceLedger.sol` via Web3.py (with embedded local ledger fallback).
* **FR 6.2:** Generate a court-ready PDF Certificate carrying the officer's credentials, timestamp, blockchain transaction receipt hash, and file integrity manifest.

---

## 5. Non-Functional Requirements (NFR)

* **NFR 1 (Portability):** Must run entirely on a single developer laptop (16 GB RAM, Windows 10/11 or Ubuntu, CPU or lightweight GPU).
* **NFR 2 (Zero Heavy Infrastructure):** No Redis, no external message queues, no multi-container Docker cluster required for the demo.
* **NFR 3 (Latency):** Total pipeline runtime from PDF upload to interactive graph rendering must be under **15 seconds** during the jury presentation.
* **NFR 4 (Air-Gap Capable):** The prototype must have an offline toggle (Ollama + local blockchain) allowing it to run without internet access on a police intranet.

---

## 6. Acceptance Criteria (SIH Jury Evaluation Checklist)

| Test ID | Scenario | Expected Behavior |
|---|---|---|
| **AC-01** | Upload 5-page scanned Hindi/English FIR | Baidu Unlimited-OCR transcribes all pages; entities extracted without crash. |
| **AC-02** | Messy alias extraction | "Mohd. Tariq @ Chotu" extracted with alias correctly linked to canonical profile. |
| **AC-03** | Multi-source CDR correlation | Suspect phone in FIR links to 4 other numbers via CDR call frequency edge weights. |
| **AC-04** | Central Broker identification | System spotlights the broker node with highest betweenness score ($>0.8$). |
| **AC-05** | Conditional past case trigger | Prior case appears *only* because the broker's phone was found in FIR 45/2024. |
| **AC-06** | BSA Section 63(4) export | PDF certificate downloads with verified SHA-256 hash and blockchain transaction ID. |
