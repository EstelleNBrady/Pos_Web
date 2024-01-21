import {createContext} from "react";
const UserContext = createContext({});

export function UserContextProvider({children}){
    return (
    <div>
        {children}
    </div>
);
}