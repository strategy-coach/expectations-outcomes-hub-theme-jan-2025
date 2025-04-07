import React, { useEffect, useState, useMemo, useCallback } from "react";
import moment from "moment";
import { z } from "zod";
import axios from "axios";

// Define schema for activity log entries
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
}
const host = globalThis.location.host;

const formatUserRole = (role?: string) => {
    if (!role) return "";
    const formatted = role
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return ` (${formatted})`;
};

const ActivityLog: React.FC<ActivityLogProps> = ({
    recordsLimit,
    showViewMoreButton,
    hoursToFetch,
}) => {
    const [activityLogEntries, setActivityLogEntries] = useState<ActivityLogType[]>([]);
    const [currentTimeMicroseconds, setCurrentTimeMicroseconds] = useState(() => Date.now() * 1000);
    const [startTimeMicroseconds, setStartTimeMicroseconds] = useState(() =>
        currentTimeMicroseconds - hoursToFetch * 3600 * 1_000_000
    );
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [totalActivityRecords, setTotalActivityRecords] = useState<number>(0);
    const [currentFilter, setCurrentFilter] = useState<string>("documentLoad");
    const [page, setPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const recordPerPage = Math.min(50, recordsLimit);
    const totalPages = useMemo(
        () => Math.ceil(totalActivityRecords / recordPerPage),
        [totalActivityRecords, recordPerPage]
    );

    // Environment variables
    const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID;
    const OPENOBSERVE_API_URL = import.meta.env.PUBLIC_OPENOBSERVE_URL;
    const OPENOBSERVE_API_TOKEN = import.meta.env.PUBLIC_OPENOBSERVE_TOKEN;

    // Time range for data retrieval
    // const currentTimeMicroseconds = useMemo(() => Date.now() * 1000, []);
    // const startTimeMicroseconds = useMemo(
    //     () => currentTimeMicroseconds - hoursToFetch * 3600 * 1_000_000,
    //     [currentTimeMicroseconds, hoursToFetch]
    // );

    const offset = useMemo(() => (page - 1) * recordPerPage, [page, recordPerPage]);

    useEffect(() => {
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            setStartTimeMicroseconds(from.getTime() * 1000);
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            setCurrentTimeMicroseconds(to.getTime() * 1000);
        }
    }, [fromDate, toDate]);

    const getQuery = useCallback(
        (filter: string, type: "data" | "count") => {
            let baseQuery = `FROM default WHERE str_match(url, '${host}') AND organizationid='${ORGANIZATION_ID}' AND operation_name IN (${filter === "all" ? "'element-click', 'documentLoad','user-authentication','add-comment'" : `'${filter}'`
                })`;
            if (searchTerm.length > 0) {
                baseQuery = `FROM default WHERE (str_match_ignore_case(email, '${searchTerm}') OR str_match_ignore_case(username, '${searchTerm}')) AND str_match(url, '${host}') AND organizationid='${ORGANIZATION_ID}' AND operation_name IN (${filter === "all" ? "'element-click', 'documentLoad','user-authentication'" : `'${filter}'`
                    })`;
            }
            return type === "data"
                ? `SELECT * ${baseQuery}`
                : `SELECT trace_id ${baseQuery}`;
        },
        [ORGANIZATION_ID, searchTerm, host]
    );

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

    // Fetch and update data
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
    }, [fetchData]);

    // Parse activity details
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
            ? { icon: "🔘", color: "bg-emerald-500" } // Click Events
            : operation === "user-authentication"
                ? { icon: "🔑", color: "bg-purple-500" } // User Login
                : operation === "add-comment"
                    ? { icon: "💬", color: "bg-indigo-500" } // Comment Added
                    : { icon: "📄", color: "bg-blue-500" }; // Page Visit
    };

    const getActivityMessage = (log: ActivityLogType) => {
        return log.operation_name === "element-click"
            ? `${log.username} ${log.userrole ? `${formatUserRole(log.userrole)}` : ""} ${getActivityDescription(log.details)} on <strong>${log.pagetitle}</strong> page`
            : log.operation_name === "user-authentication"
                ? `${log.username} ${log.userrole ? ` ${formatUserRole(log.userrole)}` : ""} logged in successfully`
                : log.operation_name === "add-comment" ? `${log.username} ${log.userrole ? `${formatUserRole(log.userrole)}` : ""} commented on <strong>${log.pagetitle}</strong> page${JSON.parse(log.details).mentioned == "" ? "" : JSON.parse(log.details).mentioned == "allusers" ? " and notified to all users" : ` and notified <strong>${JSON.parse(log.details).mentioned}</strong>`}` : `${log.username} ${log.userrole ? `${formatUserRole(log.userrole)}` : ""} viewed the <strong>${log.pagetitle}</strong> page`;
    };

    const getRelativeTime = (timestamp: string) => moment(Number(timestamp)).fromNow();

    return (
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <img
                        src="/assets/images/fi-rr-calendar.svg"
                        className="w-6 h-6"
                        alt="Calendar Icon"
                    />
                    <span>Activity Log</span>
                </div>
                {showViewMoreButton && (
                    <a href="/activity">
                        <button className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-[#028db7] shadow-sm hover:bg-white/20 hover:text-black dark:hover:text-white">
                            View More
                        </button>
                    </a>
                )}
            </h3>

            {!showViewMoreButton && (<div className="mt-4 mb-4 space-x-2">
                {["documentLoad", "element-click", "user-authentication", "all"].map((filter) => (
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
                                    : "Page Visit"}
                    </button>
                ))}
                <span className="inline-flex items-center border border-gray-300 rounded-lg px-1 py-1 gap-2">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 h-8 text-sm"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 h-8 text-sm"
                    />
                </span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value) }}
                    placeholder="Search by username or email..."
                    className="p-2 mb-4 border border-gray-300 rounded-lg"
                />

            </div>)}

            {activityLogEntries.length > 0 ? (
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
                <p className="text-gray-600">No activity log available.</p>
            )}

            {totalPages > 1 && showViewMoreButton == false ? <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={`px-4 py-2 bg-gray-200 rounded-md ${page === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`px-4 py-2 bg-gray-200 rounded-md ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div> : undefined}
        </div>
    );
};

export default ActivityLog;
