<?php


namespace App\Http\Controllers\Application;


use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\Fee\QuoteGenerator;
use Illuminate\Http\Request;


class FeeQuoteController extends Controller
{
    public function generate(Request $request, int $applicationId)
    {
        $request->validate([
            'law_version' => ['required', 'string', 'max:20'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);
        $app = Application::with('metrics')->findOrFail($applicationId);
        $quote = app(QuoteGenerator::class)->generate($app, $request->string('law_version'), $request->string('currency', 'VND'));
        return response()->json($quote->load('lines'));
    }
}
