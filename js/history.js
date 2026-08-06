/* =========================================
   history.js - 負責歷史回顧畫面與卡片邏輯
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('history-container');
    const emptyState = document.getElementById('history-empty-state');
    const modal = document.getElementById('history-modal');
    const closeBtn = document.getElementById('close-history-modal');
    const modalDate = document.getElementById('history-modal-date');
    const modalBody = document.getElementById('history-modal-body');

    // 取得所有的儲存資料
    const allData = getAllData(); 
    // 取得所有日期並反向排序 (最新的日期在最上面)
    const dates = Object.keys(allData).sort((a, b) => b.localeCompare(a)); 

    if (dates.length === 0) {
        emptyState.style.display = 'block';
        historyContainer.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    historyContainer.innerHTML = '';

    // 依序產生每一天的卡片
    dates.forEach(dateKey => {
        const dayData = allData[dateKey];
        
        const card = document.createElement('div');
        card.className = 'history-card';
        // 左半邊總熱量，右半邊三大指標
        card.innerHTML = `
            <div class="history-date">${dayData.date}</div>
            <div class="history-content">
                <div class="history-cal">
                    <div class="val">${dayData.totals.calories}</div>
                    <div class="unit">kcal 總攝取</div>
                </div>
                <div class="history-macros">
                    <div class="history-macro-item">
                        <span>碳水化合物</span> 
                        <span>${dayData.totals.carbs} g</span>
                    </div>
                    <div class="history-macro-item">
                        <span>蛋白質</span> 
                        <span>${dayData.totals.protein} g</span>
                    </div>
                    <div class="history-macro-item">
                        <span>脂肪</span> 
                        <span>${dayData.totals.fat} g</span>
                    </div>
                </div>
            </div>
        `;
        
        // 綁定點擊事件開啟詳細視窗
        card.addEventListener('click', () => openHistoryDetail(dayData));
        historyContainer.appendChild(card);
    });

    // 打開並渲染詳細評語視窗
    function openHistoryDetail(dayData) {
        modalDate.textContent = dayData.date;
        modalBody.innerHTML = '';

        if (dayData.meals.length === 0) {
            modalBody.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">這天沒有詳細的餐點紀錄。</p>';
        } else {
            // 將那天的每一餐做成詳細資訊卡片
            dayData.meals.forEach(meal => {
                const mealCard = document.createElement('div');
                mealCard.className = 'history-meal-card';
                mealCard.innerHTML = `
                    <div class="history-meal-header">
                        <span class="history-meal-name">${meal.mealType} - ${meal.foodName}</span>
                        <span class="history-meal-cal">${meal.totalCalories} kcal</span>
                    </div>
                    <div class="history-meal-macros">
                        碳水: ${meal.carbs}g &nbsp;|&nbsp; 蛋白質: ${meal.protein}g &nbsp;|&nbsp; 脂肪: ${meal.fat}g
                    </div>
                    <div class="history-meal-advice">
                        💡 ${meal.advice}
                    </div>
                `;
                modalBody.appendChild(mealCard);
            });
        }
        
        // 顯示 Modal
        modal.classList.add('show');
    }

    // 關閉 Modal 事件
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // 點擊 Modal 背景處也可關閉
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});
