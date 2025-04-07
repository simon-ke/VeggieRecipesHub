// 取得預設數據（從 JSON 檔案）與 localStorage 中的數據
async function getRecipesData() {
    try {
        // 透過 fetch 取得預設數據
        const response = await fetch('https://simon-ke.github.io/VeggieRecipesHub/data/recipes.json');
        const defaultRecipes = await response.json();

        // 從 localStorage 取得用戶新增的數據
        const storedData = localStorage.getItem('recipes');
        const storedRecipes = storedData ? JSON.parse(storedData) : [];

        // 合併預設數據與 localStorage 中的數據
        return [...defaultRecipes, ...storedRecipes];
    } catch (error) {
        console.error('Error fetching recipes:', error);

        // 找到容器元素
        const containers = ['top-recipe-container', 'new-recipe-container'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);

            // 清除舊的錯誤訊息
            const oldErrorMessage = container.querySelector('.error-message');
            if (oldErrorMessage) container.removeChild(oldErrorMessage);

            // 新增新的錯誤訊息
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message'; // 為錯誤訊息新增 class 以便操作
            errorMessage.textContent = '無法載入食譜資料，請稍後再試。';
            container.appendChild(errorMessage);
        });
    }
}

function renderRecipes(recipesData) {
    const topFragment = document.createDocumentFragment();
    const newFragment = document.createDocumentFragment();
    const topRecipeContainer = document.getElementById('top-recipe-container');// 取得 top-recipe-container 元素，後續將 recipeCard 元素加入其中
    const newRecipeContainer = document.getElementById('new-recipe-container');// 取得 new-recipe-container 元素，後續將 recipeCard 元素加入其中

    // 篩選並排序：僅保留最多 likes 的前六個食譜
    const topRecipes = recipesData
        .sort((a, b) => Number(b.likes) - Number(a.likes)) // 將 likes 轉為數字進行比較
        .slice(0, 6);

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
    const newRecipes = recipesData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // 使用日期排序
        .slice(0, 6);

    newRecipes.forEach(recipe => {
        const recipeCard = createNewRecipeCard(recipe);

        if (recipeCard) {
            newFragment.appendChild(recipeCard);
        } else {
            console.warn('無法生成 recipeCard，略過此項:', recipe);
        }
    });
    newRecipeContainer.appendChild(newFragment);
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
// 最新食譜卡片內容
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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const allRecipesData = await getRecipesData(); // 確保取得資料
        if (!Array.isArray(allRecipesData)) {
            throw new Error("資料非陣列格式");
        }
        renderRecipes(allRecipesData); // 渲染食譜
    } catch (error) {
        console.error("載入資料時發生錯誤:", error);
    }
    mouseCarousel(carouselTop); // 初始化滑動效果
    mouseCarousel(carouselNew); // 初始化滑動效果
});








// 建立推薦卡片函式
function createSuggestRecipeCard(recipe) {
    // 建立圖片元件
    const img = document.createElement('img');
    img.onerror = imgOnerror;

    if (recipe.recipe_image) {
        img.src = recipe.recipe_image;
    } else {
        img.src = "../img/image_Not_Found.png";
        img.classList.add('not-found-img');
    }
    img.alt = recipe.recipe_title;
}

// 當圖片載入失敗時，改用預設圖片，並透過狀態檢查避免無限迴圈（這裡利用 class 標記）
function imgOnerror() {
    if (!this.classList.contains('not-found-img')) {
        this.src = '../img/image_Not_Found.png';
        this.classList.add('not-found-img');
    }
}

// 卡片滑動
const carouselTop = document.getElementById("top-recipe-container");
const carouselNew = document.getElementById("new-recipe-container");
function mouseCarousel(element) {
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
            element.scrollLeft += velocity;
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
    element.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        moved = false;
        element.style.cursor = "grabbing";
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
        velocity = 0;
        lastMove = 0;
        cancelMomentumTracking();
    });

    // 滑鼠移動
    element.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();
        moved = true;
        element.style.cursor = "grabbing";
        const x = e.pageX - element.offsetLeft;
        const move = x - startX;

        // 記錄當前速度 (修正方向)
        velocity = (lastMove - move) * 0.3;
        lastMove = move;

        element.scrollLeft = scrollLeft - move;
    });

    // 滑鼠放開
    element.addEventListener("mouseup", (e) => {
        isDragging = false;
        element.style.cursor = "grab";

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
    element.addEventListener("mouseleave", () => {
        isDragging = false;
        element.style.cursor = "grab";
    });

    // 防止 a 標籤在拖動時觸發點擊
    element.addEventListener("click", (e) => {
        if (moved) {
            e.preventDefault();
        }
    });
}
