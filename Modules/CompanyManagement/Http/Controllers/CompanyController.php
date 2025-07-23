<?php

namespace Modules\CompanyManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Modules\CompanyManagement\Models\Company;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\Controller;

class CompanyController extends Controller
{
    public function index()
    {
        $company = Company::first();
        return Inertia::render('Company/Settings', [
            'company' => $company
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('update', Company::class);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
        ]);
        $company = Company::first();
        if (!$company) {
            $company = Company::create($data);
        } else {
            $company->update($data);
        }
        return redirect()->back()->with('success', 'Company info updated');
    }

    public function uploadLegalDocument(Request $request)
    {
        $this->authorize('update', Company::class);
        $request->validate([
            'legal_document' => 'required|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
        ]);
        $company = Company::first();
        $file = $request->file('legal_document');
        $path = $file->store('Modules/CompanyManagement/legal-documents', 'local');
        $company->legal_document = $path;
        $company->save();
        return redirect()->back()->with('success', 'Legal document uploaded');
    }

    public function downloadLegalDocument()
    {
        $company = Company::first();
        if (!$company || !$company->legal_document || !Storage::disk('local')->exists($company->legal_document)) {
            abort(404);
        }
        return Storage::disk('local')->download($company->legal_document);
    }
}
