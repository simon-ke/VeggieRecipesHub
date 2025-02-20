// 當頁面滾動時觸發
window.onscroll = () => {
    scrollFunction();
};

const scrollFunction = () => {
    const backToTopButton = document.getElementById("back-to-top");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

// 點擊圖片回到頂部
document.getElementById("back-to-top").onclick = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
};


// 卡片的切換功能
document.addEventListener("DOMContentLoaded", function () {
    function initCardSlider(containerSelector, cardSelector, prevButtonSelector, nextButtonSelector, cardsPerGroup = 3) {
        const cardsContainer = document.querySelector(containerSelector);
        const cards = Array.from(document.querySelectorAll(cardSelector));
        const prevButton = document.querySelector(prevButtonSelector);
        const nextButton = document.querySelector(nextButtonSelector);
        let currentIndex = 0;
        const totalCards = cards.length;

        if (!cardsContainer || cards.length === 0 || !prevButton || !nextButton) return;

        function updateCards() {
            cards.forEach((card, index) => {
                const isVisible = (index >= currentIndex && index < currentIndex + cardsPerGroup) || 
                                 (currentIndex + cardsPerGroup >= totalCards && index < (currentIndex + cardsPerGroup) % totalCards);
                card.classList.toggle("active", isVisible);
                card.style.visibility = isVisible ? 'visible' : 'hidden';
            });

            cardsContainer.innerHTML = "";
            for (let i = 0; i < cardsPerGroup; i++) {
                const index = (currentIndex + i) % totalCards;
                cardsContainer.appendChild(cards[index]);
            }
        }

        function applyAnimation(outCard, inCard, outClass, inClass) {
            if (outCard) outCard.classList.add(outClass);
            if (inCard) inCard.classList.add(inClass);
        }

        function showNext() {
            applyAnimation(cards[currentIndex], cards[(currentIndex + cardsPerGroup) % totalCards], "slide-out-left", "slide-in-right");
            currentIndex = (currentIndex + 1) % totalCards;
            updateCards();
        }

        function showPrev() {
            applyAnimation(cards[(currentIndex + cardsPerGroup - 1) % totalCards], cards[currentIndex], "slide-out-right", "slide-in-left");
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCards();
        }

        nextButton.addEventListener("click", showNext);
        prevButton.addEventListener("click", showPrev);

        updateCards();
    }

    // 初始化兩組不同的卡片輪播效果
    initCardSlider(".recipe-cards", ".recipe-card", ".prev-button", ".next-button");
    initCardSlider(".new-recipe-cards", ".new-recipe-card", ".new-prev-button", ".new-next-button");
    });
