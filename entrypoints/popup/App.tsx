import 'bootstrap/dist/css/bootstrap.css';
import {configFactory, ConfigProvider} from "@/components/providers/ConfigProvider.tsx";
import Home from "@/components/pages/home/Home.tsx";
import { ReportProvider } from '@/components/pages/report-page/ReportContext';
import React from 'react';

function App() {
    return (
        <ReportProvider>
            <ConfigProvider config={configFactory(undefined)}>
                <React.Suspense fallback="loading">
                    <Home />
                </React.Suspense>
            </ConfigProvider>
        </ReportProvider>
    );
}

export default App;
