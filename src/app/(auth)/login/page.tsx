import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — Library",
};

/** Login page. LoginForm is wrapped in Suspense because it reads searchParams via useSearchParams(). */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-gray-50">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
