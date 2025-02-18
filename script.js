const OPENROUTER_API_KEY = "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";

async function generateTheme() {
    const keywordInput = document.getElementById("keyword");
    const colorsContainer = document.getElementById("colorsContainer");
    const loading = document.getElementById("loading");
    const themeResult = document.getElementById("themeResult");
    const generateButton = document.querySelector("button");

    if (generateButton.innerText === "Generate Another Color") {
        keywordInput.value = "";
        generateButton.innerText = "Generate";
        colorsContainer.innerHTML = "";
        themeResult.classList.add("hidden");
        keywordInput.style.display = "block";
        return;
    }

    const keyword = keywordInput.value.trim();

    if (!keyword) {
        alert("Please enter a theme word.");
        return;
    }

    themeResult.classList.add("hidden");
    loading.style.display = "block";
    colorsContainer.innerHTML = "";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "qwen/qwen-vl-plus:free",
                messages: [
                    { role: "system", content: "You are an AI that generates web design themes based on keywords." },
                    { role: "user", content: `Generate a UI theme based on the keyword: ${keyword}. Only return a color palette with hex codes (e.g., #FF5733, #2ECC71).` }
                ],
                max_tokens: 100
            })
        });

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "";
        const hexColors = aiResponse.match(/#[0-9A-Fa-f]{6}/g) || [];
        const limitedColors = hexColors.slice(0, 5);

        if (limitedColors.length === 0) {
            throw new Error("No colors found in response.");
        }

        limitedColors.forEach(color => {
            const colorItem = document.createElement("div");
            colorItem.className = "color-item";

            const colorBox = document.createElement("div");
            colorBox.className = "color-box";
            colorBox.style.backgroundColor = color;

            const colorCode = document.createElement("span");
            colorCode.className = "color-code";
            colorCode.innerText = color;

            colorBox.onclick = () => copyToClipboard(color);

            colorItem.appendChild(colorBox);
            colorItem.appendChild(colorCode);
            colorsContainer.appendChild(colorItem);
        });

        loading.style.display = "none";
        themeResult.classList.remove("hidden");
        keywordInput.style.display = "none";
        generateButton.innerText = "Generate Another Color";

    } catch (error) {
        console.error("Error generating theme:", error);
        loading.innerText = "Error fetching theme. Try again.";
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copied: ${text}`);
    });
}