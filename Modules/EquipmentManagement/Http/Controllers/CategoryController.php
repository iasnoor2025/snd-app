<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\EquipmentManagement\Services\CategoryService;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Display a listing of the categories.
     */
    public function index(Request $request): Response
    {
        $categories = $this->categoryService->getCategories($request->all());

        return Inertia::render('EquipmentManagement::Categories/Index', [
            'categories' => $categories,
            'filters' => $request->all()
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('EquipmentManagement::Categories/Create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:equipment_categories,id',
            'is_active' => 'boolean'
        ]);

        $category = $this->categoryService->createCategory($validated);

        return redirect()->route('equipment-management.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified category.
     */
    public function show(string $id): Response
    {
        $category = $this->categoryService->getCategory($id);

        if (!$category) {
            abort(404, 'Category not found');
        }

        return Inertia::render('EquipmentManagement::Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(string $id): Response
    {
        $category = $this->categoryService->getCategory($id);

        if (!$category) {
            abort(404, 'Category not found');
        }

        return Inertia::render('EquipmentManagement::Categories/Edit', [
            'category' => $category
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:equipment_categories,id',
            'is_active' => 'boolean'
        ]);

        $category = $this->categoryService->updateCategory($id, $validated);

        if (!$category) {
            return redirect()->back()->with('error', 'Category not found.');
        }

        return redirect()->route('equipment-management.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(string $id)
    {
        $deleted = $this->categoryService->deleteCategory($id);

        if (!$deleted) {
            return redirect()->back()->with('error', 'Category not found or cannot be deleted.');
        }

        return redirect()->route('equipment-management.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Get category tree structure.
     */
    public function tree(Request $request)
    {
        $tree = $this->categoryService->getCategoryTree($request->all());

        return response()->json([
            'success' => true,
            'data' => $tree,
            'message' => 'Category tree retrieved successfully'
        ]);
    }

    /**
     * Get categories for dropdown/select.
     */
    public function options(Request $request)
    {
        $options = $this->categoryService->getCategoryOptions($request->all());

        return response()->json([
            'success' => true,
            'data' => $options,
            'message' => 'Category options retrieved successfully'
        ]);
    }
}
