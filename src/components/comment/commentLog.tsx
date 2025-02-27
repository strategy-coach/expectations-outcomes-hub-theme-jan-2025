import React, { useState } from "react";
import Comment from "./comment.tsx";
import type { LogType } from "../../../support/services/serverDataService.ts";


interface CommentLogProps {
    auditType?: string;
    data: LogType[];
    activityTitle?: string;
    url: string;
    source: string;
    evidenceCount?: number;
}

export function FormatTimeDifference(date: Date): string {
    const currentDate = new Date();
    const commentDate = new Date(date);
    const timeDifference = Math.floor(
        (currentDate.getTime() - commentDate.getTime()) / (1000 * 60),
    );
    if (timeDifference < 1) {
        return "just now";
    } else if (timeDifference < 60) {
        return `${timeDifference} minute${timeDifference > 1 ? "s" : ""} ago`;
    } else if (timeDifference < 120) {
        return "1 hour ago";
    } else if (timeDifference < 1440) {
        return `${Math.floor(timeDifference / 60)} hours ago`;
    } else {
        return commentDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
    }
}
export function validateSpecialCharacters(inputString: string): boolean {
    const specialCharactersPattern = /^[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}]+$/;
    return specialCharactersPattern.test(inputString);
}
const CommentLog: React.FC<CommentLogProps> = ({
    data,
    activityTitle,
    url,
    source
}) => {
    const [loadMore, setLoadMore] = useState(false);
    const closeActivityMoreModal = (): void => {
        setLoadMore(false);
    };

    const handleLoadMore = (): void => {
        setLoadMore(true);
    };
    return (
        <>
            {loadMore ? (
                <>
                    <div
                        className="relative z-10"
                        id="activity-more"
                        aria-labelledby="slide-over-title"
                        aria-modal="true"
                    >
                        <div className="fixed inset-0"></div>
                        <div className="fixed inset-0 overflow-hidden bg-transparent-black slide-over-content">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                    <div className="pointer-events-auto w-screen max-w-5xl">
                                        <div className="flex h-full flex-col bg-white shadow-2xl">
                                            <div className="px-7 pt-5">
                                                <div className="flex items-start justify-between">
                                                    {/* {activityTitle !== null && (
                                                        <h1 className="text-lg font-bold leading-6 text-gray-900">
                                                            {activityTitle}
                                                        </h1>
                                                    )} */}

                                                    <div className="ml-3 flex h-7 items-center">
                                                        <a
                                                            href="javascript:void(0);"
                                                            onClick={closeActivityMoreModal}
                                                            type="button"
                                                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <span className="absolute -inset-2.5"></span>
                                                            <span className="sr-only">Close panel</span>
                                                            <svg
                                                                className="h-6 w-6"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke-width="1.5"
                                                                stroke="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="
                                  round"
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                ></path>
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="withbullet flex min-h-0 flex-1 flex-col overflow-y-scroll py-6 mx-6 mt-4 scroll-bar">
                                                <div className="relative flex-1 px-7">
                                                    <Comment
                                                        activities={data}
                                                        loadMore={loadMore}
                                                        url={url}
                                                        source={source}
                                                        setLoadMore={handleLoadMore}
                                                        activityTitle={activityTitle}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="">
                    {/* {activityTitle !== null && (
                        <h2 className="text-xl font-bold">
                            <span id="auditType">{activityTitle}</span>
                        </h2>
                    )}
                    <br /> */}
                    <Comment
                        activities={data}
                        loadMore={loadMore}
                        url={url}
                        source={source}
                        setLoadMore={handleLoadMore}
                        activityTitle={activityTitle}

                    />
                </div>
            )}
        </>
    );
};

export default CommentLog;
