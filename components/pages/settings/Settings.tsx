import './settings.css';
import ModuleToggle from "@/components/pages/settings/ModuleToggle.tsx";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react'; // Add this import

function Settings() {
    const { changeBgModuleState } = useModuleMessaging();
    const { changeContentModuleState } = useContentMessaging();
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language); // Track current language

    // Update currentLanguage state when i18n.language changes
    useEffect(() => {
        setCurrentLanguage(i18n.language);
    }, [i18n.language]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
    };

    return (
        <>
            <h1 className="panel-title">{t('settings:pageName')}</h1>

            <div className="security-check-container glassmorphism">
                <div className="setting-container">
                    <div className="setting-text">
                        <p className="setting-title">{t('settings:lng')}</p>
                        <p className="setting-description">{t('settings:lngDsc')}</p>
                    </div>
                    <div className="language-selector">
                        <select 
                            className="language-dropdown" 
                            onChange={(e) => changeLanguage(e.target.value)}
                            value={currentLanguage} // Set the value to current language
                        >
                            <option value="en">{t('settings:eng')}</option>
                            <option value="lt">{t('settings:lith')}</option>
                        </select>
                    </div>
                </div>
                <ModuleToggle
                    moduleId={ModuleId.PasswordChecker}
                    title={t('settings:pswd')}
                    description={t('settings:pswdDsc')}
                    onChangeState={changeContentModuleState}
                />
                <ModuleToggle
                    moduleId={ModuleId.FileChecker}
                    title={t('settings:scan')}
                    description={t('settings:scanDsc')}
                    onChangeState={changeBgModuleState}
                />
            </div>
        </>
    );
}

export default Settings;