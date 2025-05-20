import { useEffect, useState } from "react";
import Cookie from "js-cookie";

import {
    DeleteUserBio,
    getUserInfo,
    UpdateUserMetaData,
    UpdateUserProfile,
    getUserMetaData,
    deleteUserMeta
} from "./userService";

import { Gravatar } from "./gravatar/Gravatar";

const setCookie = (key: string, value: string): void => {
    Cookie.set(key, value, { path: "/", secure: true });
};
const email = Cookie.get("zitadel_user_email");
const userId = Cookie.get("zitadel_user_id") ?? "";
const handleCancel = (): void => {
    window.location.replace("/my-profile");
};
const EditProfile: React.FC = () => {
    const [existingPhone, setExistingPhone] = useState("");
    const [loginUserName, setLoginUserName] = useState<string>("");
    const [isChangesMade, setIsChangesMade] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nickName: "",
        displayName: "",
        userEmail: "",
        userDisplayName: "",
        userPhone: "",
        userNotificationStatus: "",
        userBio: "",
        aiToken: "",
        gitHubToken: "",
    });
    const [initialFormData, setInitialFormData] = useState({
        firstName: "",
        lastName: "",
        nickName: "",
        displayName: "",
        userEmail: "",
        userDisplayName: "",
        userPhone: "",
        userNotificationStatus: "",
        userBio: "",
        aiToken: "",
        gitHubToken: "",
    });

    const [validationErrors, setValidationErrors] = useState({
        firstName: "",
        lastName: "",
        nickName: "",
        userDisplayName: "",
        userBio: "",
        userPhone: "",
        gitHubToken: ""
    });

    const [notification, setNotification] = useState({
        isError: false,
        message: "",
        show: false,
    });

    const showNotification = (isError: boolean, message: string): void => {
        setNotification({
            isError,
            message,
            show: true,
        });
    };

    const hideNotification = (): void => {
        setNotification({
            isError: false,
            message: "",
            show: false,
        });
    };

    useEffect(() => {
        const getUserDetails = async (): Promise<void> => {
            try {
                const fetchResult = await getUserInfo(userId);
                if (fetchResult != undefined) {
                    if (
                        fetchResult.user.human.phone.phone !== undefined &&
                        fetchResult.user.human.phone.phone !== null
                    ) {
                        setExistingPhone(fetchResult.user.human.phone.phone);
                    }
                    setLoginUserName(fetchResult.user.userName);
                    setFormData((prevData) => ({
                        ...prevData,
                        firstName: fetchResult.user.human.profile.firstName,
                        lastName: fetchResult.user.human.profile.lastName,
                        nickName: fetchResult.user.human.profile.nickName,
                        userDisplayName: fetchResult.user.human.profile.displayName,
                        userEmail: fetchResult.user.human.email.email,
                        userPhone: fetchResult.user.human.phone.phone,
                    }));
                    setInitialFormData((prevData) => ({
                        ...prevData,
                        firstName: fetchResult.user.human.profile.firstName,
                        lastName: fetchResult.user.human.profile.lastName,
                        nickName: fetchResult.user.human.profile.nickName,
                        userDisplayName: fetchResult.user.human.profile.displayName,
                        userEmail: fetchResult.user.human.email.email,
                        userPhone: fetchResult.user.human.phone.phone,
                    }));
                    const userMetaData = await getUserMetaData(userId);
                    if (userMetaData === undefined) {
                        setFormData((prevData) => ({
                            ...prevData,
                            userNotificationStatus: "true",
                        }));
                        setInitialFormData((prevData) => ({
                            ...prevData,
                            userNotificationStatus: "true",
                        }));
                    } else {
                        let decodedBioValue = "";
                        let decodedNotification = "";
                        let decodedAiTokenValue = "";
                        let decodedGitHubToken = "";

                        for (const item of userMetaData.result) {
                            if (item.key == "notifications") {
                                decodedNotification = atob(item.value);
                            } else if (item.key == "bio") {
                                decodedBioValue = atob(item.value);
                            } else if (item.key == "token") {
                                decodedAiTokenValue = atob(item.value);
                            } else if (item.key == "gitHubToken") {
                                decodedGitHubToken = atob(item.value);
                            }
                        }
                        setFormData((prevData) => ({
                            ...prevData,
                            userBio: decodedBioValue,
                            userNotificationStatus: decodedNotification,
                            aiToken: decodedAiTokenValue,
                            gitHubToken: decodedGitHubToken,
                        }));

                        setInitialFormData((prevData) => ({
                            ...prevData,
                            userBio: decodedBioValue,
                            userNotificationStatus: decodedNotification,
                            aiToken: decodedAiTokenValue,
                            gitHubToken: decodedGitHubToken,
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user metadata:", error);
            }
        };
        void getUserDetails();
    }, []);

    const handleUpdateUserProfile = async (): Promise<void> => {
        let formIsValid = true;
        try {
            setValidationErrors({
                firstName: "",
                lastName: "",
                nickName: "",
                userDisplayName: "",
                userBio: "",
                userPhone: "",
                gitHubToken: ""
            });
            const isFirstNameValid =
                formData.firstName.trim() !== "" &&
                formData.firstName.length <= 50 &&
                /^\S+[\w\s-'.]*$/.test(formData.firstName);

            const isLastNameValid =
                formData.lastName.trim() !== "" &&
                formData.lastName.length <= 50 &&
                /^\S+[\w\s-'.]*$/.test(formData.lastName);

            if (!isFirstNameValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    firstName:
                        formData.firstName.trim() === ""
                            ? "First name is required"
                            : "Enter a valid first name (up to 50 characters, only letters and spaces allowed)",
                }));
                formIsValid = false;
            }

            if (!isLastNameValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    lastName:
                        formData.lastName.trim() === ""
                            ? "Last name is required"
                            : "Enter a valid last name (up to 50 characters, only letters and spaces allowed)",
                }));
                formIsValid = false;
            }

            // Validate and set the nickname here if needed
            const nickName = formData.nickName?.trim(); // Trim to handle cases where it's undefined or null

            if (nickName === "" || /^[\sA-Za-z]{1,50}$/.test(nickName)) {
                // Your logic for a valid case
            } else {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    nickName:
                        "Enter a valid nickname (up to 50 characters, only letters allowed)",
                }));
                formIsValid = false;
            }

            // Validate and set the display here if needed
            const isDisplayNameValid =
                formData.userDisplayName?.trim() !== "" &&
                formData.userDisplayName?.length <= 50 &&
                /^\S+[\w\s-'.]*$/.test(formData.userDisplayName);

            if (!isDisplayNameValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    userDisplayName:
                        formData.userDisplayName?.trim() === ""
                            ? "Display name is required"
                            : "Enter a valid display name (up to 50 characters, only letters and spaces allowed)",
                }));
                formIsValid = false;
            }
            // Validate and set the user bio here
            const isUserBioValid =
                formData.userBio?.trim() === "" || formData.userBio.length <= 500;

            if (!isUserBioValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    userBio:
                        formData.userBio?.trim() === ""
                            ? "About Me is required"
                            : "Enter a valid About Me (up to 500 characters)",
                }));
                formIsValid = false;
            } else if (formData.userBio === "") {
                // User bio is empty, call DeleteUserBio()
                try {
                    await DeleteUserBio(userId);
                } catch (error) {
                    console.error("Error deleting user bio:", error);
                    // Handle the error as needed
                }
            }
            const regExpPhone =
                /^\+?\d{0,4} ?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,6}$/;

            const isPhoneValid =
                formData.userPhone === "" || regExpPhone.test(formData.userPhone);

            if (!isPhoneValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    userPhone:
                        "If providing a phone number, use the + symbol followed by the calling country code and enter the phone number",
                }));
                formIsValid = false;
            }

            const regExpGitHubToken =
                /^(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}$/;

            const isGithubTokenValid =
                formData.gitHubToken === "" || regExpGitHubToken.test(formData.gitHubToken);

            if (!isGithubTokenValid) {
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    gitHubToken:
                        "Please enter a valid GitHub access token starting with ghp_, gho_, ghu_, ghs_, or ghr_ followed by at least 36 alphanumeric characters.",
                }));
                formIsValid = false;
            }

            if (!formIsValid) {
                return;
            }

            await UpdateUserProfile(formData, userId);

            if (formData.gitHubToken !== initialFormData.gitHubToken) {
                try {
                    const gitHubTokenUpdatePromise =
                        formData.gitHubToken === ""
                            ? deleteUserMeta("gitHubToken", userId)
                            : UpdateUserMetaData(formData.gitHubToken, "gitHubToken", userId);
                    await gitHubTokenUpdatePromise;
                } catch (error) {
                    console.error("Error updating github token:", error);
                    return;
                }
            }

            try {
                await UpdateUserMetaData(
                    formData.userNotificationStatus,
                    "notifications",
                    userId
                );
                await UpdateUserMetaData(formData.userBio, "bio", userId);

            } catch (error) {
                console.error("Error updating user phone:", error);
            }

            setCookie("User", formData.firstName + " " + formData.lastName);
            setIsChangesMade(false);
            showNotification(false, "Profile updated successfully!");

            setTimeout(() => {
                hideNotification();
            }, 3500);
        } catch (error) {
            showNotification(true, JSON.stringify(error));
            console.error("Failed to update user profile:", error);
        }
    };

    const handleTextAreaInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ): void => {
        setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: "",
        }));

        setFormData((prevData) => {
            const updatedData = {
                ...prevData,
                [e.target.name]: e.target.value,
            };

            //const fieldName = e.target.name as keyof typeof prevData; // Type assertion on the key

            const isFormChanged = Object.keys(updatedData).some(
                (key) =>
                    updatedData[key as keyof typeof updatedData] !==
                    initialFormData[key as keyof typeof initialFormData],
            );

            setIsChangesMade(isFormChanged);

            return updatedData;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [e.target.name]: "",
        }));

        setFormData((prevData) => {
            const updatedData = {
                ...prevData,
                [e.target.name]: e.target.value,
            };

            const isFormChanged = Object.keys(updatedData).some(
                (key) =>
                    updatedData[key as keyof typeof updatedData] !==
                    initialFormData[key as keyof typeof initialFormData],
            );

            setIsChangesMade(isFormChanged);

            return updatedData;
        });
    };

    const handleCheckboxChange = (isChecked: boolean): void => {
        try {
            setFormData((prevData) => {
                const updatedData = {
                    ...prevData,
                    userNotificationStatus: isChecked ? "true" : "false",
                };

                //const fieldName = "userNotificationStatus";

                const isFormChanged = Object.keys(updatedData).some(
                    (key) =>
                        updatedData[key as keyof typeof updatedData] !==
                        initialFormData[key as keyof typeof initialFormData],
                );

                setIsChangesMade(isFormChanged);

                return updatedData as typeof prevData; // Type assertion on the object
            });
        } catch (error) {
            console.error("Failed to update user metadata:", error);
        }
    };

    const handleSubmit = (): void => {
        handleUpdateUserProfile().catch((error) => {
            console.error("Error updating user profile:", error);
        });
    };

    return (
        <section className="px-2 pt-3">
            {notification.show ? (
                <div
                    className={`mt-4 text-left bg-${notification.isError ? "red" : "green"
                        }-100 border-t-4 mb-5 rounded-b px-4 py-3 shadow-md relative ${notification.isError
                            ? "border-red-500  text-red-900"
                            : "border-green-500  text-green-900"
                        }`}
                    role="alert"
                >
                    <span className="block sm:inline font-normal text-base">
                        {notification.message}
                    </span>
                    <span
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        onClick={hideNotification}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${notification.isError ? "text-red-500" : "text-green-500"
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
            ) : undefined}

            <h1 className="text-3xl font-semibold mb-4 text-slate-700 dark:text-gray-300">Edit Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="col-span-1 md:col-span-8 border dark:border-gray-600 rounded-lg">
                    <article className="border-b dark:border-gray-600 ">
                        <h2 className="text-2xl font-semibold px-6 py-4 text-slate-700 dark:text-gray-300">
                            Personal Information
                        </h2>
                    </article>
                    <article className="p-6">
                        <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    First Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        aria-label="firstName"
                                        className={`block w-full rounded bg-white border border-1 py-2 px-3 text-gray-900 placeholder:text-gray-400 text-base font-normal ${validationErrors.firstName !== undefined &&
                                            validationErrors.firstName !== "" &&
                                            "border-red-500 focus:border-red-500"
                                            }`}
                                        placeholder=""
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {validationErrors.firstName !== undefined &&
                                    validationErrors.firstName !== "" && (
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
                                                        {validationErrors.firstName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    Last Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="block w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></input>
                                </div>

                                {validationErrors.lastName !== undefined &&
                                    validationErrors.lastName !== "" && (
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
                                                            d="M5.05.31c.81 2.17+.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03+.53 3.33+1.94 2.86 1.39-.47 2.3+.53 2.27+1.67-.02+.78-.31+1.44-1.13+1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52+.13-2.03+1.13-1.89+2.75.09+1.08-1.02+1.8-1.86+1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                        ></path>
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800 notify">
                                                        {validationErrors.lastName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    Nick Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="nickName"
                                        value={formData.nickName}
                                        id="nickName"
                                        onChange={handleInputChange}
                                        className="block w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></input>
                                </div>
                                {validationErrors.nickName !== undefined &&
                                    validationErrors.nickName !== "" && (
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
                                                        {validationErrors.nickName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    Display Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="userDisplayName"
                                        id="userDisplayName"
                                        value={formData.userDisplayName}
                                        onChange={handleInputChange}
                                        className="block w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></input>
                                </div>
                                {validationErrors.userDisplayName !== undefined &&
                                    validationErrors.userDisplayName !== "" && (
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
                                                        {validationErrors.userDisplayName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="userEmail"
                                        id="userEmail"
                                        value={formData.userEmail}
                                        className="block bg-gray-100 w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                        disabled={true}
                                    ></input>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    Phone Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="userPhone"
                                        id="userPhone"
                                        title="Use the + symbol followed by the calling country code and finally enter the phone number"
                                        value={formData.userPhone}
                                        onChange={handleInputChange}
                                        className="block w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></input>
                                </div>
                                {validationErrors.userPhone !== undefined &&
                                    validationErrors.userPhone !== "" && (
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
                                                            d="M5.05.31c.81 2.17+.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03+.53 3.33+1.94 2.86 1.39-.47 2.3+.53 2.27+1.67-.02+.78-.31+1.44-1.13+1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52+.13-2.03+1.13-1.89+2.75.09+1.08-1.02+1.8-1.86+1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                        ></path>
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800 notify">
                                                        {validationErrors.userPhone}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <div className="col-span-1 md:col-span-6 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    GitHub Token
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="gitHubToken"
                                        id="gitHubToken"
                                        title=""
                                        value={formData.gitHubToken}
                                        onChange={handleInputChange}
                                        className="block w-full font-normal rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></input>
                                </div>
                                {validationErrors.gitHubToken !== undefined &&
                                    validationErrors.gitHubToken !== "" && (
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
                                                            d="M5.05.31c.81 2.17+.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03+.53 3.33+1.94 2.86 1.39-.47 2.3+.53 2.27+1.67-.02+.78-.31+1.44-1.13+1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52+.13-2.03+1.13-1.89+2.75.09+1.08-1.02+1.8-1.86+1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"
                                                        ></path>
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800 notify">
                                                        {validationErrors.gitHubToken}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <div className="col-span-1 md:col-span-12 font-semibold mb-3">
                                <label className="block text-base font-medium leading-6 text-gray-900 dark:text-gray-300">
                                    About Me
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        rows={4}
                                        value={formData.userBio}
                                        name="userBio"
                                        onChange={handleTextAreaInputChange}
                                        className="block w-full font-normal h-36 min-h-36 max-h-36 rounded-md border border-gray-300 py-2 px-4 text-gray-900 shadow-sm placeholder:text-gray-800 text-base"
                                        placeholder=""
                                    ></textarea>
                                </div>
                                {validationErrors.userBio !== undefined &&
                                    validationErrors.userBio !== "" && (
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
                                                        {validationErrors.userBio}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-12">
                                <fieldset>
                                    <legend className="sr-only">Notifications</legend>
                                    <div className="space-y-5">
                                        <div className="relative flex items-start">
                                            <div className="flex h-6 items-center">
                                                <input
                                                    id="comments"
                                                    aria-describedby="comments-description"
                                                    name="comments"
                                                    type="checkbox"
                                                    checked={formData.userNotificationStatus === "true"}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(e.target.checked)
                                                    }
                                                    className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-600"
                                                ></input>
                                            </div>
                                            <div className="ml-3">
                                                <span className="text-slate-700 dark:text-gray-300">Recieve Notifications</span>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </aside>
                    </article>
                    <article className="border-t dark:border-gray-600  px-6 py-6 flex gap-3 justify-end">
                        <button
                            onClick={handleCancel}
                            title="Cancel"
                            className="bg-white text-slate-700 border border-gray-300 py-2 px-4 h-10 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            title="Update"
                            disabled={!isChangesMade}
                            className={`bg-blue-700 text-white border border-gray-300 py-2 px-4 h-10 rounded ${isChangesMade ? "" : "cursor-not-allowed opacity-50"
                                }`}
                        >
                            Update
                        </button>
                    </article>
                </div>
                <div className="col-span-1 md:col-span-4">
                    {" "}
                    <article className="border rounded-lg dark:border-gray-600 ">
                        <div className="border-b dark:border-gray-600 ">
                            <h2 className="text-xl text-slate-700 dark:text-gray-300 font-semibold px-6 py-4">Profile Image</h2>
                        </div>
                        <article className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b dark:border-gray-600  p-6">
                            <div className="col-span-1 md:col-span-3 flex flex-col justify-center">
                                <Gravatar userEmail={email} height={55} width={55} />
                            </div>
                            <div className="col-span-1 md:col-span-8 flex flex-col justify-center">
                                <h2 className="text-xl font-semibold"></h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    This is the Profile image linked to your Gravatar account. You
                                    can change your avatar at{" "}
                                    <a
                                        href="https://gravatar.com/"
                                        target="_blank"
                                        className="text-blue-600"
                                    >
                                        gravatar.com
                                    </a>
                                </p>
                            </div>
                            <div className="col-span-1 md:col-span-6 flex items-end justify-end"></div>
                        </article>
                    </article>
                    <article className="border rounded-lg mt-5 dark:border-gray-600 ">
                        <div className="border-b dark:border-gray-600 ">
                            <h2 className="text-xl font-semibold px-6 py-4 text-slate-700 dark:text-gray-300">
                                Account Information
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                <div className="col-span-1 md:col-span-4 font-semibold text-slate-700 dark:text-gray-300">
                                    Email
                                </div>
                                <div className="col-span-1 md:col-span-8 flex text-slate-700 dark:text-gray-300">
                                    {formData.userEmail}
                                </div>
                            </aside>
                            <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                <div className="col-span-1 md:col-span-4 font-semibold text-slate-700 dark:text-gray-300">
                                    Username
                                </div>
                                <div className="col-span-1 md:col-span-8 flex break-all text-slate-700 dark:text-gray-300">
                                    {loginUserName}
                                </div>
                            </aside>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default EditProfile;
