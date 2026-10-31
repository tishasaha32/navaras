"use client";

import { createContext, useCallback, useContext, useRef, useState, useTransition } from "react";
import { uploadImage } from "@/app/admin/actions";

type Pick = (current?: string) => Promise<string | null>;

const PickContext = createContext<Pick>(async () => null);

/** One shared image library dialog for an editor. `usePickImage()` opens it and resolves with the chosen image. */
export function ImageLibraryProvider({ library, children }: { library: string[]; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((src: string | null) => void) | null>(null);
  const [images, setImages] = useState(library);
  const [current, setCurrent] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  const finish = (src: string | null) => {
    resolver.current?.(src);
    resolver.current = null;
    dialog.current?.close();
  };

  const pick = useCallback<Pick>((cur) => {
    resolver.current?.(null);
    setCurrent(cur);
    setError(null);
    dialog.current?.showModal();
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const upload = (file: File) => {
    setError(null);
    const form = new FormData();
    form.append("file", file);
    startUpload(async () => {
      const res = await uploadImage(form);
      if (!res.ok) return setError(res.error);
      if (res.url) {
        setImages((prev) => [res.url!, ...prev]);
        finish(res.url);
      }
    });
  };

  return (
    <PickContext.Provider value={pick}>
      {children}
      <dialog ref={dialog} className="picker__dialog" aria-label="Image library" onClose={() => finish(null)}>
        <div className="picker__head">
          <strong style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Image library</strong>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label className="adm-btn adm-btn--sm adm-btn--light">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => finish(null)}>
              Cancel
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="adm-error">
            {error}
          </p>
        )}
        <p className="adm-muted" style={{ margin: "0 0 12px" }}>
          PNG, JPEG, WebP or GIF up to 5 MB. Photos look best at least 1200px wide.
        </p>
        <div className="picker__grid">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              className="picker__option"
              aria-pressed={current === src}
              aria-label={src.split("/").pop()}
              onClick={() => finish(src)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </dialog>
    </PickContext.Provider>
  );
}

export function usePickImage() {
  return useContext(PickContext);
}

/** Current image with a "Replace image" button. */
export function ImageField({
  label,
  value,
  onChange,
  small = false,
  hint = "JPG or PNG, at least 1200px wide",
  removable = false,
}: {
  label: string;
  value: string;
  onChange: (src: string) => void;
  small?: boolean;
  hint?: string;
  removable?: boolean;
}) {
  const pick = usePickImage();
  const choose = async () => {
    const src = await pick(value);
    if (src) onChange(src);
  };
  return (
    <div className={`adm-field${small ? " adm-field--sm" : ""}`}>
      <span>{label}</span>
      <div className={`adm-image${small ? " adm-image--sm" : ""}`}>
        <div className="adm-image__thumb">{value && <img src={value} alt={`Current ${label.toLowerCase()}`} />}</div>
        <div className="adm-image__side">
          <button type="button" className="adm-btn adm-btn--sm" onClick={choose}>
            {value ? (small ? "Replace" : "Replace image") : "Choose image"}
          </button>
          {removable && value && (
            <button type="button" className="adm-link-btn" style={{ color: "var(--a-danger)" }} onClick={() => onChange("")}>
              Remove
            </button>
          )}
          {!small && <span className="adm-help">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
