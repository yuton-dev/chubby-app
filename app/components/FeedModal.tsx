"use client";

import { useState } from "react";
import { createFeed } from "../lib/api";
import { MEAL_TYPES, type Feed, type MealType } from "../lib/types";
import { useMasters } from "../hooks/useMasters";

type FeedModalProps = {
  open: boolean;
  chubbyId: string;
  onClose: () => void;
  onCreated?: (feed: Feed) => void;
};

function todayLocalDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildFeedDateKey(selectedDate: string) {
  const now = new Date();
  const timePart = now.toISOString().slice(11);
  return `${selectedDate}T${timePart}`;
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "夜",
  snack: "おやつ"
};

const SELF_OPTION = "__self__";

export default function FeedModal({ open, chubbyId, onClose, onCreated }: FeedModalProps) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [calories, setCalories] = useState("");
  const [fromWho, setFromWho] = useState(SELF_OPTION);
  const [date, setDate] = useState(todayLocalDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { masters } = useMasters();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const calorieValue = Number(calories);

    if (!trimmedName) {
      setError("名前は必須です。");
      return;
    }
    if (!Number.isFinite(calorieValue) || calorieValue < 0) {
      setError("カロリーは0以上の数値を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const feed = await createFeed({
        chubbyId,
        name: trimmedName,
        mealType,
        calories: calorieValue,
        masterId: fromWho === SELF_OPTION ? chubbyId : fromWho,
        masterName: undefined,
        date: buildFeedDateKey(date)
      });
      onCreated?.(feed);
      setName("");
      setMealType("lunch");
      setCalories("");
      setFromWho(SELF_OPTION);
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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg p-4"
        style={{ border: "1px solid var(--border-soft)", background: "var(--surface)" }}
      >
        <h2 className="mb-3 text-lg font-semibold">ごはん登録</h2>
        <label className="mb-1 block text-sm font-medium">
          ご飯の名前
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ホイップドーナツ"
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        />
        <label className="mb-1 block text-sm font-medium">
          食事の種類
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {mealTypeLabel[type]}
            </option>
          ))}
        </select>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">
            カロリー
          </label>
          <div className="flex items-center rounded-md border border-black/20 px-3">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="w-full py-2 outline-none"
            />
            <span className="ml-2 text-sm text-black/60">kcal</span>
          </div>
        </div>
        <label className="mb-1 block text-sm font-medium">
          マスター
        </label>
        <select
          value={fromWho}
          onChange={(e) => setFromWho(e.target.value)}
          className="mb-3 w-full rounded-md border border-black/20 px-3 py-2"
        >
          <option value={SELF_OPTION}>自分</option>
          {masters.map((master) => (
            <option key={master.id} value={master.id}>
              {master.name}
            </option>
          ))}
        </select>
        <label className="mb-1 block text-sm font-medium">
          日付
        </label>
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
            className="rounded-md px-3 py-1.5 text-white disabled:opacity-60"
            style={{ background: "var(--primary-strong)" }}
          >
            {isSubmitting ? "登録中..." : "登録"}
          </button>
        </div>
      </form>
    </div>
  );
}
