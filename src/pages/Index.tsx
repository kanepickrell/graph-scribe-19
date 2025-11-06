import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import GraphExplorer from "@/components/GraphExplorer";
import LeftSidebar from "@/components/Leftsidebar";
import ChatAssistant from "@/components/ChatAssistant";
import GemDrawer from "@/components/GemDrawer";
import GemSaveModal, { SavedGem } from "@/components/GemSaveModal";

const Index = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [explorerMode, setExplorerMode] = useState<"mining" | "discovery">("discovery");
  const [filterBarExpanded, setFilterBarExpanded] = useState(false);
  const [gems, setGems] = useState<SavedGem[]>([]);
  const [gemModalOpen, setGemModalOpen] = useState(false);
  const [selectedNodeForGem, setSelectedNodeForGem] = useState<any>(null);
  const [selectedNodesForProspect, setSelectedNodesForProspect] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<"gem" | "prospect">("gem");
  const [activeTab, setActiveTab] = useState<"assistant" | "integrations" | "gems">("assistant");

  useEffect(() => {
    const savedMode = localStorage.getItem("graph-explorer-mode") as "mining" | "discovery";
    if (savedMode) setExplorerMode(savedMode);

    // Load saved gems from localStorage
    const savedGems = localStorage.getItem("hidden-gems");
    if (savedGems) {
      try {
        const parsed = JSON.parse(savedGems);
        const gemsWithDates = parsed.map((g: any) => ({
          ...g,
          capturedAt: new Date(g.capturedAt),
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
    localStorage.setItem("hidden-gems", JSON.stringify(gems));
  }, [gems]);

  const handleCaptureGem = (nodeData: any) => {
    setSelectedNodeForGem(nodeData);
    setSelectedNodesForProspect([]);
    setModalMode("gem");
    setGemModalOpen(true);
  };

  const handleCaptureProspect = (nodesData: any[]) => {
    setSelectedNodesForProspect(nodesData);
    setSelectedNodeForGem(null);
    setModalMode("prospect");
    setGemModalOpen(true);
  };

  const handleSaveGem = (gem: SavedGem) => {
    setGems((prev) => [...prev, gem]);
    const icon = gem.type === "prospect" ? "⛏️" : "💎";
    const title =
      gem.type === "prospect"
        ? `Saved "${gem.label}" to Prospects!`
        : `Saved "${gem.label}" to Hidden Gems!`;
    toast.success(`${icon} ${title}`, {
      description:
        gem.type === "prospect"
          ? `${gem.nodeCount} nodes captured for further investigation`
          : "View it in the Saved Gems tab",
    });
  };

  const handleDeleteGem = (gemId: string) => {
    const gem = gems.find((g) => g.id === gemId);
    setGems((prev) => prev.filter((g) => g.id !== gemId));
    const type = gem?.type === "prospect" ? "Prospect" : "Gem";
    toast.info(`${type} removed from collection`);
  };

  const handleViewNodeFromGem = (nodeId: string) => {
    setSelectedNodes([nodeId]);
    setExplorerMode("discovery");
  };

  const handleExportGems = () => {
    const dataStr = JSON.stringify(gems, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `protograph-gems-${new Date().toISOString().split("T")[0]}.json`;
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
        {/* Left Column – Graph Explorer */}
        <div className="flex-[2] flex flex-col overflow-hidden rounded-xl">
          <GraphExplorer
            selectedNodes={selectedNodes}
            onNodeSelect={setSelectedNodes}
            mode={explorerMode}
            onModeChange={setExplorerMode}
            onCaptureGem={handleCaptureGem}
          />
        </div>

        {/* Right Column – Tabbed Assistant/Gems/Integrations */}
        <div className="flex-[1] flex flex-col overflow-hidden rounded-xl bg-card border border-border">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 text-sm font-semibold">
            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex-1 py-3 border-b-2 ${activeTab === "assistant"
                  ? "border-accent-pink text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💬</span> AI Assistant
              </span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex-1 py-3 border-b-2 ${activeTab === "integrations"
                  ? "border-accent-teal text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔗</span> Integrations
              </span>
            </button>

            <button
              onClick={() => setActiveTab("gems")}
              className={`flex-1 py-3 border-b-2 relative ${activeTab === "gems"
                  ? "border-accent-pink text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💎</span> Saved Gems
              </span>
              {gems.length > 0 && (
                <span className="absolute right-3 top-2 w-5 h-5 bg-accent-pink text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-border">
                  {gems.length}
                </span>
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "assistant" && (
              <ChatAssistant
                selectedNodes={selectedNodes}
                onShowNodes={setSelectedNodes}
                onToggle={() => { }}
                expanded={true}
              />
            )}

            {activeTab === "integrations" && (
              <div className="neo-card h-full flex items-center justify-center text-sm text-muted-foreground">
                <p>🔧 Integration analytics and data connectors coming soon...</p>
              </div>
            )}

            {activeTab === "gems" && (
              <GemDrawer
                gems={gems}
                onDeleteGem={handleDeleteGem}
                onViewNode={handleViewNodeFromGem}
                onExportGems={handleExportGems}
                onClearAll={handleClearAllGems}
              />
            )}
          </div>
        </div>
      </main>

      {/* Gem Save Modal */}
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
