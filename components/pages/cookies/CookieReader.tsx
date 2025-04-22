import { useState, useEffect } from "react";
import { Lock, Book, Trash2 } from "lucide-react";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import CookieTips from "./CookieTips";

function CookieReader() {
    const [activeTab, setActiveTab] = useState<"reader" | "tips">("reader");
    const [cookies, setCookies] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [domainFilter, setDomainFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    
    const classifyCookie = (cookie: any): string => {
        const name = cookie.name.toLowerCase();
        const domain = cookie.domain.toLowerCase();

        if (
            name.includes("ga") || name.includes("gid") || name.includes("utm") ||
            domain.includes("google-analytics") || domain.includes("analytics")
        ) {
            return "tracking";
        }

        if (
            domain.includes("doubleclick") || domain.includes("adnxs") || domain.includes("adservice")
        ) {
            return "advertisement";
        }

        if (
            name.includes("session") || name.includes("auth") || name.includes("csrf")
        ) {
            return "essential";
        }

        return "unknown";
    };

    const fetchCookies = () => {
        browser.runtime.sendMessage({ id: BgMessageId.GetCookies })
            .catch((err) => {
                console.error("Error sending message:", err);
                setError(`Error sending message to background: ${err.message}`);
            });
    };

    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.id === UiMessageId.CookiesRetrieved) {
                const enriched = message.data.map((c: any) => ({
                    ...c,
                    category: classifyCookie(c),
                    // Remove leading dot from domain if present
                    domain: c.domain.startsWith(".") ? c.domain.substring(1) : c.domain
                }));
                setCookies(enriched);
                setError(null);
            } else if (message.id === UiMessageId.CookiesError) {
                setError(message.data.message);
            }
        };

        browser.runtime.onMessage.addListener(handleMessage);
        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const handleClear = () => {
        setCookies([]);
    };

    // Get unique domains for the filter dropdown
    const uniqueDomains = Array.from(new Set(cookies.map(c => c.domain)));

    // Filter cookies based on domain and category filters
    const filtered = cookies.filter((c) => {
        const domainMatch = domainFilter === "all" || c.domain === domainFilter;
        const categoryMatch = categoryFilter === "all" || c.category === categoryFilter;
        return domainMatch && categoryMatch;
    });

    // Group cookies by domain and category
    const groupedCookies = filtered.reduce((acc: any, cookie: any) => {
        const key = `${cookie.domain}-${cookie.category}`;
        if (!acc[key]) {
            acc[key] = {
                domain: cookie.domain,
                category: cookie.category,
                quantity: 1,
                cookies: [cookie]
            };
        } else {
            acc[key].quantity += 1;
            acc[key].cookies.push(cookie);
        }
        return acc;
    }, {});

    // Convert grouped cookies object to array
    const groupedCookiesArray = Object.values(groupedCookies);

    const deleteCookiesInGroup = async (cookieGroup: any) => {
        for (const cookie of cookieGroup.cookies) {
            const protocol = cookie.secure ? "https://" : "http://";
            const url = `${protocol}${cookie.domain}${cookie.path}`;

            try {
                await browser.cookies.remove({ name: cookie.name, url });
            } catch (err) {
                console.error(`Failed to delete cookie "${cookie.name}":`, err);
            }
        }

        // Remove deleted cookies from state
        setCookies(prev => prev.filter(c => 
            !cookieGroup.cookies.some((groupCookie: any) => 
                groupCookie.name === c.name && 
                groupCookie.domain === c.domain && 
                groupCookie.path === c.path
            )
        ));
    };

    const deleteFilteredCookies = async () => {
        for (const cookie of filtered) {
            const protocol = cookie.secure ? "https://" : "http://";
            const url = `${protocol}${cookie.domain}${cookie.path}`;

            try {
                await browser.cookies.remove({ name: cookie.name, url });
            } catch (err) {
                console.error(`Error deleting cookie: ${cookie.name}`, err);
            }
        }

        setCookies(prev => prev.filter(c => !filtered.includes(c)));
    };

    return (
        <>
            <div className="middle-menu">
                <h1 className="panel-title">Read Stored Cookies</h1>

                <div className="tab-buttons">
                    <button
                        onClick={() => setActiveTab("reader")}
                        className={`btn ${activeTab === "reader" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Lock size={18} />
                            Cookie Reader
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("tips")}
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            Cookie Tips
                        </div>
                    </button>
                </div>

                {activeTab === "reader" && (
                    <>
                        <div className="security-check-container glassmorphism">
                            <div className="security-status">
                                <div className="status-icon">
                                    <Lock size={32} />
                                </div>
                                <div className="status-text">
                                    <h3 className="status-title">Read Stored Data</h3>
                                    <p className="status-description">
                                        Click to scan your browser for stored cookies.
                                    </p>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="btn btn-primary"
                                    style={{ width: "200px" }}
                                    onClick={fetchCookies}
                                    type="button"
                                >
                                    Read
                                </button>

                                <button
                                    disabled={cookies.length === 0}
                                    className="btn btn-secondary"
                                    style={{ width: "200px" }}
                                    onClick={handleClear}
                                    type="button"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {cookies.length > 0 && (
                            <>
                                <div style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
                                    <div>
                                        <label>Domain Filter: </label>
                                        <select 
                                            onChange={(e) => setDomainFilter(e.target.value)} 
                                            value={domainFilter}
                                        >
                                            <option value="all">All Domains</option>
                                            {uniqueDomains.map((domain, idx) => (
                                                <option key={idx} value={domain}>
                                                    {domain}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label>Category Filter: </label>
                                        <select 
                                            onChange={(e) => setCategoryFilter(e.target.value)} 
                                            value={categoryFilter}
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="essential">Essential</option>
                                            <option value="tracking">Tracking</option>
                                            <option value="advertisement">Advertisement</option>
                                            <option value="unknown">Unknown</option>
                                        </select>
                                    </div>
                                </div>

                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                                    <thead>
                                        <tr style={{ background: "#eee" }}>
                                            <th style={cellStyle}>Domain</th>
                                            <th style={cellStyle}>Category</th>
                                            <th style={cellStyle}>Qty</th>
                                            <th style={cellStyle}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedCookiesArray.map((group: any, idx) => (
                                            <tr key={idx}>
                                                <td style={cellStyle}>{group.domain}</td>
                                                <td style={cellStyle}>{group.category}</td>
                                                <td style={cellStyle}>{group.quantity}</td>
                                                <td style={cellStyle}>
                                                    <button
                                                        onClick={() => deleteCookiesInGroup(group)}
                                                        className="btn btn-danger"
                                                        style={{ fontSize: "12px", padding: "4px 4px" }}
                                                    >
                                                        <div className="button-content">
                                                            <Trash2 size={16} />
                                                        </div>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ marginTop: "10px" }}>
                                    <button
                                        className="btn btn-danger"
                                        onClick={deleteFilteredCookies}
                                        style={{ width: "200px" }}
                                    >
                                        Delete All Filtered
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {activeTab === "tips" && <CookieTips />}
            </div>
        </>
    );
}

const cellStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "6px",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
};

export default CookieReader;