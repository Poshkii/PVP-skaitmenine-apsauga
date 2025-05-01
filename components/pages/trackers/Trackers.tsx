import React, { useState, useEffect } from 'react';
import { Info } from "lucide-react"; 
import Dashboard from "@/components/pages/trackers/TrackerDashBoard";
import Settings from "@/components/pages/trackers/TrackerSettings";
import { ModuleId } from "@/entrypoints/content/types/module";
import { ModuleMessageId } from "@/entrypoints/content/types/module-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import { useNavigate } from "react-router";
import { useModuleMessaging } from "@/hooks/useModuleMessaging";

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
  const { sendToModule } = useModuleMessaging();
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
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize tracker data from storage
    chrome.storage.local.get(['blockStats', 'settings'], (data: ChromeStorage) => {
      if (data.blockStats) setStats(data.blockStats);
      if (data.settings) setSettings(data.settings);
    });
    
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
    setUpdateError(null);
  
    const changed = settings.blockFingerprints !== newSettings.blockFingerprints;
  
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
  
      if (changed) {
        try {
          sendToModule(ModuleId.TrackerBlocker, {id: ModuleMessageId.ApplyProtections});
        } catch (error) {
          console.error("Error applying protection settings:", error);
        }
      }
  
      setTimeout(() => setLoading(false), 1000);
    });
  };
  
  // Force update of EasyList rules
  const updateRules = () => {
    try {
      setLoading(true);
      setUpdateError(null);

      sendToModule(ModuleId.TrackerManager, {id: ModuleMessageId.UpdateTrackerRules});
    } catch (error) {
        console.error("Error sending update tracker rules message:", error);
        setLoading(false);
        setUpdateError("Failed to send update request. Please try again.");
    }
  };
  
  // Reset tracker statistics
  const resetStats = (): void => {
    try {
      console.log("Resetting tracker statistics");
      sendToModule(ModuleId.TrackerManager, {id: ModuleMessageId.ResetTrackerStats});
    } catch (error) {
        console.error("Error resetting tracker stats:", error);
        setUpdateError("Failed to reset statistics. Please try again.");
    }
  };

  useEffect(() => {
    const handleMessage = (message: any) => {
      switch (message.id){
        case UiMessageId.UpdateTrackerRules: {
          console.log("Manual ruleset update successful");
          setLoading(false);
          break; 
        }
        case UiMessageId.TrackerRulesError: {
          console.error("Error updating tracker ruleset:", message.data?.message);
          setUpdateError(message.data?.message || "Error updating rules. Please try again.");
          setLoading(false);
          break;
        }
        case UiMessageId.TrackerReset: {
          // Handle tracker reset confirmation
          break;
        }
      };
    }

    browser.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="middle-menu">
      <h1 className="panel-title">
        Blocked Trackers <span onClick={() => navigate("/tracker-data")}><Info className="info-icon"/></span>
      </h1>

      <div>
        <div className="tab-buttons">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"} tab-button`}>
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("settings") }
            className={`btn ${activeTab === "settings" ? "btn-primary" : "btn-secondary"} tab-button`}>
            Settings
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="security-check-container glassmorphism">
            <Dashboard 
              stats={stats} 
              resetStats={resetStats} 
              lastUpdated={settings.lastUpdated} 
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="security-check-container glassmorphism">
            <Settings 
              settings={settings} 
              updateSettings={updateSettings} 
              updateRules={updateRules} 
            />
          </div>
        )}
      </div>
    
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Updating tracker protection...</p>
        </div>
      )}
      
      {updateError && (
        <div className="error-message">
          {updateError}
        </div>
      )}
    </div>
  );
};

export default Trackers;