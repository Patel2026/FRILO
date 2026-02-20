# RuntimeException - Internal Server Error

The "intl" PHP extension is required to use the [format] method.

PHP 8.2.12
Laravel 12.50.0
127.0.0.1:8000

## Stack Trace

<!--[if BLOCK]><![endif]-->0 - vendor\laravel\framework\src\Illuminate\Support\Number.php:443
1 - vendor\laravel\framework\src\Illuminate\Support\Number.php:38
2 - vendor\filament\tables\resources\views\index.blade.php:676
3 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:37
4 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:38
5 - vendor\laravel\framework\src\Illuminate\View\Engines\CompilerEngine.php:76
6 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:16
7 - vendor\laravel\framework\src\Illuminate\View\View.php:208
8 - vendor\laravel\framework\src\Illuminate\View\View.php:191
9 - vendor\laravel\framework\src\Illuminate\View\View.php:160
10 - vendor\filament\support\src\Components\ViewComponent.php:125
11 - vendor\filament\schemas\src\Components\Component.php:221
12 - vendor\filament\schemas\src\Schema.php:205
13 - vendor\filament\support\src\Components\ViewComponent.php:122
14 - vendor\laravel\framework\src\Illuminate\Support\helpers.php:130
15 - vendor\filament\filament\resources\views\pages\page.blade.php:2
16 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:37
17 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:38
18 - vendor\laravel\framework\src\Illuminate\View\Engines\CompilerEngine.php:76
19 - vendor\livewire\livewire\src\Mechanisms\ExtendBlade\ExtendedCompilerEngine.php:16
20 - vendor\laravel\framework\src\Illuminate\View\View.php:208
21 - vendor\laravel\framework\src\Illuminate\View\View.php:191
22 - vendor\laravel\framework\src\Illuminate\View\View.php:160
23 - vendor\livewire\livewire\src\Mechanisms\HandleComponents\HandleComponents.php:390
24 - vendor\livewire\livewire\src\Mechanisms\HandleComponents\HandleComponents.php:441
25 - vendor\livewire\livewire\src\Mechanisms\HandleComponents\HandleComponents.php:382
26 - vendor\livewire\livewire\src\Mechanisms\HandleComponents\HandleComponents.php:80
27 - vendor\livewire\livewire\src\LivewireManager.php:102
28 - vendor\livewire\livewire\src\Features\SupportPageComponents\HandlesPageComponents.php:19
29 - vendor\livewire\livewire\src\Features\SupportPageComponents\SupportPageComponents.php:118
30 - vendor\livewire\livewire\src\Features\SupportPageComponents\HandlesPageComponents.php:14
31 - vendor\laravel\framework\src\Illuminate\Routing\ControllerDispatcher.php:46
32 - vendor\laravel\framework\src\Illuminate\Routing\Route.php:265
33 - vendor\laravel\framework\src\Illuminate\Routing\Route.php:211
34 - vendor\laravel\framework\src\Illuminate\Routing\Router.php:822
35 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:180
36 - vendor\filament\filament\src\Http\Middleware\DispatchServingFilamentEvent.php:15
37 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
38 - vendor\filament\filament\src\Http\Middleware\DisableBladeIconComponents.php:14
39 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
40 - vendor\laravel\framework\src\Illuminate\Routing\Middleware\SubstituteBindings.php:50
41 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
42 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken.php:87
43 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
44 - vendor\laravel\framework\src\Illuminate\Session\Middleware\AuthenticateSession.php:70
45 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
46 - vendor\laravel\framework\src\Illuminate\Auth\Middleware\Authenticate.php:63
47 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
48 - vendor\laravel\framework\src\Illuminate\View\Middleware\ShareErrorsFromSession.php:48
49 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
50 - vendor\laravel\framework\src\Illuminate\Session\Middleware\StartSession.php:120
51 - vendor\laravel\framework\src\Illuminate\Session\Middleware\StartSession.php:63
52 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
53 - vendor\laravel\framework\src\Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse.php:36
54 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
55 - vendor\laravel\framework\src\Illuminate\Cookie\Middleware\EncryptCookies.php:74
56 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
57 - vendor\filament\filament\src\Http\Middleware\SetUpPanel.php:19
58 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
59 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:137
60 - vendor\laravel\framework\src\Illuminate\Routing\Router.php:821
61 - vendor\laravel\framework\src\Illuminate\Routing\Router.php:800
62 - vendor\laravel\framework\src\Illuminate\Routing\Router.php:764
63 - vendor\laravel\framework\src\Illuminate\Routing\Router.php:753
64 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Kernel.php:200
65 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:180
66 - vendor\livewire\livewire\src\Features\SupportDisablingBackButtonCache\DisableBackButtonCacheMiddleware.php:19
67 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
68 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\TransformsRequest.php:21
69 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull.php:31
70 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
71 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\TransformsRequest.php:21
72 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\TrimStrings.php:51
73 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
74 - vendor\laravel\framework\src\Illuminate\Http\Middleware\ValidatePostSize.php:27
75 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
76 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance.php:109
77 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
78 - vendor\laravel\framework\src\Illuminate\Http\Middleware\HandleCors.php:61
79 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
80 - vendor\laravel\framework\src\Illuminate\Http\Middleware\TrustProxies.php:58
81 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
82 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks.php:22
83 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
84 - vendor\laravel\framework\src\Illuminate\Http\Middleware\ValidatePathEncoding.php:26
85 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:219
86 - vendor\laravel\framework\src\Illuminate\Pipeline\Pipeline.php:137
87 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Kernel.php:175
88 - vendor\laravel\framework\src\Illuminate\Foundation\Http\Kernel.php:144
89 - vendor\laravel\framework\src\Illuminate\Foundation\Application.php:1220
90 - public\index.php:20
91 - vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php:23
<!--[if ENDBLOCK]><![endif]-->
## Request

GET /admin/templates

## Headers

<!--[if BLOCK]><![endif]-->* **host**: 127.0.0.1:8000
* **connection**: keep-alive
* **sec-ch-ua**: "Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"
* **sec-ch-ua-mobile**: ?0
* **sec-ch-ua-platform**: "Windows"
* **upgrade-insecure-requests**: 1
* **user-agent**: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
* **accept**: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
* **sec-fetch-site**: same-origin
* **sec-fetch-mode**: navigate
* **sec-fetch-user**: ?1
* **sec-fetch-dest**: document
* **referer**: http://127.0.0.1:8000/admin
* **accept-encoding**: gzip, deflate, br, zstd
* **accept-language**: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
* **cookie**: XSRF-TOKEN=eyJpdiI6IjE2dWY3YW9ZbWhaR1BNN2hzUzN3a1E9PSIsInZhbHVlIjoiYVNpYnh1cVo3bmE1MTBnWHB0Z3ZmY1Z6RW9iekhpU3pCekhSMkdDcUxqY2lOOHdJbmFEaUd4NFY5T0hiZFpsYnpOQzdxZ1N1ZmxmSDJxd0U3aW9ycTVkbnlwdytUYTdRdFdQdlcwMm8xZEo0YStDSkYrQXFHS213ejIyY1JNSW0iLCJtYWMiOiI5NmMxZDA4OGQxN2RiMjBhZDdiYWMxNGM4NWZkNTU2M2IyMTA2N2JmMDRlMmFkOGJiZGExOTJmY2U3N2MzMjhiIiwidGFnIjoiIn0%3D; laravel-session=eyJpdiI6IjNBbENGRXdDOW5KRmcxbWFLVW9IWHc9PSIsInZhbHVlIjoiS1lNaWxjZ3JSQjBpa1V6Wjl3akozeVRMNk1kQ2VicllrcEd4VThvdGdqaUpXS3pVM2J5U0R6Qm1aeXBQb25EcUwvZ3FJWlYyamxRYUIveWM5RGViOEtHMzN1dUViaHNNbEs5VE1qYnBHMExWUHVlaWUraC9nT0tra1BPYU8xMEEiLCJtYWMiOiI3OWIxZTE3ODdlM2FmNDY3YThkM2MyZTI2MmZkZGNlMjdiNjNiYTI5ZjgzZmE3MzNlMzhjM2I4YjUyY2QyMmJlIiwidGFnIjoiIn0%3D
<!--[if ENDBLOCK]><![endif]-->
## Route Context

<!--[if BLOCK]><![endif]-->controller: App\Filament\Resources\Templates\Pages\ListTemplates
route name: filament.admin.resources.templates.index
middleware: panel:admin, Illuminate\Cookie\Middleware\EncryptCookies, Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse, Illuminate\Session\Middleware\StartSession, Filament\Http\Middleware\AuthenticateSession, Illuminate\View\Middleware\ShareErrorsFromSession, Illuminate\Foundation\Http\Middleware\VerifyCsrfToken, Illuminate\Routing\Middleware\SubstituteBindings, Filament\Http\Middleware\DisableBladeIconComponents, Filament\Http\Middleware\DispatchServingFilamentEvent, Filament\Http\Middleware\Authenticate
<!--[if ENDBLOCK]><![endif]-->
## Route Parameters

<!--[if BLOCK]><![endif]-->No route parameter data available.
<!--[if ENDBLOCK]><![endif]-->
## Database Queries

<!--[if BLOCK]><![endif]-->* mysql - select * from `sessions` where `id` = 'WbKu46COaZ4z1AvBmHIXnY3FISDh4aexeWX8VxeZ' limit 1 (2.16 ms)
* mysql - select * from `users` where `id` = 1 limit 1 (0.68 ms)
* mysql - select count(*) as aggregate from `templates` (0.58 ms)
* mysql - select * from `templates` order by `templates`.`id` asc limit 10 offset 0 (0.67 ms)
* mysql - select * from `sectors` where `sectors`.`id` in (1, 2, 3, 4, 5) (0.56 ms)
<!--[if ENDBLOCK]><![endif]-->