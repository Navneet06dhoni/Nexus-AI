import csv
import io
from typing import List, Dict, Any, Tuple
import pandas as pd
from ..models.schemas import GraphEdge

class FusionService:
    """
    Multi-Source Operational Data Fusion Engine.
    Fuses unstructured FIR mentions with structured CDR logs and Bank/UPI transfer ledgers.
    """

    def parse_cdr_data(self, cdr_csv_content: str) -> List[Dict[str, Any]]:
        records = []
        reader = csv.DictReader(io.StringIO(cdr_csv_content.strip()))
        for row in reader:
            records.append({
                "call_id": row.get("call_id"),
                "caller": row.get("caller_msisdn"),
                "receiver": row.get("receiver_msisdn"),
                "timestamp": row.get("call_timestamp"),
                "duration_sec": int(row.get("call_duration_sec", 0)),
                "call_type": row.get("call_type", "OUTGOING"),
                "tower_id": row.get("cell_tower_id"),
                "imei": row.get("imei")
            })
        return records

    def parse_bank_data(self, bank_csv_content: str) -> List[Dict[str, Any]]:
        records = []
        reader = csv.DictReader(io.StringIO(bank_csv_content.strip()))
        for row in reader:
            records.append({
                "txn_id": row.get("txn_id"),
                "sender": row.get("sender_account_or_upi"),
                "sender_name": row.get("sender_name"),
                "receiver": row.get("receiver_account_or_upi"),
                "receiver_name": row.get("receiver_name"),
                "amount": float(row.get("amount_inr", 0.0)),
                "timestamp": row.get("txn_timestamp"),
                "bank_ref": row.get("bank_ref_no"),
                "layer": row.get("mule_layer")
            })
        return records

    def generate_fusion_edges(
        self,
        cdr_records: List[Dict[str, Any]],
        bank_records: List[Dict[str, Any]]
    ) -> List[GraphEdge]:
        edges: List[GraphEdge] = []
        edge_id_counter = 1

        # 1. Process CDR interactions (aggregate call frequencies)
        call_aggregates = {}
        for r in cdr_records:
            caller = r["caller"]
            receiver = r["receiver"]
            pair_key = tuple(sorted([caller, receiver]))
            if pair_key not in call_aggregates:
                call_aggregates[pair_key] = {"count": 0, "total_duration": 0, "sample_tower": r["tower_id"]}
            call_aggregates[pair_key]["count"] += 1
            call_aggregates[pair_key]["total_duration"] += r["duration_sec"]

        for (c1, c2), agg in call_aggregates.items():
            edges.append(GraphEdge(
                id=f"EDGE_CDR_{edge_id_counter:03d}",
                source=f"PHONE_{c1}",
                target=f"PHONE_{c2}",
                label=f"{agg['count']} Calls ({agg['total_duration']}s)",
                weight=min(5.0, 1.0 + (agg["count"] * 0.8)),
                source_type="CDR",
                evidence_ref=f"Tower {agg['sample_tower']} CDR Log",
                is_suspicious=agg["count"] >= 3
            ))
            edge_id_counter += 1

        # 2. Process Bank Fund Transfers
        for b in bank_records:
            s_id = f"UPI_{b['sender'].replace('@', '_at_')}" if "@" in b["sender"] else f"BANK_{b['sender']}"
            r_id = f"UPI_{b['receiver'].replace('@', '_at_')}" if "@" in b["receiver"] else f"BANK_{b['receiver']}"
            
            edges.append(GraphEdge(
                id=f"EDGE_BANK_{edge_id_counter:03d}",
                source=s_id,
                target=r_id,
                label=f"₹{b['amount']:,.0f} ({b['layer'].split(' ')[0]})",
                weight=3.5,
                source_type="BANK",
                evidence_ref=f"UTR: {b['bank_ref']}",
                is_suspicious=b["amount"] >= 400000.0
            ))
            edge_id_counter += 1

        return edges
