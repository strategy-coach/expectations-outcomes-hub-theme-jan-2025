export const isZitadelEnabled = import.meta.env.ENABLE_ZITADEL_AUTH === 'true';

export const zitadelConfig = {
    clientId: import.meta.env.PUBLIC_ZITADEL_CLIENT_ID,
    authority: import.meta.env.PUBLIC_ZITADEL_AUTHORITY,
    redirectUri: import.meta.env.PUBLIC_ZITADEL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI,
    organizationId: import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID,
    projectId: import.meta.env.PUBLIC_ZITADEL_PROJECT_ID,
};

export const teamDBConfig = {
    dbName: import.meta.env.PUBLIC_TEAM_DB,
    isEnableTeamDB: import.meta.env.ENABLE_DB_TEAM === 'true'
};