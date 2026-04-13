import os
import httpx
from typing import Dict, Any, List
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("FOOTBALL_BACKEND_URL", "http://localhost:8080")

@tool
def get_game_context() -> str:
    """Gets the consolidated game context for the current user, including squad, career, tournaments, and missions."""
    jwt_token = os.getenv("JWT_TOKEN", "")
    headers = {"Authorization": f"Bearer {jwt_token}"}
    try:
        with httpx.Client() as client:
            response = client.get(f"{BACKEND_URL}/api/ai/v1/context", headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Formatting the data for the LLM
            res = "--- GAME CONTEXT ---\n"
            
            user = data.get("user", {})
            res += f"Manager: {user.get('username')} | Tier: {user.get('tier')} | Season: {user.get('season')} | Week: {user.get('week')} | Coins: {user.get('coins'):,}\n\n"
            
            res += "Squad Composition:\n"
            for p in data.get("squad", []):
                res += f"- {p['name']} (OVR {p['ovr']}, {p['position']}, Level {p['level']})\n"
            
            res += "\nTournament Progress:\n"
            for t in data.get("tournaments", []):
                res += f"- {t['name']} ({t['type']}):\n"
                for s in t.get("standings", []):
                    res += f"  #{s['rank']} {s['team']} ({s['points']} pts)\n"
            
            res += "\nPending Missions:\n"
            for m in data.get("missions", []):
                res += f"- {m['description']} ({m['progress']}/{m['target']})\n"
                
            return res
    except Exception as e:
        return f"Error fetching game context: {str(e)}"
