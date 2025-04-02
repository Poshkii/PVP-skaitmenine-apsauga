import { useState, useEffect } from "react";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";

const CookiesData = () => {
    const [cookies, setCookies] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchCookies = () => {
        // Send a message to the background script to retrieve cookies
        browser.runtime.sendMessage({ id: BgMessageId.GetCookies })
            .catch((err) => {
                console.error("Error sending message:", err);
                setError(`Error sending message to background: ${err.message}`);
            });
    };

    // Listen for the response from the background script when the component mounts
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.id === UiMessageId.CookiesRetrieved) {
                setCookies(message.data); // Set cookies in state
                setError(null); // Clear any previous error
            } else if (message.id === UiMessageId.CookiesError) {
                setError(message.data.message); // Set the error message
            }
        };

        browser.runtime.onMessage.addListener(handleMessage);

        // Cleanup the listener when the component unmounts
        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Cookie Reader</h1>
            <button onClick={fetchCookies} style={{ padding: "10px", marginBottom: "10px", cursor: "pointer" }}>
                Get Cookies
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {cookies.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                    <thead>
                        <tr style={{ background: "#ddd" }}>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>Name</th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>Value</th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>Domain</th>
                            <th style={{ border: "1px solid #000", padding: "5px" }}>Path</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cookies.map((cookie, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #000" }}>
                                <td style={{ border: "1px solid #000", padding: "5px" }}>{cookie.name}</td>
                                <td style={{ border: "1px solid #000", padding: "5px" }}>{cookie.value}</td>
                                <td style={{ border: "1px solid #000", padding: "5px" }}>{cookie.domain}</td>
                                <td style={{ border: "1px solid #000", padding: "5px" }}>{cookie.path}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No cookies retrieved.</p>
            )}
        </div>
    );
};

export default CookiesData;
