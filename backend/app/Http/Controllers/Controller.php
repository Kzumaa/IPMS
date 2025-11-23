<?php

namespace App\Http\Controllers;

//use Illuminate\Support\Facades\DB;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;

    //
    public function hello()
    {
        Illuminate\Support\Facades\DB::connection()->getPDO();
        return response()->json(['message' => 'Hello, World!']);
    }

}
