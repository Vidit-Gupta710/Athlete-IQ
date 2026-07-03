import json
from typing import List
from pydantic import BaseModel, Field
from copilot.config import get_groq_client, DEFAULT_MODEL

# Define schemas for input and output
class ReportFinding(BaseModel):
    jargon: str = Field(..., description="The medical jargon term from the report (e.g., 'subluxation of the patella')")
    explanation: str = Field(..., description="The layman's explanation (e.g., 'kneecap sliding partially out of its normal position')")

class InterpretationResponse(BaseModel):
    summary: str = Field(..., description="A friendly, high-level summary of the report in simple terms")
    key_findings: List[ReportFinding] = Field(..., description="A list of specific medical terms found and their simplified definitions")
    severity_level: str = Field(..., description="Severity classification (Low, Moderate, High) with respect to athletic training impact")
    actionable_recovery_tips: List[str] = Field(..., description="General, safe recovery or active recovery ideas (e.g. isometric exercises, RICE protocol)")
    disclaimer: str = Field(..., description="A clear disclaimer reminding the user that this is an AI translation, NOT a medical diagnosis, and to consult their physician")

SYSTEM_PROMPT = """
You are AthleteIQ's Medical Report Interpreter. Your role is to take clinical medical reports (like MRIs, X-rays, or physical therapist notes) and translate them into friendly, plain English for an athlete.

CRITICAL INSTRUCTIONS:
1. DO NOT diagnose the patient. Your task is to explain what the written report says, not to determine what the patient has or should do medically.
2. Translate all medical jargon (e.g. 'edema', 'hypertrophy', 'effusion', 'lateral meniscus tear') into plain, easy-to-understand language.
3. Classify severity level (Low, Moderate, High) in terms of how much it typically limits standard athletic training.
4. Give general, safe rehab or recovery guidelines (e.g. 'focus on low-impact swimming', 'avoid heavy loading on the knee', 'apply cold therapy'). Never prescribe specific medication or surgery.
5. ALWAYS output a strong, mandatory medical disclaimer emphasizing that this is an AI translation, not a professional medical diagnosis or treatment plan.
6. Return your response ONLY as a valid JSON object matching the schema:
   {
     "summary": "High level explanation in layman's terms",
     "key_findings": [{"jargon": "medical term", "explanation": "simple term definition"}],
     "severity_level": "Low / Moderate / High",
     "actionable_recovery_tips": ["tip 1", "tip 2"],
     "disclaimer": "This AI-generated translation is for informational purposes only. It is NOT a medical diagnosis, prognosis, or treatment plan..."
   }
"""

def interpret_medical_report(report_text: str, model: str = DEFAULT_MODEL) -> InterpretationResponse:
    """
    Translates medical report jargon into layman's terms for the athlete.
    
    Args:
        report_text: Raw text of the MRI or physio report.
        model: Groq model to use.
        
    Returns:
        InterpretationResponse: Structured explanation, jargon definitions, severity, tips, and disclaimer.
    """
    client = get_groq_client()
    
    user_content = f"""
RAW MEDICAL REPORT TEXT:
\"\"\"
{report_text}
\"\"\"

Please interpret this report. Rememeber to output ONLY valid JSON matching the schema.
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content}
    ]

    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model,
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1500
        )
        
        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        
        return InterpretationResponse(
            summary=data.get("summary", ""),
            key_findings=[ReportFinding(**kf) for kf in data.get("key_findings", [])],
            severity_level=data.get("severity_level", "Unknown"),
            actionable_recovery_tips=data.get("actionable_recovery_tips", []),
            disclaimer=data.get("disclaimer", "")
        )
    except Exception as e:
        return InterpretationResponse(
            summary=f"Failed to interpret the report due to an error: {str(e)}",
            key_findings=[],
            severity_level="Unknown",
            actionable_recovery_tips=[],
            disclaimer="An error occurred. Please consult your physician directly."
        )

# Direct execution script for verification
if __name__ == "__main__":
    print("Testing Medical Report Interpreter...")
    mock_report = """
    EXAMINATION: MRI RIGHT KNEE
    CLINICAL HISTORY: 24-year-old basketball player with acute knee pain after landing.
    FINDINGS:
    There is a small joint effusion. The medial and lateral collateral ligaments are intact.
    There is a grade 2 sprain of the anterior cruciate ligament (ACL) showing hyperintensity on T2 images, but fibers remain contiguous.
    No definitive tear of the medial meniscus is identified. 
    Mild patellofemoral cartilage wear is noted.
    IMPRESSION: Grade 2 sprain of the ACL with mild joint effusion.
    """
    
    import os
    if not os.getenv("GROQ_API_KEY"):
        print("\n[WARNING] GROQ_API_KEY not found in environment. Printing mock API call behavior:")
        print("Mock Input Report:")
        print(mock_report.strip())
        print("\nExpected parsed interpretation fields:")
        print("  - summary: (Explain that there's a partial tear of the ACL and some fluid build-up in the knee joint)")
        print("  - key_findings: [")
        print("      {'jargon': 'joint effusion', 'explanation': 'fluid buildup or swelling in the joint'},")
        print("      {'jargon': 'grade 2 sprain of the ACL', 'explanation': 'partial tear of the main ligament stabilizing the knee'}")
        print("    ]")
        print("  - severity_level: 'Moderate' or 'High' (significant impact on basketball training)")
        print("  - actionable_recovery_tips: ['Rest the knee, apply compression', 'Avoid jumping or pivoting', 'Seek professional physiotherapy']")
    else:
        try:
            res = interpret_medical_report(mock_report)
            print("\nResponse from Groq:")
            print(f"Summary: {res.summary}")
            print(f"Severity: {res.severity_level}")
            print("Key Findings:")
            for f in res.key_findings:
                print(f"  - {f.jargon}: {f.explanation}")
            print("Actionable Tips:")
            for t in res.actionable_recovery_tips:
                print(f"  - {t}")
            print(f"\nDisclaimer: {res.disclaimer}")
        except Exception as err:
            print(f"Failed to generate response: {err}")
