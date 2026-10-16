import { useEffect, useRef, useState } from "react";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

type ImportedPhoto = { url: string; name: string };

export function useImportedPhoto() {
  const [photo, setPhoto] = useState<ImportedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);
  const activeUrlRef = useRef<string | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  function releaseUrls() {
    if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current);
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    activeUrlRef.current = null;
    pendingUrlRef.current = null;
  }

  useEffect(() => {
    return () => {
      requestRef.current += 1;
      releaseUrls();
    };
  }, []);

  function clear() {
    requestRef.current += 1;
    releaseUrls();
    setPhoto(null);
    setLoading(false);
    setError("");
  }

  async function selectFile(file: File): Promise<boolean> {
    const request = ++requestRef.current;
    if (pendingUrlRef.current) {
      URL.revokeObjectURL(pendingUrlRef.current);
      pendingUrlRef.current = null;
    }
    setLoading(false);
    setError("");
    const supported = file.type
      ? PHOTO_TYPES.has(file.type.toLowerCase())
      : /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name);
    if (!supported) {
      setError("Choose a JPG, PNG, WebP, GIF or AVIF image.");
      return false;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("This photo is too large. Choose an image under 10 MB.");
      return false;
    }
    setLoading(true);
    const url = URL.createObjectURL(file);
    pendingUrlRef.current = url;
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (request !== requestRef.current) return false;
      if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = url;
      pendingUrlRef.current = null;
      setPhoto({ url, name: file.name });
      return true;
    } catch {
      if (request === requestRef.current) {
        setError(
          "We couldn’t open this photo. Try another JPG, PNG or WebP image.",
        );
      }
      return false;
    } finally {
      if (activeUrlRef.current !== url) URL.revokeObjectURL(url);
      if (pendingUrlRef.current === url) pendingUrlRef.current = null;
      if (request === requestRef.current) setLoading(false);
    }
  }

  return { photo, loading, error, selectFile, clear };
}
