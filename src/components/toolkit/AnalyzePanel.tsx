import { useState } from "react";
import { PlayCircle } from "lucide-react";

interface AnalyzePanelProps {
  selectedNodes: string[];
}

const AnalyzePanel = ({ selectedNodes }: AnalyzePanelProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    // Mock analysis
    setTimeout(() => {
      setResults({
        totalRecords: 52347,
        completePercent: 94,
        missingPercent: 6,
        invalidPercent: 0,
        recommendations: ["ML Training", "API Export"],
        issues: [
          { nodeId: "node1", issue: "Missing timestamp in 3% of records", severity: "warning" }
        ]
      });
      setAnalyzing(false);
    }, 1500);
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="empty-panel">
        <p>Select nodes in the graph to analyze</p>
      </div>
    );
  }

  return (
    <div className="analyze-panel">
      <div className="panel-header-toolkit">
        <h3>Data Quality Analysis</h3>
        <button 
          onClick={runAnalysis} 
          disabled={analyzing}
          className="btn-toolkit-primary"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{analyzing ? 'Analyzing...' : 'Run Analysis'}</span>
        </button>
      </div>

      {results && (
        <div className="analysis-results">
          <div className="result-section">
            <h4>Selected: {selectedNodes.length} nodes ({results.totalRecords} records)</h4>
          </div>

          <div className="result-section">
            <h4>Quality Breakdown</h4>
            <div className="quality-bars">
              <div className="quality-bar-item">
                <span className="quality-label">Complete fields</span>
                <div className="quality-bar">
                  <div 
                    className="quality-fill quality-good" 
                    style={{ width: `${results.completePercent}%` }}
                  />
                </div>
                <span className="quality-value">{results.completePercent}%</span>
              </div>
              <div className="quality-bar-item">
                <span className="quality-label">Missing fields</span>
                <div className="quality-bar">
                  <div 
                    className="quality-fill quality-warning" 
                    style={{ width: `${results.missingPercent}%` }}
                  />
                </div>
                <span className="quality-value">{results.missingPercent}%</span>
              </div>
              <div className="quality-bar-item">
                <span className="quality-label">Invalid formats</span>
                <div className="quality-bar">
                  <div 
                    className="quality-fill quality-error" 
                    style={{ width: `${results.invalidPercent}%` }}
                  />
                </div>
                <span className="quality-value">{results.invalidPercent}%</span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h4>Recommended For</h4>
            <div className="recommendations">
              {results.recommendations.map((rec: string) => (
                <span key={rec} className="recommendation-badge">✅ {rec}</span>
              ))}
            </div>
          </div>

          {results.issues.length > 0 && (
            <div className="result-section">
              <h4>Issues Found ({results.issues.length})</h4>
              <div className="issues-list">
                {results.issues.map((issue: any, i: number) => (
                  <div key={i} className="issue-item">
                    <span className="issue-severity warning">⚠️</span>
                    <span className="issue-text">{issue.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel-actions">
            <button className="btn-toolkit-secondary">Fix Issues</button>
            <button className="btn-toolkit-primary">Continue to Train</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzePanel;
