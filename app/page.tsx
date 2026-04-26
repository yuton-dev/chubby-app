import Link from "next/link";
import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <h1 className="mb-2 text-2xl font-bold">でぶアプリ</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/masters" className="rounded-md border border-black/10 p-4 hover:bg-black/5">
            <h2 className="mb-1 font-semibold">マスター一覧</h2>
            <p className="text-sm text-black/60">マスター側の人間を登録可能</p>
          </Link>
          <Link href="/chubbies" className="rounded-md border border-black/10 p-4 hover:bg-black/5">
            <h2 className="mb-1 font-semibold">でぶ一覧</h2>
            <p className="text-sm text-black/60">でぶの登録＆でぶ個人に遷移可能</p>
          </Link>
        </div>
      </main>
    </>
  );
}
