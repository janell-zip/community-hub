<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="{{ asset('img/spup_logo.png') }}">
    <title>@yield('title', 'SPUP Community Development Center Foundation, Inc.')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/components/navbar.css') }}">
    <link rel="stylesheet" href="{{ asset('css/components/footer.css') }}">

    @stack('styles')
</head>
<body>
    <x-navbar />

    @yield('content')

    <x-footer />

    <script src="{{ asset('js/components/navbar.js') }}" defer></script>

    @stack('scripts')
</body>
</html>