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

const state = Cookie.get("zitadel_state");

const LoggedIn = ({ clientId, authority, redirectUri, postLogoutRedirectUri, organizationId, projectId }) => {

    const handleSignIn = async (response) => {

        const decoded = jwtDecode(response.id_token);
        const roleKey = `urn:zitadel:iam:org:project:${projectId}:roles`;
        localStorage.setItem("zitadel_token", response.id_token);
        setCookie("zitadel_access_token", response.access_token);
        if (response.profile[roleKey]) {
            const roles = response.profile[roleKey];
            if (typeof roles === "object" && roles !== null) {
                const roleKeys = Object.keys(roles);
                if (roleKeys.length > 0) {
                    setCookie("zitadel_user_roles", JSON.stringify(roleKeys));
                    setCookie("zitadel_user_role", roleKeys[0]);
                    if (decoded["urn:zitadel:iam:user:resourceowner:id"]) {
                        setCookie("zitadel_tenant_id", decoded["urn:zitadel:iam:user:resourceowner:id"]);
                    }
                    const user = `${response.profile.name}`;
                    setCookie("zitadel_user_name", user);
                    setCookie("zitadel_user_id", response.profile.sub);
                    setCookie("zitadel_user_email", response.profile.email);
                    window.location.href = "/"
                } else {
                    window.location.href = "/no-permission"
                }
            }
        } else {
            window.location.href = "/no-permission"
        }
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
