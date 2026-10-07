<script>
(() => {
    const form = document.getElementById('catalog-bulk-form');
    const all = document.getElementById('catalog-select-page');
    const rows = Array.from(document.querySelectorAll('.catalog-select'));
    const submit = document.getElementById('catalog-submit');
    const counter = document.getElementById('catalog-count');
    const action = document.getElementById('catalog-action');
    const restore = @json($trashed ?? false);
    const refresh = () => {
        const count = rows.filter(row => row.checked).length;
        counter.textContent = `${count} élément(s) sélectionné(s)`;
        submit.disabled = count === 0;
        all.disabled = rows.length === 0;
        all.checked = rows.length > 0 && count === rows.length;
        all.indeterminate = count > 0 && count < rows.length;
    };
    all.addEventListener('change', () => {
        rows.forEach(row => { row.checked = all.checked; });
        refresh();
    });
    rows.forEach(row => row.addEventListener('change', refresh));
    form.addEventListener('submit', event => {
        const count = rows.filter(row => row.checked).length;
        const verb = action ? (action.value === '1' ? 'Réactiver' : 'Désactiver') : (restore ? 'Restaurer' : 'Déplacer dans la corbeille');
        if (!count || !window.confirm(`${verb} les ${count} élément(s) sélectionné(s) ?`)) event.preventDefault();
        else submit.disabled = true;
    });
    window.addEventListener('pageshow', refresh);
    refresh();
})();
</script>
