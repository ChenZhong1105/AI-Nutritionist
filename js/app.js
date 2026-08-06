/* =========================================
   app.js - 負責首頁畫面互動與資料呈現 (支援切換日期與刪除)
   ========================================= */

const importBtn = document.getElementById('import-btn');
const jsonInput = document.getElementById('json-input');
const dateInput = document.getElementById('record-date');
const totalConsumedElement = document.getElementById('total-consumed');
const remainingCaloriesElement = document.getElementById('remaining-calories');
const tableBody = document.getElementById('table-body');
const tableFooter = document.getElementById('table-footer');

const DAILY_GOAL = 1848; 

// 網頁載入時的初始化
function init() {
    // 把日期預設設定為今天
    dateInput.value = getTodayKey();
    // 讀取這天的資料並畫出表格
    loadDateData();
}

// 根據選定的日期，載入並顯示資料
function loadDateData() {
    const selectedDate = dateInput.value;
    if (selectedDate) {
        const data = getDataByDate(selectedDate);
        renderTable(data);
    }
}

// 當使用者切換日期時，表格自動更新！
dateInput.addEventListener('change', loadDateData);

// 處理文字貼上並匯入到「選定日期」
importBtn.addEventListener('click', () => {
    const jsonText = jsonInput.value.trim();
    const selectedDate = dateInput.value;
    
    if (!jsonText) {
        alert('請先貼上 AI 提供的分析資料喔！');
        return;
    }
    
    if (!selectedDate) {
        alert('請先選擇一個日期！');
        return;
    }

    try {
        const nutritionData = JSON.parse(jsonText);
        // 把資料存到畫面選定的那一天
        const updatedData = saveMealData(nutritionData, selectedDate);
        renderTable(updatedData);
        
        alert('✅ 紀錄匯入成功！');
        jsonInput.value = ''; // 清空輸入框
    } catch (error) {
        alert('❌ 格式錯誤！請確定你有完整複製 AI 給的 { ... } 內容。');
    }
});

// 畫出表格的程式碼 (升級刪除按鈕版)
function renderTable(dayData) {
    const totalCalories = dayData.totals.calories;
    const remaining = DAILY_GOAL - totalCalories;
    
    totalConsumedElement.innerHTML = `${totalCalories} <span class="unit">kcal</span>`;
    remainingCaloriesElement.innerHTML = `${remaining} <span class="unit">kcal</span>`;
    
    tableBody.innerHTML = '';
    
    if (dayData.meals.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="8">這天尚無紀錄，請貼上 AI 分析資料。</td>
            </tr>
        `;
        tableFooter.innerHTML = '';
        return;
    }

    // 加入 index，用來辨識我們要刪除哪一筆
    dayData.meals.forEach((meal, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${meal.mealType}</td>
            <td>${meal.foodName}</td>
            <td>${meal.totalCalories}</td>
            <td>${meal.carbs}</td>
            <td>${meal.protein}</td>
            <td>${meal.fat}</td>
            <td style="font-size: 14px; max-width: 250px;">${meal.advice}</td>
            <td><button class="delete-btn" data-index="${index}">刪除</button></td>
        `;
        tableBody.appendChild(tr);
    });

    const carbsGoal = 185;
    const proteinGoal = 140;
    const fatGoal = 60;
    
    const carbsDiff = dayData.totals.carbs - carbsGoal;
    const proteinDiff = dayData.totals.protein - proteinGoal;
    const fatDiff = dayData.totals.fat - fatGoal;

    const formatDiff = (val) => val > 0 
        ? `<span style="color: red;">(超標 ${val}g)</span>` 
        : `<span style="color: var(--accent-color);">(未達標 ${Math.abs(val)}g)</span>`;

    tableFooter.innerHTML = `
        <tr style="background-color: var(--highlight-bg); font-weight: bold;">
            <td colspan="2">日總結</td>
            <td>${dayData.totals.calories}</td>
            <td>${dayData.totals.carbs} <br> ${formatDiff(carbsDiff)}</td>
            <td>${dayData.totals.protein} <br> ${formatDiff(proteinDiff)}</td>
            <td>${dayData.totals.fat} <br> ${formatDiff(fatDiff)}</td>
            <td colspan="2" style="font-size: 14px; font-weight: normal; max-width: 250px;">請根據未達標之營養素調整明日飲食。</td>
        </tr>
    `;
}

// 監聽表格內的點擊事件 (處理刪除按鈕)
tableBody.addEventListener('click', (e) => {
    // 檢查點擊的是不是刪除按鈕
    if (e.target.classList.contains('delete-btn')) {
        const mealIndex = e.target.getAttribute('data-index');
        const selectedDate = dateInput.value;
        
        // 跳出確認視窗防呆
        if (confirm('確定要刪除這筆紀錄嗎？這筆熱量將會被扣除喔！')) {
            const updatedData = deleteMealData(selectedDate, mealIndex);
            renderTable(updatedData); // 重新畫表格
        }
    }
});

document.addEventListener('DOMContentLoaded', init);
