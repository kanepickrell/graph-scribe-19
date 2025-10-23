import { ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterBarProps {
  expanded: boolean;
  onToggle: () => void;
}

const FilterBar = ({ expanded, onToggle }: FilterBarProps) => {
  return (
    <div className={`neo-card transition-all duration-300 ${expanded ? "h-auto" : "h-14"} overflow-hidden`}>
      {/* Header */}
      <div 
        className="p-3 border-b-[3px] border-border bg-secondary/30 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="font-bold text-sm">FILTERS</h3>
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Process Phase */}
          <div>
            <label className="text-xs font-bold mb-2 block">Process Phase:</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <span className="text-sm">Planning</span>
              </label>
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <span className="text-sm">Development</span>
              </label>
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <span className="text-sm">Execution</span>
              </label>
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="text-xs font-bold mb-2 block">Team:</label>
            <div className="flex gap-2">
              <select className="neo-input py-2 text-sm">
                <option>All Teams</option>
                <option>Blue Team</option>
                <option>Red Team</option>
                <option>Automation Team</option>
              </select>
              <button className="neo-button-secondary">+ Add Team</button>
            </div>
          </div>

          {/* Node Type */}
          <div>
            <label className="text-xs font-bold mb-2 block">Node Type:</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <div className="w-3 h-3 rounded-full bg-node-process" />
                <span className="text-sm">Process</span>
              </label>
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <div className="w-3 h-3 rounded-full bg-node-step" />
                <span className="text-sm">Step</span>
              </label>
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <div className="w-3 h-3 rounded-full bg-node-artifact" />
                <span className="text-sm">Artifact</span>
              </label>
              <label className="flex items-center gap-2 neo-button-secondary cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-border rounded" defaultChecked />
                <div className="w-3 h-3 rounded-full bg-node-ttp" />
                <span className="text-sm">TTP</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-bold mb-2 block">Date Range:</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="neo-input py-2 text-sm flex-1"
                placeholder="Start date"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                className="neo-input py-2 text-sm flex-1"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Search Depth */}
          <div>
            <label className="text-xs font-bold mb-2 block">Search Depth:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, "All"].map((depth) => (
                <button
                  key={depth}
                  className="neo-button-secondary px-4 py-2 text-sm"
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button className="neo-button-secondary flex items-center gap-2 text-sm">
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
            <button className="neo-button text-sm ml-auto">
              Apply Filters
            </button>
            <button className="neo-button-secondary text-sm">
              Save Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
