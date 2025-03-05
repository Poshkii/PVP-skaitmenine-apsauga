import EmailStatus from "@/components/pages/email-checker/EmailStatus.tsx";
import {useParams} from "react-router";

function EmailChecker() {
    const { email } = useParams();

    return (
        <>
            <EmailStatus inputEmail={email ?? ''} />
        </>
    );
}

export default EmailChecker;