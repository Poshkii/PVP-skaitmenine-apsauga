import 'bootstrap/dist/css/bootstrap.css';
import {configFactory, ConfigProvider} from "@/components/providers/ConfigProvider.tsx";
import Home from "@/components/pages/home/Home.tsx";
import { ReportProvider } from '@/components/pages/report-page/ReportContext';

function App() {
    return (
        <ReportProvider>
            <ConfigProvider config={configFactory(undefined)}>
                <Home />
            </ConfigProvider>
        </ReportProvider>
    );
}

export default App;
