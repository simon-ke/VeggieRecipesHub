// document.addEventListener("DOMContentLoaded", () => {});

// 預覽標題圖片
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = "block";
            uploadPlaceholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
});

// 標籤輸入
const tagInput = document.getElementById("tagInput");
const tagList = document.getElementById("tagList");

tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && tagInput.value.trim() !== "") {
        event.preventDefault();
        addTag(tagInput.value.trim());
        tagInput.value = "";
    }
});

// 添加標籤
const addTag = (tagText) => {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.textContent = tagText;

    const removeBtn = document.createElement("span");
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-tag");
    removeBtn.addEventListener("click", () => {
        tagList.removeChild(tag);

        // 移除對應的隱藏input
        const hiddenInput = document.querySelector(`input[name="recipe_tags[]"][value="${tagText}"]`);
        if (hiddenInput) {
            hiddenInput.remove();
        }
    });

    // 創建隱藏的input
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "recipe_tags[]";
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




// 動態生成步驟
// 動態更新步驟編號與 ID
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
            </div>
        </div>
        <div class="steps-text">
            <div>
                <h2>${stepCounter + 1}</h2>
                <button type="button" onclick="removeSteps(this, '${stepId}')">
                    <img src="../img/icons/trash_icon.png" alt="">
                </button>
            </div>
            <textarea class="input-field" name="step_description[]" placeholder="操作步驟描述"></textarea>
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
            previewStepsImage.style.display = "block";
            stepsPlaceholder.style.display = "none";
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




// 表單按鈕設定
document.addEventListener('DOMContentLoaded', () => {

    // 取得表單與按鈕
    const form = document.getElementById('recipe-form');
    const publishButton = document.getElementById('publish');

    // **通用函數：提取食材、調味料、營養成分**
    function extractMaterials(containerId, nameAttr, valueAttr) {
        return Array.from(document.querySelectorAll(`#${containerId} .material`)).map(material => ({
            name: material.querySelector(`input[name="${nameAttr}[]"]`).value,
            value: material.querySelector(`input[name="${valueAttr}[]"]`).value
        }));
    }

    // // **圖片處理函數**
    // const imageInput = document.getElementById('imageInput');
    // function handleImageUpload(event) {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             localStorage.setItem('recipe_image', e.target.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // }
    // // **綁定圖片上傳監聽事件（只執行一次）**
    // imageInput.addEventListener('change', handleImageUpload);

    // **發布按鈕點擊事件**
    publishButton.addEventListener('click', (event) => {
        event.preventDefault(); // 防止表單自動提交

        if (window.confirm("確認發布食譜？")) {
            // 新增：取得上傳圖片的判斷邏輯
            const recipeImageElement = document.querySelector('.upload-image img');
            const defaultImage = 'https://i.pinimg.com/736x/e0/a3/21/e0a3218856ac6bf7b68e3a7f7617a828.jpg';
            const recipeImage = (!recipeImageElement || recipeImageElement.src === "" || recipeImageElement.src === window.location.href)
                ? defaultImage : recipeImageElement.src;

            // **整理所有數據**
            const recipeData = {
                recipe_image: recipeImage,
                recipe_title: document.getElementById('recipe-title').value,
                recipe_description: form.querySelector('textarea[name="recipe_description"]').value,
                tags: Array.from(document.querySelectorAll('#tagList input[type="hidden"]')).map(input => input.value),
                recipe_portion: document.getElementById('recipe-portion').value,
                recipe_cook_time: document.getElementById('recipe-time').value,
                ingredients: extractMaterials('ingredients', 'ingredient_name', 'ingredient_quantity'),
                seasonings: extractMaterials('seasonings', 'seasoning_name', 'seasoning_quantity'),
                nutritions: extractMaterials('nutritions', 'nutrition_name', 'nutrition_value'),
                steps: Array.from(document.querySelectorAll('#steps .steps')).map(stepDiv => ({
                    image: (() => {
                        const imgEl = stepDiv.querySelector('.steps-image img');
                        return (!imgEl || imgEl.src === "" || imgEl.src === window.location.href)
                            ? defaultImage : imgEl.src;
                    })(),
                    description: stepDiv.querySelector('textarea[name="step_description[]"]').value
                })),
            };

            // **從 LocalStorage 取得原有數據**
            const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');

            // **將新數據插入**
            existingRecipes.push(recipeData);

            // **存入 LocalStorage**
            localStorage.setItem('recipes', JSON.stringify(existingRecipes));

            // 顯示遮罩
            document.getElementById('loading-overlay').style.display = 'flex';

            // **防止多次提交**
            form.querySelector('button[type="submit"]').disabled = true;

            // 隱藏遮罩
            setTimeout(() => {
                document.getElementById('loading-overlay').style.display = 'none'; // 隱藏遮罩
            }, 2000);

            // **模擬提交過程**
            setTimeout(() => {
                alert("食譜已成功發布！ 可至個人食譜中編輯");
                window.location.href = 'recipeSelector.html';
            }, 2100);
        }
    });

    // 儲存
    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', (event) => {
        event.preventDefault(); // 防止默認表單提交行為
        alert("食譜已成功儲存！");
    });
    // 取消
    const cancelButton = document.getElementById('cancel');
    cancelButton.addEventListener('click', (event) => {
        event.preventDefault(); // 防止默認表單提交行為
        const userConfirmed = window.confirm("是否確認取消編輯食譜？");
        if (userConfirmed) {
            window.history.back(); // 跳轉回上一頁
        }
    });

});



