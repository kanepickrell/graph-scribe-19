import { ChevronDown, ChevronUp, Download, TrendingUp, Users, Clock } from "lucide-react";

interface AnalyticsPanelProps {
  selectedNodes: string[];
  expanded: boolean;
  onToggle: () => void;
}

const AnalyticsPanel = ({ selectedNodes, expanded, onToggle }: AnalyticsPanelProps) => {
  const autoInsights = [
    {
      icon: TrendingUp,
      title: "3 automation scripts are 90% similar",
      impact: "Save ~8 hours if merged",
      color: "text-accent-pink"
    },
    {
      icon: Users,
      title: "Blue Team's C2 fix solves Red Team issue",
      impact: "Share knowledge",
      color: "text-node-step"
    }
  ];

  return (
    <div className={`neo-card flex flex-col transition-all duration-300 ${expanded ? "flex-1" : "h-16"}`}>
      {/* Header */}
      <div 
        className="p-4 border-b-[3px] border-border bg-secondary/30 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-extrabold text-lg">Auto Insights</h3>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Auto-Generated Insights */}
          <div>
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              QUICK WINS
            </h4>
            <div className="space-y-3">
              {autoInsights.map((insight, idx) => (
                <div key={idx} className="neo-card p-3 bg-secondary/50">
                  <div className="flex items-start gap-2 mb-2">
                    <insight.icon className={`w-4 h-4 ${insight.color} mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-1">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">💰 {insight.impact}</p>
                    </div>
                  </div>
                  <button className="neo-button-secondary w-full text-xs">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          {selectedNodes.length > 0 && (
            <div className="border-t-2 border-border my-4" />
          )}
          
          {/* Based on Selection */}
          {/* Selected Items */}
          <div>
            <h4 className="font-bold text-sm mb-2">Selected Items ({selectedNodes.length})</h4>
            {selectedNodes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center border-2 border-dashed border-border rounded-lg">
                Click nodes in the graph to select
              </p>
            ) : (
              <div className="space-y-2">
                {selectedNodes.map((nodeId) => (
                  <div
                    key={nodeId}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg border-2 border-border"
                  >
                    <div className="w-2 h-2 rounded-full bg-node-step" />
                    <span className="text-xs font-medium flex-1">{nodeId}</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {selectedNodes.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-2">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="neo-card p-3 bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-node-artifact" />
                    <span className="text-xs font-semibold">Success Rate</span>
                  </div>
                  <div className="text-2xl font-extrabold">83%</div>
                </div>
                
                <div className="neo-card p-3 bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-node-step" />
                    <span className="text-xs font-semibold">Teams</span>
                  </div>
                  <div className="text-2xl font-extrabold">3</div>
                </div>
                
                <div className="neo-card p-3 bg-secondary/50 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-node-ttp" />
                    <span className="text-xs font-semibold">Time Span</span>
                  </div>
                  <div className="text-2xl font-extrabold">45 days</div>
                </div>
              </div>
            </div>
          )}

          {/* Phase Distribution */}
          {selectedNodes.length > 0 && (
            <div>
              <h4 className="font-bold text-sm mb-2">Phase Distribution</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">Planning</span>
                    <span>33%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-node-process" style={{ width: "33%" }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">Development</span>
                    <span>50%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-node-step" style={{ width: "50%" }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">Execution</span>
                    <span>17%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-node-artifact" style={{ width: "17%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Templates */}
          <div>
            <h4 className="font-bold text-sm mb-2">Generate Analysis</h4>
            <div className="space-y-2">
              <button className="neo-button-secondary w-full text-left text-sm">
                📊 Process Timeline
              </button>
              <button className="neo-button-secondary w-full text-left text-sm">
                👥 Team Comparison
              </button>
              <button className="neo-button-secondary w-full text-left text-sm">
                ⚠️ Failure Analysis
              </button>
              <button className="neo-button-secondary w-full text-left text-sm">
                ✨ Custom Query
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h4 className="font-bold text-sm mb-2">Export Data</h4>
            <div className="flex gap-2">
              <button className="neo-button-secondary flex-1 text-xs">
                <Download className="w-3 h-3 inline mr-1" />
                JSON
              </button>
              <button className="neo-button-secondary flex-1 text-xs">
                <Download className="w-3 h-3 inline mr-1" />
                CSV
              </button>
              <button className="neo-button-secondary flex-1 text-xs">
                <Download className="w-3 h-3 inline mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
