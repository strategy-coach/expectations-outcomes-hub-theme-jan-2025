import React, { useEffect, useState } from "react";
import { Gravatar } from "../profile/gravatar/Gravatar";
import Cookie from "js-cookie";
import { getUserInfo, getUserMetaData } from "./userService"
import type { ProfileInformation, UserMeta } from "./userService"

const userId = Cookie.get("userId") || ""

const handleEditProfile = (): void => {
    window.location.href = "/edit-profile";
};

const Profile: React.FC = () => {
    const [userNotificationStatus, setNotificationStatus] = useState<string>();;
    const [userBio, setUserBio] = useState<string>("");
    const [user, setUser] = useState<ProfileInformation | undefined>()
    useEffect(() => {
        getUserInfo(userId).then((response) => {
            setUser(response)
        })
        getUserMetaData(userId).then((response) => {
            const metadata = response as UserMeta
            metadata.result?.map((res) => {
                if (res.key == "notifications") {
                    const decodedValue = atob(res.value)
                    setNotificationStatus(decodedValue)

                } else if (res.key == "bio") {
                    const decodedValue = atob(res.value)
                    setUserBio(decodedValue)
                }
            })
        })
    }, [])


    return (
        <>

            <section className="px-2 pt-3">
                {user && <div className="grid grid-cols-1 md:grid-cols-12 gap-6 ">
                    <div className="col-span-1 md:col-span-8 border rounded-lg bg-white">
                        <article className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b p-6">
                            <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                                <Gravatar userEmail={user.user.human.email.email} height={35} width={35} />
                            </div>
                            <div className="col-span-1 md:col-span-4 flex flex-col justify-center">
                                <h2 className="text-xl font-semibold">{user.user.userName}</h2>
                            </div>
                            <div className="col-span-1 md:col-span-6 flex items-end justify-end">
                                <button
                                    onClick={handleEditProfile}
                                    className="mt-4 bg-blue-700 text-white py-2 px-4 h-10 rounded flex"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6 mr-1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </article>

                        <article className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">
                                Personal Information
                            </h2>
                            {user.user.human.profile.displayName !== "" && (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Display Name
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-2 text-gray-500"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                            />
                                        </svg>
                                        {user.user.human.profile.displayName}
                                    </div>
                                </aside>
                            )}
                            {user.user.human.email.email !== "" && (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Email Address
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex break-all">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-2 text-gray-500"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                            />
                                        </svg>

                                        {user.user.human.email.email}
                                    </div>
                                </aside>
                            )}
                            {user.user.human.profile.nickName && user.user.human.profile.nickName.trim() !== "" && (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Nick Name
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-2 text-gray-500"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                            />
                                        </svg>
                                        {user.user.human.profile.nickName}
                                    </div>
                                </aside>
                            )}
                            {typeof user.user.human.phone.phone === "string" && user.user.human.phone.phone !== "" && (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Phone Number
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5 mr-2 text-gray-500"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                                            />
                                        </svg>

                                        {user.user.human.phone.phone}
                                    </div>
                                </aside>
                            )}
                            {userBio !== "" ? (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        About Me
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">{userBio}</div>
                                </aside>) : <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                <div className="col-span-1 md:col-span-4 font-semibold">
                                    About Me
                                </div>
                                <div className="col-span-1 md:col-span-8 flex">Set some bio !!!</div>
                            </aside>
                            }
                            {userNotificationStatus !== "" && (
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Email Notifications
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">
                                        {userNotificationStatus == "true" ? "Enabled" : "Disabled"}
                                    </div>
                                </aside>
                            )}
                        </article>
                    </div>
                    <div className="col-span-1 md:col-span-4 ">
                        {" "}
                        <article className="bg-white border rounded-lg">
                            <div className="border-b">
                                <h2 className="text-xl font-semibold px-6 py-4">
                                    Account Information
                                </h2>
                            </div>
                            <div className="px-6 py-4">

                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Username
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex break-all">
                                        {user.user.userName}
                                    </div>
                                </aside>
                                <aside className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-base">
                                    <div className="col-span-1 md:col-span-4 font-semibold">
                                        Email
                                    </div>
                                    <div className="col-span-1 md:col-span-8 flex">

                                        {user.user.human.email.email}
                                    </div>
                                </aside>
                            </div>
                        </article>
                    </div>
                </div>}
            </section>
        </>
    );
};

export default Profile;
