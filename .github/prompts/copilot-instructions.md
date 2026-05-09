# Copilot Instructions for uchinagastore E-commerce

## Project Overview
Building a modern e-commerce platform to replace Shopee (15% commission) with custom solution (~1-2% commission via Midtrans).

**Tech Stack:**
- Frontend: Next.js 16+ (React, TypeScript, Tailwind CSS)
- Backend: Next.js API Routes
- Database: MongoDB
- Payment: Midtrans
- Hosting: Vercel

## Active Skills

### 1. UI UX Pro Max
- **Auto-activates for**: UI/UX requests, design system generation, component creation
- **Features**: 67 UI styles, 161 color palettes, 57 font pairings, 161 reasoning rules
- **Usage**: "Build a landing page", "Create dashboard", "Design checkout flow"

### 2. Superpowers Development Methodology
- **Auto-activates for**: Feature planning, implementation tasks, debugging
- **Workflow**: Brainstorming → Planning → TDD → Review → Merge
- **Key principle**: Write tests before code, systematic process, clear verification steps

## Instructions for All Tasks

### Design & UI Tasks
1. Automatically generate complete design system using UI UX Pro Max
2. Show design in clear sections with:
   - Color palette (primary, secondary, CTA, background, text)
   - Typography (fonts, sizes, weights)
   - Component patterns
   - Layout guidelines
   - Accessibility checklist
3. Get user approval before implementation

### Development Tasks
1. Use Superpowers brainstorming for requirements clarification
2. Create detailed implementation plan with exact file paths
3. Write test first (TDD approach)
4. Implement minimal code to pass test
5. Review code quality and spec compliance
6. Submit for review before merging

### E-commerce Specific Rules

#### Product Model
```typescript
{
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  rating: number
  reviews: Review[]
  createdAt: Date
}
```

#### Order Model
```typescript
{
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  paymentGateway: 'midtrans'
  paymentId: string
  createdAt: Date
}
```

#### Commission Tracking
- Keep track of platform fees (target: 1-2% vs Shopee's 15%)
- Log all transactions for analytics

## File Structure Convention
```
src/
├── app/              # Next.js pages & routes
│   ├── (auth)/      # Authentication pages
│   ├── (shop)/      # Customer pages
│   ├── admin/       # Admin dashboard
│   └── api/         # API routes
├── components/      # Reusable React components
├── lib/             # Utilities, helpers, DB
├── styles/          # Global styles
└── types/           # TypeScript interfaces
```

## Before Asking for Code

1. **Clarify Requirements**: Ask questions about scope, design preferences, edge cases
2. **Show Design First**: Present design system before implementation
3. **Plan Tasks**: Break into 2-5 minute tasks with clear deliverables
4. **Verify Tests**: Always write tests before code

## Quick Commands

When you say:
- **"Build [feature]"** → Auto-triggers full workflow (design + planning + development)
- **"Design [page]"** → UI UX Pro Max generates design system
- **"Implement [task]"** → TDD-based implementation with testing
- **"Review [code]"** → Code quality & spec compliance check
- **"Debug [issue]"** → Systematic 4-phase debugging process

## Success Criteria

- ✅ All features have passing tests
- ✅ Code follows design system
- ✅ Accessibility WCAG AA compliant
- ✅ Mobile responsive (375px, 768px, 1024px, 1440px)
- ✅ No console errors or warnings
- ✅ Pre-deployment checklist passed
