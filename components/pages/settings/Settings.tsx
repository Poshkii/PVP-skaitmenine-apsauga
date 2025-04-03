import './settings.css';
import ModuleToggle from "@/components/pages/settings/ModuleToggle.tsx";
import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useModuleMessaging} from "@/hooks/useModuleMessaging.ts";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";

function Settings() {
    const { changeBgModuleState } = useModuleMessaging();
    const { changeContentModuleState } = useContentMessaging();

    return (
        <>
            <h1 className="panel-title">Settings</h1>

            <div className="security-check-container">
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