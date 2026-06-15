"use client";

import { useState, useEffect, useRef } from "react";
import { Search, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { playersApi } from "@/lib/api/players";
import { invitationsApi } from "@/lib/api/invitations";
import type { PublicProfile } from "@/types";

interface Props {
  teamId: number;
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
}

export function InvitePlayerModal({ teamId, isOpen, onClose, onInvited }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PublicProfile | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await playersApi.search(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  const handleInvite = async () => {
    if (!selected) return;
    setSending(true);
    setError("");
    try {
      await invitationsApi.send(teamId, { username_or_public_id: selected.username, message: message || undefined });
      onInvited();
      onClose();
      setQuery(""); setSelected(null); setMessage("");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err?.response?.data?.detail ?? "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Player">
      {!selected ? (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search @username or #ID"
              className="input-field pl-9"
            />
          </div>
          {searching && <div className="flex justify-center py-4"><Spinner size="sm" /></div>}
          {results.length > 0 && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p.public_id}
                  onClick={() => setSelected(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <Avatar src={p.avatar_url} name={p.display_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.display_name}</p>
                    <p className="text-xs text-slate-500">@{p.username} · #{p.public_id}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {query && !searching && results.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No players found</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <Avatar src={selected.avatar_url} name={selected.display_name} size="md" />
            <div>
              <p className="font-medium text-slate-200">{selected.display_name}</p>
              <p className="text-sm text-slate-500">@{selected.username}</p>
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-xs text-slate-500 hover:text-slate-300">Change</button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message to player..."
            rows={2}
            className="input-field resize-none"
            maxLength={200}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleInvite} isLoading={sending} className="flex-1">
              <UserPlus size={14} /> Send Invite
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
