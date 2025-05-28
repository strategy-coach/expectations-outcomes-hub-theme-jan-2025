import { useEffect, useState } from "react";
import { getUserId } from "../../services/zitadel.services.ts";
import axios from "axios";
import React from "react";
import Cookies from "js-cookie";

const organizationId = import.meta.env
    .PUBLIC_ZITADEL_ORGANIZATION_ID as string;

interface ForgotPasswordProps {
    code?: string;
    userID?: string;
    email?: string;
}
interface CodeResetResponse {
    message?: string;
    status?: number;
    error?: string;
}
const ORGANIZATION = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ code, userID, email }) => {
    const [emailError, setEmailError] = useState("");
    const [userId, setUserId] = useState("");
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        verificationCode: "",
    });
    const [passwordValidationErrors, setpasswordValidationErrors] = useState({
        verificationCode: "",
        password: "",
        confirmPassword: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successNotification, setSuccessNotification] = useState({
        show: false,
        message: "",
    });
    const [passwordNotification, setPasswordNotification] = useState({
        isError: false,
        message: "",
        show: false,
    });

    useEffect(() => {
        if (code !== undefined && userID !== undefined) {
            setCredentials((prev) => ({ ...prev, verificationCode: code }));
            setUserId(userID);
        }
    }, []);

    const handleChangePassword = async (): Promise<void> => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

        setEmailError("");
        setpasswordValidationErrors({
            verificationCode: "",
            password: "",
            confirmPassword: "",
        });
        if (credentials.verificationCode == "") {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                verificationCode: "Please fill verification code",
            }));
            throw new Error("Please fill verification code");
        }
        if (credentials.password == "") {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                password: "Please fill password",
            }));
            throw new Error("Please fill password");
        }
        if (credentials.confirmPassword == "") {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                confirmPassword: "Please fill confirm password",
            }));
            throw new Error("Please fill confirm password");
        }
        if (!passwordRegex.test(credentials.password)) {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                password:
                    "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
            }));
            throw new Error(
                "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
            );
        }
        if (credentials.password !== credentials.confirmPassword) {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                confirmPassword: "Password does not match",
            }));
            throw new Error("Password does not match");
        }
        setIsSubmitting(true);
        const response = await axios.post<CodeResetResponse>(
            "/api/reset-password",
            {
                email: email ? email : credentials.email,
                userId,
                password: credentials.password,
                verificationCode: credentials.verificationCode,
            },
        );
        if (response.data.message == undefined) {
            setIsSubmitting(false);
            setPasswordNotification({
                show: true,
                isError: true,
                message:
                    typeof response.data.error === "string"
                        ? response.data.error === "Code not found"
                            ? "Verification already done with this code. Please sign in with the credentials."
                            : response.data.error
                        : "",
            });

            setTimeout(() => {
                setPasswordNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
            }, 2500);
        } else {
            if (email !== undefined) {
                Cookies.set("zitadel_tenant_id", ORGANIZATION);
                try {
                    const attributes = globalThis.setAttributes("User Login", {
                        loginStatus: "Password Changed",
                        email: email,
                    });
                    globalThis.setOTTracer("user-authentication", attributes);
                } catch (error) {
                    console.log(error)
                }
                Cookies.remove("zitadel_tenant_id");
            }
            setSuccessNotification({
                show: true,
                message: "Password Changed Successfully",
            });
            setTimeout(() => {
                setPasswordNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
                globalThis.location.href = "/login";
            }, 2000);
        }
    };

    const sendCode = async (): Promise<void> => {
        setIsSubmitting(true);
        setEmailError("");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (credentials.email.length === 0 || !emailRegex.test(credentials.email)) {
            setEmailError("Please enter a valid email address");
            throw new Error("Invalid email address");
        }

        const response = (await getUserId(
            credentials.email,
            organizationId,
        )) as unknown as { status: number; userId?: string; message: string };

        if (response.status === 200) {
            const sendCodeResponse = await axios.post<CodeResetResponse>(
                "/api/send-code",
                {
                    email: credentials.email,
                    userId: response.userId,
                },
            );
            if (sendCodeResponse.status == 200) {
                setSuccessNotification({
                    show: true,
                    message:
                        "Your verification code has been successfully sent to your email",
                });
                setCredentials((prev) => ({ ...prev, email: "" }));
            }
        } else {
            setEmailError(response.message ?? "");
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gray-100 bg-opacity-50">
                <div className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-700">
                    {passwordNotification.show && (
                        <div
                            className={`mt-4 text-left bg-${passwordNotification.isError ? "red" : "green"
                                }-100 border-t-4 mb-5 rounded-b px-4 py-3 shadow-md  relative ${passwordNotification.isError
                                    ? "border-red-500  text-red-900"
                                    : "border-green-500  text-green-900"
                                }`}
                            role="alert"
                        >
                            <span className="block sm:inline font-normal text-base">
                                {passwordNotification.message}
                            </span>
                        </div>
                    )}

                    {successNotification.show == true && (
                        <>
                            <div
                                className="mt-4 flex flex-col items-center text-center text-green-900"
                                role="alert"
                            >
                                <span className="font-bold text-md">
                                    {successNotification.message}
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-green-900 mt-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <div className="mt-6 w-full flex justify-start">
                                <a href="/login" className="text-blue-500 hover:underline text-sm">
                                    Back to Login
                                </a>
                            </div>

                        </>

                    )}

                    {successNotification.show == false && (
                        <>
                            {" "}
                            <div className="flex flex-col items-center justify-center pb-4 border-b">
                                <img
                                    src="/assets/images/logo.png"
                                    alt="Logo"
                                    className="w-16 mb-4"
                                />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                                    Reset Your Password
                                </h3>
                            </div>

                            {code === undefined && userID == undefined ? (
                                <div className="flex flex-col gap-3 py-4 pb-2">
                                    <div className="flex gap-3 w-full items-center">
                                        <input
                                            type="text"
                                            className="flex-1 mt-1 p-2 border rounded-lg border-gray-400  focus:ring-blue-600"
                                            onChange={(e) => {
                                                setCredentials((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }));
                                            }}
                                            value={credentials.email}
                                            placeholder="Enter Email"
                                        />
                                    </div>
                                    {emailError !== undefined && emailError !== "" && (
                                        <div className="rounded-md bg-red-50 p-4 mt-2">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        viewBox="0 0 12 16"
                                                        className="h-5 w-5 text-red-800"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                        ></path>
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800 notify">
                                                        {emailError}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${credentials.email === "" || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => {
                                            void sendCode();
                                        }}
                                        disabled={isSubmitting || credentials.email === ""}
                                    >
                                        {isSubmitting ? "processing..." : "Send Code"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="py-4 pb-2">
                                        <label className="block text-sm pb-1 font-medium text-gray-700 dark:text-gray-300">
                                            Verification Code
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex w-full ">
                                            <input
                                                type="text"
                                                className="flex-1 mt-1 p-2 border rounded-lg border-gray-400  focus:ring-blue-600"
                                                onChange={(e) => {
                                                    setCredentials((prev) => ({
                                                        ...prev,
                                                        verificationCode: e.target.value,
                                                    }));
                                                }}
                                                value={credentials.verificationCode}
                                                placeholder="Enter Verification Code"
                                            />
                                        </div>
                                        {passwordValidationErrors.verificationCode !== undefined &&
                                            passwordValidationErrors.verificationCode !== "" && (
                                                <div className="rounded-md bg-red-50 p-4 mt-2">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg
                                                                viewBox="0 0 12 16"
                                                                className="h-5 w-5 text-red-800"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-red-800 notify">
                                                                {passwordValidationErrors.verificationCode}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <label className="block text-sm font-medium pb-1 text-gray-700 dark:text-gray-300">
                                                New Password
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full mt-1 p-2 border rounded-lg border-gray-400  focus:ring-blue-600"
                                                placeholder="Enter new password"
                                                onChange={(e) => {
                                                    setCredentials((prev) => ({
                                                        ...prev,
                                                        password: e.target.value,
                                                    }));
                                                }}
                                                value={credentials.password}
                                            />
                                        </div>
                                        {passwordValidationErrors.password !== undefined &&
                                            passwordValidationErrors.password !== "" && (
                                                <div className="rounded-md bg-red-50 p-4 mt-2">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg
                                                                viewBox="0 0 12 16"
                                                                className="h-5 w-5 text-red-800"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-red-800 notify">
                                                                {passwordValidationErrors.password}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        <div>
                                            <label className="block text-sm font-medium pb-1 text-gray-700 dark:text-gray-300">
                                                Confirm New Password
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full mt-1 p-2 border rounded-lg border-gray-400  focus:ring-blue-600"
                                                placeholder="Confirm new password"
                                                value={credentials.confirmPassword}
                                                onChange={(e) => {
                                                    setCredentials((prev) => ({
                                                        ...prev,
                                                        confirmPassword: e.target.value,
                                                    }));
                                                }}
                                            />
                                        </div>
                                        {passwordValidationErrors.confirmPassword !== undefined &&
                                            passwordValidationErrors.confirmPassword !== "" && (
                                                <div className="rounded-md bg-red-50 p-4 mt-2">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg
                                                                viewBox="0 0 12 16"
                                                                className="h-5 w-5 text-red-800"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-red-800 notify">
                                                                {passwordValidationErrors.confirmPassword}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 bg-blue-600 w-full text-white rounded-lg hover:bg-blue-700 ${credentials.password === "" || credentials.confirmPassword === "" || credentials.verificationCode == "" ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => void handleChangePassword()}
                                        disabled={
                                            isSubmitting ||
                                            credentials.password === "" ||
                                            credentials.confirmPassword === "" ||
                                            credentials.verificationCode == ""
                                        }
                                    >
                                        {isSubmitting ? "processing..." : "Save Changes"}
                                    </button>
                                </>
                            )}
                            <div className="flex justify-between mt-4 text-sm">
                                <a href="/login" className="text-blue-500 hover:underline">
                                    Back To Login
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
