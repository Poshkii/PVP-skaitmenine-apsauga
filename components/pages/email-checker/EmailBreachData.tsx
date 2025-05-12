import { AlignCenter } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface BreachData {
    BreachMetrics: {
        risk: { risk_label: string; risk_score: number }[];
        passwords_strength: { EasyToCrack: number; PlainText: number; StrongHash: number; Unknown: number }[];
        xposed_data: { children: { name: string; children: { name: string; value: number }[] }[] }[];
        yearwise_details: Record<string, number>[];
    };
    ExposedBreaches: {
        breaches_details: {
            breach: string;
            details: string;
            domain: string;
            industry: string;
            logo: string;
            password_risk: string;
            xposed_data: string;
            xposed_date: string;
            xposed_records: number;
        }[];
    };
}

const EmailBreachDetails = ({ data }: { data: BreachData }) => {
    const { t } = useTranslation('emails');
    if (!data || !data.ExposedBreaches.breaches_details.length) {
        return <h3 style={{ color: "green", textAlign: "center" }}>{t('emailSafe')}</h3>;
    }

    return (       

        <div style={{ padding: "1rem", maxWidth: "800px", margin: "auto"}}>

            {/* Breach List */}          
            {data.ExposedBreaches.breaches_details.map((breach, index) => (
                <div key={index} style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    color: "white",
                    display: "flex",
                    flexDirection: "column", 
                    alignItems: "center", 
                    background: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                    textAlign: "center" 
                    }}>
                    {/* Logo */}
                    <div>
                        <img src={breach.logo} alt={breach.breach} 
                            style={{ width: "12vw", height: "auto", marginBottom: "10px" }} 
                        />
                    </div>

                    {/* Breach Details */}
                    <h3>{breach.breach} ({breach.xposed_date})</h3>
                    <p style={{ fontSize: "14px", color: "#ADADAD" }}>{breach.details}</p>
                
                    {/* Nutekinta informacija - Xposed Data */}
                    <p><strong>{t('info')}</strong></p>
                    <ul style={{ listStyleType: "disc", textAlign: "left", paddingLeft: "20px" }}>
                        {breach.xposed_data.split(";").map((item, idx) => (
                            <li style={{ padding: "0.05rem" }} key={idx}>{item.trim()}</li>  
                        ))}
                    </ul>

                    {/* Password Risk */}
                    <p><strong>{t('pswdRisk')}</strong> 
                        <span style={{ color: breach.password_risk === "plaintext" ? "red" : "orange" }}>
                            {breach.password_risk}
                        </span>
                    </p>  
                </div>
            ))}            
        </div>
    );
};

export default EmailBreachDetails;
