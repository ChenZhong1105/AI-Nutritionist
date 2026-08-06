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
    // 預設值 (如果使用者還沒設定過)
    return {
        calories: 2204,
        carbs: 248,
        protein: 165,
        fat: 61,
        // 記錄表單填寫狀態
        gender: 'male', age: 25, height: 170, weight: 65, activity: 1.55 
    };
}

function saveUserProfile(profileData) {
    localStorage.setItem(GOAL_KEY, JSON.stringify(profileData));
}

// --- 飲食紀錄資料 ---
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
        allData[dateKey].totals.calories -= Number(meal.totalCalories);
        allData[dateKey].totals.carbs -= Number(meal.carbs);
        allData[dateKey].totals.protein -= Number(meal.protein);
        allData[dateKey].totals.fat -= Number(meal.fat);
        
        allData[dateKey].totals.calories = Math.max(0, allData[dateKey].totals.calories);
        allData[dateKey].totals.carbs = Math.max(0, allData[dateKey].totals.carbs);
        allData[dateKey].totals.protein = Math.max(0, allData[dateKey].totals.protein);
        allData[dateKey].totals.fat = Math.max(0, allData[dateKey].totals.fat);
        
        allData[dateKey].meals.splice(mealIndex, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    }
    return allData[dateKey];
}
