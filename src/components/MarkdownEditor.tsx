import { useState } from "react";
import Editor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt();

interface Props {
  bodyContent: string;
}

const MarkdownEditor: React.FC<Props> = ({ bodyContent }) => {
  const [markdownContent, setMarkdownContent] = useState(bodyContent);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorView, setEditorView] = useState<"editor" | "preview">("editor");


  const handleEditorChange = ({ text }: { text: string }) => {
    setMarkdownContent(text);
    setHasChanges(text !== bodyContent);
  };

  const handleSaveClick = () => {
    setFeedbackMessage("");
    setIsError(false);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCommitMessage("");
    setFeedbackMessage("");
    setIsError(false);
  };

  const handleCommitMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommitMessage(e.target.value);
  };

  const handleConfirmSave = async () => {
    if (!commitMessage.trim()) {
      setFeedbackMessage("Please enter a commit message.");
      setIsError(true);
      return;
    }

    setIsSaving(true);
    const slug = window.location.pathname;

    const res = await fetch("/api/saveMarkdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        content: markdownContent,
        commitMessage,
      }),
    });

    setIsSaving(false);

    if (res.ok) {
      setIsError(false);
      setFeedbackMessage("Saved and committed to Git! Reloading...");
      setTimeout(() => {
        setIsModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }, 3000);
    } else {
      setIsError(true);
      setFeedbackMessage(
        "Failed to save or push to Git. Please check your GitHub token and ensure server environment variables (PUBLIC_CONTENT_GITHUB_OWNER, PUBLIC_CONTENT_GITHUB_REPO) are correctly set."
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Close button top-right */}
      <div className="relative">
        <button
          id="markdown-save-btn"
          onClick={handleSaveClick}
          className={`absolute top-2 right-2 px-3 py-1 text-sm rounded text-white ${
            hasChanges
              ? "bg-black hover:bg-gray-900"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!hasChanges || isSaving}
        >
          Save
        </button>
      </div>

      {/* Editor scrollable area */}
      <div className="flex-1 overflow-auto">
        <Editor
          value={markdownContent}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
          style={{ height: "100%", width: "100%" }}
          view={{
            menu: true,
            md: editorView === "editor",
            html: editorView === "preview",
          }}
        />
      </div>

      {/* Modal Popup for commit message */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleModalClose}
        >
          <div
            className="bg-white p-6 rounded-md w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2 text-left">
              Enter commit message
            </h3>
            <input
              type="text"
              value={commitMessage}
              onChange={handleCommitMessageChange}
              placeholder="docs: update content"
              className="w-full p-2 mb-1 border rounded border-gray-300 text-sm"
              disabled={isSaving}
            />
            {feedbackMessage && (
              <p
                className={`mb-4 text-sm text-left ${
                  isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {feedbackMessage}
              </p>
            )}
            <p className="text-[12px] text-gray-400 mt-2 mb-4 text-center">
              <span className="bg-yellow-100 px-2 py-1 rounded-md text-yellow-800 border border-yellow-200">
                Changes will be committed and visible on site in 10–15 min.
              </span>
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className={`px-4 py-2 rounded text-white ${
                  isSaving ? "bg-gray-600" : "bg-black hover:bg-gray-900"
                }`}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
