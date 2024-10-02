import { useState } from 'react';
import axios from 'axios';
import QuizPage from './QuizPage';
import { ClipLoader } from 'react-spinners';

const App = () => {
  const [file, setFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [topic, setTopic] = useState('');
  const [quizReady, setQuizReady] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://192.168.0.105:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      setFileUploaded(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleStartQuiz = async () => {
    if (!topic) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('topic', topic);

    try {
      const response = await axios.post('http://192.168.0.105:8000/generate-questions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Questions requested successfully");
      setQuestions(response.data); // Save questions to state
      setLoading(false); // This would trigger the quiz component/page later
      setQuizReady(true);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setLoading(false);
    }
  };


  return (
    <div>
      {questions ? (
        <QuizPage questions={questions} />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <ClipLoader color="#4A90E2" size={50} />  {/* Display spinner while loading */}
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow-md">
              <h1 className="text-2xl font-bold mb-4">Upload PDF to Start Quiz</h1>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                onClick={handleUpload}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
              >
                Upload
              </button>

              {fileUploaded && (
                <>
                  <div className="mt-4">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Select Topic</label>
                    <input
                      type="text"
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <button
                    onClick={handleStartQuiz}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                  >
                    Start Quiz
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};



export default App;
