import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register — Library",
};

/** Registration page for new customer accounts. */
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-gray-50">
      <RegisterForm />
    </main>
  );
}
