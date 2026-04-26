"use client";

import { use, useMemo, useState } from "react";
import FeedModal from "../../../components/FeedModal";
import Header from "../../../components/Header";
import { useFeeds } from "../../../hooks/useFeeds";
import type { MealType } from "../../../lib/types";

function getTodayInJst() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "夜",
  snack: "おやつ"
};

function resolveFromWho(feed: { masterId?: string; masterName?: string }, chubbyId: string) {
  if (feed.masterId && feed.masterId === chubbyId) {
    return "自分";
  }
  if (feed.masterName) {
    return feed.masterName;
  }
  if (feed.masterId) {
    return feed.masterId;
  }
  return "-";
}

export default function ChubbyDetailPage({
  params
}: {
  params: Promise<{ chubbyId: string; chubbyName: string }>;
}) {
  const { chubbyId, chubbyName } = use(params);
  const decodedChubbyName = decodeURIComponent(chubbyName);
  const [dateFilter, setDateFilter] = useState(getTodayInJst);
  const [modalOpen, setModalOpen] = useState(false);
  const { feeds, isLoading, error, refetch } = useFeeds(chubbyId, dateFilter || undefined);
  const today = getTodayInJst();
  const { feeds: todayFeeds } = useFeeds(chubbyId, today);

  const filteredFeeds = useMemo(() => {
    if (!dateFilter) return feeds;
    return feeds.filter((feed) => feed.date.slice(0, 10) === dateFilter);
  }, [feeds, dateFilter]);

  const todayTotalCalories = useMemo(
    () => todayFeeds.reduce((total, feed) => total + (feed.calories ?? 0), 0),
    [todayFeeds]
  );

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">でぶ個人: {decodedChubbyName}</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-black px-3 py-1.5 text-white"
          >
            ごはん登録
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">日付</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="w-full max-w-sm rounded-md border border-black/20 px-3 py-2"
          />
        </div>

        {isLoading ? <p>読み込み中...</p> : null}
        {error ? <p className="text-red-600">{error.message}</p> : null}
        {!isLoading && !error && filteredFeeds.length === 0 ? <p>ごはん履歴がありません。</p> : null}

        <p className="mb-3 text-sm font-medium text-black/70">本日の総カロリー: {todayTotalCalories} kcal</p>

        <div className="overflow-x-auto rounded-md border border-black/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-black/[0.04]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">ご飯名</th>
                <th className="px-3 py-2 text-left font-semibold">何ご飯</th>
                <th className="px-3 py-2 text-left font-semibold">カロリー</th>
                <th className="px-3 py-2 text-left font-semibold">誰から</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeeds.map((feed) => (
                <tr key={feed.id} className="border-t border-black/10">
                  <td className="px-3 py-2">{feed.name}</td>
                  <td className="px-3 py-2">{feed.mealType ? mealTypeLabel[feed.mealType] : "-"}</td>
                  <td className="px-3 py-2">{feed.calories !== undefined ? `${feed.calories} kcal` : "-"}</td>
                  <td className="px-3 py-2">{resolveFromWho(feed, chubbyId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <FeedModal
        open={modalOpen}
        chubbyId={chubbyId}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          void refetch();
        }}
      />
    </>
  );
}
