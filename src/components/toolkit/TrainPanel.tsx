import { useState } from "react";
import { PlayCircle } from "lucide-react";

interface TrainPanelProps {
  selectedNodes: string[];
}

const TrainPanel = ({ selectedNodes }: TrainPanelProps) => {
  const [modelType, setModelType] = useState('classification');
  const [splitRatio, setSplitRatio] = useState('80/20');
  const [modelName, setModelName] = useState('');
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTraining = () => {
    setTraining(true);
    setProgress(0);
    
    // Mock training progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTraining(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="empty-panel">
        <p>Select data nodes to train a model</p>
      </div>
    );
  }

  return (
    <div className="train-panel">
      {!training ? (
        <>
          <div className="form-group-toolkit">
            <label>Model Type</label>
            <select 
              value={modelType} 
              onChange={e => setModelType(e.target.value)}
              className="form-select-toolkit"
            >
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
              <option value="command-prediction">Command Prediction</option>
              <option value="anomaly-detection">Anomaly Detection</option>
            </select>
          </div>

          <div className="form-group-toolkit">
            <label>Data Split</label>
            <div className="radio-group-toolkit">
              <label className="radio-label">
                <input 
                  type="radio" 
                  value="80/20" 
                  checked={splitRatio === '80/20'}
                  onChange={e => setSplitRatio(e.target.value)}
                />
                <span>80/20 Train/Test</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  value="70/30" 
                  checked={splitRatio === '70/30'}
                  onChange={e => setSplitRatio(e.target.value)}
                />
                <span>70/30 Train/Test</span>
              </label>
            </div>
          </div>

          <div className="form-group-toolkit">
            <label>Model Name</label>
            <input 
              type="text"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              placeholder="e.g., c2_command_predictor_v1"
              className="form-input-toolkit"
            />
          </div>

          <div className="data-summary">
            <p><strong>Training data:</strong> {selectedNodes.length * 234} records</p>
            <p><strong>Training set:</strong> {Math.floor(selectedNodes.length * 234 * 0.8)} (80%)</p>
            <p><strong>Test set:</strong> {Math.floor(selectedNodes.length * 234 * 0.2)} (20%)</p>
          </div>

          <div className="estimated-metrics">
            <p><strong>Estimated time:</strong> 15-20 minutes</p>
            <p><strong>Compute cost:</strong> ~$2.50</p>
          </div>

          <button 
            className="btn-toolkit-primary btn-full"
            onClick={startTraining}
            disabled={!modelName}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Training</span>
          </button>
        </>
      ) : (
        <div className="training-progress">
          <h3>Training Model: {modelName}</h3>
          <div className="progress-bar-large">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-text">{progress}% complete</p>
          <div className="training-stats">
            <p>Epoch: {Math.floor(progress / 10)}/10</p>
            <p>Accuracy: {(0.7 + (progress / 500)).toFixed(3)}</p>
            <p>Loss: {(0.5 - (progress / 500)).toFixed(3)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainPanel;
