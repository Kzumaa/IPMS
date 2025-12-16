<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateTestToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'token:generate {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate API token for testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (!$user) {
            $this->error('User not found');
            return 1;
        }

        $token = $user->createToken('test-token')->plainTextToken;

        $this->info("Token for {$user->email}:");
        $this->line($token);

        return 0;
    }
}
