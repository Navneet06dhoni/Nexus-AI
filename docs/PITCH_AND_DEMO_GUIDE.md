# 3-Minute Hackathon Pitch & Live Demo Guide
## Project: NyayaGraph-GN (SIH26189) — AI Criminal Network Profiler
**Theme:** Ministry of Home Affairs, Blockchain & Cybersecurity  
**Presentation Time:** 3 Minutes + 2 Minutes Q&A

---

## 1. The 5-Slide Presentation Deck Outline

| Slide | Title | Visual Content | Key Speaking Point |
|---|---|---|---|
| **Slide 1** | **The Crisis: Fragmented & Messy Police Data** | Photo of a messy handwritten FIR beside an 8,000-row CDR Excel sheet | *"Police have all the data, but it is trapped in messy handwritten scans and disconnected spreadsheets. Investigating officers spend days manually cross-referencing files while syndicates vanish."* |
| **Slide 2** | **The Real Bottleneck: Messy Text to Verified Network** | Diagram showing Baidu Unlimited-OCR parsing mixed Hindi-English text into grounded Pydantic entities | *"Commercial tools assume clean data. We built the first system that turns messy, handwritten Hindi-English FIRs and CDRs into a grounded, hallucination-free knowledge graph in seconds."* |
| **Slide 3** | **Active Case Intelligence: Uncovering the Broker** | Visual graph: Call center gang (Red) $\leftrightarrow$ Mule ring (Blue) bridged by a **Glowing Gold Star** | *"Using Louvain community detection and Betweenness Centrality, we spotlight the single hawala broker connecting the scam call center with cash-out mules."* |
| **Slide 4** | **Conditional Memory & BSA 2023 Compliance** | Notification badge showing prior offender match + Blockchain Section 63(4) Certificate | *"We don't flood the investigator with past noise. But when an identifier matches, we bridge past offenses. And under BSA 2023 Section 63, every piece of evidence is anchored on a blockchain smart contract."* |
| **Slide 5** | **Architecture & Impact** | Single-laptop architecture diagram running 100% offline | *"Zero heavy infrastructure. Runs on a standard laptop or police intranet. Ready for field deployment today."* |

---

## 2. Minute-by-Minute Live Demo Script

### Minute 0:00 – 0:45: The Ingestion & Messy Text Breakthrough
* **Screen:** Open the NyayaGraph Dashboard. Drag & drop `fir_01_messy_cyber.pdf` (messy scanned Hindi/English FIR) and `cdr_call_records.csv`. Click **"Analyze Case"**.
* **Speaker:**
  > *"Judges, let's look at real police reality. This is a 4-page scanned FIR from Greater Noida. Notice the messy Devanagari handwriting, mixed English technical terms, and multiple accused names with aliases like 'Chotu'.*
  >
  > *Watch our Baidu Unlimited-OCR engine parse all 4 pages in a single forward pass without token truncation. Our normalizer automatically standardizes the phone numbers, IMEIs, and vehicle plates, while our closed-world verifier guarantees zero hallucinations by matching every span back to the source text."*

### Minute 0:45 – 1:45: Multi-Source Fusion & Spotlighting the Central Broker
* **Screen:** The screen transitions to the **Interactive Network Canvas**. Nodes and edges populate dynamically. Click the **"Run Syndicate Analytics"** button.
* **Speaker:**
  > *"Within 5 seconds, NyayaGraph has fused the unstructured FIR with 300 rows of Call Detail Records.
  >
  > Louvain community detection segments the network into operational cells: The red cluster on the left is the fake-courier call center team in Knowledge Park. The blue cluster on the right is the bank account mule ring in Surat.
  >
  > But who connects them? Notice this **glowing gold node: Mohammad Tariq @ Chotu**. He has very few direct calls, but his **Betweenness Centrality is 0.89** — the highest in the network. He is the Structural Hole Spanner: the hawala money mover who cash-outs the extortion funds. Without our graph engine, an officer looking only at call volume would have missed him entirely!"*

### Minute 1:45 – 2:20: Conditional Past-Case Memory Trigger
* **Screen:** Click on the gold node. A sidebar panel slides out showing his suspect dossier. A gold badge flashes: **"Prior Offender Collision: FIR 45/2024 PS Surajpur"**.
* **Speaker:**
  > *"Here is our core detective intelligence: We don't overwhelm the investigator with past archives. But because Tariq's phone number previously appeared in a 2024 cyber extortion case, our Mem0 memory layer triggers a conditional link.
  >
  > It immediately surfaces that Tariq is an active interstate offender out on bail, operating under Kingpin Vikram. The active case is instantly connected to a wider interstate syndicate."*

### Minute 2:20 – 3:00: Legal Admissibility & The BSA 2023 Certificate
* **Screen:** Click **"Generate Court Evidence Package"**. A signed PDF opens on screen displaying the **Section 63(4) Certificate** with QR code and blockchain transaction hash.
* **Speaker:**
  > *"Finally, the best analytical insight is useless if the trial court dismisses it. Under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023, digital evidence requires tamper-proof integrity and officer certification.
  >
  > The moment this FIR was uploaded, its cryptographic SHA-256 hash was permanently anchored to our blockchain smart contract. Here is the auto-generated Section 63(4) Certificate, complete with officer credentials, blockchain transaction ID, and source hash manifest, ready to be submitted with the chargesheet.
  >
  > NyayaGraph takes raw police chaos and turns it into court-admissible convictions. Thank you!"*

---

## 3. High-Probability Judge Questions & Winning Answers

| Question | What the Judge is Thinking | Winning Response |
|---|---|---|
| **"Why not use an existing commercial tool like Palantir or IBM i2?"** | *Are you just reinventing the wheel?* | *"Commercial tools are graph visualizers that require structured Excel inputs. In Indian policing, 80% of data is locked inside messy, handwritten Hindi FIRs. Our innovation is automated, grounded extraction from messy text, followed by automated betweenness broker detection and BSA 2023 legal compliance."* |
| **"What if the police station has no internet connection?"** | *Can this actually work in rural or air-gapped stations?* | *"NyayaGraph is 100% air-gap capable. It runs entirely on local laptop hardware using Baidu Unlimited-OCR, Ollama, NetworkX, and our embedded sovereign cryptographic ledger. It requires zero cloud connectivity."* |
| **"How do you stop the LLM from hallucinating suspect names?"** | *LLMs make things up. Can we trust this in court?* | *"We enforce a strict closed-world evidence policy. Every entity extracted by the LLM is checked by our deterministic verifier against verbatim character offsets in the raw OCR output. If an entity cannot be highlighted in the source document, it is rejected."* |
| **"Why is blockchain necessary here?"** | *Is blockchain just a hackathon buzzword?* | *"In criminal trials under BSA 2023 Section 63, the defense routinely alleges that electronic evidence was tampered with during police custody. By anchoring the raw document hash on a blockchain smart contract at the instant of upload, we create mathematically verifiable chain-of-custody proof that no defense counsel can dispute."* |
