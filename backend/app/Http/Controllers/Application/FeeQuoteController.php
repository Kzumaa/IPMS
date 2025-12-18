<?php


namespace App\Http\Controllers\Application;


use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\Fee\QuoteGenerator;
use Illuminate\Http\Request;


class FeeQuoteController extends Controller
{
    /**
     * Get all fee quotes for an application
     */
    public function index(int $applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $quotes = $application->feeQuotes()
            ->with('lines')
            ->orderBy('version', 'desc')
            ->get();

        return response()->json(['data' => $quotes]);
    }

    /**
     * Generate a new fee quote for an application
     */
    public function generate(Request $request, int $applicationId)
    {
        $request->validate([
            'law_version' => ['required', 'string', 'max:20'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);
        $app = Application::with('metrics')->findOrFail($applicationId);
        $this->authorize('view', $app);

        $quote = app(QuoteGenerator::class)->generate($app, $request->string('law_version'), $request->string('currency', 'VND'));
        return response()->json(['data' => $quote->load('lines')]);
    }
}
