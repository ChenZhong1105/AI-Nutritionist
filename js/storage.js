/* =========================================
   storage.js - 負責處理 LocalStorage 資料儲存與讀取 
   ========================================= */

const STORAGE_KEY = 'ai_dietitian_data';
const GOAL_KEY = 'ai_dietitian_goal';

// --- 目標與 BMR 設定 ---
function getUserProfile() {
    const data = localStorage.getItem(GOAL_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return {
        calories: 2204, carbs: 248, protein: 165, fat: 61,
        gender: 'male', age: 25, height: 170, weight: 65, activity: 1.55 
    };
}

function saveUserProfile(profileData) {
    localStorage.setItem(GOAL_KEY, JSON.stringify(profileData));
}

// --- 飲食與運動紀錄資料 ---
function getTodayKey() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function getDataByDate(dateKey) {
    const allData = getAllData();
    if (!allData[dateKey]) {
        return {
            date: dateKey.replace(/-/g, '/'),
            meals: [], 
            totals: { calories: 0, carbs: 0, protein: 0, fat: 0 } 
        };
    }
    return allData[dateKey];
}

function saveMealData(mealData, dateKey) {
    const allData = getAllData();
    if (!allData[dateKey]) {
        allData[dateKey] = {
            date: dateKey.replace(/-/g, '/'), meals: [],
            totals: { calories: 0, carbs: 0, protein: 0, fat: 0 }
        };
    }
    
    allData[dateKey].meals.push(mealData);
    
    // 🌟 更新：加入「運動」的自動排序，永遠排在最後面
    const orderMap = {
        "早餐": 1,
        "午餐": 2,
        "晚餐": 3,
        "點心": 4,
        "飲料": 5,
        "運動": 6
    };
    
    allData[dateKey].meals.sort((a, b) => {
        const orderA = orderMap[a.mealType] || 99;
        const orderB = orderMap[b.mealType] || 99;
        return orderA - orderB;
    });
    
    // 累加熱量與營養素 (如果是運動，傳入負數就會自動扣除)
    allData[dateKey].totals.calories += Number(mealData.totalCalories);
    allData[dateKey].totals.carbs += Number(mealData.carbs);
    allData[dateKey].totals.protein += Number(mealData.protein);
    allData[dateKey].totals.fat += Number(mealData.fat);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    return allData[dateKey];
}

function deleteMealData(dateKey, mealIndex) {
    const allData = getAllData();
    if (allData[dateKey] && allData[dateKey].meals[mealIndex]) {
        const meal = allData[dateKey].meals[mealIndex];
        
        // 如果刪除的是運動(負數)，減去負數等於加回來，完美復原！
        allData[dateKey].totals.calories -= Number(meal.totalCalories);
        allData[dateKey].totals.carbs -= Number(meal.carbs);
        allData[dateKey].totals.protein -= Number(meal.protein);
        allData[dateKey].totals.fat -= Number(meal.fat);
        
        // 確保營養素不會因為計算誤差變成負的 (但卡路里允許為負，代表消耗大於攝取)
        allData[dateKey].totals.carbs = Math.max(0, allData[dateKey].totals.carbs);
        allData[dateKey].totals.protein = Math.max(0, allData[dateKey].totals.protein);
        allData[dateKey].totals.fat = Math.max(0, allData[dateKey].totals.fat);
        
        allData[dateKey].meals.splice(mealIndex, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    }
    return allData[dateKey];
}
