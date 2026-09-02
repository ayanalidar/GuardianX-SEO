"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetch } from "@/lib/seo/hooks";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Trash2, Mail, Target, CheckCircle2, Clock,
  ExternalLink, AlertTriangle, X, Loader2, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Client = {
  id: string;
  name: string;
  email: string;
  role: string;
  primaryGoal: string;
  token: string;
  onboardedAt: string;
  lastVisit: string | null;
  companyId: string;
  company: {
    id: string;
    name: string;
    website: string;
    logoText: string;
    industry: string;
    domain: { name: string; accent: string };
  };
  goalCount: number;
  taskCount: number;
  completedTasks: number;
};

export function ManageClients() {
  const { data, loading, error } = useFetch<{ clients: Client[] }>("/api/clients");
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localClients, setLocalClients] = useState<Client[] | null>(null);

  const clients = localClients ?? data?.clients ?? [];
  const filtered = search.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.company.name.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  const deleteClient = async (client: Client) => {
    setDeleting(client.id);
    try {
      const r = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      const j = await r.json();
      // Remove from local state
      setLocalClients((prev) => {
        const base = prev ?? data?.clients ?? [];
        return base.filter((c) => c.id !== client.id);
      });
      toast({
        title: "Client deleted",
        description: `${client.name} (${client.company.name}) and all related data have been removed.`,
      });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Manage Clients
            </CardTitle>
            <CardDescription>
              {clients.length} clients onboarded · delete removes all their data
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="h-9 rounded-lg border bg-background pl-8 pr-3 text-sm w-48"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground mt-2">Loading clients…</p>
          </div>
        )}
        {error && (
          <div className="p-8 text-center text-sm text-rose-500">Failed to load clients.</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search ? "No clients match your search." : "No clients onboarded yet."}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="max-h-[600px] overflow-y-auto rf-scroll">
            <AnimatePresence>
              {filtered.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-start gap-3 border-b last:border-b-0 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Logo */}
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: client.company.domain.accent }}
                  >
                    {client.company.logoText}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{client.name}</span>
                      <Badge variant="outline" className="text-[9px]">{client.role}</Badge>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{client.company.name}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{client.company.industry}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {client.goalCount} goals
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {client.completedTasks}/{client.taskCount} tasks done
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(client.onboardedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Portal: /portal/{client.token.slice(0, 12)}…
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`/portal/${client.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Open portal"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
                          title="Delete client"
                          disabled={deleting === client.id}
                        >
                          {deleting === client.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            Delete {client.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{client.name}</strong> and their company{" "}
                            <strong>{client.company.name}</strong>, including all SEO metrics, keywords,
                            backlinks, technical issues, content gaps, goals, tasks, and portal access.
                            <br /><br />
                            <strong className="text-rose-600">This action cannot be undone.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteClient(client)}
                            className="bg-rose-600 text-white hover:bg-rose-700 gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
