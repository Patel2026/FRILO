@extends('layouts.master')

@section('title') Modifier — {{ $template->name }} @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Modifier : {{ $template->name }}</h4>
            <a href="{{ route('admin.templates.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.templates.update', $template) }}" method="POST" enctype="multipart/form-data">
                    @csrf @method('PUT')
                    @include('admin.templates._form')
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
