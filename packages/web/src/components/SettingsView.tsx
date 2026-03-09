import { useState, useEffect } from "react";
import { Pencil, Trash2, Download, Check, X, ChevronUp, ChevronDown, Copy, CheckCheck } from "lucide-react";
import { authClient } from "../lib/auth-client.ts";
import { api, type ProfileSummary } from "../lib/api.ts";
import type { I18n } from "../types.ts";

interface SettingsViewProps {
  i18n: I18n;
  profiles: ProfileSummary[];
  activeProfileId: number | null;
  onProfileUpdated: () => void;
  onProfileDeleted: (profileId: number) => void;
  onProfilesReordered: (profileIds: number[]) => void;
  authEmail: string | null;
  onDeleteAccount: () => void;
  onExport: (profileId: number) => void;
}

export default function SettingsView({
  i18n,
  profiles,
  onProfileUpdated,
  onProfileDeleted,
  onProfilesReordered,
  authEmail,
  onDeleteAccount,
  onExport,
}: SettingsViewProps) {
  const { t } = i18n;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("settings")}</h1>

      <ProfilesSection t={t} profiles={profiles} onProfileUpdated={onProfileUpdated} onProfileDeleted={onProfileDeleted} onProfilesReordered={onProfilesReordered} onExport={onExport} />
      <McpSection t={t} />
      <AccountSection t={t} authEmail={authEmail} />
      <DangerZoneSection t={t} onDeleteAccount={onDeleteAccount} />
    </div>
  );
}

function ProfilesSection({ t, profiles, onProfileUpdated, onProfileDeleted, onProfilesReordered, onExport }: {
  t: (key: string) => string;
  profiles: ProfileSummary[];
  onProfileUpdated: () => void;
  onProfileDeleted: (profileId: number) => void;
  onProfilesReordered: (profileIds: number[]) => void;
  onExport: (profileId: number) => void;
}) {
  const moveProfile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= profiles.length) return;
    const ids = profiles.map((p) => p.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    onProfilesReordered(ids);
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("settingsProfiles")}</h2>
      {profiles.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No profiles yet.</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((p, i) => (
            <ProfileRow
              key={p.id}
              profile={p}
              t={t}
              onUpdated={onProfileUpdated}
              onDeleted={onProfileDeleted}
              onExport={onExport}
              onMoveUp={i > 0 ? () => moveProfile(i, -1) : undefined}
              onMoveDown={i < profiles.length - 1 ? () => moveProfile(i, 1) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileRow({ profile, t, onUpdated, onDeleted, onExport, onMoveUp, onMoveDown }: {
  profile: ProfileSummary;
  t: (key: string) => string;
  onUpdated: () => void;
  onDeleted: (profileId: number) => void;
  onExport: (profileId: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [dob, setDob] = useState(profile.dateOfBirth);
  const [sex, setSex] = useState(profile.sex);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateProfile(profile.id, { name, date_of_birth: dob, sex });
      setEditing(false);
      onUpdated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProfile(profile.id);
      onDeleted(profile.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleExport = () => {
    onExport(profile.id);
  };

  if (editing) {
    return (
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("profileName")}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as "M" | "F")}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="M">{t("sexMale")}</option>
            <option value="F">{t("sexFemale")}</option>
          </select>
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setEditing(false); setName(profile.name); setDob(profile.dateOfBirth); setSex(profile.sex); }}
            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
      {(onMoveUp || onMoveDown) && (
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {profile.dateOfBirth} · {profile.sex === "M" ? t("sexMale") : t("sexFemale")}
        </div>
      </div>
      <button onClick={handleExport} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" title={t("export")}>
        <Download className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" title={t("settingsEditProfile")}>
        <Pencil className="w-4 h-4" />
      </button>
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title={t("deleteUserConfirm")}>
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmDelete(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" title={t("deleteUser")}>
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function AccountSection({ t, authEmail }: { t: (key: string) => string; authEmail: string | null }) {
  const [authName, setAuthName] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession().then((result) => {
      setAuthName(result?.data?.user?.name ?? null);
    });
  }, []);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("settingsAccount")}</h2>
      {authEmail && (
        <div className="text-sm text-gray-500 dark:text-gray-400">{authEmail}</div>
      )}
      <ChangeNameForm t={t} currentName={authName} />
      <ChangeEmailForm t={t} currentEmail={authEmail} />
      <ChangePasswordForm t={t} />
    </section>
  );
}

function ChangeNameForm({ t, currentName }: { t: (key: string) => string; currentName: string | null }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentName !== null) setName(currentName);
  }, [currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("saving");
    try {
      await authClient.updateUser({ name: name.trim() });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("settingsChangeName")}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("authName")}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!name.trim() || status === "saving"}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "..." : status === "saved" ? t("settingsSaved") : t("settingsSave")}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

function ChangeEmailForm({ t, currentEmail }: { t: (key: string) => string; currentEmail: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("saving");
    try {
      await authClient.changeEmail({ newEmail: email.trim() });
      setStatus("saved");
      setEmail("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("settingsChangeEmail")}</label>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={currentEmail || t("settingsNewEmail")}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!email.trim() || status === "saving"}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "..." : status === "saved" ? t("settingsSaved") : t("settingsSave")}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

function ChangePasswordForm({ t }: { t: (key: string) => string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setStatus("saving");
    try {
      await authClient.changePassword({ currentPassword, newPassword });
      setStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError((err as Error).message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("settingsChangePassword")}</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder={t("settingsCurrentPassword")}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("settingsNewPassword")}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!currentPassword || !newPassword || status === "saving"}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "..." : status === "saved" ? t("settingsSaved") : t("settingsSave")}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

function McpSection({ t }: { t: (key: string) => string }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const mcpUrl = `${window.location.origin}/mcp`;

  const mcpConfig = JSON.stringify({
    mcpServers: {
      openmarkers: {
        type: "http",
        url: mcpUrl,
      },
    },
  }, null, 2);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section id="mcp" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("settingsMcp")}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("settingsMcpDesc")}</p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settingsMcpEndpoint")}</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 font-mono truncate">{mcpUrl}</code>
            <button
              onClick={() => copyToClipboard(mcpUrl, "url")}
              className="shrink-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {copiedField === "url" ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settingsMcpConfigDesc")}</label>
          <div className="relative">
            <pre className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 font-mono overflow-x-auto">{mcpConfig}</pre>
            <button
              onClick={() => copyToClipboard(mcpConfig, "config")}
              className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {copiedField === "config" ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{t("settingsMcpTools")}</p>
    </section>
  );
}

function DangerZoneSection({ t, onDeleteAccount }: { t: (key: string) => string; onDeleteAccount: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    onDeleteAccount();
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">{t("settingsDangerZone")}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("settingsDeleteAccountDesc")}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={t("settingsDeleteAccountConfirm")}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleDelete}
          disabled={confirmText !== "DELETE" || deleting}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "..." : t("settingsDeleteAccount")}
        </button>
      </div>
    </section>
  );
}
