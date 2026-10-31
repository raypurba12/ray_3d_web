import { useCallback, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Mail,
  MailOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  deleteMessage,
  listMessages,
  notifyMessagesUpdated,
  updateMessageStatus,
  type AdminMessage,
  type MessageFilter,
  type MessageStatus,
} from "../../features/admin/messages/api";
import { ConfirmDialog } from "../../features/admin/ui/ConfirmDialog";
import {
  ListEmpty,
  ListError,
  ListSkeleton,
} from "../../features/admin/ui/ListState";
import { PageHeader } from "../../features/admin/ui/PageHeader";
import { describeError } from "../../features/admin/ui/serverErrors";
import {
  buttonGhost,
  buttonPrimary,
  panelClass,
} from "../../features/admin/ui/styles";
import { useAdminList } from "../../features/admin/ui/useAdminList";

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "NEW", label: "Baru" },
  { value: "READ", label: "Dibaca" },
  { value: "ARCHIVED", label: "Arsip" },
];

const STATUS_META: Record<
  MessageStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "Baru",
    className: "border-acid/30 bg-acid/10 text-acid",
  },
  READ: {
    label: "Dibaca",
    className: "border-white/10 bg-white/[0.05] text-secondary",
  },
  ARCHIVED: {
    label: "Arsip",
    className: "border-white/5 bg-white/[0.03] text-white/30",
  },
};

const EMPTY_COPY: Record<MessageFilter, { title: string; description: string }> =
  {
    all: {
      title: "Belum ada pesan",
      description:
        "Pesan yang dikirim lewat form kontak situs akan muncul di sini.",
    },
    NEW: {
      title: "Tidak ada pesan baru",
      description: "Semua pesan sudah dibaca.",
    },
    READ: {
      title: "Belum ada pesan dibaca",
      description: "Pesan yang sudah dibuka akan tampil di sini.",
    },
    ARCHIVED: {
      title: "Arsip kosong",
      description: "Pesan yang diarsipkan akan tampil di sini.",
    },
  };

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const MessagesPage = () => {
  const [filter, setFilter] = useState<MessageFilter>("all");
  const loadMessages = useCallback(() => listMessages(filter), [filter]);
  const {
    items: messages,
    loading,
    error,
    reload,
  } = useAdminList(loadMessages, "Gagal memuat pesan.");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const patchStatus = async (message: AdminMessage, status: MessageStatus) => {
    setBusyId(message.id);
    setActionError(null);

    try {
      await updateMessageStatus(message.id, status);
      notifyMessagesUpdated();
      reload();
    } catch (err) {
      setActionError(describeError(err, "Gagal memperbarui pesan."));
    } finally {
      setBusyId(null);
    }
  };

  const toggleExpanded = (message: AdminMessage) => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(message.id);
    if (message.status === "NEW") void patchStatus(message, "READ");
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteMessage(confirmTarget.id);
      notifyMessagesUpdated();
      setConfirmTarget(null);
      if (expandedId === confirmTarget.id) setExpandedId(null);
      reload();
    } catch (err) {
      setDeleteError(describeError(err, "Gagal menghapus pesan."));
    } finally {
      setDeleting(false);
    }
  };

  const emptyCopy = EMPTY_COPY[filter];

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Pesan yang dikirim pengunjung lewat form kontak situs."
        action={
          <button type="button" className={buttonGhost} onClick={reload}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      <div className="mt-6 inline-flex flex-wrap rounded-full border border-white/10 bg-white/[0.04] p-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value);
              setExpandedId(null);
              setActionError(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === item.value
                ? "bg-acid text-black"
                : "text-secondary hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {actionError}
        </p>
      )}

      {loading && <ListSkeleton rows={3} />}

      {!loading && error && <ListError message={error} onRetry={reload} />}

      {!loading && !error && messages.length === 0 && (
        <ListEmpty title={emptyCopy.title} description={emptyCopy.description} />
      )}

      {!loading && !error && messages.length > 0 && (
        <ul className="mt-6 space-y-3">
          {messages.map((message) => {
            const open = expandedId === message.id;
            const busy = busyId === message.id;
            const meta = STATUS_META[message.status];

            return (
              <li
                key={message.id}
                className={`${panelClass} overflow-hidden ${
                  message.status === "NEW" ? "border-acid/30" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(message)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.02]"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      message.status === "NEW" ? "bg-acid" : "bg-white/15"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-display text-sm font-bold text-white">
                        {message.name}
                      </span>
                      <span className="truncate text-xs text-secondary">
                        {message.email}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </span>
                    <span
                      className={`mt-1.5 block text-sm ${
                        open ? "whitespace-pre-wrap text-white/80" : "truncate text-secondary"
                      }`}
                    >
                      {message.message}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-4 py-3">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        "Re: Pesan dari situs portfolio"
                      )}`}
                      className={buttonPrimary}
                    >
                      <Mail size={14} />
                      Balas via email
                    </a>

                    {message.status === "ARCHIVED" ? (
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => void patchStatus(message, "READ")}
                        disabled={busy}
                      >
                        <ArchiveRestore size={14} />
                        Keluarkan dari arsip
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => void patchStatus(message, "ARCHIVED")}
                        disabled={busy}
                      >
                        <Archive size={14} />
                        Arsipkan
                      </button>
                    )}

                    {message.status === "READ" && (
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => void patchStatus(message, "NEW")}
                        disabled={busy}
                      >
                        <MailOpen size={14} />
                        Tandai baru
                      </button>
                    )}

                    <button
                      type="button"
                      className={`${buttonGhost} hover:border-red-400/40 hover:text-red-300`}
                      onClick={() => {
                        setDeleteError(null);
                        setConfirmTarget(message);
                      }}
                      disabled={busy}
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Hapus pesan ini?"
        description={`Pesan dari "${
          confirmTarget?.name ?? ""
        }" akan dihapus permanen.`}
        busy={deleting}
        error={deleteError}
        onCancel={() => {
          if (!deleting) setConfirmTarget(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
};

export default MessagesPage;
