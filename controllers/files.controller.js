const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const fs = require("fs");

// Access your Google API key as an environment variable
const gemini_api_key = process.env.GEMINI_API_KEY;

const googleAI = new GoogleGenerativeAI(gemini_api_key);

const geminiConfig = {
  temperature: 0.4,
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro-vision",
  geminiConfig,
});

async function generate(filePath) {
  console.log("Started image processing");
  try {
    // Read image file
    const imageFile = await fs.promises.readFile(filePath); // Use promises for cleaner async handling
    const imageBase64 = imageFile.toString("base64");

    const promptConfig = [
      {
        text: "Analyse the food and answer in only in English language and give output in this manner in a json format eg {Name:'Chicken Burger',status:'unhealthy',description:'the food contains paneer and gravy'. est_calories:'400-500 cal', XP:'the value ranges from 1-10 depending on the food health', diet: 'suggest a good diet for the person to stay fit and healthy'} pls do not halucinate and give unique recommendations and output for new food images",
      },
      {
        inlineData: {
          mimeType: "image/jpeg", // Adjust based on actual image format
          data: imageBase64,
        },
      },
    ];

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: promptConfig }],
    });
    const response = await result.response;
    console.log("Response from Gemini:", response.text());
    return response;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error; // Re-throw for proper error handling in `uploadFile`
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("got file", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).send({
        status: false,
        message: "Please Upload the file",
      });
    }

    const filePath = req.file.path;
    console.log("here is file path", filePath);
    const response = await generate(filePath);
  const finalData= JSON.parse(response.text())
    console.log("Here isfinal respones", response.text());
    res.status(200).send({
      status: true,
      message: "Response generated successfully",
      data: finalData,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send({
      status: false,
      message: "Error processing upload",
      data:error.data
    });
  }
};

module.exports = { upload, uploadFile };
