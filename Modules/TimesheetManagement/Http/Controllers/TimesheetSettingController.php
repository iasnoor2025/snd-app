<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Http\Request;

class TimesheetSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('TimesheetManagement::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('TimesheetManagement::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return view('TimesheetManagement::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('TimesheetManagement::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        //
    }
}