/**
 * RecoveryOS REST API Client
 * Connects frontend directly to FastAPI backend (/api/v1)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export interface RecoveryCaseDTO {
  id: string;
  customer: string;
  email: string;
  amount: number;
  reason: string;
  probability: number;
  expected: number;
  action: "Wait" | "Retry" | "Payment Link" | "Reminder" | "Human Review" | "Stop";
  priority: "High" | "Medium" | "Low";
  status: "Recovered" | "Pending" | "Human Review" | "Recoverable" | "Stopped";
  lastAction: string;
  created: string;
  method: string;
  retryCount: number;
  confidence: number;
  diagnosis: string;
  diagnosisDetail: string;
  rationale: string;
  recoveredAmount?: number;
  shap_factors?: Array<{
    feature: string;
    raw_feature: string;
    shap_value: number;
    impact: "positive" | "negative";
    magnitude: number;
  }>;
  policy_checks?: Record<string, boolean>;
}

export interface OverviewAnalyticsDTO {
  revenue_recovered: number;
  revenue_at_risk: number;
  expected_recovery: number;
  recovery_rate: string;
  incremental_recovery: number;
  trend_data: Array<{ day: string; recovered: number; baseline: number }>;
  failure_data: Array<{ name: string; value: number; color?: string }>;
  outcome_data: Array<{ name: string; value: number; color?: string }>;
  operating_health: {
    recovery_rate: string;
    recovery_rate_detail: string;
    avg_time_to_recovery: string;
    avg_time_detail: string;
    human_escalation_rate: string;
    escalation_detail: string;
    stopped_cases: number;
    stopped_detail: string;
  };
  failure_performance: Array<{
    label: string;
    rate: string;
    value: string;
    tone: string;
  }>;
}

export interface PolicyConfigDTO {
  max_automated_retries: number;
  max_customer_reminders: number;
  high_value_threshold: number;
  stop_after_repeated_failures: bool;
  stop_after_successful_payment: bool;
  pause_during_systemic_failure: bool;
  human_review_low_confidence: bool;
  confidence_threshold: number;
  allowed_actions: string[];
}

export interface AuditEventDTO {
  id: string;
  time: string;
  what: string;
  caseId: string;
  why: string;
  policy: string;
  outcome: string;
  recovered: number;
  decision_context?: Record<string, any>;
}

export interface ActivityFeedDTO {
  counters: {
    cases_analyzed: number;
    actions_taken: number;
    human_escalations: number;
    cases_stopped: number;
    revenue_recovered: string;
  };
  events: Array<{
    label: string;
    detail: string;
    tone: string;
  }>;
}

export interface SimulationResultDTO {
  total_transactions: number;
  at_risk_cases: number;
  recoverable_cases: number;
  recovery_actions_taken: number;
  human_escalations: number;
  stopped_cases: number;
  total_revenue_recovered: number;
  incremental_revenue_lift: number;
  systemic_contacts_avoided: number;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const api = {
  getOverview: () => request<OverviewAnalyticsDTO>("/overview"),
  
  getCases: (params?: { status?: string; priority?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== "All") q.append("status", params.status);
    if (params?.priority && params.priority !== "All") q.append("priority", params.priority);
    if (params?.search) q.append("search", params.search);
    const queryStr = q.toString();
    return request<RecoveryCaseDTO[]>(`/cases${queryStr ? `?${queryStr}` : ""}`);
  },

  getCaseDetail: (caseId: string) => request<RecoveryCaseDTO>(`/cases/${caseId}`),

  executeCaseAction: (caseId: string, action: string, notes?: string) =>
    request<{ status: string; current_status: string }>(`/cases/${caseId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, notes }),
    }),

  getActivityFeed: () => request<ActivityFeedDTO>("/activity"),

  getAnalytics: () => request<OverviewAnalyticsDTO>("/analytics"),

  getPolicies: () => request<PolicyConfigDTO>("/policies"),

  updatePolicies: (data: Partial<PolicyConfigDTO>) =>
    request<PolicyConfigDTO>("/policies", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAuditLogs: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<AuditEventDTO[]>(`/audit${q}`);
  },

  runSimulation: (numTransactions: number = 10000) =>
    request<SimulationResultDTO>("/simulation/run", {
      method: "POST",
      body: JSON.stringify({ num_transactions: numTransactions, reset_existing: true }),
    }),
};
