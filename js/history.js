/* =========================================
   history.js - 負責歷史回顧畫面
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('history-container');
    const emptyState = document.getElementById('history-empty-state');
    const DAILY_GOAL = 1848;

    const allData = getAllData(); 
    const dates = Object.keys(allData).sort((a, b) => b.localeCompare(a)); 

    if (dates.length === 0) {
        emptyState.style.display = 'block';
        historyContainer.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    historyContainer.innerHTML = '';

    dates.forEach(dateKey => {
        const dayData = allData[dateKey];
        const remaining = DAILY_GOAL - dayData.totals.calories;
        
        const card = document.createElement('div');
        card.className = 'table-section';
        card.style.marginBottom = '20px'; 
        
        let cardHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">
                <h3 style="color: var(--primary-dark); margin: 0;">${dayData.date}</h3>
                <p style="font-size: 14px; font-weight: bold; margin: 0; color: var(--text-main);">
                    總攝取: ${dayData.totals.calories} kcal | 剩餘: ${remaining} kcal
                </p>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>餐別</th>
                            <th>食物</th>
                            <th>大卡</th>
                            <th>碳水</th>
                            <th>蛋白質</th>
                            <th>脂肪</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if(dayData.meals.length === 0) {
             cardHTML += `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">無詳細紀錄</td></tr>`;
        } else {
             dayData.meals.forEach(meal => {
                cardHTML += `
                    <tr>
                        <td>${meal.mealType}</td>
                        <td>${meal.foodName}</td>
                        <td>${meal.totalCalories}</td>
                        <td>${meal.carbs}</td>
                        <td>${meal.protein}</td>
                        <td>${meal.fat}</td>
                    </tr>
                `;
            });
        }

        cardHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        card.innerHTML = cardHTML;
        historyContainer.appendChild(card);
    });
});
