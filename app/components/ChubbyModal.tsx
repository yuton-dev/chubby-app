"use client";

import { useState } from "react";
import { createChubby } from "../lib/api";
import type { Chubby } from "../lib/types";

type ChubbyModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (chubby: Chubby) => void;
};

export default function ChubbyModal({
  open,
  onClose,
  onCreated
}: ChubbyModalProps) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const chubby = await createChubby({
        name: name.trim(), 
        sex: sex,
        birthDay: birthDay
      });
      onCreated?.(chubby);
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chubby作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Chubby作成</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        />
        {/* 性別 */}
        <select
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        >
          <option value="">性別を選択</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
        </select>

        {/* 生年月日 */}
        <input
          type="date"
          value={birthDay}
          onChange={(e) => setBirthDay(e.target.value)}
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
            {isSubmitting ? "作成中..." : "作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
