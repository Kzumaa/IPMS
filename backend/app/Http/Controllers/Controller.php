<?php

namespace App\Http\Controllers;

//use Illuminate\Support\Facades\DB;

abstract class Controller
{
    //
    public function hello()
    {
        Illuminate\Support\Facades\DB::connection()->getPDO();
        return response()->json(['message' => 'Hello, World!']);
    }

}
