export type EntityCategory = 
  | 'PERSON' 
  | 'PHONE' 
  | 'IMEI' 
  | 'VEHICLE' 
  | 'BANK_ACCOUNT' 
  | 'UPI_ID' 
  | 'LOCATION' 
  | 'LEGAL_SECTION' 
  | 'EVIDENCE' 
  | 'FACT';

export type DetroitNodeType = 'ANCHOR' | 'ACTION' | 'LOCKED' | 'BROKER' | 'GHOST';

export interface ExtractedEntity {
  id: string;
  name: string;
  category: EntityCategory;
  role?: string;
  aliases: string[];
  raw_span?: string;
  span_start?: number;
  span_end?: number;
  verification_status: 'VERIFIED' | 'LOCKED' | 'UNVERIFIED';
  details: Record<string, any>;
}

export interface FactItem {
  fact_id: string;
  category: string;
  description: string;
  timestamp?: string;
  location?: string;
  source: string;
  is_locked: boolean;
  evidence_ids: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  category: EntityCategory;
  sublabel?: string;
  node_type: DetroitNodeType;
  community_id: number;
  betweenness_score: number;
  is_broker: boolean;
  is_locked: boolean;
  is_ghost: boolean;
  confidence?: number;
  details: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  source_type: 'FIR' | 'CDR' | 'BANK' | 'CROSS_CASE';
  evidence_ref?: string;
  is_suspicious: boolean;
}

export interface ConnectedCaseGraph {
  case_id: string;
  fir_number: string;
  police_station: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  central_broker_id?: string;
  total_communities: number;
  stats: Record<string, any>;
}

export interface SuspiciousPattern {
  pattern_id: string;
  title: string;
  pattern_type: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  description: string;
  involved_nodes: string[];
  supporting_evidence: Record<string, any>;
  investigative_advice: string;
}

export interface CrossCaseResemblance {
  matched_case_id: string;
  matched_fir_number: string;
  police_station: string;
  investigating_officer: string;
  io_contact: string;
  resemblance_percentage: number;
  overlapping_identifiers: Record<string, string[]>;
  syndicate_structure: string;
  recovery_tactics_and_leads: string;
  recommended_action: string;
}

export interface CaseProcessingResult {
  case_id: string;
  fir_number: string;
  title: string;
  police_station: string;
  date_time: string;
  threat_level: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  bns_sections: string;
  investigating_officer: string;
  summary: string;
  sha256_hash: string;
  blockchain_tx_hash: string;
  entities: ExtractedEntity[];
  facts: FactItem[];
  graph: ConnectedCaseGraph;
  patterns: SuspiciousPattern[];
  cross_case_match?: CrossCaseResemblance;
}

export interface CaseListItem {
  case_id: string;
  fir_number: string;
  title: string;
  police_station: string;
  date_time: string;
  threat_level: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  accused_count: number;
  bns_sections: string;
  defrauded_amount?: string;
  central_broker?: string;
}
