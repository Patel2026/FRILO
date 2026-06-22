<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-topbar="light" data-sidebar-image="none">

<head>
    <meta charset="utf-8" />
    <title>@yield('title', 'Administration') | FRILO Admin</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="@yield('meta_description', 'Espace d’administration FRILO pour piloter les commandes, contenus, paiements et clients.')" name="description" />
    <meta content="FRILO" name="author" />
    <meta name="robots" content="noindex,nofollow">
    <!-- App favicon -->
    <link rel="icon" href="{{ URL::asset('favicon.ico') }}" sizes="any">
    <link rel="icon" href="{{ URL::asset('favicon.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ URL::asset('favicon.png') }}">
    @include('layouts.head-css')
</head>

@yield('body')

@yield('content')

@include('layouts.vendor-scripts')
</body>
</html>
