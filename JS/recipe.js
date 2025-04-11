// input 高度自適應
const textarea = document.getElementById('comment-input');

textarea.addEventListener('input', () => {
    // 重置高度，以便準確計算捲動高度
    textarea.style.height = 'auto';
    // 設置高度為內容的捲動高度
    textarea.style.height = `${textarea.scrollHeight}px`;
});

// 卡片滑動
function carouselCard() {
    const carousel = document.querySelector(".related-carousel");
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

// 動態建立食譜與使用者
let allRecipesData = []; // 全局變數，用來暫存所有食譜資料

const loggedInUser = localStorage.getItem('loggedInUser'); // 讀取當前登入的使用者
const userId = loggedInUser ? JSON.parse(loggedInUser).user_id : null;

const urlParams = new URLSearchParams(window.location.search); // 解析 URL 中的查詢參數
const category = urlParams.get('category'); // 再次取得 category

// 從 URL 取得所需的 recipe id
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
const recipeId = getQueryParam('id');

// 取得食譜數據（從 JSON 檔案）與 localStorage 中的食譜數據
function getRecipesData() {
    // 從 localStorage 取得用戶新增的數據
    const storedData = localStorage.getItem('recipes');
    const storedRecipes = storedData ? JSON.parse(storedData) : [];

    // 透過 fetch 取得預設數據
    return fetch('https://simon-ke.github.io/VeggieRecipesHub/data/recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(defaultRecipes => {
            // 合併預設數據與 localStorage 數據
            return [...defaultRecipes, ...storedRecipes];
        });
}

// 取得使用者數據（從 JSON 檔案）與 localStorage 中的使用者數據
function getUserData() {
    // 從 localStorage 取得用戶相關數據
    const storedData = localStorage.getItem('users');
    const storedUser = storedData ? JSON.parse(storedData) : [];

    // 透過 fetch 取得預設使用者數據
    return fetch('https://simon-ke.github.io/VeggieRecipesHub/data/users.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(defaultUser => {
            // 合併預設數據與 localStorage 數據
            return [...defaultUser, ...storedUser];
        });
}

async function init() {
    try {
        // 取得數據
        allRecipesData = await getRecipesData();
        // 根據網址參數 id 找到對應的一筆數據
        // find 方法 只會回傳第一個符合條件的元素，一旦找到第一個符合條件的元素後 find 就會立即停止搜尋，如果找不到符合的元素則回傳 undefined。
        // filter 方法 回傳所有符合條件的元素
        // 在 allRecipesData 陣列中尋找 recipe_id 等於 recipeId 的物件 
        const recipe = allRecipesData.find(recipe => String(recipe.recipe_id) === String(recipeId));
        if (!recipe) {
            console.error(`找不到 recipe_id 等於 ${recipeId} 的食譜`);
            return;
        }
        // 建立食譜內容
        renderRecipesData(recipe);
        renderRelatedRecipe(allRecipesData);

        // 在 recipe 物件中獲取 user_id
        const recipeUserId = recipe.user_id;
        const userData = await getUserData();
        // 在 userData 陣列中尋找 user_id 等於 recipeUserId 的物件
        const user = userData.find(user => String(user.user_id) === String(recipeUserId));
        if (!user) {
            console.error(`找不到 user_id 等於 recipe.user_id 的使用者資料`);
            document.querySelector('.user-info').innerHTML = '<p>找不到對應的使用者數據</p>';
            return;
        } else {
            // 建立使用者內容
            renderUserData(user, recipe);
        }
    } catch (error) {
        console.error('初始化錯誤：', error);
    }
}

// 動態生成食譜的 HTML 函式
function renderRecipesData(recipesData) {
    // 動態變更頁籤內容
    if (!category || category === "null") {
        // 當 category 為 null、undefined 或者字串 "null" 時
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = `
                    <a href="../index.html">首頁</a>
                    >
                    <a href="#">${recipesData.recipe_title}</a>
                `;
    } else {
        // 當 category 有正常值時
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = `
                    <a href="../index.html">首頁</a>
                    >
                    <a href="#">${category}</a>
                    >
                    <a href="#">${recipesData.recipe_title}</a>
                `;
    }

    // ── 食譜介紹 ──
    // 左測圖片區塊
    const recipeImg = document.getElementById('left-section');
    recipeImg.onerror = imgOnerror;
    // 檢查是否存在圖片，若無則顯示預設圖片
    if (recipesData.recipe_image) {
        recipeImg.src = recipesData.recipe_image;
    } else {
        recipeImg.src = '../img/image_Not_Found.png';
        recipeImg.classList.add('not-found-img');
    }
    recipeImg.alt = recipesData.recipe_title;

    // 右區塊
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
    // 1. 時間
    const dateElement = document.querySelector('.recipe-date');
    dateElement.textContent = formatDate(recipesData.created_at);

    // 2. 標題
    const titleElement = document.querySelector('.recipe-name');
    titleElement.textContent = recipesData.recipe_title;

    // 3. 評價（包含數字與星級圖示）
    function generateStars(rating) {
        const fullStars = Math.floor(rating);          // 完整星數
        const halfStar = (rating % 1 > 1) ? 1 : 0;     // 半星
        const emptyStars = 5 - fullStars - halfStar;
        return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    }
    const stars = document.createElement('span');
    stars.textContent = generateStars(recipesData.rating);

    const ratingElement = document.querySelector('.rating');
    // 無評價處理
    if (Number(recipesData.rating) > 0) {
        ratingElement.append(recipesData.rating, ' / 5', stars, `（${recipesData.evaluate} 評價）`);
    } else {
        ratingElement.textContent = '尚未有評價';
    }

    // 4. 標籤
    const recipeTagElement = document.querySelector('.recipe-tag');
    if (recipesData.tags) {
        recipesData.tags.forEach(tagText => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = tagText;
            recipeTagElement.append(tag);
        });
    }

    // 5. 介紹
    const descriptionElement = document.querySelector('.recipe-description');
    descriptionElement.textContent = recipesData.recipe_description;

    // 6. 喜歡數
    const likeButton = document.querySelector('.like-button');
    // childNodes 包含了所有類型節點，數字在第二個節點（索引 1）
    likeButton.childNodes[1].nodeValue = recipesData.likes;

    // 7. 留言
    const commentButton = document.querySelector('.comment-button');
    commentButton.childNodes[1].nodeValue = recipesData.comments;

    // 8. 收藏
    const bookmarkButton = document.querySelector('.bookmark-button');
    bookmarkButton.addEventListener('click', () => {
        if (!loggedInUser) {
            alert('請先登入以收藏食譜！');
        } else {
            alert(`收藏成功！已收藏食譜：${recipesData.recipe_title}`);
            // 在此加入收藏邏輯，例如儲存到收藏列表
        }
    });

    // 9. 分享
    const shareBtn = document.querySelector('.share-button');
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

    // ── 食譜資訊 ──

    // 份量與烹調時間
    const portionElement = document.getElementById('portion');
    portionElement.textContent = recipesData.recipe_portion + `${recipesData.recipe_portion < 10 ? ' 人份' : ' 人份以上'}`;
    const timeElement = document.getElementById('time');
    timeElement.textContent = recipesData.recipe_cook_time + `${recipesData.recipe_cook_time < 180 ? ' 分鐘' : ' 分鐘以上'}`;

    // 食材
    const ingredientTable = document.getElementById('ingredient_table');
    recipesData.ingredients.forEach(ingredient => {
        const row = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = ingredient.name;
        const amountTd = document.createElement('td');
        amountTd.textContent = ingredient.value;
        row.append(nameTd, amountTd);
        ingredientTable.append(row);
    });

    // 調味料
    const seasoningTable = document.getElementById('seasoning_table');
    recipesData.seasonings.forEach(seasoning => {
        const row = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = seasoning.name;
        const amountTd = document.createElement('td');
        amountTd.textContent = seasoning.value;
        row.append(nameTd, amountTd);
        seasoningTable.append(row);
    });

    // 營養成分
    const nutritionTable = document.getElementById('nutrition_table');
    recipesData.nutritions.forEach(nutrition => {
        const row = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = nutrition.name;
        const valueTd = document.createElement('td');
        valueTd.textContent = nutrition.value;
        row.append(nameTd, valueTd);
        nutritionTable.append(row);
    });

    // ── 烹調步驟 ──
    const stepCardContainer = document.getElementById('step_card');
    recipesData.steps.forEach((step, index) => {
        const stepCard = document.createElement('div');
        stepCard.className = 'recipe-step';

        // 步驟圖片
        const stepImg = document.createElement('img');
        if (step.image) {
            stepImg.src = step.image;
        } else {
            stepImg.className = 'not-found-img';
            stepImg.src = '../img/image_Not_Found.png';
        }

        stepImg.alt = `步驟 ${index + 1}`;

        // 步驟文字內容
        const stepContent = document.createElement('div');
        const stepTitle = document.createElement('h2');
        stepTitle.textContent = index + 1;
        const stepText = document.createElement('p');
        stepText.textContent = step.description;

        stepContent.append(stepTitle, stepText);
        stepCard.append(stepImg, stepContent);
        stepCardContainer.append(stepCard);
    });
}

// 動態生成相關食譜的 HTML 函式
function renderRelatedRecipe(recipesData) {
    // ── 相關食譜推薦 ──
    // 取得容器【.related-carousel】
    const relatedCarousel = document.querySelector('.related-carousel');
    // 印出每筆 recipesData 資料
    recipesData.forEach(recipe => {
        // 建立一個新的 relatedCard 區塊
        const relatedCard = document.createElement('div');
        relatedCard.classList.add('related-recipe-card');

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
        recipe.tags.forEach((tag) => {
            const relatedTag = document.createElement('span');
            relatedTag.textContent = tag;
            tagBox.append(relatedTag);
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

        // 建立收藏按鈕，並綁定點擊事件
        const bookmarkButton = document.createElement('button');
        bookmarkButton.textContent = '收藏';
        bookmarkButton.addEventListener('click', () => {
            if (!loggedInUser) {
                alert('請先登入以收藏食譜！');
            } else {
                alert(`收藏成功！已收藏食譜：${recipe.recipe_title}`);
                // 在此加入收藏邏輯，例如儲存到收藏列表
            }
        });
        // 建立分享按鈕，並使用 addEventListener 綁定點擊事件
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
        actionsBtn.append(bookmarkButton, shareBtn);

        // 將評分連結和按鈕容器加入按鈕區塊中
        actionsBox.append(actionsLink, actionsBtn);

        // 將連結元素與按鈕區塊加入整個 relatedCard
        relatedCard.append(link, actionsBox);

        // 將該 relatedCard 加入到 relatedCarousel 中
        relatedCarousel.append(relatedCard);
    });
}

// 動態生成使用者的 HTML 函式
function renderUserData(userData, recipe) {
    const userSection = document.querySelector('.user-link');

    const userAvatar = document.createElement('img');
    userAvatar.classList.add('user-avatar');
    userAvatar.src = userData.user_avatar || 'https://simon-ke.github.io/VeggieRecipesHub/img/User/user_Avatar.png';
    userAvatar.alt = userData.user_name || '使用者';

    const userName = document.createElement('p');
    userName.classList.add('user-name');
    userName.textContent = userData.user_name || '使用者';

    const totalRecipes = document.createElement('p');
    totalRecipes.textContent = `${userData.total_recipes || 0}篇食譜`;

    const fansCount = document.createElement('p');
    fansCount.textContent = `${userData.fans_count || 0}粉絲`;

    // 刪除食譜按鈕
    const deleteBtn = document.querySelector('.delete-button');
    if (userId === recipe.user_id) {
        deleteBtn.style.display = 'block';
    }
    // 使用刪除功能
    deleteBtn.addEventListener('click', () => {
        const confirmed = confirm(`確定要將食譜「${recipe.recipe_title}」移至垃圾桶？`);
        if (confirmed) {
            // 1. 把食譜移到垃圾桶 (暫存處)
            // 從 localStorage 取出原有垃圾桶資料，若不存在便建立一個空陣列
            let trashData = JSON.parse(localStorage.getItem('trash')) || [];
            trashData.push(recipe);
            localStorage.setItem('trash', JSON.stringify(trashData));

            // 2. 更新 allRecipesData：過濾掉要刪除的食譜
            allRecipesData = allRecipesData.filter(item => item.recipe_id !== recipe.recipe_id);

            // 3. 更新主食譜在 localStorage 中的資料 (存於 'recipes' key)
            let localStorageRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            localStorageRecipes = localStorageRecipes.filter(item => item.recipe_id !== recipe.recipe_id);
            localStorage.setItem('recipes', JSON.stringify(localStorageRecipes));

            alert('已成功將食譜移至垃圾桶！');

            if (!category || category === "null") {
                // 當 category 為 null、undefined 或者字串 "null" 時
                window.location.href = './recipeSelector.html';
            } else {
                // 當 category 有正常值時
                window.location.href = `./recipeSelector.html?category=${category}`;
            }
        }
    });
    // 將使用者資料組合至 userSection
    userSection.append(userAvatar, userName, totalRecipes, fansCount);
}

// 為 img 元素綁定錯誤處理。
function imgOnerror() {
    if (!this.classList.contains('not-found-img')) {
        this.src = '../img/image_Not_Found.png';
        this.classList.add('not-found-img');
    }
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


document.addEventListener("DOMContentLoaded", () => {
    carouselCard();
    init();
});

