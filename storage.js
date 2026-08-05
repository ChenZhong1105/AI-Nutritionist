/* =========================================
   storage.js - 負責處理 LocalStorage 資料儲存與讀取
   ========================================= */

const STORAGE_KEY = 'ai_dietitian_data';

function getTodayKey() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getTodayDisplay() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
}

function getAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function getTodayData() {
    const allData = getAllData();
    const todayKey = getTodayKey();
    
    if (!allData[todayKey]) {
        return {
            date: getTodayDisplay(),
            meals: [], 
            totals: { calories: 0, carbs: 0, protein: 0, fat: 0 } 
        };
    }
    return allData[todayKey];
}

function saveMealData(mealData) {
    const allData = getAllData();
    const todayKey = getTodayKey();
    
    if (!allData[todayKey]) {
        allData[todayKey] = {
            date: getTodayDisplay(),
            meals: [],
            totals: { calories: 0, carbs: 0, protein: 0, fat: 0 }
        };
    }
    
    allData[todayKey].meals.push(mealData);
    
    allData[todayKey].totals.calories += Number(mealData.totalCalories);
    allData[todayKey].totals.carbs += Number(mealData.carbs);
    allData[todayKey].totals.protein += Number(mealData.protein);
    allData[todayKey].totals.fat += Number(mealData.fat);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    
    return allData[todayKey];
}
