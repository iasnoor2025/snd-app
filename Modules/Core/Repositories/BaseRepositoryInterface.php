<?php

namespace Modules\Core\Repositories;

interface BaseRepositoryInterface
{
    /**
     * Get all records.
     *
     * @return mixed
     */
    public function all();

    /**
     * Find a record by ID.
     *
     * @param int $id
     * @return mixed
     */
    public function find($id);

    /**
     * Create a new record.
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data);

    /**
     * Update a record.
     *
     * @param int $id
     * @param array $data
     * @return mixed;
     */
    public function update($id, array $data);

    /**
     * Delete a record.
     *
     * @param int $id
     * @return bool;
     */
    public function delete($id);
}

