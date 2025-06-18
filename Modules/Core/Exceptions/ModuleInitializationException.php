<?php

namespace Modules\Core\Exceptions;

use Exception;

class ModuleInitializationException extends Exception
{
    public function __construct(string $message = "Failed to initialize module", int $code = 500)
    {
        parent::__construct($message, $code);
    }
}
