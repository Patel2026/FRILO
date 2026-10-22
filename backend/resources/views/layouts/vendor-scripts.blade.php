<script src="{{ URL::asset('build/libs/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ URL::asset('build/libs/simplebar/simplebar.min.js') }}"></script>
<script src="{{ URL::asset('build/libs/node-waves/waves.min.js') }}"></script>
<script src="{{ URL::asset('build/libs/feather-icons/feather.min.js') }}"></script>
@if(file_exists(public_path('frilo-admin.js')))
<script src="{{ URL::asset('frilo-admin.js') }}?v={{ filemtime(public_path('frilo-admin.js')) }}"></script>
@endif
@yield('script')
@yield('script-bottom')
