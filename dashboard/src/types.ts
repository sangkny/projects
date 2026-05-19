/** Ontology 통계 공통 타입 */

export interface OntologyErrorBucket {
  code: string
  count: number
  message?: string
}

export interface OntologyDomainSlice {
  domain: string
  today_validations: number
  pass_rate: number
  top_errors: OntologyErrorBucket[]
}

export interface OntologyStats {
  domain: string
  today_validations: number
  pass_rate: number
  top_errors: OntologyErrorBucket[]
  generated_at?: string
  service?: string
  domains_detail?: OntologyDomainSlice[]
  /** CoOps 확장 필드 */
  high_risk_contracts?: HighRiskBrief[]
  pending_approvals?: number
}

export interface HighRiskBrief {
  contract_number: string
  risk_level: string
  ontology_passed: boolean
}

export interface HealthAggregateBody {
  services?: Record<string, { status?: string; ok?: boolean; url?: string }>
}

export interface HarnessLatest {
  timestamp: string
  total: number
  passed: number
  failed?: number
  pass_rate?: number
  total_ms?: number
  results: Array<{
    scenario_name: string
    domain: string
    passed: boolean
    latency_ms: number
    timestamp?: string
  }>
}
