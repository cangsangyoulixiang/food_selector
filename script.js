let foods = ['火锅', '烧烤', '披萨', '寿司', '拉面', '炸鸡', '沙拉', '炒饭'];
let isRunning = false;
let intervalId = null;
let floatingInterval = null;
let foodToDelete = null;
let animationFrameId = null;
let startTime = null;
let changeCount = 0;
let lastSelectedFood = null;

const startBtn = document.getElementById('start-btn');
const foodDisplay = document.getElementById('food-display');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const addBtn = document.getElementById('add-btn');
const dialog = document.getElementById('dialog');
const confirmAdd = document.getElementById('confirm-add');
const cancelAdd = document.getElementById('cancel-add');
const newFoodInput = document.getElementById('new-food');
const existingFoodsList = document.getElementById('existing-foods-list');
const confirmDialog = document.getElementById('confirm-dialog');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// 加载本地存储
if(localStorage.getItem('foods')) {
    foods = JSON.parse(localStorage.getItem('foods'));
}

function updateExistingFoodsList() {
    existingFoodsList.innerHTML = '';
    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        const foodText = document.createElement('span');
        foodText.textContent = food;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '❌';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            showDeleteConfirmation(food);
        };
        
        foodItem.appendChild(foodText);
        foodItem.appendChild(deleteBtn);
        existingFoodsList.appendChild(foodItem);
    });
}

function showDeleteConfirmation(food) {
    foodToDelete = food;
    confirmDialog.style.display = 'flex';
}

function deleteFood() {
    if (foodToDelete) {
        const index = foods.indexOf(foodToDelete);
        if (index > -1) {
            foods.splice(index, 1);
            localStorage.setItem('foods', JSON.stringify(foods));
            updateExistingFoodsList();
        }
        foodToDelete = null;
    }
    confirmDialog.style.display = 'none';
}

function getRandomFood() {
    return foods[Math.floor(Math.random() * foods.length)];
}

function updateProgress(percentage) {
    progress.style.width = percentage + '%';
}

function createFloatingFood() {
    const food = getRandomFood();
    const floating = document.createElement('div');
    floating.className = 'floating-food';
    floating.textContent = food;
    floating.style.left = Math.random() * window.innerWidth + 'px';
    floating.style.top = Math.random() * window.innerHeight + 'px';
    floating.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    document.body.appendChild(floating);

    setTimeout(() => floating.remove(), 3000);
}

function startSelection() {
    isRunning = true;
    startBtn.textContent = '⏹️ 停';
    progressBar.style.display = 'block';
    startTime = Date.now();

    intervalId = setInterval(() => {
        lastSelectedFood = getRandomFood();
        foodDisplay.textContent = lastSelectedFood;
    }, 50);

    floatingInterval = setInterval(createFloatingFood, 200);

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 10000) * 100, 100);
        updateProgress(progress);

        if (progress < 100 && isRunning) {
            animationFrameId = requestAnimationFrame(animate);
        } else if (progress >= 100) {
            stopSelection(true);
        }
    }
    animate();
}

function stopSelection(isAutoStop = false) {
    clearInterval(intervalId);
    clearInterval(floatingInterval);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    isRunning = false;

    if (!isAutoStop) {
        startBtn.textContent = '🔄 再换一个';
        changeCount++;
        
        if (changeCount >= 4) {
            foodDisplay.textContent = '还不行？饿着吧你 😠';
            startBtn.textContent = '✨ 开始选择！';
            startBtn.classList.add('angry-button');
            changeCount = 0;
        }
    } else {
        startBtn.textContent = '✨ 开始选择！';
        changeCount = 0;
    }
}

startBtn.addEventListener('click', () => {
    if (foods.length === 0) {
        alert('请先添加一些食物选项哦~ 🥰');
        return;
    }

    if (startBtn.textContent === '✨ 开始选择！') {
        startBtn.classList.remove('angry-button');
        startSelection();
    } else if (startBtn.textContent === '⏹️ 停') {
        stopSelection();
        updateProgress(0);
    } else if (startBtn.textContent === '🔄 再换一个') {
        startSelection();
    }
});

addBtn.addEventListener('click', () => {
    dialog.style.display = 'flex';
    newFoodInput.focus();
    updateExistingFoodsList();
});

confirmAdd.addEventListener('click', () => {
    const newFood = newFoodInput.value.trim();
    if (newFood) {
        // 检查食物是否已经存在
        if (foods.includes(newFood)) {
            alert('不能重复添加哦~ 🥰');
        } else {
            foods.push(newFood);
            localStorage.setItem('foods', JSON.stringify(foods));
            updateExistingFoodsList();  // 更新已有食物列表
            // 清空输入框，但不关闭对话框
            newFoodInput.value = '';
        }
    }
});

cancelAdd.addEventListener('click', () => {
    dialog.style.display = 'none';
    newFoodInput.value = '';
});

confirmDeleteBtn.addEventListener('click', deleteFood);

cancelDeleteBtn.addEventListener('click', () => {
    confirmDialog.style.display = 'none';
    foodToDelete = null;
});

dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
        dialog.style.display = 'none';
    }
});

confirmDialog.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
        confirmDialog.style.display = 'none';
        foodToDelete = null;
    }
});
