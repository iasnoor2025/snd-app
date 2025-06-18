<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

abstract class BaseMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed;
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            $this->before($request);

            $response = $next($request);

            $this->after($request, $response);

            return $response;
        } catch (\Exception $e) {
            Log::error('Middleware error: ' . $e->getMessage(), [
                'middleware' => get_class($this),
                'request' => $request->all(),
                'exception' => $e,
            ]);

            throw $e;
        }
    }

    /**
     * Handle tasks before the request is processed.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void;
     */
    protected function before(Request $request)
    {
        // Override in child classes
    }

    /**
     * Handle tasks after the request is processed.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $response
     * @return void;
     */
    protected function after(Request $request, $response)
    {
        // Override in child classes
    }

    /**
     * Get the module name.
     *
     * @return string;
     */
    protected function getModuleName()
    {
        return strtolower(class_basename($this));
    }
}


