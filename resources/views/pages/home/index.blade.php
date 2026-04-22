@extends('layouts.app')
@php $hasHero = true; @endphp

@section('title', 'Home - SPUP Community Development Center Foundation, Inc.')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/pages/home/hero.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/home/who-we-are.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/home/what-we-do.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/home/stats.css') }}">
    <link rel="stylesheet" href="{{ asset('css/pages/home/cta.css') }}">
@endpush

@section('content')
    @include('pages.home._hero')
    @include('pages.home._who-we-are')
    @include('pages.home._what-we-do')
    @include('pages.home._stats')
    @include('pages.home._cta')
@endsection

@push('scripts')
    <script src="{{ asset('js/home/what-we-do.js') }}" defer></script>
    <script src="{{ asset('js/home/stats.js') }}" defer></script>
    <script src="{{ asset('js/home/cta.js') }}" defer></script>
@endpush