import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Cookies from 'js-cookie';

const LForms = (window as any).LForms;
const userId = Cookies.get('zitadel_user_id');

interface LHCFormsWidgetProps {
    data: string | number | boolean | null | Record<string, unknown> | unknown[];
    fileName?: string;
    showData?: boolean;
}

const LHCFormsWidget: React.FC<LHCFormsWidgetProps> = ({ data, fileName, showData }) => {

    const [notification, setNotification] = useState<{ show: boolean; color: string; message: string }>({
        show: false,
        color: "",
        message: "",
    });

    const divNotificationRef = useRef<HTMLDivElement | null>(null);
    const formContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (data && formContainerRef.current) {
            LForms.Util.addFormToPage(data, formContainerRef.current); // Render the form from the data
        }
    }, [data]);

    const getLHCFormData = useCallback(async () => {
        const elementId = "#lhc-form-container";
        const isValid = LForms.Util.checkValidity(elementId);

        if (isValid === null) {

            const validationResult = LForms.Util.getFormData(
                elementId,
                false,
                false,
                true,
            );

            try {
                const response = await fetch('/api/saveForm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ formData: validationResult, userId: userId, fileName: fileName }),
                });

                if (!response.ok) throw new Error('Failed to save form data');

                const result = await response.json();
                LForms.Util.addFormToPage(data, formContainerRef.current);
                setNotification({ show: true, color: 'green', message: result.message });

            } catch (error) {
                setNotification({ show: true, color: 'red', message: `Error saving form data: ${error}` });
            }
        } else {
            setNotification({ show: true, color: 'red', message: 'Please complete all required fields accurately' });
        }

        // Scroll to the notification after form submission
        setTimeout(() => {
            divNotificationRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    const notificationClass = useMemo(() => {
        return `flex items-center p-4 mb-4 text-${notification.color}-800 rounded-lg bg-${notification.color}-50 dark:bg-gray-800 dark:text-${notification.color}-400`;
    }, [notification.color]);

    return (
        <>
            {notification.show && (
                <div ref={divNotificationRef} id="lhc-form-notification" className={notificationClass} role="alert">
                    <svg className="shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ms-3 text-sm font-medium">{notification.message}</div>
                    <button
                        type="button"
                        onClick={() => setNotification({ show: false, color: "", message: "" })}
                        className={`ms-auto -mx-1.5 -my-1.5 bg-${notification.color}-50 text-${notification.color}-500 rounded-lg focus:ring-2 focus:ring-${notification.color}-400 p-1.5 hover:bg-${notification.color}-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-${notification.color}-400 dark:hover:bg-gray-700`}
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            )}
            <div id="lhc-form-container" ref={formContainerRef}></div>
            {!showData &&
                <div className="w-full text-center "><button
                    onClick={getLHCFormData}
                    type="button"
                    className="mt-3 text-white bg-cyan-700 hover:bg-cyan-800 focus:ring-4 focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-cyan-600 dark:hover:bg-cyan-700 focus:outline-none dark:focus:ring-cyan-800"
                >
                    Submit
                </button></div>}
        </>
    );
};

export default LHCFormsWidget;
