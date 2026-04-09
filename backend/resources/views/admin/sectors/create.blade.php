@extends('layouts.master')

@section('title') Nouveau secteur @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Nouveau secteur</h4>
            <a href="{{ route('admin.sectors.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-lg-6">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.sectors.store') }}" method="POST">
                    @csrf
                    @include('admin.sectors._form')
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">Créer le secteur</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
