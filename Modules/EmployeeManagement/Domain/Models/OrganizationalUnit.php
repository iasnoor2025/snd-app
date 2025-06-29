namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationalUnit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'type',
        'parent_id',
        'manager_id',
        'level',
        'description',
        'metadata',
    ];

    protected $casts = [
        'level' => 'integer',
        'metadata' => 'array',
    ];

    public const TYPES = [
        'DIVISION' => 'division',
        'DEPARTMENT' => 'department',
        'TEAM' => 'team',
        'PROJECT' => 'project',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'unit_id');
    }

    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    public function allParents()
    {
        return $this->parent()->with('allParents');
    }

    public function getHierarchyAttribute(): array
    {
        $hierarchy = [];
        $current = $this;

        while ($current->parent) {
            $hierarchy[] = [
                'id' => $current->parent->id,
                'name' => $current->parent->name,
                'type' => $current->parent->type,
            ];
            $current = $current->parent;
        }

        return array_reverse($hierarchy);
    }

    public function getFullPathAttribute(): string
    {
        return collect($this->hierarchy)
            ->pluck('name')
            ->push($this->name)
            ->implode(' > ');
    }

    public function getTotalEmployeesAttribute(): int
    {
        return $this->employees()->count() + 
               $this->children()->withCount('employees')->get()
                   ->sum(fn($child) => $child->employees_count);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function getOrgChartData(): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'manager' => $this->manager ? [
                'id' => $this->manager->id,
                'name' => $this->manager->name,
                'title' => $this->manager->title,
                'avatar' => $this->manager->avatar_url,
            ] : null,
            'totalEmployees' => $this->total_employees,
            'metadata' => $this->metadata,
        ];

        if ($this->children->isNotEmpty()) {
            $data['children'] = $this->children->map->getOrgChartData()->toArray();
        }

        return $data;
    }
} 