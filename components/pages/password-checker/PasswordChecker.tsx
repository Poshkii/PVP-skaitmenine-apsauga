import PasswordStrength from "@/components/pages/password-checker/PasswordStrength.tsx";
import PasswordTips from "@/components/pages/password-checker/PasswordTips.tsx";

function PasswordChecker() {
    return (
        <>
            <PasswordStrength/>
            <PasswordTips/>
        </>
    );
}

export default PasswordChecker;