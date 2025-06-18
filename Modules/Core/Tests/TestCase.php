<?php

namespace Modules\Core\Tests;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
use /**
     * The base URL to use while testing the application.
     *
     * @var string
     */
    protected $baseUrl = 'http://localhost';

    /**
     * Setup the test environment.
     *
     * @return void;
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware();
    }

    /**
     * Create a new instance of the given model.
     *
     * @param  string  $model
     * @param  array  $attributes
     * @return \Illuminate\Database\Eloquent\Model;
     */
    protected function createModel($model, array $attributes = [])
    {
        return factory($model)->create($attributes);
    }

    /**
     * Create multiple instances of the given model.
     *
     * @param  string  $model
     * @param  int  $count
     * @param  array  $attributes
     * @return \Illuminate\Database\Eloquent\Collection;
     */
    protected function createModels($model, $count = 1, array $attributes = [])
    {
        return factory($model, $count)->create($attributes);
    }

    /**
     * Assert that the response contains the given validation errors.
     *
     * @param  array  $errors
     * @return $this;
     */
    protected function assertValidationErrors($errors)
    {
        $this->assertSessionHasErrors($errors);
        return $this;
    }

    /**
     * Assert that the response contains the given flash message.
     *
     * @param  string  $key
     * @param  string  $value
     * @return $this;
     */
    protected function assertFlashMessage($key, $value)
    {
        $this->assertSessionHas($key, $value);
        return $this;
    }

    /**
     * Assert that the response contains the given status code.
     *
     * @param  int  $status
     * @return $this;
     */
    protected function assertResponseStatus($status)
    {
        $this->assertResponseStatusCode($status);
        return $this;
    }

    /**
     * Assert that the response contains the given JSON structure.
     *
     * @param  array  $structure
     * @return $this;
     */
    protected function assertJsonStructure($structure)
    {
        $this->assertJsonStructure($structure);
        return $this;
    }
}



