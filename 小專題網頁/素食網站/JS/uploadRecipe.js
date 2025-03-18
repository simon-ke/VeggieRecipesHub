// 預覽標題圖片
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// 標籤輸入
const tagInput = document.getElementById('tagInput');
const tagList = document.getElementById('tagList');

tagInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && tagInput.value.trim() !== '') {
        event.preventDefault();
        addTag(tagInput.value.trim());
        tagInput.value = '';
    }
});

// 添加標籤
const addTag = (tagText) => {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.textContent = tagText;

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '×';
    removeBtn.classList.add('remove-tag');
    removeBtn.addEventListener('click', () => {
        tagList.removeChild(tag);

        // 移除對應的隱藏input
        const hiddenInput = document.querySelector(`input[name="recipe_tags[]"][value="${tagText}"]`);
        if (hiddenInput) {
            hiddenInput.remove();
        }
    });

    // 創建隱藏的input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'recipe_tags[]';
    hiddenInput.value = tagText;

    tag.appendChild(removeBtn);
    tagList.appendChild(tag);
    tagList.appendChild(hiddenInput);
};

// 添加食材
const addIngredient = () => {
    const container = document.getElementById('ingredients');
    const div = document.createElement('div');
    div.classList.add('material');
    div.innerHTML = `
        <input class="input-field" type="text" name="ingredient_name[]" placeholder="食材名稱">
        <input class="input-field" type="text" name="ingredient_quantity[]" placeholder="數量">
        <button type="button" onclick="removeMaterial(this)"><img src="../img/icons/trash_icon.png" alt=""></button>
    `;
    container.appendChild(div);
};

// 添加調味料
const addSeasoning = () => {
    const container = document.getElementById('seasonings');
    const div = document.createElement('div');
    div.classList.add('material');
    div.innerHTML = `
        <input class="input-field" type="text" name="seasoning_name[]" placeholder="調味料名稱">
        <input class="input-field" type="text" name="seasoning_quantity[]" placeholder="數量">
        <button type="button" onclick="removeMaterial(this)"><img src="../img/icons/trash_icon.png" alt=""></button>
    `;
    container.appendChild(div);
};

// 添加營養信息
const addNutrition = () => {
    const container = document.getElementById('nutritions');
    const div = document.createElement('div');
    div.classList.add('material');
    div.innerHTML = `
        <input class="input-field" type="text" name="nutrition_name[]" placeholder="營養成分名稱">
        <input class="input-field" type="text" name="nutrition_value[]" placeholder="數值">
        <button type="button" onclick="removeMaterial(this)"><img src="../img/icons/trash_icon.png" alt=""></button>
    `;
    container.appendChild(div);
};

// 移除原料
const removeMaterial = (button) => {
    button.parentElement.remove();
};

// 動態生成步驟 並更新步驟編號與 ID
const updateStepNumbers = () => {
    const steps = document.querySelectorAll('#steps .steps');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepId = `step_${stepNumber}`;
        const stepImageId = `stepsImage_${stepNumber}`;
        const previewImageId = `previewStepsImage_${stepNumber}`;
        const placeholderId = `stepsPlaceholder_${stepNumber}`;

        // 設定步驟區塊的 ID
        step.id = stepId;

        // 更新圖片區域的相關 ID 和事件
        const stepImage = step.querySelector('.steps-image');
        const stepInput = stepImage?.querySelector('input');
        const stepImg = stepImage?.querySelector('img');
        const stepPlaceholder = step.querySelector('.stepsPlaceholder');

        if (stepImage) stepImage.setAttribute('onclick', `document.getElementById('${stepImageId}').click()`);
        if (stepInput) stepInput.id = stepImageId;
        if (stepImg) stepImg.id = previewImageId;
        if (stepPlaceholder) stepPlaceholder.id = placeholderId;

        // 更新步驟編號
        const stepText = step.querySelector('.steps-text h2');
        if (stepText) stepText.textContent = stepNumber;

        // 更新刪除按鈕的 onclick 事件
        const deleteButton = step.querySelector('.steps-text button');
        if (deleteButton) deleteButton.setAttribute('onclick', `removeSteps(this, '${stepId}')`);
    });
};

// 記錄目前步驟數量
let stepCounter = 1;
// 添加步驟
const addStep = () => {
    const container = document.getElementById('steps');
    const stepId = `step_${stepCounter + 1}`;
    const stepImageId = `stepsImage_${stepCounter + 1}`;
    const previewImageId = `previewStepsImage_${stepCounter + 1}`;
    const placeholderId = `stepsPlaceholder_${stepCounter + 1}`;

    const step = document.createElement('div');
    step.classList.add('steps');
    step.setAttribute('id', stepId);

    step.innerHTML = `
        <div class="steps-image" onclick="document.getElementById('${stepImageId}').click()">
            <input class="input-field" type="file" id="${stepImageId}" name="step_image[]" accept="image/*" hidden>
            <img id="${previewImageId}" class="previewStepsImage" src="" alt="">
            <div class="stepsPlaceholder" id="${placeholderId}">
                <img src="../img/icons/camera_icon.png" alt="">
                <p>點擊新增圖片</p>
                <small class="helper-text">建議使用高解析度圖片</small>
            </div>
        </div>
        <div class="steps-text">
            <div>
                <h2>${stepCounter + 1}</h2>
                <button type="button" onclick="removeSteps(this, '${stepId}')">
                    <img src="../img/icons/trash_icon.png" alt="">
                </button>
            </div>
            <textarea class="input-field" name="step_description[]" placeholder="操作步驟描述 (最多100字)" maxlength="100"></textarea>
        </div>
    `;

    container.appendChild(step);
    stepCounter++; // 增加計數器
    updateStepNumbers();
    updateImagePreviews();
};

// 移除步驟
const removeSteps = (button, stepId) => {
    document.getElementById(stepId)?.remove();
    updateStepNumbers();

    // 重新計算步驟數量，確保 stepCounter 一致
    const remainingSteps = document.querySelectorAll('#steps .steps').length;
    stepCounter = remainingSteps;
};

// 預覽步驟圖片
const previewImage = (input, previewId, placeholderId) => {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewStepsImage = document.getElementById(previewId);
            const stepsPlaceholder = document.getElementById(placeholderId);
            previewStepsImage.src = e.target.result;
            previewStepsImage.style.display = 'block';
            stepsPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
};

// 更新所有步驟的圖片預覽事件監聽器
const updateImagePreviews = () => {
    const imageInputs = document.querySelectorAll('.steps-image input[type="file"]');
    imageInputs.forEach((input, index) => {
        const previewId = `previewStepsImage_${index + 1}`;
        const placeholderId = `stepsPlaceholder_${index + 1}`;

        // 先移除舊的事件監聽器，避免重複觸發
        input.removeEventListener('change', input._listener);

        // 設定新的事件監聽函式
        input._listener = () => previewImage(input, previewId, placeholderId);
        input.addEventListener('change', input._listener);
    });
};
// 初始化事件
updateImagePreviews();
updateStepNumbers();



let storageRecipes = []; // 初始化數據
let existingRecipes = []; // 初始化合併後的數據
async function initializeRecipes() {
    // 將 recipes 的數據重置為一個空陣列。
    // localStorage.setItem('recipes', JSON.stringify([]));
    try {
        const response = await fetch('../recipes.json');
        if (!response.ok) {
            throw new Error(`讀取 JSON 檔案失敗，狀態碼：${response.status}`);
        }
        // 存放 預設JSON 數據
        const fileRecipes = await response.json();
        // 存放 localStorage 中食譜發布的數據
        storageRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        // 合併 JSON 檔案和 LocalStorage 的數據
        existingRecipes = [...fileRecipes, ...storageRecipes];
    } catch (error) {
        console.error('讀取預設 JSON 檔案時發生錯誤：', error);
        return [];
    }
}

let userData = []; // 初始化使用者數據
let user = []; // 初始化登入的使用者數據
// 取得 JSON 檔案 與 localStorage 中的使用者數據 儲存到 userData 變數中
async function getUserData() {
    try {
        const response = await fetch('../users.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const defaultUser = await response.json();
        // 從 localStorage 取得用戶相關數據
        const storedData = localStorage.getItem('users');
        const storedUser = storedData ? JSON.parse(storedData) : [];
        // 合併預設數據與 localStorage 數據
        userData = [...defaultUser, ...storedUser];

        if (localStorage.getItem('loggedInUser')) {
            const userId = JSON.parse(localStorage.getItem('loggedInUser')).user_id;
            // 在 userData 陣列中尋找 user_id 等於 userId 的物件 
            user = userData.find(user => user.user_id === userId);
        }
        // return user;
    } catch (error) {
        console.error('合併 JSON 與 localStorage 數據時發生錯誤：', error);
        return [];
    }
}
// 在頁面載入時呼叫
document.addEventListener('DOMContentLoaded', () => {
    initializeRecipes();
    getUserData();
});


// **點擊事件邏輯** 
// 取得表單發布按鈕
document.getElementById('publish').addEventListener('click', (event) => {
    event.preventDefault(); // 阻止瀏覽器進行預設提交（避免頁面刷新）
    // 讀取登入的使用者
    if (!user) {
        alert('請先登入才能發布食譜！');
        return;  // 無法發布
    }
    // 顯示確認提示，只有在確認後繼續
    if (!window.confirm('確認發布食譜？')) {
        return;  // 使用者取消發布
    }
    // 驗證表單必填欄位是否皆已填寫
    if (!validateRecipeForm()) {
        // validateRecipeForm() 內部會提示錯誤訊息，此時中斷提交
        return;
    }

    // 通過 validateRecipeForm() 驗證  **處理發布** 
    const userId = user.user_id;
    // 自動生成 recipe_id 編號：根據現有數據中最大的 id 遞增 1，若無資料則預設為 1
    const recipeId = existingRecipes.length > 0 ? Math.max(...existingRecipes.map(recipe => recipe.recipe_id || 0)) + 1 : 1;

    // 食譜發布時間
    const createdAt = getFormattedLocalDateTime();

    // 驗證圖片是否上傳 並取得上傳食譜圖片，圖片上傳不可空
    const recipeImageElement = document.querySelector('.upload-image img');
    const recipeImage = recipeImageElement.src;

    // 食譜步驟步驟（假設 validateSteps() 也會做內部提醒並返回資料或 false）
    const stepsData = validateSteps();
    // 若步驟驗證失敗，validateSteps() 會處理提醒，此處中斷後續程序
    if (!stepsData) { return; }

    // 整理所有輸入的數據
    const recipeData = {
        user_id: userId.toString(),
        recipe_id: recipeId.toString(), // 或 `${recipeId}`
        created_at: createdAt,
        updated_at: '',
        rating: '',
        evaluate: '',
        likes: '0',
        comments: '0',
        recipe_title: document.getElementById('recipe-title').value,
        recipe_image: recipeImage,
        recipe_description: document.getElementById('recipe-form').querySelector('textarea[name="recipe_description"]').value,
        recipe_portion: document.getElementById('recipe-portion').value,
        recipe_cook_time: document.getElementById('recipe-time').value,
        // 取得所有隱藏的 tag 輸入值
        tags: Array.from(document.querySelectorAll('#tagList input[type="hidden"]')).map(input => input.value),
        ingredients: extractMaterials('ingredients', 'ingredient_name', 'ingredient_quantity'),
        seasonings: extractMaterials('seasonings', 'seasoning_name', 'seasoning_quantity'),
        nutritions: extractMaterials('nutritions', 'nutrition_name', 'nutrition_value'),

        steps: stepsData,
    };
    // 將新數據加入到 storageRecipes 中
    storageRecipes.push(recipeData);
    // console.log(recipeData);

    // 存回 LocalStorage
    localStorage.setItem('recipes', JSON.stringify(storageRecipes));

    // 使用者食譜數更新
    user.total_recipes = Number(user.total_recipes) + 1;
    // 將使用者食譜發布數量 存回 LocalStorage
    localStorage.setItem('users', JSON.stringify(userData));

    // 顯示提交中的遮罩畫面
    document.getElementById('loading-overlay').style.display = 'flex';

    // 取得表單 防止多次提交
    document.getElementById('recipe-form').querySelector('button[type="submit"]').disabled = true;

    // 過 2 秒隱藏遮罩
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 2000);

    // 模擬提交過程，完成後顯示提示訊息並轉跳頁面
    setTimeout(() => {
        alert('食譜已成功發布！ 可至個人食譜中編輯');
        window.location.href = 'recipeSelector.html';
    }, 2100);
});




// 整體驗證函式
function validateRecipeForm() {
    // 1. 驗證 食譜、步驟 圖片檔案類型是否正確及上傳
    if (!validateImageSrc()) {
        return false;
    }

    // 2. 驗證食譜標題是否已填寫
    const recipeTitle = document.getElementById('recipe-title').value.trim();
    if (!recipeTitle) {
        alert('請填寫食譜標題');
        return false;
    }

    // 3. 食譜標籤可空，不需要驗證

    // 4. 驗證食譜介紹是否已填寫
    const recipeDescription = document
        .getElementById('recipe-form')
        .querySelector('textarea[name="recipe_description"]').value.trim();
    if (!recipeDescription) {
        alert('請填寫食譜介紹');
        return false;
    }

    // 5. 驗證食譜份量是否已選擇
    const recipePortion = document.getElementById('recipe-portion').value;
    if (!recipePortion) {
        alert('請選擇食譜份量');
        return false;
    }

    // 6. 驗證食譜烹調時間是否已選擇
    const recipeCookTime = document.getElementById('recipe-time').value;
    if (!recipeCookTime) {
        alert('請選擇烹調時間');
        return false;
    }

    // 7. 驗證食譜食材：必須至少一筆資料，並且每筆的名稱與數量都必填（name 與 value 皆不可空）
    const ingredients = extractMaterials('ingredients', 'ingredient_name', 'ingredient_quantity');
    if (!ingredients.length) {
        alert('請至少填寫一筆食材！');
        return false;
    }
    if (ingredients.every(item => !item.name.trim() || !item.value.trim())) {
        alert('請完整填寫每筆食材的名稱與數量！');
        return false;
    }

    // 8. 驗證食譜調味料：必須至少一筆資料，並且每筆的名稱與數量都必填（name 與 value 皆不可空）
    const seasonings = extractMaterials('seasonings', 'seasoning_name', 'seasoning_quantity');
    if (!seasonings.length) {
        alert('請至少填寫一筆調味料！');
        return false;
    }
    if (seasonings.every(item => !item.name.trim() && !item.value.trim())) {
        alert('請完整填寫每筆調味料的名稱與數量！');
        return false;
    }

    // 9. 驗證食譜營養成分：必須至少一筆資料，並且每筆的名稱與數量都必填（name 與 value 皆不可空）
    const nutritions = extractMaterials('nutritions', 'nutrition_name', 'nutrition_value');
    if (!nutritions.length) {
        alert('請至少填寫一筆營養成分！');
        return false;
    }
    if (nutritions.every(item => !item.name.trim() && !item.value.trim())) {
        alert('請完整填寫每筆營養成分的名稱與數量！');
        return false;
    }

    // 若通過所有驗證，回傳 true 以繼續發布流程
    return true;
}

// 圖片上傳驗證
function validateImageSrc() {
    // 驗證 id 為 "preview" 的圖片
    const previewElement = document.getElementById('preview');
    if (previewElement) {
        const src = previewElement.src;
        if (!src || src === '' || src === window.location.href) {
            alert('請上傳食譜圖片！');
            return false;
        }
        if (!src.startsWith('data:image') && !src.startsWith('blob:')) {
            alert('食譜圖片格式錯誤！');
            previewElement.src = '';
            return false;
        }
    }

    // 驗證 class 為 previewStepsImage 的所有步驟的圖片 // 使用 querySelectorAll 取得所有符合的圖片元素，不論只有一個還是多個。
    const imageElements = document.querySelectorAll('.previewStepsImage');
    for (const imageElement of imageElements) {
        const imageSrc = imageElement.src;

        // 如果圖片未設定（例如空字串或者仍是預設狀態），則跳過驗證
        if (!imageSrc || imageSrc === '' || imageSrc === window.location.href) {
            continue;
        }

        // 如果有圖片來源，驗證是否符合正確格式：必須以 "data:image" 或 "blob:" 開頭
        if (!imageSrc.startsWith('data:image') && !imageSrc.startsWith('blob:')) {
            alert('步驟圖片格式錯誤！');
            // 可選：如果需要，也可清除預覽圖片
            imageElement.src = '';
            return false;
        }
    }

    return true;
}

// 定義 validateSteps 函式處理每一步驟：每個步驟上傳一張圖片與步驟描述，若沒上傳則返回空陣列
function validateSteps() {
    const steps = Array.from(document.querySelectorAll('#steps .steps'));
    const newSteps = [];

    // 使用 for…of 搭配 .entries() 明確表達每個循環的索引與內容
    for (const [index, step] of steps.entries()) {
        // 使用 optional chaining 取得圖片元素與 src
        const imgElement = step.querySelector('.previewStepsImage');
        const image = (imgElement && imgElement.src && imgElement.src.trim() !== '' && imgElement.src !== window.location.href)
            ? imgElement.src
            : ''; // 圖片可空

        // 使用 optional chaining 與 nullish coalescing operator 來取得描述，若描述不存在則為空字串，，以及 trim() 處理空白
        const description = step.querySelector('textarea[name="step_description[]"]')?.value.trim() ?? '';

        // 如果描述為空，立刻提示錯誤、聚焦當前欄位，並終止整個流程
        if (!description) {
            alert(`請填寫烹調步驟 ${index + 1} 的描述！`);
            // 終止後續步驟處理
            return false;
        }

        newSteps.push({ image, description });
    }

    return newSteps;
}

// **通用函數：提取食材、調味料、營養成分**
function extractMaterials(containerId, name, value) {
    return Array.from(document.querySelectorAll(`#${containerId} .material`)).map(material => ({
        name: material.querySelector(`input[name="${name}[]"]`).value,
        value: material.querySelector(`input[name="${value}[]"]`).value
    }));
}

// 儲存
const saveButton = document.getElementById('save');
saveButton.addEventListener('click', (event) => {
    event.preventDefault(); // 防止默認表單提交行為
    if (!loggedInUser) {
        alert('請先登入才能儲存食譜！');
    } else {
        alert('食譜已成功儲存！');
    }
});

// 取消
const cancelButton = document.getElementById('cancel');
cancelButton.addEventListener('click', (event) => {
    event.preventDefault(); // 防止默認表單提交行為
    const userConfirmed = window.confirm('是否確認取消編輯食譜？');
    if (userConfirmed) {
        window.history.back(); // 跳轉回上一頁
    }
});

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

