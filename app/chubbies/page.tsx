"use client";

import { useState } from "react";
import Header from "../components/Header";
import ChubbyModal from "../components/ChubbyModal";
import ListItem from "../components/ListItem";
import { useChubbies } from "../hooks/useChubbies";

export default function ChubbiesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { chubbies, isLoading, error, refetch } = useChubbies();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">でぶ一覧</h1>
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
        {!isLoading && !error && chubbies.length === 0 ? <p>データがありません。</p> : null}

        <div className="space-y-2">
          {chubbies.map((chubby) => (
            <ListItem
              key={chubby.id}
              href={`/chubbies/${chubby.id}/${encodeURIComponent(chubby.name)}`}
              title={chubby.name}
              description={chubby.sex}
            />
          ))}
        </div>
      </main>

      <ChubbyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          void refetch();
        }}
      />
    </>
  );
}