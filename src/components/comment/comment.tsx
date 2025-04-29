import React, { useState, useRef, useEffect } from "react";
import Cookie from "js-cookie";
import type { LogType } from "./commentService.ts";
import MessageReaction from "./message-reaction/messageReaction.tsx";
import axios from "axios"
import { Gravatar } from "../profile/gravatar/Gravatar.tsx";
import { zitadelConfig } from "../../utils/env.ts"
import novuApiCall from "./novu-mail-api/index.tsx";
import themeConfig from "../../../theme.config";

const { organization } = themeConfig || {};

const projectId = zitadelConfig.projectId;
const token = zitadelConfig.zitalAPIToken;
const organizationId = zitadelConfig.organizationId;
const authority = zitadelConfig.authority;
const productionUrl = import.meta.env.PUBLIC_PRODUCTION_URL
const adminEmail = import.meta.env.PUBLIC_NOVU_CONTACTUS_ADMIN_EMAIL
const commentNotificationTemplate = import.meta.env.PUBLIC_NOVU_COMMENT_NOTIFICATION_TEMPLATE
const notificationEnableForAllUsers = import.meta.env.PUBLIC_NOTIFICATION_FOR_ALL_MEMBERS

interface MemberType {
    displayName: string;
    email: string;
}

const buildTree = (activities: LogType[]): LogType[] => {

    const findChildren = (parentId: string | null): LogType[] => {
        return activities
            .filter((activity) => activity.parentId === parentId)
            .map((activity) => ({
                ...activity,
                children: findChildren(activity.logId),
            }));
    };

    return activities
        .filter((activity) => activity.parentId === null)
        .map((rootActivity) => ({
            ...rootActivity,
            children: findChildren(rootActivity.logId),
        }));
};



interface CommentProps {
    source: string;
    url: string;


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

const Comment: React.FC<
    CommentProps & {
        activities: LogType[];
    }
> = ({
    activities,
    url,
    source,
}) => {
        const [loadMore, setLoadMore] = useState<boolean | undefined>();
        const [submitOption, setSubmitOption] = useState("add");
        const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
        const [reply, setReply] = useState<{
            parentId: number | undefined;
            message: string | undefined;
        }>({ parentId: undefined, message: undefined });
        const [comment, setComment] = useState("");
        const [comments, setComments] = useState<LogType[] | undefined>();
        const [commentToEdit, setCommentToEdit] = useState("");
        const [editLogId, setEditLogId] = useState<number>();
        const [filteredMembers, setFilteredMembers] = useState<MemberType[]>();
        const [members, setMembers] = useState<MemberType[]>()
        const [isSubmitting, setIsSubmitting] = useState<boolean>()
        const [showUser, setShowUser] = useState(false);
        const userRole = Cookie.get("user_roles");
        const [notification, setNotification] = useState({
            isError: false,
            message: "",
            show: false,
        });
        const cardRef = useRef<any>(null);
        const textAreaRef = useRef<any>(null);

        const handleSelectUser = (user: MemberType): void => {
            const username = user.displayName;
            const cursorPosition = textAreaRef.current?.selectionStart ?? 0;

            const beforeCursor = comment.slice(0, cursorPosition);
            const afterCursor = comment.slice(cursorPosition);

            const match = beforeCursor.match(/(?:^|\s)@(\w*)$/);

            if (match?.index !== undefined) {
                const updatedText =
                    beforeCursor.slice(0, match.index + match[0].length - match[1].length) +
                    username +
                    " " +
                    afterCursor;

                setComment(updatedText);

                setTimeout(() => {
                    if (textAreaRef.current && match.index !== undefined) {
                        textAreaRef.current.selectionStart =
                            textAreaRef.current.selectionEnd =
                            match.index +
                            match[0].length -
                            match[1].length +
                            username.length +
                            1;

                        textAreaRef.current.focus();
                    }
                }, 0);
            }

            setShowUser(false);
        };

        useEffect(() => {
            if (activities.length > 3) {
                setLoadMore(false)
            }
            if (comment.length === 0) {
                setShowUser(false);
                return;
            }
            const cursorPosition = textAreaRef.current?.selectionStart;
            const beforeCursor = comment.slice(0, cursorPosition);
            const match = beforeCursor.match(/(?:^|\s)@(\w*)$/);

            if (match) {
                const searchTerm = match[1].toLowerCase();

                const filtered =
                    searchTerm === ""
                        ? members
                        : members?.filter((member) =>
                            member.displayName.toLowerCase().startsWith(searchTerm),
                        );

                setFilteredMembers(filtered);
                setShowUser(filtered !== undefined && filtered.length > 0);
            } else {
                setShowUser(false);
            }
        }, [comment, members]);

        useEffect(() => {
            const fetchTeam = async () => {
                try {
                    let data = JSON.stringify({
                        "queries": [
                            {
                                "projectIdQuery": {
                                    "projectId": projectId
                                }
                            }
                        ]
                    });
                    const response = await axios.post(
                        `${authority}/management/v1/users/grants/_search`,
                        data,
                        {
                            headers: {
                                "x-zitadel-orgid": organizationId,
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setMembers(response.data.result);
                } catch (err) {
                    console.log(err)
                }
            };

            fetchTeam();
        }, []);

        const highlightUsersInComment = (text: string): string => {

            if (!text || text.length === 0 || !members || members.length === 0) return text;

            const regex = new RegExp(
                `@(${members
                    .map((user) => (user.displayName || "").replaceAll(/\s+/g, "\\s+"))
                    .join("|")})`,
                "g"
            );

            return text.replace(regex, (match) => `<strong>${match}</strong>`);
        };


        const userId = Cookie.get("zitadel_user_id");
        const tenantId = Cookie.get("zitadel_tenant_id")
        const userName = Cookie.get("zitadel_user_name")

        const handleReplyClick = (logId: number, description: string): void => {
            setReply({ parentId: logId, message: description });

            if (textAreaRef.current) {
                textAreaRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                textAreaRef.current.focus();
            }
        };

        const toggleReplies = (logId: number): void => {
            setShowReplies((prev) => ({
                ...prev,
                [logId]: !prev[logId],
            }));
        };

        const validateComment = (): boolean => {
            const specialCharactersPattern = /^[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}]+$/;
            const isSpacesAndDotsOnly = /^[ .]+$/g;
            const dueDatePattern = /due:\s*(\S*)/i;
            const htmlTagsPattern = /<\/?[a-z][\S\s]*>/i;
            const trimmedComment = comment.trim();

            if (trimmedComment === "") {
                setNotification({
                    isError: true,
                    message: "Please fill the field",
                    show: true,
                });
                return false;
            } else if (specialCharactersPattern.test(trimmedComment)) {
                setNotification({
                    isError: true,
                    message: "Please add a valid comment",
                    show: true,
                });
                return false;
            } else if (isSpacesAndDotsOnly.test(trimmedComment)) {
                setNotification({
                    isError: true,
                    message: "Please add a valid comment",
                    show: true,
                });
                return false;
            } else if (htmlTagsPattern.test(trimmedComment)) {
                setNotification({
                    isError: true,
                    message: "HTML tags are not allowed in the comment",
                    show: true,
                });
                return false;
            } else if (trimmedComment.length > 1000) {
                setNotification({
                    isError: true,
                    message: "Comment exceeds 1000 characters",
                    show: true,
                });
                return false;
            }

            const dueMatch = trimmedComment.match(dueDatePattern);
            if (dueMatch) {
                const dueDate = dueMatch[1];

                if (dueDate === "") {
                    setNotification({
                        isError: true,
                        message: "Please specify a date after 'due:'. Use YYYY-MM-DD format.",
                        show: true,
                    });
                    return false;
                }
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
                    setNotification({
                        isError: true,
                        message: `Invalid due date format: ${dueDate}. Use YYYY-MM-DD.`,
                        show: true,
                    });
                    return false;
                }
                const dateParts = dueDate.split("-").map(Number);
                const year = dateParts[0];
                const month = dateParts[1] - 1;
                const day = dateParts[2];
                const validDate = new Date(year, month, day);
                if (
                    validDate.getFullYear() !== year ||
                    validDate.getMonth() !== month ||
                    validDate.getDate() !== day
                ) {
                    setNotification({
                        isError: true,
                        message: `Invalid due date: ${dueDate}.`,
                        show: true,
                    });
                    return false;
                }
            }

            return true;
        };

        const AddComment = async (): Promise<void> => {
            if (validateComment()) {
                setNotification({
                    isError: false,
                    message: "",
                    show: false,
                });
                if (submitOption == "add") {
                    try {
                        setIsSubmitting(true)
                        const postBody = {
                            type: "addComment",
                            description: comment,
                            parentId: reply.parentId ?? undefined,
                            userId: userId,
                            source: source,
                            url: url,
                            activityType: 3,
                            platform: 1,
                        };
                        const response = await fetch("/api/comment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(postBody),
                        });
                        if (!response.ok) {
                            throw new Error("Failed to add comment");
                        }
                        const mentionedMembers = members
                            ?.filter(member => comment.includes(`@${member.displayName} `)).map(member => member.email);
                        const mentionedMembersName = members
                            ?.filter(member => comment.includes(`@${member.displayName} `)).map(member => member.displayName);
                        const allMembers = members?.map(member => member.email);
                        const recipients = notificationEnableForAllUsers == "true" ? allMembers : mentionedMembers;

                        if (recipients && recipients?.length > 0) {
                            const payload = {
                                commentContent: comment,
                                commentUrl: `<a href="${productionUrl}${url}" target="_blank">View Comment </a>`,
                                commenterName: userName,
                                date: new Date().toString(),
                                organizationName: organization
                            };

                            await novuApiCall(commentNotificationTemplate, payload, adminEmail, recipients);
                        }
                        const attributes = notificationEnableForAllUsers == "true" ? globalThis.setAttributes("Add Comment", {
                            mentioned: "allusers",
                        }) : globalThis.setAttributes("Add Comment", {
                            mentioned: mentionedMembersName?.join(", "),
                        });
                        globalThis.setOTTracer("add-comment", attributes);
                        setComment("");
                        setNotification({
                            show: false,
                            isError: false,
                            message: "",
                        });
                        const currentWindow: Window = window;
                        currentWindow.location.reload();

                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    try {
                        setIsSubmitting(true)
                        const postBody = {
                            type: "editLog",
                            description: comment,
                            source: source,
                            tenantId,
                            logMessage: `"${commentToEdit}" edited to "${comment}"`,
                            userId: userId,
                            url: url,
                            activityType: 3,
                            logId: editLogId,
                        };
                        const response = await fetch("/api/comment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(postBody),
                        });
                        if (!response.ok) {
                            throw new Error("Failed to edit comment");
                        }
                        const mentionedMembers = members
                            ?.filter(member => comment.includes(`@${member.displayName} `)).map(member => member.email);
                        const allMembers = members?.map(member => member.email);
                        const recipients = notificationEnableForAllUsers == "true" ? allMembers : mentionedMembers;

                        if (recipients && recipients?.length > 0) {
                            const payload = {
                                commentContent: comment,
                                commentUrl: `<a href="${productionUrl}${url}" target="_blank">View Edited Comment</a>`,
                                commenterName: userName,
                                date: new Date().toString(),
                                organizationName: organization
                            };

                            await novuApiCall("edited-comment-notification", payload, adminEmail, recipients);
                        }
                        setComment("");
                        setSubmitOption("add");
                        const currentWindow: Window = window;
                        currentWindow.location.reload();

                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        };


        useEffect(() => {
            if (!activities) return;

            const editLogs = activities.filter(activity => activity.activityType === "Edit Comment");
            const deleteLogs = activities.filter(activity => activity.activityType === "Delete Comment");

            const updateComments = (comments: LogType[]): any => {
                return comments.map((comment: LogType) => {

                    const relatedEdits = editLogs.filter(edit => edit.messageId === comment.logId);
                    const relatedDeletes = deleteLogs.filter(del => del.messageId === comment.logId);
                    const isEdited = relatedEdits.length > 0;
                    const existingChildrenLogIds = new Set(comment.children && comment.children.map((child: any) => child.logId));
                    const uniqueDeletes = relatedDeletes.filter(del => !existingChildrenLogIds.has(del.logId));

                    const updatedChildren = comment.children ? updateComments(comment.children) : [];

                    return {
                        ...comment,
                        edited: isEdited,
                        children: [
                            ...updatedChildren,
                            ...uniqueDeletes
                        ]
                    };
                });
            };

            let comments = buildTree(activities);
            comments = updateComments(comments);

            const uniqueDeleteLogs = new Set();
            deleteLogs.forEach(delLog => {
                const existingComment = comments.find(c => c.logId === delLog.messageId);
                if (!existingComment && !uniqueDeleteLogs.has(delLog.logId)) {
                    uniqueDeleteLogs.add(delLog.logId);
                    comments.push({
                        ...delLog,
                        children: []
                    });
                }
            });
            comments = comments.filter(comment => comment.activityType !== "Edit Comment");

            const uniqueCommentsSet = new Set();
            comments = comments.filter(comment => {
                if (!uniqueCommentsSet.has(comment.logId)) {
                    uniqueCommentsSet.add(comment.logId);
                    return true;
                }
                return false;
            });
            comments = comments.filter((comment) =>
                !(comment.messageId !== null && comment.activityType === "Delete Comment")
            );
            comments.sort((a, b) => a.timestamp - b.timestamp);
            setComments(comments);
        }, [activities]);


        const handleDeleteConfirmation = async (
            parentMessageId: string,
            timestamp: Date,
            id: number,
            userID: string,
            description: string,
        ): Promise<void> => {

            const isConfirmed = window.confirm(
                "Are you sure you want to delete the comment?",
            );

            if (isConfirmed) {
                await deleteLog(parentMessageId, timestamp, id, userID, description);
            }
            const currentWindow: Window = window;
            currentWindow.location.reload();
        };

        const deleteLog = async (
            parentMessageID: string,
            timestamp: Date,
            id: number,
            userID: string,
            description: string,
        ): Promise<void> => {

            if (userID === userId || userRole === "admin") {
                setNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
                try {
                    const postActivityBody = {
                        type: "deleteComment",
                        description: description,
                        parentMessageId: parentMessageID,
                        timeStamp: timestamp,
                        tenantId,
                        userId: userID,
                        updatedBy: userId,
                        source: source,
                        url: url,
                        activityType: 2,
                        messageId: id,
                    };
                    const response = await fetch("/api/comment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(postActivityBody),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to delete comment");
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                setNotification({
                    show: true,
                    isError: true,
                    message: "Unauthorized deletion attempt.",
                });
            }
        };

        const editComment = (logId: number, userID: string): void => {
            if (userID === userId) {
                setNotification({
                    show: false,
                    isError: false,
                    message: "",
                });
                setSubmitOption("edit");
                setEditLogId(logId);
                const activity = activities.find((item) => (item.logId as unknown as number) === logId);
                setComment(activity ? activity.description : "");
                setCommentToEdit(activity ? activity.description : "");
                if (cardRef.current) {
                    cardRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            } else {
                setNotification({
                    show: true,
                    isError: true,
                    message: "Unauthorized edit attempt.",
                });
            }
        };

        function renderTree(
            nodes: any[] | undefined,
            depth = 0,
        ): React.ReactNode {
            if (!nodes) return;
            return (loadMore == true ? nodes : nodes.slice(-3)).map((item: any) =>
            (
                <li
                    key={item.logId}
                    style={{
                        listStyleType: "none",
                        marginLeft: depth === 1 ? "100px" : `${depth * 30}px`,
                    }}
                    className="w-full"
                >
                    <div className="relative">
                        {depth === 0 && (
                            <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                            />
                        )}
                        <div className="relative flex space-x-3">
                            {depth == 0 ? (
                                <div>
                                    <span
                                        className={` h-10 w-10   rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                            style={{ color: "black" }}
                                        >
                                            <path d="M2 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6l-3 3V5a2 2 0 0 1 2-2z" />
                                        </svg>
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black text-xl font-semibold uppercase">
                                    <Gravatar userEmail={item.email ? item.email : ""} height={8} width={8} />
                                </div>
                            )}
                            <div className="flex min-w-0 flex-1 justify-between  pt-1.5">
                                <div className="">
                                    <div className="text-sm mb-2">
                                        {userId != undefined &&
                                            (userId === item.userId ? (
                                                <span className="font-medium text-sm">You</span>
                                            ) : (
                                                <span className="font-medium text-sm">{item.name}</span>
                                            ))}
                                    </div>
                                    <div className="bg-gray-100 flex justify-between items-center mr-2 px-4 py-2 rounded-r-lg rounded-bl-lg text-sm text-gray-700">
                                        <div>
                                            {(() => {
                                                // Skip rendering if activity type is "Edit Comment"
                                                if (item.activityType === "Edit Comment") {
                                                    return null;
                                                }

                                                switch (item.activityType) {
                                                    case "Comment":
                                                        return (
                                                            <span dangerouslySetInnerHTML={{ __html: highlightUsersInComment(item.description) }} />
                                                        );

                                                    case "Delete Comment":
                                                        return (
                                                            <i className="font-extralight text-xs text-gray-700">
                                                                {item.deletedUserId === userId
                                                                    ? "You deleted this comment"
                                                                    : `Deleted by ${item.deletedBy}`}
                                                            </i>
                                                        )
                                                    default:
                                                        return null; // Fallback for unexpected types
                                                }
                                            })()}


                                        </div>

                                        {item.edited && (
                                            <span className="font-extralight ml-2 float-right text-xs">Edited</span>
                                        )}
                                    </div>

                                    <div className="flex">
                                        <div>
                                            <div className="text-[13px]">
                                                {FormatTimeDifference(item.timestamp)}
                                                <div className="mt-2">
                                                    {item.reactions && (
                                                        <MessageReaction
                                                            messageId={item.logId}
                                                            reactions={item.reactions}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-2 mt-1">
                                            {!item.deleted ? (
                                                item.activityType === "Comment" ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            title="reply comment"
                                                            onClick={() => {
                                                                handleReplyClick(item.logId, item.description);
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                data-slot="icon"
                                                                className="delete-button w-4 h-4"
                                                                aria-label="Delete Comment"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                        {item.userId === userId || userRole === "admin" ? (
                                                            <button
                                                                title="Delete Comment"
                                                                onClick={() => {
                                                                    void handleDeleteConfirmation(
                                                                        item.parentId,
                                                                        item.timestamp,
                                                                        item.logId,
                                                                        item.userId ?? "",
                                                                        item.description,
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    data-slot="icon"
                                                                    className="delete-button w-4 h-4"
                                                                    aria-label="Delete Comment"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {item.userId === userId ? (
                                                            <button
                                                                onClick={() =>
                                                                    editComment(item.logId, item.userId ?? "")
                                                                } title="Edit Comment"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth="1.5"
                                                                    stroke=""
                                                                    aria-label="Edit Comment"
                                                                    id="edit-comment"
                                                                    className="w-4 h-4 fill-current"
                                                                >
                                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>
                                                ) : (
                                                    ""
                                                )
                                            ) : ""}

                                        </div>
                                    </div>
                                    <p>
                                        {item.children && item.children?.length > 0 && (
                                            <button
                                                onClick={() => toggleReplies(item.logId)}
                                                className=" text-sm text-blue-500 mt-2 flex mb-3 items-center"
                                            >
                                                {showReplies[item.logId] ? (
                                                    <>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            className="w-5 h-5 mr-1"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Hide {item.children?.length} Repl
                                                        {item.children.length > 1 ? "ies" : "y"}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            className="w-5 h-5 mr-1"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Show {item.children?.length} Repl
                                                        {item.children.length > 1 ? "ies" : "y"}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {item.children &&
                        item.children.length > 0 &&
                        showReplies[item.logId] && (
                            <ul style={{ paddingLeft: "0", paddingBottom: "0" }}>{renderTree(item.children, depth + 1)}</ul>
                        )}
                </li>
            ));
        }

        return (
            <>
                <div className="w-full">
                    <ul style={{ paddingLeft: "0" }}>
                        {renderTree(comments)}
                    </ul>

                    <div className="md:col-span-6 lg:col-span-12 ml-4 mt-8 mb-6">

                        <div className="flex text-base">
                            {activities.length > 3 && (
                                <button
                                    className="bg-gray-100 inline-flex px-3 py-1 rounded-xl text-sm text-gray-800"
                                    title="Load More"
                                    onClick={() => setLoadMore(!loadMore)}
                                >
                                    {loadMore ? "Show less" : "Load More"}
                                </button>
                            )}

                        </div>

                    </div>

                    <div ref={cardRef} className="">
                        <div className=" font-bold text-gray-700 flex gap-2 text-base ">
                            Comments
                            {/* // <ConventionalComment /> */}
                        </div>
                        <div className="mt-5 bg-white border rounded-md p-2">
                            <div className="">
                                {reply.parentId !== undefined && (
                                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                                        <span>{reply.message}</span>
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setReply({ parentId: undefined, message: undefined });
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {showUser && (
                                    <ul className="flex flex-col p-2 mt-0 mb-1 border rounded-md shadow-md " >
                                        {filteredMembers &&
                                            filteredMembers.length > 0 &&
                                            filteredMembers.map((member, index) => {
                                                return (
                                                    <>
                                                        <li
                                                            key={index}
                                                            className="flex gap-2 p-1 mt-0 mb-0 shadow-sm cursor-pointer"
                                                            onClick={() => {
                                                                handleSelectUser(member);
                                                            }}
                                                        >
                                                            <Gravatar
                                                                userEmail={member.email}
                                                                width={5}
                                                                height={5}
                                                            />
                                                            <span>{member.displayName}</span>
                                                        </li>
                                                    </>
                                                );
                                            })}
                                    </ul>
                                )}

                                <textarea
                                    rows={4}
                                    ref={textAreaRef}
                                    onChange={(event) => {
                                        setComment(event.target.value);
                                        setNotification({
                                            ...notification,
                                            show: false,
                                        });
                                    }}
                                    value={comment}
                                    name="comment"
                                    id="commentTextArea"
                                    className="block w-full rounded-md border-0 p-1.5 pt-0 pb-12 max-h-52 text-gray-900 ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset sm:text-sm sm:leading-6"
                                    placeholder="Comment here..."
                                    aria-labelledby="comment-label"
                                ></textarea>
                            </div>
                            <div className="bg-gray-100 flex justify-between items-center p-4">
                                <button
                                    id="submitButton"
                                    disabled={
                                        submitOption === "add"
                                            ? comment.trim() === ""
                                            : commentToEdit === comment
                                    }
                                    onClick={() => {
                                        void AddComment();
                                    }}
                                    title="Submit Comment"
                                    className="bg-gray-700 text-white p-3 rounded-lg"
                                >
                                    {isSubmitting ? (
                                        <div className="flex justify-center items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v2a6 6 0 000 12v2a8 8 0 01-8-8z"
                                                ></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        submitOption === "add" ? "Submit" : "Update"
                                    )}

                                </button>
                            </div>
                        </div>
                    </div>

                    {notification.show ? (
                        <div className="rounded-md bg-red-50 p-4 mt-2 mb-2">
                            <div className="flex">
                                <div
                                    className="flex-shrink-0"
                                    onClick={() =>
                                        setNotification({
                                            ...notification,
                                            show: false,
                                        })
                                    }
                                >
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
                                        {notification.message}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ) : undefined}
                </div>
            </>
        );
    };

export default Comment;
