<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\AuthorityOrg;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'app_type' => 'PATENT',
            'title' => $this->faker->sentence,
            'status' => 'DRAFT',
            'created_by' => User::factory(),
            'applicant_is_inventor' => false,
            'publication_early_requested' => false,
        ];
    }
}
