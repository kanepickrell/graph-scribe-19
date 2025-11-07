import { useState } from "react";
import { Gem, Download, Trash2, Pickaxe, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import GemCard from "./GemCard";
import { SavedGem } from "./GemSaveModal";

interface GemDrawerProps {
  gems: SavedGem[];
  onDeleteGem: (gemId: string) => void;
  onViewNode: (nodeId: string) => void;
  onExportGems: () => void;
  onClearAll: () => void;
}

const GemDrawer: React.FC<GemDrawerProps> = ({
  gems,
  onDeleteGem,
  onViewNode,
  onExportGems,
  onClearAll
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "gems" | "prospects">("all");

  // Separate gems and prospects
  const hiddenGems = gems.filter(g => g.type === "gem" || !g.type);
  const prospects = gems.filter(g => g.type === "prospect");

  // Filter based on active tab
  const filteredGems = activeTab === "all"
    ? gems
    : activeTab === "gems"
      ? hiddenGems
      : prospects;

  if (gems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Gem className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-bold mb-2">No Gems Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click on nodes in the graph and select "Save as Gem" to start your collection
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Actions */}
      <div className="flex-shrink-0 p-4 border-b-[3px] border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-extrabold">Saved Findings</h3>
            <p className="text-xs text-muted-foreground">
              {gems.length} {gems.length === 1 ? "item" : "items"} captured
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onExportGems}
              size="sm"
              variant="outline"
              className="text-xs gap-2 h-7"
            >
              <Download className="w-3 h-3" />
              Export
            </Button>
            <Button
              onClick={onClearAll}
              size="sm"
              variant="outline"
              className="text-xs gap-2 text-destructive hover:text-destructive h-7"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 neo-card p-1 bg-secondary/30">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${activeTab === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All ({gems.length})
          </button>
          <button
            onClick={() => setActiveTab("gems")}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${activeTab === "gems"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Gem className="w-3 h-3" />
            Gems ({hiddenGems.length})
          </button>
          <button
            onClick={() => setActiveTab("prospects")}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${activeTab === "prospects"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Pickaxe className="w-3 h-3" />
            Prospects ({prospects.length})
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredGems.length > 0 ? (
          <div className="space-y-3">
            {filteredGems.map((gem) => (
              <GemCard
                key={gem.id}
                gem={gem}
                onDelete={onDeleteGem}
                onView={onViewNode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {activeTab === "gems" ? (
              <>
                <Gem className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No gems captured yet</p>
                <p className="text-xs mt-1">Use Discovery Mode to save validated insights</p>
              </>
            ) : activeTab === "prospects" ? (
              <>
                <Pickaxe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No prospects captured yet</p>
                <p className="text-xs mt-1">Use Prospecting Mode to save multi-node patterns</p>
              </>
            ) : (
              <>
                <Gem className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No items captured yet</p>
                <p className="text-xs mt-1">Select nodes and click save buttons to capture findings</p>
              </>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {filteredGems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2">
              <div className="neo-card p-2 text-center bg-secondary/30">
                <div className="text-lg font-bold">{filteredGems.length}</div>
                <div className="text-[10px] text-muted-foreground">
                  {activeTab === "all" ? "Total Items" : activeTab === "gems" ? "Hidden Gems" : "Prospects"}
                </div>
              </div>
              <div className="neo-card p-2 text-center bg-secondary/30">
                <div className="text-lg font-bold">
                  {filteredGems.reduce((sum, g) => sum + (g.nodeIds?.length || 1), 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">Total Nodes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GemDrawer;