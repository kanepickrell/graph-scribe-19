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
      <Header />
      
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Graph Area */}
          <div className="flex-1 min-w-0">
            <GraphExplorer 
              selectedNodes={selectedNodes}
              onNodeSelect={setSelectedNodes}
            />
          </div>

          {/* Right Sidebar - Analytics + Chat */}
          <div className="w-[380px] flex flex-col gap-4 min-h-0">
            <AnalyticsPanel 
              selectedNodes={selectedNodes}
              expanded={analyticsExpanded}
              onToggle={() => setAnalyticsExpanded(!analyticsExpanded)}
            />
            
            <ChatAssistant 
              selectedNodes={selectedNodes}
              expanded={chatExpanded}
              onToggle={() => setChatExpanded(!chatExpanded)}
            />
          </div>
        </div>

        {/* Bottom Filter Bar */}
        <FilterBar 
          expanded={filterBarExpanded}
          onToggle={() => setFilterBarExpanded(!filterBarExpanded)}
        />
      </main>
    </div>
  );
};

export default Index;
