"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getBenchmark, FALLBACK_BENCHMARK } from "@/lib/api";

const formatPercent = (value) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? `${(number * 100).toFixed(number === 1 ? 0 : 1).replace(/\.0$/, "")}%`
    : "—";
};

const formatName = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

function RateBreakdown({ title, values }) {
  const entries = Object.entries(values || {}).filter(([, value]) =>
    Number.isFinite(Number(value)),
  );

  return (
    <section className="breakdown">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{entries.length} groups</span>
      </div>
      {entries.length ? (
        <div className="breakdown-list">
          {entries.map(([name, value]) => (
            <div className="breakdown-row" key={name}>
              <span className="breakdown-name">{formatName(name)}</span>
              <div
                className="rate-track"
                role="img"
                aria-label={`${formatName(name)}: ${formatPercent(value)}`}
              >
                <span
                  style={{
                    width: `${Math.max(0, Math.min(100, Number(value) * 100))}%`,
                  }}
                />
              </div>
              <strong>{formatPercent(value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No breakdown data available.</p>
      )}
    </section>
  );
}

function CountBreakdown({ values }) {
  const entries = Object.entries(values || {}).filter(([, value]) =>
    Number.isFinite(Number(value)),
  );
  const maxCount = Math.max(1, ...entries.map(([, value]) => Number(value)));

  return (
    <section className="breakdown">
      <div className="section-heading">
        <h2>Failure breakdown</h2>
        <span>
          {entries.reduce((sum, [, value]) => sum + Number(value), 0)} total
        </span>
      </div>
      {entries.length ? (
        <div className="breakdown-list">
          {entries.map(([name, value]) => (
            <div className="breakdown-row" key={name}>
              <span className="breakdown-name">{formatName(name)}</span>
              <div className="rate-track failure-track" aria-hidden="true">
                <span
                  style={{ width: `${(Number(value) / maxCount) * 100}%` }}
                />
              </div>
              <strong>{Number(value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No failures recorded.</p>
      )}
    </section>
  );
}

export default function Benchmark() {
  const [data, setData] = useState(null);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

  useEffect(() => {
    let current = true;
    getBenchmark()
      .then((result) => {
        if (current) setData(result);
      })
      .catch(() => {
        if (!current) return;
        setData(FALLBACK_BENCHMARK);
        setOffline(true);
      });
    return () => {
      current = false;
    };
  }, []);

  const report = data?.pass_rate || FALLBACK_BENCHMARK.pass_rate;
  const scenarios = report.scenario_results || [];
  const filteredScenarios = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scenarios.filter((scenario) => {
      const matchesResult =
        resultFilter === "all" ||
        (resultFilter === "passed" ? scenario.passed : !scenario.passed);
      const searchable = [
        scenario.scenario_id,
        scenario.title,
        scenario.domain,
        scenario.difficulty,
        scenario.failure_reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesResult && (!query || searchable.includes(query));
    });
  }, [resultFilter, scenarios, search]);

  if (!data) {
    return (
      <div className="wrap benchmark-page">
        <p className="muted" role="status">
          Loading benchmark results…
        </p>
      </div>
    );
  }

  const passRate = Number(report.overall_pass_rate);
  const passPercent = Number.isFinite(passRate)
    ? Math.max(0, Math.min(100, passRate * 100))
    : 0;

  return (
    <div className="wrap benchmark-page">
      <header className="benchmark-header">
        <div>
          <p className="eyebrow">Evaluation / FDB-v3</p>
          <h1>{report.benchmark_name || "Full-Duplex Benchmark"}</h1>
          <p className="benchmark-intro">
            Speech understanding and multi-step tool execution across the
            benchmark suite.
          </p>
        </div>
        <div className="evaluated-at">
          <span>Evaluated</span>
          <strong>{formatDate(report.evaluated_at)}</strong>
        </div>
      </header>

      {offline && (
        <p className="benchmark-notice" role="status">
          Showing the saved benchmark snapshot. The live report could not be
          reached.
        </p>
      )}

      <section className="benchmark-summary" aria-label="Benchmark summary">
        <div className="pass-rate-summary">
          <div className="summary-label">Overall pass rate</div>
          <div className="pass-rate-value">
            {formatPercent(report.overall_pass_rate)}
          </div>
          <div
            className="summary-track"
            aria-label={`${formatPercent(report.overall_pass_rate)} passed`}
          >
            <span style={{ width: `${passPercent}%` }} />
          </div>
          <p>
            {Number(report.passed) || 0} passed out of{" "}
            {Number(report.total_scenarios) || 0} scenarios
          </p>
        </div>
        <div className="summary-stat">
          <span>Total scenarios</span>
          <strong>{Number(report.total_scenarios).toLocaleString()}</strong>
        </div>
        <div className="summary-stat">
          <span>Passed</span>
          <strong className="passed-value">
            {Number(report.passed).toLocaleString()}
          </strong>
        </div>
        <div className="summary-stat">
          <span>Failed</span>
          <strong className="failed-value">
            {Number(report.failed).toLocaleString()}
          </strong>
        </div>
      </section>

      <div className="breakdown-grid">
        <RateBreakdown title="Pass rate by domain" values={report.by_domain} />
        <CountBreakdown values={report.failure_breakdown} />
        <RateBreakdown title="By difficulty" values={report.by_difficulty} />
        <RateBreakdown
          title="By number of tools"
          values={report.by_num_tools}
        />
        <RateBreakdown
          title="By disfluency feature"
          values={report.by_disfluency_feature}
        />
        <RateBreakdown
          title="By state rollback"
          values={report.by_state_rollback}
        />
      </div>

      <section className="scenario-section">
        <div className="scenario-heading">
          <div>
            <p className="eyebrow">Detailed results</p>
            <h2>Scenario results</h2>
            <p>
              {filteredScenarios.length} of {scenarios.length} scenarios
            </p>
          </div>
          <div className="scenario-controls">
            <label className="scenario-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search scenarios"
                aria-label="Search scenarios"
              />
            </label>
            <label className="visually-hidden" htmlFor="scenario-result-filter">
              Filter scenarios
            </label>
            <select
              id="scenario-result-filter"
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
            >
              <option value="all">All results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="scenario-table-wrap">
          <table className="scenario-table">
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col">Domain</th>
                <th scope="col">Difficulty</th>
                <th scope="col">Tools</th>
                <th scope="col">Result</th>
                <th scope="col">Failure details</th>
              </tr>
            </thead>
            <tbody>
              {filteredScenarios.map((scenario, index) => (
                <tr key={`${scenario.scenario_id || "scenario"}-${index}`}>
                  <td>
                    <strong>
                      {scenario.title ||
                        scenario.scenario_id ||
                        "Untitled scenario"}
                    </strong>
                    <span className="scenario-id">
                      {scenario.scenario_id || "—"}
                    </span>
                  </td>
                  <td>{formatName(scenario.domain || "—")}</td>
                  <td>{formatName(scenario.difficulty || "—")}</td>
                  <td>{scenario.num_tools ?? "—"}</td>
                  <td>
                    <span
                      className={`result-pill ${scenario.passed ? "is-passed" : "is-failed"}`}
                    >
                      {scenario.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td>{scenario.failure_reason || "—"}</td>
                </tr>
              ))}
              {!filteredScenarios.length && (
                <tr>
                  <td className="empty-table" colSpan={6}>
                    No scenarios match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
