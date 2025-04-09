const previousTasksMenu = document.getElementById('previous-tasks-menu');
const megaMenu = document.getElementById('mega-menu');

previousTasksMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    megaMenu.style.display = megaMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(e) {
    if (e.target.id !== 'mega-menu') {
        megaMenu.style.display = 'none';
    }
});
