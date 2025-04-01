// 取得預設數據（從 JSON 檔案）與 localStorage 中的數據
async function getRecipesData() {
    try {
        // 透過 fetch 取得預設數據
        const response = await fetch("./data/recipes.json");
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

    // 初始化兩組不同的卡片輪播效果
    nextButton.addEventListener("click", showNext);
    prevButton.addEventListener("click", showPrev);

    updateCards();
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
});














// 定義函數，用來根據條件切換某個元素的 class
function toggleClassOnScroll(element, className, condition) {
    if (condition) {
        element.classList.add(className);  // 當條件為 true 時，加入指定的 class
    } else {
        element.classList.remove(className);  // 當條件為 false 時，移除指定的 class
    }
}

// 操作的 DOM 元素
const nav = document.querySelector('.nav-container');
const searchContainer = document.querySelector('.recipe-actions');
const backToTopButton = document.getElementById('back-to-top');
const dropDown = document.getElementById('dropdown');

/*
 * 更新介面函數
 * 說明：
 * - 根據視窗寬度（小於 768px 與大於等於 768px）設定不同的固定導覽列行為
 * - 根據滾動位置切換 "back-to-top" 按鈕與下拉選單的狀態
 * - 當滾動位置過低時，移除漢堡選單、主選單、其他選單及遮罩的 active 狀態
 */
function updateInterface() {
    // 使用 requestAnimationFrame 在瀏覽器準備重繪畫面前呼叫特定的回調函數，讓更新動作剛好和畫面刷新結合，使動畫與介面更新效果更流暢。並根據瀏覽器的刷新率來執行回調，如果使用者瀏覽器處於非可見狀態（例如標籤頁切換到背景），瀏覽器會自動降低或暫停回調執行，這樣可以降低 CPU 負擔。
    requestAnimationFrame(() => {
        // 當視窗寬度小於 768px 時：導覽列及食譜操作區塊始終固定（條件：scrollY >= 0）
        if (window.innerWidth < 768) {
            toggleClassOnScroll(nav, 'fixed-nav', window.scrollY >= 0);
            toggleClassOnScroll(searchContainer, 'fixed-recipe-actions', window.scrollY >= 0);
        } else {
            // 當視窗寬度大於等於 768px 時：僅在滾動超過 200px 後才固定導覽列與操作區塊
            toggleClassOnScroll(nav, 'fixed-nav', window.scrollY > 200);
            toggleClassOnScroll(searchContainer, 'fixed-recipe-actions', window.scrollY > 200);
        }
        // 根據文件滾動的狀態來切換 "back-to-top" 按鈕的顯示狀態
        toggleClassOnScroll(backToTopButton, 'show', document.documentElement.scrollTop > 500);
        // 根據滾動位置來切換下拉選單 (例如，當滾動位置小於 200px 時加入 'dropdown' class)
        toggleClassOnScroll(dropDown, 'dropdown', window.scrollY < 200);
    });

    // 當頁面滾動位置很靠上（低於 200px）時，移除部分元素的 active 狀態
    if (window.scrollY < 200 && window.innerWidth >= 768) {
        hamburger.classList.remove('active');
        mainMenu.classList.remove('active');
        combintMenu.classList.remove('active');
        openBackground.classList.remove('active');
        // 移除所有 submenu 的 active 狀態
        submenu.forEach(el => el.classList.remove('active'));
        // 移除所有 liActive 元素的 active 狀態
        liActive.forEach(el => el.classList.remove('active'));
    }
}

// 綁定滾動事件：每當頁面滾動時都呼叫 updateInterface() 更新介面
window.addEventListener('scroll', updateInterface);

// 綁定視窗調整大小事件：使用戶變更瀏覽器大小時，同樣呼叫 updateInterface()
// 可確保介面根據最新視窗尺寸即時更新樣式與行為
window.addEventListener('resize', updateInterface);

// 當按下該按鈕時，平滑捲回頁面頂部
backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// 登入註冊處理
// 取得模態框及表單元素
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const trashModal = document.getElementById('trash-modal');
// 開啟與關閉 Modal 的函式
function openModal(modal) {
    modal.style.display = 'block';
}
function closeModal(modal) {
    modal.style.display = 'none';
}

let storageUsers = []; // 初始化數據
let existingUsers = []; // 初始化合併後的使用者數據
async function initializeUsers() {
    // 將 users 的數據重置為一個空陣列。
    // localStorage.setItem('users', JSON.stringify([]));
    try {
        const response = await fetch('./data/users.json');
        if (!response.ok) {
            throw new Error(`讀取 JSON 檔案失敗，狀態碼：${response.status}`);
        }
        // 存放 預設JSON 使用者數據
        const defaultUser = await response.json();
        // 存放 localStorage 中的使用者數據
        storageUsers = JSON.parse(localStorage.getItem('users') || '[]');
        // 合併 JSON 檔案和 LocalStorage 的數據
        existingUsers = [...defaultUser, ...storageUsers];
        return existingUsers;
    } catch (error) {
        console.error("合併 JSON 與 localStorage 數據時發生錯誤：", error);
        return [];
    }
}

try {
    // 登入表單提交事件
    document.getElementById('login-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const matchedUser = existingUsers.find(user => user.email === email && user.password === password);
        if (matchedUser) {
            const loggedInUser = {
                user_id: matchedUser.user_id,
                user_name: matchedUser.user_name,
            };
            alert('登入成功！');
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            closeModal(loginModal);
            // 更新頁面上顯示使用者狀態，例如顯示使用者名稱或改變導覽列內容
            updateLoginStatus();
            location.reload();
        } else {
            alert('使用者名稱或密碼錯誤！');
        }
    });

    // 即時驗證註冊 Email 格式並顯示提示
    emailVerify();

    // 註冊表單提交事件
    document.getElementById('register-form').addEventListener('submit', (event) => {
        event.preventDefault();
        // 自動生成 user_id 編號：根據現有數據中最大的 id 遞增 1，若無資料則預設為 1
        const userId = existingUsers.length > 0 ? Math.max(...existingUsers.map(user => user.user_id || 0)) + 1 : 1;
        // 使用者建立時間
        const createdAt = getFormattedLocalDateTime();

        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // 檢查是否已有相同的 email
        if (existingUsers.find(user => user.email === email)) {
            alert('該電子郵件已被註冊！');
        }
        if (password !== confirmPassword) {
            alert('密碼與確認密碼不一致！');
            return;
        }

        const userData = {
            user_id: userId.toString(),
            created_at: createdAt,
            updated_at: "",
            user_name: username,
            user_avatar: "",
            email: email,
            password: password,
            total_recipes: "0",
            fans_count: "0"
        }

        storageUsers.push(userData);
        localStorage.setItem('users', JSON.stringify(storageUsers));
        alert('註冊成功！請登入。');
        closeModal(registerModal);
        location.reload();
    });
} catch (error) {
    console.error('讀取使用者數據失敗:', error);
}

// 即時驗證註冊 Email 格式並顯示提示
function emailVerify() {
    const emailInput = document.getElementById('reg-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailInput.addEventListener('input', function () {
        const errorMessage = document.getElementById('email-error');
        if (!emailRegex.test(emailInput.value)) {
            errorMessage.textContent = '無效的電子郵件地址';
            return;
        } else {
            errorMessage.textContent = '';
        }
    });
}
// 時間函數：取得格式化的當地時間 (ISO 8601 格式，包含時區資訊)
function getFormattedLocalDateTime() {
    const pad = num => num.toString().padStart(2, '0');
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const offset = -now.getTimezoneOffset(); // 單位：分鐘
    const sign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

// 切換 Modal 的事件，直接綁定到 member-menu 區塊內的對應按鈕
function handleRegisterOpen(e) {
    e.preventDefault(); // 防止預設行為
    closeModal(loginModal); // 關閉登入模態框（若開啟中）
    openModal(registerModal); // 打開註冊模態框
}
document.querySelectorAll('.login-register').forEach(btn => { btn.addEventListener('click', handleRegisterOpen); });
document.getElementById('show-register').addEventListener('click', handleRegisterOpen)
document.getElementById('show-login').addEventListener('click', function (e) {
    e.preventDefault(); // 防止預設行為
    closeModal(registerModal); // 關閉註冊模態框（若開啟中）
    openModal(loginModal); // 打開登入模態框
});

// modal 關閉按鈕事件
document.querySelectorAll('.modal .close-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        closeModal(this.closest('.modal'));
    });
});

// 點擊 modal 之外區域關閉 modal
window.addEventListener('click', function (e) {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
    if (e.target === trashModal) closeModal(trashModal);
});

// 示範：更新頁面上登入狀態（例如：更新導覽列）
function updateLoginStatus() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const statusEl = document.querySelectorAll('.login-status');
    const loginOut = document.querySelectorAll('.login-out');
    const LoginRegister = document.querySelectorAll('.login-register');
    const userState = document.querySelectorAll('.user-state');
    if (loggedInUser) {
        statusEl.forEach(el => el.textContent = `歡迎，${loggedInUser.user_name}`); // 隱藏登入狀態
        loginOut.forEach(el => {
            el.style.display = 'block';
            el.textContent = '登出';
        });
        userState.forEach(el => el.textContent = '個人資訊');
        // userState.textContent = '個人資訊';
        getTrashText(loggedInUser);
        LoginRegister.forEach(el => {
            el.removeEventListener('click', handleRegisterOpen);
            el.addEventListener('click', () => {
                localStorage.setItem('openModal', true); // 保存狀態到 localStorage
                location.reload(); // 重整頁面
            });
        });
        // LoginRegister.removeEventListener('click', handleRegisterOpen);
        // LoginRegister.addEventListener('click', () => {
        //     localStorage.setItem('openModal', true); // 保存狀態到 localStorage
        //     location.reload(); // 重整頁面
        // });
        window.addEventListener('load', () => {
            const shouldOpenModal = localStorage.getItem('openModal'); // 取出保存的狀態
            if (shouldOpenModal) {
                localStorage.removeItem('openModal'); // 用完後清除狀態，避免多次執行
                openModal(trashModal); // 執行 modal 打開邏輯
            }
        });
        // 登出
        loginOut.forEach(el => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                // 清除登入狀態
                localStorage.removeItem('loggedInUser');
                alert('已成功登出！');
                // 更新登入狀態顯示
                updateLoginStatus();
                window.location.replace('/index.html'); // 登出後跳轉首頁，並移除當前頁面的歷史紀錄
            });
        });
    } else {
        loginOut.forEach(el => el.style.display = 'none'); // 隱藏登出按鈕
        statusEl.forEach(el => el.textContent = '未登入'); // 隱藏登入狀態
        // 未登入無法進入食譜發布頁面
        document.querySelector('.upload-button').addEventListener('click', (event) => {
            event.preventDefault();
            alert('您尚未登入！');
            openModal(loginModal);
        });
    }
}


// 綁定搜尋按鈕的點擊事件
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
searchBtn.addEventListener('click', (event) => {
    event.preventDefault(); // 阻止表單的預設提交行為
    const keyword = searchInput.value; // 取得搜尋框中的關鍵字
    // 獲取當前頁面的網址參數
    const urlParams = new URLSearchParams(window.location.search) || '';
    if (keyword) {
        // 將搜尋關鍵字加入到網址的 search 參數中
        urlParams.set('search', keyword);
    }
    updateUrlAndReload(urlParams); // 更新網址並重新載入頁面
});
// 初始化搜尋輸入框：設定預設值和清除按鈕事件
function initSearchInput() {
    const urlParams = new URLSearchParams(window.location.search);
    const keywordValue = urlParams.get('search'); // 獲取 URL 中的 search 參數值
    if (keywordValue) {
        // 將搜尋參數值填入搜尋框中，顯示當前的搜尋關鍵字
        searchInput.value = keywordValue;

        // 顯示清除按鈕並綁定清除事件
        const clearButton = document.getElementById('clear-btn');
        clearButton.classList.add('show'); // 設定清除按鈕為可見
        clearButton.addEventListener('click', clearSearchHandler, { once: true }); // 使用 { once: true } 確保清除事件只會執行一次，避免多次綁定造成多餘的資源消耗
    }
}
// 清除搜尋的處理函式：重置搜尋框及網址參數
function clearSearchHandler() {
    const urlParams = new URLSearchParams(window.location.search);
    // 清空搜尋框中的文字輸入
    searchInput.value = '';
    // 從查詢參數中移除 'search' 參數
    urlParams.delete('search');
    // 更新網址並重新載入頁面以反映變更
    updateUrlAndReload(urlParams);
}
// 更新網址並重新載入頁面
function updateUrlAndReload(urlParams) {
    // 將查詢參數轉換為字串；若無參數則不附加 '?' 符號
    const queryString = urlParams.toString();
    const newUrl = window.location.origin + '/HTML/recipeSelector.html' + (queryString ? '?' + queryString : '');
    // 使用 history API 更新瀏覽器的網址
    window.history.replaceState(null, '', newUrl);
    // 重新載入頁面以更新內容
    location.reload();
}


// 印出垃圾桶數據
let trashData = [];
trashData = JSON.parse(localStorage.getItem('trash')) || [];
function getTrashText(loggedInUser) {
    // 尋找該使用者刪除的數據
    const userTrashData = trashData.filter(item => item.user_id === loggedInUser.user_id);

    // 垃圾桶區塊
    const trashContainer = document.getElementById('trash-recipes');
    trashContainer.innerHTML = ""; // 清空之前的垃圾桶項目

    if (userTrashData.length === 0) {
        // 當垃圾桶沒任何內容時，插入一條提示訊息
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = "目前垃圾桶中沒有任何食譜";
        emptyMessage.classList.add('empty-message'); // 可以在 CSS 做進一步樣式設置
        trashContainer.appendChild(emptyMessage);
    } else {
        // 使用 DocumentFragment 收集所有要新增的 DOM 元素
        const fragment = document.createDocumentFragment();

        userTrashData.forEach(item => {
            // 建立垃圾桶項目容器
            const trashItem = document.createElement('div');
            trashItem.classList.add('trash-item');
            trashItem.setAttribute('data-id', item.recipe_id);

            // 建立並設置食譜標題
            const itemTitle = document.createElement('span');
            itemTitle.classList.add('recipe-title');
            itemTitle.textContent = item.recipe_title;

            // 建立刪除按鈕
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '永久刪除';

            // 建立復原按鈕
            const restoreBtn = document.createElement('button');
            restoreBtn.classList.add('restore-btn');
            restoreBtn.textContent = '復原';

            // 將標題和按鈕新增到 trashItem 中
            trashItem.append(itemTitle, deleteBtn, restoreBtn);

            // 將 trashItem 加入 DocumentFragment 中
            fragment.appendChild(trashItem);

        });
        // 一次性將所有垃圾桶項目加入到目標容器中
        trashContainer.innerHTML += '<h2>垃圾桶</h2>';
        trashContainer.append(fragment);
    }
}

// 處復原理垃圾桶數據
function restoreRecipe(recipeID) {
    if (!recipeID) {
        alert('找不到該食譜，無法復原！');
        return;
    }
    if (confirm(`確定要將食譜復原？`)) {
        // 1. 從 localStorage 中取得垃圾桶資料並找出該筆被復原的食譜
        const recipeToRestore = trashData.find(item => item.recipe_id === recipeID);
        if (!recipeToRestore) {
            alert('找不到該食譜數據，無法復原！');
            return;
        }

        // 2. 從垃圾桶中移除該食譜
        trashData = trashData.filter(item => item.recipe_id !== recipeID);
        localStorage.setItem('trash', JSON.stringify(trashData));

        // 3. 將該食譜加入主食譜資料
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        recipes.push(recipeToRestore);
        localStorage.setItem('recipes', JSON.stringify(recipes));

        alert(`食譜「${recipeToRestore.recipe_title}」已復原！`);
        // 刷新頁面反映最新資料
        window.location.reload();
    }
}
// 處理永久刪除數據
function deleteRecipe(recipeID) {
    if (!recipeID) {
        alert('找不到該食譜，無法刪除！');
        return;
    }
    if (confirm(`確定要將食譜永久刪除？刪除後即無法復原！`)) {
        // 1. 從 localStorage 中取得垃圾桶資料並找出該筆要永久刪除的食譜
        const recipeToDelete = trashData.find(item => item.recipe_id === recipeID);
        if (!recipeToDelete) {
            alert('找不到該食譜數據，無法刪除！');
            return;
        }
        // 2. 更新垃圾桶資料，過濾掉已刪除的食譜
        trashData = trashData.filter(item => item.recipe_id !== recipeID);
        localStorage.setItem('trash', JSON.stringify(trashData));

        alert(`食譜「${recipeToDelete.recipe_title}」已刪除！`);
        // 刷新頁面反映最新資料
        window.location.reload();
    }
}

// 為垃圾桶內容區添加一個點擊事件監聽器，利用事件監聽管理所有復原按鈕的點擊事件
document.getElementById('trash-recipes').addEventListener('click', function (event) {
    // 判斷觸發點擊事件的元素 (event.target) 是否存在以及是否帶有 'restore-btn' 這個 class，以確保只有點擊到復原按鈕時才執行以下程式碼
    if (event.target && event.target.classList.contains('restore-btn')) {
        // 使用 closest() 方法從點擊的按鈕向上查找最近的父元素，該元素應包含整個垃圾桶項目資訊，並帶有 'trash-item' 這個 class
        const trashItem = event.target.closest('.trash-item');
        // 從該垃圾桶項目元素的 data-id 屬性取得該食譜的唯一辨識 ID
        const recipeID = trashItem.getAttribute('data-id');
        // 呼叫已定義的復原函式 restoreRecipe，並傳入食譜的 ID，以便從垃圾桶中恢復這筆食譜
        restoreRecipe(recipeID);
    }
    // 處理永久刪除按鈕事件
    if (event.target && event.target.classList.contains('delete-btn')) {
        const trashItem = event.target.closest('.trash-item');
        const recipeID = trashItem.getAttribute('data-id');
        deleteRecipe(recipeID);
    }
});

// 漢堡選單
const hamburger = document.getElementById('hamburger-menu');
const mainMenu = document.querySelector('.main-menu'); // 主選單
const combintMenu = document.querySelector('.combint-menu'); // 小介面選單
const openBackground = document.querySelector('.combint-background')
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mainMenu.classList.toggle('active');
    combintMenu.classList.toggle('active');
    openBackground.classList.toggle('active');
    submenu.forEach(el => { el.classList.remove('active'); });
    liActive.forEach(el => { el.classList.remove('active') });
});

// 分類選單
const submenu = document.querySelectorAll('.submenu'); // 食譜分類
const liActive = document.querySelectorAll('.submenu-open'); // 食譜分類的下一個 li 元素
const recipeCategory = document.querySelectorAll('.recipe-category');
recipeCategory.forEach(element => {
    element.addEventListener('click', function (e) {
        e.preventDefault(); // 阻止預設的連結跳轉行為
        submenu.forEach(el => { el.classList.toggle('active') }); // 切換 submenu 的 "active" 狀態

        // 檢查是否至少一個 submenu 擁有 "active" class
        const hasActiveSubmenu = Array.from(submenu).some(el => el.classList.contains('active'));
        if (hasActiveSubmenu) {
            liActive.forEach(el => el.classList.add('active'));
        } else {
            liActive.forEach(el => el.classList.remove('active'));
        }
    });
});


// 在頁面載入時呼叫
document.addEventListener('DOMContentLoaded', () => {
    initializeUsers();
    updateLoginStatus();
    initSearchInput();
    updateInterface();
});
