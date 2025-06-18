<?php

namespace App\Traits;

use Spatie\MediaLibrary\InteractsWithMedia;

trait HasMediaAttachments
{
    use InteractsWithMedia;

    /**
     * Register media collections for the model
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('private');

        $this->addMediaCollection('photos')
            ->useDisk('public');
    }
}
