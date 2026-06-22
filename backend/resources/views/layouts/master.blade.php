<!doctype html >
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="frilo-admin-shell" data-layout="vertical" data-topbar="light" data-sidebar="dark" data-sidebar-size="lg" data-sidebar-image="none" data-preloader="disable">

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

@section('body')
    @include('layouts.body')
@show
    <!-- Begin page -->
    <div id="layout-wrapper" class="frilo-admin-layout">
        @include('layouts.topbar')
        @include('layouts.sidebar')
        <!-- ============================================================== -->
        <!-- Start right Content here -->
        <!-- ============================================================== -->
        <div class="main-content">
            <div class="page-content">
                <div class="container-fluid">
                    @yield('content')
                </div>
                <!-- container-fluid -->
            </div>
            <!-- End Page-content -->
            @include('layouts.footer')
        </div>
        <!-- end main content-->
    </div>
    <!-- END layout-wrapper -->

    <!-- JAVASCRIPT -->
    @include('layouts.vendor-scripts')
</body>

</html>
