import React, { useState, useEffect } from 'react';
import { Info } from "lucide-react"; 
import Dashboard from "@/components/pages/trackers/TrackerDashBoard";
import Settings from "@/components/pages/trackers/TrackerSettings";
import { ModuleId } from "@/entrypoints/content/types/module";
import { ModuleMessageId } from "@/entrypoints/content/types/module-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import { useNavigate } from "react-router";
import { useModuleMessaging } from "@/hooks/useModuleMessaging";
import { useTranslation } from "react-i18next";

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
  const [blockedTrackers, setBlockedTrackers] = useState([]);
  const [trackerLink, setTrackerLink] = useState('');
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
    lastUpdated: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  const SaveBlockedTrackers = async () => {
    const blocked = await browser.storage.local.get(["blockedTrackers"]);
    return blocked.blockedTrackers || [];
  }

  const SaveBlockedTrackersURL = async (): Promise<string> => {
    const url = await browser.storage.local.get(["trackerLink"]);
    return url.trackerLink || "unknown";
  }

  const getBaseDomain = (fullUrl: string): string => {
    try {
      const hostname = new URL(fullUrl).hostname;
      const parts = hostname.split('.');
  
      if (parts.length <= 2) return hostname;
  
      return parts.slice(-2).join('.'); 
    } catch {
      return fullUrl;
    }
  };

  useEffect(() => {
    const fetchTrackers = async () => {
      const blocked = await SaveBlockedTrackers();
      const url = await SaveBlockedTrackersURL();
      setBlockedTrackers(blocked);
      setTrackerLink(url);
    };

    fetchTrackers();
  }, []);

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
  
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
  
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
        setUpdateError(t('errorUpdateRequest'));
    }
  };
  
  // Reset tracker statistics
  const resetStats = (): void => {
    try {
      console.log("Resetting tracker statistics");
      sendToModule(ModuleId.TrackerManager, {id: ModuleMessageId.ResetTrackerStats});
    } catch (error) {
        console.error("Error resetting tracker stats:", error);
        setUpdateError(t('errorStatReset'));
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
          setUpdateError(message.data?.message || t('errorUpdateRules'));
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

  const { t } = useTranslation('trackers');

  return (
    <div className="middle-menu">
      <h1 className="panel-title">
        {t('header')} <span onClick={() => navigate("/tracker-data")}><Info className="info-icon"/></span>
      </h1>

      <div>
        <div className="tab-buttons">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"} tab-button`}>
            {t('statBtn')}
          </button>
          <button
            onClick={() => setActiveTab("settings") }
            className={`btn ${activeTab === "settings" ? "btn-primary" : "btn-secondary"} tab-button`}>
            {t('settingsBtn')}
          </button>
        </div>

        {activeTab === "dashboard" && (
            <Dashboard 
              stats={stats} 
              resetStats={resetStats} 
              lastUpdated={settings.lastUpdated} 
              blocked={blockedTrackers}
              url={getBaseDomain(trackerLink)}
            />
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
          <div className="loading-spinner"></div>
          <p>{t('updating')}</p>
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