import React, { useState, useEffect } from 'react';
import Dashboard from "@/components/pages/trackers/TrackerDashBoard";
import Settings from "@/components/pages/trackers/TrackerSettings";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import './trackers.css';

interface Stats {
  total: number;
  analytics: number;
  advertising: number;
  social: number;
  other: number;
}

interface SettingsType {
  blockAnalytics: boolean;
  blockAdvertising: boolean;
  blockSocial: boolean;
  blockOther: boolean;
  blockFingerprints: boolean;
  lastUpdated: string | null;
}

interface ChromeStorage {
  blockStats?: Stats;
  settings?: SettingsType;
}

interface StorageChange {
  blockStats?: {
    newValue: Stats;
  };
  settings?: {
    newValue: SettingsType;
  };
}

const Trackers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    analytics: 0,
    advertising: 0,
    social: 0,
    other: 0
  });
  const [settings, setSettings] = useState<SettingsType>({
    blockAnalytics: true,
    blockAdvertising: true,
    blockSocial: true,
    blockOther: true,
    blockFingerprints: true,
    lastUpdated: null
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get(['blockStats', 'settings'], (data: ChromeStorage) => {
      if (data.blockStats) setStats(data.blockStats);
      if (data.settings) setSettings(data.settings);
    });
    
    // Listen for storage updates
    const handleStorageChange = (changes: StorageChange, area: string) => {
      if (area === 'local') {
        if (changes.blockStats) {
          setStats(changes.blockStats.newValue);
        }
        if (changes.settings) {
          setSettings(changes.settings.newValue);
        }
      }
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const updateSettings = (newSettings: SettingsType): void => {
    setLoading(true);
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
      setTimeout(() => setLoading(false), 1000); 
    });
  };
  
  // Force update of EasyList rules
  const updateRules = () => {
    setLoading(true);
    console.log("Manually updating tracker ruleset")
    browser.runtime.sendMessage({ id: BgMessageId.UpdateTrackerRules })
    .catch((err) => {
        console.error("Error sending message:", err);
    });
  };

  useEffect(() => {
      const handleMessage = (message: any) => {
          if (message.id === UiMessageId.UpdateTrackerRules) {
            console.log("Manual ruleset update succesful")
            setLoading(false);
          } else if (message.id === UiMessageId.TrackerRulesError) {
            console.error("Error updating tracker ruleset, try again");
            setLoading(false);
          }
      };

      browser.runtime.onMessage.addListener(handleMessage);
      return () => {
          browser.runtime.onMessage.removeListener(handleMessage);
      };
  }, []);

  const resetStats = (): void => {
    const resetBlockStats: Stats = {
      total: 0,
      analytics: 0,
      advertising: 0,
      social: 0,
      other: 0
    };
    chrome.storage.local.set({ blockStats: resetBlockStats });
    setStats(resetBlockStats);
  };

  return (
    <>  
        <div className="middle-menu" style={{color:"black"}}>
          <div>
            <div className="tabs">
              <button 
                className={activeTab === 'dashboard' ? 'active' : ''} 
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={activeTab === 'settings' ? 'active' : ''} 
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        
          <div>
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Updating rules...</p>
              </div>
            )}
            
            {activeTab === 'dashboard' ? (
              <Dashboard stats={stats} resetStats={resetStats} lastUpdated={settings.lastUpdated} />
            ) : (
              <Settings 
                settings={settings} 
                updateSettings={updateSettings} 
                updateRules={updateRules} 
              />
            )}
          </div>
        </div>
    </>
  );
};

export default Trackers;