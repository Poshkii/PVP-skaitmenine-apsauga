import React from 'react';
import { ModuleId } from "@/entrypoints/content/types/module.ts";
import '/components/pages/settings/settings.css';

interface SettingsProps {
  settings: {
    blockAnalytics: boolean;
    blockAdvertising: boolean;
    blockSocial: boolean;
    blockOther: boolean;
    blockFingerprints: boolean;
    lastUpdated: string | null;
  };
  updateSettings: (settings: SettingsProps['settings']) => void;
  updateRules: () => void;
}

// Custom ModuleToggle component since we don't have direct access to the original
const ModuleToggle: React.FC<{
  moduleId: ModuleId;
  title: string;
  description: string;
  isEnabled?: boolean;
  onChangeState: () => void;
}> = ({ title, description, isEnabled = false, onChangeState }) => {
  return (
    <div className="module-toggle">
      <div className="module-info">
        <h4 className="module-title">{title}</h4>
        <p className="module-description">{description}</p>
      </div>
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={isEnabled} 
          onChange={onChangeState} 
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

function Settings({ settings, updateSettings, updateRules }: SettingsProps) {
  const handleToggle = (setting: keyof Omit<SettingsProps['settings'], 'lastUpdated'>): void => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
      lastUpdated: new Date().toISOString()
    };
    updateSettings(newSettings);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="settings-container">
      <ModuleToggle
        moduleId={ModuleId.TrackerManager}
        title="Analytics Trackers"
        description="Block scripts that collect usage analytics (Google Analytics, etc.)"
        isEnabled={settings.blockAnalytics}
        onChangeState={() => handleToggle('blockAnalytics')}
      />

      <ModuleToggle
        moduleId={ModuleId.TrackerManager}
        title="Advertising Trackers"
        description="Block ad networks and tracking pixels"
        isEnabled={settings.blockAdvertising}
        onChangeState={() => handleToggle('blockAdvertising')}
      />

      <ModuleToggle
        moduleId={ModuleId.TrackerManager}
        title="Social Media Trackers"
        description="Block social media buttons and trackers"
        isEnabled={settings.blockSocial}
        onChangeState={() => handleToggle('blockSocial')}
      />

      <ModuleToggle
        moduleId={ModuleId.TrackerManager}
        title="Other Trackers"
        description="Block miscellaneous and uncategorized trackers"
        isEnabled={settings.blockOther}
        onChangeState={() => handleToggle('blockOther')}
      />
      
      {/*
      <ModuleToggle
        moduleId={ModuleId.TrackerBlocker}
        title="Advanced Fingerprint Protection"
        description="Apply additional protections against browser fingerprinting"
        isEnabled={settings.blockFingerprints}
        onChangeState={() => handleToggle('blockFingerprints')}
      />
      */}
      
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={updateRules}>
          Update Rules Now
        </button>
      </div>
      <div className="last-update">
        Last update: {formatDate(settings.lastUpdated)}
      </div>
    </div>
  );
}

export default Settings;