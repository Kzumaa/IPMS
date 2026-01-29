<?php

namespace Database\Factories;

use App\Models\FeeQuote;
use App\Models\Application;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeeQuoteFactory extends Factory
{
    protected $model = FeeQuote::class;

    public function definition(): array
    {
        return [
            'application_id' => Application::factory(),
            'version' => 1,
            'currency' => 'VND',
            'total_amount' => $this->faker->numberBetween(100000, 5000000),
            'status' => 'PENDING',
            'generated_at' => now(),
            'law_version' => '2022',
        ];
    }
}
