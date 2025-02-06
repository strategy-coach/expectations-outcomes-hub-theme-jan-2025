import React, { useEffect, useRef } from 'react';
// import 'lforms/dist/lforms.css';
import LForms from 'lforms';

const LHCFormsWidget = ({ file: string }) => {
    console.log(file)
    const formContainerRef = useRef(null);

    useEffect(() => {
        const loadFHIRSupport = async () => {
            // Ensure LForms is available globally
            window.LForms = LForms;
            await import('lforms/app/scripts/fhir/R4/fhirRequire.js');

            // Define the FHIR Questionnaire resource
            const questionnaire = {
                resourceType: 'Questionnaire',
                title: 'Sample Questionnaire',
                status: 'active',
                item: [
                    {
                        linkId: '1',
                        text: 'What is your name?',
                        type: 'string'
                    },
                    {
                        linkId: '2',
                        text: 'What is your age?',
                        type: 'integer'
                    }
                ]
            };

            // Render the form
            LForms.Util.addFormToPage(questionnaire, formContainerRef.current);
        };

        loadFHIRSupport();
    }, []);

    return <div ref={formContainerRef}></div>;
};

export default LHCFormsWidget;