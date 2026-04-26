"use client";

import { useState } from "react";
import { createFeed } from "../lib/api";
import type { Feed } from "../lib/types";

type FeedModalProps = {
  open: boolean;
  chubbyId: string;
  onClose: () => void;
  onCreated?: (feed: Feed) => void;
};

function todayLocalDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function FeedModal({ open, chubbyId, onClose, onCreated }: FeedModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayLocalDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const feed = await createFeed({
        chubbyId,
        name: name.trim(),
        date: new Date(`${date}T00:00:00`).toISOString()
      });
      onCreated?.(feed);
      setName("");
      setDate(todayLocalDate());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ごはん登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">ごはん登録</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="食べたもの"
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        />
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-black/20 px-3 py-1.5"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-3 py-1.5 text-white disabled:opacity-60"
          >
            {isSubmitting ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}
