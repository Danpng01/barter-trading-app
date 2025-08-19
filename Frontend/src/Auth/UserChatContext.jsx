import React, { useReducer, useContext, useEffect } from "react";
import { useAuth } from './AuthContext.jsx';

const UserChatContext = React.createContext();

export function useChat() {
    return useContext(UserChatContext);
}

export const UserChatProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const INITIAL_STATE = {
        chatId: sessionStorage.getItem('chatId') || "null",
        user: JSON.parse(sessionStorage.getItem('user')) || {},
    };

    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                const newChatId = currentUser.uid > action.payload.uid 
                    ? currentUser.uid + action.payload.uid
                    : action.payload.uid + currentUser.uid;

                return {
                    user: action.payload,
                    chatId: newChatId,
                };
            
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    useEffect(() => {
        // Save chatId and user to sessionStorage before the page unloads
        const handleBeforeUnload = () => {
            sessionStorage.setItem('chatId', state.chatId);
            sessionStorage.setItem('user', JSON.stringify(state.user));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [state.chatId, state.user]);

    return (
        <UserChatContext.Provider value={{ data: state, dispatch }}>
            {children}
        </UserChatContext.Provider>
    );
};
