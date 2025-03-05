import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {configFactory, ConfigProvider} from "@/components/providers/ConfigProvider.tsx";
import Home from "@/components/pages/home/Home.tsx";

function App() {
    return (
        <ConfigProvider config={configFactory(undefined)}>
            <Home />
        </ConfigProvider>
    );
}

export default App;
