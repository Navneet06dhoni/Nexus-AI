# NyayaGraph-GN: Hackathon Team Documentation Pack
## AI Criminal Network Profiler & Detective Workbench (SIH26189)
**Ministry of Home Affairs — Blockchain & Cybersecurity**

---

## The Core Mandate

### What it actually is
Criminals operate through networks of associates, money, phones and locations, and investigators have the data — FIRs, call records, financial records, surveillance — but it is fragmented and manual analysis misses connections. The ask is a system that extracts entities from these varied sources, builds a relationship graph, identifies key players, and flags suspicious patterns to help investigators see the network.

### What to build
A criminal-network analysis system that ingests structured and unstructured law-enforcement data — FIRs and reports, call detail records, financial transactions, surveillance notes — extracts entities like people, phone numbers, vehicles, locations and organisations via NLP, builds a relationship graph linking them across sources, identifies central and influential individuals through graph centrality, detects suspicious patterns and unusual activity, and presents the network visually with analytical insights so an investigator can explore how suspects connect and who the key nodes are.

### Smallest thing that wins the room
Ingest a set of mock FIRs and call records, extract the people, numbers and locations, build the relationship graph, and highlight the central individual connecting otherwise separate clusters with the suspicious link pattern that reveals them, all explorable on the graph.

---

## Document Index & Reading Guide

| Document | Purpose | Primary Audience |
|---|---|---|
| **[`docs/IDEA.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/IDEA.md)** | **The Exact Product Blueprint**<br>Crystal-clear breakdown of the exact tool we are building, input/output data flow, core algorithms, and live demo experience. | **Entire Team** |
| **[`docs/PRD.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/PRD.md)** | **Product Requirements Document**<br>Details problem statement alignment, user personas (IO & Analyst), functional requirements (FR1-FR6), acceptance criteria, and project scope. | **Entire Team** |
| **[`docs/ARCHITECTURE.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/ARCHITECTURE.md)** | **Technical Prototype Architecture Plan**<br>Complete blueprint of the single-laptop prototype: Baidu Unlimited-OCR, LangChain extraction, Mem0 conditional memory, NetworkX graph analytics, and Web3 blockchain evidence ledger. | **AI, Backend & Full-Stack Leads** |
| **[`docs/ROADMAP.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/ROADMAP.md)** | **36-Hour Hackathon Execution Roadmap**<br>Hour-by-hour sprint schedule, 4-member work distribution matrix, phase-by-phase deliverables, and emergency fallback strategies. | **Team Lead & Project Manager** |
| **[`docs/TECH_COMPARISON.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/TECH_COMPARISON.md)** | **Technology Stack Comparison & Defense**<br>In-depth technical justification (Unlimited-OCR vs. Tesseract, NetworkX vs. Neo4j, Web3 vs. Hyperledger Fabric, Mem0 vs. RAG) with judge defense Q&A. | **Technical Pitcher & AI Lead** |
| **[`docs/PITCH_AND_DEMO_GUIDE.md`](file:///c:/Users/HP/Documents/mindhunter_sih_dcc/docs/PITCH_AND_DEMO_GUIDE.md)** | **3-Minute Pitch & Live Demo Playbook**<br>The winning 5-slide pitch structure, minute-by-minute live demo script, and answers to tough judge questions. | **Presenter & Pitch Team** |

---

## Key Value Propositions in a Nutshell

1. **Solving the Real Bottleneck:** Commercial tools assume clean Excel files. We use **Baidu Unlimited-OCR** to parse dense, messy, multi-page scanned Hindi/English FIRs in one shot with zero hallucinations.
2. **Finding the Hidden Broker:** We fuse unstructured FIR text with structured CDR logs, using **Betweenness Centrality** to reveal the single broker (hawala operator/SIM supplier) connecting separate criminal cells.
3. **Smart Conditional Memory:** We don't pollute the graph with historical archives. We query **Mem0** *only when* an active identifier (phone, IMEI, alias) collides with a past case.
4. **Court Admissible (BSA 2023):** We anchor file hashes onto a **Blockchain Smart Contract**, auto-generating legally compliant Section 63(4) certificates.
5. **Zero Heavy Infrastructure:** Runs 100% reliably on a single laptop (16 GB RAM) without Redis, Docker clusters, or cloud connection requirements.
