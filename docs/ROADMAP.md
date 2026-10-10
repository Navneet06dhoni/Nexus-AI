# Hackathon Execution Roadmap & Team Work Distribution
## Project: NyayaGraph-GN (SIH26189) — AI Criminal Network Profiler
**Target Duration:** 36-Hour Hackathon Sprint  
**Deployment Target:** Single Laptop Prototype (100% Reliable Demo)

---

## 1. Team Roles & Skill Matrix (4-Person Team)

| Role | Team Member | Primary Focus | Key Deliverables |
|---|---|---|---|
| **Member 1: AI & NLP Lead** | Backend / AI | Baidu Unlimited-OCR, LangChain extraction, Pydantic schemas, Indian identifier normalizer | `packages/ocr/`, `packages/extractor/`, prompt tuning |
| **Member 2: Graph & Analytics Lead** | Data & Graph | Multi-source data fusion (FIR + CDR + Bank CSV), NetworkX Louvain & Betweenness Centrality, pattern spotters | `packages/graph/`, `data/mock_dataset/` |
| **Member 3: Full-Stack & UI Lead** | Web / Dashboard | Streamlit / Vite React UI, Cytoscape.js interactive graph canvas, case upload workflow, evidence inspect modals | `apps/web/`, `apps/api/` |
| **Member 4: Blockchain & Legal Lead** | Smart Contract / Legal | Solidity `EvidenceLedger.sol`, Web3.py client, local sovereign ledger fallback, BSA 2023 Sec 63(4) PDF certificate generator | `contracts/`, `packages/blockchain/`, pitch deck |

---

## 2. 36-Hour Sprint Roadmap

```mermaid
gantt
    title 36-Hour Hackathon Development Timeline
    dateFormat HH:mm
    axisFormat %Hh

    section Phase 1: Foundation (Hours 0-6)
    Repo setup & mock datasets       :00:00, 3h
    Unlimited-OCR & LangChain setup  :01:00, 5h
    Smart Contract EvidenceLedger    :02:00, 4h

    section Phase 2: Extraction & Fusion (Hours 6-14)
    Indian normalizer & verifier     :06:00, 4h
    CDR & Bank CSV parser            :08:00, 4h
    NetworkX bipartite graph builder :10:00, 4h

    section Phase 3: Analytics & Memory (Hours 14-22)
    Louvain & Betweenness Centrality :14:00, 4h
    Burner & Tower Co-presence logic :16:00, 4h
    Mem0 conditional past case match :18:00, 4h

    section Phase 4: UI & Blockchain (Hours 22-30)
    Cytoscape.js interactive viewer  :22:00, 5h
    BSA 63(4) Certificate PDF engine :25:00, 4h
    FastAPI backend glue & SSE       :26:00, 4h

    section Phase 5: Demo Polish (Hours 30-36)
    End-to-end rehearsal & dry runs  :30:00, 3h
    Pitch deck & judge Q&A defense   :32:00, 3h
    Offline emergency fallback check :34:00, 2h
```

---

## 3. Detailed Phase Breakdown

### Phase 1: Foundation & Ingestion (Hours 0 – 6)
* **Goal:** Have raw mock documents ready and basic text parsing operational.
* **Tasks:**
  1. Create synthetic mock data:
     - `fir_01_messy_cyber.pdf`: 4-page realistic Hindi/English mixed FIR from Greater Noida.
     - `cdr_call_records.csv`: 300 call records with caller, receiver, tower ID, and duration.
     - `bank_transactions.csv`: Mule account transactions showing ₹15L laundering.
     - `historical_cases.json`: 2 past cases (one linking to broker's phone number).
  2. Implement Baidu Unlimited-OCR script (`packages/ocr/unlimited_ocr.py`).
  3. Compile and deploy `EvidenceLedger.sol` on local Hardhat/Anvil node + test Python local ledger fallback.

### Phase 2: Robust Extraction & Data Fusion (Hours 6 – 14)
* **Goal:** Solve the core bottleneck — extract clean, verified entities from messy text and fuse with CDRs.
* **Tasks:**
  1. Build `IndianIdentifierNormalizer`: regex patterns for Indian phone numbers, IMEIs, state vehicles (`UP16`, `DL`), and aliases (`"alias Chotu"`).
  2. Implement LangChain Pydantic extraction schema (`packages/extractor/pydantic_models.py`).
  3. Implement verbatim span verifier to guarantee zero hallucinations.
  4. Write CSV parsers for CDRs and Bank logs; construct NetworkX graph edges.

### Phase 3: Pattern Spotter & Conditional Memory (Hours 14 – 22)
* **Goal:** Implement the analytical intelligence and the "winning the room" algorithms.
* **Tasks:**
  1. Run Louvain community clustering (`python-louvain`) to isolate call center vs. mule clusters.
  2. Run Betweenness Centrality on NetworkX graph to tag the **Central Broker**.
  3. Implement suspicious pattern spotters:
     - Burner SIM burst detector.
     - Cell tower co-presence detector.
     - Fast mule layering detector.
  4. Implement Mem0 conditional past case recall: query Mem0 *only when* an active identifier matches a previous case.

### Phase 4: Detective UI & Court Certificate (Hours 22 – 30)
* **Goal:** Build the visual wow factor and court-admissibility output.
* **Tasks:**
  1. Build interactive web dashboard (Streamlit or React with Cytoscape.js).
  2. Color-code nodes: 🔴 Scam Callers, 🔵 Bank Mules, 🟢 Victims, 🟡 **Glowing Gold Star for Broker**.
  3. Implement click-to-inspect: clicking an edge reveals the raw FIR excerpt or CDR timestamp.
  4. Implement BSA 2023 Section 63(4) Certificate generator (`fpdf2`) with QR code, SHA-256 manifest, and blockchain transaction stamp.

### Phase 5: Demo Dry-Run & Judge Defense (Hours 30 – 36)
* **Goal:** Rehearse the 3-minute pitch until execution is flawless.
* **Tasks:**
  1. Execute 10 end-to-end dry runs of the demo script.
  2. Verify offline resilience: disconnect Wi-Fi and verify the entire demo executes flawlessly using Ollama and the local blockchain ledger.
  3. Rehearse judge Q&A questions (see `docs/PITCH_AND_DEMO_GUIDE.md`).

---

## 4. Risk Matrix & Emergency Fallbacks

| Failure Mode | Likelihood | Impact | Emergency Fallback Strategy |
|---|---|---|---|
| **OCR takes >20s on CPU** | Medium | High | Pre-compute and cache the OCR output of `fir_01_messy_cyber.pdf` in `data/cache/`. If live inference lags, fall back to cached tokens transparently. |
| **Local EVM Node crashes** | Low | High | The Python client automatically defaults to `LocalSovereignLedger` (zero-downtime Python cryptographic ledger that generates identical valid hashes and receipts). |
| **Wi-Fi cuts off during jury demo** | High | Critical | Entire prototype is configured to run 100% offline using Ollama (`llama3.2:3b` / `qwen2.5:7b`) and local SQLite/ChromaDB. |
| **Judge says "Commercial tools like i2 exist"** | High | High | Deliver the rehearsed counter: *"Commercial tools require pre-structured data; our core breakthrough is automated, robust extraction from messy handwritten Hindi/English police documents with closed-world verification."* |
