
$('input[type="checkbox"]').change(function() {
    var checked = $(this).is(':checked');
    var taskId = $(this).val(); 
    $.post('/check', { taskId: taskId, checked: checked });
});
