/* =========================================
   api.js - 負責與 Google Gemini API 溝通
   ========================================= */

// ⚠️ 記得在這裡填入你的 API Key！
const GEMINI_API_KEY = 'AQ.Ab8RN6LRQdWcBgzUP8YAo-I7sf0GNZ799eoJsO40ZvIuLIz3Wg';

async function analyzeFoodImage(base64Image, mealType) {
    if (GEMINI_API_KEY === '請把這串字換成你申請的_GEMINI_API_KEY') {
        alert('請先在 js/api.js 檔案中填寫你的 Gemini API Key！');
        return null;
    }

    const mimeType = base64Image.split(';')[0].split(':')[1];
    const base64Data = base64Image.split(',')[1];

    const promptText = `
    你是一位專業的營養師。請分析這張食物照片，並預估其營養成分。
    這餐是使用者的「${mealType}」。
    
    請務必直接回傳 JSON 格式，不要包含任何 Markdown 標籤（例如 \`\`\`json）或其他閒聊文字。
    
    必須嚴格遵守以下的 JSON 結構：
    {
        "mealType": "${mealType}",
        "foodName": "餐點名稱(請盡量詳細，如：肉燥乾麵、燙青菜)",
        "totalCalories": 數字(大卡，請填整數),
        "carbs": 數字(克，請填整數),
        "protein": 數字(克，請填整數),
        "fat": 數字(克，請填整數),
        "advice": "針對這餐的簡短營養建議，指出優缺點(大約30字以內)"
    }
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: promptText },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json" 
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API 請求失敗，狀態碼：${response.status}`);
        }

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const nutritionData = JSON.parse(resultText);
        
        return nutritionData;

    } catch (error) {
        console.error("AI 分析發生錯誤:", error);
        alert("AI 分析失敗，請檢查網路連線或確認照片是否清晰。");
        return null;
    }
}
