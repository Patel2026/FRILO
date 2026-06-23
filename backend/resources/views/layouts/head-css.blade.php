@yield('css')
<!-- Layout config Js -->
<script src="{{ URL::asset('build/js/layout.js') }}"></script>
<!-- Bootstrap Css -->
<link href="{{ URL::asset('build/css/bootstrap.min.css') }}" id="bootstrap-style" rel="stylesheet" type="text/css" />
@if(app()->environment('local') && file_exists(public_path('frilo-bootstrap.css')))
<link href="{{ URL::asset('frilo-bootstrap.css') }}" rel="stylesheet" type="text/css" />
@endif
<!-- Icons Css -->
<link href="{{ URL::asset('build/css/icons.min.css') }}" rel="stylesheet" type="text/css" />
@if(app()->environment('local') && file_exists(public_path('frilo-icons.css')))
<link href="{{ URL::asset('frilo-icons.css') }}" rel="stylesheet" type="text/css" />
@endif
<!-- App Css-->
<link href="{{ URL::asset('build/css/app.min.css') }}" id="app-style" rel="stylesheet" type="text/css" />
@if(app()->environment('local') && file_exists(public_path('frilo-app.css')))
<link href="{{ URL::asset('frilo-app.css') }}" rel="stylesheet" type="text/css" />
@endif
<!-- custom Css-->
<link href="{{ URL::asset('build/css/custom.min.css') }}" id="app-style" rel="stylesheet" type="text/css" />
@if(file_exists(public_path('frilo-admin.css')))
<link href="{{ URL::asset('frilo-admin.css') }}?v={{ filemtime(public_path('frilo-admin.css')) }}" rel="stylesheet" type="text/css" />
@endif
{{-- @yield('css') --}}
