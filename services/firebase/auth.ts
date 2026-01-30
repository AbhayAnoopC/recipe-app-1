import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { auth } from './firebase';

// Firebase Auth service functions
export const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
    return await firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
