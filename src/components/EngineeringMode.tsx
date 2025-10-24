import { useState } from "react";
import GraphExplorer from "./GraphExplorer";
import EngineeringToolbar from "./EngineeringToolbar";
import EngineeringToolkit from "./EngineeringToolkit";
import { Layers, Palette, Search, Target } from "lucide-react";

const EngineeringMode = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [activeToolkitTab, setActiveToolkitTab] = useState<string>('analyze');
  const [colorBy, setColorBy] = useState('type');
  const [sizeBy, setSizeBy] = useState('fixed');
  const [aiExpanded, setAIExpanded] = useState(false);

  return (
    <div className="engineering-mode">
      {/* Engineering Toolbar */}
      <EngineeringToolbar 
        activeTool={activeTool}
        onToolChange={setActiveTool}
        colorBy={colorBy}
        onColorByChange={setColorBy}
        sizeBy={sizeBy}
        onSizeByChange={setSizeBy}
      />

      {/* Graph Workspace - PRIMARY INTERFACE */}
      <main className="graph-workspace">
        <GraphExplorer 
          selectedNodes={selectedNodes}
          onNodeSelect={setSelectedNodes}
          mode="engineering"
          highlightedNodes={[]}
        />
        
        {/* Selection info overlay */}
        {selectedNodes.length > 0 && (
          <div className="selection-info-overlay">
            <div className="selection-stats">
              <span className="stat-item">
                <strong>Selection:</strong> {selectedNodes.length} nodes
              </span>
              <span className="stat-divider">|</span>
              <span className="stat-item">
                <strong>Records:</strong> {selectedNodes.length * 234}
              </span>
              <span className="stat-divider">|</span>
              <span className="stat-item">
                <strong>Quality:</strong> 4.2/5
              </span>
              <span className="stat-divider">|</span>
              <span className="stat-item">
                <strong>Suitable for:</strong> ML Training, API Export
              </span>
            </div>
          </div>
        )}
        
        {/* Status bar */}
        <div className="status-bar-engineering">
          <div className="status-left">
            <span className="status-item">Nodes: 347</span>
            <span className="status-divider">|</span>
            <span className="status-item">Selected: {selectedNodes.length}</span>
            <span className="status-divider">|</span>
            <span className="status-item">Zoom: 100%</span>
            <span className="status-divider">|</span>
            <span className="status-item">Pan: Center</span>
          </div>
          <div className="status-right">
            <span className="gpu-indicator">⚡️ GPU Available</span>
          </div>
        </div>
      </main>

      {/* Engineering Toolkit - Bottom Panel */}
      <EngineeringToolkit 
        activeTab={activeToolkitTab}
        onTabChange={setActiveToolkitTab}
        selectedNodes={selectedNodes}
      />

      {/* AI Assistant - Collapsed by default */}
      {!aiExpanded ? (
        <button 
          className="expand-ai-btn"
          onClick={() => setAIExpanded(true)}
        >
          <span>🤖</span>
          <span>Need help? Ask AI</span>
        </button>
      ) : (
        <aside className="ai-assistant-engineering">
          <div className="ai-header-engineering">
            <h3>AI Assistant</h3>
            <button 
              className="collapse-btn"
              onClick={() => setAIExpanded(false)}
            >
              ✕
            </button>
          </div>
          <div className="ai-content-engineering">
            <p className="ai-help-text">
              I can help you with:
            </p>
            <ul className="ai-help-list">
              <li>• Analyzing data quality</li>
              <li>• Suggesting model types</li>
              <li>• Writing plugin scripts</li>
              <li>• Troubleshooting issues</li>
            </ul>
            <input 
              type="text"
              placeholder="Ask me anything..."
              className="ai-input-engineering"
            />
          </div>
        </aside>
      )}
    </div>
  );
};

export default EngineeringMode;
