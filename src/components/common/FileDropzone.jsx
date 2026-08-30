import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { classNames } from "../../utils/format";
import Button from "./Button";

export default function FileDropzone({
  files,
  setFiles,
  accept = ".jpg,.jpeg,.png,.pdf,.doc,.docx",
  hint = "Supported formats: JPG, PNG, PDF, DOC, DOCX (max 10MB each)",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (list) => {
    const next = Array.from(list).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={classNames(
          "flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-brand-400 bg-brand-50" : "border-ink-200 bg-canvas/40"
        )}
      >
        <UploadCloud size={28} className="mb-2 text-ink-400" />
        <p className="text-sm text-ink-600">Drag &amp; drop files here</p>
        <p className="my-1 text-xs text-ink-400">or</p>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
        />
        <p className="mt-3 text-[11px] text-ink-400">{hint}</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2">
              {f.preview ? (
                <img src={f.preview} alt={f.name} className="h-9 w-9 rounded object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded bg-ink-100 text-ink-500">
                  <FileText size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-800">{f.name}</p>
                <p className="text-[10px] text-ink-400">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-ink-400 hover:text-risk-high"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
