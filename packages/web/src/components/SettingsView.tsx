import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Download,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  CheckCheck,
  PlusCircle,
  Upload,
  Globe,
  Link,
} from "lucide-react";
import { authClient } from "../lib/auth-client.ts";
import { api, type ProfileSummary } from "../lib/api.ts";
import { track, Event } from "../lib/analytics.ts";
import type { I18n } from "../types.ts";
import { Sex, UnitSystem } from "../types.ts";
import { errorMessage } from "../lib/utils.ts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";

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
  onImport?: (file: File) => void;
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
  onImport,
}: SettingsViewProps) {
  const { t } = i18n;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>

      <UnitSystemSection t={t} onUpdated={onProfileUpdated} />
      <ProfilesSection
        t={t}
        profiles={profiles}
        onProfileUpdated={onProfileUpdated}
        onProfileDeleted={onProfileDeleted}
        onProfilesReordered={onProfilesReordered}
        onExport={onExport}
        onCreateProfile={onCreateProfile}
      />
      {onImport && <ImportSection t={t} onImport={onImport} />}
      <CliSection t={t} />
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
  const [showShare, setShowShare] = useState(false);
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
      track(Event.ProfileDeleted);
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
              if (picked === Sex.Male || picked === Sex.Female) setSex(picked);
            }}
          >
            <ToggleGroupItem value={Sex.Male}>{t("sexMale")}</ToggleGroupItem>
            <ToggleGroupItem value={Sex.Female}>{t("sexFemale")}</ToggleGroupItem>
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
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 p-3 hover:bg-muted transition-colors">
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
          <div className="text-sm font-medium text-foreground truncate">
            {profile.name}
            {profile.isPublic && <Globe className="w-3 h-3 inline ml-1.5 text-emerald-500" />}
          </div>
          <div className="text-xs text-muted-foreground">
            {profile.dateOfBirth} · {profile.sex === Sex.Male ? t("sexMale") : t("sexFemale")}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant={showShare ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setShowShare(!showShare)}
            title={t("shareProfile")}
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={handleExport} title={t("export")}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => setEditing(true)} title={t("settingsEditProfile")}>
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
              variant="outline"
              size="icon-sm"
              onClick={() => setConfirmDelete(true)}
              className="hover:text-destructive hover:border-destructive/40"
              title={t("deleteUser")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {showShare && <ShareProfileSection profile={profile} t={t} onUpdated={onUpdated} />}
    </div>
  );
}

function ShareProfileSection({
  profile,
  t,
  onUpdated,
}: {
  profile: ProfileSummary;
  t: (key: string) => string;
  onUpdated: () => void;
}) {
  const [isPublic, setIsPublic] = useState(profile.isPublic);
  const [handle, setHandle] = useState(profile.publicHandle ?? "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  const isValidHandle = handle.length >= 3 && handle.length <= 40 && handleRegex.test(handle);
  const publicUrl = `${window.location.origin}/p/${handle}`;

  const checkHandle = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value || value.length < 3 || !handleRegex.test(value)) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      debounceRef.current = setTimeout(() => {
        api.checkHandleAvailability(value, profile.id).then((res) => {
          setAvailable(res.available);
          setChecking(false);
        });
      }, 400);
    },
    [profile.id],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile.id, {
        is_public: isPublic,
        public_handle: isPublic && isValidHandle ? handle : null,
      });
      if (isPublic && !profile.isPublic) track(Event.ProfileMadePublic);
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = isPublic !== profile.isPublic || (isPublic && handle !== (profile.publicHandle ?? ""));

  return (
    <div className="border-t border-border p-3 space-y-3 bg-muted/30">
      <div className="flex items-start gap-3">
        <Checkbox checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium">{t("shareProfile")}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">{t("shareProfileDesc")}</p>
        </div>
      </div>

      {isPublic && (
        <div className="space-y-2 pl-7">
          <div>
            <Label className="text-xs text-muted-foreground mb-1">{t("publicHandle")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">/p/</span>
              <Input
                type="text"
                value={handle}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  setHandle(v);
                  checkHandle(v);
                }}
                placeholder={t("publicHandlePlaceholder")}
                className="flex-1 h-8 text-sm"
                maxLength={40}
              />
            </div>
            {handle && (
              <p
                className={`text-xs mt-1 ${!isValidHandle ? "text-muted-foreground" : checking ? "text-muted-foreground" : available === true ? "text-emerald-600 dark:text-emerald-400" : available === false ? "text-destructive" : "text-muted-foreground"}`}
              >
                {!isValidHandle
                  ? t("publicHandleInvalid")
                  : checking
                    ? "..."
                    : available === true
                      ? t("publicHandleAvailable")
                      : available === false
                        ? t("publicHandleTaken")
                        : ""}
              </p>
            )}
          </div>

          {isValidHandle && profile.isPublic && profile.publicHandle === handle && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1">{t("publicProfileUrl")}</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono truncate">
                  {publicUrl}
                </code>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                >
                  {copiedUrl ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || (isPublic && (!isValidHandle || available === false))}
          >
            {saving ? "..." : t("settingsSave")}
          </Button>
        </div>
      )}
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

function ImportSection({ t, onImport }: { t: (key: string) => string; onImport: (file: File) => void }) {
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("import")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("importSettingsDesc")}</p>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
        <Button variant="outline" onClick={() => importRef.current?.click()}>
          <Upload className="w-4 h-4" />
          {t("importSelectFile")}
        </Button>
      </CardContent>
    </Card>
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

function CliSection({ t }: { t: (key: string) => string }) {
  const [copied, setCopied] = useState(false);
  const installCmd = "brew install nezdemkovski/tap/openmarkers";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card id="cli">
      <CardHeader>
        <CardTitle>{t("settingsCli")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("settingsCliDesc")}</p>

        <div>
          <Label className="mb-1">{t("settingsCliInstall")}</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg border border-input bg-muted text-sm font-mono truncate">
              {installCmd}
            </code>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UnitSystemSection({ t, onUpdated }: { t: (key: string) => string; onUpdated: () => void }) {
  const queryClient = useQueryClient();
  const { data: prefs, isLoading: loading } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => api.getPreferences(),
  });
  const unitSystem = prefs?.unitSystem ?? UnitSystem.SI;

  const handleChange = async (value: UnitSystem) => {
    queryClient.setQueryData(["preferences"], { unitSystem: value });
    try {
      await api.updatePreferences({ unit_system: value });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onUpdated();
    } catch {
      queryClient.setQueryData(["preferences"], { unitSystem });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settingsUnitSystem")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("settingsUnitSystemDesc")}</p>
        {loading ? (
          <div className="h-9" />
        ) : (
          <ToggleGroup
            variant="outline"
            value={[unitSystem]}
            onValueChange={(val) => {
              const picked = (val as string[]).find((v) => v !== unitSystem);
              if (picked === UnitSystem.SI || picked === UnitSystem.Conventional) handleChange(picked);
            }}
          >
            <ToggleGroupItem value={UnitSystem.SI}>{t("settingsUnitSI")}</ToggleGroupItem>
            <ToggleGroupItem value={UnitSystem.Conventional}>{t("settingsUnitConventional")}</ToggleGroupItem>
          </ToggleGroup>
        )}
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
