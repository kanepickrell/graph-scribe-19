import { useState } from "react";
import Header from "@/components/Header";
import GraphExplorer from "@/components/GraphExplorer";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import ChatAssistant from "@/components/ChatAssistant";
import FilterBar from "@/components/FilterBar";

const Index = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(true);
  const [filterBarExpanded, setFilterBarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onDiscoveryPromptClick={(prompt) => {
        // Handle discovery prompt clicks
        console.log("Discovery prompt:", prompt);
      }} />
      
      <main className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Left Sidebar - AI Assistant (Primary Interface) */}
        <div className="w-[420px] flex flex-col gap-4 min-h-0">
          <ChatAssistant 
            selectedNodes={selectedNodes}
            expanded={chatExpanded}
            onToggle={() => setChatExpanded(!chatExpanded)}
            onShowNodes={(nodeIds) => setSelectedNodes(nodeIds)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Graph Explorer */}
          <div className="flex-1 min-w-0">
            <GraphExplorer 
              selectedNodes={selectedNodes}
              onNodeSelect={setSelectedNodes}
            />
          </div>

          {/* Bottom Filter Bar */}
          <FilterBar 
            expanded={filterBarExpanded}
            onToggle={() => setFilterBarExpanded(!filterBarExpanded)}
          />
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
