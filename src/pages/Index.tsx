import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GraphExplorer from "@/components/GraphExplorer";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import ChatAssistant from "@/components/ChatAssistant";
import FilterBar from "@/components/FilterBar";

const Index = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [explorerMode, setExplorerMode] = useState<'mining' | 'discovery'>('discovery');

  // Panel expansion states - controlled by mode
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(true);
  const [filterBarExpanded, setFilterBarExpanded] = useState(false);

  // Load saved mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem('graph-explorer-mode') as 'mining' | 'discovery';
    if (savedMode) {
      setExplorerMode(savedMode);
    }
  }, []);

  // Save mode preference and adjust panel states
  useEffect(() => {
    localStorage.setItem('graph-explorer-mode', explorerMode);

    if (explorerMode === 'discovery') {
      // Discovery mode: minimize filters
      setFilterBarExpanded(false);
    } else {
      // Mining mode: expand filters
      setFilterBarExpanded(true);
    }
  }, [explorerMode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onDiscoveryPromptClick={(prompt) => {
        // Handle discovery prompt clicks - switch to discovery mode
        setExplorerMode('discovery');
        console.log("Discovery prompt:", prompt);
      }} />

      <main className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Left Sidebar - AI Assistant */}
        <div className="w-[420px] flex flex-col gap-4 min-h-0">
          <ChatAssistant
            selectedNodes={selectedNodes}
            expanded={chatExpanded}
            onToggle={() => setChatExpanded(!chatExpanded)}
            onShowNodes={(nodeIds) => {
              setSelectedNodes(nodeIds);
              // Auto-switch to discovery mode when AI suggests nodes
              setExplorerMode('discovery');
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Graph Explorer with Mode Control */}
          <div className="flex-1 min-w-0">
            <GraphExplorer
              selectedNodes={selectedNodes}
              onNodeSelect={setSelectedNodes}
              mode={explorerMode}
              onModeChange={setExplorerMode}
            />
          </div>

          {/* Bottom Filter Bar - Expanded in Mining Mode */}
          {/* <FilterBar
            expanded={filterBarExpanded}
            onToggle={() => setFilterBarExpanded(!filterBarExpanded)}
          /> */}
        </div>

        {/* Right Sidebar - Analytics */}
        <div className="w-[380px] flex flex-col gap-4 min-h-0">
          <AnalyticsPanel
            selectedNodes={selectedNodes}
            expanded={analyticsExpanded}
            onToggle={() => setAnalyticsExpanded(!analyticsExpanded)}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;