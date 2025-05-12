import React from "react";


interface UnauthorizedProps {
    featureName: string;
}

function Unauthorized({featureName}: UnauthorizedProps) {
    return (
        <>
            <h1 className="panel-title">Pro Feature</h1>
            <div className="security-check-container glassmorphism">
                <h4>{featureName} is available to Pro users only.</h4>
            </div>
        </>
    )
}

export default Unauthorized;