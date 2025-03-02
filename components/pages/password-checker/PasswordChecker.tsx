import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";
import {useParams} from "react-router";

function PasswordChecker() {
    const { password } = useParams();

    return (
        <>
            <PasswordStrength inputPassword={password ?? ''} />
            <PasswordTips/>
        </>
    );
}

export default PasswordChecker;