document.addEventListener("DOMContentLoaded", () => {    
    // Utility: Dynamically load a script
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.type = "text/javascript";
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    };

    // Utility: Sanitize user input
    const sanitizeInput = (input) => {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    };

    // Utility: Validate email
    //const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Utility: Validate non-empty input
    const isNotEmpty = (input) => input.trim().length > 0;

    // HTML ID and Class Variables
    const ELEMENTS = {
        widget: "github-contact-us-widget",
        popupOverlay: "github-contact-us-widget-popup-overlay",
        popup: "github-contact-us-widget-popup",
        successNotification: "github-contact-us-widget-success-notification",
        emailInput: "github-contact-us-email",
        emailInvalidError: "github-contact-us-email-invalid",
        userNameInput: "github-contact-us-username",
        usernameEmptyError: "github-contact-us-username-empty",
        subjectInput: "github-contact-us-subject",
        subjectEmptyError: "github-contact-us-subject-empty",
        messageInput: "github-contact-us-message",
        messageEmptyError: "github-contact-us-message-empty",
        screenshotCanvas: "github-contact-us-screenshot-canvas",
        attachScreenshot: "github-contact-us-attach-screenshot",
        loader: "github-contact-us-loader",
        submitButton: "github-contact-us-submit"
    };

    // Function: Capture screenshot of the page
    const captureScreenshot = async () => {
        try {
           /* global html2canvas */
            const canvas = await html2canvas(document.body);
            const screenshotCanvas = document.getElementById(ELEMENTS.screenshotCanvas);
            screenshotCanvas.width = canvas.width / 2;
            screenshotCanvas.height = canvas.height / 2;
            screenshotCanvas.getContext("2d").drawImage(canvas, 0, 0, screenshotCanvas.width, screenshotCanvas.height);
            screenshotCanvas.style.display = "block";
        } catch (error) {
            console.error("Error capturing screenshot:", error);
        }
    };
   
    
  const callSupportAPI = async (type, data) => {
    const response = await fetch("/api/support-and-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, type }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Unknown error");
    }

    return response.json();
  };

  const createGitHubIssue = async (
    formData,
    submissionDate,
    screenshotBase64,
    currentURL
  ) => {
    return await callSupportAPI("createIssue", {
      formData,
      submissionDate,
      screenshotBase64,
      currentURL,
    });
  };

  const sendAdminMail = async (payload) => {
    return await callSupportAPI("sendAdminMail", {
      formData: payload,
    });
  };

  const sendAcknowledgementMail = async (formData) => {
    return await callSupportAPI("sendAcknowledgement", {
      formData,
    });
  };
      
    // Error handling and UI manipulation
    const clearErrors = () => {
        const errorElementIds = [
            ELEMENTS.emailInvalidError,
            ELEMENTS.usernameEmptyError,
            ELEMENTS.subjectEmptyError,
            ELEMENTS.messageEmptyError
        ]
        errorElementIds.forEach(id => {
            const errorElement = document.getElementById(id);
            if (errorElement) {
                errorElement.style.display = "none";
            }
        });
        const notification = document.getElementById(ELEMENTS.successNotification);
        notification.style.display = "none";
    };

    const showError = (id) => {
        document.getElementById(id).style.display = "block";
    };

    // Function: Initialize and render widget and popup
    const initContactWidget = async () => {
        const email = window.widgetConfig.USER_EMAIL !== "Unauth" ? window.widgetConfig.USER_EMAIL : '';
        const username = window.widgetConfig.USER_FULL_NAME !== "Unauth" ? window.widgetConfig.USER_FULL_NAME : '';
        // Create widget
        const widget = document.createElement("div");
        widget.classList.add(ELEMENTS.widget);
        widget.textContent = "Support & Feedback";
        document.body.appendChild(widget);
    
        // Create popup elements
        const popupOverlay = document.createElement("div");
        popupOverlay.classList.add(ELEMENTS.popupOverlay);
        document.body.appendChild(popupOverlay);
    
        const popup = document.createElement("div");
        popup.classList.add(ELEMENTS.popup);
        popup.innerHTML = `
            <span style="position: absolute; right: 15px; top: 15px; font-weight: 600;">
            <button id="closeModalButton" style="padding: 0px 7px!important;background-color: #f1f1f1!important;color: #000!important;cursor: pointer!important;width: auto!important;">X</button>
            </span>    
            <h2>Support & Feedback</h2>
            <div class="${ELEMENTS.successNotification}" id="${ELEMENTS.successNotification}">Your Feedback has been submitted</div>
            <div ${email ? 'style="display:none"' : ''}>
            <label for="${ELEMENTS.emailInput}">Email</label>
            <input type="email" id="${ELEMENTS.emailInput}" value="${email}" placeholder="Enter your email" ${email ? 'readonly' : ''} required>
            <label id="${ELEMENTS.emailInvalidError}" style="display: none;color:red;">Invalid email address</label>
            </div>
            <div ${username ? 'style="display:none"' : ''}>
            <label for="${ELEMENTS.userNameInput}">Name</label>
            <input type="text" id="${ELEMENTS.userNameInput}" value="${username}" placeholder="Enter your name" ${username ? 'readonly' : ''} required>
            <label id="${ELEMENTS.usernameEmptyError}" style="display: none;color:red;">The name cannot be empty</label>
            </div>
            <label for="${ELEMENTS.subjectInput}">Subject</label>
            <input type="text" id="${ELEMENTS.subjectInput}" placeholder="Enter the subject" required>
            <label id="${ELEMENTS.subjectEmptyError}" style="display: none;color:red;">The subject cannot be empty</label>
            <label for="${ELEMENTS.messageInput}">Message</label>
            <textarea id="${ELEMENTS.messageInput}" placeholder="Enter your message" rows="4" required></textarea>
            <label id="${ELEMENTS.messageEmptyError}" style="display: none;color:red;">The message cannot be empty</label>
            <div id="${ELEMENTS.screenshotCanvas}-container">
                <canvas id="${ELEMENTS.screenshotCanvas}" style="display: none; width: 100%; border: 1px solid #ccc;height: 175px!important;"></canvas>
            </div>
            <div for="${ELEMENTS.attachScreenshot}" style="margin-top:10px;margin-bottom:10px;">
                <input class="attach-screenshot-checkbox" type="checkbox" id="${ELEMENTS.attachScreenshot}" checked>
                <span>Attach Screenshot</span>
            </div>
            <div id="recaptcha-container" style="margin-top: 15px;margin-bottom: 15px;  display: none;">
            <div id="recaptchaWidget"></div>
            </div>
            <p id="recaptcha-error" style="color: red; display: none; margin-bottom: 15px;">Please verify the Captcha.</p>
            <div id="${ELEMENTS.loader}" style="display: none;text-align: center;justify-content: center;margin-top: 20px;margin-bottom: 20px;align-items: center;">
                <div class="${ELEMENTS.loader}"></div>
                <p style="padding-left:10px">Submitting your feedback...</p>
            </div>
            <button id="${ELEMENTS.submitButton}">Submit</button>
        `;
        document.body.appendChild(popup);        
        let recaptchaWidgetId;
        setTimeout(() => {
            // eslint-disable-next-line no-undef
            recaptchaWidgetId = grecaptcha.render('recaptchaWidget', {
                sitekey: `${window.widgetConfig.GOOGLE_CAPTCHA_SITE_KEY}`,
                theme: 'light',
            });
        }, 5000);
    
        // Widget click event: Capture screenshot
        widget.addEventListener("click", async () => {
            popup.style.display = "none";
            popupOverlay.style.display = "none";
            clearErrors();
            await captureScreenshot();
            popup.style.display = "block";
            popupOverlay.style.display = "block";
        });
    
        // Close popup on overlay click
        popupOverlay.addEventListener("click", () => {
            popup.style.display = "none";
            popupOverlay.style.display = "none";
        });
    
        // Toggle screenshot visibility
        const attachScreenshotCheckbox = document.getElementById(ELEMENTS.attachScreenshot);
        attachScreenshotCheckbox.addEventListener("change", () => {
            const screenshotCanvas = document.getElementById(ELEMENTS.screenshotCanvas);
            screenshotCanvas.style.display = attachScreenshotCheckbox.checked ? "block" : "none";
        });
    
        // Submit feedback
        document.getElementById(ELEMENTS.submitButton).addEventListener("click", async () => {
            clearErrors();
            const email = sanitizeInput(document.getElementById(ELEMENTS.emailInput).value);
            const username = sanitizeInput(document.getElementById(ELEMENTS.userNameInput).value);
            const subject = sanitizeInput(document.getElementById(ELEMENTS.subjectInput).value);
            const message = sanitizeInput(document.getElementById(ELEMENTS.messageInput).value);
    
            // Validation            
            if (!isNotEmpty(subject)) {
                showError(ELEMENTS.subjectEmptyError);
                return;
            }
            if (!isNotEmpty(message)) {
                showError(ELEMENTS.messageEmptyError);
                return;
            }
    
            // Verify reCAPTCHA
            // eslint-disable-next-line no-undef
            // const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);            
            // const recaptchaError = document.getElementById('recaptcha-error');
            // // Check if the reCAPTCHA is completed
            // if (!recaptchaResponse) {
            //     recaptchaError.style.display = 'block'; // Show the validation message
            //     return; // Stop form submission
            // } else {
            //     recaptchaError.style.display = 'none'; // Hide the validation message if reCAPTCHA is completed
            // }
            // Start loader
            document.getElementById(ELEMENTS.loader).style.display = "flex";
    
            const screenshotCanvas = document.getElementById(ELEMENTS.screenshotCanvas);
            const screenshotBase64 = screenshotCanvas ? screenshotCanvas.toDataURL() : null;
    
            //const formData = { email, username, subject, message, recaptchaResponse };
            const formData = { email, username, subject, message };
            const submissionDate = new Date().toISOString();
            const currentURL = window.location.href;
            const GitHubIssueUrl = await createGitHubIssue(formData, submissionDate, (attachScreenshotCheckbox.checked ? screenshotBase64 : null) ,currentURL);
            const payload = {
                name: formData.username,
                mailId: formData.email,
                subject: formData.subject,
                message: formData.message,
                submissionDate: submissionDate,
                issueId: `Go to <a href="${GitHubIssueUrl.html_url}">Support Ticket</a>`,
            };
           
            try {
                await sendAdminMail(payload);        
                await sendAcknowledgementMail(formData);
                // Show success message
                const successNotification = document.getElementById(ELEMENTS.successNotification);
                successNotification.style.display = "block";
                setTimeout(() => {
                    popup.style.display = "none";
                    popupOverlay.style.display = "none";
                }, 4000);
            } catch (error) {
                console.error("Error submitting feedback:", error);
            } finally {
                // Hide loader
                document.getElementById(ELEMENTS.loader).style.display = "none";
            }
        });
    
        const closeModalButton = document.getElementById("closeModalButton");
        closeModalButton.addEventListener("click", () => {
            popup.style.display = "none";
            popupOverlay.style.display = "none"; // Hide the modal
        });
    };
    

    loadScript("https://www.google.com/recaptcha/api.js")
    .then(() => {
    if (typeof grecaptcha !== "undefined") {
    return loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
    } else {
    throw new Error("reCAPTCHA script not loaded");
    }
    })
    .then(() => initContactWidget())
    .catch((error) => {
    console.error("Failed to load required script:", error);
    alert("Failed to load the necessary components. Please refresh the page or contact support.");
    });

});
