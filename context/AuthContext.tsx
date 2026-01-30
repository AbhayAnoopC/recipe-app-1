import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { signIn, signUp, signOut, subscribeToAuthChanges } from '../services/firebase/auth';

type AuthContextType = {
    user: User | null;
    initializing: boolean;
    login: (email, password) => Promise<void>;
    signup: (email, password) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user) => {
            setUser(user);
            if (initializing) setInitializing(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        await signIn(email, password);
    };

    const signup = async (email, password) => {
        await signUp(email, password);
    };

    const logout = async () => {
        await signOut();
    };

    return (
        <AuthContext.Provider value={{ user, initializing, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
