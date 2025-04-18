import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the interface for the report
interface Report {
    UrlScans: number; // Reikia pasalinti
    FileScans: number; // Reikia pasalinti
    ScannedEmails: { email: string; BreachCount: number, timestamp: number }[];
    ScannedUrls: { url: string, Result: string, timestamp: number }[];
    ScannedPasswords: { hash: string, BreachCount: number }[];
    ScannedFiles: { name: string, Result: string, timestamp: number }[];
}

// Scanned file interface to maintain consistency
interface ScannedFile {
    name: string;
    safety: string;
    timestamp: number;
}

// Create the context with an initial undefined value
const ReportContext = createContext<{
    report: Report;
    updateReport: (key: keyof Report, value: any) => Promise<void>;
    clearReport: () => Promise<void>;
    addScannedEmail: (email: string, breachCount: number) => Promise<void>;
    addScannedUrl: (url: string, result: string) => Promise<void>;
    addScannedPaswd: (hash: string, breachCount: number) => Promise<void>;
    addScannedFile: (name: string, result: string) => Promise<void>;
} | undefined>(undefined);

// Provider component to wrap around the application
export const ReportProvider = ({ children }: { children: ReactNode }) => {
    // Default report state
    const defaultReport: Report = {
        UrlScans: 0,
        FileScans: 0,
        ScannedEmails: [],
        ScannedUrls: [],
        ScannedPasswords: [],
        ScannedFiles: []
    };

    const [report, setReport] = useState<Report>(defaultReport);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial data from browser.storage.local
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const result = await browser.storage.local.get(["UrlScans", "FileScans", "ScannedEmails",
                                                                "ScannedUrls", "ScannedPasswords", "scannedFiles"]);
                
                // Load data from shared scannedFiles array
                const scannedFiles = result.scannedFiles || [];
                
                // Convert to the required format for ScannedFiles
                const formattedFiles = scannedFiles.map((file: ScannedFile) => ({
                    name: file.name,
                    Result: file.safety,
                    timestamp: file.timestamp
                }));
                
                setReport({
                    UrlScans: result.UrlScans ?? 0,
                    FileScans: result.FileScans ?? 0,
                    ScannedEmails: result.ScannedEmails ?? [],
                    ScannedUrls: result.ScannedUrls ?? [],
                    ScannedPasswords: result.ScannedPasswords ?? [],
                    ScannedFiles: formattedFiles
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

            const timestamp = Date.now();
            
            if (existingIndex !== -1) {
                // Update the existing email if the breach count is different from the prior value
                updatedEmails = report.ScannedEmails.map((e, i) =>
                    i === existingIndex && (e.BreachCount !== breachCount)
                        ? { ...e, BreachCount: breachCount, timestamp }
                        : e
                );

            } else {
                // Add new scanned email
                updatedEmails = [...report.ScannedEmails, { email, BreachCount: breachCount, timestamp }];
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

    const addScannedUrl = async (url: string, result: string) => {
        try {
            let updatedUrls;
            
            const existingIndex = report.ScannedUrls.findIndex((e) => e.url === url);

            const timestamp = Date.now();

            
            
            if (existingIndex !== -1) {
                // Update the existing URL if the result is different from the prior value or if it's the first time there was a result
                updatedUrls = report.ScannedUrls.map((e, i) =>
                    i === existingIndex && (e.Result !== result)
                        ? { ...e, Result: result, timestamp }
                        : e
                );
                await browser.storage.local.set({ urlrestult: "duplicate" });
            } else {
                // Add new scanned URL
                updatedUrls = [...report.ScannedUrls, { url, Result: result, timestamp }];
            }
            
            // Update browser.storage.local
            await browser.storage.local.set({ ScannedUrls: updatedUrls });
            
            // Update state
            setReport((prevReport) => ({
                ...prevReport,
                ScannedUrls: updatedUrls
            }));
        } catch (error) {
            console.error("Error adding scanned url to browser.storage.local:", error);
        }
    };

    const addScannedPaswd = async (hash: string, breachCount: number) => {
        try {
            let updatedPaswd;
            
            const existingIndex = report.ScannedPasswords.findIndex((e) => e.hash === hash);
            
            if (existingIndex !== -1) {
                // Update existing email's breach count
                updatedPaswd = report.ScannedPasswords.map((e, i) =>
                    i === existingIndex ? { ...e, BreachCount: breachCount } : e
                );
            } else {
                // Add new scanned email
                updatedPaswd = [...report.ScannedPasswords, { hash, BreachCount: breachCount }];
            }
            
            // Ensure that the array does not exceed 5 emails
            if (updatedPaswd.length > 5) {
                updatedPaswd = updatedPaswd.slice(1); // Remove the first email (oldest)
            }
            
            // Update browser.storage.local
            await browser.storage.local.set({ ScannedPasswords: updatedPaswd });
            
            // Update state
            setReport((prevReport) => ({
                ...prevReport,
                ScannedPasswords: updatedPaswd
            }));
        } catch (error) {
            console.error("Error adding scanned password to browser.storage.local:", error);
        }
    };

    const addScannedFile = async (name: string, result: string) => {
        try {
            // Get existing scanned files
            const storage = await browser.storage.local.get(["scannedFiles"]);
            const filesArray = storage.scannedFiles || [];
            
            // Always add the new file (allowing duplicates)
            if (name !== "" && result !== "unknown"){
                filesArray.push({
                    name: name,
                    safety: result,
                    timestamp: Date.now()
                });
            }
            
            // Update browser.storage.local with the shared array
            await browser.storage.local.set({ scannedFiles: filesArray });
            
            // Update local state for the report context
            const formattedFiles = filesArray.map((file: ScannedFile) => ({
                name: file.name, 
                Result: file.safety,
                timestamp: file.timestamp
            }));
            
            setReport((prevReport) => ({
                ...prevReport,
                ScannedFiles: formattedFiles
            }));
        } catch (error) {
            console.error("Error adding scanned file to browser.storage.local:", error);
        }
    };

    // Function to clear all stored data
    const clearReport = async () => {
        try {
            await browser.storage.local.remove(["UrlScans", "FileScans", "ScannedEmails",
                                                "ScannedUrls", "ScannedPasswords", "scannedFiles"]);
            setReport(defaultReport);
        } catch (error) {
            console.error("Error clearing data from browser.storage.local:", error);
        }
    };

    if (!isLoaded) {
        return null; // Or a loading indicator
    }

    return (
        <ReportContext.Provider value={{ report, updateReport, clearReport, addScannedEmail, 
                                         addScannedFile, addScannedPaswd, addScannedUrl }}>
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
