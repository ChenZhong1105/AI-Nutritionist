/* =========================================
   app.js - 負責首頁畫面互動與資料呈現 (文字貼上版)
   ========================================= */

const importBtn = document.getElementById('import-btn');
const jsonInput = document.getElementById('json-input');
const currentDateElement = document.getElementById('current-date');
const totalConsumedElement = document.getElementById('total-consumed');
const remainingCaloriesElement = document.getElementById('remaining-calories');
const tableBody = document.getElementById('table-body');
const tableFooter = document.getElementById('table-footer');

const DAILY_GOAL = 1848; 

function init() {
    currentDateElement.textContent = `今日日期：${getTodayDisplay()}`;
    const todayData = getTodayData(); 
    renderTable(todayData);
}

// 處理文字貼上並匯入
importBtn.addEventListener('click', () => {
    const jsonText = jsonInput.value.trim();
    
    if (!jsonText) {
        alert('請先貼上 AI 提供的分析資料喔！');
        return;
    }

    try {
        const nutritionData = JSON.parse(jsonText);
        const updatedData = saveMealData(nutritionData);
        renderTable(updatedData);
        
        alert('✅ 紀錄匯入成功！');
        jsonInput.value = ''; // 清空輸入框
    } catch (error) {
        alert('❌ 格式錯誤！請確定你有完整複製 AI 給的 { ... } 內容。');
    }
});

function renderTable(todayData) {
    const totalCalories = todayData.totals.calories;
    const remaining = DAILY_GOAL - totalCalories;
    
    totalConsumedElement.innerHTML = `${totalCalories} <span class="unit">kcal</span>`;
    remainingCaloriesElement.innerHTML = `${remaining} <span class="unit">kcal</span>`;
    
    tableBody.innerHTML = '';
    
    if (todayData.meals.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">尚無紀錄，請貼上 AI 分析資料。</td>
            </tr>
        `;
        tableFooter.innerHTML = '';
        return;
    }

    todayData.meals.forEach(meal => {
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
    
    const carbsDiff = todayData.totals.carbs - carbsGoal;
    const proteinDiff = todayData.totals.protein - proteinGoal;
    const fatDiff = todayData.totals.fat - fatGoal;

    const formatDiff = (val) => val > 0 
        ? `<span style="color: red;">(超標 ${val}g)</span>` 
        : `<span style="color: var(--accent-color);">(未達標 ${Math.abs(val)}g)</span>`;

    tableFooter.innerHTML = `
        <tr style="background-color: var(--highlight-bg); font-weight: bold;">
            <td colspan="2">日總結</td>
            <td>${todayData.totals.calories}</td>
            <td>${todayData.totals.carbs} <br> ${formatDiff(carbsDiff)}</td>
            <td>${todayData.totals.protein} <br> ${formatDiff(proteinDiff)}</td>
            <td>${todayData.totals.fat} <br> ${formatDiff(fatDiff)}</td>
            <td style="font-size: 14px; font-weight: normal; max-width: 250px;">請根據未達標之營養素調整明日飲食。</td>
        </tr>
    `;
}

document.addEventListener('DOMContentLoaded', init);
