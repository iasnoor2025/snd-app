# Safety Management Module Documentation

## Schema Definitions & Migration List
- **Tables:**
  - incidents
  - risks
  - inspections
  - training_records
  - ppe_checks
  - safety_actions
- **Pivot Tables:**
  - (to be defined as needed for templates, users, etc.)

## Model & Relation Overview
- **Incident**: belongsTo User, hasMany SafetyAction
- **Risk**: belongsTo User, hasMany ControlMeasure
- **Inspection**: hasMany InspectionItem, belongsTo Module
- **TrainingRecord**: belongsTo Course, belongsToMany User
- **PpeCheck**: belongsTo Equipment, belongsTo User

## Route Map & Controller Actions
- Resource routes for: incidents, risks, inspections, training-records, ppe-checks, safety-actions
- Custom actions: /incidents/{id}/close, /inspections/{id}/complete, etc.
- All CRUD actions: index, create, store, show, edit, update, destroy

## React Page Structure & Key Components
- `Resources/js/Pages/Safety/Incidents/Index.tsx`, `Create.tsx`, `Show.tsx`, `Edit.tsx`
- Similar for Risks, Inspections, Training, PpeChecks
- `Dashboard.tsx` for KPIs
- Use Shadcn UI, Tailwind, and i18next

## Notification Events & Scheduled Tasks
- Notifications: IncidentReported, ActionOverdue, TrainingExpiryReminder
- Scheduled job: daily scan for overdue/expired/uncleared items, dispatch reminders

## Policies & Seeded Permissions
- Operators: create/view own
- Supervisors: view department
- Safety Managers: full CRUD, approve
- Seeder: SafetyPermissionsSeeder

## Test Suite Summary
- Unit tests: models, factories, relations
- Feature tests: CRUD, custom actions, permissions
- API test: dashboard KPIs 
