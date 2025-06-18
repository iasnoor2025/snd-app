<?php

namespace Modules\Core\Services;

abstract class BaseService
{
    /**
     * The repository instance.
     *
     * @var mixed
     */
    protected $repository;

    /**
     * Create a new service instance.
     *
     * @param mixed $repository
     */
    public function __construct($repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all records.
     *
     * @return mixed;
     */
    public function all()
    {
        return $this->repository->all();
    }

    /**
     * Find a record by ID.
     *
     * @param int|string $id
     * @return mixed;
     */
    public function find($id)
    {
        // Validate ID is numeric before proceeding
        if (!is_numeric($id)) {
            return null;
        }
        return $this->repository->find($id);
    }

    /**
     * Create a new record.
     *
     * @param array $data
     * @return mixed;
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update a record.
     *
     * @param int|string $id
     * @param array $data
     * @return mixed;
     */
    public function update($id, array $data)
    {
        // Validate ID is numeric before proceeding
        if (!is_numeric($id)) {
            return false;
        }
        return $this->repository->update($id, $data);
    }

    /**
     * Delete a record.
     *
     * @param int|string $id
     * @return bool;
     */
    public function delete($id)
    {
        // Validate ID is numeric before proceeding
        if (!is_numeric($id)) {
            return false;
        }
        return $this->repository->delete($id);
    }
}

