import { useState } from "react";
import { PlayCircle, Code } from "lucide-react";

interface PluginPanelProps {
  selectedNodes: string[];
}

const DEFAULT_TEMPLATE = `# Process selected nodes
for node in nodes:
    # Access node data
    data = node.get_data()
    
    # Your processing logic here
    processed = transform(data)
    
    # Return new dataset
    return processed`;

const PluginPanel = ({ selectedNodes }: PluginPanelProps) => {
  const [scriptType, setScriptType] = useState('python');
  const [code, setCode] = useState(DEFAULT_TEMPLATE);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);

  const runScript = () => {
    setRunning(true);
    // Mock script execution
    setTimeout(() => {
      setOutput({
        success: true,
        message: "Script executed successfully",
        newNode: {
          id: "derived_123",
          label: "c2_parsed_commands",
          records: 1234
        }
      });
      setRunning(false);
    }, 2000);
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="empty-panel">
        <p>Select nodes to run custom scripts</p>
      </div>
    );
  }

  return (
    <div className="plugin-panel">
      <div className="panel-header-toolkit">
        <h3>Run Script on Selection</h3>
        <select 
          value={scriptType} 
          onChange={e => setScriptType(e.target.value)}
          className="form-select-toolkit"
        >
          <option value="python">Python</option>
          <option value="sql">SQL Query</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div className="code-editor-wrapper">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          className="code-editor"
          spellCheck={false}
        />
      </div>

      <div className="script-info">
        <p><strong>Input:</strong> {selectedNodes.length} selected nodes</p>
        <p><strong>Output:</strong> New dataset (will appear as new node)</p>
      </div>

      <div className="panel-actions">
        <button className="btn-toolkit-secondary">
          <Code className="w-4 h-4" />
          <span>Load Template</span>
        </button>
        <button className="btn-toolkit-secondary">Save Script</button>
        <button 
          className="btn-toolkit-primary"
          onClick={runScript}
          disabled={running}
        >
          <PlayCircle className="w-4 h-4" />
          <span>{running ? 'Running...' : 'Run Script'}</span>
        </button>
      </div>

      {output && (
        <div className="output-panel">
          <h4>Output</h4>
          <div className="output-success">
            <p>✅ {output.message}</p>
            <p>Created new node: <strong>{output.newNode.label}</strong> ({output.newNode.records} records)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginPanel;
