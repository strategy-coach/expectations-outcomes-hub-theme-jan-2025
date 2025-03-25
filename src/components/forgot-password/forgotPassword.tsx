import { useEffect, useState } from "react";
import {
    getUserId,
    resetPassword,
    verifyEmail,
} from "../../services/zitadel.services.ts";
import { getOrganizationUsers } from "../../services/zitadel.services.ts";
import novuApiCall from "../../services/novu.service.ts";

const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;
const SITE_URL = import.meta.env.PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI as string;

interface ForgotPasswordProps {
    code?: string;
    userID?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ code, userID }) => {
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
        if (credentials.password !== credentials.confirmPassword) {
            setpasswordValidationErrors((prev) => ({
                ...prev,
                confirmPassword: "Password does not match",
            }));
            throw new Error("Password does not match");
        }
        const response = (await resetPassword(
            userId,
            credentials.password,
            credentials.verificationCode,
        )) as { status: number; message: string };
        if (response.status == 200) {
            const responseUser = await getOrganizationUsers(
                credentials.email,
            );

            if (responseUser?.result) {
                for (const user of responseUser.result) {
                    if (!user.human.email.isVerified) {
                        await verifyEmail(user.userId);
                    }
                    if (user.userId !== userId) {
                        await resetPassword(user.userId, credentials.password);
                    }
                }
            }
            setSuccessNotification({
                show: true,
                message: "Password Changed Successfully",
            });

            setCredentials({
                email: "",
                password: "",
                confirmPassword: "",
                verificationCode: "",
            });
            setTimeout(() => {
                setPasswordNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
                globalThis.location.href = "/logout";
            }, 1500);
        } else {
            setPasswordNotification({
                show: true,
                isError: true,
                message: response.message,
            });
            setTimeout(() => {
                setPasswordNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
            }, 2500);
        }
    };

    const sendCode = async (): Promise<void> => {
        setEmailError("");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (credentials.email.length === 0 || !emailRegex.test(credentials.email)) {
            setEmailError("Please enter a valid email address");
            throw new Error("Invalid email address");
        }

        const response = (await getUserId(
            credentials.email,
            ORGANIZATION_ID,
        )) as unknown as { status: number; userId?: string; message: string };

        if (response.status === 200) {
            await verifyEmail(response?.userId ?? "");
            const codeResponse = (await resetPassword(
                response?.userId ?? "",
            )) as unknown as {
                status: number;
                message: string;
                verificationCode?: string;
            };

            if (codeResponse.status === 200) {
                const params = `code=${codeResponse.verificationCode}&userId=${response.userId}`;
                const encodedParams = encodeURIComponent(params);
                const payload = {
                    code: codeResponse.verificationCode ?? "",
                    resetButton: "true",
                    button: `<div><a class="btn" href="${SITE_URL}forgot-password?${encodedParams}" target="_blank">Reset Password</a></div>`,
                };
                await novuApiCall("password-change", payload, credentials.email);
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
                            <span
                                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                onClick={() => {
                                    setPasswordNotification({
                                        show: false,
                                        isError: false,
                                        message: "",
                                    });
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 ${passwordNotification.isError
                                        ? "text-red-500"
                                        : "text-green-500"
                                        } cursor-pointer`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12M7 7l9 9M7 17l9-9"
                                    ></path>
                                </svg>
                            </span>
                        </div>
                    )}

                    {successNotification.show == true && (
                        <div
                            className="mt-4 flex flex-col items-center text-center text-green-900"
                            role="alert"
                        >
                            <span className="font-bold  text-md">
                                {successNotification.message}
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8  text-green-900 mt-1"
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
                    )}

                    {successNotification.show == false && (
                        <>
                            {" "}
                            <div className="flex items-center justify-center pb-4 border-b">
                                <h3 className="text-lg text-center font-semibold text-gray-900 dark:text-white">
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        onClick={() => {
                                            void sendCode();
                                        }}
                                    >
                                        Send Code
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
                                                className="w-full mt-1 p-2 rounded-lg border-gray-400 border focus:ring-blue-600"
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
                                                                className="w-full mt-1 p-2 border rounded-lg border-gray-400 focus:ring-blue-600"
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
                                        className="px-4 py-2 bg-blue-600 w-full text-white rounded-lg hover:bg-blue-700"
                                        onClick={() => void handleChangePassword()}
                                    >
                                        Save Changes
                                    </button>

                                </>
                            )}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
