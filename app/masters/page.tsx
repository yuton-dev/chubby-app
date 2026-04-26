"use client";

import { useState } from "react";
import Header from "../components/Header";
import ListItem from "../components/ListItem";
import MasterModal from "../components/MasterModal";
import { useMasters } from "../hooks/useMasters";

export default function MastersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { masters, isLoading, error, refetch } = useMasters();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">マスター一覧</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md px-3 py-1.5 text-white"
            style={{ background: "var(--primary-strong)" }}
          >
            新規作成
          </button>
        </div>

        {isLoading ? <p>読み込み中...</p> : null}
        {error ? <p className="text-red-600">{error.message}</p> : null}
        {!isLoading && !error && masters.length === 0 ? <p>データがありません。</p> : null}

        <div className="space-y-2">
          {masters.map((master) => (
            <ListItem
              key={master.id}
              title={master.name}
              description={master.sex}
            />
          ))}
        </div>
      </main>

      <MasterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          void refetch();
        }}
      />
    </>
  );
}