# IDEA: NyayaGraph-GN — AI Criminal Network Profiler & Detective Analyzer
## SIH26189 — Ministry of Home Affairs, Blockchain & Cybersecurity

---

## 1. The Official Mandate

### What it actually is
> **Criminals operate through networks of associates, money, phones and locations, and investigators have the data — FIRs, call records, financial records, surveillance — but it is fragmented and manual analysis misses connections. The ask is a system that extracts entities from these varied sources, builds a relationship graph, identifies key players, and flags suspicious patterns to help investigators see the network.**

### What to build
> **A criminal-network analysis system that ingests structured and unstructured law-enforcement data — FIRs and reports, call detail records, financial transactions, surveillance notes — extracts entities like people, phone numbers, vehicles, locations and organisations via NLP, builds a relationship graph linking them across sources, identifies central and influential individuals through graph centrality, detects suspicious patterns and unusual activity, and presents the network visually with analytical insights so an investigator can explore how suspects connect and who the key nodes are.**

### Smallest thing that wins the room
> **Ingest a set of mock FIRs and call records, extract the people, numbers and locations, build the relationship graph, and highlight the central individual connecting otherwise separate clusters with the suspicious link pattern that reveals them, all explorable on the graph.**

---

## 2. The Exact Thing We Are Gonna Build

We are building **NyayaGraph-GN**: an **AI Detective & Criminal Network Analyzer** tailored for Indian police investigators.

It is a single-screen, lightning-fast web application running on a laptop that takes messy, raw investigation files and automatically answers three core questions for the Investigating Officer (IO):
1. **Who is who?** (Extracts every person, alias, burner phone, IMEI, vehicle, and bank account from messy scanned Hindi/English documents without making things up).
2. **Who runs the show?** (Builds an explorable relationship graph fusing FIRs with CDR logs and bank transfers, automatically isolating criminal cells and spotlighting the **central broker** connecting them).
3. **Is it court-admissible?** (Anchors the evidence to a blockchain smart contract and generates a **Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63(4)** certificate).

---

## 3. End-to-End Data & Execution Flow

```
[INPUT FILES]
  ├── 1. Scanned FIR PDF (Messy Devanagari handwriting + typed English + seizure lists)
  ├── 2. Call Detail Records (CDR CSV: Caller, Receiver, Tower ID, IMEI, Duration)
  └── 3. Financial Ledger (Bank/UPI CSV: Payer, Payee, Amount, Timestamp)
         │
         ▼
[STAGE 1: MESSY TEXT EXTRACTION & NORMALIZATION] (Solving the real bottleneck)
  ├── Baidu Unlimited-OCR (R-SWA one-shot long horizon parser for multi-page FIRs)
  ├── LangChain Pydantic Structured Extractor (Accused, Aliases, Phones, Vehicles)
  ├── Indian Normalizer (10-digit phones, +91, 15-digit IMEIs, UP16/DL plates, "alias Chotu")
  └── Verbatim Span Verifier (Zero hallucination: rejects entities not in source text)
         │
         ▼
[STAGE 2: MULTI-SOURCE GRAPH FUSION]
  ├── Fuses unstructured FIR entities with structured CDR calls & bank transactions
  └── In-memory NetworkX bipartite graph construction (< 50ms)
         │
         ▼
[STAGE 3: DETECTIVE PATTERN SPOTTERS & CENTRALITY]
  ├── Louvain Modularity: Separates syndicate cells (Call Center Gang vs. Mule Ring)
  ├── Betweenness Centrality: Identifies the Structural Hole Spanner (The Central Broker)
  ├── Burner SIM Detector: Short lifetime (<72h) + sudden call burst during crime window
  ├── Cell Tower Co-Presence: Suspect phone & victim phone pinging same tower at scene
  └── Rapid Mule Layering: ₹10L received and dispersed across 4 accounts in 30 mins
         │
         ▼
[STAGE 4: CONDITIONAL CROSS-CASE RECALL (Mem0)]
  ├── Triggers ONLY IF an active identifier (phone, IMEI, alias) collides with past records
  └── Injects ghost bridge node: "Prior Offender: FIR 45/2024 PS Surajpur (Bail Active)"
         │
         ▼
[STAGE 5: COURT ADMISSIBILITY & EXPORT (BSA 2023)]
  ├── Document SHA-256 hash anchored on EvidenceLedger.sol (Web3.py / Local Ledger)
  └── 1-Click download of signed BSA 2023 Section 63(4) Certificate PDF with QR & Tx Hash
```

---

## 4. The Live Demo Walkthrough (The "Win the Room" Moment)

During the hackathon evaluation, we demonstrate this exact sequence:

1. **The Upload:**
   - The user drags and drops a messy 4-page scanned Hindi-English FIR and a 300-row CDR CSV into NyayaGraph.
   - Clicks **"Analyze Case"**.

2. **The Extraction Breakthrough (Solving the Bottleneck):**
   - In seconds, the system displays the extracted entities:
     - Suspect: `Mohammad Tariq` (Aliases: `Chotu`, `Bhai`)
     - Burner Numbers: `+91-9876543210`, `+91-9123456780`
     - IMEI: `867492019482710`
     - Vehicle: `UP 16 AB 1234`
     - Bank Account: `HDFC A/C 0012345678`
   - Every single entity has a clickable badge highlighting the exact line in the raw scanned PDF.

3. **The Graph & The Central Broker:**
   - The screen renders an interactive, physics-based network graph:
     - 🔴 **Red Cluster (Left):** Knowledge Park fake-courier call center agents.
     - 🔵 **Blue Cluster (Right):** Surat bank account money mules.
   - The system automatically triggers the **Centrality Detector**:
     - A **Glowing Gold Badge** appears over **Mohammad Tariq @ Chotu**.
     - System displays analytical insight: *"Central Broker Detected: Tariq has only 3 direct calls, but a Betweenness Centrality score of 0.89. He is the hawala operator bridging the call center and the cash-out mules."*

4. **Click-to-Evidence Inspection:**
   - The judge asks: *"How do you prove Tariq is connected to the call center?"*
   - The presenter clicks the edge between Tariq and the call center leader:
     - A modal pops up displaying the raw evidence: *"CDR Call Log: 14 calls between 11:30 PM and 1:15 AM on the night of the extortion, pinging Tower ID KP2-T04."*

5. **Conditional Past-Case Alert:**
   - A discreet notification badge alerts: *"Prior Offender Match: Tariq's phone (9876543210) was seized in FIR 45/2024 PS Surajpur."*
   - It links the current scam directly to an ongoing interstate syndicate investigation.

6. **Court-Admissible Export:**
   - Click **"Generate BSA 63(4) Evidence Package"**.
   - A PDF downloads instantly, carrying:
     - Government of Uttar Pradesh / Gautam Buddha Nagar Police header.
     - Investigating Officer credentials and timestamp.
     - Blockchain transaction hash verifying file non-tampering under Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023.

---

## 5. Why This Wins the Room

| Judge Concern | Our Winning Proof |
|---|---|
| *"Commercial tools like i2 already exist."* | Commercial tools require manual data entry; we parse messy, handwritten Hindi/English FIRs automatically using Baidu Unlimited-OCR with zero hallucinations. |
| *"You only show what you synthetic built in."* | We fuse unstructured text with raw structured CDR tower dumps and bank CSVs to mathematically reveal hidden brokers using Betweenness Centrality. |
| *"Can it run without internet or massive servers?"* | Runs 100% on a single laptop in pure Python (NetworkX, SQLite, ChromaDB, Web3/local ledger). |
| *"Will the evidence hold up in court?"* | Backed by BSA 2023 Section 63(4) blockchain-anchored certificates. |
