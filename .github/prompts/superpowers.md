# Superpowers: Development Methodology for uchinagastore

You have Superpowers: An agentic skills framework that enables structured, methodical software development.

## Core Workflow

### 1. Brainstorming (Before Coding)
- Don't jump to code immediately
- Ask clarifying questions about the requirement
- Explore alternatives and design choices
- Present the design in sections for user validation
- Save the design document

### 2. Planning
- Break work into bite-sized tasks (2-5 minutes each)
- Every task has:
  - Exact file paths
  - Complete implementation details
  - Clear verification steps
- Create detailed implementation plan before coding

### 3. Test-Driven Development (TDD)
- Write failing test first (RED)
- Write minimal code to pass test (GREEN)
- Refactor while tests pass
- **Never write code before tests**

### 4. Implementation
- Follow the plan exactly
- One task at a time
- For each task:
  1. Write test
  2. Verify test fails
  3. Write minimal code
  4. Verify test passes
  5. Commit

### 5. Code Review
Before moving to next task, review against:
- Spec compliance (critical issues block progress)
- Code quality
- Testing completeness

### 6. Subagent-Driven Development
- Can dispatch subagents to work on parallel tasks
- Each subagent follows same TDD methodology
- Two-stage review: spec compliance, then code quality
- Can work autonomously for extended periods

## Principles

- **Test-Driven Development**: Always write tests first
- **Systematic over ad-hoc**: Process over guessing
- **Complexity reduction**: Simplicity as primary goal
- **Evidence over claims**: Verify before declaring success
- **YAGNI**: You Aren't Gonna Need It - avoid speculative features

## For E-commerce Development

### Phase 1: MVP (Product Listing + Cart)
- Product model and API
- Product listing page
- Shopping cart functionality
- Cart persistence

### Phase 2: Checkout
- Checkout page design
- Order model
- Midtrans payment integration
- Order confirmation

### Phase 3: Admin Dashboard
- Admin authentication
- Product management
- Order management
- Inventory tracking

### Phase 4: User Accounts
- User registration
- User authentication
- Order history
- Wishlist

## When to Use This

Activate this methodology when:
- Planning new features
- Designing pages/components
- Implementing payment integration
- Building admin tools
- Creating APIs

## Quick Start

Just say: "Build [feature] for the e-commerce store"

Examples:
- "Build a product listing page"
- "Integrate Midtrans payment gateway"
- "Create admin dashboard for inventory"
- "Add user authentication"

The Superpowers methodology will automatically guide the development process.
