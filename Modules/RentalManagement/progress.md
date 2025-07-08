# RentalManagement Module Progress Log

## Recent Issues & Fixes

### 2024-07-07

1. **Rental Edit Form Issues**
   - Fixed: `customer_id`, `start_date`, and `expected_end_date` fields now always set as strings and properly initialized in the edit form.
   - Backend updated to always return dates as `'YYYY-MM-DD'` strings.

2. **Quotation Generation**
   - Fixed: Quotation generation now always deletes any existing quotation and creates a new one, ensuring workflow status is updated.
   - Added: Migration to add `rental_id` column to `quotations` table.
   - Fixed: `created_by` is now always set; status value changed from `'pending'` to `'draft'` to match enum.
   - Fixed: `name` field in `quotation_items` is always set; added to `$fillable` in model.
   - Fixed: Status fields now handled as strings or enums as appropriate; helper methods added.
   - Fixed: All `User` model imports use correct namespace (`Modules\Core\Domain\Models\User`).

3. **Frontend SPA Behavior**
   - Fixed: "Generate Quotation" button now uses `Inertia.post` for SPA behavior.
   - Added: "View Quotation" button appears if a quotation exists.
   - Fixed: Customer name and total amount in pending actions card always correct, with fallbacks and float parsing.

4. **Quotation PDF Download**
   - Added: Route and controller method for downloading quotation as PDF.
   - Installed: `barryvdh/laravel-dompdf` for PDF generation.
   - Added: Blade view for PDF output.
   - Confirmed: User can generate and download real quotation PDFs for rentals.

---

## Previous Issues & Fixes

(See prior entries for earlier progress.) 
