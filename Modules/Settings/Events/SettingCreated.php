<?php

namespace Modules\Settings\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\Settings\Domain\Models\Setting;

class SettingCreated
{
    use Dispatchable;
    use SerializesModels;

    /**
     * The setting instance.
     *
     * @var \Modules\Settings\Domain\Models\Setting
     */
    public $setting;

    /**
     * Create a new event instance.
     *
     * @param  \Modules\Settings\Domain\Models\Setting  $setting
     * @return void
     */
    public function __construct(Setting $setting)
    {
        $this->setting = $setting;
    }
}


