import { createContext, useContext, useState, ReactNode } from "react";

// Define the interface for the report
interface Report {
    UrlScans: number;
    FileScans: number;
    ScannedEmails: { email: string; BreachCount: number }[];
}

// Create the context with an initial undefined value
const ReportContext = createContext<{
    report: Report;
    updateReport: (key: keyof Report, value: any) => void;
    clearReport: () => void;
    addScannedEmail: (email: string, breachCount: number) => void;
} | undefined>(undefined);

// Provider component to wrap around the application
export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) as T : defaultValue;
    };

    const saveToLocalStorage = (key: string, value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
        //browser.storage.local.set();
    };

    // Initialize state from localStorage
    const [report, setReport] = useState<Report>({
        UrlScans: getFromLocalStorage<number>("UrlScans", 0),
        FileScans: getFromLocalStorage<number>("FileScans", 0),
        ScannedEmails: getFromLocalStorage<{ email: string; BreachCount: number }[]>("ScannedEmails", [])
    });

    // Function to update a specific property in the report
    const updateReport = (key: keyof Report, value: any) => {
        setReport((prevReport) => {
            const updatedReport = { ...prevReport, [key]: value };
            saveToLocalStorage(key, value);
            return updatedReport;
        });
    };
    const addScannedEmail = (email: string, breachCount: number) => {
        setReport((prevReport) => {
            const existingIndex = prevReport.ScannedEmails.findIndex((e) => e.email === email);
            let updatedEmails;
    
            if (existingIndex !== -1) {
                // Update existing email's breach count
                updatedEmails = prevReport.ScannedEmails.map((e, i) =>
                    i === existingIndex ? { ...e, BreachCount: breachCount } : e
                );
            } else {
                // Add new scanned email
                updatedEmails = [...prevReport.ScannedEmails, { email, BreachCount: breachCount }];
            }
    
            // Ensure that the array does not exceed 5 emails
            if (updatedEmails.length > 5) {
                updatedEmails = updatedEmails.slice(1); // Remove the first email (oldest)
            }
    
            // Update report state and local storage
            const updatedReport = { ...prevReport, ScannedEmails: updatedEmails };
            saveToLocalStorage("ScannedEmails", updatedEmails);
            return updatedReport;
        });
    };

    // Function to clear all stored data
    const clearReport = () => {
        localStorage.removeItem("UrlScans");
        localStorage.removeItem("FileScans");
        localStorage.removeItem("ScannedEmails");
        setReport({ UrlScans: 0, FileScans: 0, ScannedEmails: [] });
    };

    return (
        <ReportContext.Provider value={{ report, updateReport, clearReport, addScannedEmail }}>
            {children}
        </ReportContext.Provider>
    );
};

// Custom hook for easier use of context
export const useReport = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error("useReport must be used within a ReportProvider");
    }
    return context;
};
