/* eslint-disable @typescript-eslint/no-floating-promises */
import React from "react";
import { useAuth, AuthProvider } from "oidc-react";
import Cookie from "js-cookie"
import { jwtDecode } from "jwt-decode";
const setCookie = (key, value) => {
    Cookie.set(key, value, { path: "/", secure: true });
};
const CheckLogin = () => {
    () => auth.signOut();
    const auth = useAuth();
    return auth?.userData ? (
        <div>
            <button style={{ display: "none" }} onClick={() => auth.signOut()}>
                Logout
            </button>
        </div>
    ) : (
        <div>
            <script>window.location.href="/"</script>
        </div>
    );
};
const state = Cookie.get("state")

const LoggedIn = ({ clientId, authority, redirectUri, postLogoutRedirectUri, organizationId, projectId }) => {


    const handleSignIn = async (response) => {
        const user = `${response.profile.name}`;
        setCookie("User", user);
        setCookie("token", response.access_token);
        setCookie("userId", response.profile.sub);
        localStorage.setItem("token", response.id_token);

        const decoded = jwtDecode(response.id_token);
        const roleKey = `urn:zitadel:iam:org:project:${projectId}:roles`;
        let userRoles = "normal";

        if (decoded[roleKey]) {
            const roles = decoded[roleKey];
            if (typeof roles === "object" && roles !== null) {
                const roleKeys = Object.keys(roles);
                if (roleKeys.length > 0) {
                    setCookie("user_roles", roleKeys[0]);
                    userRoles = roleKeys[0];
                }
            }
        }

        if (decoded["urn:zitadel:iam:user:resourceowner:id"]) {
            setCookie("tenantId", decoded["urn:zitadel:iam:user:resourceowner:id"]);
        }

        setCookie("email", decoded.email);
        if (decoded.email === "admin@opsfolio.com") {
            userRoles = "super-admin";
            setCookie("user_roles", userRoles);
        }

        const authState = JSON.stringify({
            status: "true",
            name: user,
            user_id: response.profile.sub,
            email: decoded.email,
            user_roles: userRoles,
        });

        setCookie("authState", authState);
        window.location.href = "/"
    };

    const handleSignOut = async () => {
        window.location.reload();
    };


    const oidcConfig = state !== undefined ? {
        onSignIn: handleSignIn,
        onSignOut: handleSignOut,
        authority: authority,
        clientId: clientId,
        responseType: "code",
        redirectUri: redirectUri,
        scope: `openid profile email urn:zitadel:iam:org:id:${organizationId} urn:zitadel:iam:user:metadata`,
        postLogoutRedirectUri: postLogoutRedirectUri
    } : {
        authority: authority,
        clientId: clientId,
        responseType: "code",
        redirectUri: redirectUri,
        scope: `openid profile email urn:zitadel:iam:org:id:${organizationId} urn:zitadel:iam:user:metadata`,
        postLogoutRedirectUri: postLogoutRedirectUri,
        onSignOut: async () => {
            window.location.reload();
        },
    };
    return (
        <React.Fragment>
            <AuthProvider {...oidcConfig}>
                <CheckLogin />
            </AuthProvider>
        </React.Fragment>
    );
};

export default LoggedIn;
