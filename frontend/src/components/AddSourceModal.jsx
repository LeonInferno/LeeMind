import { useRef, useState } from "react";

const TABS = ["Text", "Link", "File"];

const SOURCE_ICONS = {
  text: "📝",
  link: "🔗",
  file: "📄",
};

export default function AddSourceModal({ onAdd, onClose }) {
  const [tab, setTab] = useState("Text");
  const [textValue, setTextValue] = useState("");
  const [textName, setTextName] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [linkName, setLinkName] = useState("");
  const [fileError, setFileError] = useState("");
  const fileRef = useRef(null);

  function handleAdd() {
    if (tab === "Text") {
      if (!textValue.trim()) return;
      onAdd({
        id: crypto.randomUUID(),
        name: textName.trim() || "Pasted text",
        type: "text",
        content: textValue.trim(),
        icon: SOURCE_ICONS.text,
      });
    } else if (tab === "Link") {
      if (!linkValue.trim()) return;
      onAdd({
        id: crypto.randomUUID(),
        name: linkName.trim() || linkValue.trim(),
        type: "link",
        content: `[Source URL]: ${linkValue.trim()}`,
        icon: SOURCE_ICONS.link,
      });
    } else if (tab === "File") {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        setFileError("Please select a file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        onAdd({
          id: crypto.randomUUID(),
          name: file.name,
          type: "file",
          content: e.target.result,
          icon: SOURCE_ICONS.file,
        });
      };
      reader.onerror = () => setFileError("Could not read file.");
      reader.readAsText(file);
      return;
    }
    onClose();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const canAdd =
    (tab === "Text" && textValue.trim()) ||
    (tab === "Link" && linkValue.trim()) ||
    tab === "File";

  return (
    <div className="modalBackdrop" onClick={handleBackdrop}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">Add Source</div>
          <button className="modalClose" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modalTabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`modalTab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="modalBody">
          {tab === "Text" && (
            <>
              <input
                className="modalInput"
                placeholder="Source name (optional)"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
              />
              <textarea
                className="modalTextarea"
                placeholder="Paste your text content here…"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={8}
                autoFocus
              />
            </>
          )}

          {tab === "Link" && (
            <>
              <input
                className="modalInput"
                placeholder="Label (optional)"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
              />
              <input
                className="modalInput"
                placeholder="https://..."
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                autoFocus
              />
            </>
          )}

          {tab === "File" && (
            <div className="fileDropZone">
              <div className="fileDropIcon">📂</div>
              <div className="fileDropText">Select a .pdf or .txt file</div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt"
                className="fileInput"
                onChange={() => setFileError("")}
              />
              {fileError && <div className="fileError">{fileError}</div>}
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button className="btnGhost" onClick={onClose} type="button">Cancel</button>
          <button
            className="btnPrimary"
            onClick={handleAdd}
            disabled={!canAdd}
            type="button"
          >
            Add Source
          </button>
        </div>
      </div>
    </div>
  );
}
