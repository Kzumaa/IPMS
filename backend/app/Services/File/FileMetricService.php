<?php

namespace App\Services\File;

use App\Models\Application;
use App\Models\File;
use App\Repositories\File\FileRepositoryInterface;
use App\Repositories\ApplicationMetric\ApplicationMetricRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Imagick;

class FileMetricService
{
    protected $fileRepository;
    protected $applicationMetricRepository;

    public function __construct(
        FileRepositoryInterface $fileRepository,
        ApplicationMetricRepositoryInterface $applicationMetricRepository
    ) {
        $this->fileRepository = $fileRepository;
        $this->applicationMetricRepository = $applicationMetricRepository;
    }
    public function analyze(File $file, ?Application $application = null, ?string $docType = null): array
    {
        // Check if file is PDF
        if ($file->mime !== 'application/pdf') {
            return [
                'status' => 'skipped',
                'message' => 'File is not a PDF. Manual verification required.',
                'metrics' => []
            ];
        }

        $path = $this->getLocalFilePath($file);
        $metrics = [];

        try {
            // Basic File Metrics
            $imagick = new Imagick();
            $imagick->pingImage($path);
            $pageCount = $imagick->getNumberImages();
            $metrics['page_count'] = $pageCount;
            
            // Update File model
            $this->fileRepository->update($file, ['page_count' => $pageCount]);

            // Application Specific Metrics
            if ($application && $docType) {
                $this->updateApplicationMetrics($application, $docType, $metrics, $path);
            }

            return [
                'status' => 'processed',
                'message' => 'Metrics extracted successfully.',
                'metrics' => $metrics
            ];

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Metric extraction failed for file {$file->id}: " . $e->getMessage());
            return [
                'status' => 'failed',
                'message' => 'Extraction failed: ' . $e->getMessage(),
                'metrics' => []
            ];
        } finally {
            // Cleanup temp file if it was downloaded
            if ($file->storage !== 'local' && file_exists($path)) {
                // unlink($path); // Keep it for now or manage temp files properly
            }
        }
    }

    protected function updateApplicationMetrics(Application $application, string $docType, array $fileMetrics, string $filePath)
    {
        // $appMetrics = $application->metrics ?? $application->metrics()->create([]); // Removed direct access
        $updates = [];

        switch ($docType) {
            case 'DESCRIPTION':
                if (isset($fileMetrics['page_count'])) {
                    $updates['description_pages'] = $fileMetrics['page_count'];
                }
                break;
            
            case 'DRAWINGS':
                // For drawings, it's usually pages in PDF or count of images
                if (isset($fileMetrics['page_count'])) {
                    $updates['drawings_images'] = $fileMetrics['page_count'];
                }
                break;

            case 'CLAIMS':
                // Attempt to count total claims based on numbered paragraphs
                $claimsCount = $this->estimateClaimsCount($filePath);
                if ($claimsCount > 0) {
                    $updates['claims_total'] = $claimsCount;
                    // Defaulting independent claims to 1 as a safe baseline if total > 0
                    // The user should verify this manually.
                    $updates['claims_independent'] = 1; 
                }
                break;
                
            case 'ID_PHOTOS_SET':
                 if (isset($fileMetrics['page_count'])) {
                    $updates['id_images_per_variant'] = $fileMetrics['page_count']; 
                }
                break;
        }

        if (!empty($updates)) {
            $this->applicationMetricRepository->updateOrCreate(
                ['application_id' => $application->id],
                $updates
            );
        }
    }

    protected function estimateClaimsCount(string $filePath): int
    {
        // Use Ghostscript to extract text for analysis
        try {
            // -q: Quiet, -dNOPAUSE: No pause after page, -dBATCH: Exit after processing
            // -sDEVICE=txtwrite: Extract text
            $command = "gs -q -dNOPAUSE -dBATCH -sDEVICE=txtwrite -sOutputFile=- " . escapeshellarg($filePath);
            $output = shell_exec($command);
            
            if (!$output) return 0;

            // Heuristic: Count paragraphs starting with numbers (e.g., "1. ", "2. ")
            // This assumes standard claim formatting.
            preg_match_all('/^\s*\d+\./m', $output, $matches);
            return count($matches[0]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to estimate claims count for file: " . $e->getMessage());
            return 0;
        }
    }

    protected function getLocalFilePath(File $file): string
    {
        if ($file->storage === 'local') {
            return Storage::disk('local')->path($file->object_key);
        }
        
        // Download to temp
        $content = Storage::disk(strtolower($file->storage))->get($file->object_key);
        $tempPath = tempnam(sys_get_temp_dir(), 'ipms_analyze_');
        file_put_contents($tempPath, $content);
        return $tempPath;
    }
}
