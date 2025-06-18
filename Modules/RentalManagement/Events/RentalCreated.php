<?php
namespace Modules\RentalManagement\Events;

use Illuminate\Queue\SerializesModels;
use Illuminate\Database\Eloquent\Model;

class RentalCreated
{
    use SerializesModels;
use /**
     * @var Model
     */
    public Model $rental;

    /**
     * Create a new event instance.
     *
     * @param Model $rental
     */
    public function __construct(Model $rental)
    {
        $this->rental = $rental;
    }
}

