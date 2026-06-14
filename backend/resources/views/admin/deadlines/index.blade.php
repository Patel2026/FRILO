@extends('layouts.master')
@section('title') Échéances système @endsection
@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Échéances système</h4>
            <a href="{{ route('admin.deadlines.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouvelle échéance
            </a>
        </div>
    </div>
</div>
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif
<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead class="table-light">
                <tr><th>Titre</th><th>Description</th><th>Échéance</th><th>Actions</th></tr>
            </thead>
            <tbody>
                @forelse($deadlines as $d)
                <tr>
                    <td>{{ $d->title }}</td>
                    <td class="text-muted small">{{ Str::limit($d->description ?? '—', 60) }}</td>
                    <td>{{ $d->due_date->format('d/m/Y') }}</td>
                    <td>
                        <a href="{{ route('admin.deadlines.edit', $d) }}" class="btn btn-soft-secondary btn-xs me-1">Modifier</a>
                        <form action="{{ route('admin.deadlines.destroy', $d) }}" method="POST" class="d-inline"
                              onsubmit="return confirm('Supprimer cette échéance ?')">
                            @csrf @method('DELETE')
                            <button class="btn btn-soft-danger btn-xs">Supprimer</button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr><td colspan="4" class="text-center text-muted py-4">Aucune échéance système.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
