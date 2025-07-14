import React, { useState } from "react";

type DataTableProps = {
    data: { [key: string]: any }[];
};

const JsonList: React.FC<DataTableProps> = ({ data }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Toggle between dark and light mode
    const toggleMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    // Copy content to clipboard
    const copyToClipboard = () => {
        const jsonContent = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(jsonContent).then(
            () => {
                setIsCopied(true);  // Show toast
                setTimeout(() => setIsCopied(false), 2000);  // Hide toast after 2 seconds
            },
            (err) => {
                console.error("Failed to copy: ", err);
            }
        );
    };

    // Define light and dark mode styles
    const lightModeStyle = {
        backgroundColor: "#f5f5f5",
        color: "#000000",
        padding: "36px",
        borderRadius: "5px",
        whiteSpace: "pre-wrap" as const,
        fontFamily: "monospace" as const,
        position: "relative" as const,
    };

    const darkModeStyle = {
        backgroundColor: "#333333",
        color: "#f5f5f5",
        padding: "36px",
        borderRadius: "5px",
        whiteSpace: "pre-wrap" as const,
        fontFamily: "monospace" as const,
        position: "relative" as const,
    };

    return (
        <div>
            {/* Toast Notification */}
            {isCopied && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#4caf50",
                        color: "#fff",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        fontSize: "14px",
                        zIndex: 1000,
                    }}
                >
                    Copied to clipboard!
                </div>
            )}

            {/* JSON data display */}
            <pre style={isDarkMode ? darkModeStyle : lightModeStyle}>
                {JSON.stringify(data, null, 2)}

                {/* Moon and Sun icons for toggling dark mode */}
                <span
                    onClick={toggleMode}
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "40px",
                        cursor: "pointer",
                    }}
                >
                    {isDarkMode ? (
                        // Sun icon for light mode
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        // Moon icon for dark mode
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 12.79A9 9 0 0 1 12.79 21 9 9 0 0 1 3 12.79a9 9 0 0 1 9-9A9 9 0 0 1 21 12.79zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                        </svg>
                    )}
                </span>

                {/* Copy to Clipboard button */}
                <span
                    onClick={copyToClipboard}
                    title="Copy JSON to clipboard"
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        cursor: "pointer",
                    }}
                >
                    {/* Clipboard Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M10 3v4h4V3m0 4h4V1H6v6h4M14 17v-4h-4v4h4z"></path>
                    </svg>
                </span>
            </pre>
        </div>
    );
};

export default JsonList;
