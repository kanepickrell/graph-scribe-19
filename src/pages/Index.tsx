import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GraphPreviewScreen from "@/components/GraphPreviewScreen";
import DiscoveryMode from "@/components/DiscoveryMode";
import EngineeringMode from "@/components/EngineeringMode";
import ModeToggle from "@/components/ModeToggle";

type Mode = 'preview' | 'discovery' | 'engineering';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<Mode>('preview');

  // Load saved mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('forgeMode') as Mode;
    if (savedMode && savedMode !== 'preview') {
      setCurrentMode(savedMode);
    }
  }, []);

  const handleEnterMode = (mode: 'discovery' | 'engineering') => {
    setCurrentMode(mode);
    localStorage.setItem('forgeMode', mode);
  };

  const handleModeChange = (mode: 'discovery' | 'engineering') => {
    setCurrentMode(mode);
    localStorage.setItem('forgeMode', mode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {currentMode !== 'preview' && (
        <Header 
          onDiscoveryPromptClick={(prompt) => {
            console.log("Discovery prompt:", prompt);
          }}
          showModeToggle={true}
          currentMode={currentMode as 'discovery' | 'engineering'}
          onModeChange={handleModeChange}
        />
      )}
      
      {currentMode === 'preview' && (
        <GraphPreviewScreen onEnterMode={handleEnterMode} />
      )}
      
      {currentMode === 'discovery' && (
        <DiscoveryMode />
      )}
      
      {currentMode === 'engineering' && (
        <EngineeringMode />
      )}
    </div>
  );
};

export default Index;
