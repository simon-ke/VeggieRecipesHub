// 觸發事件後 className 的新增與移除
function toggleClassOnScroll(element, className, condition) {
    if (condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}
// 當頁面滾動時觸發滾輪事件
window.onscroll = () => {
    const nav = document.querySelector('.nav-container');
    const searchContainer = document.querySelector('.recipe-actions');
    const backToTopButton = document.getElementById('back-to-top');
    // 固定導覽列
    requestAnimationFrame(() => {
        toggleClassOnScroll(nav, 'fixed-nav', window.scrollY > 200);
        toggleClassOnScroll(searchContainer, 'fixed-recipe-actions', window.scrollY > 200);
        toggleClassOnScroll(backToTopButton, 'show', document.documentElement.scrollTop > 500);
    });
    // 點擊圖片回到頂部
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};


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
        const response = await fetch('/小專題網頁/素食網站/users.json');
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
document.getElementById('login-register').addEventListener('click', handleRegisterOpen)
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
    const statusEl = document.getElementById('login-status');
    const loginOut = document.getElementById('login-out');
    const LoginRegister = document.getElementById('login-register');
    const userState = document.getElementById('user-state');
    if (loggedInUser) {
        statusEl.textContent = `歡迎，${loggedInUser.user_name}`;
        loginOut.style.display = 'block';
        loginOut.textContent = '登出'
        userState.textContent = '個人資訊';
        getTrashText(loggedInUser);
        LoginRegister.removeEventListener('click', handleRegisterOpen);
        LoginRegister.addEventListener('click', () => {
            localStorage.setItem('openModal', true); // 保存狀態到 localStorage
            location.reload(); // 重整頁面
        });
        window.addEventListener('load', () => {
            const shouldOpenModal = localStorage.getItem('openModal'); // 取出保存的狀態
            if (shouldOpenModal) {
                localStorage.removeItem('openModal'); // 用完後清除狀態，避免多次執行
                openModal(trashModal); // 執行 modal 打開邏輯
            }
        });
        // 登出
        loginOut.addEventListener('click', (event) => {
            event.preventDefault();
            // 清除登入狀態
            localStorage.removeItem('loggedInUser');
            alert('已成功登出！');
            // 更新登入狀態顯示
            updateLoginStatus();
            window.location.replace('/小專題網頁/素食網站/index.html'); // 登出後跳轉首頁，並移除當前頁面的歷史紀錄
        });
    } else {
        loginOut.style.display = 'none';
        statusEl.textContent = '未登入';
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
    const newUrl = window.location.origin + '/小專題網頁/素食網站/HTML/recipeSelector.html' + (queryString ? '?' + queryString : '');
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

// 在頁面載入時呼叫
document.addEventListener('DOMContentLoaded', () => {
    initializeUsers();
    updateLoginStatus();
    initSearchInput();
});
