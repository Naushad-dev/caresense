const { GoogleGenerativeAI } = require("@google/generative-AI");

// Access your Google API key as an environment variable
const gemini_api_key = process.env.GEMINI_API_KEY;

const googleAI = new GoogleGenerativeAI(gemini_api_key);

const geminiConfig = {
  temperature: 0.7, // Adjust temperature for factual prompts
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro", // Consider a factual language model like Bard-large
  geminiConfig,
});

async function predictDisease(symptoms) {
  console.log("Received symptoms:", symptoms);

  const promptConfig = [
    {
      text: `Analyze the following symptoms and suggest a possible disease(s) in English language: ${symptoms}. Please provide the most 3 likely disease(s) and avoid making any medical claims.Also give doctor category to whom patient should go for treatment give me answer in JSON format`,
    },
  ];

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: promptConfig }],
  });

  const response = await result.response;
  console.log("Response from Gemini:", response.text());
  return response.text();
}

const predictDiseaseHandler = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).send({
        status: false,
        message: "Please provide symptoms in the request body.",
      });
    }

    const predictedDisease = await predictDisease(symptoms);
    // const diseaseData = JSON.parse(predictedDisease); // Assuming response is JSON

    res.status(200).send({
      status: true,
      message: "Disease prediction successful",
      data: predictedDisease,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({
      status: false,
      message: "Error predicting disease",
      error: error.message,
    });
  }
};

module.exports = { predictDiseaseHandler };
