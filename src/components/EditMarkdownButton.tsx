import { useState, useEffect } from "react";
import MarkdownEditor from "./MarkdownEditor";
import { getUserMetaData } from "./profile/userService";

const ButtonComponent = ({
  userId,
  rawMarkdownContent,
}: {
  userId: string;
  rawMarkdownContent: string;
}) => {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isEditorModalVisible, setEditorModalVisible] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isEditorModalVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isEditorModalVisible]);

  const handleButtonClick = async () => {
    try {
      const userMetaData = await getUserMetaData(userId);
      let gitHubToken = "";
      if (userMetaData?.result) {
        for (const item of userMetaData.result) {
          if (item.key === "gitHubToken") {
            gitHubToken = atob(item.value);
            break;
          }
        }
      }

      if (!gitHubToken) {
        setShowTokenModal(true);
        return;
      }

      setEditorModalVisible((prev) => !prev);
    } catch (error) {
      console.error("Failed to fetch user metadata", error);
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 text-right">
      <button
        type="button"
        onClick={handleButtonClick}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
      >
        {isEditorModalVisible ? "Cancel" : "Edit"}
      </button>

      {/* Token warning modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-md text-center">
            <p className="mb-4 text-sm text-gray-700">
              Update your profile with a valid <strong>GitHub Token</strong> to
              edit this content.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <a
                href="/edit-profile"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                OK, Go to Profile
              </a>
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {isEditorModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white w-full max-w-8xl mx-auto h-[90vh] flex flex-col rounded shadow-lg overflow-hidden relative">
            {/* Close button at top-right */}
            <button
              onClick={() => setEditorModalVisible(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              title="Close"
            >
              ✕
            </button>

            {/* Editor area, scrollable */}
            <div className="flex-1 overflow-auto">
              <MarkdownEditor bodyContent={rawMarkdownContent} />
            </div>

            {/* Sticky footer always visible */}
            <div className="sticky bottom-0 left-0 bg-white border-t flex justify-end gap-2 p-3">
              <button
                onClick={() => setEditorModalVisible(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // call the handleSaveClick of MarkdownEditor via ref
                  const saveButton =
                    document.getElementById("markdown-save-btn");
                  saveButton?.click();
                }}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonComponent;
