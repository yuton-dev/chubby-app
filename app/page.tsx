import Link from "next/link";
import Header from "./components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <h1 className="mb-2 text-2xl font-bold">でぶアプリ</h1>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/masters"
            className="rounded-md border p-4 transition-colors"
            style={{ borderColor: "var(--border-soft)", background: "var(--secondary-soft)" }}
          >
            <h2 className="mb-1 font-semibold" style={{ color: "var(--foreground)" }}>
              マスター一覧
            </h2>
            <p className="text-sm" style={{ color: "#6f5541" }}>
              マスター側の人間を登録可能
            </p>
          </Link>
          <Link
            href="/chubbies"
            className="rounded-md border p-4 transition-colors"
            style={{ borderColor: "var(--border-soft)", background: "var(--primary-soft)" }}
          >
            <h2 className="mb-1 font-semibold" style={{ color: "var(--foreground)" }}>
              でぶ一覧
            </h2>
            <p className="text-sm" style={{ color: "#6f5541" }}>
              でぶの登録＆でぶ個人に遷移可能
            </p>
          </Link>
        </div>
      </main>
    </>
  );
}
