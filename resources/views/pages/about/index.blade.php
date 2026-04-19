@extends('layouts.app')

@section('title', 'About - SPUP Community Development Center Foundation, Inc.')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/pages/about/hero.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/about/mv.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/about/objectives.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/about/programs.css') }}">
@endpush

@section('content')
    @include('pages.about._hero')
    @include('pages.about._mv')
    @include('pages.about._objectives')
    @include('pages.about._programs')
@endsection

@push('scripts')
    <script src="{{ asset('js/about/programs.js') }}" defer></script>   
@endpush