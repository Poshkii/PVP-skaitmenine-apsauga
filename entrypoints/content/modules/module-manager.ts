import {Module, ModuleId} from "@/entrypoints/content/types/module.ts";

export class ModuleManager {
    private modules: Map<ModuleId, Module> = new Map();
    private activeModules: Set<ModuleId> = new Set();

    registerModule(module: Module, load: boolean = false) {
        this.modules.set(module.id, module);

        if (load) {
            this.loadModule(module.id);
        }
    }

    loadModule(id: ModuleId): boolean {
        const module = this.modules.get(id);
        if (!module) return false;

        try {
            module.load();
            this.activeModules.add(id);
            return true;
        } catch (error) {
            console.error(`Failed to load module ${id}:`, error);
            return false;
        }
    }

    unloadModule(id: ModuleId): boolean {
        const module = this.modules.get(id);
        if (!module) return false;

        try {
            module.unload();
            this.activeModules.delete(id);
            return true;
        } catch (error) {
            console.error(`Failed to unload module ${id}:`, error);
            return false;
        }
    }

    getModuleStatus(id: ModuleId): boolean {
        return this.activeModules.has(id);
    }
}