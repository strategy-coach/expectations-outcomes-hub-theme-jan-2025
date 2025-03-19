export const isZitadelEnabled = import.meta.env.ENABLE_ZITADEL_AUTH === 'true';

export const zitadelConfig = {
    clientId: import.meta.env.PUBLIC_ZITADEL_CLIENT_ID,
    authority: import.meta.env.PUBLIC_ZITADEL_AUTHORITY,
    redirectUri: import.meta.env.PUBLIC_ZITADEL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI,
    organizationId: import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID,
    projectId: import.meta.env.PUBLIC_ZITADEL_PROJECT_ID,
    zitalAPIToken: import.meta.env.PUBLIC_ZITADEL_API_TOKEN,
};

export const teamDBConfig = {
    dbName: import.meta.env.PUBLIC_TEAM_DB,
    isEnableTeamDB: import.meta.env.ENABLE_DB_TEAM === 'true'
};

export const lformDB = {
    dbPath: import.meta.env.PUBLIC_RSSD_DB,
};

export const isIMAPViewEnabled = import.meta.env.ENABLE_IMAP_VIEW === 'true';
export const imapDBPath = import.meta.env.PUBLIC_IMAP_DB;

export const reportConfig = {
    nmap: import.meta.env.PUBLIC_NMAP_DB,
    alimNmap: import.meta.env.PUBLIC_ALIM_NMAP_DB,
    zap: import.meta.env.PUBLIC_ALIM_ZAP_DB,
    sqlmap: import.meta.env.PUBLIC_SQLMAP_DB,
    subfinder: import.meta.env.PUBLIC_SUBFINDER_DB,
    nuclei: import.meta.env.PUBLIC_NUCLEI_DB,
    dirb: import.meta.env.PUBLIC_DIRB_DB
};
export const nmapDBPath = import.meta.env.PUBLIC_NMAP_DB;

export const fleetfolioUrl = import.meta.env.PUBLIC_FLEETFOLIO_URL;
