import { BarChart3, Brain, Plug, FlaskConical, Rocket } from "lucide-react";
import AnalyzePanel from "./toolkit/AnalyzePanel";
import TrainPanel from "./toolkit/TrainPanel";
import PluginPanel from "./toolkit/PluginPanel";

interface EngineeringToolkitProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedNodes: string[];
}

const EngineeringToolkit = ({ activeTab, onTabChange, selectedNodes }: EngineeringToolkitProps) => {
  return (
    <footer className="engineering-toolkit">
      <div className="toolkit-tabs">
        <button 
          className={`toolkit-tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => onTabChange('analyze')}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analyze</span>
        </button>
        <button 
          className={`toolkit-tab ${activeTab === 'train' ? 'active' : ''}`}
          onClick={() => onTabChange('train')}
        >
          <Brain className="w-4 h-4" />
          <span>Train</span>
        </button>
        <button 
          className={`toolkit-tab ${activeTab === 'plugin' ? 'active' : ''}`}
          onClick={() => onTabChange('plugin')}
        >
          <Plug className="w-4 h-4" />
          <span>Plugin</span>
        </button>
        <button 
          className={`toolkit-tab ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => onTabChange('test')}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Test</span>
        </button>
        <button 
          className={`toolkit-tab ${activeTab === 'deploy' ? 'active' : ''}`}
          onClick={() => onTabChange('deploy')}
        >
          <Rocket className="w-4 h-4" />
          <span>Deploy</span>
        </button>
      </div>

      <div className="toolkit-content">
        {activeTab === 'analyze' && <AnalyzePanel selectedNodes={selectedNodes} />}
        {activeTab === 'train' && <TrainPanel selectedNodes={selectedNodes} />}
        {activeTab === 'plugin' && <PluginPanel selectedNodes={selectedNodes} />}
        {activeTab === 'test' && (
          <div className="empty-panel">
            <p>Test panel coming soon</p>
          </div>
        )}
        {activeTab === 'deploy' && (
          <div className="empty-panel">
            <p>Deploy panel coming soon</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default EngineeringToolkit;
