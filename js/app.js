/* =========================================
   app.js - 負責首頁畫面互動與資料呈現
   ========================================= */

const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const mealTypeSelect = document.getElementById('meal-type');
const currentDateElement = document.getElementById('current-date');
const totalConsumedElement = document.getElementById('total-consumed');
const remainingCaloriesElement = document.getElementById('remaining-calories');
const tableBody = document.getElementById('table-body');
const tableFooter = document.getElementById('table-footer');

const DAILY_GOAL = 1848; 
let currentBase64Image = null; 

function init() {
    currentDateElement.textContent = `今日日期：${getTodayDisplay()}`;
    const todayData = getTodayData(); 
    renderTable(todayData);
}

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentBase64Image = e.target.result;
            imagePreview.src = currentBase64Image;
            previewContainer.style.display = 'flex';
            document.querySelector('.upload-label').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

analyzeBtn.addEventListener('click', async () => {
    if (!currentBase64Image) {
        alert('請先上傳或拍攝照片！');
        return;
    }

    const mealType = mealTypeSelect.value;

    loadingSpinner.style.display = 'block';
    analyzeBtn.style.display = 'none';

    const nutritionData = await analyzeFoodImage(currentBase64Image, mealType);

    if (nutritionData) {
        const updatedData = saveMealData(nutritionData);
        renderTable(updatedData);
        
        previewContainer.style.display = 'none';
        document.querySelector('.upload-label').style.display = 'flex';
        currentBase64Image = null;
        imageUpload.value = ''; 
    }

    loadingSpinner.style.display = 'none';
    analyzeBtn.style.display = 'block';
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
                <td colspan="7">今天還沒有任何紀錄喔！趕快上傳第一餐吧！</td>
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
        : `<span style="color: var(--primary-color);">(未達標 ${Math.abs(val)}g)</span>`;

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
