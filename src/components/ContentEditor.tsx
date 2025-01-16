import { useState } from "react";
import Editor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

interface Props {
  bodyContent: string;
}

const mdParser = new MarkdownIt();

const MarkdownEditor: React.FC<Props> = ({ bodyContent }) => {
  const initialContent = `${bodyContent}`;
  const [markdownContent, setMarkdownContent] = useState(initialContent);

  const handleEditorChange = ({
    bodyContent,
  }: {
    bodyContent: string;
  }): void => {
    setMarkdownContent(bodyContent);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <Editor
          value={markdownContent}
          renderHTML={(bodyContent) => mdParser.render(bodyContent)}
          onChange={handleEditorChange}
          style={{ height: "350px" }}
        />
      </div>
      <div style={{ flex: 1, padding: "20px", display: "none" }}>
        <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
      </div>
    </div>
  );
};

export default MarkdownEditor;
