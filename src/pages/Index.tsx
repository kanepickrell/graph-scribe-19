import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import GraphExplorer from "@/components/GraphExplorer";
import LeftSidebar from "@/components/Leftsidebar";
import NodeAnalyticsBar from "@/components/Nodeanalyticsbar";
import GemSaveModal, { SavedGem } from "@/components/GemSaveModal";
import { mockGraphData } from "@/lib/mockGraphData";

const Index = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [explorerMode, setExplorerMode] = useState<"mining" | "discovery">("discovery");
  const [filterBarExpanded, setFilterBarExpanded] = useState(false);
  const [gems, setGems] = useState<SavedGem[]>([]);
  const [gemModalOpen, setGemModalOpen] = useState(false);
  const [selectedNodeForGem, setSelectedNodeForGem] = useState<any>(null);
  const [selectedNodesForProspect, setSelectedNodesForProspect] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<"gem" | "prospect">("gem");

  useEffect(() => {
    const savedMode = localStorage.getItem("graph-explorer-mode") as "mining" | "discovery";
    if (savedMode) setExplorerMode(savedMode);

    // Load saved gems from localStorage
    const savedGems = localStorage.getItem("hidden-gems");
    if (savedGems) {
      try {
        const parsed = JSON.parse(savedGems);
        // Convert capturedAt strings back to Date objects
        const gemsWithDates = parsed.map((g: any) => ({
          ...g,
          capturedAt: new Date(g.capturedAt)
        }));
        setGems(gemsWithDates);
      } catch (e) {
        console.error("Failed to load gems:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("graph-explorer-mode", explorerMode);
    setFilterBarExpanded(explorerMode === "mining");
  }, [explorerMode]);

  // Persist gems to localStorage whenever they change
  useEffect(() => {
    if (gems.length > 0) {
      localStorage.setItem("hidden-gems", JSON.stringify(gems));
    }
  }, [gems]);

  // Handle single gem capture (Discovery Mode)
  const handleCaptureGem = (nodeData: any) => {
    console.log("💎 handleCaptureGem called with:", nodeData);
    setSelectedNodeForGem(nodeData);
    setSelectedNodesForProspect([]);
    setModalMode("gem");
    setGemModalOpen(true);
  };

  // NEW: Handle prospect capture (Mining Mode - multi-node)
  const handleCaptureProspect = (nodesData: any[]) => {
    console.log("⛏️ handleCaptureProspect called with:", nodesData);
    setSelectedNodesForProspect(nodesData);
    setSelectedNodeForGem(null);
    setModalMode("prospect");
    setGemModalOpen(true);
  };

  const handleSaveGem = (gem: SavedGem) => {
    console.log(`${gem.type === 'prospect' ? '⛏️' : '💎'} Saving:`, gem);
    setGems((prev) => [...prev, gem]);

    const icon = gem.type === "prospect" ? "⛏️" : "💎";
    const title = gem.type === "prospect"
      ? `Saved "${gem.label}" to Prospects!`
      : `Saved "${gem.label}" to Hidden Gems!`;

    toast.success(`${icon} ${title}`, {
      description: gem.type === "prospect"
        ? `${gem.nodeCount} nodes captured for further investigation`
        : "View it in the Saved Gems tab",
    });
  };

  const handleDeleteGem = (gemId: string) => {
    const gem = gems.find(g => g.id === gemId);
    setGems((prev) => prev.filter((g) => g.id !== gemId));

    const type = gem?.type === "prospect" ? "Prospect" : "Gem";
    toast.info(`${type} removed from collection`);
  };

  const handleViewNodeFromGem = (nodeId: string) => {
    setSelectedNodes([nodeId]);
    setExplorerMode("discovery");
  };

  const handleNodeClick = (nodeId: string) => {
    // Focus on single node when clicked
    setSelectedNodes([nodeId]);
  };

  // Handle exporting gems/prospects
  const handleExportGems = () => {
    const dataStr = JSON.stringify(gems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protograph-gems-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("💎 Gems exported successfully!");
  };

  const handleClearAllGems = () => {
    if (confirm(`Are you sure you want to delete all ${gems.length} saved items?`)) {
      setGems([]);
      localStorage.removeItem("hidden-gems");
      toast.info("All gems and prospects cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onDiscoveryPromptClick={(prompt) => {
          setExplorerMode("discovery");
          console.log("Discovery prompt:", prompt);
        }}
      />

      <main className="flex-1 flex h-[calc(100vh-4rem)] p-4 gap-4 overflow-hidden">
        {/* Left Sidebar - Tabbed Interface */}
        <LeftSidebar
          selectedNodes={selectedNodes}
          onShowNodes={(nodeIds) => {
            setSelectedNodes(nodeIds);
            setExplorerMode("discovery");
          }}
          gems={gems}
          onDeleteGem={handleDeleteGem}
          onViewNode={handleViewNodeFromGem}
        />

        {/* Graph Explorer Area */}
        <div className="flex-1 flex flex-col min-h-0 max-h-full overflow-hidden">
          {/* Node Analytics Bar - Horizontal, above graph */}
          {selectedNodes.length > 0 && (
            <div className="flex-shrink-0">
              {/* <NodeAnalyticsBar
                selectedNodes={selectedNodes}
                data={mockGraphData}
                onNodeClick={handleNodeClick}
                onClose={() => setSelectedNodes([])}
              /> */}
            </div>
          )}

          {/* Graph Explorer - Takes remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <GraphExplorer
              selectedNodes={selectedNodes}
              onNodeSelect={setSelectedNodes}
              mode={explorerMode}
              onModeChange={setExplorerMode}
              onCaptureGem={handleCaptureGem}
              onCaptureProspect={handleCaptureProspect}
            />
          </div>
        </div>
      </main>

      {/* Gem/Prospect Save Modal */}
      <GemSaveModal
        open={gemModalOpen}
        onClose={() => {
          setGemModalOpen(false);
          setSelectedNodeForGem(null);
          setSelectedNodesForProspect([]);
        }}
        node={selectedNodeForGem}
        nodes={selectedNodesForProspect}
        mode={modalMode}
        onSave={handleSaveGem}
      />
    </div>
  );
};

export default Index;