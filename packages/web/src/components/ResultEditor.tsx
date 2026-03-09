import { useState } from "react";
import { X, Pencil, Trash2, Plus, Check, XIcon } from "lucide-react";
import { api } from "../lib/api.ts";
import type { Biomarker, I18n } from "../types.ts";

interface ResultEditorProps {
  biomarker: Biomarker;
  profileId: number;
  i18n: I18n;
  onClose: () => void;
  onMutate: () => void;
}

const INPUT_CLASS = "w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500";

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
    if (!confirm(t("deleteResultConfirm"))) return;
    setBusy(true);
    try {
      await api.deleteResult(id);
    } finally {
      setBusy(false);
    }
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{tBio(biomarker.id, "name")}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {biomarker.id}{biomarker.unit ? ` \u00b7 ${biomarker.unit}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left pb-2 font-medium">{t("resultDate")}</th>
                <th className="text-left pb-2 font-medium">{t("resultValue")}</th>
                <th className="pb-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id ?? r.date} className="border-b border-gray-100 dark:border-gray-700/50">
                  {editingId === r.id ? (
                    <>
                      <td className="py-2 pr-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type={isQual ? "text" : "number"}
                          step="any"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={busy}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-2 text-sm text-gray-700 dark:text-gray-300">{r.date}</td>
                      <td className="py-2 pr-2 text-sm font-mono text-gray-900 dark:text-gray-100">{r.value}</td>
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => r.id != null && startEdit(r.id, r.date, r.value)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => r.id != null && handleDelete(r.id)}
                            disabled={busy}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={`flex-1 ${INPUT_CLASS}`}
            />
            <input
              type={isQual ? "text" : "number"}
              step="any"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={t("resultValue")}
              className={`flex-1 ${INPUT_CLASS}`}
            />
            <button
              onClick={handleAdd}
              disabled={busy || !newDate || !newValue}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t("addResult")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
