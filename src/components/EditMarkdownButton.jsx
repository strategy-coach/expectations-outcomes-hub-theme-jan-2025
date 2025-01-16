import { useState } from "react";

const ButtonComponent = () => {
  const [isDivVisible, setDivVisible] = useState(false);

  const handleButtonClick = () => {
    setDivVisible(!isDivVisible);

    const sectionHtml = document.getElementById("html-content");
    if (sectionHtml) {
      sectionHtml.style.display =
        sectionHtml.style.display === "none" ? "block" : "none";
    }

    const sectionMarkdown = document.getElementById("markdown-content");
    if (sectionMarkdown) {
      sectionMarkdown.style.display =
        sectionMarkdown.style.display === "none" ? "block" : "none";
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 text-right">
      <button
        type="button"
        onClick={handleButtonClick}
        className="relative mt-3 inline-flex items-center gap-x-1.5 rounded text-white px-3 py-2 font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 text-sm"
        style={{ backgroundColor: "black" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
          ></path>
        </svg>
        {isDivVisible ? "Cancel" : "Edit"}
      </button>
    </div>
  );
};

export default ButtonComponent;
