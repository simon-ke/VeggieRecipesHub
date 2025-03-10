// 食譜圖片燈箱
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
    const carousel = document.getElementById("suggestCardContainer");
    let isDragging = false;
    let startX, scrollLeft;
    let velocity = 0;
    let momentumID;
    let lastMove = 0;
    let moved = false;

    // 取消動量追蹤
    function cancelMomentumTracking() {
        cancelAnimationFrame(momentumID);
    }

    // 開始動量追蹤
    function beginMomentumTracking() {
        cancelMomentumTracking();

        function momentumLoop() {
            carousel.scrollLeft += velocity;
            velocity *= 0.95; // 緩慢減速

            // 當速度過小時停止動畫
            if (Math.abs(velocity) > 0.5) {
                momentumID = requestAnimationFrame(momentumLoop);
            } else {
                cancelMomentumTracking();
            }
        }
        momentumLoop();
    }

    // 滑鼠按下
    carousel.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        moved = false;
        carousel.style.cursor = "grabbing";
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        velocity = 0;
        lastMove = 0;
        cancelMomentumTracking();
    });

    // 滑鼠移動
    carousel.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        moved = true;
        carousel.style.cursor = "grabbing";
        const x = e.pageX - carousel.offsetLeft;
        const move = x - startX;

        // 記錄當前速度 (修正方向)
        velocity = (lastMove - move) * 0.3;
        lastMove = move;

        carousel.scrollLeft = scrollLeft - move;
    });

    // 滑鼠放開
    carousel.addEventListener("mouseup", (e) => {
        isDragging = false;
        carousel.style.cursor = "grab";

        // 確保拖動後不會觸發點擊
        if (moved) {
            e.preventDefault();
        }

        // 如果有移動才啟動動量效果
        if (moved) {
            beginMomentumTracking();
        }
    });

    // 滑鼠離開
    carousel.addEventListener("mouseleave", () => {
        isDragging = false;
        carousel.style.cursor = "grab";
    });

    // 防止 a 標籤在拖動時觸發點擊
    carousel.addEventListener("click", (e) => {
        if (moved) {
            e.preventDefault();
        }
    });
});

// input 高度自適應
const textarea = document.getElementById('feedback');

textarea.addEventListener('input', () => {
    // 重置高度，以便準確計算捲動高度
    textarea.style.height = 'auto';
    // 設置高度為內容的捲動高度
    textarea.style.height = `${textarea.scrollHeight}px`;
});


// 生成卡片