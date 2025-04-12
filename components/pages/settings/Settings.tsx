import './settings.css';
import ModuleToggle from "@/components/pages/settings/ModuleToggle.tsx";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";
import { useTranslation } from 'react-i18next';

function Settings() {
    const { changeBgModuleState } = useModuleMessaging();
    const { changeContentModuleState } = useContentMessaging();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
      };

    return (
        <>
            <h1 className="panel-title">Settings</h1>

            <div className="security-check-container glassmorphism">
                    <div className="setting-container">
                <div className="setting-text">
                    <p className="setting-title">{t('language')}</p>
                    <p className="setting-description">Choose your preferred language</p>
                </div>
                <div className="language-selector">
                    <select className="language-dropdown" onChange={(e) => changeLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="lt">Lithuanian</option>
                    </select>
                </div>
            </div>
                <ModuleToggle
                    moduleId={ModuleId.PasswordChecker}
                    title={"Password Checker Button"}
                    description={"Button near password input boxes"}
                    onChangeState={changeContentModuleState}
                />
                <ModuleToggle
                    moduleId={ModuleId.FileChecker}
                    title={"Automatic Downloads Scanning"}
                    description={"Automatic download scanning for malware"}
                    onChangeState={changeBgModuleState}
                />
            </div>
        </>
    );

}

export default Settings;