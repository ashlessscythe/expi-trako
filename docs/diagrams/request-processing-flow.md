# Request Processing Flow Diagram

This diagram illustrates the complete lifecycle of an expedite material request in the system.

```mermaid
graph LR
    subgraph "Request Creation"
        CS[Customer Service] --> NewReq[New Request]
        NewReq --> Cost{Cost Check}
    end

    subgraph "Approval Flow"
        Cost -->|$0-250| PCM[PC Manager]
        Cost -->|$250-500| PC[Plant Controller]
        Cost -->|$500-1000| PM[Plant Manager]
        Cost -->|$1000-2000| RC[Regional Controller]
        Cost -->|$2000-5000| RO[Regional Operations]
        Cost -->|$5000+| OD[Operations Director]
    end

    subgraph "Processing"
        PCM & PC & PM & RC & RO & OD --> Approved
        Approved --> WH[Warehouse Processing]
        WH --> Complete[Completed]
    end

    Complete --> Notify[Email Notifications]
```

## Process Description

### Request Creation
- Customer Service team initiates new expedite requests
- System automatically determines approval route based on cost

### Approval Levels
1. **PC Manager**: $0-250
2. **Plant Controller**: $250-500
3. **Plant Manager**: $500-1,000
4. **Regional Controller**: $1,000-2,000
5. **Regional Operations**: $2,000-5,000
6. **Operations Director**: $5,000+

### Processing Steps
1. Request approved by appropriate authority
2. Warehouse team processes approved request
3. Request marked as complete
4. Automatic notifications sent to stakeholders 