import {createContext, ReactNode} from "react";

const ConfigContext = createContext<Configuration | null>(null);

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

export const configFactory = (initialConfig?: Configuration) => {
    const config = initialConfig || new Configuration();
    // FIXME: unsafe as this is an async function
    config.load();
    return config;
}