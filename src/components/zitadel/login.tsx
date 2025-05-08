/* eslint-disable unicorn/no-null */
import { JSX, useState } from "react";
import { z } from "zod";
import axios from "axios";
// import LoginService from "../zitadel/LoginService";
import Cookies from "js-cookie";
import React from "react";


const loginSchema = z.object({
    email: z.string().email("Please provide a registered email address"),
    password: z.string().min(1, "Password must be at least 1 characters"),
});

interface UserSession {
    userId: string;
    userRole: string;
    username: string;
    givenName: string;
    familyName: string;
    displayName: string;
    email: string;
    validSession?: boolean;
}
interface AuthResponse extends UserSession {
    error?: string;
}



const ORGANIZATION = import.meta.env
    .PUBLIC_ZITADEL_ORGANIZATION_ID as string;

const setCookie = (key: string, value: string): void => {
    Cookies.set(key, value, { path: "/", secure: true });
};

const UserLogin: React.FC = (): JSX.Element => {
    const [userSession, setUserSession] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {},
    );
    const [notification, setNotification] = useState({
        message: "",
        show: false,
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: undefined }));
    };

    const validateForm = (): boolean => {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Partial<
                Record<keyof z.infer<typeof loginSchema>, string[]>
            > = result.error.flatten().fieldErrors;

            setErrors({
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
            });
            return false;
        }
        return true;
    };

    const onSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError(null);
        setNotification({ show: false, message: "" });
        try {
            const response = await axios.post<AuthResponse>("/api/auth", {
                email: formData.email,
                password: formData.password,
            });
            if (response.data.userId === undefined) {
                Cookies.set("zitadel_tenant_id", ORGANIZATION);

                try {
                    const attributes = globalThis.setAttributes("User Login", {
                        loginStatus: "Authentication Failed",
                        email: formData.email,
                    });
                    globalThis.setOTTracer("user-authentication", attributes);
                } catch (error) {
                    console.log(error)
                }
                Cookies.remove("zitadel_tenant_id");
                response.data.error == "User is locked" ? setNotification({
                    message: response.data.error,
                    show: true,
                }) : setErrors({ email: response.data.error });

            } else {
                const isValidSession = await axios.post<AuthResponse>("/api/auth", {
                    userID: response.data.userId,
                });
                if (isValidSession.data.validSession == true) {
                    setUserSession({
                        userId: response.data.userId,
                        email: response.data.email,
                        username: response.data.username,
                        givenName: response.data.givenName,
                        familyName: response.data.familyName,
                        displayName: response.data.displayName,
                        userRole: response.data.userRole,
                    });
                    const userRole = response.data.userRole;
                    setCookie("zitadel_user_name", response.data.displayName ?? "");
                    setCookie("zitadel_user_email", response.data.email ?? "");
                    setCookie("zitadel_user_id", response.data.userId ?? "");
                    setCookie("zitadel_tenant_id", ORGANIZATION);

                    if (userRole) {
                        setCookie("zitadel_user_role", userRole);
                        try {
                            const attributes = globalThis.setAttributes("User Login", {
                                loginStatus: "Successful"
                            });
                            globalThis.setOTTracer("user-authentication", attributes);

                        } catch (error) {
                            console.log(error)
                        }
                        globalThis.location.href = "/";
                    } else {
                        globalThis.location.href = "/no-permission";
                    }

                } else {
                    globalThis.location.href = "/logout";
                }
            }
        } catch {
            setError("Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen  bg-gray-100">
            <div className=" p-8 rounded-lg shadow-lg w-96 ">
                {notification.show ? (
                    <>
                        <div
                            className="mt-4 flex flex-col items-center text-center text-red-900"
                            role="alert"
                        >
                            {notification.message == "User is locked" ?
                                <span className="font-semibold text-md">
                                    Your account has been temporarily locked due to multiple unsuccessful login attempts. Please contact the administrator at{" "}
                                    <a href="mailto:admin@opsfolio.com" className="text-blue-500 underline">
                                        admin@opsfolio.com
                                    </a>{" "}
                                    for assistance.
                                </span> : <span className="font-semibold text-md">
                                    {notification.message}
                                </span>
                            }
                        </div>

                        <div className="mt-6 w-full flex justify-start">
                            <a href="/login" className="text-blue-500 hover:underline text-sm">
                                Back to Login
                            </a>
                        </div>

                    </>
                ) : (<> <img
                    src="/assets/images/logo.png"
                    alt="Logo"
                    className="w-16 mx-auto mb-4"
                />
                    <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
                    {error != null && <p className="text-red-500 text-center">{error}</p>}
                    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            disabled={userSession?.userId != undefined}
                        />
                        {errors.email != null && (
                            <p className="text-red-500">{errors.email}</p>
                        )}

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            autoComplete="current-password"
                        />
                        {errors.password != null && (
                            <p className="text-red-500">{errors.password}</p>
                        )}
                        <button
                            type="submit"
                            className={`w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50 ${loading || formData.email === "" || formData.password === ""
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                            disabled={
                                loading || formData.email === "" || formData.password === ""
                            }
                        >
                            {loading ? "Processing..." : "Login"}
                        </button>
                    </form>
                    <div className="flex justify-between mt-4 text-sm">
                        <a href="/reset-password" className="text-blue-500 hover:underline">
                            Forgot Password?
                        </a>

                    </div>
                </>)}

            </div>
        </div>
    );
};

export default UserLogin;
