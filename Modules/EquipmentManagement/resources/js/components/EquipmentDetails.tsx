  <div><b>Purchase Cost:</b> {equipment.purchase_cost ? `$${equipment.purchase_cost.toFixed(2)}` : '-'}</div>
  <div><b>Purchase Date:</b> {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : '-'}</div>
  <div><b>Depreciation (years):</b> {equipment.depreciation_years || '-'}</div>
  <div><b>Current Value:</b> {equipment.current_value ? `$${equipment.current_value.toFixed(2)}` : '-'}</div>
