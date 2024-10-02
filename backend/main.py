import os
import shutil
from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from quiz_llm import QuizCrafter

app = FastAPI()


# CORS setup to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this based on the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the QuizCrafter
ques_llm = QuizCrafter(base_url="http://192.168.0.105:11434")

# Directory for uploaded PDFs
UPLOAD_FOLDER = "./uploads"


# Pydantic models
class Answer(BaseModel):
    text: str
    correct: bool


class QuestionResponse(BaseModel):
    question: str
    answers: List[Answer]


# Helper function to convert questions to the desired format
def format_questions(questions):
    formatted_questions = []
    for question_obj in questions:
        formatted_question = {
            "question": question_obj["question"],
            "answers": [
                {
                    "text": option,
                    "correct": option.startswith(question_obj["correct_answer"]),
                }
                for option in question_obj["options"]
            ],
        }
        formatted_questions.append(QuestionResponse(**formatted_question))
    return formatted_questions


# 1) Endpoint to upload PDF
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(UPLOAD_FOLDER, "book.pdf")
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        return {"message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2) Endpoint to generate questions from a specific topic
@app.post("/generate-questions/", response_model=List[QuestionResponse])
async def generate_questions(topic: str = Form(...)):
    try:
        # Assuming the PDF has already been uploaded and stored
        pdf_path = os.path.join(
            UPLOAD_FOLDER, "book.pdf"
        )  # Adjust the file path if needed
        _ = ques_llm.load_docs(pdf_path)
        questions = ques_llm.get_questions(topic)

        # Format questions to match the required structure
        formatted_questions = format_questions(questions)

        return formatted_questions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
