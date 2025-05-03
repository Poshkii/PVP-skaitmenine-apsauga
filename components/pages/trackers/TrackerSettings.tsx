import React from 'react';
import { ModuleId } from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
import '/components/pages/settings/settings.css';
import { useTranslation } from "react-i18next";

interface ModuleToggleProps {
  moduleId: ModuleId;
  title: string;
  description: string;
  onChangeState: (moduleId: ModuleId, enabled: boolean) => void;
}

interface SettingsProps {
  settings: {
    blockAnalytics: boolean;
    blockAdvertising: boolean;
    blockSocial: boolean;
    blockOther: boolean;
    lastUpdated: string | null;
  };

  updateSettings: (settings: SettingsProps['settings']) => void;
  updateRules: () => void;
}

const CustomToggle: React.FC<{
  moduleId: ModuleId;
  title: string;
  description: string;
  isEnabled?: boolean;
  onChangeState: () => void;
}> = ({ title, description, isEnabled = false, onChangeState }) => {
  return (
    <div className="setting-container">
      <div className="setting-text">
        <p className="setting-title">{title}</p>
        <p className="setting-description">{description}</p>
      </div>
      <label className="switch-toggle">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={onChangeState}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
};

function FingerprintModuleToggle({moduleId, title, description, onChangeState}: ModuleToggleProps) {
  const config = useConfig();
  const [enabled, setEnabled] = useState(config.isModuleEnabled(moduleId));

  function handleChange(checked: boolean) {
      config.setModuleEnabled(moduleId, checked);
      config.save();
      setEnabled(checked);
      onChangeState(moduleId, checked);
      console.log("Toggled fingerprint protection");
  }

  return (
      <div className="setting-container">
          <div className="setting-text">
              <p className="setting-title">{title}</p>
              <p className="setting-description">{description}</p>
          </div>
          <label className="switch-toggle">
              <input
                  type="checkbox"
                  onChange={(e) => handleChange(e.target.checked)}
                  checked={enabled}
              />
              <span className="slider"></span>
          </label>
      </div>
  );
}

function Settings({ settings, updateSettings, updateRules }: SettingsProps) {
  const { t } = useTranslation('trackers');
  const { changeContentModuleState } = useContentMessaging();

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
    <div>
      <CustomToggle
        moduleId={ModuleId.TrackerManager}
        title={t('analyticsToggle')}
        description={t('analyticsDesc')}
        isEnabled={settings.blockAnalytics}
        onChangeState={() => handleToggle('blockAnalytics')}
      />

      <CustomToggle
        moduleId={ModuleId.TrackerManager}
        title={t('adsToggle')}
        description={t('adsDesc')}
        isEnabled={settings.blockAdvertising}
        onChangeState={() => handleToggle('blockAdvertising')}
      />

      <CustomToggle
        moduleId={ModuleId.TrackerManager}
        title={t('socialToggle')}
        description={t('socialDesc')}
        isEnabled={settings.blockSocial}
        onChangeState={() => handleToggle('blockSocial')}
      />

      <CustomToggle
        moduleId={ModuleId.TrackerManager}
        title={t('otherToggle')}
        description={t('otherDesc')}
        isEnabled={settings.blockOther}
        onChangeState={() => handleToggle('blockOther')}
      />

      <FingerprintModuleToggle
          moduleId={ModuleId.TrackerBlocker}
          title={t('fingerprintToggle')}
          description={t('fingerprintDesc')}
          onChangeState={changeContentModuleState}
      />

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={updateRules}>
          {t('updateRules')}
        </button>
      </div>
      <div className="last-update">
        {t('lastUpdate')}:  {formatDate(settings.lastUpdated)}
      </div>
    </div>
  );
}
export default Settings;