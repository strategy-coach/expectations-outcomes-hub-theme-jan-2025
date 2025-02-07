import React, { useEffect } from "react";

const LForms = window.LForms;

interface LHCFormsWidgetProps {
    data: string | number | boolean | null | Record<string, unknown> | unknown[];
}

const LHCFormsWidget: React.FC<LHCFormsWidgetProps> = ({ data }) => {

    useEffect(() => {
        if (data) {
            const formContainer = document.getElementById("form-container");
            if (formContainer) {
                LForms.Util.addFormToPage(data, formContainer); // Render the form from the data
            } else {
                console.error("Form container not found.");
            }
        }
    }, [data]);

    return (<div id="form-container"></div>);
};

export default LHCFormsWidget;
