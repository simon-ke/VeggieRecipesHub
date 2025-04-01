// 取得預設數據（從 JSON 檔案）與 localStorage 中的數據
async function getRecipesData() {
    try {
        // 透過 fetch 取得預設數據
        const response = await fetch("/recipes.json");
        const defaultRecipes = await response.json();

        // 從 localStorage 取得用戶新增的數據
        const storedData = localStorage.getItem('recipes');
        const storedRecipes = storedData ? JSON.parse(storedData) : [];

        // 合併預設數據與 localStorage 中的數據
        return [...defaultRecipes, ...storedRecipes];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = '無法載入食譜資料，請稍後再試。';
        document.getElementById('top-recipe-container').appendChild(errorMessage);
    };
}

function renderRecipes(recipesData) {
    const topFragment = document.createDocumentFragment();
    const newFragment = document.createDocumentFragment();
    const topRecipeContainer = document.getElementById('top-recipe-container');// 取得 top-recipe-container 元素，後續將 recipeCard 元素加入其中
    const newRecipeContainer = document.getElementById('new-recipe-container');// 取得 new-recipe-container 元素，後續將 recipeCard 元素加入其中

    // 篩選並排序：僅保留最多 likes 的前六個食譜
    const topRecipes = [...recipesData].sort((a, b) => b.likes - a.likes).slice(0, 6);

    // 遍歷每一個 recipe 物件，並在 top-recipe-container 元素中建立 recipeCard 元素
    topRecipes.forEach(recipe => {
        const recipeCard = createTopRecipeCard(recipe);

        // 檢查 recipeCard 是否成功生成，避免傳入無效節點
        if (recipeCard) {
            topFragment.appendChild(recipeCard);
        } else {
            console.warn('無法生成 recipeCard，略過此項:', recipe);
        }
    });
    topRecipeContainer.appendChild(topFragment);

    // 篩選並排序：最新 created_at 的前六個食譜
    const newRecipes = recipesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6); // 取前六項

    newRecipes.forEach(recipe => {
        const recipeCard = createNewRecipeCard(recipe);

        if (recipeCard) {
            newFragment.appendChild(recipeCard);
        } else {
            console.warn('無法生成 recipeCard，略過此項:', recipe);
        }
    });
    newRecipeContainer.appendChild(newFragment);

    initCardSlider("top-recipe-container", ".recipe-card", ".prev-button", ".next-button");
    initCardSlider("new-recipe-container", ".new-recipe-card", ".new-prev-button", ".new-next-button");
}

// 熱門食譜卡片內容
function createTopRecipeCard(recipe) {
    try {
        // 建立一個新的 recipeCard 元素，並加入 標籤 CSS class
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';

        // 建立 recipeCard 子元素 img
        const img = document.createElement('img');
        if (recipe.recipe_image) {
            img.src = recipe.recipe_image;
        } else {
            img.src = "./img/image_Not_Found.png";
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

        // 將子元素添加到 recipeCard
        recipeCard.append(img, title, description, link);

        // 回傳 recipeCard 節點
        return recipeCard;
    } catch (error) {
        console.error('在生成或添加卡片時出現錯誤:', error);
        return null; // 若發生錯誤，回傳 null 以避免程式崩潰
    }
}
// 熱門食譜卡片內容
function createNewRecipeCard(recipe) {
    try {
        // 建立一個新的 recipeCard 元素，並加入 標籤 CSS class
        const recipeCard = document.createElement('div');
        recipeCard.className = 'new-recipe-card';

        // 建立 recipeCard 子元素 img
        const img = document.createElement('img');
        if (recipe.recipe_image) {
            img.src = recipe.recipe_image;
        } else {
            img.src = "./img/image_Not_Found.png";
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

        // 將子元素添加到 recipeCard
        recipeCard.append(img, title, description, link);

        // 回傳 recipeCard 節點
        return recipeCard;
    } catch (error) {
        console.error('在生成或添加卡片時出現錯誤:', error);
        return null; // 若發生錯誤，回傳 null 以避免程式崩潰
    }
}

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

document.addEventListener("DOMContentLoaded", async () => {
    // 取得食譜數據並記錄到全局變數
    allRecipesData = await getRecipesData();
    // 初次渲染
    renderRecipes(allRecipesData);
});
