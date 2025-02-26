document.addEventListener("DOMContentLoaded", () => {
    // 預覽圖片
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

    const imageSteps = document.getElementById("imageSteps");
    const previewSteps = document.getElementById("steps-preview");
    const uploadPlaceholderSteps = document.getElementById("steps-uploadPlaceholder");

    imageSteps.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewSteps.src = e.target.result;
                previewSteps.style.display = "block";
                uploadPlaceholderSteps.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    // 標籤輸入
    const tagInput = document.getElementById("tagInput");
    const tagList = document.getElementById("tagList");
    // const tagbox = document.querySelectorAll(".tag-list");

    tagInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && tagInput.value.trim() !== "") {
            event.preventDefault();
            // tagbox.classList.add("tag-box");
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
        removeBtn.textContent = " ×";
        removeBtn.classList.add("remove-tag");
        removeBtn.addEventListener("click", () => {
            tagList.removeChild(tag);
        });

        tag.appendChild(removeBtn);
        tagList.appendChild(tag);
    };
});


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


// 更新步驟編號
const updateStepNumbers = () => {
    const steps = document.querySelectorAll('#steps .steps-text h2');
    steps.forEach((step, index) => {
        step.textContent = index + 1;
    });
};
// 添加步驟
const addStep = () => {
    const container = document.getElementById('steps');
    const div = document.createElement('div');
    div.classList.add('steps');
    div.innerHTML = `
        <div class="steps-image" onclick="document.getElementById('imageSteps').click()">
            <input class="input-field" type="file" id="imageSteps" name="step_image[]" accept="image/*" hidden
                onchange="previewImage(event)">
            <img id="steps-preview" class="steps-preview" src="" alt="">
            <div class="steps-placeholder" id="steps-uploadPlaceholder">
                <img src="../img/icons/camera_icon.png" alt="">
                <p>點擊新增圖片</p>
            </div>
        </div>
        <div class="steps-text">
            <div>
                <h2></h2> <!-- 使用計數器 -->
                <button type="button" onclick="removeSteps(this)">
                    <img src="../img/icons/trash_icon.png" alt="">
                </button>
            </div>
            <textarea class="input-field" name="step_description[]" placeholder="操作步驟描述"></textarea>
        </div>
    `;
    container.appendChild(div);
    updateStepNumbers(); // 更新步驟編號
};
// 移除項目
const removeSteps = (button) => {
    button.closest('.steps').remove();
    updateStepNumbers(); // 更新步驟編號
}


