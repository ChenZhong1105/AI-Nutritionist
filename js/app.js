/* =========================================
   app.js - 負責首頁畫面互動與資料呈現 (支援切換日期)
   ========================================= */

const importBtn = document.getElementById('import-btn');
const jsonInput = document.getElementById('json-input');
const dateInput = document.getElementById('record-date'); // 新增日期輸入框
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

// 畫出表格的程式碼 (維持原樣)
function renderTable(dayData) {
    const totalCalories = dayData.totals.calories;
    const remaining = DAILY_GOAL - totalCalories;
    
    totalConsumedElement.innerHTML = `${totalCalories} <span class="unit">kcal</span>`;
    remainingCaloriesElement.innerHTML = `${remaining} <span class="unit">kcal</span>`;
    
    tableBody.innerHTML = '';
    
    if (dayData.meals.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">這天尚無紀錄，請貼上 AI 分析資料。</td>
            </tr>
        `;
        tableFooter.innerHTML = '';
        return;
    }

    dayData.meals.forEach(meal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${meal.mealType}</td>
            <td>${meal.foodName}</td>
            <td>${meal.totalCalories}</td>
            <td>${meal.carbs}</td>
            <td>${meal.protein}</td>
            <td>${meal.fat}</td>
            <td style="font-size: 14px; max-width: 250px;">${meal.advice}</td>
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
            <td style="font-size: 14px; font-weight: normal; max-width: 250px;">請根據未達標之營養素調整明日飲食。</td>
        </tr>
    `;
}

document.addEventListener('DOMContentLoaded', init);
