import { useEffect, useState } from "react";

interface GraphSummary {
  totalNodes: number;
  totalEdges: number;
  dataVolume: string;
  lastUpdated: string;
  breakdown: Array<{ type: string; count: number; percent: number }>;
  phases: Array<{ name: string; count: number; percent: number }>;
  insights: string[];
}

interface GraphPreviewScreenProps {
  onEnterMode: (mode: 'discovery' | 'engineering') => void;
}

const GraphPreviewScreen = ({ onEnterMode }: GraphPreviewScreenProps) => {
  const [summary, setSummary] = useState<GraphSummary>({
    totalNodes: 347,
    totalEdges: 892,
    dataVolume: "156.4k records",
    lastUpdated: "2 hours ago",
    breakdown: [
      { type: "Process", count: 12, percent: 3.5 },
      { type: "Step", count: 89, percent: 25.6 },
      { type: "Artifact", count: 223, percent: 64.3 },
      { type: "TTP", count: 23, percent: 6.6 }
    ],
    phases: [
      { name: "Planning", count: 87, percent: 25 },
      { name: "Development", count: 156, percent: 45 },
      { name: "Execution", count: 104, percent: 30 }
    ],
    insights: [
      "23 new artifacts added today",
      "5 automation opportunities detected",
      "47 ML-ready datasets available",
      "3 cross-team patterns found"
    ]
  });

  return (
    <div className="graph-preview-screen">
      {/* Frosted graph background */}
      <div className="graph-blur-bg">
        <svg width="100%" height="100%" className="preview-graph">
          {/* Simplified mock graph for background */}
          <g opacity="0.3">
            <circle cx="200" cy="150" r="20" fill="var(--node-process)" />
            <circle cx="500" cy="150" r="20" fill="var(--node-process)" />
            <circle cx="150" cy="300" r="15" fill="var(--node-step)" />
            <circle cx="350" cy="300" r="15" fill="var(--node-step)" />
            <circle cx="550" cy="300" r="15" fill="var(--node-step)" />
            <circle cx="100" cy="450" r="12" fill="var(--node-artifact)" />
            <circle cx="300" cy="450" r="12" fill="var(--node-artifact)" />
            <circle cx="500" cy="450" r="12" fill="var(--node-artifact)" />
            <circle cx="700" cy="300" r="15" fill="var(--node-ttp)" />
          </g>
        </svg>
      </div>

      {/* Summary overlay */}
      <div className="summary-card">
        <div className="summary-header">
          <h1 className="summary-title">YOUR DATA GRAPH</h1>
          <div className="forge-badge">🔥 FORGE</div>
        </div>

        <div className="summary-divider" />

        <section className="summary-section">
          <h2 className="section-title">📊 OVERVIEW</h2>
          <div className="stats-grid">
            <div className="stat-row">
              <span className="stat-label">Total Nodes:</span>
              <span className="stat-value">{summary.totalNodes}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Connections:</span>
              <span className="stat-value">{summary.totalEdges}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Data Volume:</span>
              <span className="stat-value">{summary.dataVolume}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Last Updated:</span>
              <span className="stat-value">{summary.lastUpdated}</span>
            </div>
          </div>
        </section>

        <div className="summary-divider" />

        <section className="summary-section">
          <h2 className="section-title">📦 BREAKDOWN BY TYPE</h2>
          <div className="breakdown-list">
            {summary.breakdown.map((item) => (
              <div key={item.type} className="breakdown-row">
                <span className="breakdown-dot" style={{ 
                  backgroundColor: item.type === "Process" ? "var(--node-process)" :
                                  item.type === "Step" ? "var(--node-step)" :
                                  item.type === "Artifact" ? "var(--node-artifact)" :
                                  "var(--node-ttp)"
                }} />
                <span className="breakdown-label">{item.type} Nodes:</span>
                <span className="breakdown-count">{item.count}</span>
                <span className="breakdown-percent">({item.percent}%)</span>
              </div>
            ))}
          </div>
        </section>

        <div className="summary-divider" />

        <section className="summary-section">
          <h2 className="section-title">🎯 BY PHASE</h2>
          <div className="phase-bars">
            {summary.phases.map((phase) => (
              <div key={phase.name} className="phase-item">
                <div className="phase-header">
                  <span className="phase-name">{phase.name}:</span>
                  <span className="phase-count">{phase.count} nodes ({phase.percent}%)</span>
                </div>
                <div className="phase-bar">
                  <div 
                    className="phase-fill" 
                    style={{ width: `${phase.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="summary-divider" />

        <section className="summary-section">
          <h2 className="section-title">💡 QUICK INSIGHTS</h2>
          <ul className="insights-list">
            {summary.insights.map((insight, i) => (
              <li key={i} className="insight-item">• {insight}</li>
            ))}
          </ul>
        </section>

        <div className="summary-divider" />

        <div className="mode-entry-buttons">
          <button 
            className="btn-mode btn-discovery"
            onClick={() => onEnterMode('discovery')}
          >
            <span className="btn-icon">🔍</span>
            <span>Start Discovery Mode</span>
          </button>
          <button 
            className="btn-mode btn-engineering"
            onClick={() => onEnterMode('engineering')}
          >
            <span className="btn-icon">🔧</span>
            <span>Enter Engineering Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphPreviewScreen;
