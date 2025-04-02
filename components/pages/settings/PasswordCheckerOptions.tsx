import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";
import {useContentMessaging} from "@/hooks/useContentMessaging.ts";

function PasswordCheckerOptions() {
    const config = useConfig();
    const [enabled, setEnabled] = useState(config.isModuleEnabled(ModuleId.PasswordChecker));
    const {sendModuleChangeMessage} = useContentMessaging();

    function handleChange(checked: boolean) {
        config.setModuleEnabled(ModuleId.PasswordChecker, checked);
        config.save();
        setEnabled(checked);
        sendModuleChangeMessage(ModuleId.PasswordChecker, checked);
    }

    return (
        <div className="setting-container">
            <div className="setting-text">
                <p className="setting-title">Password Checker Button</p>
                <p className="setting-description">Button near password input boxes</p>
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

export default PasswordCheckerOptions;