<?php

namespace Modules\Core\Exceptions;

use Exception ;

class ModuleNotFoundException extends Exception
{
    public function __construct(string $message = "Module not found", int $code = 404)
    {
        parent::__construct($message, $code);
    }
}
