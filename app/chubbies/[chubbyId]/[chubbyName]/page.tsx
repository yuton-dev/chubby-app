"use client";

import { use, useMemo, useState } from "react";
import FeedModal from "../../../components/FeedModal";
import Header from "../../../components/Header";
import { useFeeds } from "../../../hooks/useFeeds";
import { useMasters } from "../../../hooks/useMasters";
import { deleteFeedRireki } from "../../../lib/api";
import type { Feed, MealType } from "../../../lib/types";

function getTodayInJst() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "朝",
  lunch: "昼",
  dinner: "夜",
  snack: "おやつ"
};

function resolveFromWho(
  feed: { masterId?: string; masterName?: string },
  chubbyId: string,
  masterNameById: Record<string, string>
) {
  if (feed.masterId && feed.masterId === chubbyId) {
    return "自分";
  }
  if (feed.masterName) {
    return feed.masterName;
  }
  if (feed.masterId && masterNameById[feed.masterId]) {
    return masterNameById[feed.masterId];
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
  const [pendingDelete, setPendingDelete] = useState<Feed | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { feeds, isLoading, error, refetch } = useFeeds(chubbyId, dateFilter || undefined);
  const { masters } = useMasters();
  const masterNameById = useMemo(
    () => Object.fromEntries(masters.map((master) => [master.id, master.name])),
    [masters]
  );

  const filteredFeeds = useMemo(() => {
    if (!dateFilter) return feeds;
    return feeds.filter((feed) => feed.date.slice(0, 10) === dateFilter);
  }, [feeds, dateFilter]);

  const filteredTotalCalories = useMemo(
    () => filteredFeeds.reduce((total, feed) => total + (feed.calories ?? 0), 0),
    [filteredFeeds]
  );

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteFeedRireki({
        chubbyId,
        feedId: pendingDelete.id,
        date: pendingDelete.date
      });
      setPendingDelete(null);
      await refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">でぶ個人: {decodedChubbyName}</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md px-3 py-1.5 text-white"
            style={{ background: "var(--primary-strong)" }}
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

        <p className="mb-3 text-sm font-medium text-black/70">
          {dateFilter} の総カロリー: {filteredTotalCalories} kcal
        </p>

        <div
          className="overflow-x-auto rounded-md border"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        >
          <table className="min-w-full border-collapse text-sm">
            <thead style={{ background: "var(--secondary-soft)" }}>
              <tr>
                <th className="px-3 py-2 text-left font-semibold">ご飯名</th>
                <th className="px-3 py-2 text-left font-semibold">何ご飯</th>
                <th className="px-3 py-2 text-left font-semibold">カロリー</th>
                <th className="px-3 py-2 text-left font-semibold">誰から</th>
                <th className="w-10 px-2 py-2" aria-label="削除" />
              </tr>
            </thead>
            <tbody>
              {filteredFeeds.map((feed) => (
                <tr key={feed.id} className="border-t" style={{ borderColor: "var(--border-soft)" }}>
                  <td className="px-3 py-2">{feed.name}</td>
                  <td className="px-3 py-2">{feed.mealType ? mealTypeLabel[feed.mealType] : "-"}</td>
                  <td className="px-3 py-2">{feed.calories !== undefined ? `${feed.calories} kcal` : "-"}</td>
                  <td className="px-3 py-2">{resolveFromWho(feed, chubbyId, masterNameById)}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setPendingDelete(feed)}
                      className="cursor-pointer rounded-md px-2 py-1 text-sm leading-none transition-transform hover:scale-110"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = "#f9e2e0";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                      style={{ color: "#b4534d" }}
                      aria-label={`${feed.name} を削除`}
                      title="削除"
                    >
                      🗑
                    </button>
                  </td>
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

      {pendingDelete ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-sm rounded-lg p-4"
            style={{ border: "1px solid var(--border-soft)", background: "var(--surface)" }}
          >
            <h2 className="mb-2 text-lg font-semibold">削除確認</h2>
            <p className="mb-3 text-sm">「{pendingDelete.name}」の履歴を削除します。よろしいですか？</p>
            {deleteError ? <p className="mb-3 text-sm text-red-600">{deleteError}</p> : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isDeleting) return;
                  setPendingDelete(null);
                  setDeleteError(null);
                }}
                className="rounded-md border border-black/20 px-3 py-1.5"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleConfirmDelete();
                }}
                disabled={isDeleting}
                className="rounded-md px-3 py-1.5 text-white disabled:opacity-60"
                style={{ background: "#b4534d" }}
              >
                {isDeleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
