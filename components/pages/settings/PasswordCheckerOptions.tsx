import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";
import {ContentMessageId} from "@/entrypoints/content/types/content-message.ts";

function PasswordCheckerOptions() {
    const config = useConfig();
    const [enabled, setEnabled] = useState(config.isModuleEnabled(ModuleId.PasswordChecker));

    function handleChange(checked: boolean) {
        config.setModuleEnabled(ModuleId.PasswordChecker, checked);
        config.save();
        setEnabled(checked);

        // Send message to content script
        browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                browser.tabs.sendMessage(tabs[0].id, {
                    id: ContentMessageId.ModuleChange,
                    data: {
                        moduleId: ModuleId.PasswordChecker,
                        enabled: checked
                    }
                });
            }
        });
    }

    return (
        <div className="menu-button">
            <div className="menu-content">
                <div>
                    <p className="menu-name">Password Checker button</p>
                    <p className="menu-hint">Button near password input boxes</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" onChange={(e) => handleChange(e.target.checked)} checked={enabled} />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
}

export default PasswordCheckerOptions;