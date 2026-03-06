import os

async def get_tutor_response(message: str, course_context: str = None, history: list = []) -> str:
    """AI Tutor using OpenAI API."""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        # Demo mode fallback
        return f"""Great question about "{message}"!

Here's a detailed explanation:

**Key Concepts:**
1. This is a fundamental topic that requires understanding the underlying principles.
2. Let me break it down step by step for clarity.
3. Practice is essential for mastering this concept.

**Practical Example:**
Consider a real-world scenario where you would apply this knowledge. The key is to start with the basics and gradually build complexity.

**Tips for Learning:**
- Start with small examples and build up
- Practice regularly with coding exercises
- Review related documentation and resources

Would you like me to elaborate on any specific aspect? 😊"""

    # Production: Use OpenAI API
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        
        messages = [
            {"role": "system", "content": f"You are an expert AI tutor for an online education platform. {f'The student is studying: {course_context}.' if course_context else ''} Provide clear, educational responses with examples when appropriate."},
        ]
        
        for h in history[-10:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        
        messages.append({"role": "user", "content": message})
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"I apologize, but I'm having trouble connecting to the AI service. Error: {str(e)}"
