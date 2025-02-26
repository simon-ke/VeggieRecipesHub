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



