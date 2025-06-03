# Authentication Flow Diagram

This diagram shows the authentication process in Expi-Trak, including login and registration flows.

```mermaid
sequenceDiagram
    participant User
    participant Auth as NextAuth.js
    participant API as API Routes
    participant DB as PostgreSQL
    participant Email as Resend API

    User->>Auth: Login Request
    Auth->>DB: Validate Credentials
    DB-->>Auth: User Data + Roles
    Auth-->>User: JWT Token
    
    alt New Registration
        User->>API: Register Request
        API->>DB: Create User
        API->>Email: Send Welcome Email
        API->>Email: Notify Admin
        Email-->>User: Welcome Email
        Email-->>Admin: New User Notification
    end
```

## Process Description

### Login Flow
1. User submits login credentials
2. NextAuth.js validates credentials against database
3. Database returns user data and roles
4. JWT token issued to user

### Registration Flow
1. User submits registration request
2. API creates new user in database
3. Welcome email sent to user
4. Admin notification sent for new registration
5. User awaits admin approval 