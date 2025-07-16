import React, { useEffect, useState, useMemo, useCallback } from "react";
import moment from "moment";
import { z } from "zod";
import axios from "axios";
import { DatePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const ActivityLogSchema = z.object({
    hits: z.array(
        z.object({
            _timestamp: z.number(),
            details: z.string(),
            duration: z.number(),
            email: z.string(),
            end_time: z.number(),
            operation_name: z.string(),
            organizationname: z.string().optional(),
            pagetitle: z.string(),
            service_name: z.string(),
            start_time: z.number(),
            timestamp: z.string(),
            title: z.string(),
            trace_id: z.string(),
            url: z.string(),
            username: z.string(),
            userrole: z.string().optional(),
        })
    ),
    total: z.number(),
});

type ActivityLogType = z.infer<typeof ActivityLogSchema>["hits"][number];

interface ActivityLogProps {
    recordsLimit: number;
    showViewMoreButton: boolean;
    hoursToFetch: number;
    pageUrl?: string;
    title?: string
}

const host = globalThis.location.host;
const siteProtocol = globalThis.location.protocol;

const formatUserRole = (role?: string) => {
    if (!role) return "";
    const formatted = role
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${formatted}`;
};

const getTimeDifferenceString = (fromDate: string | Date, toDate: Date = new Date()) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const diffTime = to.getTime() - from.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays == 1) {
        return "1 day ago";
    } else if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else if (diffDays < 365) {
        const diffMonths = Math.floor(diffDays / 30);
        return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    } else {
        const diffYears = Math.floor(diffDays / 365);
        return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    }
};


const ActivityLog: React.FC<ActivityLogProps> = ({
    title,
    pageUrl,
    recordsLimit,
    showViewMoreButton,
    hoursToFetch,
}) => {
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>((showViewMoreButton == true && !pageUrl) ? ["customer-staff", "customer-admin"] : (showViewMoreButton == false && pageUrl) ? [] : ["customer-staff"]);
    const [roles, setRoles] = useState<string[]>([]);
    const [activityLogEntries, setActivityLogEntries] = useState<ActivityLogType[]>([]);
    const [currentTimeMicroseconds, setCurrentTimeMicroseconds] = useState(() => Date.now() * 1000);
    const [startTimeMicroseconds, setStartTimeMicroseconds] = useState(() =>
        currentTimeMicroseconds - hoursToFetch * 3600 * 1_000_000
    );
    const [calender, setCalender] = useState(false)
    const [fromDate, setFromDate] = useState("");
    const [totalActivityRecords, setTotalActivityRecords] = useState<number>(0);
    const [currentFilter, setCurrentFilter] = useState<string>("documentLoad");
    const [page, setPage] = useState<number>(1);
    const [days, setDays] = useState("")
    const [searchTerm, setSearchTerm] = useState("");
    const [clicksChecked, setClicksChecked] = useState(false);
    const [visitsChecked, setVisitsChecked] = useState(pageUrl ? true : false);
    const [reactionChecked, setReactionChecked] = useState(false);
    const recordPerPage = Math.min(50, recordsLimit);
    const totalPages = useMemo(
        () => Math.ceil(totalActivityRecords / recordPerPage),
        [totalActivityRecords, recordPerPage]
    );

    // Environment variables
    const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID;
    const OPENOBSERVE_API_URL = import.meta.env.PUBLIC_OPENOBSERVE_URL;
    const OPENOBSERVE_API_TOKEN = import.meta.env.PUBLIC_OPENOBSERVE_TOKEN;
    const ZITADEL_AUTHORITY = import.meta.env.PUBLIC_ZITADEL_AUTHORITY;
    const PROJECT_ID = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID;
    const ZITADEL_API_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN;

    const offset = useMemo(() => (page - 1) * recordPerPage, [page, recordPerPage]);

    const fetchRole = useCallback(
        async () => {
            try {
                const response = await axios.post(
                    `${ZITADEL_AUTHORITY}/management/v1/projects/${PROJECT_ID}/roles/_search`,
                    {},
                    {
                        headers: {
                            'x-zitadel-orgid': `${ORGANIZATION_ID}`,
                            Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const result = response.data.result.map((role: any) => role.key);
                console.log('entry here-----------------------')
                setRoles(result);
            } catch (error) {
                console.error("Error fetching activity log:", error);
                return null;
            }
        },
        [ZITADEL_AUTHORITY, ZITADEL_API_TOKEN, PROJECT_ID]
    );

    useEffect(() => {
        fetchRole();
    }, []);

    useEffect(() => {
        let roleFilter
        if (selectedRoles.length > 0) {
            roleFilter = selectedRoles
                .map(role => `str_match(userrole, '${role}')`)
                .join(" OR ");
            roleFilter = `AND (${roleFilter})`;
            console.log(roleFilter)
        }
    }, [selectedRoles])


    useEffect(() => {
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date();
            to.setHours(23, 59, 59, 999);
            const fromMicro = from.getTime() * 1000;
            const toMicro = to.getTime() * 1000;
            setStartTimeMicroseconds(fromMicro);
            setCurrentTimeMicroseconds(toMicro);
            const diffDays = getTimeDifferenceString(from, to);
            setDays(diffDays);
        } else {
            const now = Date.now();
            const from = new Date(now - hoursToFetch * 3600 * 1000);
            const to = new Date(now);
            const diffDays = getTimeDifferenceString(from, to);
            setDays(diffDays);
        }
    }, [fromDate]);


    const getQuery = useCallback(
        (filter: string, type: "data" | "count") => {
            const roleFilter =
                selectedRoles.length > 0
                    ? `AND (${selectedRoles.map(role => `str_match(userrole, '${role}')`).join(" OR ")})`
                    : "";

            if (pageUrl !== undefined && !pageUrl.startsWith(siteProtocol)) {
                // Replace the existing protocol with the correct one
                pageUrl = pageUrl.replace(/^(https?:)/, siteProtocol);
            }

            let baseQuery = `FROM default 
            WHERE str_match(url, '${pageUrl ? pageUrl : host}') 
            AND organizationid='${ORGANIZATION_ID}' 
            AND operation_name IN (${filter === "all"
                    ? "'element-click', 'documentLoad','user-authentication','add-comment','add-page-reaction','add-user','delete-user'"
                    : `'${filter}'`
                }) 
            ${roleFilter}`;

            if (searchTerm.length > 0) {
                baseQuery = `FROM default 
                WHERE (str_match_ignore_case(email, '${searchTerm}') 
                OR str_match_ignore_case(username, '${searchTerm}')) 
                AND str_match(url, '${pageUrl ? pageUrl : host}') 
                AND organizationid='${ORGANIZATION_ID}' 
                AND operation_name IN (${filter === "all"
                        ? "'element-click', 'documentLoad','user-authentication'"
                        : `'${filter}'`
                    }) 
                ${roleFilter}`;
            }

            return type === "data"
                ? `SELECT * ${baseQuery}`
                : `SELECT trace_id ${baseQuery}`;
        },
        [ORGANIZATION_ID, searchTerm, host, selectedRoles, pageUrl]
    );

    const toggleRole = (role: string) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };
    // Fetch activity log data
    const fetchActivityLog = useCallback(
        async (query: string, size: number, from: number) => {
            try {
                const response = await axios.post(
                    `${OPENOBSERVE_API_URL}api/default/_search?type=traces`,
                    {
                        query: {
                            sql: btoa(query),
                            start_time: startTimeMicroseconds,
                            end_time: currentTimeMicroseconds,
                            from,
                            size,
                        },
                        encoding: "base64",
                    },
                    {
                        headers: {
                            Authorization: `Basic ${btoa(OPENOBSERVE_API_TOKEN)}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                return response.data;
            } catch (error) {
                console.error("Error fetching activity log:", error);
                return null;
            }
        },
        [OPENOBSERVE_API_URL, OPENOBSERVE_API_TOKEN, startTimeMicroseconds, currentTimeMicroseconds]
    );

    const fetchData = useCallback(async () => {
        const countQuery = getQuery(currentFilter, "count");
        const activityLogQuery = getQuery(currentFilter, "data");

        const countData = await fetchActivityLog(countQuery, 1_000_000, 0);
        setTotalActivityRecords(countData?.total ?? 0);

        const responseData = await fetchActivityLog(activityLogQuery, recordPerPage, offset);
        const parsedActivityData = ActivityLogSchema.safeParse(responseData);
        setActivityLogEntries(parsedActivityData.success ? parsedActivityData.data.hits : []);
    }, [fetchActivityLog, getQuery, currentFilter, recordPerPage, offset, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData, fromDate, selectedRoles]);

    useEffect(() => {
        if (!clicksChecked && !visitsChecked && !reactionChecked) {
            setCurrentFilter('all');
        } else if (clicksChecked) {
            setCurrentFilter('element-click');
        } else if (visitsChecked) {
            setCurrentFilter('documentLoad');
        } else if (reactionChecked) {
            setCurrentFilter('add-page-reaction');
        }
    }, [clicksChecked, visitsChecked, reactionChecked]);

    const getActivityDescription = (details: string) => {
        try {
            const parsed = JSON.parse(details);
            return parsed.title ? `clicked on '${parsed.title}'` : `performed an action`;
        } catch {
            return `performed an action`;
        }
    };

    const getIconAndColor = (operation: string) => {
        return operation === "element-click"
            ? { icon: "🔘", color: "bg-emerald-500" }
            : operation === "user-authentication"
                ? { icon: "🔑", color: "bg-purple-500" }
                : operation === "add-comment"
                    ? { icon: "💬", color: "bg-indigo-500" }
                    : operation === "add-page-reaction"
                        ? { icon: "💬", color: "bg-indigo-700" }
                        : operation === "add-user"
                            ? { icon: "👤", color: "bg-green-700" }        // Darker green
                            : operation === "delete-user"
                                ? { icon: "🗑️", color: "bg-rose-700" }         // Matches red tone used for destructive actions
                                : { icon: "📄", color: "bg-blue-500" };
    };




    const getActivityMessage = (log: ActivityLogType) => {
        const roleText = log.userrole ? `(${formatUserRole(log.userrole)})` : "";
        const details = JSON.parse(log.details || "{}");

        if (log.operation_name === "element-click") {
            return `${log.username} ${roleText} ${getActivityDescription(log.details)} on <strong>${log.pagetitle}</strong> page`;
        }
        if (log.operation_name === "user-authentication") {
            if (details.loginStatus === "Password Changed") {
                return `Password was changed for <strong>${details.email}</strong>`;
            }

            if (details.loginStatus === "Authentication Failed") {
                return `Failed login attempt using <strong>${details.email}</strong>`;
            }

            return `${log.username} ${roleText} logged in successfully`;
        }
        if (log.operation_name === "add-comment") {
            const mentioned = details.mentioned;
            const mentionText =
                mentioned === ""
                    ? ""
                    : mentioned === "allusers"
                        ? " and notified to all users"
                        : ` and notified <strong>${mentioned}</strong>`;

            return `${log.username} ${roleText} commented on <strong>${log.pagetitle}</strong> page${mentionText}`;
        }
        if (log.operation_name === "add-user") {
            return `${log.username} ${roleText} added <strong>${details.user}</strong> as a new user with role <strong>${formatUserRole(details.role)}</strong>`;
        }
        if (log.operation_name === "delete-user") {
            return `${log.username} ${roleText} deleted the user <strong>${details.user}</strong>`;
        }
        if (log.operation_name === "add-page-reaction") {
            return `${log.username} ${roleText} reacted with ${details.reactionname} ${details.icon} on <strong>${log.pagetitle}</strong> page`;
        }
        return `${log.username} ${roleText} viewed the <strong>${log.pagetitle}</strong> page`;
    };


    const getRelativeTime = (timestamp: string) => moment(Number(timestamp)).fromNow();

    return (
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <img
                        src="/assets/images/fi-rr-calendar.svg"
                        className="w-6 h-6"
                        alt="Calendar Icon"
                    />
                    <span>{title ? `${title} Recent Activity` : "Activity"}</span>
                </div>
                {showViewMoreButton && (
                    <a href="/activity">
                        <button className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-[#028db7] shadow-sm hover:bg-white/20 hover:text-black dark:hover:text-white">
                            View More
                        </button>
                    </a>
                )}
            </h3>

            {pageUrl ?
                <div className="filter-container" style={{ display: 'flex', alignItems: 'center' }}>


                    {/* Checkbox group pushed to right */}
                    <div
                        className="filter-checkbox-group mt-5 flex-wrap"
                        style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            marginLeft: 'auto',
                        }}
                    >
                        <label className="filter-checkbox text-sm flex-shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={clicksChecked}
                                onChange={(e) => {
                                    setPage(1)
                                    setVisitsChecked(false)
                                    setReactionChecked(false)
                                    setClicksChecked(e.target.checked)
                                }}
                            />
                            Clicks
                        </label>
                        <label className="filter-checkbox text-sm flex-shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={visitsChecked}
                                onChange={(e) => {
                                    setPage(1)
                                    setClicksChecked(false)
                                    setReactionChecked(false)
                                    setVisitsChecked(e.target.checked)
                                }}
                            />
                            Page Visits
                        </label>
                        <label className="filter-checkbox text-sm flex-shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="checkbox"
                                checked={reactionChecked}
                                onChange={(e) => {
                                    setPage(1)
                                    setVisitsChecked(false)
                                    setClicksChecked(false)
                                    setReactionChecked(e.target.checked)
                                }}
                            />
                            Reactions
                        </label>
                    </div>
                </div>

                : undefined}
            {(showViewMoreButton == false && pageUrl !== undefined) || (!showViewMoreButton && pageUrl == undefined) && (
                <div className="mt-4 mb-4 space-x-2">
                    {["documentLoad", "element-click", "add-page-reaction", "user-authentication", "all"].map((filter) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 ${currentFilter === filter
                                ? "bg-blue-500 text-white"
                                : "filter-btn bg-gray-200 hover:text-white hover:bg-blue-500"
                                }`}
                            onClick={() => {
                                setCurrentFilter(filter);
                                setPage(1);
                            }}
                        >
                            {filter === "all"
                                ? "All Events"
                                : filter === "element-click"
                                    ? "Click Events"
                                    : filter === "user-authentication"
                                        ? "User Login"
                                        : filter === "add-page-reaction" ? "Reactions" : "Page Visit"
                            }
                        </button>
                    ))}
                    {calender === false ? (
                        <span
                            onClick={() => {
                                setFromDate("");
                                setCalender(true);
                            }}
                            className=" bg-blue-500 text-white inline-flex items-center border border-gray-300 px-4 py-2 gap-2 cursor-pointer"
                        >
                            {days}
                        </span>
                    ) : (
                        <div className="inline-flex items-center gap-2">
                            <DatePicker
                                oneTap
                                value={fromDate ? new Date(fromDate) : null}
                                onChange={(value: Date | null) => {
                                    if (value) {
                                        const iso = value.toISOString().split("T")[0];
                                        setFromDate(iso);
                                        setPage(1);
                                        setCalender(false);
                                    }
                                }}
                                size="lg"
                                shouldDisableDate={(date: Date) => date > new Date()}
                                placement="bottomStart"
                                style={{ height: '32px' }}

                            />
                        </div>
                    )}
                    <div className="relative inline-block">
                        <button
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="flex flex-wrap gap-1 px-2 py-2 min-h-[2.5rem] bg-gray-200 rounded "
                        >
                            {selectedRoles.length === 0 ? (
                                <span className="text-gray-600">Select Roles</span>
                            ) : (
                                selectedRoles.map((role) => (
                                    <span
                                        key={role}
                                        className="flex items-center px-2 py-1 bg-blue-500 text-white rounded-lg text-sm "
                                    >
                                        {formatUserRole(role)}
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRole(role);
                                            }}
                                            className="ml-2 text-white  cursor-pointer"
                                        >
                                            &times;
                                        </span>
                                    </span>
                                ))
                            )}
                        </button>

                        {showRoleDropdown && (
                            <div className="absolute z-10 mt-2 w-60 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-lg">
                                {roles.map((role) => (
                                    <label key={role} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role)}
                                            onChange={() => toggleRole(role)}
                                            className="mr-2"
                                        />
                                        {formatUserRole(role)}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value) }}
                        placeholder="Search by username or email..."
                        className="p-2 mb-4 border border-gray-300 text-gray-600  dark:text-gray-600 rounded-lg"
                    />



                </div>)
            }

            {
                activityLogEntries.length > 0 ? (
                    <ul
                        role="feed"
                        className="relative flex flex-col gap-6 py-6 pl-8 before:absolute before:top-0 before:left-8 before:h-full before:border before:-translate-x-1/2 before:border-slate-200 before:border-dashed"
                    >
                        {activityLogEntries.map((log) => {
                            const { icon, color } = getIconAndColor(log.operation_name);
                            return (
                                <li key={log.trace_id} role="article" className="relative pl-8">
                                    <span
                                        className={`absolute left-0 z-10 flex items-center justify-center w-8 h-8 text-white -translate-x-1/2 rounded-full ring-2 ring-white ${color}`}
                                    >
                                        {icon}
                                    </span>
                                    <div className="flex flex-col flex-1 gap-0">
                                        <h4
                                            className="text-sm font-medium dark:text-gray-300"
                                            dangerouslySetInnerHTML={{
                                                __html: getActivityMessage(log),
                                            }}
                                        />
                                        <p className="text-xs dark:text-gray-300">
                                            {getRelativeTime(log.timestamp)}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-600 mt-4 dark:text-gray-300">{(showViewMoreButton == true && pageUrl == undefined) ? "No recent customer activity found. Click here to see the full activity log." : (showViewMoreButton == false && pageUrl !== undefined) ? "No activiy log available" : "No activity found for the filter criteria. Please update the filters above."}</p>
                )
            }

            {
                totalPages > 1 && showViewMoreButton == false ? <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-md ${page === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={page === 1}
                    >
                        Prev
                    </button>
                    <span className="text-xs lg:text-xs xl:text-sm text-gray-600 dark:text-white">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-md ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div> : undefined
            }
        </div >
    );
};

export default ActivityLog;
