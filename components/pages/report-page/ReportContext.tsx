import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the interface for the report
interface Report {
    UrlScans: number;
    FileScans: number;
    ScannedEmails: { email: string; BreachCount: number }[];
}

// Create the context with an initial undefined value
const ReportContext = createContext<{
    report: Report;
    updateReport: (key: keyof Report, value: any) => Promise<void>;
    clearReport: () => Promise<void>;
    addScannedEmail: (email: string, breachCount: number) => Promise<void>;
} | undefined>(undefined);

// Provider component to wrap around the application
export const ReportProvider = ({ children }: { children: ReactNode }) => {
    // Default report state
    const defaultReport: Report = {
        UrlScans: 0,
        FileScans: 0,
        ScannedEmails: []
    };

    const [report, setReport] = useState<Report>(defaultReport);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial data from browser.storage.local
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const result = await browser.storage.local.get(["UrlScans", "FileScans", "ScannedEmails"]);
                
                setReport({
                    UrlScans: result.UrlScans ?? 0,
                    FileScans: result.FileScans ?? 0,
                    ScannedEmails: result.ScannedEmails ?? []
                });
            } catch (error) {
                console.error("Error loading data from browser.storage.local:", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadInitialData();
    }, []);

    // Function to update a specific property in the report
    const updateReport = async (key: keyof Report, value: any) => {
        try {
            // Update browser.storage.local
            await browser.storage.local.set({ [key]: value });
            
            // Update state
            setReport((prevReport) => ({
                ...prevReport,
                [key]: value
            }));
        } catch (error) {
            console.error(`Error updating ${key} in browser.storage.local:`, error);
        }
    };

    const addScannedEmail = async (email: string, breachCount: number) => {
        try {
            let updatedEmails;
            
            const existingIndex = report.ScannedEmails.findIndex((e) => e.email === email);
            
            if (existingIndex !== -1) {
                // Update existing email's breach count
                updatedEmails = report.ScannedEmails.map((e, i) =>
                    i === existingIndex ? { ...e, BreachCount: breachCount } : e
                );
            } else {
                // Add new scanned email
                updatedEmails = [...report.ScannedEmails, { email, BreachCount: breachCount }];
            }
            
            // Ensure that the array does not exceed 5 emails
            if (updatedEmails.length > 5) {
                updatedEmails = updatedEmails.slice(1); // Remove the first email (oldest)
            }
            
            // Update browser.storage.local
            await browser.storage.local.set({ ScannedEmails: updatedEmails });
            
            // Update state
            setReport((prevReport) => ({
                ...prevReport,
                ScannedEmails: updatedEmails
            }));
        } catch (error) {
            console.error("Error adding scanned email to browser.storage.local:", error);
        }
    };

    // Function to clear all stored data
    const clearReport = async () => {
        try {
            await browser.storage.local.remove(["UrlScans", "FileScans", "ScannedEmails"]);
            setReport(defaultReport);
        } catch (error) {
            console.error("Error clearing data from browser.storage.local:", error);
        }
    };

    if (!isLoaded) {
        return null; // Or a loading indicator
    }

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