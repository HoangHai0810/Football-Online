from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """The state of the assistant."""
    messages: Annotated[list, add_messages]
    jwt_token: str
