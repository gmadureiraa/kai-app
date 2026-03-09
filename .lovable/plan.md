
# Plano: Analytics (Beta) — Late API Real-Time

## Contexto

O sistema já possui um módulo **Performance** que mostra métricas históricas salvas no banco (tabelas `instagram_posts`, `twitter_posts`, `linkedin_posts`, `platform_metrics`). O usuário quer criar uma nova aba **Analytics (Beta)** que:

1. **Puxa dados diretamente da Late API** em tempo real (não do banco)
2. **Mostra métricas agregadas mais frescas** de cada plataforma conectada
3. **Fica separada da aba Performance** existente

## Análise Técnica

### Late API Endpoints Disponíveis

Da análise do código `fetch-late-metrics`, a Late API oferece:

**1. `/analytics` - Posts Analytics**
```typescript
GET /api/v1/analytics?profileId=X&platform=instagram&fromDate=Y&toDate=Z&limit=100
// Retorna posts com métricas: impressions, reach, likes, comments, shares, engagementRate
```

**2. `/accounts/follower-stats` - Follower Growth**
```typescript
GET /api/v1/accounts/follower-stats?profileId=X&granularity=daily&fromDate=Y&toDate=Z
// Retorna histórico de seguidores por plataforma e data
```

**3. `/profiles/:id/accounts` - Connected Accounts**
```typescript
GET /api/v1/profiles/:profileId/accounts
// Lista contas conectadas ao perfil Late
```

### Arquitetura Proposta

```
┌─────────────────────────────────────────────┐
│ KaiAnalyticsTab (Nova)                      │
│ ├─ Header com "Real-time via Late API"     │
│ ├─ Platform Cards (Instagram, Twitter, etc)│
│ │  ├─ Follower Stats (7d/30d growth)       │
│ │  ├─ Recent Posts Performance (top 10)    │
│ │  └─ Engagement Rate Trend                │
│ ├─ Sync Status (última sincronização)      │
│ └─ Botão "Atualizar Agora"                 │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│ late-analytics (Nova Edge Function)         │
│ ├─ Input: { clientId, platforms?, period } │
│ ├─ Busca late_profile_id do cliente        │
│ ├─ Chama /analytics + /follower-stats      │
│ ├─ Agrega e formata métricas                │
│ └─ Output: { platform → metrics }          │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│ Late API (https://getlate.dev/api/v1)      │
│ ├─ /analytics (posts com métricas)         │
│ └─ /accounts/follower-stats (crescimento)  │
└─────────────────────────────────────────────┘
```

## Mudanças

### 1. Nova Edge Function: `late-analytics`

**Objetivo:** Buscar métricas real-time da Late API sem salvar no banco

```typescript
interface LateAnalyticsRequest {
  clientId: string;
  platforms?: string[]; // ["instagram", "twitter", "linkedin"]
  period?: number; // dias (default: 7)
}

interface LateAnalyticsResponse {
  success: true;
  profileId: string;
  lastSyncedAt: string; // timestamp da chamada
  platforms: {
    [platform: string]: {
      followerStats: {
        current: number;
        change7d: number;
        change30d: number;
      };
      recentPosts: Array<{
        id: string;
        content: string;
        publishedAt: string;
        url: string;
        metrics: {
          impressions: number;
          likes: number;
          comments: number;
          shares: number;
          engagementRate: number;
        };
      }>;
      aggregates: {
        avgEngagementRate: number;
        totalImpressions: number;
        totalLikes: number;
      };
    };
  };
}
```

**Lógica:**
1. Buscar `late_profile_id` do cliente
2. Chamar `/follower-stats` com período de 30d
3. Chamar `/analytics` com limit=50 e período de 7d
4. Agregar dados por plataforma
5. Retornar JSON estruturado

### 2. Novo Hook: `useLateAnalytics`

```typescript
export function useLateAnalytics(clientId: string, platforms?: string[]) {
  return useQuery({
    queryKey: ["late-analytics", clientId, platforms],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("late-analytics", {
        body: { clientId, platforms },
      });
      if (error) throw error;
      return data as LateAnalyticsResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (cache)
    refetchOnMount: true,
  });
}
```

### 3. Novo Componente: `KaiAnalyticsTab.tsx`

**Estrutura:**
```
KaiAnalyticsTab
├─ Header
│  ├─ Badge "BETA"
│  ├─ Descrição "Métricas em tempo real via Late API"
│  └─ Botão "Atualizar" (refetch)
│
├─ Sync Status
│  └─ "Última atualização: há 2 minutos"
│
├─ Platform Tabs (Instagram | Twitter | LinkedIn)
│  
└─ Para cada plataforma:
   ├─ Follower Stats Card
   │  ├─ Current: 12,345
   │  ├─ +120 (7d) | +450 (30d)
   │  └─ Mini sparkline
   │
   ├─ Recent Posts Table (Top 10 by engagement)
   │  ├─ Post preview
   │  ├─ Métricas (impressions, likes, ER)
   │  └─ Data de publicação
   │
   └─ Aggregates Card
      ├─ Avg Engagement Rate: 4.2%
      ├─ Total Impressions: 45K
      └─ Total Likes: 1.2K
```

### 4. Sidebar: Adicionar Analytics (Beta)

**`KaiSidebar.tsx`:**
```typescript
const tabs = [
  // ... existing tabs
  { 
    id: "analytics", 
    label: "Analytics", 
    icon: BarChart3,
    badge: "BETA",
    requiresClient: true 
  },
  { id: "performance", label: "Performance", icon: TrendingUp, requiresClient: true },
  // ...
];
```

### 5. Routing: `Kai.tsx`

```typescript
case "analytics":
  return (
    <div className={cn("overflow-auto h-full", isMobile ? "p-3" : "p-6")}>
      <KaiAnalyticsTab clientId={selectedClient.id} client={selectedClient} />
    </div>
  );
```

## Diferenciais vs Performance Tab

| Feature | Performance | Analytics (Beta) |
|---------|-------------|------------------|
| Fonte de dados | Banco local (histórico) | Late API (real-time) |
| Atualização | Manual sync + background job | On-demand (botão refresh) |
| Período | Até 1 ano | Últimos 7-30 dias |
| Posts | Todos importados | Top 50 recentes |
| Features | Reports IA, Top Posts Grid, Heatmaps | Métricas agregadas simples |
| Objetivo | Análise profunda histórica | Dashboard rápido e fresco |

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/late-analytics/index.ts` | Nova edge function para buscar dados da Late API |
| `src/hooks/useLateAnalytics.ts` | Novo hook para chamar a function |
| `src/components/kai/KaiAnalyticsTab.tsx` | Novo componente de dashboard real-time |
| `src/components/kai/KaiSidebar.tsx` | Adicionar item "Analytics (Beta)" |
| `src/pages/Kai.tsx` | Adicionar routing para analytics tab |

## Prioridade de Implementação

1. Edge function `late-analytics` (backend primeiro)
2. Hook `useLateAnalytics`
3. Componente `KaiAnalyticsTab` (UI básica)
4. Integração sidebar + routing
5. Polish (sparklines, loading states, error handling)
