import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gem, Tag, FileText, Pickaxe, Layers, GitBranch } from "lucide-react";

interface GemSaveModalProps {
  open: boolean;
  onClose: () => void;
  node: any | null;
  nodes?: any[] | null; // NEW: Support multiple nodes for prospects
  onSave: (gem: SavedGem) => void;
  mode?: "gem" | "prospect"; // NEW: Distinguish between single gem and prospect
}

export interface SavedGem {
  id: string;
  nodeIds: string[]; // Changed from nodeId to support multiple
  label: string;
  type: "gem" | "prospect"; // NEW: Type distinction
  cluster: string;
  tags: string[];
  notes: string;
  capturedAt: Date;
  importance: number;
  // NEW: Prospect-specific fields
  expansionDepth?: number;
  edgeCount?: number;
  prospectType?: "hotspot" | "pattern" | "anomaly" | "multi-cluster";
  nodeCount?: number;
}

const GemSaveModal: React.FC<GemSaveModalProps> = ({
  open,
  onClose,
  node,
  nodes,
  onSave,
  mode = "gem"
}) => {
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [prospectType, setProspectType] = useState<"hotspot" | "pattern" | "anomaly" | "multi-cluster">("pattern");

  const isProspect = mode === "prospect" || (nodes && nodes.length > 1);
  const dataNodes = isProspect ? (nodes || []) : (node ? [node] : []);

  // Calculate prospect metadata
  const nodeCount = dataNodes.length;
  const clusters = [...new Set(dataNodes.map((n: any) => n.data?.cluster || n.cluster))];
  const avgImportance = dataNodes.reduce((sum: number, n: any) => {
    const imp = n.data?.importance || n.importance || 0;
    return sum + imp;
  }, 0) / (nodeCount || 1);

  const handleSave = () => {
    if (dataNodes.length === 0) return;

    // Generate a smart label
    let autoLabel = "";
    if (isProspect) {
      if (clusters.length > 1) {
        autoLabel = `${clusters.length}-Cluster Pattern (${nodeCount} nodes)`;
      } else {
        autoLabel = `${clusters[0]} ${prospectType} (${nodeCount} nodes)`;
      }
    } else {
      autoLabel = dataNodes[0].data?.label || dataNodes[0].label || dataNodes[0].id;
    }

    const gem: SavedGem = {
      id: `${isProspect ? 'prospect' : 'gem'}_${Date.now()}`,
      nodeIds: dataNodes.map((n: any) => n.id),
      label: autoLabel,
      type: isProspect ? "prospect" : "gem",
      cluster: clusters.join(", "),
      tags: tags.split(",").map(t => t.trim()).filter(t => t.length > 0),
      notes: notes.trim(),
      capturedAt: new Date(),
      importance: avgImportance,
      // Prospect-specific
      ...(isProspect && {
        nodeCount,
        expansionDepth: 3, // Would come from actual graph state
        edgeCount: nodeCount * 2, // Estimated, would be calculated from actual edges
        prospectType: clusters.length > 1 ? "multi-cluster" : prospectType
      })
    };

    onSave(gem);

    // Reset form
    setTags("");
    setNotes("");
    setProspectType("pattern");
    onClose();
  };

  if (dataNodes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="neo-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProspect ? (
              <>
                <Pickaxe className="w-5 h-5 text-accent-pink" />
                Save as Prospect
              </>
            ) : (
              <>
                <Gem className="w-5 h-5 text-accent-pink" />
                Save as Hidden Gem
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview Section */}
          <div className="neo-card p-3 bg-secondary/30">
            {isProspect ? (
              // Multi-node prospect preview
              <>
                <div className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-pink" />
                  {nodeCount} Nodes Selected
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <strong>Clusters:</strong>
                    <span>{clusters.length} ({clusters.join(", ")})</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Avg Importance:</strong>
                    <span>{Math.round(avgImportance * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Pattern Type:</strong>
                    <span className="capitalize">{clusters.length > 1 ? "Multi-cluster" : prospectType}</span>
                  </div>
                </div>

                {/* Node List Preview */}
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="text-[10px] font-bold text-muted-foreground mb-1">INCLUDED NODES:</div>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto">
                    {dataNodes.slice(0, 5).map((n: any, idx: number) => (
                      <div key={idx} className="text-[10px] flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: n.data?.cluster === 'automation' ? '#d12727ff'
                              : n.data?.cluster === 'range' ? '#1943b4ff'
                                : n.data?.cluster === 'opfor' ? '#33ee42ff'
                                  : '#ed50d3ff'
                          }}
                        />
                        <span className="truncate">{n.data?.label || n.label || n.id}</span>
                      </div>
                    ))}
                    {dataNodes.length > 5 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dataNodes.length - 5} more nodes...
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Single node gem preview
              <>
                <div className="text-sm font-bold mb-1">{dataNodes[0].data?.label || dataNodes[0].id}</div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div><strong>Type:</strong> {dataNodes[0].data?.type || dataNodes[0].type}</div>
                  <div><strong>Cluster:</strong> {dataNodes[0].data?.cluster || dataNodes[0].cluster}</div>
                  <div><strong>Importance:</strong> {Math.round((dataNodes[0].data?.importance || dataNodes[0].importance || 0) * 100)}%</div>
                </div>
              </>
            )}
          </div>

          {/* Prospect Type Selector (only for prospects) */}
          {isProspect && clusters.length === 1 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-2">
                <GitBranch className="w-3 h-3" />
                Pattern Type
              </label>
              <select
                value={prospectType}
                onChange={(e) => setProspectType(e.target.value as any)}
                className="w-full neo-button-secondary text-sm px-3 py-2"
              >
                <option value="pattern">Recurring Pattern</option>
                <option value="hotspot">Failure Hotspot</option>
                <option value="anomaly">Anomaly / Outlier</option>
              </select>
            </div>
          )}

          {/* Tags Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-2">
              <Tag className="w-3 h-3" />
              Tags (comma separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={isProspect ? "cross-cluster, dependency, needs-investigation" : "automation, failure, high-priority"}
              className="text-sm"
            />
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-2">
              <FileText className="w-3 h-3" />
              {isProspect ? "Why is this pattern interesting?" : "Why is this node interesting?"}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isProspect
                ? "Describe the pattern, potential impact, or why it needs further investigation..."
                : "Describe why this node is worth remembering..."}
              className="text-sm min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="neo-button">
            {isProspect ? (
              <>
                <Pickaxe className="w-4 h-4 mr-2" />
                Save Prospect
              </>
            ) : (
              <>
                <Gem className="w-4 h-4 mr-2" />
                Save Gem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GemSaveModal;