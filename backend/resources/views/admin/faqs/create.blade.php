@extends('layouts.master')

@section('title') Nouvelle question FAQ @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Nouvelle question FAQ</h4>
            <a href="{{ route('admin.faqs.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.faqs.store') }}" method="POST">
                    @csrf
                    @include('admin.faqs._form')
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">Créer la question</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
