import {ModuleId} from "@/entrypoints/content/types/module.ts";

export interface ModuleConfig {
    id: number;
    enabled: boolean;
}

export interface Config {
    Modules: ModuleConfig[];
}

// these are paid so disable them by default
const ConfigOverrides = new Map<ModuleId, boolean>([
    [ModuleId.FileChecker, false],
    [ModuleId.TrackerBlocker, false]
]);

// TODO: verifying and migrating between config versions? if a new module id is added for example

export class Configuration {
    private config: Config;
    private static readonly STORAGE_KEY = 'app_configuration';

    constructor() {
        this.config = {
            Modules: []
        };
    }

    public async load(): Promise<void> {
        try {
            const result = await browser.storage.local.get(Configuration.STORAGE_KEY);

            if (result && result[Configuration.STORAGE_KEY]) {
                this.config = result[Configuration.STORAGE_KEY];
            } else {
                this.createDefaultConfig();
                await this.save();
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            this.createDefaultConfig();
        }
    }

    public async save(): Promise<void> {
        try {
            const data = { [Configuration.STORAGE_KEY]: this.config };
            await browser.storage.local.set(data);
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    private createDefaultConfig(): void {
        this.config = {
            Modules: Object.values(ModuleId)
                .filter(value => typeof value === 'number')
                .map(id => ({
                    id: id as number,
                    enabled: ConfigOverrides.get(id) ?? true
                }))
        };
    }

    public getModule(moduleId: ModuleId): ModuleConfig | undefined {
        return this.config.Modules.find(module => module.id === moduleId);
    }

    public isModuleEnabled(moduleId: ModuleId): boolean {
        const module = this.getModule(moduleId);
        return module ? module.enabled : false;
    }

    public setModuleEnabled(moduleId: ModuleId, enabled: boolean): void {
        const moduleIndex = this.config.Modules.findIndex(module => module.id === moduleId);

        if (moduleIndex >= 0) {
            this.config.Modules[moduleIndex].enabled = enabled;
        } else {
            // Add module if it doesn't exist
            this.config.Modules.push({
                id: moduleId,
                enabled: enabled
            });
        }
    }

    public async resetToDefaults(): Promise<void> {
        this.createDefaultConfig();
        await this.save();
    }
}