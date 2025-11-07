import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import GraphExplorer from "@/components/GraphExplorer";
import ChatAssistant from "@/components/ChatAssistant";
import GemDrawer from "@/components/GemDrawer";
import GemSaveModal, { SavedGem } from "@/components/GemSaveModal";
import Integrations from "@/components/Integrations";

const Index = () => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [explorerMode, setExplorerMode] = useState<"mining" | "discovery">("discovery");
  const [gems, setGems] = useState<SavedGem[]>([]);
  const [gemModalOpen, setGemModalOpen] = useState(false);
  const [selectedNodeForGem, setSelectedNodeForGem] = useState<any>(null);
  const [selectedNodesForProspect, setSelectedNodesForProspect] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<"gem" | "prospect">("gem");
  const [activeTab, setActiveTab] = useState<"assistant" | "integrations" | "gems">("assistant");

  useEffect(() => {
    const savedMode = localStorage.getItem("graph-explorer-mode") as "mining" | "discovery";
    if (savedMode) setExplorerMode(savedMode);

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
  }, [explorerMode]);

  useEffect(() => {
    localStorage.setItem("hidden-gems", JSON.stringify(gems));
  }, [gems]);

  const handleCaptureGem = (nodeData: any) => {
    setSelectedNodeForGem(nodeData);
    setSelectedNodesForProspect([]);
    setModalMode("gem");
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0">
        <Header
          onDiscoveryPromptClick={(prompt) => {
            setExplorerMode("discovery");
            console.log("Discovery prompt:", prompt);
          }}
        />
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Graph Explorer - Takes remaining width */}
        <div className="flex-1 min-w-0 p-4">
          <GraphExplorer
            selectedNodes={selectedNodes}
            onNodeSelect={setSelectedNodes}
            mode={explorerMode}
            onModeChange={setExplorerMode}
            onCaptureGem={handleCaptureGem}
          />
        </div>

        {/* Right Sidebar - Fixed 420px, full height */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-l-4 border-border bg-card h-full">
          {/* Tab Header - Fixed */}
          <div className="flex-shrink-0 flex items-center border-b-3 border-border bg-muted/30">
            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === "assistant"
                  ? "bg-card border-b-4 border-accent-pink text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💬</span> Chat
              </span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === "integrations"
                  ? "bg-card border-b-4 border-accent-teal text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔗</span> Tools
              </span>
            </button>

            <button
              onClick={() => setActiveTab("gems")}
              className={`flex-1 py-3 text-sm font-semibold transition-all relative ${activeTab === "gems"
                  ? "bg-card border-b-4 border-accent-pink text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💎</span> Gems
              </span>
              {gems.length > 0 && (
                <span className="absolute right-2 top-1.5 w-5 h-5 bg-accent-pink text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-border">
                  {gems.length}
                </span>
              )}
            </button>
          </div>

          {/* Content Area - Scrollable, takes remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "assistant" && (
              <div className="h-full">
                <ChatAssistant
                  selectedNodes={selectedNodes}
                  onShowNodes={setSelectedNodes}
                  onToggle={() => { }}
                  expanded={true}
                />
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="h-full overflow-y-auto p-4">
                <Integrations />
              </div>
            )}

            {activeTab === "gems" && (
              <div className="h-full overflow-hidden">
                <GemDrawer
                  gems={gems}
                  onDeleteGem={handleDeleteGem}
                  onViewNode={handleViewNodeFromGem}
                  onExportGems={handleExportGems}
                  onClearAll={handleClearAllGems}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
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