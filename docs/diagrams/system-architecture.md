# System Architecture Diagram

This diagram illustrates the three-tier architecture of the Expi-Trak system, showing how different components interact with each other.

```mermaid
graph TB
    subgraph "Frontend Layer"
        Client[Client Browser]
        NextJS[Next.js 14 App]
        UI[ShadCN UI + Tailwind]
    end

    subgraph "API Layer"
        API[Next.js API Routes]
        Auth[NextAuth.js]
        Email[Resend Email Service]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL Database)]
    end

    Client --> NextJS
    NextJS --> UI
    NextJS --> API
    API --> Auth
    API --> Email
    API --> Prisma
    Prisma --> DB
```

## Component Description

### Frontend Layer
- **Client Browser**: End-user access point
- **Next.js 14 App**: Main application framework
- **ShadCN UI + Tailwind**: UI component library and styling

### API Layer
- **Next.js API Routes**: Backend API endpoints
- **NextAuth.js**: Authentication service
- **Resend Email Service**: Email notification system

### Data Layer
- **Prisma ORM**: Database object-relational mapping
- **PostgreSQL Database**: Primary data storage 