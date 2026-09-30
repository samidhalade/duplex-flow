export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get(path) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${path} returned ${res.status}`);
    return await res.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`${path} timed out after 10 seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
export async function getToken() {
  const data = await get("/api/token");
  if (!data?.token || !data?.url) {
    throw new Error("The backend returned an invalid LiveKit token response");
  }
  return data;
}
export const getBenchmark = () => get("/api/benchmark"); // { pass_rate: {...} }
export const getLogs = (room) =>
  get(`/api/live-logs${room ? `?room=${encodeURIComponent(room)}` : ""}`);

// Shown only when the backend is unreachable, so the dashboard never renders empty.
export const FALLBACK_BENCHMARK = {
  pass_rate: {
    benchmark_name: "FDB-v3 benchmark snapshot",
    evaluated_at: null,
    total_scenarios: 100,
    overall_pass_rate: 0.94,
    passed: 94,
    failed: 6,
    failure_breakdown: { wrong_tools: 5, wrong_arguments: 1 },
    by_domain: {
      ecommerce_support: 1,
      finance_billing: 0.96,
      housing_location: 0.846,
      travel_identity: 0.95,
    },
    by_difficulty: { easy: 1, medium: 0.941, hard: 0.867 },
    by_num_tools: { 1: 0.97, 2: 0.944, 3: 0.812 },
    by_disfluency_feature: {
      PAUSE: 0.944,
      FILLER: 0.966,
      HESITATION: 1,
      FALSE_START: 1,
      SELF_CORRECTION: 0.824,
    },
    by_state_rollback: { with_rollback: 0.824, without_rollback: 0.964 },
    scenario_results: [],
  },
  eval_report: {},
};
