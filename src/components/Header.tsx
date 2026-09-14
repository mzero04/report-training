import React from 'react';
import { User } from 'firebase/auth';
import { FileSpreadsheet, Code2, Mail, RefreshCw, LogIn, LogOut, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'report' | 'script' | 'sync' | 'guide';
  setActiveTab: (tab: 'report' | 'script' | 'sync' | 'guide') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  selectedDate: string;
  onOpenEmailPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  isLoggingIn,
  selectedDate,
  onOpenEmailPreview,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  SheetScript Automator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Google Apps Script Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Daily Report Generation & Automated Email Notifications for Teams
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'report'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Daily Report</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'script'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Apps Script Code</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'sync'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Google Sheets Sync</span>
            </button>
          </nav>

          {/* Actions & User State */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenEmailPreview}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              title="Preview Email Notification"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Preview Email</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-600"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>{isLoggingIn ? 'Signing In...' : 'Connect Google'}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
