import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent.graph import graph
from langchain_core.messages import HumanMessage

app = FastAPI(title="Football Chatbot API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@app.post("/api/ai/chat")
async def chat(request: ChatRequest, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    jwt_token = authorization.split(" ")[1]
    os.environ["JWT_TOKEN"] = jwt_token
    
    # Prepare the initial state
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
    }
    
    # Run the LangGraph
    try:
        result = graph.invoke(initial_state)
        # The last message should be the AI's response
        response_message = result["messages"][-1]
        return {
            "response": response_message.content,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
