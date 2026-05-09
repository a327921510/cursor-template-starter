# Frontend Patterns Skill

Advanced React and Next.js patterns for production frontend applications.

## When to Use

Activate this skill when:
- Building React components or pages
- Making state management decisions
- Optimizing frontend performance
- Working with Next.js App Router
- Designing component APIs

---

## 1. Component Architecture

### Component Composition Over Props Drilling

```typescript
// ❌ Props drilling — fragile, hard to maintain
function App() {
  const [user, setUser] = useState<User | null>(null)
  return <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} onLogout={() => setUser(null)} />
    </Sidebar>
  </Layout>
}

// ✅ Composition — components receive children, context for shared state
function App() {
  return (
    <AuthProvider>
      <Layout>
        <Sidebar>
          <UserMenu />
        </Sidebar>
      </Layout>
    </AuthProvider>
  )
}

// UserMenu reads from context — no drilling
function UserMenu() {
  const { user, logout } = useAuth()
  if (!user) return null
  return <button onClick={logout}>{user.name}</button>
}
```

### Component Size Guidelines

```
Small (< 50 lines): Buttons, icons, badges, simple inputs
Medium (50-150 lines): Forms, cards, modals, list items
Large (150-300 lines): Pages, complex forms, dashboards
Too Large (> 300 lines): SPLIT into smaller components

Rule: If you need to scroll to understand a component, it's too big.
```

### Container / Presentational Split

```typescript
// Container: data fetching, state, side effects
function UserListContainer() {
  const { data, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })

  if (isLoading) return <UserListSkeleton />
  if (error) return <ErrorDisplay error={error} />
  return <UserList users={data} />
}

// Presentational: pure UI, receives props, no side effects
interface UserListProps {
  users: User[]
}

function UserList({ users }: UserListProps) {
  return (
    <ul role="list">
      {users.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  )
}
```

---

## 2. Next.js App Router Patterns

### Server vs Client Component Decision

```
┌───────────────────────────────────────────────────────────────┐
│ USE SERVER COMPONENT (default) when:                          │
│ ✅ Fetching data                                              │
│ ✅ Accessing backend resources (DB, filesystem)               │
│ ✅ Keeping sensitive data on server (API keys, tokens)        │
│ ✅ Reducing client bundle size                                │
│                                                               │
│ USE CLIENT COMPONENT ('use client') when:                     │
│ ✅ Interactive: onClick, onChange, onSubmit                    │
│ ✅ State: useState, useReducer                                │
│ ✅ Effects: useEffect, useLayoutEffect                        │
│ ✅ Browser APIs: localStorage, navigator, window              │
│ ✅ Custom hooks that use state/effects                        │
└───────────────────────────────────────────────────────────────┘
```

### Data Fetching in Server Components

```typescript
// ✅ Fetch directly in server components — no useEffect, no loading state
async function UserProfilePage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)
  if (!user) notFound()

  return (
    <div>
      <h1>{user.name}</h1>
      {/* This nested server component fetches its own data in parallel */}
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={user.id} />
      </Suspense>
    </div>
  )
}

// ✅ Parallel data fetching with Promise.all
async function DashboardPage() {
  const [stats, recentOrders, notifications] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getNotifications(),
  ])
  return <Dashboard stats={stats} orders={recentOrders} notifications={notifications} />
}
```

### Server Actions

```typescript
// ✅ Server action for form mutations
'use server'

import { revalidatePath } from 'next/cache'

async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Validate on server
  const validated = CreatePostSchema.parse({ title, content })

  await db.post.create({ data: validated })
  revalidatePath('/posts')
}

// Client component using server action
'use client'

function CreatePostForm() {
  const [state, formAction] = useActionState(createPost, null)

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  )
}
```

---

## 3. State Management Decision Tree

```
Is this state used by a single component?
  → YES: useState
  
Is this state shared by parent + children (2-3 levels)?
  → YES: Lift state up to common ancestor

Is this state shared across distant components?
  → YES: Is it server data (from API)?
    → YES: TanStack Query / SWR (cache + sync)
    → NO: Is it complex with many actions?
      → YES: useReducer + Context
      → NO: Zustand (simple global state)

AVOID:
  ❌ Redux for small-medium apps (too much boilerplate)
  ❌ Context for frequently changing data (causes re-renders)
  ❌ Global state for server data (use query cache instead)
```

### TanStack Query Pattern

```typescript
// ✅ Server data belongs in query cache, not useState/Redux
function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,     // fresh for 5 min
    gcTime: 30 * 60 * 1000,       // cache for 30 min
  })
}

// ✅ Mutations with optimistic update
function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user', newData.id] })
      const previous = queryClient.getQueryData(['user', newData.id])
      queryClient.setQueryData(['user', newData.id], newData)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['user', context?.previous?.id], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

---

## 4. Performance Patterns

### Memoization — Use Sparingly, Measure First

```typescript
// ✅ useMemo: expensive computation with stable reference
const sortedItems = useMemo(
  () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// ✅ useCallback: stable function reference for child component props
const handleDelete = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id))
}, [])

// ✅ React.memo: prevent re-renders when props haven't changed
const ExpensiveList = React.memo(function ExpensiveList({ items }: Props) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />)
})

// ❌ Don't memoize everything — adds overhead for trivial components
// Only memoize when:
//   1. Component re-renders often with same props
//   2. Component render is expensive (large lists, complex calculations)
//   3. You've measured and confirmed a performance issue
```

### Virtualization for Large Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div key={row.key} style={{
            position: 'absolute',
            top: row.start,
            height: row.size,
            width: '100%',
          }}>
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. Form Patterns

### Controlled Form with Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const FormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  name: z.string().min(1, 'Required').max(100),
})

type FormValues = z.infer<typeof FormSchema>

function RegistrationForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = async (data: FormValues) => {
    const result = await registerUser(data)
    if (!result.success) {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" {...register('email')} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <input type="password" {...register('password')} />
      </Field>
      <Field label="Name" error={errors.name?.message}>
        <input {...register('name')} />
      </Field>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

---

## 6. Accessibility Checklist

```typescript
// Every interactive element needs:
// ✅ Keyboard accessible (Tab, Enter, Escape)
// ✅ ARIA labels for screen readers
// ✅ Focus management for modals/dialogs
// ✅ Color contrast ratio ≥ 4.5:1

// ❌ div with onClick — not keyboard accessible
<div onClick={handleClick}>Click me</div>

// ✅ button — keyboard accessible by default
<button onClick={handleClick}>Click me</button>

// ✅ Accessible icon button
<button onClick={onClose} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// ✅ Loading states announced to screen readers
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : `${items.length} results found`}
</div>
```
