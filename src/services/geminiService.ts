import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StudyPoints {
  summary: string;
  importantPoints: string[];
}

export interface ExamTopic {
  title: string;
  question: string;
  explanation: string;
  importance: string;
  visualPrompt: string;
}

export interface StudyData {
  studyPoints: StudyPoints;
  examTopics: ExamTopic[];
}

export async function analyzeMarathiContent(base64Data: string, mimeType: string): Promise<StudyData> {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `You are an expert Marathi educator and curriculum designer. Analyze the attached study document (written in Marathi) in GREAT DETAIL.
    
    Task:
    1. SUMMARY: Provide an exhaustive, multi-paragraph summary of the entire content in Marathi. Don't skip details.
    2. KEY POINTS: Extract 15-20 crucial study points that are essential for exams. Use clear Marathi.
    3. EXAM TOPICS: Identify 5-8 major topics likely to appear in an exam.
    4. Q&A EXPLANATIONS: For EACH exam topic, provide:
       - A descriptive TITLE in Marathi.
       - A specific "Important Question" (question field) related to this topic in Marathi.
       - A very deep, step-by-step "Full Explanation/Answer" (explanation field) in Marathi (Markdown formatted).
       - 'Importance Level' (importance field, e.g., 'अत्यंत महत्त्वाचे', 'गरजेचे').
       - A DETAILED VISUAL PROMPT (visualPrompt field): An English prompt for AI image generation. The prompt must describe an "Educational Explainer Diagram" or "Conceptual Illustration" that visually answers the question asked above. Use keywords like 'schematic', 'infographic', 'labeled diagram', 'clear typography'.

    Constraint: All student-facing content MUST be in high-quality Marathi (Devanagari script). Be as thorough as possible.
    `
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studyPoints: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              importantPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "importantPoints"]
          },
          examTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                question: { type: Type.STRING },
                explanation: { type: Type.STRING },
                importance: { type: Type.STRING },
                visualPrompt: { type: Type.STRING }
              },
              required: ["title", "question", "explanation", "importance", "visualPrompt"]
            }
          }
        },
        required: ["studyPoints", "examTopics"]
      }
    }
  });

  try {
    return JSON.parse(result.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("AI ने माहिती प्रक्रिया करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
  }
}

export async function generateTopicImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Highly detailed educational illustration for students: ${prompt}. Professional, clean, clear diagrams, photorealistic but stylized for clarity.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Image generation failed");
}

export async function findAnswersFromImage(
  pdfBase64: string, 
  pdfMime: string, 
  imgBase64: string, 
  imgMime: string
): Promise<{ questions: { q: string; a: string }[] }> {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: pdfBase64, mimeType: pdfMime } },
          { inlineData: { data: imgBase64, mimeType: imgMime } },
          {
            text: `The first file is a study PDF. The second file is an image containing questions. 
            Identify all the questions in the image and find their detailed answers using only the provided study PDF.
            
            Return the result in JSON format:
            {
              "questions": [
                {
                  "q": "Question text in Marathi",
                  "a": "Detailed answer in Marathi based on the PDF content"
                }
              ]
            }
            
            Constraint: All responses must be in high-quality Marathi.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(result.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("प्रश्नांची उत्तरे शोधताना त्रुटी आली.");
  }
}
