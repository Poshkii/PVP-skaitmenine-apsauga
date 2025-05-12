import React from "react";
import {useTranslation} from "react-i18next";


interface UnauthorizedProps {
    featureName: string;
}

function Unauthorized({featureName}: UnauthorizedProps) {
    const { t } = useTranslation("unauthorized");

    return (
        <>
            <h1 className="panel-title">{t("pageName")}</h1>
            <div className="security-check-container glassmorphism">
                <h4>{featureName} {t("available")}</h4>
            </div>
        </>
    )
}

export default Unauthorized;