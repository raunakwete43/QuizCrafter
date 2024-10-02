import json

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from template import SYSTEM_MSG, USER_MSG


class QuizCrafter:
    def __init__(self, base_url="http://localhost:11434") -> None:
        self.system = SYSTEM_MSG
        self.user = USER_MSG
        self.embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=base_url,
        )
        self.llm = ChatOllama(
            model="llama3.2:3b",
            temperature=0.7,
            top_k=80,
            top_p=0.9,
            seed=0,
            base_url=base_url,
        )

    def load_docs(self, file_path):
        print("Loading documnent...")
        self._load_docs(file_path)
        print("Document loaded successfully.")
        return self.documents

    def _load_docs(self, file_path):
        loader = PyMuPDFLoader(file_path)
        self.documents = loader.load()

    def split_docs(self, documents, chunk_size=700, chunk_overlap=20):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap
        )
        docs = text_splitter.split_documents(documents=documents)

        return docs

    def get_similar_docs(self, index, query, k=2):
        similar_docs = index.similarity_search(query=query, k=k)
        return similar_docs

    def create_index(self):
        print("Creating FAISS Index...")
        docs = self.split_docs(self.documents)
        self.index = FAISS.from_documents(documents=docs, embedding=self.embeddings)
        print("Index created successfully.")

        return self.index

    def load_chat_msg(self, topic):
        print("Loading Chat Template...")
        index = self.create_index()
        query = self.get_similar_docs(index, topic, k=4)

        text = "".join([doc.page_content for doc in query])

        messages = [
            SystemMessage(content=self.system),
            HumanMessage(content=self.user.format(context=text)),
        ]
        print("Chat Template Loaded.")

        return messages

    def get_questions(self, topic):
        print("Requesting questions...")
        msg = self.load_chat_msg(topic)

        result = self.llm.invoke(msg)

        result = str(result.content)
        result = result.strip().rstrip()
        result = result.strip("```json\n").rstrip("```")

        try:
            questions = json.loads(result)

            with open("questions.json", "w") as f:
                json.dump(questions, f, indent=4)

            print("Questions Generated successfully.")

            return questions

        except json.JSONDecodeError:
            print(result)
            print("Error parsing result")

            return None
