type AuthResult = {
  data?: unknown;
  error?: {
    message?: string;
  } | null;
};

function redirectTo(path: string): never {
  window.location.assign(path);
  throw new Error("Redirecting");
}

async function getSession() {
  const res = await fetch("/api/auth/session");
  if (!res.ok) {
    return { data: null, error: { message: "Could not load session" } };
  }

  const data = await res.json();
  if (!data.authenticated) {
    return { data: null, error: null };
  }

  return {
    data: {
      session: true,
      user: data.user
    },
    error: null
  };
}

export const authClient = {
  getSession,
  signIn: {
    email: async (): Promise<AuthResult> => redirectTo("/api/auth/login")
  },
  signUp: {
    email: async (): Promise<AuthResult> => redirectTo("/api/auth/signup")
  },
  signOut: async (): Promise<AuthResult> => {
    await fetch("/api/auth/logout", { method: "POST" });
    return { data: { ok: true }, error: null };
  },
  changeEmail: async (): Promise<AuthResult> => {
    throw new Error("Email changes are managed by the hosted auth service.");
  },
  changePassword: async (): Promise<AuthResult> => {
    throw new Error("Password changes are managed by the hosted auth service.");
  }
};

export async function getAuthToken(): Promise<string | null> {
  const res = await fetch("/api/auth/token");

  if (!res.ok) {
    return null;
  }

  const data = await res.json().catch(() => null);
  return typeof data?.token === "string" ? data.token : null;
}
