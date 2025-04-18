// 卡片滑動效果
function carouselCard() {
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
}

// 動態建立食譜卡片
let allRecipesData = []; // 全局變數，用來暫存所有食譜資料
let sort = ''; // 全局排序條件（若原本就有用 global 變數，可以直接更新）

const urlParams = new URLSearchParams(window.location.search);// 解析 URL 中的參數
const category = urlParams.get('category'); // 再次取得 category
const keyword = urlParams.get('search'); // 取得搜尋關鍵字參數
const loggedInUser = localStorage.getItem('loggedInUser'); // 讀取當前登入的使用者
const userId = loggedInUser ? JSON.parse(loggedInUser).user_id : null;

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
    }
}

// 搜尋篩選函式
function search(keyword, recipesData) {
    // 將關鍵字轉為小寫標準化
    const searchKeyword = keyword.toLowerCase();
    // console.log(searchKeyword)
    // console.log(recipesData)
    return recipesData.filter(recipe => {
        // 標題比對
        const titleMatch = recipe.recipe_title.toLowerCase().includes(searchKeyword);
        // 描述比對
        const descriptionMatch = recipe.recipe_description.toLowerCase().includes(searchKeyword);
        // 食譜標籤陣列比對
        const tagMatch = recipe.tags && recipe.tags.some(tag =>
            tag.toLowerCase().includes(searchKeyword)
        );
        return titleMatch || descriptionMatch || tagMatch;
    });
}

// 取得食譜數據 建立頁面內容 or 關鍵字篩選或排序後的內容
function renderRecipes(recipesData) {
    try {
        // 將獲取的數據應用於動態生成網頁內容
        if (recipesData && Array.isArray(recipesData)) {
            // 根據 keyword 存在且有內容，來過濾出符合條件的食譜，否則就使用所有食譜數據
            const textFilterData =
                keyword && keyword.trim() !== "" ? search(keyword, recipesData) : recipesData;

            // 根據 sort 儲存的排序條件來排序食譜
            const dataToRender = sortRecipes(textFilterData, sort);

            // 渲染搜尋結果
            renderSearchResults(dataToRender);

            // 食譜卡片區塊
            const recipeCardContainer = document.getElementById("recipeCardContainer");
            // 食譜推薦區塊
            const suggestCardContainer = document.getElementById("suggestCardContainer");

            // 清空之前的渲染，避免重複插入元素
            recipeCardContainer.innerHTML = '';
            suggestCardContainer.innerHTML = '';

            // 使用 DocumentFragment 優化多次 DOM 插入 如果食譜數據筆數較多，插入每個新的元素到 DOM 都可能引發重排（reflow）與重繪（repaint）。使用 DocumentFragment 來先建立所有卡片，最後一次性把碎片插入到 DOM，從而減少瀏覽器的重排次數。
            const fragment = document.createDocumentFragment();
            const suggestFragment = document.createDocumentFragment();

            // --- 主要食譜區塊依據關鍵字迭代 ---
            dataToRender.forEach(recipe => {
                // 建立食譜簡介區塊
                const card = createRecipeCard(recipe);
                // 將 card 插入 fragment
                fragment.append(card);
            });
            // --- 推薦區塊顯示所有的食譜數據 ---
            recipesData.forEach(recipe => {
                // 建立食譜推薦區塊
                const suggestCard = createSuggestRecipeCard(recipe);
                // 將 suggestCard 插入 suggestFragment
                suggestFragment.append(suggestCard);
            });

            // 一次性把所有卡片插入容器
            recipeCardContainer.append(fragment);
            suggestCardContainer.append(suggestFragment);

            // 燈箱
            lightbox();
        }
    } catch (error) {
        console.error('Error processing recipes:', error);
    }
}

// 動態變更頁籤
function createbreadCrumb() {
    const breadCrumb = document.querySelector('.breadcrumb');
    breadCrumb.innerHTML = `
        <a href="../index.html">首頁</a>
    `;
    if (category) {
        breadCrumb.innerHTML += `
            >
            <a href="#">${category}</a>
        `;
    }
}

// 渲染搜尋結果：顯示查詢筆數與結果列表
function renderSearchResults(results) {
    const searchResults = document.getElementById('search-results');
    // 清空先前搜尋結果
    searchResults.innerHTML = '';

    // 顯示搜尋結果筆數
    const countInfo = document.createElement('p');
    if (results.length < 1) {
        countInfo.textContent = '很抱歉，目前沒有找到相關的食譜。';
    } else {
        countInfo.textContent = keyword ? `搜尋結果：查詢到 ${results.length} 篇食譜` : `總共 ${results.length} 篇食譜`;
    }
    searchResults.appendChild(countInfo);

    // 沒有結果時，直接返回
    if (results.length === 0) return;
}

// 建立食譜卡片函式
function createRecipeCard(recipe) {
    // 建立食譜卡片
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    // 建立圖片元素
    const recipeImg = document.createElement('img');
    recipeImg.classList.add('recipe-img');
    // 當圖片載入失敗觸發 onerror 事件時，瀏覽器會自動呼叫這個函式(不加括號：事件觸發才執行)
    recipeImg.onerror = imgOnerror;
    // 檢查是否存在圖片
    if (recipe.recipe_image) {
        recipeImg.src = recipe.recipe_image;
    } else {
        recipeImg.src = '../img/image_Not_Found.png';
        recipeImg.classList.add('not-found-img');
    }
    recipeImg.alt = recipe.recipe_title;



    // 建立內容區塊
    const recipeText = document.createElement('div');
    recipeText.classList.add('recipe-text');

    // 建立連結區塊
    const recipeLink = document.createElement('a');
    recipeLink.classList.add('content');
    if (!category || category === "null") {
        // 當 category 為 null、undefined 或者字串 "null" 時
        recipeLink.href = `./recipe.html?id=${recipe.recipe_id}`;
    } else {
        // 當 category 有正常值時
        recipeLink.href = `./recipe.html?category=${category}&id=${recipe.recipe_id}`;
    }

    // 標題
    const recipeTitle = document.createElement('div');
    recipeTitle.classList.add('recipe-title');
    const recipeName = document.createElement('h2');
    recipeName.textContent = recipe.recipe_title;

    // 發布時間處理
    function formatDate(createdAt) {
        const now = new Date();                   // 現在時間
        const createdDate = new Date(createdAt);    // 建立時間轉 Date 物件
        const timeDiff = now - createdDate;         // 毫秒差

        const seconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // 小於一天：顯示「幾秒前」、「幾分鐘前」或「幾小時前」
        if (days < 1) {
            if (hours >= 1) {
                return `${hours} 小時前`;
            } else if (minutes >= 1) {
                return `${minutes} 分鐘前`;
            } else {
                return `${seconds} 秒前`;
            }
        }

        // 大於一天但小於七天：顯示「幾天前」
        if (days < 7) {
            return `${days} 天前`;
        }

        // 大於或等於八天：若當年度只顯示月日，否則顯示完整年月日
        const year = createdDate.getFullYear();
        const month = createdDate.getMonth() + 1;
        const day = createdDate.getDate();

        if (year === now.getFullYear()) {
            return `${month} 月 ${day} 日`;
        }
        return `${year} 年 ${month} 月 ${day} 日`;
    }
    // 時間
    const dateElement = document.createElement('span');
    dateElement.classList.add('date');
    dateElement.textContent = formatDate(recipe.created_at);

    // 將標題與時間加入到 recipeTitle 區塊
    recipeTitle.append(recipeName, dateElement);

    // 標籤
    const recipeTag = document.createElement('p');
    (recipe.tags || []).forEach(tag => {
        const spanTag = document.createElement('span');
        spanTag.classList.add('tag');
        spanTag.textContent = tag;
        recipeTag.append(spanTag);
    });

    // 簡介
    const recipeDesc = document.createElement('p');
    recipeDesc.classList.add('recipe-description');
    recipeDesc.textContent = recipe.recipe_description;

    // 食材（並用「,」隔開）
    const recipeIngredients = document.createElement('p');
    recipeIngredients.textContent = '主要食材：';
    recipe.ingredients.forEach((ingredient, index) => {
        const name = document.createElement('span');
        name.textContent = ingredient.name;
        if (index < recipe.ingredients.length - 1) {
            name.textContent += ', ';
        }
        recipeIngredients.append(name);
    });

    // 時間
    const recipeTime = document.createElement('p');
    recipeTime.textContent = '製作時間：' + recipe.recipe_cook_time + `${recipe.recipe_cook_time < 180 ? ' 分鐘' : ' 分鐘以上'}`;

    // 組合 連結區塊
    recipeLink.append(recipeTitle, recipeTag, recipeDesc, recipeIngredients, recipeTime);

    // 建立互動區塊(非使用者輸入數據)
    const recipeActions = document.createElement('div');
    recipeActions.classList.add('actions');

    const createLink = (text, href = '#') => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        return link;
    };

    // 評分連結
    const ratingLink = createLink(recipe.rating > 0 ? `評分：${recipe.rating} / 5 （${recipe.evaluate} 評價）` : '尚未有評價');
    // 作者連結
    const authorLink = createLink(`作者：${recipe.recipe_author}`);
    // 喜歡連結
    const likesLink = createLink(`喜歡：${recipe.likes}`);
    // 留言連結
    const commentLink = createLink(`留言：${recipe.comments}`);


    // 收藏按鈕
    const collectBtn = document.createElement('button');
    collectBtn.classList.add('bookmark-button');
    collectBtn.textContent = '收藏';
    collectBtn.addEventListener('click', () => {
        if (!loggedInUser) {
            alert('請先登入以收藏食譜！');
        } else {
            alert(`收藏成功！已收藏食譜：${recipe.recipe_title}`);
            // 在此加入收藏邏輯，例如儲存到收藏列表
        }
    });

    // 分享按鈕
    const shareBtn = document.createElement('button');
    shareBtn.classList.add('share-button');
    shareBtn.textContent = '分享';
    // 為分享按鈕添加點擊事件
    shareBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (isMobileDevice() && navigator.share) {
            // 如果是在行動裝置且支援原生分享功能，則使用 navigator.share
            navigator.share({
                title: document.title,
                text: "發現一份超美味、健康的素食食譜！快來試試這道美味吧！",
                url: window.location.href,
            })
                .then(() => console.log("分享成功")) // 成功分享後的回調
                .catch((error) => console.log("分享失敗:", error)); // 分享失敗時的錯誤回調
        } else {
            // 如果不是行動裝置，顯示自訂的分享選單
            const isMenuOpen = shareMenu.style.display === "flex";
            // 切換分享選單和遮罩的顯示狀態
            shareMenu.style.display = isMenuOpen ? "none" : "flex";
            overlay.style.display = isMenuOpen ? "none" : "block";
        }
    });

    // 刪除食譜按鈕
    const deleteBtn = document.createElement('button');
    // 判斷登入者是否為該食譜作者
    if (userId === recipe.user_id) {
        // 如果是作者，則顯示刪除按鈕
        deleteBtn.style.display = 'block';
    } else {
        // 如果不是作者，則隱藏刪除按鈕
        deleteBtn.style.display = 'none';
    }
    deleteBtn.classList.add('delete-button');
    deleteBtn.textContent = '刪除';
    // 使用刪除功能
    deleteBtn.addEventListener('click', () => {
        if (!allRecipesData.some(item => item.recipe_id === recipe.recipe_id)) {
            console.log(recipe.recipe_id)
            alert('找不到該食譜，無法刪除！');
            return;
        }
        // console.log(recipe.recipe_id)
        const confirmed = confirm(`確定要將食譜「${recipe.recipe_title}」移至垃圾桶？`);
        if (confirmed) {
            // 把食譜移到垃圾桶 (暫存處)
            // 從 localStorage 取出原有垃圾桶資料，若不存在便建立一個空陣列
            let trashData = JSON.parse(localStorage.getItem('trash')) || [];
            trashData.push(recipe);
            localStorage.setItem('trash', JSON.stringify(trashData));

            // 使用 filter 方法過濾掉指定的食譜，更新 allRecipesData
            // 遍歷 allRecipesData 陣列中的每個項目 (item)，保留 item.recipe_id 與 recipe.recipe_id 不相等的食譜，移除 recipe_id 與目標食譜 recipe_id 相同的項目，過濾後的結果回傳為一個新的陣列並賦值給 allRecipesData
            allRecipesData = allRecipesData.filter(item => item.recipe_id !== recipe.recipe_id);

            // 如果 localStorage 有存取食譜資料，則一併更新
            let localStorageRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            localStorageRecipes = localStorageRecipes.filter(item => item.recipe_id !== recipe.recipe_id);
            localStorage.setItem('recipes', JSON.stringify(localStorageRecipes));

            // 在刪除後顯示提示訊息
            showToast();
            renderRecipes(allRecipesData); // 重新渲染網頁上的食譜
        }
    });



    // 組合 互動區塊
    recipeActions.append(ratingLink, authorLink, likesLink, commentLink, collectBtn, shareBtn, deleteBtn);

    // 組合 連結區塊、互動區塊
    recipeText.append(recipeLink, recipeActions);
    // 組合卡片
    recipeCard.append(recipeImg, recipeText);
    return recipeCard;
}

// 建立推薦卡片函式
function createSuggestRecipeCard(recipe) {
    // 建立推薦卡片
    const suggestCard = document.createElement('div');
    suggestCard.classList.add('suggest-recipe-card');

    // 建立連結元素，並設定連結到詳細食譜頁
    const link = document.createElement('a');
    link.href = `./recipe.html?category=${category}&id=${recipe.recipe_id}`;

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

    // 建立標題 (h3) 元素
    const title = document.createElement('h3');
    title.textContent = recipe.recipe_title;

    // 建立標籤區塊
    const tagBox = document.createElement('div');
    tagBox.classList.add('tags');
    // 遍歷每個標籤，並建立 <span>
    (recipe.tags || []).forEach((tag) => {
        const suggestTag = document.createElement('span');
        suggestTag.textContent = tag;
        tagBox.append(suggestTag);
    });

    // 建立描述 (p) 元素
    const description = document.createElement('p');
    description.textContent = recipe.recipe_description;

    // 將圖、標題、標籤與描述加入連結元素中
    link.append(img, title, tagBox, description);

    // 建立動作按鈕區塊
    const actionsBox = document.createElement('div');
    actionsBox.classList.add('actions');

    // 建立顯示評分的連結文字
    const actionsLink = document.createElement('a');
    actionsLink.textContent = recipe.rating > 0 ? `評分：${recipe.rating} / 5（${recipe.evaluate} 評價）` : '尚未有評價';

    // 建立按鈕容器
    const actionsBtn = document.createElement('div');

    // 建立收藏按鈕
    const collectBtn = document.createElement('button');
    collectBtn.textContent = '收藏';
    collectBtn.addEventListener('click', () => {
        if (!loggedInUser) {
            alert('請先登入以收藏食譜！');
        } else {
            alert(`收藏成功！已收藏食譜：${recipe.recipe_title}`);
            // 在此加入收藏邏輯，例如儲存到收藏列表
        }
    });

    // 建立分享按鈕
    const shareBtn = document.createElement('button');
    shareBtn.textContent = '分享';
    shareBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (isMobileDevice() && navigator.share) {
            // 如果是在行動裝置且支援原生分享功能，則使用 navigator.share
            navigator.share({
                title: document.title,
                text: "發現一份超美味、健康的素食食譜！快來試試這道美味吧！",
                url: window.location.href,
            })
                .then(() => console.log("分享成功")) // 成功分享後的回調
                .catch((error) => console.log("分享失敗:", error)); // 分享失敗時的錯誤回調
        } else {
            // 如果不是行動裝置，顯示自訂的分享選單
            const isMenuOpen = shareMenu.style.display === "flex";
            // 切換分享選單和遮罩的顯示狀態
            shareMenu.style.display = isMenuOpen ? "none" : "flex";
            overlay.style.display = isMenuOpen ? "none" : "block";
        }
    });

    // 將集合按鈕放入按鈕容器中
    actionsBtn.append(collectBtn, shareBtn);

    // 將評分連結和按鈕容器加入按鈕區塊中
    actionsBox.append(actionsLink, actionsBtn);

    // 將連結元素與按鈕區塊加入整個 suggestCard
    suggestCard.append(link, actionsBox);
    return suggestCard;
}


// 食譜排序
// 根據日期：取最新日期在前（遞減排序）
function sortByDate(data) {
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 根據熱門程度：熱門在前（由大到小排序）
function sortByLikes(data) {
    return data.sort((a, b) => b.likes - a.likes);
}

// 根據烹飪時間：較短時間在前（遞增排序）
function sortByCookTime(data) {
    return data.sort((a, b) => a.recipe_cook_time - b.recipe_cook_time);
}

// 根據評價：高評價在前（由大到小排序）
function sortByRating(data) {
    return data.sort((a, b) => b.rating - a.rating);
}

// 根據傳入的排序條件來決定使用哪種排序方式
function sortRecipes(data, criteria) {
    switch (criteria) {
        case 'date':
            return sortByDate(data);
        case 'popular':
            return sortByLikes(data);
        case 'time':
            return sortByCookTime(data);
        case 'rating':
            return sortByRating(data);
        default:
            // 預設使用日期排序
            return sortByDate(data);
    }
}

// 初始化排序參數
// let sortCriteria = '';
function initialSortData(recipesData) {
    // 取得排序選單 DOM 元素
    const sortSelect = document.getElementById('sort-options');
    // 如果 URL 中有排序參數，否則預設 'date'
    const sortCriteria = urlParams.get('sort') || 'date';
    // 設定全局排序條件
    sort = sortCriteria;
    // 更新下拉選單選項
    sortSelect.value = sortCriteria;
    // 更新 URL 中的排序參數
    urlParams.set('sort', sortCriteria);
    window.history.replaceState(null, '', '?' + urlParams.toString());

    // 當選單選項改變時
    sortSelect.addEventListener('change', (event) => {
        // 根據選取值更新排序條件，沒有則預設為 'date'
        // 更新排序條件
        sort = event.target.value || 'date';
        // 更新 URL 中的排序參數
        urlParams.set('sort', sortCriteria);
        window.history.replaceState(null, '', '?' + urlParams.toString());
        // 重新渲染食譜：先清空原有的 DOM，再以最新的排序條件呼叫 renderRecipes
        renderRecipes(allRecipesData);
    });
}

// 當圖片載入失敗時，改用預設圖片，並透過狀態檢查避免無限迴圈（這裡利用 class 標記）
function imgOnerror() {
    if (!this.classList.contains('not-found-img')) {
        this.src = '../img/image_Not_Found.png';
        this.classList.add('not-found-img');
    }
}

// 燈箱
function lightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const recipeImgs = document.querySelectorAll('.recipe-img');

    // 當點擊任一食譜圖片時
    recipeImgs.forEach(img => {
        img.addEventListener('click', function () {
            // 將燈箱圖片的 src 改為點擊的圖片來源
            lightboxImg.src = this.src;
            // 先設定 display 為 flex 讓燈箱出現
            lightbox.style.display = 'flex';
            // 使用 setTimeout 確保 display 更新後再啟動淡入效果
            setTimeout(() => {
                lightbox.style.opacity = 1;
            }, 50);
        });
    });

    // 當點擊燈箱（背景）時進行關閉操作
    lightbox.addEventListener('click', () => {
        // 開始淡出效果
        lightbox.style.opacity = 0;
    });

    // 當過渡動畫完成時，若 opacity 為 0 則隱藏燈箱
    lightbox.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && lightbox.style.opacity === '0') {
            lightbox.style.display = 'none';
        }
    });
}

// 判斷是否為行動裝置
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

// 為每個分享平台按鈕添加點擊事件
document.querySelectorAll(".shareBtn[data-platform]").forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const platform = button.getAttribute("data-platform"); // 取得分享平台
        const currentUrl = encodeURIComponent(window.location.href); // 編碼目前的 URL
        let shareUrl = "";

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}`;
                break;
            case "line":
                shareUrl = `https://social-plugins.line.me/lineit/share?url=${currentUrl}`;
                break;
        }

        // 在新窗口中打開分享 URL
        window.open(shareUrl, "_blank");
        // 點擊後關閉分享選單和遮罩
        shareMenu.style.display = "none";
        overlay.style.display = "none";
    });
});

// 為「複製網址」按鈕添加事件
document.getElementById("copyUrlBtn").addEventListener("click", () => {
    // 使用 Clipboard API 複製 URL 到剪貼簿
    navigator.clipboard.writeText(window.location.href)
        .then(() => alert("網址已複製到剪貼簿！"))
        .catch((err) => alert("複製失敗: " + err));
});

// 點擊遮罩時關閉分享選單和遮罩
const shareMenu = document.getElementById("shareMenu");
const overlay = document.getElementById("overlay");
overlay.addEventListener("click", (e) => {
    // 僅當點擊遮罩本身時觸發
    if (e.target === overlay) {
        shareMenu.style.display = "none";
        overlay.style.display = "none";
    }
});

// 提示訊息
function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 6000);
}

document.addEventListener('DOMContentLoaded', async () => {
    // 初始頁籤
    createbreadCrumb();
    // 初始化排序選單及事件
    initialSortData();
    // 取得食譜數據並記錄到全局變數
    allRecipesData = await getRecipesData();
    // 初次渲染
    renderRecipes(allRecipesData);
})


document.addEventListener('DOMContentLoaded', () => {
    carouselCard();

    // input 高度自適應
    const textarea = document.getElementById('feedback');
    textarea.addEventListener('input', () => {
        // 重置高度，以便準確計算捲動高度
        textarea.style.height = 'auto';
        // 設置高度為內容的捲動高度
        textarea.style.height = `${textarea.scrollHeight}px`;
    });
});