# Safety Management Module Documentation

## Schema Definitions & Migration List

- **Tables:**
    - incidents
    - risks
    - inspections
    - training_records
    - ppe_checks
    - safety_actions
    - control_measures
    - inspection_items
    - training_record_user (pivot)
    - ppe_check_equipment (pivot)

## Model & Relation Overview

- **Incident**: belongsTo User, hasMany SafetyAction
- **Risk**: belongsTo User, hasMany ControlMeasure
- **Inspection**: hasMany InspectionItem, belongsTo Module
- **TrainingRecord**: belongsTo Course, belongsToMany User
- **PpeCheck**: belongsTo Equipment, belongsTo User, belongsToMany Equipment
- **SafetyAction**: belongsTo Incident, belongsTo User (assigned_to)
- **ControlMeasure**: belongsTo Risk
- **InspectionItem**: belongsTo Inspection
- **TrainingRecordUser**: pivot
- **PpeCheckEquipment**: pivot

## Route Map & Controller Actions

- Resource routes for: incidents, risks, inspections, training-records, ppe-checks, safety-actions
- Custom actions: /incidents/{id}/close, /inspections/{id}/complete
- API: /api/safety/kpis
- All CRUD actions: index, create, store, show, edit, update, destroy

## React Page Structure & Key Components

- `Resources/js/Pages/Safety/Incidents/Index.tsx`, `Create.tsx`, `Show.tsx`, `Edit.tsx`
- Similar for Risks, Inspections, Training, PpeChecks, SafetyActions
- `Dashboard/Index.tsx` for KPIs
- Shadcn UI, Tailwind, i18next, recharts

## Notification Events & Scheduled Tasks

- Notifications: IncidentReported, ActionOverdue, TrainingExpiryReminder
- Scheduled job: daily scan for overdue/expired/uncleared items, dispatch reminders via SafetyReminderService

## Policies & Seeded Permissions

- Policies: IncidentPolicy, InspectionPolicy (role-based: operator, supervisor, safety_manager)
- Seeder: SafetyPermissionsSeeder (all permissions for module entities)

## Test Suite Summary

- Unit tests: models, factories, relations (Pest)
- Feature tests: CRUD, custom actions, permissions (Pest)
- API test: dashboard KPIs (Pest)
