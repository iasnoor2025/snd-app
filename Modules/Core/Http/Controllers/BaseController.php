<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;
use Modules\Core\Traits\ApiResponse;

abstract class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests, ApiResponse;

    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName;

    /**
     * Create a new controller instance.
     * @return void
     */
    public function __construct()
    {
        $this->moduleName = $this->getModuleName();
    }

    /**
     * Get the module name.
     *
     * @return string
     */
    abstract protected function getModuleName(): string;
}


