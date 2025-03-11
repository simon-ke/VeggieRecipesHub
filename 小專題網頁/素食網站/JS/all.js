window.onscroll = () => {
    fixedNav();
    scrollFunction();
};

// 固定導覽列
const fixedNav = () => {
    const nav = document.querySelector('.nav-container');
    const search = document.querySelector('.recipe-actions');

    if (window.scrollY > 200) {
        requestAnimationFrame(() => {
            nav.classList.add('fixed-nav');
            search.classList.add('fixed-recipe-actions');
        });
    } else {
        requestAnimationFrame(() => {
            nav.classList.remove('fixed-nav');
            search.classList.remove('fixed-recipe-actions');
        });
    }
}

// 當頁面滾動時觸發
const scrollFunction = () => {
    const backToTopButton = document.getElementById("back-to-top");
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}

// 點擊圖片回到頂部
document.getElementById("back-to-top").onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};



// 取得模態框及表單元素
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// 開啟與關閉 Modal 的函式
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// 試著取得儲存中的使用者資料，若不存在則初始化為空陣列
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 登入表單提交事件
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const users = getUsers();
    const matchedUser = users.find(user => user.username === username && user.password === password);

    if (matchedUser) {
        alert('登入成功！');
        localStorage.setItem('loggedInUser', username);
        closeModal(loginModal);
        // 更新頁面上顯示使用者狀態，例如顯示使用者名稱或改變導覽列內容
        updateLoginStatus();
        location.reload();
    } else {
        alert('使用者名稱或密碼錯誤！');
    }
});

// 註冊表單提交事件
registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    let users = getUsers();

    // 檢查是否已有相同的使用者名稱
    if (users.find(user => user.username === username)) {
        alert('該使用者名稱已被使用！');
    } else {
        users.push({ username, email, password });
        saveUsers(users);
        alert('註冊成功！請登入。');
        closeModal(registerModal);
        openModal(loginModal);
    }
});

// 切換 Modal 的事件，直接綁定到 member-menu 區塊內的對應按鈕
function handleRegisterOpen(e) {
    e.preventDefault(); // 防止預設行為
    closeModal(loginModal); // 關閉登入模態框（若開啟中）
    openModal(registerModal); // 打開註冊模態框
}
document.getElementById('register').addEventListener('click', handleRegisterOpen)
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
});




// 示範：更新頁面上登入狀態（例如：更新導覽列）
function updateLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const statusEl = document.getElementById('login-status');
    const loginOut = document.getElementById('login-out');
    const userState = document.getElementById('user-state');
    if (loggedInUser) {
        statusEl.textContent = `歡迎，${loggedInUser}`;
        loginOut.style.display = 'block';
        loginOut.textContent = '登出'
        userState.textContent = '個人資訊';
        // 登出
        loginOut.addEventListener('click', function (e) {
            e.preventDefault();
            // 清除登入狀態
            localStorage.removeItem('loggedInUser');
            alert('已成功登出！');
            // 更新登入狀態顯示
            updateLoginStatus();
            location.reload();
        });
    } else {
        statusEl.textContent = '未登入';
        loginOut.style.display = 'none';
    }
}

// 初始化頁面時呼叫
updateLoginStatus();



