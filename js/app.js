/* =========================================
   app.js - 首頁邏輯大腦 (支援環形圖與BMR計算機)
   ========================================= */

const importBtn = document.getElementById('import-btn');
const jsonInput = document.getElementById('json-input');
const dateInput = document.getElementById('record-date');
const tableBody = document.getElementById('table-body');
const tableFooter = document.getElementById('table-footer');

// Modal 相關元素
const modal = document.getElementById('settings-modal');
const editBtn = document.getElementById('edit-goal-btn');
const closeBtn = document.getElementById('close-modal');
const calcSaveBtn = document.getElementById('calc-save-btn');

let userProfile = getUserProfile();

function init() {
    dateInput.value = getTodayKey();
    loadDateData();
}

function loadDateData() {
    const selectedDate = dateInput.value;
    if (selectedDate) {
        const data = getDataByDate(selectedDate);
        renderDashboard(data);
        renderTable(data);
    }
}

dateInput.addEventListener('change', loadDateData);

// 處理環形圖與儀表板顯示
function renderDashboard(dayData) {
    const { calories, carbs, protein, fat } = dayData.totals;
    const goal = userProfile;
    
    // 計算剩餘
    let remCal = goal.calories - calories;
    let remCarbs = goal.carbs - carbs;
    let remPro = goal.protein - protein;
    let remFat = goal.fat - fat;

    // 更新文字
    document.getElementById('dash-rem-cal').textContent = remCal < 0 ? 0 : remCal;
    document.getElementById('dash-goal-cal').textContent = `目標 ${goal.calories} 千卡`;
    
    document.getElementById('dash-carbs-val').textContent = carbs;
    document.getElementById('dash-carbs-goal').textContent = goal.carbs;
    
    document.getElementById('dash-pro-val').textContent = protein;
    document.getElementById('dash-pro-goal').textContent = goal.protein;
    
    document.getElementById('dash-fat-val').textContent = fat;
    document.getElementById('dash-fat-goal').textContent = goal.fat;

    // 更新環形動畫 (計算 offset)
    // 大環形 circumference = 408
    const calPercent = Math.min(calories / goal.calories, 1);
    document.getElementById('cal-ring').style.strokeDashoffset = 408 - (408 * calPercent);

    // 小環形 circumference = 100
    const carbsPercent = Math.min(carbs / goal.carbs, 1);
    document.getElementById('carbs-ring').style.strokeDashoffset = 100 - (100 * carbsPercent);
    
    const proPercent = Math.min(protein / goal.protein, 1);
    document.getElementById('pro-ring').style.strokeDashoffset = 100 - (100 * proPercent);
    
    const fatPercent = Math.min(fat / goal.fat, 1);
    document.getElementById('fat-ring').style.strokeDashoffset = 100 - (100 * fatPercent);
}

// 處理匯入
importBtn.addEventListener('click', () => {
    const jsonText = jsonInput.value.trim();
    const selectedDate = dateInput.value;
    if (!jsonText || !selectedDate) return alert('請確認日期並貼上 AI 資料！');
    try {
        const nutritionData = JSON.parse(jsonText);
        const updatedData = saveMealData(nutritionData, selectedDate);
        renderDashboard(updatedData);
        renderTable(updatedData);
        alert('✅ 紀錄匯入成功！');
        jsonInput.value = ''; 
    } catch (error) {
        alert('❌ 格式錯誤！請確定完整複製了 { ... } 內容。');
    }
});

// 畫表格
function renderTable(dayData) {
    tableBody.innerHTML = '';
    if (dayData.meals.length === 0) {
        tableBody.innerHTML = `<tr class="empty-row"><td colspan="8">這天尚無紀錄，請貼上 AI 分析資料。</td></tr>`;
        tableFooter.innerHTML = '';
        return;
    }

    dayData.meals.forEach((meal, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${meal.mealType}</td>
            <td>${meal.foodName}</td>
            <td>${meal.totalCalories}</td>
            <td>${meal.carbs}</td>
            <td>${meal.protein}</td>
            <td>${meal.fat}</td>
            <td style="font-size: 13px; max-width: 250px;">${meal.advice}</td>
            <td><button class="delete-btn" data-index="${index}">刪除</button></td>
        `;
        tableBody.appendChild(tr);
    });

    tableFooter.innerHTML = `
        <tr style="background: #f8fafc; font-weight: bold;">
            <td colspan="2">日總結</td>
            <td>${dayData.totals.calories}</td>
            <td>${dayData.totals.carbs}</td>
            <td>${dayData.totals.protein}</td>
            <td>${dayData.totals.fat}</td>
            <td colspan="2"></td>
        </tr>
    `;
}

tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('確定要刪除這筆紀錄嗎？')) {
            const index = e.target.getAttribute('data-index');
            const updatedData = deleteMealData(dateInput.value, index);
            renderDashboard(updatedData);
            renderTable(updatedData);
        }
    }
});

// --- Modal 與計算機邏輯 ---
editBtn.addEventListener('click', () => {
    // 帶入先前的設定
    document.getElementById('user-gender').value = userProfile.gender;
    document.getElementById('user-age').value = userProfile.age;
    document.getElementById('user-height').value = userProfile.height;
    document.getElementById('user-weight').value = userProfile.weight;
    document.getElementById('user-activity').value = userProfile.activity;
    modal.classList.add('show');
});

closeBtn.addEventListener('click', () => modal.classList.remove('show'));

calcSaveBtn.addEventListener('click', () => {
    const gender = document.getElementById('user-gender').value;
    const age = Number(document.getElementById('user-age').value);
    const height = Number(document.getElementById('user-height').value);
    const weight = Number(document.getElementById('user-weight').value);
    const activity = Number(document.getElementById('user-activity').value);
    
    // Mifflin-St Jeor 公式
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;
    
    // 計算 TDEE 與 營養素
    const tdee = Math.round(bmr * activity);
    const carbs = Math.round((tdee * 0.4) / 4);
    const protein = Math.round((tdee * 0.3) / 4);
    const fat = Math.round((tdee * 0.3) / 9);

    document.getElementById('res-bmr').textContent = Math.round(bmr);
    document.getElementById('res-tdee').textContent = tdee;

    // 儲存進設定
    userProfile = {
        calories: tdee, carbs, protein, fat,
        gender, age, height, weight, activity
    };
    saveUserProfile(userProfile);
    
    setTimeout(() => {
        modal.classList.remove('show');
        loadDateData(); // 重新整理畫面套用新目標
        alert('🎯 每日目標已根據您的身體數值更新！');
    }, 800);
});

document.addEventListener('DOMContentLoaded', init);
