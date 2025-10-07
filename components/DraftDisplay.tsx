import React from "react";
import ReactMarkdown from "react-markdown";
import copy from "copy-to-clipboard";

interface DraftDisplayProps {
  draft: string;
  onEdit: () => void;
  onRegenerate: () => void;
  onDownloadDocx: () => void;
}

const DraftDisplay: React.FC<DraftDisplayProps> = ({ draft, onEdit, onRegenerate, onDownloadDocx }) => {
  const handleCopy = () => {
    copy(draft);
    alert("Draft copied to clipboard!");
  };

  const handleDownloadMd = () => {
    const blob = new Blob([draft], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "draft.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="border p-4 rounded shadow my-2">
      <ReactMarkdown>{draft}</ReactMarkdown>
      <div className="mt-4 flex gap-2">
        <button onClick={handleCopy} className="px-3 py-1 bg-blue-500 text-white rounded">Copy</button>
        <button onClick={handleDownloadMd} className="px-3 py-1 bg-blue-400 text-white rounded">Download .md</button>
        <button onClick={onDownloadDocx} className="px-3 py-1 bg-purple-500 text-white rounded">Download .docx</button>
        <button onClick={onEdit} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit Variables</button>
        <button onClick={onRegenerate} className="px-3 py-1 bg-green-500 text-white rounded">Regenerate</button>
      </div>
    </div>
  );
};

export default DraftDisplay;
