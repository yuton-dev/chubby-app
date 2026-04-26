"use client";

import { use, useMemo, useState } from "react";
import FeedModal from "../../../components/FeedModal";
import Header from "../../../components/Header";
import ListItem from "../../../components/ListItem";
import { useFeeds } from "../../../hooks/useFeeds";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ja-JP");
}

function getTodayInJst() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
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

  const filteredFeeds = useMemo(() => {
    if (!dateFilter) return feeds;
    return feeds.filter((feed) => feed.date.slice(0, 10) === dateFilter);
  }, [feeds, dateFilter]);

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

        <div className="space-y-2">
          {filteredFeeds.map((feed) => (
            <ListItem
              key={feed.id}
              title={feed.name}
              description={`${formatDate(feed.date)} / ChubbyID: ${feed.chubbyId}`}
            />
          ))}
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
