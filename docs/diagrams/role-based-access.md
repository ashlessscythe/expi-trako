# Role-Based Access Control Diagram

This diagram illustrates the role-based access control (RBAC) system in Expi-Trak.

```mermaid
graph TB
    subgraph "Role-Based Access"
        User[User Login]
        Auth[Authentication]
        RBAC[Role Check]
    end

    subgraph "Access Levels"
        Admin[Administrator]
        CS[Customer Service]
        WH[Warehouse]
    end

    User --> Auth
    Auth --> RBAC
    RBAC --> Admin
    RBAC --> CS
    RBAC --> WH

    Admin -->|Full Access| AdminFeatures[System Configuration<br/>User Management<br/>Analytics<br/>Reports]
    CS -->|Limited Access| CSFeatures[Create Requests<br/>Track Status<br/>View History]
    WH -->|Specific Access| WHFeatures[Process Requests<br/>Update Status<br/>Manage Inventory]
```

## Role Descriptions

### Administrator
- Full system configuration access
- User management and role assignment
- Analytics and reporting capabilities
- System-wide settings management

### Customer Service
- Create and submit expedite requests
- Track request status
- View request history
- Basic reporting access

### Warehouse Staff
- Process approved requests
- Update request status
- Manage inventory
- View assigned tasks

## Access Control Implementation
- JWT-based authentication
- Role-based middleware checks
- Granular permission system
- Secure API endpoints 