/* =========================================
   storage.js - 負責處理 LocalStorage 資料儲存與讀取 (自訂日期與刪除版)
   ========================================= */

const STORAGE_KEY = 'ai_dietitian_data';

// 取得今天的預設字串 (YYYY-MM-DD)
function getTodayKey() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// 取得所有資料
function getAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

// 根據「指定日期」讀取資料
function getDataByDate(dateKey) {
    const allData = getAllData();
    
    if (!allData[dateKey]) {
        return {
            date: dateKey.replace(/-/g, '/'), // 把 YYYY-MM-DD 轉成 YYYY/MM/DD
            meals: [], 
            totals: { calories: 0, carbs: 0, protein: 0, fat: 0 } 
        };
    }
    return allData[dateKey];
}

// 儲存資料到「指定日期」
function saveMealData(mealData, dateKey) {
    const allData = getAllData();
    
    if (!allData[dateKey]) {
        allData[dateKey] = {
            date: dateKey.replace(/-/g, '/'),
            meals: [],
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

// 刪除特定日期的單筆紀錄，並扣除相應熱量
function deleteMealData(dateKey, mealIndex) {
    const allData = getAllData();
    
    // 確認這天有資料，且該筆紀錄存在
    if (allData[dateKey] && allData[dateKey].meals[mealIndex]) {
        const meal = allData[dateKey].meals[mealIndex];
        
        // 扣除營養素總和
        allData[dateKey].totals.calories -= Number(meal.totalCalories);
        allData[dateKey].totals.carbs -= Number(meal.carbs);
        allData[dateKey].totals.protein -= Number(meal.protein);
        allData[dateKey].totals.fat -= Number(meal.fat);
        
        // 防止出現負數 (避免浮點數計算誤差)
        allData[dateKey].totals.calories = Math.max(0, allData[dateKey].totals.calories);
        allData[dateKey].totals.carbs = Math.max(0, allData[dateKey].totals.carbs);
        allData[dateKey].totals.protein = Math.max(0, allData[dateKey].totals.protein);
        allData[dateKey].totals.fat = Math.max(0, allData[dateKey].totals.fat);
        
        // 從陣列中移除這餐
        allData[dateKey].meals.splice(mealIndex, 1);
        
        // 重新存回 LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    }
    
    return allData[dateKey];
}
