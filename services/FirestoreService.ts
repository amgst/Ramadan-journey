
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc } from "firebase/firestore";
import { UserData, GlobalState } from "../types";

const USERS_COLLECTION = "users";

export const FirestoreService = {
    // Save a single user's data to Firestore
    saveUser: async (userData: UserData) => {
        try {
            const userRef = doc(db, USERS_COLLECTION, userData.profile.id);
            await setDoc(userRef, userData, { merge: true });
            console.log(`User ${userData.profile.name} saved to Firestore.`);
        } catch (error) {
            console.error("Error saving user to Firestore:", error);
        }
    },

    // Fetch all users to populate GlobalState
    getAllUsers: async (): Promise<Record<string, UserData>> => {
        try {
            const usersCol = collection(db, USERS_COLLECTION);
            const snapshot = await getDocs(usersCol);
            const users: Record<string, UserData> = {};

            snapshot.forEach((doc) => {
                const data = doc.data() as UserData;
                // Ensure ID matches doc ID in case of drift, though we use ID as key
                users[doc.id] = data;
            });

            return users;
        } catch (error) {
            console.error("Error fetching users from Firestore:", error);
            return {};
        }
    },

    // Get a single user (optional util)
    getUser: async (userId: string): Promise<UserData | null> => {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                return docSnap.data() as UserData;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    },

    // Delete a user from Firestore
    deleteUser: async (userId: string) => {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);
            await deleteDoc(userRef);
            console.log(`User ${userId} deleted from Firestore.`);
        } catch (error) {
            console.error("Error deleting user from Firestore:", error);
        }
    }
};
