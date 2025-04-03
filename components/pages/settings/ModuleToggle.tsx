import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";

interface ModuleToggleProps {
    moduleId: ModuleId;
    title: string;
    description: string;
    onChangeState: (moduleId: ModuleId, enabled: boolean) => void;
}

function ModuleToggle({moduleId, title, description, onChangeState}: ModuleToggleProps ) {
    const config = useConfig();
    const [enabled, setEnabled] = useState(config.isModuleEnabled(moduleId));

    function handleChange(checked: boolean) {
        config.setModuleEnabled(moduleId, checked);
        config.save();
        setEnabled(checked);
        onChangeState(moduleId, checked);
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

export default ModuleToggle;