import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(f);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };
  return (
    <AuthBox title="WELCOME BACK, PLAYER" submit={submit} error={err}>
      <input
        className="input"
        placeholder="Email"
        type="email"
        required
        value={f.email}
        onChange={(e) => setF({ ...f, email: e.target.value })}
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        required
        value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })}
      />
      <p className="text-xs text-zinc-500">
        Demo user: player@nexora.dev / Player@123
      </p>
      <Link to="/register" className="text-sm text-neon">
        Create account →
      </Link>
    </AuthBox>
  );
}
export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(f);
      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    }
  };
  return (
    <AuthBox title="CREATE YOUR PLAYER ID" submit={submit} error={err}>
      <input
        className="input"
        placeholder="Name"
        required
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Email"
        type="email"
        required
        value={f.email}
        onChange={(e) => setF({ ...f, email: e.target.value })}
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        minLength="6"
        required
        value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })}
      />
      <Link to="/login" className="text-sm text-neon">
        Already registered? Login →
      </Link>
    </AuthBox>
  );
}
function AuthBox({ title, submit, error, children }) {
  return (
    <div className="flex min-h-[calc(100vh-145px)] items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl"
      >
        <p className="text-sm tracking-widest text-neon">NEXORA ACCESS</p>
        <h1 className="mt-2 font-display text-2xl font-bold">{title}</h1>
        <div className="mt-7 grid gap-4">{children}</div>
        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <button className="btn btn-primary mt-5 w-full">Continue</button>
      </form>
    </div>
  );
}
