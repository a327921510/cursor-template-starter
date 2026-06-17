# TDD Workflow Skill

Test-Driven Development methodology with advanced patterns for real-world applications.

## When to Use

Activate this skill when:
- Implementing new features or fixing bugs
- Writing or reviewing tests
- Discussing testing strategy
- Setting up test infrastructure

---

## 1. The TDD Cycle

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   1. RED    — Write a test that FAILS                   │
│   2. GREEN  — Write MINIMAL code to PASS                │
│   3. REFACTOR — Improve code, keep tests GREEN          │
│   4. REPEAT — Next requirement                          │
│                                                         │
│   Key insight: Tests drive DESIGN, not just correctness │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 0: Define the Interface FIRST

```typescript
// Before writing any test, define WHAT you're building
// This is your contract — tests verify the contract

interface OrderService {
  createOrder(input: CreateOrderInput): Promise<Result<Order>>
  getOrder(id: string): Promise<Result<Order>>
  cancelOrder(id: string, reason: string): Promise<Result<void>>
}

interface CreateOrderInput {
  userId: string
  items: Array<{ productId: string; quantity: number }>
  shippingAddress: Address
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: Date
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
```

### Step 1: RED — Write a Failing Test

```typescript
describe('OrderService', () => {
  let service: OrderService
  let mockProductRepo: MockProductRepository
  let mockOrderRepo: MockOrderRepository

  beforeEach(() => {
    mockProductRepo = createMockProductRepo()
    mockOrderRepo = createMockOrderRepo()
    service = new OrderServiceImpl(mockOrderRepo, mockProductRepo)
  })

  describe('createOrder', () => {
    it('creates order with valid items and calculates total', async () => {
      // Arrange
      mockProductRepo.findById.mockResolvedValueOnce({ id: 'p1', price: 29.99, stock: 10 })
      mockProductRepo.findById.mockResolvedValueOnce({ id: 'p2', price: 49.99, stock: 5 })

      const input: CreateOrderInput = {
        userId: 'user-1',
        items: [
          { productId: 'p1', quantity: 2 },
          { productId: 'p2', quantity: 1 },
        ],
        shippingAddress: { street: '123 Main St', city: 'NYC', zip: '10001' },
      }

      // Act
      const result = await service.createOrder(input)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.total).toBe(109.97)  // 29.99*2 + 49.99*1
        expect(result.data.status).toBe('pending')
        expect(result.data.items).toHaveLength(2)
      }
    })

    it('rejects order when product is out of stock', async () => {
      mockProductRepo.findById.mockResolvedValue({ id: 'p1', price: 10, stock: 0 })

      const result = await service.createOrder({
        userId: 'user-1',
        items: [{ productId: 'p1', quantity: 1 }],
        shippingAddress: validAddress,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('out of stock')
      }
    })

    it('rejects order with empty items', async () => {
      const result = await service.createOrder({
        userId: 'user-1',
        items: [],
        shippingAddress: validAddress,
      })

      expect(result.success).toBe(false)
    })
  })
})
```

### Step 2: GREEN — Minimal Implementation

```typescript
// Write JUST ENOUGH code to make tests pass — no more
class OrderServiceImpl implements OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Result<Order>> {
    if (input.items.length === 0) {
      return { success: false, error: 'Order must have at least one item' }
    }

    let total = 0
    const orderItems: OrderItem[] = []

    for (const item of input.items) {
      const product = await this.productRepo.findById(item.productId)
      if (!product) return { success: false, error: `Product ${item.productId} not found` }
      if (product.stock < item.quantity) {
        return { success: false, error: `${product.id} is out of stock` }
      }
      total += product.price * item.quantity
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price })
    }

    const order = await this.orderRepo.create({
      userId: input.userId,
      items: orderItems,
      status: 'pending',
      total: Math.round(total * 100) / 100,
    })

    return { success: true, data: order }
  }
}
```

### Step 3: REFACTOR — Improve While Green

```typescript
// Extract helpers, improve naming, reduce duplication
// Run tests after EVERY change to ensure still green

class OrderServiceImpl implements OrderService {
  async createOrder(input: CreateOrderInput): Promise<Result<Order>> {
    if (input.items.length === 0) {
      return { success: false, error: 'Order must have at least one item' }
    }

    const resolvedItems = await this.resolveAndValidateItems(input.items)
    if (!resolvedItems.success) return resolvedItems

    const total = this.calculateTotal(resolvedItems.data)

    const order = await this.orderRepo.create({
      userId: input.userId,
      items: resolvedItems.data,
      status: 'pending',
      total,
    })

    return { success: true, data: order }
  }

  private async resolveAndValidateItems(items: CreateOrderInput['items']): Promise<Result<OrderItem[]>> {
    // Extracted logic — independently testable
  }

  private calculateTotal(items: OrderItem[]): number {
    return Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100
  }
}
```

---

## 2. Testing Pyramid Strategy

```
        /  E2E  \          Few (5-10): Critical user journeys
       /----------\        Slow, brittle, expensive
      / Integration \      Some (20-50): API endpoints, DB operations
     /----------------\    Medium speed, real dependencies
    /    Unit Tests     \  Many (100+): Pure logic, utilities, services
   /---------------------\ Fast, isolated, cheap

INVESTMENT RATIO:
  70% Unit  |  20% Integration  |  10% E2E
```

### What to Test at Each Level

```typescript
// UNIT: Pure logic, no I/O
// ✅ calculateTotal([{price: 10, qty: 2}]) → 20
// ✅ validateEmail('bad') → false
// ✅ formatCurrency(1234.5, 'USD') → '$1,234.50'

// INTEGRATION: Real I/O, mocked externals
// ✅ POST /api/users → creates user in test DB
// ✅ UserService.createUser → calls real repo, mocked email service
// ✅ Auth flow → real JWT generation and validation

// E2E: Real browser, full stack
// ✅ User registers → verifies email → logs in → sees dashboard
// ✅ User adds item to cart → checks out → sees confirmation
```

---

## 3. Mocking Patterns

### When to Mock vs When to Use Real

```
MOCK when:
  ✅ External APIs (payment, email, SMS)
  ✅ Time-dependent logic (Date.now, setTimeout)
  ✅ Random values (Math.random, crypto.randomUUID)
  ✅ File system / network in unit tests

USE REAL when:
  ✅ Database in integration tests (use test DB)
  ✅ Your own service classes in integration tests
  ✅ Validation logic (test actual behavior)
```

### Mock Factory Pattern

```typescript
// Create reusable mock factories for consistent test data

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-' + crypto.randomUUID().slice(0, 8),
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-' + crypto.randomUUID().slice(0, 8),
    userId: 'user-1',
    items: [{ productId: 'p1', quantity: 1, price: 29.99 }],
    status: 'pending',
    total: 29.99,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }
}

// Usage in tests
it('sends confirmation for confirmed orders', async () => {
  const order = createMockOrder({ status: 'confirmed' })
  // ...
})
```

---

## 4. Testing Anti-Patterns to Avoid

```typescript
// ❌ Testing implementation details
it('calls setState with correct value', () => {
  // Breaks when refactoring, doesn't test behavior
})
// ✅ Test behavior
it('displays updated name after editing', () => {})

// ❌ Test dependencies (tests must be independent)
it('test A creates data', () => { /* creates user */ })
it('test B reads data from test A', () => { /* depends on test A */ })
// ✅ Each test sets up its own data
it('reads user data', () => { /* creates AND reads user */ })

// ❌ Snapshot abuse (brittle, noisy diffs)
it('renders correctly', () => {
  expect(render(<ComplexPage />)).toMatchSnapshot()  // 500-line snapshot
})
// ✅ Assert specific behavior
it('shows user name and email', () => {
  render(<UserProfile user={mockUser} />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('john@example.com')).toBeInTheDocument()
})

// ❌ Testing third-party code
it('zod validates email correctly', () => {
  // Don't test Zod — trust the library, test YOUR usage
})
// ✅ Test your validation logic
it('rejects registration with company email domains', () => {
  const result = validateRegistration({ email: 'user@competitor.com' })
  expect(result.success).toBe(false)
})
```

---

## 5. Coverage Strategy

```
Coverage targets:
  Overall:            ≥ 80%
  Business logic:     100% (services, domain rules)
  Utilities:          ≥ 90%
  API handlers:       ≥ 80% (via integration tests)
  UI components:      ≥ 70% (focus on interactions, not rendering)

What 100% coverage does NOT mean:
  ❌ All bugs are found
  ❌ All edge cases are covered
  ❌ Code is well-tested

Focus on meaningful tests:
  - Does this test catch a bug if the code changes?
  - Does this test document expected behavior?
  - Would I be confident deploying with only this test?
```

### Bug Fix TDD Protocol

```
When fixing a bug, ALWAYS:
1. Write a test that REPRODUCES the bug (must fail)
2. Verify the test fails for the right reason
3. Implement the fix
4. Verify the test passes
5. Add edge case tests around the fix
6. Commit test + fix together (proves the fix works)

This ensures:
- The bug is actually fixed (not just seemingly)
- The bug can never regress silently
- Future developers understand what was wrong
```
