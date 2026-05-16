# HR Leaves Management Module

A production-grade, full-stack HR Leave Management System.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 (Code First) |
| Database | SQL Server / LocalDB |
| Validation | FluentValidation |
| Mapping | AutoMapper |
| CSV Export | CsvHelper |
| API Docs | Swagger / Swashbuckle |
| Frontend | Angular 19+ (Standalone Components) |
| UI Library | Angular Material v19 |
| State/Async | RxJS operators |
| Forms | Reactive Forms |

---

## Project Structure

```
e:\HR module\
├── Backend\
│   └── HRLeaves.API\
│       ├── Controllers\          # API endpoints (thin controllers)
│       ├── Services\             # Business logic layer
│       │   └── Interfaces\
│       ├── Repositories\         # Data access layer
│       │   └── Interfaces\
│       ├── Models\               # EF Core entities
│       ├── DTOs\                 # Data Transfer Objects
│       │   ├── Common\
│       │   ├── Employee\
│       │   ├── LeaveType\
│       │   ├── LeaveRequest\
│       │   ├── LeaveBalance\
│       │   └── LeaveSettlement\
│       ├── Data\                 # DbContext + Seeder
│       ├── Middleware\           # Global exception handling
│       ├── Validators\           # FluentValidation rules
│       ├── Helpers\              # LeaveCalculator, CsvExporter
│       ├── Mappings\             # AutoMapper profile
│       ├── Extensions\           # DI extensions
│       ├── Program.cs
│       └── appsettings.json
│
└── Frontend\
    └── hr-leaves-frontend\
        └── src\
            └── app\
                ├── core\
                │   ├── interceptors\   # HTTP error interceptor
                │   └── services\       # Notification, Loading services
                ├── shared\
                │   ├── components\     # Reusable components
                │   └── models\         # TypeScript interfaces
                ├── services\           # API service classes
                ├── features\
                │   ├── dashboard\      # Main dashboard with filters + table
                │   ├── apply-leave\    # Leave request form
                │   ├── leave-approval\ # Approve/Reject workflow
                │   ├── leave-types\    # CRUD leave types
                │   └── leave-balance\  # Balance viewer
                ├── app.component.ts    # Root with sidenav
                ├── app.config.ts       # App providers
                └── app.routes.ts       # Lazy-loaded routes
```

---

## Setup Instructions

### Prerequisites

- .NET 8 SDK
- SQL Server or LocalDB
- Node.js 18+ and npm
- Angular CLI (`npm install -g @angular/cli`)

---

### Backend Setup

```bash
cd "e:\HR module\Backend\HRLeaves.API"

# Restore packages
dotnet restore

# Install EF Core tools (if not installed)
dotnet tool install --global dotnet-ef

# Apply migrations and create database
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API (starts on http://localhost:5000)
dotnet run
```

**Swagger UI**: http://localhost:5000/swagger

#### SQL Server Connection String

Edit `appsettings.json` to match your SQL Server instance:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HRLeavesDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

For a named SQL Server instance:
```
"Server=YOUR_SERVER\\INSTANCE;Database=HRLeavesDb;User Id=sa;Password=yourpass;TrustServerCertificate=True"
```

---

### Frontend Setup

```bash
cd "e:\HR module\Frontend\hr-leaves-frontend"

# Install dependencies
npm install

# Start development server (http://localhost:4200)
npm start
```

---

## API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees?pageNumber=1&pageSize=10&searchTerm=` | Paginated list |
| GET | `/api/employees/list` | All employees (for dropdowns) |
| GET | `/api/employees/{id}` | Get by ID |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Leave Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leavetypes` | All leave types |
| GET | `/api/leavetypes/{id}` | Get by ID |
| POST | `/api/leavetypes` | Create leave type |
| PUT | `/api/leavetypes/{id}` | Update leave type |
| DELETE | `/api/leavetypes/{id}` | Delete leave type |

### Leave Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaverequests` | Paginated + filtered list |
| GET | `/api/leaverequests/{id}` | Get by ID |
| POST | `/api/leaverequests` | Submit request |
| PATCH | `/api/leaverequests/{id}/approve` | Approve |
| PATCH | `/api/leaverequests/{id}/reject` | Reject with comment |
| PATCH | `/api/leaverequests/{id}/cancel` | Cancel |
| POST | `/api/leaverequests/bulk-approve` | Bulk approve |
| POST | `/api/leaverequests/bulk-reject` | Bulk reject |
| GET | `/api/leaverequests/export/csv` | Export to CSV |

### Leave Balances

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leavebalances` | All balances |
| GET | `/api/leavebalances/employee/{id}` | Employee balances |
| POST | `/api/leavebalances/recalculate/{id}` | Recalculate one employee |
| POST | `/api/leavebalances/recalculate-all` | Recalculate all |

### Leave Settlements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leavesettlements` | Paginated settlements |
| GET | `/api/leavesettlements/employee/{id}` | Employee settlements |
| GET | `/api/leavesettlements/{id}` | Get by ID |
| POST | `/api/leavesettlements` | Create adjustment |
| DELETE | `/api/leavesettlements/{id}` | Delete settlement |

---

## Sample API Requests

### Create Employee
```http
POST /api/employees
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john.doe@company.com",
  "hireDate": "2023-01-15",
  "department": "Engineering"
}
```

### Submit Leave Request
```http
POST /api/leaverequests
Content-Type: application/json

{
  "employeeId": 1,
  "leaveTypeId": 1,
  "startDate": "2026-06-02",
  "endDate": "2026-06-06",
  "reason": "Family vacation"
}
```

### Approve Leave Request
```http
PATCH /api/leaverequests/1/approve
```

### Reject with Comment
```http
PATCH /api/leaverequests/1/reject
Content-Type: application/json

{
  "rejectionComment": "Insufficient staffing during this period."
}
```

### Bulk Approve
```http
POST /api/leaverequests/bulk-approve
Content-Type: application/json

{
  "leaveRequestIds": [1, 2, 3]
}
```

### Export CSV with Filters
```
GET /api/leaverequests/export/csv?status=Approved&startDateFrom=2026-01-01
```

### Create Leave Settlement (Manual Balance Adjustment)
```http
POST /api/leavesettlements
Content-Type: application/json

{
  "employeeId": 1,
  "leaveTypeId": 1,
  "adjustmentDays": 5,
  "remarks": "Year-end carry-over adjustment"
}
```

---

## Business Rules

| Rule | Implementation |
|------|----------------|
| StartDate ≤ EndDate | Validated in service + FluentValidation |
| No overlapping approved leaves | Checked before creation |
| Business days only | `LeaveCalculator.CalculateBusinessDays()` excludes Sat/Sun |
| Sufficient balance check | On both creation (warning) and approval (hard block) |
| Balance deduction on approval | Immediate deduction when status → Approved |
| Balance rollback on reject/cancel | `UsedDays` restored when Approved → Rejected/Cancelled |
| Accrued leave | Calculated as `months since hire × accrualRate` |
| Draft save | LocalStorage draft auto-saved in Apply Leave form |

---

## Seed Data

The application auto-seeds on startup:

**Leave Types**: Annual Leave (15d), Sick Leave (10d), Vacation (1.25/mo accrued), Unpaid Leave, Maternity (90d), Paternity (5d)

**Employees**: 5 sample employees across Engineering, HR, Finance, Marketing departments

**Leave Balances**: Pre-populated for all employee + leave type combinations

---

## Architecture Notes

- **Repository Pattern**: Generic `IBaseRepository<T>` + specialized interfaces
- **Service Layer**: All business logic isolated in services (not controllers)
- **SOLID**: Single responsibility, dependency inversion via interfaces
- **Global Exception Handling**: `ExceptionHandlingMiddleware` maps exceptions to HTTP status codes
- **AutoMapper**: Clean DTO ↔ Model conversion
- **FluentValidation**: Declarative validation rules
- **Angular Standalone**: No NgModules; uses `importProvidersFrom` and direct imports
- **Lazy Loading**: All routes use `loadComponent` for optimal bundle splitting
- **RxJS**: `debounceTime`, `switchMap`, `catchError`, `finalize` for API calls
- **Signals**: `LoadingService` uses Angular signals for reactive state
