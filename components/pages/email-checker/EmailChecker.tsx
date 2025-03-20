import { useState } from "react";
import EmailStatus from "@/components/pages/email-checker/EmailStatus.tsx";
import EmailLeakTips from "@/components/pages/email-checker/EmailLeakTips.tsx";
import {useParams} from "react-router";

function EmailChecker() {
    const { email } = useParams();
    const [activePage, setActivePage] = useState<"status" | "tips">("status");

    return (
        <>
            {activePage === "status" ? (
                <EmailStatus inputEmail={email ?? ''} switchPage={() => setActivePage("tips")} />
            ) : (
                <EmailLeakTips switchPage={() => setActivePage("status")} />
            )
            }      
        </>
    );
}

export default EmailChecker;