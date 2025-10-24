interface ModeToggleProps {
  currentMode: 'discovery' | 'engineering';
  onModeChange: (mode: 'discovery' | 'engineering') => void;
}

const ModeToggle = ({ currentMode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="mode-toggle">
      <button 
        className={`mode-btn ${currentMode === 'discovery' ? 'active' : ''}`}
        onClick={() => onModeChange('discovery')}
      >
        <span className="mode-icon">🔍</span>
        <span>Discover</span>
      </button>
      <button 
        className={`mode-btn ${currentMode === 'engineering' ? 'active' : ''}`}
        onClick={() => onModeChange('engineering')}
      >
        <span className="mode-icon">🔧</span>
        <span>Engineer</span>
      </button>
    </div>
  );
};

export default ModeToggle;
