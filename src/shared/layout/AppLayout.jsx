import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";

export default function AppLayout({ fallback = null }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="content flex-1">
        <Suspense fallback={fallback}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
