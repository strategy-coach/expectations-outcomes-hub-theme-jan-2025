import React, { useEffect } from "react";
import * as LForms from "lforms";

interface LHCFormsWidgetProps {
    fileName: string;
}

const LHCFormsWidget: React.FC<LHCFormsWidgetProps> = ({ fileName }) => {

    useEffect(() => {
        // Use the fileName prop to dynamically load the JSON
        if (fileName) {
            fetch(`src/content/lforms/${fileName}`)
                .then((response) => response.json())
                .then((data) => {
                    const formContainer = document.getElementById("form-container");

                    if (formContainer) {
                        // Render the form inside the container
                        LForms.Util.addFormToPage(data, formContainer);
                    } else {
                        console.error("Form container not found.");
                    }
                })
                .catch((error) => console.error('Error fetching data:', error));
        }
    }, []);

    return (<div id="form-container"></div>);
};

export default LHCFormsWidget;