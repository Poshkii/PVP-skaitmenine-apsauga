import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import {useParams} from "react-router";

function PasswordChecker() {
    const { password } = useParams();

    return (
        <>
            
            <div style={{ 
            flexDirection: "column", 
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            }}>
                <PasswordStrength inputPassword={password ?? ''} />
                <PasswordTips/>
            </div>
        </>
    );
}

export default PasswordChecker;