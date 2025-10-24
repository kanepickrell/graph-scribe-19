import { Search, Settings, User, Sparkles, Dices } from "lucide-react";
import { useState } from "react";
import ModeToggle from "./ModeToggle";

interface HeaderProps {
  onDiscoveryPromptClick: (prompt: string) => void;
  showModeToggle?: boolean;
  currentMode?: 'discovery' | 'engineering';
  onModeChange?: (mode: 'discovery' | 'engineering') => void;
}

const discoveryPrompts = [
  "What's blocking our automation?",
  "Show me data ready for ML training",
  "Which teams work on similar problems?",
  "Where are we repeating work?",
  "Find automation opportunities",
  "What caused these recent failures?",
  "Show me cross-team collaboration potential",
  "Identify bottlenecks in our processes"
];

const Header = ({ onDiscoveryPromptClick, showModeToggle, currentMode, onModeChange }: HeaderProps) => {
  const [currentPrompts, setCurrentPrompts] = useState(discoveryPrompts.slice(0, 4));
  const [searchFocused, setSearchFocused] = useState(false);

  const shufflePrompts = () => {
    const shuffled = [...discoveryPrompts].sort(() => Math.random() - 0.5);
    setCurrentPrompts(shuffled.slice(0, 4));
  };

  return (
    <header className="border-b-[3px] border-border bg-card py-4 px-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <svg className="sparkle w-4 h-4 absolute -top-2 -left-2 rotate-12" viewBox="0 0 24 24" fill="hsl(var(--accent-pink))">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          
          <div className="w-12 h-12 rounded-2xl bg-primary border-[3px] border-border flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-none">🔥 FORGE</h1>
            <p className="text-xs text-muted-foreground font-medium">Visual Data Engineering</p>
          </div>
          
          <svg className="sparkle w-3 h-3 absolute -bottom-1 left-10 -rotate-12" viewBox="0 0 24 24" fill="hsl(var(--accent-teal))">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Mode Toggle */}
        {showModeToggle && currentMode && onModeChange && (
          <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="neo-button-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button className="w-10 h-10 rounded-xl bg-secondary border-2 border-border flex items-center justify-center hover:bg-muted transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
