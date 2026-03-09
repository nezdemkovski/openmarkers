import { useState } from "react";
import { Pencil, Trash2, Plus, Check, XIcon } from "lucide-react";
import { api } from "../lib/api.ts";
import type { Biomarker, I18n } from "../types.ts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ResultEditorProps {
  biomarker: Biomarker;
  profileId: number;
  i18n: I18n;
  onClose: () => void;
  onMutate: () => void;
}

export default function ResultEditor({ biomarker, profileId, i18n, onClose, onMutate }: ResultEditorProps) {
  const { t, tBio } = i18n;
  const isQual = biomarker.type === "qualitative";
  const sorted = [...biomarker.results].sort((a, b) => b.date.localeCompare(a.date));

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editValue, setEditValue] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newValue, setNewValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function startEdit(id: number, date: string, value: number | string) {
    setEditingId(id);
    setEditDate(date);
    setEditValue(String(value));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate("");
    setEditValue("");
  }

  async function saveEdit() {
    if (editingId == null || !editDate || !editValue) return;
    setBusy(true);
    try {
      const val = isQual ? editValue : Number(editValue);
      await api.updateResult(editingId, { date: editDate, value: val });
    } finally {
      setBusy(false);
    }
    cancelEdit();
    onMutate();
  }

  async function handleDelete(id: number) {
    setBusy(true);
    try {
      await api.deleteResult(id);
    } finally {
      setBusy(false);
    }
    setDeleteId(null);
    onMutate();
  }

  async function handleAdd() {
    if (!newDate || !newValue) return;
    setBusy(true);
    try {
      const val = isQual ? newValue : Number(newValue);
      await api.addResult({ profile_id: profileId, biomarker_id: biomarker.id, date: newDate, value: val });
    } finally {
      setBusy(false);
    }
    setNewDate("");
    setNewValue("");
    onMutate();
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{tBio(biomarker.id, "name")}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {biomarker.id}{biomarker.unit ? ` \u00b7 ${biomarker.unit}` : ""}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("resultDate")}</TableHead>
                  <TableHead>{t("resultValue")}</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id ?? r.date}>
                    {editingId === r.id ? (
                      <>
                        <TableCell className="pr-2">
                          <DatePicker
                            value={editDate}
                            onChange={setEditDate}
                          />
                        </TableCell>
                        <TableCell className="pr-2">
                          <Input
                            type={isQual ? "text" : "number"}
                            step="any"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={saveEdit}
                              disabled={busy}
                              className="text-green-600 dark:text-green-400"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="pr-2 text-sm text-muted-foreground">{r.date}</TableCell>
                        <TableCell className="pr-2 text-sm font-mono">{r.value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => r.id != null && startEdit(r.id, r.date, r.value)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => r.id != null && setDeleteId(r.id)}
                              disabled={busy}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                value={newDate}
                onChange={setNewDate}
                className="flex-1 min-w-[120px]"
              />
              <Input
                type={isQual ? "text" : "number"}
                step="any"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={t("resultValue")}
                className="flex-1 min-w-[80px]"
              />
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={busy || !newDate || !newValue}
              >
                <Plus className="w-4 h-4" />
                {t("addResult")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteResultConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteResultConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
