import React, { useState, useEffect } from 'react';
import Dashboard from "@/components/pages/trackers/TrackerDashBoard";
import Settings from "@/components/pages/trackers/TrackerSettings";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { ModuleId } from "@/entrypoints/content/types/module";
import { ModuleMessageId } from "@/entrypoints/content/types/module-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
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
  advancedProtection?: boolean;
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
  const { sendToModule } = useContentMessaging();
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
    advancedProtection: false,
    lastUpdated: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
  
    const changed = settings.advancedProtection !== newSettings.advancedProtection;
  
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
  
      if (changed) {
        triggerProtectionUpdate();
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
      setLoading(true);
      console.log("Resetting tracker statistics");

      sendToModule(ModuleId.TrackerManager, {id: ModuleMessageId.ResetTrackerStats});
      
    } catch (error) {
        console.error("Error resetting tracker stats:", error);
        setLoading(false);
        setUpdateError("Failed to reset statistics. Please try again.");
    }
  };
  
  // Trigger an update for the protection settings
  const triggerProtectionUpdate = (): void => {
    try {
      sendToModule(ModuleId.TrackerManager, {id: ModuleMessageId.ApplyProtections});
      
    } catch (error) {
      console.error("Error applying protection settings:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.id === UiMessageId.UpdateTrackerRules) {
        console.log("Manual ruleset update successful");
        setLoading(false);
      } else if (message.id === UiMessageId.TrackerRulesError) {
        console.error("Error updating tracker ruleset:", message.data?.message);
        setUpdateError(message.data?.message || "Error updating rules. Please try again.");
        setLoading(false);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

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
              <p>Updating tracker protection...</p>
            </div>
          )}
          
          {updateError && (
            <div className="error-message">
              {updateError}
            </div>
          )}
          
          {activeTab === 'dashboard' ? (
            <Dashboard 
              stats={stats} 
              resetStats={resetStats} 
              lastUpdated={settings.lastUpdated} 
            />
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