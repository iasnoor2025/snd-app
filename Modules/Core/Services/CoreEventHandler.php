<?php

namespace Modules\Core\Services;

use Illuminate\Events\Dispatcher;

class CoreEventHandler extends BaseEventHandler
{
    /**
     * Create a new event handler instance.
     *
     * @param  \Illuminate\Events\Dispatcher  $dispatcher
     * @return void;
     */
    public function __construct(Dispatcher $dispatcher)
    {
        parent::__construct($dispatcher);
    }

    /**
     * Get the events that the handler subscribes to.
     *
     * @return array;
     */
    public function getSubscribedEvents()
    {
        return [
            'user.created' => 'onUserCreated',
            'user.updated' => 'onUserUpdated',
            'user.deleted' => 'onUserDeleted',
            'role.assigned' => 'onRoleAssigned',
            'role.removed' => 'onRoleRemoved',
        ];
    }

    /**
     * Handle user created event.
     *
     * @param  mixed  $event
     * @return void;
     */
    public function onUserCreated($event)
    {
        $this->logEvent('user.created', ['user' => $event->user]);
    }

    /**
     * Handle user updated event.
     *
     * @param  mixed  $event
     * @return void;
     */
    public function onUserUpdated($event)
    {
        $this->logEvent('user.updated', ['user' => $event->user]);
    }

    /**
     * Handle user deleted event.
     *
     * @param  mixed  $event
     * @return void;
     */
    public function onUserDeleted($event)
    {
        $this->logEvent('user.deleted', ['user' => $event->user]);
    }

    /**
     * Handle role assigned event.
     *
     * @param  mixed  $event
     * @return void;
     */
    public function onRoleAssigned($event)
    {
        $this->logEvent('role.assigned', [
            'user' => $event->user,
            'role' => $event->role,
        ]);
    }

    /**
     * Handle role removed event.
     *
     * @param  mixed  $event
     * @return void;
     */
    public function onRoleRemoved($event)
    {
        $this->logEvent('role.removed', [
            'user' => $event->user,
            'role' => $event->role,
        ]);
    }
}

