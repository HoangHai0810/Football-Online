import os
from dotenv import load_dotenv

load_dotenv()

if os.getenv("LANGSMITH_TRACING") == "true":
    print(f"DEBUG: LangSmith tracing enabled for project: {os.getenv('LANGSMITH_PROJECT')}")

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent.graph import graph
from langchain_core.messages import HumanMessage

import time

app = FastAPI(title="Football Chatbot API")

RATE_LIMIT_WINDOW = 60
MAX_REQUESTS = 5
user_request_history = {}

def is_rate_limited(user_id: str) -> bool:
    now = time.time()
    if user_id not in user_request_history:
        user_request_history[user_id] = []
    
    user_request_history[user_id] = [t for t in user_request_history[user_id] if now - t < RATE_LIMIT_WINDOW]
    
    if len(user_request_history[user_id]) >= MAX_REQUESTS:
        return True
    
    user_request_history[user_id].append(now)
    return False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    
    # Check rate limit before processing
    if is_rate_limited(jwt_token):
        raise HTTPException(
            status_code=429, 
            detail="Too many requests. Please wait a minute before sending more messages."
        )

    os.environ["JWT_TOKEN"] = jwt_token
    
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
    }
    
    try:
        result = graph.invoke(initial_state)
        last_message = result["messages"][-1]
        
        if hasattr(last_message, 'content'):
            content = last_message.content
        else:
            content = last_message.get("content", "")

        if isinstance(content, list):
            content = " ".join([block.get("text", "") if isinstance(block, dict) else str(block) for block in content])
        
        return {
            "response": content,
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
