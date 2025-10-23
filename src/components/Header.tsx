import { Search, Settings, User } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b-[3px] border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary border-[3px] border-border rounded-lg flex items-center justify-center font-extrabold text-xl">
            S
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-none">SemanticGraph</h1>
            <p className="text-xs text-muted-foreground">Data Discovery Platform</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes, processes, artifacts..."
              className="w-full neo-input pl-12"
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
