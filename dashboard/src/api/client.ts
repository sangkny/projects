import type { HealthAggregateBody, HarnessLatest, OntologyStats } from '../types'

const jsonHeaders = {
  Accept: 'application/json',
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(path, { headers: jsonHeaders })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

/** 게이트웨이 라우팅 (/api/medical|code|ops/…) */
export const paths = {
  health: '/api/health',
  ontologyMedi: '/api/medical/api/v1/ontology/stats',
  ontologyCode: '/api/code/api/v1/ontology/stats',
  ontologyOps: '/api/ops/api/v1/ontology/stats',
  harnessReport: '/harness-report/all_latest.json',
  mediDashboardStats: '/api/medical/api/v1/dashboard/stats',
  autonMonitorActive: '/api/code/api/v1/monitor/active',
  opsContracts: '/api/ops/api/v1/contracts/',
  costSummary: '/api/code/api/v1/cost/summary',
  svgTypes: '/api/code/api/v1/svg/types',
}

export async function fetchHealth(): Promise<HealthAggregateBody | null> {
  return getJson<HealthAggregateBody>(paths.health)
}

export async function fetchOntology(
  plat: 'medi' | 'code' | 'ops',
): Promise<OntologyStats | null> {
  const url =
    plat === 'medi'
      ? paths.ontologyMedi
      : plat === 'code'
        ? paths.ontologyCode
        : paths.ontologyOps
  return getJson<OntologyStats>(url)
}

export async function fetchHarnessLatest(): Promise<HarnessLatest | null> {
  return getJson<HarnessLatest>(paths.harnessReport)
}

export async function fetchJson<T>(path: string): Promise<T | null> {
  return getJson<T>(path)
}
