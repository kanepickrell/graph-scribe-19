import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, ChevronUp, ChevronDown, Download, Trash2, X, Pickaxe, Filter } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  if (gems.length === 0) return null;

  return (
    <>
      {/* Collapsed State - Bottom Bar */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-4"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="neo-card px-6 py-3 bg-card hover:bg-accent-pink/10 transition-all shadow-2xl pointer-events-auto group border-2 border-accent-pink/40"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Gem className="w-5 h-5 text-accent-pink animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-pink text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-border text-foreground">
                    {gems.length}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {hiddenGems.length} Gems • {prospects.length} Prospects
                </span>
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-accent-pink transition-colors" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded State - Full Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 neo-card bg-card border-t-4 border-accent-pink shadow-2xl"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-border bg-muted/30 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Gem className="w-5 h-5 text-accent-pink" />
                  <div>
                    <h3 className="text-lg font-extrabold">Saved Findings</h3>
                    <p className="text-xs text-muted-foreground">
                      {gems.length} {gems.length === 1 ? "item" : "items"} captured
                    </p>
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

              <div className="flex items-center gap-2">
                <Button
                  onClick={onExportGems}
                  size="sm"
                  variant="outline"
                  className="text-xs gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <Button
                  onClick={onClearAll}
                  size="sm"
                  variant="outline"
                  className="text-xs gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </Button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable Grid */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)" }}>
              {filteredGems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                    <div className="neo-card p-2 text-center bg-secondary/30">
                      <div className="text-lg font-bold">
                        {Math.round(filteredGems.reduce((sum, g) => sum + g.importance, 0) / filteredGems.length * 100)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">Avg Importance</div>
                    </div>
                    <div className="neo-card p-2 text-center bg-secondary/30">
                      <div className="text-lg font-bold">
                        {new Set(filteredGems.flatMap(g => g.tags)).size}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Unique Tags</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GemDrawer;