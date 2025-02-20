document.addEventListener('DOMContentLoaded', function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const recipeImgs = document.querySelectorAll('.recipe-img');

    recipeImgs.forEach(img => {
        img.addEventListener('click', function () {
            lightbox.style.display = 'flex';
            lightboxImg.src = this.src;
        });
    });

    lightbox.addEventListener('click', function () {
        lightbox.style.display = 'none';
    });
});

// 卡片滑動
document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".featured-carousel");

    let isDragging = false;
    let startX, scrollLeft;
    let velocity = 0;
    let momentumID;

    // 滑鼠按下開始拖動
    carousel.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        velocity = 0;
        carousel.style.scrollBehavior = "auto"; // 禁用 CSS 滑動效果，避免干擾
        cancelMomentumTracking();
    });

    // 滑鼠移動
    carousel.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const move = (x - startX) * 1; // 控制滑動速度
        velocity = move * 0.05; // 讓滑動更平滑
        carousel.scrollLeft = scrollLeft - move;
    });

    // 滑鼠放開
    carousel.addEventListener("mouseup", () => {
        isDragging = false;
        beginMomentumTracking();
    });

    // 滑鼠離開
    carousel.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    // 觸控（手機）
    let touchStartX, touchScrollLeft;

    carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].pageX - carousel.offsetLeft;
        touchScrollLeft = carousel.scrollLeft;
        velocity = 0;
        cancelMomentumTracking();
    });

    carousel.addEventListener("touchmove", (e) => {
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const move = (x - touchStartX) * 1;
        velocity = move * 0.05;
        carousel.scrollLeft = touchScrollLeft - move;
    });

    carousel.addEventListener("touchend", () => {
        beginMomentumTracking();
    });

    // 啟動動量滾動
    function beginMomentumTracking() {
        cancelMomentumTracking();
        momentumID = requestAnimationFrame(momentumLoop);
    }

    function cancelMomentumTracking() {
        cancelAnimationFrame(momentumID);
    }

    function momentumLoop() {
        carousel.scrollLeft -= velocity;
        velocity *= 0.95; // 逐漸減速
        if (Math.abs(velocity) > 0.5) {
            momentumID = requestAnimationFrame(momentumLoop);
        } else {
            velocity = 0;
        }
    }
});


