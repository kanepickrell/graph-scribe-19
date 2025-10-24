import { Square, Circle, Search, BarChart3, Maximize2 } from "lucide-react";

interface EngineeringToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  colorBy: string;
  onColorByChange: (value: string) => void;
  sizeBy: string;
  onSizeByChange: (value: string) => void;
}

const EngineeringToolbar = ({ 
  activeTool, 
  onToolChange, 
  colorBy, 
  onColorByChange,
  sizeBy,
  onSizeByChange 
}: EngineeringToolbarProps) => {
  return (
    <header className="engineering-toolbar">
      <div className="tool-group">
        <button 
          className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
          onClick={() => onToolChange('select')}
          title="Select"
        >
          <Square className="w-4 h-4" />
        </button>
        <button 
          className={`tool-btn ${activeTool === 'box' ? 'active' : ''}`}
          onClick={() => onToolChange('box')}
          title="Box Select"
        >
          <Square className="w-4 h-4" />
          <span className="tool-label">Box</span>
        </button>
        <button 
          className={`tool-btn ${activeTool === 'radius' ? 'active' : ''}`}
          onClick={() => onToolChange('radius')}
          title="Radius Select"
        >
          <Circle className="w-4 h-4" />
          <span className="tool-label">Radius</span>
        </button>
        <button 
          className={`tool-btn ${activeTool === 'search' ? 'active' : ''}`}
          onClick={() => onToolChange('search')}
          title="Search"
        >
          <Search className="w-4 h-4" />
          <span className="tool-label">Search</span>
        </button>
        <button 
          className={`tool-btn ${activeTool === 'cluster' ? 'active' : ''}`}
          onClick={() => onToolChange('cluster')}
          title="Cluster Analysis"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="tool-label">Cluster</span>
        </button>
      </div>

      <div className="view-controls">
        <select 
          value={colorBy} 
          onChange={e => onColorByChange(e.target.value)}
          className="view-select"
        >
          <option value="type">Color by: Type</option>
          <option value="quality">Color by: Quality</option>
          <option value="recency">Color by: Recency</option>
          <option value="phase">Color by: Phase</option>
        </select>

        <select 
          value={sizeBy} 
          onChange={e => onSizeByChange(e.target.value)}
          className="view-select"
        >
          <option value="fixed">Size by: Fixed</option>
          <option value="volume">Size by: Data Volume</option>
          <option value="connections">Size by: Connections</option>
        </select>
      </div>

      <button className="fullscreen-btn">
        <Maximize2 className="w-4 h-4" />
        <span>Fullscreen</span>
      </button>
    </header>
  );
};

export default EngineeringToolbar;
