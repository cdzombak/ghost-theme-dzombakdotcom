(function () {
    pagination(false);
})();

function isOverflownX(element) {
    return element.scrollWidth > element.clientWidth;
}

window.addEventListener('load', function () {
    document.querySelectorAll('.gh-content table:not(.gist table)').forEach((element) => {
        if (!isOverflownX(element)) {
            element.style.background = 'none';
        }
    });
});
