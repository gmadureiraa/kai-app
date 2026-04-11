import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isPast, isFuture, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
  selectedClientId?: string;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function HomeDashboard({ onNavigate, selectedClientId }: HomeDashboardProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { clients } = useClients();

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-home", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const userName = useMemo(() => {
    return userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  }, [userProfile, user]);

  // Fetch all planning items for dashboard stats
  const { data: planningItems } = useQuery({
    queryKey: ["home-dashboard-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("planning_items")
        .select("id, title, status, scheduled_at, client_id, platform, assigned_to, updated_at")
        .order("scheduled_at", { ascending: true });
      return data || [];
    },
  });

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const stats = useMemo(() => {
    if (!planningItems) return { overdue: [], today: [], thisWeek: [], byClient: [], byStatus: {} };

    const overdue = planningItems.filter(
      (i) => i.scheduled_at && isPast(new Date(i.scheduled_at)) && !isToday(new Date(i.scheduled_at)) && !["published", "failed"].includes(i.status)
    );

    const today = planningItems.filter(
      (i) => i.scheduled_at && isToday(new Date(i.scheduled_at))
    );

    const thisWeek = planningItems.filter(
      (i) => {
        if (!i.scheduled_at) return false;
        const d = new Date(i.scheduled_at);
        return d >= weekStart && d <= weekEnd;
      }
    );

    const byClient: Record<string, { total: number; pending: number; published: number }> = {};
    planningItems.forEach((item) => {
      if (!item.client_id) return;
      if (!byClient[item.client_id]) byClient[item.client_id] = { total: 0, pending: 0, published: 0 };
      byClient[item.client_id].total++;
      if (item.status === "published") byClient[item.client_id].published++;
      else byClient[item.client_id].pending++;
    });

    const byStatus: Record<string, number> = {};
    planningItems.forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });

    return {
      overdue,
      today,
      thisWeek,
      byClient: Object.entries(byClient).map(([clientId, s]) => ({ clientId, ...s })),
      byStatus,
    };
  }, [planningItems, weekStart, weekEnd]);

  const recentlyPublished = useMemo(() => {
    if (!planningItems) return [];
    return planningItems
      .filter((i) => i.status === "published")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [planningItems]);

  const getClientName = (clientId: string) => {
    return clients?.find((c) => c.id === clientId)?.name || "—";
  };

  const getClientAvatar = (clientId: string) => {
    return clients?.find((c) => c.id === clientId)?.avatar_url || null;
  };

  const statusLabels: Record<string, string> = {
    idea: "Ideias",
    draft: "Rascunho",
    review: "Revisão",
    approved: "Aprovado",
    scheduled: "Agendado",
    published: "Publicado",
    failed: "Falhou",
  };

  const statusColors: Record<string, string> = {
    idea: "bg-purple-500/10 text-purple-500",
    draft: "bg-blue-500/10 text-blue-500",
    review: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
    scheduled: "bg-orange-500/10 text-orange-500",
    published: "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={cn("h-full overflow-y-auto", isMobile ? "p-3" : "p-6")}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight">
            {getTimeGreeting()}{userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Card
            className={cn(
              "cursor-pointer hover:border-destructive/50 transition-colors",
              stats.overdue.length > 0 && "border-destructive/30 bg-destructive/5"
            )}
            onClick={() => onNavigate("planning")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={cn("h-4 w-4", stats.overdue.length > 0 ? "text-destructive" : "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground">Atrasados</span>
              </div>
              <p className={cn("text-2xl font-semibold", stats.overdue.length > 0 ? "text-destructive" : "text-foreground")}>
                {stats.overdue.length}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("planning")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Hoje</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.today.length}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("planning")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Esta semana</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.thisWeek.length}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onNavigate("planning")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Publicados</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.byStatus["published"] || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-5")}>
          {/* Overdue + Today Items */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="col-span-3 space-y-4"
          >
            {/* Overdue */}
            {stats.overdue.length > 0 && (
              <Card className="border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Itens atrasados ({stats.overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.overdue.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
                      onClick={() => onNavigate("planning")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title || "Sem título"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{getClientName(item.client_id)}</span>
                          {item.scheduled_at && (
                            <span className="text-xs text-destructive">
                              {format(new Date(item.scheduled_at), "dd/MM")}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.platform && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{item.platform}</Badge>
                      )}
                    </div>
                  ))}
                  {stats.overdue.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onNavigate("planning")}>
                      Ver todos ({stats.overdue.length}) <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Today's items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Hoje ({stats.today.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.today.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum item agendado para hoje</p>
                ) : (
                  <div className="space-y-2">
                    {stats.today.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => onNavigate("planning")}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title || "Sem título"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{getClientName(item.client_id)}</span>
                            <Badge className={cn("text-[10px] border-0", statusColors[item.status] || "")}>
                              {statusLabels[item.status] || item.status}
                            </Badge>
                          </div>
                        </div>
                        {item.platform && (
                          <Badge variant="outline" className="text-[10px] shrink-0">{item.platform}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Published */}
            {recentlyPublished.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Publicados recentemente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentlyPublished.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.title || "Sem título"}</p>
                        <span className="text-xs text-muted-foreground">{getClientName(item.client_id)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(item.updated_at), "dd/MM")}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Column: Client Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="col-span-2 space-y-4"
          >
            {/* Status Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.byStatus)
                  .filter(([status]) => status !== "published" && status !== "failed")
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <Badge className={cn("text-xs border-0", statusColors[status] || "")}>
                        {statusLabels[status] || status}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Clients Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Por cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.byClient
                  .sort((a, b) => b.pending - a.pending)
                  .slice(0, 8)
                  .map(({ clientId, total, pending, published }) => {
                    const avatarUrl = getClientAvatar(clientId);
                    return (
                      <div key={clientId} className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 rounded-md">
                          {avatarUrl && <AvatarImage src={avatarUrl} />}
                          <AvatarFallback className="rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                            {getClientName(clientId).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{getClientName(clientId)}</p>
                          <p className="text-xs text-muted-foreground">
                            {pending} pendente{pending !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{total}</span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}