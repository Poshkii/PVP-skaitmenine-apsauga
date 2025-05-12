import React, {createContext, useContext, useEffect, useState} from 'react';

export interface AuthUser {
    userId: number;
    email: string;
    createdAt: string;
    lastLogin: string;
    verified: boolean;
    isPaid: boolean;
}

interface UserSessionContextType {
    user: AuthUser | null;
    refreshSession: () => Promise<void>;
    logoutSession: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType>({
    user: null,
    refreshSession: async () => {
    },
    logoutSession: async () => {
    },
});

const API_URL = useAppConfig().privacyApiUrl;

export const UserSessionProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const fetchUserProfile = async () => {
        try {
            const token = await browser.storage.local.get("token");

            if (!token) {
                return;
            }

            const response = await fetch(API_URL + '/users/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.token
                },
            });

            if (!response.ok) {
                return;
            }

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.log("Error while fetching profile:", error);
        }
    };


    useEffect(() => {
        fetchUserProfile();
    }, []);

    const refreshSession = async () => {
        await fetchUserProfile();
    }

    const logoutSession = async () => {
        try {
            const token = await browser.storage.local.get("token");

            if (!token) {
                return;
            }

            await fetch(API_URL + '/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.token
                },
            });
        } catch (error) {
            console.error('Error logging out:', error);
        }

        await browser.storage.local.remove("token");
        setUser(null);
    }

    // Context value
    const contextValue = {
        user,
        refreshSession: refreshSession,
        logoutSession: logoutSession
    };

    return (
        <UserSessionContext.Provider value={contextValue}>
            {children}
        </UserSessionContext.Provider>
    );
};

export const useUserSession = () => {
    const context = useContext(UserSessionContext);

    if (!context) {
        throw new Error('useUserSession must be used within a UserSessionProvider');
    }

    return context;
};