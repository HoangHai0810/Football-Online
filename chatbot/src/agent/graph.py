import os
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from .state import AgentState
from prompts import SYSTEM_PROMPT
from tools import get_game_context, optimize_my_squad

tools = [get_game_context, optimize_my_squad]
tool_node = ToolNode(tools)

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
)
model_with_tools = model.bind_tools(tools)

def call_model(state: AgentState):
    """Calls the LLM with the current state."""
    messages = state["messages"]

    if not messages or messages[0].type != "system":
        from langchain_core.messages import SystemMessage
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(messages)
    
    response = model_with_tools.invoke(messages)
                    
    return {"messages": [response]}

def should_continue(state: AgentState):
    """Determines if the flow should continue to tools or end."""
    last_message = state["messages"][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

graph = workflow.compile()
