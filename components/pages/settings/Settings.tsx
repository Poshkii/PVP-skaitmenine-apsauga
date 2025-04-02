import PasswordCheckerOptions from "@/components/pages/settings/PasswordCheckerOptions.tsx";
import './settings.css';

function Settings() {
    return (
        <>
            <h1 className="panel-title">Settings</h1>

            <div className="security-check-container">
                <PasswordCheckerOptions/>
            </div>
        </>
    );

}

export default Settings;