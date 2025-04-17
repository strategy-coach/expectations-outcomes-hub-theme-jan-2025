import React, { useState } from "react";
import commitData from "../../../gitcommit-details/githubLatestCommit.json";

interface CommitItem {
  fileStatus: string;
  authorDate: string;
  subject: string;
  authorName: string;
}

interface GitCommitDetailsProps {
  filename: string;
}

function getTimeDifference(commitDate: string | number | Date) {
  const currentDate = new Date();
  const commitDateTime = new Date(commitDate);
  const timeDifference = Math.abs(currentDate.getTime() - commitDateTime.getTime());
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysDifference === 1) return "1 day ago";
  if (daysDifference > 1) return `${daysDifference} days ago`;
  return "today";
}

const GitCommitDetails: React.FC<GitCommitDetailsProps> = ({ filename }) => {
  const filteredCommits = (commitData as CommitItem[])
    .filter((item) => {
      if (!item.fileStatus) return false;

      const filePath = item.fileStatus.split("\t")[1];
      if (!filePath) return false;

      const cleanedPath = filePath
        .replace(/^src\/content\/[^/]+\//, "")
        .replace(/\.\w+$/, "");

      return filename === cleanedPath;
    })
    .sort((a, b) => new Date(a.authorDate).getTime() - new Date(b.authorDate).getTime());

  const itemsPerPage = 5;
  const [page, setPage] = useState(0);

  const paginatedCommits = filteredCommits.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleNext = () => {
    if ((page + 1) * itemsPerPage < filteredCommits.length) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="md:col-span-3 pl-5 bg-white dark:bg-gray-800 shadow rounded-lg pt-6">
      <aside>
        <div className="flow-root min-h-90">
          <ul>
            {paginatedCommits.map((item, index) => (
              <li key={index} className="overflow-hidden">
                <div className="relative pb-6">
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
                  <div className="relative flex space-x-3">
                    <div>                    
                      <span className="h-8 w-8 p-1 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-500">📄</span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm mt-0">
                          <span className="font-medium text-sm">{item.subject}</span>
                          <br />
                          <span className="text-gray-500 text-xs">
                            <span className="font-medium">{item.authorName}</span>{" "}
                            committed {getTimeDifference(item.authorDate)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {filteredCommits.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4 pb-4 pr-4 relative">
                <button
                onClick={handlePrev}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-300 text-base rounded disabled:opacity-50"
                >
                Previous
                </button>

                <span className="text-sm text-gray-600">
                Page {page + 1} of {Math.ceil(filteredCommits.length / itemsPerPage)}
                </span>

                <button
                onClick={handleNext}
                disabled={(page + 1) * itemsPerPage >= filteredCommits.length}
                className="px-4 py-2 bg-gray-300 text-base rounded disabled:opacity-50"
                >
                Next
                </button>
             </div>
            )}

        </div>
      </aside>
    </div>
  );
};

export default GitCommitDetails;
