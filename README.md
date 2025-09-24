# Mini Seller Console

Um sistema completo de gerenciamento de leads e oportunidades de vendas, construído com React, TypeScript e uma arquitetura moderna baseada em princípios de Clean Architecture.

## 🎯 Visão Geral

O Mini Seller Console é uma aplicação que permite:
- **Gerenciar Leads**: Listar, filtrar, editar e converter leads em oportunidades
- **Pipeline de Vendas**: Acompanhar oportunidades através de diferentes estágios
- **Dashboard**: Visualizar métricas e estatísticas de performance
- **Interface Moderna**: Design responsivo com glassmorphism e gradientes

## 🏗️ Arquitetura

### Clean Architecture + DDD (Domain-Driven Design)

A aplicação segue os princípios da **Clean Architecture** combinada com conceitos de **Domain-Driven Design**, organizando o código em camadas bem definidas:

```
src/
├── domain/              # Camada de Domínio
│   └── schemas/         # Entidades e regras de negócio
├── infrastructure/      # Camada de Infraestrutura
│   ├── api/            # Simulação de API
│   ├── repositories/   # Implementação dos repositórios
│   └── storage/        # Serviços de armazenamento
├── application/        # Camada de Aplicação
│   └── hooks/          # Casos de uso via React Hooks
└── presentation/       # Camada de Apresentação
    ├── components/     # Componentes UI
    └── pages/         # Páginas da aplicação
```

### Por que essa Arquitetura?

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
2. **Testabilidade**: Facilita testes unitários e de integração
3. **Manutenibilidade**: Código organizado e fácil de manter
4. **Escalabilidade**: Estrutura preparada para crescimento
5. **Independência**: Camadas internas não dependem das externas

## 🔌 API Simulada

### Por que uma API Fake?

Embora o teste não exija uma API real, optamos por implementar uma **simulação completa de API** pelos seguintes motivos:

#### 1. **Realismo na Integração**
```typescript
// Simula comportamento real de uma API
const leadRepository = new LeadRepository();
const leads = await leadRepository.findAll(filter, sort);
```

#### 2. **Tipagem Robusta**
```typescript
// Schemas Zod garantem type safety completo
export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  status: LeadStatusEnum,
  // ...
});

export type Lead = z.infer<typeof LeadSchema>;
```

#### 3. **Validação de Entrada/Saída**
- **Input**: Valida dados antes de enviar para a "API"
- **Output**: Garante que dados recebidos estão no formato correto
- **Type Safety**: TypeScript + Zod eliminam erros de runtime

#### 4. **Preparação para API Real**
```typescript
// Basta trocar a implementação do repository
class ApiLeadRepository implements LeadRepositoryInterface {
  async findAll(filter?: LeadFilter): Promise<Lead[]> {
    // Chamada real para API externa
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(filter)
    });
    return LeadSchema.array().parse(await response.json());
  }
}
```

### Simulação de Cenários Reais

A API fake simula:
- **Latência de rede** (delays)
- **Erros HTTP** (404, 500)
- **Validação de dados**
- **Operações CRUD completas**
- **Filtering e Sorting**

## 🪝 Sistema de Hooks

### React Query + Custom Hooks

Utilizamos **TanStack Query** (React Query) para gerenciamento de estado do servidor:

```typescript
export function useLeads(filter?: LeadFilter, sort?: LeadSort) {
  return useQuery({
    queryKey: LEAD_QUERY_KEYS.list(filter, sort),
    queryFn: () => leadRepository.findAll(filter, sort),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}
```

### Vantagens do Approach com Hooks

#### 1. **Cache Inteligente**
```typescript
// Cache automático baseado nos parâmetros
const { data: leads } = useLeads({ status: 'qualified' }, { field: 'score', direction: 'desc' });

// Mesmo dados, mesmo cache
const { data: sameLeads } = useLeads({ status: 'qualified' }, { field: 'score', direction: 'desc' });
```

#### 2. **Background Updates**
- Dados atualizados automaticamente em background
- Re-fetch inteligente quando dados ficam "stale"
- Sincronização entre múltiplos componentes

#### 3. **Optimistic Updates**
```typescript
export function useUpdateLead() {
  return useMutation({
    mutationFn: (data: UpdateLead) => leadRepository.update(data),
    onMutate: async (updatedLead) => {
      // Atualiza UI imediatamente
      queryClient.setQueryData(LEAD_QUERY_KEYS.detail(updatedLead.id), {
        ...previousLead,
        ...updatedLead,
      });
    },
    onError: (error, updatedLead, context) => {
      // Rollback em caso de erro
      if (context?.previousLead) {
        queryClient.setQueryData(LEAD_QUERY_KEYS.detail(updatedLead.id), context.previousLead);
      }
    },
  });
}
```

#### 4. **Estados Automáticos**
```typescript
const { data, isLoading, error, refetch } = useLeads();

// UI reativa automaticamente
if (isLoading) return <LoadingState />;
if (error) return <ErrorState onRetry={refetch} />;
return <LeadsList leads={data} />;
```

## 📄 Páginas e Cache

### Como Funciona o Cache entre Páginas

#### 1. **Query Keys Inteligentes**
```typescript
export const LEAD_QUERY_KEYS = {
  all: ['leads'] as const,
  lists: () => [...LEAD_QUERY_KEYS.all, 'list'] as const,
  list: (filter?: LeadFilter, sort?: LeadSort) =>
    [...LEAD_QUERY_KEYS.lists(), { filter, sort }] as const,
  detail: (id: string) => [...LEAD_QUERY_KEYS.details(), id] as const,
};
```

#### 2. **Cache Compartilhado**
- **HomePage**: Usa `useLeads()` para estatísticas gerais
- **LeadsPage**: Usa `useLeads()` para listagem completa
- **LeadDetails**: Usa `useLead(id)` para dados específicos

Todos compartilham o mesmo cache quando os parâmetros são iguais!

#### 3. **Invalidação Inteligente**
```typescript
// Quando um lead é atualizado
onSuccess: (updatedLead) => {
  // Invalida todas as listas
  queryClient.invalidateQueries({ queryKey: LEAD_QUERY_KEYS.lists() });
  // Atualiza cache específico
  queryClient.setQueryData(LEAD_QUERY_KEYS.detail(updatedLead.id), updatedLead);
}
```

#### 4. **Performance Otimizada**
- **Prefetch**: Dados podem ser carregados antes da navegação
- **Background Sync**: Atualizações automáticas em background
- **Stale While Revalidate**: Mostra dados cached enquanto busca atualizações

## 🎨 Design System

### Componentes UI Reutilizáveis

- **Button**: Múltiplas variantes (primary, secondary, ghost)
- **Input**: Validação e estados de erro
- **Select**: Dropdown customizado
- **Badge**: Status indicators
- **LoadingState**: Skeleton loading
- **ErrorState**: Error boundaries
- **EmptyState**: Estados vazios

### Tailwind CSS v4

Utilizamos a versão mais recente do Tailwind CSS com:
- **Configuração moderna**: `@import "tailwindcss"`
- **Glassmorphism**: Efeitos de vidro e backdrop-blur
- **Gradientes**: Design moderno com múltiplas cores
- **Responsividade**: Mobile-first approach

## 🚀 Tecnologias

- **React 18**: Framework frontend
- **TypeScript**: Type safety
- **Vite**: Build tool moderna
- **TanStack Query**: State management
- **Zod**: Schema validation
- **Tailwind CSS v4**: Styling
- **React Router**: Navegação
- **Lucide React**: Ícones

## 📊 Estrutura de Dados

### Entidades Principais

#### Lead
```typescript
{
  id: string;
  name: string;
  company: string;
  email: string;
  source: 'website' | 'email' | 'phone' | 'referral' | 'social' | 'other';
  score: number; // 0-100
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  phone?: string;
  convertedToOpportunityId?: string;
}
```

#### Opportunity
```typescript
{
  id: string;
  name: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  amount?: number;
  probability: number; // 0-100
  accountName: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
```

## 🔄 Fluxo de Conversão

1. **Lead Criado** → Status: 'new'
2. **Lead Qualificado** → Status: 'qualified'
3. **Conversão** → Cria Opportunity + Status: 'converted'
4. **Pipeline** → Opportunity progride pelos estágios
5. **Fechamento** → 'closed_won' ou 'closed_lost'

## ✨ Funcionalidades

### Dashboard (HomePage)
- Métricas gerais de leads e opportunities
- Links rápidos para navegação
- Status do sistema

### Gerenciamento de Leads (LeadsPage)
- Listagem com search e filtros
- Ordenação por colunas
- Modal de detalhes com edição inline
- Conversão para opportunities

### Pipeline de Vendas (OpportunitiesPage)
- Visão geral da receita
- Estatísticas do pipeline
- Listagem de opportunities por estágio

### Detalhes do Lead (LeadDetails)
- Edição de informações
- Conversão para opportunity
- Histórico e notas

## 🎯 Benefícios da Arquitetura Escolhida

1. **Manutenibilidade**: Código organizado e fácil de navegar
2. **Testabilidade**: Cada camada pode ser testada isoladamente
3. **Escalabilidade**: Estrutura suporta crescimento da aplicação
4. **Type Safety**: Zero erros de runtime relacionados a tipos
5. **Performance**: Cache inteligente reduz chamadas desnecessárias
6. **Developer Experience**: Hot reload, TypeScript, validação automática
7. **Preparação para Produção**: Fácil migração para APIs reais

---

> **Nota**: Esta aplicação demonstra como construir um sistema moderno de CRM utilizando as melhores práticas de desenvolvimento React, com foco em arquitetura limpa, type safety e performance.
