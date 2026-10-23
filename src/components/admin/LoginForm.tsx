"use client";

import { useState, type FormEvent } from "react";

export function LoginForm({ name }: { name: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return window.location.reload();
    const data = await response.json().catch(() => ({}));
    setError(data.error ?? "Connexion impossible.");
    setBusy(false);
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <h1>{name}</h1>
        <p>Administration du site</p>
        <label className="sf-field">
          <span className="sf-label">Mot de passe</span>
          <input
            className="sf-input"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <span className="sf-error">{error}</span>}
        <button type="submit" className="sf-button sf-button--primary" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
