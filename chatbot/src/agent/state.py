from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """The state of the assistant."""
    # The messages in the conversation
    messages: Annotated[list, add_messages]
    # The JWT token for authentication
    jwt_token: str
