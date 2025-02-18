import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Cookies from "js-cookie";

const LForms = (window as any).LForms;
const userId = Cookies.get("zitadel_user_id");

interface LHCFormsWidgetProps {
    data: string | number | boolean | null | Record<string, unknown> | unknown[];
    fileName?: string;
    allowSubmit?: boolean;
}

const LHCFormsWidget: React.FC<LHCFormsWidgetProps> = ({ data, fileName, allowSubmit }) => {
    const [notification, setNotification] = useState<{ show: boolean; color: string; message: string }>({
        show: false,
        color: "",
        message: "",
    });

    const [showLoader, setShowLoader] = useState(false);
    const divNotificationRef = useRef<HTMLDivElement | null>(null);
    const formContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (data && formContainerRef.current) {
            LForms.Util.addFormToPage(data, formContainerRef.current, { allowHTML: true });
        }

        return () => {
            if (formContainerRef.current) {
                formContainerRef.current.innerHTML = ""; // Cleanup to prevent memory leaks
            }
        };
    }, [data]);

    const getLHCFormData = useCallback(async () => {
        const elementId = "#lhc-form-container";
        const isValid = LForms.Util.checkValidity(elementId);

        if (isValid !== null) {
            setNotification({ show: true, color: "red", message: "Please complete all required fields accurately" });
            return;
        }

        setShowLoader(true);
        try {
            const validationResult = LForms.Util.getFormData(elementId, false, false, true);

            const response = await fetch("/api/saveForm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formData: validationResult, userId, fileName }),
            });

            if (!response.ok) throw new Error("Failed to save form data");

            const result = await response.json();
            LForms.Util.addFormToPage(data, formContainerRef.current);
            setNotification({ show: true, color: "green", message: result.message });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            setNotification({ show: true, color: "red", message: `Error saving form data: ${errorMessage}` });
        } finally {
            setShowLoader(false);
            setTimeout(() => divNotificationRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [data, fileName]);

    const notificationClass = useMemo(
        () => `flex items-center p-4 mb-4 text-${notification.color}-800 rounded-lg bg-${notification.color}-50 dark:bg-gray-800 dark:text-${notification.color}-400`,
        [notification.color]
    );

    return (
        <>
            {notification.show && (
                <div ref={divNotificationRef} id="lhc-form-notification" className={notificationClass} role="alert">
                    <svg className="shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <div className="ms-3 text-sm font-medium">{notification.message}</div>
                    <button
                        type="button"
                        onClick={() => setNotification({ show: false, color: "", message: "" })}
                        className={`ms-auto bg-${notification.color}-50 text-${notification.color}-500 rounded-lg p-1.5 hover:bg-${notification.color}-200 dark:bg-gray-800 dark:hover:bg-gray-700`}
                        aria-label="Close"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="relative">
                {showLoader && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                viewBox="0 0 100 101"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124..."
                                    fill="currentFill"
                                />
                            </svg>
                        </div>
                    </div>
                )}

                <div id="lhc-form-container" className={showLoader ? "opacity-25" : ""} ref={formContainerRef}></div>
            </div>

            {!allowSubmit && (
                <div className="w-full text-center">
                    <button onClick={getLHCFormData} type="button" disabled={showLoader} className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                        Submit
                    </button>
                </div>
            )}
        </>
    );
};

export default LHCFormsWidget;
