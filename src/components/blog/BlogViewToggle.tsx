import React, { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  heroImage: string;
  date: string; 
}

interface Props {
  posts: BlogPost[];
}

const BlogViewToggle: React.FC<Props> = ({ posts }) => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setView("grid")}
          className={`px-3 py-1 text-sm font-medium rounded ${
            view === "grid"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setView("list")}
          className={`px-3 py-1 text-sm font-medium rounded ${
            view === "list"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          List View
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-transparent hover:bg-gray-100 dark:hover:border-gray-600 transition"
            >
              <img
                src={post.heroImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-2 dark:text-gray-300">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {post.date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.description.slice(0, 100)}
                  {post.description.length > 100 ? "…" : ""}
                </p>
                <span className="inline-block mt-auto pt-4 text-[#028db7] font-normal">
                  Read More →
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row w-full border border-transparent hover:bg-gray-100 dark:hover:border-gray-600 transition"
            >
              <img
                src={post.heroImage}
                alt={post.title}
                className="w-full md:w-60 h-48 md:h-48 object-cover"
              />
              <div className="p-6 flex flex-col justify-between flex-1">
                <h2 className="text-2xl font-bold mb-2 dark:text-gray-300">
                  {post.title}
                </h2>
                {post.date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.description.slice(0, 100)}
                  {post.description.length > 100 ? "…" : ""}
                </p>
                <span className="inline-block mt-auto pt-2 text-[#028db7] font-normal">
                  Read More →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogViewToggle;
