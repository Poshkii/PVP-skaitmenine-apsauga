import {ModuleId} from "@/entrypoints/content/types/module.ts";
import {useConfig} from "@/components/providers/ConfigProvider.tsx";

interface ModuleToggleProps {
    moduleId: ModuleId;
    title: string;
    description: string;
    locked?: boolean;
    onChangeState: (moduleId: ModuleId, enabled: boolean) => void;
}

function ModuleToggle({moduleId, title, description, locked = false, onChangeState}: ModuleToggleProps ) {
    const config = useConfig();
    const [enabled, setEnabled] = useState( locked ? false : config.isModuleEnabled(moduleId));

    function handleChange(checked: boolean) {
        if (locked)
            return;

        config.setModuleEnabled(moduleId, checked);
        config.save();
        setEnabled(checked);
        onChangeState(moduleId, checked);
    }

    return (
        <div className="setting-container">
            <div className="setting-text">
                <p className="setting-title">{title}{locked ? ' (Pro)' : ''}</p>
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