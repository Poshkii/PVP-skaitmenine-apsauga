import { useState, useEffect } from "react";
import { Cookie, Book, Trash2 } from "lucide-react";
import { BgMessageId } from "@/entrypoints/content/types/bg-message";
import { UiMessageId } from "@/entrypoints/content/types/ui-message";
import CookieTips from "./CookieTips";
import Select from 'react-select';
import { StylesConfig } from 'react-select';
import { useTranslation } from "react-i18next";
import cookiesData from './cookiesData.json';
import {useNavigate} from "react-router";
import { ChevronDown, ChevronUp, Info, CircleAlert, CircleX, CircleCheckBig } from 'lucide-react';

interface Cookie {
    name: string;
    domain: string;
    path: string;
    category: string;
    secure: boolean;
}

interface CookieGroup {
    domain: string;
    category: string;
    quantity: number;
    cookies: Cookie[];
}

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

// Toast notification component
const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3 seconds
        
        return () => clearTimeout(timer);
    }, [onClose]);
    
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CircleCheckBig size={20} />;
            case 'error':
                return <CircleX size={20} />;
            case 'info':
                return <Info size={20} />;
            default:
                return null;
        }
    };
    
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'var(--accent-gradient)';
            case 'error':
                return 'rgba(220, 38, 38, 0.9)';
            case 'info':
                return 'rgba(59, 130, 246, 0.9)';
            default:
                return 'rgba(100, 116, 139, 0.9)';
        }
    };
    
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                background: getBackgroundColor(),
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
                maxWidth: '300px',
                backdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.3s ease-out'
            }}
        >
            {getIcon()}
            <div style={{ flex: 1 }}>{message}</div>
            <button 
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
                <CircleX size={16} />
            </button>
        </div>
    );
};

function CookieReader() {
    const [showResults, setShowResults] = useState(false);
    const [activeTab, setActiveTab] = useState<"reader" | "tips">("reader");
    const [cookies, setCookies] = useState<Cookie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [domainFilter, setDomainFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const { t } = useTranslation('cookies');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [skipConfirmation, setSkipConfirmation] = useState(
        localStorage.getItem("skipClearConfirmation") === "true"
    );
    const navigate = useNavigate();
    
    // Toast notification state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        show: false,
        message: '',
        type: 'info'
    });

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    // Hide toast notification
    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Adjusted classifyCookie using external JSON data
    const classifyCookie = (cookie: Cookie): string => {
        const { domain, name } = cookie;       
        for (const [cookieName, cookieInfo] of Object.entries(cookiesData)) {
            for (const info of cookieInfo) {
                // Checking against both domain and cookie name
                if (domain.includes(info.domain) && (name.toLowerCase().includes(info.cookie.toLowerCase()))) {
                    return t(info.category.toLowerCase());
                }
            }
        }
        return t('unknown');
    };

    const fetchCookies = () => {
        browser.runtime.sendMessage({ id: BgMessageId.GetCookies })
            .catch((err) => {
                console.error("Error sending message:", err);
                setError(`Error sending message to background: ${err.message}`);
                showToast(`Error loading cookies: ${err.message}`, 'error');
            });
    };

    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.id === UiMessageId.CookiesRetrieved) {
                const enriched = message.data.map((c: Cookie) => ({
                    ...c,
                    category: classifyCookie(c),
                    domain: c.domain.startsWith(".") ? c.domain.substring(1) : c.domain
                }));
                setCookies(enriched);
                setError(null);
                setShowResults(true);
            } else if (message.id === UiMessageId.CookiesError) {
                setError(message.data.message);
                showToast(`Error: ${message.data.message}`, 'error');
            }
        };

        browser.runtime.onMessage.addListener(handleMessage);
        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const handleClear = () => {     
        setShowResults(false);   
        setCookies([]);        
    };

    const clearData = () => {
        if (skipConfirmation) {
            handleClear();
        } else {
            setShowConfirmModal(true);
        }
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

    const domainOptions = [
        { value: 'all', label: t('allDomains') },
        ...uniqueDomains.map(domain => ({ value: domain, label: domain }))
    ];
      
    const categoryOptions = [
        { value: 'all', label: t('allCategories') },
        { value: t('functional'), label: t('functional') },
        { value: t('analytics'), label: t('analytics') },
        { value: t('marketing'), label: t('marketing') },
        { value: t('unknown'), label: t('unknown') }
    ];

    // Convert grouped cookies object to array
    const groupedCookiesArray = Object.values(groupedCookies);

    const deleteCookiesInGroup = async (cookieGroup: any) => {
        const totalCount = cookieGroup.cookies.length;
        let successCount = 0;
        
        for (const cookie of cookieGroup.cookies) {
            const protocol = cookie.secure ? "https://" : "http://";
            const url = `${protocol}${cookie.domain}${cookie.path}`;

            try {
                await browser.cookies.remove({ name: cookie.name, url });
                successCount++;
            } catch (err) {
                console.error(`Failed to delete cookie "${cookie.name}":`, err);
                showToast(`Failed to delete cookie "${cookie.name}"`)
            }
        }

        // Remove deleted cookies from state
        setCookies(prev => {
            const updatedCookies = prev.filter(c => 
                !cookieGroup.cookies.some((groupCookie: any) => 
                    groupCookie.name === c.name && 
                    groupCookie.domain === c.domain && 
                    groupCookie.path === c.path
                )
            );
            
            // If there are no cookies left after deletion, set showResults to false
            if (updatedCookies.length === 0) {
                setShowResults(false);
            }
            
            return updatedCookies;
        });
        
        // Show success message
        showToast(
            `Successfully deleted ${successCount} ${successCount === 1 ? 'cookie' : 'cookies'} from ${cookieGroup.domain}`,
            'success'
        );
    };

    const deleteFilteredCookies = async () => {
        const count = filtered.length;
        let successCount = 0;
        
        for (const cookie of filtered) {
            const protocol = cookie.secure ? "https://" : "http://";
            const url = `${protocol}${cookie.domain}${cookie.path}`;

            try {
                await browser.cookies.remove({ name: cookie.name, url });
                successCount++;
            } catch (err) {
                console.error(`Error deleting cookie: ${cookie.name}`, err);
            }
        }

        setCookies(prev => prev.filter(c => !filtered.includes(c)));
        setShowResults(filtered.length === cookies.length);
        
        // Show success message
        showToast(
            `Successfully deleted ${successCount} ${successCount === 1 ? 'cookie' : 'cookies'}`,
            'success'
        );
    };

    type OptionType = { value: string; label: string };

    const customSelectStyles: StylesConfig<OptionType, false> = {
    control: (base, state) => ({
        ...base,
        backgroundColor: "transparent",
        color: "var(--text-primary)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "var(--border-radius-lg)",
        minHeight: "44px", 
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "none",
        transition: "all var(--transition-medium)",
        display: "flex",
        alignItems: "center",
        "&:hover": {
            borderColor: "var(--accent-primary)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "var(--accent-primary)",
        },
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
        ? "rgba(255, 255, 255, 0.05)"
        : "transparent",
        color: "var(--text-primary)",
        cursor: "pointer",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "all var(--transition-medium)",
        "&:hover": {
        color: "var(--accent-primary)",
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: "var(--text-primary)",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "rgba(15, 23, 42, 0.99)",
        borderRadius: "var(--border-radius-md)",
        marginTop: "4px",
        overflow: "hidden",
        zIndex: 10,
    }),
    indicatorSeparator: () => ({
        display: "none",
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: "var(--text-primary)",
        "&:hover": {
        color: "var(--accent-primary)",
        },
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    menuList: (base) => ({
        ...base,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }
    }),
    };    
    
    const tableStyles: React.CSSProperties = {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginTop: "15px",
        overflow: "hidden",
        borderRadius: "var(--border-radius-md)",
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      };
      
      const headerCellStyle: React.CSSProperties = {
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        color: "var(--text-primary)",
        padding: "12px 16px",
        fontWeight: "600",
        fontSize: "14px",
        textAlign: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      };
      
      const cellStyle: React.CSSProperties = {
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        maxWidth: "200px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "13px",
        transition: "background-color 0.2s"
      };
      
      const rowStyle = (idx: number): React.CSSProperties => ({
        backgroundColor: idx % 2 === 0 ? "rgba(15, 23, 42, 0.2)" : "rgba(30, 41, 59, 0.2)",
        transition: "background-color 0.3s"
      });

    return (
        <>
            <div style={{paddingBottom: 0}} className="middle-menu">
                <h1 className="panel-title">{t('title')}<span onClick={() => navigate("/cookies-data")}><Info className="info-icon"/></span></h1>    

                <div className="tab-buttons">
                    <button
                        onClick={() => setActiveTab("reader")}
                        className={`btn ${activeTab === "reader" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Cookie size={18} />
                            {t('reader')}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("tips")}
                        className={`btn ${activeTab === "tips" ? "btn-primary" : "btn-secondary"} tab-button`}
                    >
                        <div className="button-content">
                            <Book size={18} />
                            {t('tips')}
                        </div>
                    </button>
                </div>

                {activeTab === "reader" && (
                    <>
                        {!showResults ? (
                        <>
                            <div className="security-check-container glassmorphism">
                                <div className="security-status">
                                    <div className="status-icon">
                                        <Cookie size={30} />
                                    </div>
                                    <div className="status-text">
                                        <h3 className="status-title">{t('readStoredData')}</h3>
                                        <p className="status-description">
                                            {t('click')}
                                        </p>
                                    </div>
                                </div>

                                <div className="action-buttons" style={{display:"flex", justifyContent:"center"}}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={fetchCookies}
                                        type="button"
                                    >
                                        {t('read')}
                                    </button>
                                </div>
                            </div>
                        </>
                        ) : (
                            <>
                                <div className="security-check-container glassmorphism" style={{padding:"0"}}>
                                    {cookies.length == 0 && (
                                        <>
                                            <div style={{padding:"20px 24px"}}>
                                                <div className="security-status">
                                                    <div className="status-icon">
                                                        <Info size={30} />
                                                    </div>
                                                    <div className="status-text">
                                                        <h3 className="status-title">{t('noCookies')}</h3>
                                                        <p className="status-description">{t('tryAgain')}</p>
                                                    </div>
                                                </div>

                                                <div className="action-buttons" style={{display:"flex", justifyContent:"center"}}>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => setShowResults(false)}
                                                        type="button"
                                                    >
                                                        {t('back')}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {cookies.length > 0 && (
                                    <>
                                        {/* <div className="security-check-container glassmorphism"> */}
                                            <div>
                                            <div style={{ width: "100%", display: "flex", gap: "10px", padding: "16px 16px 0 16px" }}>
                                                <div style={{ width: "50%" }}>
                                                    <Select
                                                        options={domainOptions}
                                                        value={domainOptions.find(opt => opt.value === domainFilter)}
                                                        onChange={(selectedOption) => {
                                                            if (selectedOption) {
                                                                setDomainFilter(selectedOption.value);
                                                            }
                                                        }}
                                                        menuPortalTarget={document.body}
                                                        styles={ customSelectStyles }
                                                        />
                                                </div>
                                                <div style={{ width: "50%" }}>
                                                    <Select                                            
                                                        options={categoryOptions}
                                                        value={categoryOptions.find(opt => opt.value === categoryFilter)}
                                                        onChange={(selectedOption) => {
                                                            if (selectedOption) {
                                                                setCategoryFilter(selectedOption.value);
                                                            }
                                                        }}
                                                        menuPortalTarget={document.body}
                                                        styles={ customSelectStyles }
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div style={{ width: "100%" }}>
                                                <table style={tableStyles}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{...headerCellStyle, textAlign: "left"}}>{t('domain')}</th>
                                                            <th style={headerCellStyle}>{t('category')}</th>
                                                            <th style={headerCellStyle}>{t('qty')}</th>
                                                            <th style={headerCellStyle}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {groupedCookiesArray.map((group: any, idx) => (
                                                            <tr key={idx} style={rowStyle(idx)}>
                                                                <td style={cellStyle}>{group.domain}</td>
                                                                <td style={{
                                                                    ...cellStyle,
                                                                    color: group.category === t('marketing') ? "var(--error-color, #ff4747)" : 
                                                                        group.category === t('functional') ? "var(--success-color, #47cf73)" :
                                                                        group.category === t('analytics') ? "var(--warning-color, #ffbb47)" : 
                                                                        "var(--text-secondary, #a0aec0)",
                                                                    textAlign: "center"
                                                                }}>
                                                                    {group.category}
                                                                </td>
                                                                <td style={{...cellStyle, textAlign: "center"}}>{group.quantity}</td>
                                                                <td style={{ ...cellStyle, textAlign: "center", padding: "6px" }}>
                                                                    <button
                                                                        onClick={() => deleteCookiesInGroup(group)}
                                                                        className="btn btn-danger"
                                                                        style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "4px" }}
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
                                            </div>
                                            <div style={{padding:"0 0 16px 0", display: "flex", justifyContent:"center"}}>
                                                <div className="action-buttons">
                                                    <button className="btn btn-danger" onClick={deleteFilteredCookies}>
                                                        {t('deleteAllFiltered')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

                {activeTab === "tips" && <CookieTips/>}

                {showConfirmModal && (
                <div 
                    
                    style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    justifyContent: "center", alignItems: "center", zIndex: 9999
                }}>
                    <div 
                    className="security-check-container glassmorphism"
                    style={{
                    backgroundColor: "var(--bg-primary)", padding: "30px", borderRadius: "8px",
                    width: "90%", maxWidth: "400px", textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                    }}>
                    <h2 className="panel-title" style={{marginBottom: "20px" }}>
                        {t('confirmClear')}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                        {t('areYouSure')}
                    </p>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                        <input
                            type="checkbox"
                            onChange={(e) => {
                            if (e.target.checked) {
                                localStorage.setItem("skipClearConfirmation", "true");
                                setSkipConfirmation(true);
                            } else {
                                localStorage.removeItem("skipClearConfirmation");
                                setSkipConfirmation(false);
                            }
                            }}
                            defaultChecked={skipConfirmation}
                            style={{ marginRight: "8px" }}
                        />
                        {t('dontAsk')}
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button
                        onClick={() => {
                            handleClear();
                            setShowConfirmModal(false);
                            showToast(t('cookiesCleared'), 'success');
                        }}
                        className="btn btn-danger"
                        style={{ width: "120px" }}
                        >
                        {t('clear')}
                        </button>
                        <button
                        onClick={() => setShowConfirmModal(false)}
                        className="btn btn-secondary"
                        style={{ width: "120px" }}
                        >
                        {t('cancel')}
                        </button>
                    </div>
                    </div>
                </div>
                )}

                {toast.show && (
                    <Toast 
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
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