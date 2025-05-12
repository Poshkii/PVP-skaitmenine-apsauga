import Unauthorized from "@/components/pages/unauthorized/Unauthorized.tsx";
import React from "react";
import {useUserSession} from "@/components/providers/UserSessionProvider.tsx";

interface PaidRouteProps {
    children: React.ReactNode;
    featureName: string;
}

function PaidRoute({children, featureName}: PaidRouteProps) {
    const { user } = useUserSession();

    if (!user || !user.isPaid) {
        return <Unauthorized featureName={featureName} />;
    }

    return children;
}

export default PaidRoute;