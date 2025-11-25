<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestS3Connection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:test-s3';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the connection to the S3 bucket (R2)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing S3 connection...');

        $disk = Storage::disk('s3');
        $filename = 'test-connection-' . time() . '.txt';
        $content = 'This is a test file to verify S3 connection.';

        try {
            // 1. Write file
            $this->info("Attempting to write file: {$filename}");
            $disk->put($filename, $content);
            $this->info('File written successfully.');

            // 2. Check existence
            if ($disk->exists($filename)) {
                $this->info('File exists check passed.');
            } else {
                $this->error('File exists check failed.');
                return 1;
            }

            // 3. Read file
            $retrievedContent = $disk->get($filename);
            if ($retrievedContent === $content) {
                $this->info('File read check passed.');
            } else {
                $this->error('File read check failed. Content mismatch.');
                return 1;
            }

            // 4. Delete file
            $this->info('Attempting to delete file...');
            $disk->delete($filename);
            
            if (!$disk->exists($filename)) {
                $this->info('File deleted successfully.');
            } else {
                 $this->error('File deletion failed.');
                 return 1;
            }

            $this->info('S3 connection verification completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('An error occurred: ' . $e->getMessage());
            return 1;
        }
    }
}
