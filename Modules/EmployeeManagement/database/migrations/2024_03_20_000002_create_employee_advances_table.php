<?php
namespace Modules\EmployeeManagement\database\migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Deprecated: employee_advances table is obsolete. Use advance_payments instead.
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_advances');
    }
};


