import { useState } from "react";
import { Pencil, Trash2, Download, Check, X, ChevronUp, ChevronDown, Copy, CheckCheck, PlusCircle } from "lucide-react";
import { authClient } from "../lib/auth-client.ts";
import { api, type ProfileSummary } from "../lib/api.ts";
import type { I18n, Sex } from "../types.ts";
import { errorMessage } from "../lib/utils.ts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  onCreateProfile?: () => void;
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
  onCreateProfile,
}: SettingsViewProps) {
  const { t } = i18n;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>

      <ProfilesSection
        t={t}
        profiles={profiles}
        onProfileUpdated={onProfileUpdated}
        onProfileDeleted={onProfileDeleted}
        onProfilesReordered={onProfilesReordered}
        onExport={onExport}
        onCreateProfile={onCreateProfile}
      />
      <McpSection t={t} />
      <AccountSection t={t} authEmail={authEmail} />
      <DangerZoneSection t={t} onDeleteAccount={onDeleteAccount} />
    </div>
  );
}

function ProfilesSection({
  t,
  profiles,
  onProfileUpdated,
  onProfileDeleted,
  onProfilesReordered,
  onExport,
  onCreateProfile,
}: {
  t: (key: string) => string;
  profiles: ProfileSummary[];
  onProfileUpdated: () => void;
  onProfileDeleted: (profileId: number) => void;
  onProfilesReordered: (profileIds: number[]) => void;
  onExport: (profileId: number) => void;
  onCreateProfile?: () => void;
}) {
  const moveProfile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= profiles.length) return;
    const ids = profiles.map((p) => p.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
    onProfilesReordered(ids);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settingsProfiles")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No profiles yet.</p>
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
        {onCreateProfile && (
          <Button variant="outline" onClick={onCreateProfile} className="w-full">
            <PlusCircle className="w-4 h-4" />
            {t("createProfile")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileRow({
  profile,
  t,
  onUpdated,
  onDeleted,
  onExport,
  onMoveUp,
  onMoveDown,
}: {
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
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProfile(profile.id);
      onDeleted(profile.id);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const handleExport = () => {
    onExport(profile.id);
  };

  if (editing) {
    return (
      <div className="border border-primary rounded-lg p-4 space-y-3">
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("profileName")} />
        <div className="flex gap-2">
          <DatePicker value={dob} onChange={setDob} className="flex-1" />
          <ToggleGroup
            variant="outline"
            value={[sex]}
            onValueChange={(val) => {
              const picked = (val as string[]).find((v) => v !== sex);
              if (picked === "M" || picked === "F") setSex(picked);
            }}
          >
            <ToggleGroupItem value="M">{t("sexMale")}</ToggleGroupItem>
            <ToggleGroupItem value="F">{t("sexFemale")}</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditing(false);
              setName(profile.name);
              setDob(profile.dateOfBirth);
              setSex(profile.sex);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors">
      {(onMoveUp || onMoveDown) && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <Button variant="ghost" size="icon-xs" onClick={onMoveUp} disabled={!onMoveUp}>
            <ChevronUp className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onMoveDown} disabled={!onMoveDown}>
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{profile.name}</div>
        <div className="text-xs text-muted-foreground">
          {profile.dateOfBirth} · {profile.sex === "M" ? t("sexMale") : t("sexFemale")}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={handleExport} title={t("export")}>
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} title={t("settingsEditProfile")}>
          <Pencil className="w-4 h-4" />
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive/10"
              title={t("deleteUserConfirm")}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setConfirmDelete(true)}
            className="hover:text-destructive"
            title={t("deleteUser")}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AccountSection({ t, authEmail }: { t: (key: string) => string; authEmail: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settingsAccount")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChangeEmailForm t={t} currentEmail={authEmail} />
        <ChangePasswordForm t={t} />
      </CardContent>
    </Card>
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
      setError(errorMessage(err));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label>{t("settingsChangeEmail")}</Label>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={currentEmail || t("settingsNewEmail")}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!email.trim() || status === "saving"}>
          {status === "saving" ? "..." : status === "saved" ? t("settingsSaved") : t("settingsSave")}
        </Button>
      </div>
      {status === "error" && <p className="text-xs text-destructive">{error}</p>}
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
      setError(errorMessage(err));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label>{t("settingsChangePassword")}</Label>
      <Input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder={t("settingsCurrentPassword")}
      />
      <div className="flex gap-2">
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("settingsNewPassword")}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!currentPassword || !newPassword || status === "saving"}>
          {status === "saving" ? "..." : status === "saved" ? t("settingsSaved") : t("settingsSave")}
        </Button>
      </div>
      {status === "error" && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

function McpSection({ t }: { t: (key: string) => string }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const mcpUrl = `${window.location.origin}/mcp`;

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        openmarkers: {
          type: "http",
          url: mcpUrl,
        },
      },
    },
    null,
    2,
  );

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card id="mcp">
      <CardHeader>
        <CardTitle>{t("settingsMcp")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("settingsMcpDesc")}</p>

        <div className="space-y-3">
          <div>
            <Label className="mb-1">{t("settingsMcpEndpoint")}</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg border border-input bg-muted text-sm font-mono truncate">
                {mcpUrl}
              </code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(mcpUrl, "url")}>
                {copiedField === "url" ? (
                  <CheckCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-1">{t("settingsMcpConfigDesc")}</Label>
            <div className="relative">
              <pre className="px-3 py-2 rounded-lg border border-input bg-muted text-sm font-mono overflow-x-auto">
                {mcpConfig}
              </pre>
              <Button
                variant="outline"
                size="xs"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(mcpConfig, "config")}
              >
                {copiedField === "config" ? (
                  <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{t("settingsMcpTools")}</p>
      </CardContent>
    </Card>
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
    <Card className="ring-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">{t("settingsDangerZone")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("settingsDeleteAccountDesc")}</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t("settingsDeleteAccountConfirm")}
            className="flex-1 focus-visible:border-destructive focus-visible:ring-destructive/50"
          />
          <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== "DELETE" || deleting}>
            {deleting ? "..." : t("settingsDeleteAccount")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
