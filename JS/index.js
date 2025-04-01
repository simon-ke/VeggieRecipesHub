document.addEventListener("DOMContentLoaded", function () {

    // 利用本地端JSON檔案 動態生成熱門食譜卡片
    // 發送請求載入預設數據
    fetch('./recipes.json')
        // （原始數據）轉換成（JSON格式）
        .then(response => response.json())
        .then(recipesData => {
            // 遍歷每一個 recipe 物件，並在 recipe-card-container 元素中建立 recipeCard 元素
            recipesData.forEach(recipe => {
                // 取得 recipe-card-container 元素，後續將 recipeCard 元素加入其中
                const recipeCardContainer = document.getElementById('recipe-card-container');

                // 建立一個新的 recipeCard 元素，並加入 標籤 CSS class  
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';

                // 建立 recipeCard 子元素 img
                const img = document.createElement('img');
                if (recipe.recipe_image) {
                    img.src = recipe.recipe_image;
                } else {
                    img.src = "/img/image_Not_Found.png";
                    img.className = 'image-not-found';
                }
                img.alt = recipe.recipe_title;

                // 建立 recipeCard 子元素 h4
                const title = document.createElement('h4');
                title.textContent = recipe.recipe_title;

                // 建立 recipeCard 子元素 p
                const description = document.createElement('p');
                description.textContent = recipe.recipe_description;

                // 建立 recipeCard 子元素 a
                const link = document.createElement('a');
                link.className = 'recipe-link';
                link.href = `HTML/recipe.html?id=${recipe.recipe_id}`;
                link.textContent = '查看食譜';

                // 將 recipeCard 子元素添加到 recipeCard 元素中
                recipeCard.append(img, title, description, link);

                // 將 recipeCard 獲得的內容加入到 recipeCardContainer
                recipeCardContainer.appendChild(recipeCard);
            });
            
            // 卡片的切換功能
            function initCardSlider(containerID, cardSelector, prevButtonSelector, nextButtonSelector, cardsPerGroup = 3) {
                const cardsContainer = document.getElementById(containerID);
                const cards = Array.from(cardsContainer.querySelectorAll(cardSelector));
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
            initCardSlider("recipe-card-container", ".recipe-card", ".prev-button", ".next-button");
            initCardSlider("new-card-container", ".new-recipe-card", ".new-prev-button", ".new-next-button");
        })
        .catch(error => {
            console.error('無法獲取食譜數據:', error);
        });

});



