<?php

namespace Modules\Core\Repositories;

use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * The model instance.
     *
     * @var Model
     */
    protected $model;

    /**
     * Create a new repository instance.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get all records.
     *
     * @return mixed
     */
    public function all()
    {
        return $this->model->all();
    }

    /**
     * Find a record by ID.
     *
     * @param int $id
     * @return mixed
     */
    public function find($id)
    {
        // Validate ID is numeric before querying to prevent PostgreSQL errors
        if (!is_numeric($id)) {
            return null;
        }
        return $this->model->find($id);
    }

    /**
     * Create a new record.
     *
     * @param array $data
     * @return mixed;
     */
    public function create(array $data)
    {
        \Log::info('BaseRepository::create - Start', [
            'model_class' => get_class($this->model),
            'data_keys' => array_keys($data)
        ]);

        try {
            $model = $this->model->create($data);

            // Check if the model was actually created with an ID
            \Log::info('BaseRepository::create - After create', [
                'model_class' => get_class($this->model),
                'model_id' => $model->id ?? 'null',
                'model_exists' => $model->exists ?? false
            ]);

            if (!$model || !$model->exists || !$model->id) {
                \Log::warning('BaseRepository::create - Model creation failed', [
                    'model_class' => get_class($this->model),
                    'data' => $data
                ]);
            }

            return $model;
        } catch (\Exception $e) {
            \Log::error('BaseRepository::create - Exception', [
                'model_class' => get_class($this->model),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Update a record.
     *
     * @param int $id
     * @param array $data
     * @return mixed;
     */
    public function update($id, array $data)
    {
        // Validate ID is numeric before proceeding
        if (!is_numeric($id)) {
            return false;
        }

        $record = $this->find($id);
        if ($record) {
            $record->update($data);
            return $record;
        }
        return false;
    }

    /**
     * Delete a record.
     *
     * @param int $id
     * @return bool;
     */
    public function delete($id)
    {
        // Validate ID is numeric before proceeding
        if (!is_numeric($id)) {
            return false;
        }

        $record = $this->find($id);
        if ($record) {
            return $record->delete();
        }
        return false;
    }
}


