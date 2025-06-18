<?php

namespace App\Traits;

trait AutoLoadsRelations
{
    /**
     * Boot the trait for a model.
     */
    public static function bootAutoLoadsRelations()
    {
        static::retrieved(function ($model) {
            if (method_exists($model, 'getAutoLoadRelations')) {
                $relations = $model->getAutoLoadRelations();
                if (!empty($relations)) {
                    $model->load($relations);
                }
            }
        });
    }

    /**
     * Get the relations that should be automatically loaded.
     * This should be overridden in models using this trait.
     */
    public function getAutoLoadRelations()
    {
        return [];
    }
}
