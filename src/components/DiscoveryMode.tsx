import { useState } from "react";
import ChatAssistant from "./ChatAssistant";
import GraphExplorer from "./GraphExplorer";

const DiscoveryMode = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  const handleShowNodes = (nodeIds: string[]) => {
    setHighlightedNodes(nodeIds);
    // Auto-select highlighted nodes after a brief highlight
    setTimeout(() => {
      setSelectedNodes(nodeIds);
    }, 1000);
  };

  return (
    <div className="discovery-mode">
      {/* AI Assistant - PRIMARY INTERFACE */}
      <aside className="ai-assistant-panel">
        <ChatAssistant 
          selectedNodes={selectedNodes}
          expanded={true}
          onToggle={() => {}}
          onShowNodes={handleShowNodes}
        />
      </aside>

      {/* Graph Explorer - EVIDENCE LAYER */}
      <main className="graph-evidence-layer">
        <GraphExplorer 
          selectedNodes={selectedNodes}
          onNodeSelect={setSelectedNodes}
          mode="discovery"
          highlightedNodes={highlightedNodes}
        />
        
        {highlightedNodes.length > 0 && (
          <div className="ai-context-overlay">
            <span className="context-badge">AI is highlighting {highlightedNodes.length} nodes</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoveryMode;
