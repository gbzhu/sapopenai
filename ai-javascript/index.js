const API_URL = "";
const API_KEY = "";

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");

const generate = async () => {

    try {
        // Fetch the response from the OpenAI API with the signal from AbortController
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": `${API_KEY}`,
            },
            body: JSON.stringify({
                messages: [{ role: "system", content: "You are a professional engineer. The user will provide some basic information, and you need to generate some ideas based on that information, please output in the form of key-value pairs." }, { role: "user", content: promptInput.value }],
                max_tokens: 200,
                stream: true
            })
        });

        // Read the response as a stream of data
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        resultText.innerText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // Massage and parse the chunk of data
            const chunk = decoder.decode(value);
            const lines = chunk.split("\\n");
            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                .map((line) => JSON.parse(line)); // Parse the JSON string

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                // Update the UI with the new content
                if (content) {
                    resultText.innerText += content;
                }
            }
        }
    } catch (error) {
        console.error("Error:", error);
        resultText.innerText = "Error occurred while generating.";
    }
};

promptInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        generate();
    }
});

generateBtn.addEventListener("click", generate);