<?php

namespace Modules\RentalManagement\Exceptions;

use Exception as BaseException;

class RentalNotFoundException extends BaseException
{
    /**
     * Create a new exception instance.
     *
     * @param string $message
     * @param int $code
     * @param \Throwable|null $previous
     */
    public function __construct(string $message = 'Rental not found.', int $code = 404, \Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
