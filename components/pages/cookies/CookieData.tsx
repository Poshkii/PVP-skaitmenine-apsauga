import { useState, useEffect } from "react";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import { CSSProperties } from "react";
import { useTranslation } from "react-i18next";


const CookiesData = ({ cookieData } : {cookieData: any[] }) => {
    const cookies = cookieData;
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation('cookies');

    const tableHeaderStyle = {
        border: "1px solid #000",
        padding: "5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "150px", // Adjust based on your needs
    };

    const truncatedStyle = {
        border: "1px solid #000",
        padding: "5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "200px", // Adjust width as needed
        display: "block"
    };

    const wrappedStyle: CSSProperties = {
        border: "1px solid #000",
        padding: "5px",
        overflowWrap: "break-word", // Corrected type
        whiteSpace: "normal",
        maxWidth: "150px", // Adjust width as needed
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>{t('reader')}</h1>            
            {error && <p style={{ color: "red" }}>{error}</p>}
            {cookies.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                    <tr style={{ background: "#ddd" }}>
                        <th style={tableHeaderStyle}>{t('name')}</th>
                        <th style={tableHeaderStyle}>{t('value')}</th>
                        <th style={tableHeaderStyle}>{t('domain')}</th>
                    </tr>
                </thead>
                <tbody>
                    {cookies.map((cookie, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #000" }}>
                            <td style={wrappedStyle}>{cookie.name}</td>
                            <td style={wrappedStyle}>{cookie.value}</td>
                            <td style={wrappedStyle}>{cookie.domain}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            ) : (
                <p>{t('noCookies')}</p>
            )}
        </div>
    );
};

export default CookiesData;
