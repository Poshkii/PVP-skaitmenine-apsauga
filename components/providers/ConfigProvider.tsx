import {createContext, ReactNode} from "react";

const ConfigContext = createContext(null as Configuration | null);

export function ConfigProvider({ config, children }: { config: Configuration, children: ReactNode }) {
    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const config = useContext(ConfigContext);
    if (!config) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return config;
}