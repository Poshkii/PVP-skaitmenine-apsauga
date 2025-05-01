import 'bootstrap/dist/css/bootstrap.css';
import {configFactory, ConfigProvider} from "@/components/providers/ConfigProvider.tsx";
import Home from "@/components/pages/home/Home.tsx";
import { ReportProvider } from '@/components/pages/report-page/ReportContext';
import React from 'react';
import {ModuleManager} from "@/entrypoints/content/modules/module-manager.ts";

import { useEffect, useState  } from "react";
import { useConfig } from "@/components/providers/ConfigProvider.tsx";
import { ModuleId } from "@/entrypoints/content/types/module.ts";

function StartupController() {
    const config = useConfig();

    /*
    useEffect(() => {
        const current = config.isModuleEnabled(ModuleId.TrackerBlocker);
        const timeout = setTimeout(() => {
            if (!current){
                const moduleManager = new ModuleManager();
                moduleManager.loadModule(ModuleId.TrackerBlocker);
                console.log("blocker enabled");
            }
            else
            console.log("blocker already enabled");
        }, 500);
        return () => clearTimeout(timeout);
    });
    */

    const [animationsEnabled, setAnimationsEnabled] = useState(
        config.isModuleEnabled(ModuleId.HoverAnimations)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const current = config.isModuleEnabled(ModuleId.HoverAnimations);
            setAnimationsEnabled(current);
        }, 500);

        return () => clearInterval(interval);
    }, [config]);

    useEffect(() => {
        const className = "animations-disabled";

        if (!animationsEnabled) {
            document.body.classList.add(className);
        } else {
            document.body.classList.remove(className);
        }
    }, [animationsEnabled]);

    return null;
}

function App() {
    return (
        <ReportProvider>
            <ConfigProvider config={configFactory(undefined)}>
                <React.Suspense fallback="loading">
                    <StartupController />
                    <Home />
                </React.Suspense>
            </ConfigProvider>
        </ReportProvider>
    );
}

export default App;
