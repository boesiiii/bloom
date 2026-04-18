import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { api, setToken } from "../api/client";
import Card from "../components/ui/Card";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signup = useMutation({
    mutationFn: api.signup,
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["me"], data.user);
      navigate("/", { replace: true });
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-leaf-700">Start small</p>
        <h1 className="mt-2 text-3xl font-bold text-stone-950">Create your relationship garden</h1>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            signup.mutate({ name, email, password });
          }}
        >
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 outline-none focus:border-leaf-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 outline-none focus:border-leaf-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Password</span>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 outline-none focus:border-leaf-500"
            />
          </label>
          {signup.error ? <p className="rounded-lg bg-clay-100 p-3 text-sm font-medium text-clay-500">{signup.error.message}</p> : null}
          <button type="submit" disabled={signup.isPending} className="min-h-12 w-full rounded-lg bg-leaf-700 font-semibold text-white disabled:opacity-60">
            {signup.isPending ? "Creating..." : "Sign up"}
          </button>
        </form>
      </Card>
      <p className="mt-5 text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link className="font-semibold text-leaf-700" to="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
