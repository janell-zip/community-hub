<?php
namespace App\Http\Controllers;

class AboutController extends Controller
{
    public function index()
    {
        return view('pages.about.index');
    }

    public function programs()
    {
        return view('pages.about.index');
    }
}