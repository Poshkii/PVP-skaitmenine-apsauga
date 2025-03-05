import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";
import {useMessageSender} from "@/hooks/useMessageSender.ts";

function PasswordCheckerOptions() {
    const config = useConfig();
    const [enabled, setEnabled] = useState(config.isModuleEnabled(ModuleId.PasswordChecker));
    const { sendModuleChangeMessage } = useMessageSender();

    function handleChange(checked: boolean) {
        config.setModuleEnabled(ModuleId.PasswordChecker, checked);
        config.save();
        setEnabled(checked);
        sendModuleChangeMessage(ModuleId.PasswordChecker, checked);
    }

    return (
        <div className="menu-button">
            <div className="menu-content">
                <div>
                    <p className="menu-name">Password Checker button</p>
                    <p className="menu-hint">Button near password input boxes</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" onChange={(e) => handleChange(e.target.checked)} checked={enabled}/>
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
}

export default PasswordCheckerOptions;