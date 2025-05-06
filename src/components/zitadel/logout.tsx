import { JSX, useEffect } from "react";
import { clearUserRoleCache } from "./service.ts";
import Cookies from "js-cookie";
import React from "react";

const UserLogout: React.FC = (): JSX.Element => {
    useEffect(() => {
        const logout = async (): Promise<void> => {
            localStorage.clear();

            for (const cookie of document.cookie.split(";")) {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
            }

            const userId = Cookies.get("userId") as string;
            clearUserRoleCache(userId);
            console.log("All cookies and local storage cleared!");

            // Call backend logout endpoint
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });

            // Redirect after logout
            globalThis.location.href = "/login";
        };

        void logout();
    }, []);

    return <div>Logging out...</div>;
};

export default UserLogout;
