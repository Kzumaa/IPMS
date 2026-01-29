<?php

namespace Database\Factories;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\ApplicationRequest;
use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationRequestFactory extends Factory
{
    protected $model = ApplicationRequest::class;

    public function definition(): array
    {
        return [
            'application_id' => Application::factory(),
            'type' => RequestType::AMENDMENT,
            'status' => RequestStatus::SUBMITTED,
            'request_date' => now(),
            'created_by' => User::factory(),
        ];
    }
}
