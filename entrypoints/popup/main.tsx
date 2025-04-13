import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';
import {HashRouter} from "react-router";
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HashRouter>
            <App/>
        </HashRouter>
    </React.StrictMode>,
);
