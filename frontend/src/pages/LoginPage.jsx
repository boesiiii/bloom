import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { api, setToken } from "../api/client";
import Card from "../components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo12345");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const from = location.state?.from || "/";

  const login = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
      navigate(from, { replace: true });
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-leaf-700">Relationship Garden</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-950">Bloom</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Log in with the demo account to explore the seeded prototype.</p>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate({ email, password });
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 outline-none focus:border-leaf-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 outline-none focus:border-leaf-500"
            />
          </label>
          {login.error ? <p className="rounded-lg bg-clay-100 p-3 text-sm font-medium text-clay-500">{login.error.message}</p> : null}
          <button type="submit" disabled={login.isPending} className="min-h-12 w-full rounded-lg bg-leaf-700 font-semibold text-white disabled:opacity-60">
            {login.isPending ? "Logging in..." : "Log in"}
          </button>
        </form>
      </Card>
      <p className="mt-5 text-center text-sm text-stone-600">
        New here?{" "}
        <Link className="font-semibold text-leaf-700" to="/signup">
          Create an account
        </Link>
      </p>
    </main>
  );
}
