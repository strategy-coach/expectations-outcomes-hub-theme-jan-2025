/* eslint-disable unicorn/no-null */
import React, { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import axios from "axios";
import { resetPassword, getOrganizationRoles } from "../../services/zitadel.services.ts";
import novuApiCall from "../../services/novu.service.ts";

const genderOptions = [
    "GENDER_UNSPECIFIED",
    "GENDER_FEMALE",
    "GENDER_MALE",
    "GENDER_DIVERSE",
] as const;

interface SignUpResponse {
    userId: string;
    error?: string;
}

// Zod schema for validation
const signUpSchema = z.object({
    givenName: z
        .string()
        .min(1, "Given Name is required")
        .max(200, "Max 200 characters allowed"),
    familyName: z
        .string()
        .min(1, "Family Name is required")
        .max(200, "Max 200 characters allowed"),
    displayName: z.string().max(200, "Max 200 characters allowed").optional(),
    gender: z.enum(genderOptions).default("GENDER_UNSPECIFIED"),
    email: z
        .string()
        .email("Invalid email format")
        .max(200, "Max 200 characters allowed"),
    phone: z.string().max(200, "Max 200 characters allowed").optional(),
    role: z
        .string()
        .min(1, "Family Name is required")
        .max(200, "Max 200 characters allowed"),
});

const RoleSchema = z.object({
    organization_role_type_id: z.string(),
    value: z.string(),
});

const ResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(RoleSchema),
});

const SITE_URL = import.meta.env.PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI as string;

// Form data type
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type RoleResponseType = z.infer<typeof ResponseSchema>;

const UserSignUp: React.FC = () => {
    const [formData, setFormData] = useState<SignUpFormData>({
        givenName: "",
        familyName: "",
        displayName: "",
        gender: "GENDER_UNSPECIFIED",
        email: "",
        phone: "",
        role: ""
    });

    const [notification, setNotification] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [userRoles, setUserRoles] = useState<
        { displayName: string; details: { sequence: string, creationDate: string, changeDate: string, resourceOwner: string }, key: string }[] | undefined
    >([]);

    useEffect(() => {

        const controller = new AbortController();
        const fetchRoles = async (): Promise<void> => {
            try {
                const roles = await getOrganizationRoles();
                setUserRoles(roles?.result)
            } catch (error) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error("Error fetching roles:", error);
                }
            }
        };

        void fetchRoles();
        return () => controller.abort();
    }, []);

    const roleOptions = useMemo(() => {
        return userRoles?.map((user) => (
            <option key={user.key} value={user.key}>
                {user.key}
            </option>
        ));
    }, [userRoles]);

    // Handle form input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ): void => {
        const { name, value } = e.target;
        console.log(name);
        console.log(value);
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {

        e.preventDefault();
        setIsSubmitting(true); // Start submission
        setError(null);
        setNotification(null);

        try {
            signUpSchema.parse(formData);
            const response = await axios.post<SignUpResponse>(
                "/api/signup",
                formData,
            );

            if (response.data.userId === undefined) {
                setError(response.data?.error ?? "An error occurred during sign-up.");
            } else {
                const codeResponse = (await resetPassword(
                    response.data.userId,
                )) as unknown as {
                    status: number;
                    message: string;
                    verificationCode?: string;
                };
                const params = `code=${codeResponse.verificationCode}&userId=${response.data.userId}`;
                const encodedParams = encodeURIComponent(params);
                const payload = {
                    firstName: formData.givenName,
                    button: `<div style="text-align:center"><a class="btn" href="${SITE_URL}reset-password?${encodedParams}" target="_blank">Verify Email</a></div>`,
                };
                await novuApiCall("signup", payload, formData.email);
                setFormData({
                    givenName: "",
                    familyName: "",
                    displayName: "",
                    gender: "GENDER_UNSPECIFIED",
                    email: "",
                    phone: "",
                    role: ""
                });
                setNotification(
                    "Please verify your email to successfully complete your registration",
                );
                setError(null);
            }
        } catch (error_) {
            if (error_ instanceof z.ZodError) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                setError(error_.errors[0]?.message || "Invalid form submission");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsSubmitting(false); // End submission
        }
    };
    return (
        <div className="min-h-screen p-8 flex justify-center items-center">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Add New User
                </h2>

                {notification != null && (
                    <div className="mb-4 text-green-500">{notification}</div>
                )}
                {error != null && (
                    <div className="mb-4 text-red-500">{error}</div>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {/* Given Name */}
                    <InputField
                        label="Given Name"
                        name="givenName"
                        value={formData.givenName}
                        onChange={handleChange}
                        required
                    />

                    {/* Family Name */}
                    <InputField
                        label="Family Name"
                        name="familyName"
                        value={formData.familyName}
                        onChange={handleChange}
                        required
                    />

                    {/* Display Name */}
                    <InputField
                        label="Display Name"
                        name="displayName"
                        value={formData.displayName as string}
                        onChange={handleChange}
                    />

                    {/* Gender */}
                    <div>
                        <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        >
                            {genderOptions.map((gender) => (
                                <option key={gender} value={gender}>
                                    {gender.replace("GENDER_", "").replace("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Email */}
                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {/* Phone */}
                    <InputField
                        label="Phone"
                        name="phone"
                        value={formData.phone as string}
                        onChange={handleChange}
                    />

                    {/* Gender */}
                    <div>
                        <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Role
                        </label>
                        {userRoles !== undefined && userRoles.length > 0 && (
                            <select
                                className="block p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                                value={formData.role}
                                onChange={handleChange}
                                name="role"
                            >
                                <option value="" disabled>
                                    Choose a user role
                                </option>
                                {roleOptions}
                            </select>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`px-4 py-2 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : ""
                                }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full p-2 border rounded-lg mt-1"
        />
    </div>
);

export default UserSignUp;
