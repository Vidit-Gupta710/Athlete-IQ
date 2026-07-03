import json
from typing import List
from pydantic import BaseModel, Field
from copilot.config import get_groq_client, DEFAULT_MODEL

# Define schemas for input and output
class MemoryContextItem(BaseModel):
    key: str = Field(..., description="The type of context (e.g., 'recent_injury', 'fitness_goal', 'nutrition_preference', 'current_plan')")
    value: str = Field(..., description="The detailed context information")

class CopilotQuery(BaseModel):
    question: str = Field(..., description="The question asked by the athlete")
    memories: List[MemoryContextItem] = Field(default=[], description="Past memory context of the athlete retrieved from the database/Cognee")

class CopilotResponse(BaseModel):
    answer: str = Field(..., description="The personalized, motivating, and scientifically-grounded answer to the athlete")
    personalized_flags: List[str] = Field(default=[], description="List of specific context items (keys) that were actively factored into this response (e.g. ['fitness_goal', 'recent_injury'])")

SYSTEM_PROMPT = """
You are AthleteIQ's Smart AI Sports Copilot, an elite sports performance coach, physiotherapist, and nutritionist. 
Your goal is to provide highly personalized, scientifically-backed, and motivating answers to athletes.

CRITICAL GUIDELINES:
1. NEVER give generic advice. If the athlete's memory context is provided, you MUST tailor your answer directly to their goals, injuries, and preferences.
2. If the athlete asks about training but has a recent injury in their memory context, address how they can train safely around the injury or suggest active recovery.
3. Be professional yet supportive and motivating, like an elite coach.
4. Maintain safety: If the athlete describes severe pain or asks for medical diagnoses, provide helpful recovery advice but explicitly remind them to consult a medical professional.
5. You must respond in a structured JSON format matching the schema:
   {
     "answer": "Your personalized response in markdown format (use bullet points and bold text for readability)",
     "personalized_flags": ["list of keys from the memory context that were used to personalize the answer"]
   }
"""

def generate_personalized_response(query: CopilotQuery, model: str = DEFAULT_MODEL) -> CopilotResponse:
    """
    Generates a personalized response for an athlete's question, incorporating their memory context.
    
    Args:
        query: CopilotQuery containing the athlete's question and memory context list.
        model: Groq model to use for completion.
        
    Returns:
        CopilotResponse: structured answer and personalization flags.
    """
    client = get_groq_client()
    
    # Format memory context for the prompt
    context_str = ""
    if query.memories:
        context_str = "ATHLETE MEMORY CONTEXT:\n" + "\n".join(
            f"- {item.key}: {item.value}" for item in query.memories
        )
    else:
        context_str = "No past athlete memory context is available. Provide a general but premium sports performance response."

    user_content = f"""
{context_str}

ATHLETE QUESTION:
"{query.question}"

Please generate your response. Remember to output ONLY valid JSON matching the schema.
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content}
    ]

    try:
        # Request a JSON response from Groq
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model,
            response_format={"type": "json_object"},
            temperature=0.4,
            max_tokens=1024
        )
        
        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        
        return CopilotResponse(
            answer=data.get("answer", ""),
            personalized_flags=data.get("personalized_flags", [])
        )
    except Exception as e:
        # Fallback in case of parsing or API errors
        return CopilotResponse(
            answer=f"Sorry, I encountered an error while processing your request: {str(e)}",
            personalized_flags=[]
        )

# Direct execution script for verification
if __name__ == "__main__":
    print("Testing Smart AI Response Generator...")
    # Mock data for testing
    mock_query = CopilotQuery(
        question="Can I do heavy squats today?",
        memories=[
            MemoryContextItem(key="recent_injury", value="Mild patellar tendonitis in the right knee"),
            MemoryContextItem(key="fitness_goal", value="Increase lower body explosive power for basketball"),
            MemoryContextItem(key="current_plan", value="5x5 strength training cycle")
        ]
    )
    
    import os
    if not os.getenv("GROQ_API_KEY"):
        print("\n[WARNING] GROQ_API_KEY not found in environment. Printing mock API call behavior:")
        print(f"Athlete Question: {mock_query.question}")
        print("Athlete Memories:")
        for m in mock_query.memories:
            print(f"  - {m.key}: {m.value}")
        print("\nExpected personalized response fields:")
        print("  - answer: (Markdown instructions explaining how squats should be replaced or modified with light loads/isometric holds due to patellar tendonitis, while keeping basketball goals in mind)")
        print("  - personalized_flags: ['recent_injury', 'fitness_goal']")
    else:
        try:
            res = generate_personalized_response(mock_query)
            print("\nResponse from Groq:")
            print(f"Personalized Flags: {res.personalized_flags}")
            print(f"Answer:\n{res.answer}")
        except Exception as err:
            print(f"Failed to generate response: {err}")
