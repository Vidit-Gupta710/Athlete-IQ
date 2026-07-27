import os
import sys
import uuid
import datetime
import re
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables from root env
load_dotenv()

# Setup import paths so we can import from memory-backend and copilot
root_dir = Path(__file__).parent.resolve()
backend_dir = root_dir / "backend"
sys.path.append(str(root_dir))
sys.path.append(str(backend_dir))

# Configure Cognee directories to project-local absolute paths
system_dir = root_dir / ".cognee_system"
data_dir = root_dir / ".cognee_data"
(system_dir / "databases").mkdir(parents=True, exist_ok=True)
data_dir.mkdir(parents=True, exist_ok=True)

os.environ["SYSTEM_ROOT_DIRECTORY"] = str(system_dir)
os.environ["DATA_ROOT_DIRECTORY"] = str(data_dir)

# Configure Cognee environment variables
os.environ["LLM_PROVIDER"] = "custom"
os.environ["LLM_MODEL"] = os.getenv("GROQ_MODEL", "groq/llama-3.3-70b-versatile")
os.environ["LLM_RATE_LIMIT_ENABLED"] = "true"
os.environ["LLM_RATE_LIMIT_REQUESTS"] = "10"
os.environ["LLM_RATE_LIMIT_INTERVAL"] = "60"
os.environ["LLM_MAX_COMPLETION_TOKENS"] = "4096"
os.environ["EMBEDDING_PROVIDER"] = "fastembed"
os.environ["EMBEDDING_MODEL"] = "sentence-transformers/all-MiniLM-L6-v2"

# Import memory API functions
import memory_api

# Import AI Copilot modules
from copilot.response_generator import (
    generate_personalized_response, 
    CopilotQuery, 
    MemoryContextItem
)
from copilot.report_interpreter import (
    interpret_medical_report,
    ReportFinding,
    InterpretationResponse
)
from copilot.graph_visualizer import (
    generate_graph_data
)

app = FastAPI(title="AthleteIQ Integrated Backend", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    print("Running database migrations for Cognee memory...")
    try:
        from cognee.infrastructure.databases.relational import create_db_and_tables
        await create_db_and_tables()
        import cognee
        await cognee.run_migrations()
        print("Cognee migrations complete.")
    except Exception as e:
        print(f"Error running cognee migrations: {e}")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistent database for athlete profiles
import json
athletes_db_file = root_dir / ".cognee_system" / "athletes_db.json"

def load_athletes_db():
    if athletes_db_file.exists():
        try:
            with open(athletes_db_file, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading athletes_db: {e}")
    return {}

def save_athletes_db(db):
    try:
        with open(athletes_db_file, "w") as f:
            json.dump(db, f)
    except Exception as e:
        print(f"Error saving athletes_db: {e}")

athletes_db = load_athletes_db()

class InjuryDetail(BaseModel):
    name: str
    painLevel: Optional[int] = 0
    notes: Optional[str] = ""

class AthleteProfileRequest(BaseModel):
    name: str
    age: int
    sport: str
    level: str
    trainingFrequency: str
    goals: str
    injuries: List[InjuryDetail] = []

class ChatRequest(BaseModel):
    athleteId: str
    message: str

async def ingest_and_build_graph_task(athlete_id: str, athlete_name: str, entries: List[str]):
    """Background task to add data to Cognee memory and rebuild the graph."""
    print(f"[BACKGROUND TASK] Ingesting {len(entries)} entries into Cognee memory for {athlete_name}...")
    if athlete_id in athletes_db:
        athletes_db[athlete_id]["memory_status"] = "processing"
    try:
        # Add to memory batch
        await memory_api.add_athlete_data_batch(entries)
        print(f"[BACKGROUND TASK] Rebuilding Cognee knowledge graph (cognify)...")
        await memory_api.build_graph()
        print(f"[BACKGROUND TASK] Knowledge graph rebuilt successfully.")
        if athlete_id in athletes_db:
            athletes_db[athlete_id]["memory_status"] = "ready"
    except Exception as e:
        print(f"[BACKGROUND TASK] Error building knowledge graph for {athlete_name}: {e}")
        if athlete_id in athletes_db:
            athletes_db[athlete_id]["memory_status"] = "error"

def generate_mock_copilot_response(question: str, memories: List[MemoryContextItem]) -> str:
    """Helper to generate a high-fidelity mock response when GROQ_API_KEY is not set."""
    goal = ""
    plan = ""
    injury = ""
    retrieved = ""
    for m in memories:
        if m.key == "fitness_goal":
            goal = m.value
        elif m.key == "current_plan":
            plan = m.value
        elif m.key == "recent_injury":
            injury = m.value
        elif m.key == "retrieved_memory":
            retrieved = m.value
            
    q = question.lower()
    
    response = "### 🤖 Smart AI Copilot (Mock Mode - No GROQ_API_KEY configured)\n\n"
    
    if any(word in q for word in ["train", "exercise", "workout", "active", "can i"]):
        response += "Based on your current status and memory logs, here is your customized training recovery guidance:\n\n"
        if injury:
            response += f"- **Current Injury/Limitations:** You have an active injury: **{injury}**.\n"
        if plan:
            response += f"- **Sport & Plan:** Active in **{plan}**.\n"
        if goal:
            response += f"- **Primary Goal:** {goal}.\n"
        if retrieved:
            response += f"- **Retrieved Memory context:** {retrieved}\n"
            
        response += "\n"
        if "shoulder" in injury.lower() or "shoulder" in retrieved.lower() or "sprain" in injury.lower():
            response += (
                "**Rehab Coach Recommendation:**\n"
                "- Since you have a **shoulder sprain** and reported tightness when doing pushups, you should **avoid heavy pressing** or overhead work today.\n"
                "- Instead, focus on **Rotator Cuff Isometric Activation** (like banded internal/external rotations) and active mobility as indicated in your rehab timeline.\n"
                "- Keep any movements under a 3/10 pain threshold. If you feel any pinching, stop immediately!"
            )
        elif "acl" in injury.lower() or "knee" in injury.lower() or "tendonitis" in injury.lower():
            response += (
                "**Rehab Coach Recommendation:**\n"
                "- Since you have a **knee limitation**, you should avoid high-impact jumping or running.\n"
                "- Replace heavy squats with **Isometric Wall Sits** or Spanish Squats to load the tendon safely.\n"
                "- Integrate collagen peptides and Vitamin C for joint synthesis."
            )
        else:
            response += (
                "**Rehab Coach Recommendation:**\n"
                "- Adjust your training volume to stay within comfort limits.\n"
                "- Focus on targeted dynamic warmups and core stability work."
            )
    else:
        response += f"Here is what I retrieved from your profile and memory context to support your recovery:\n\n"
        if injury:
            response += f"- **Active injury:** {injury}\n"
        if goal:
            response += f"- **Goal:** {goal}\n"
        if retrieved:
            response += f"- **Retrieved memory context:** {retrieved}\n"
        response += "\nHow else can I help you customize your athletic recovery plan today?"
        
    return response

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.post("/api/athlete/profile")
async def create_profile(profile: AthleteProfileRequest, background_tasks: BackgroundTasks):
    athlete_id = f"athlete_{uuid.uuid4().hex[:8]}"
    
    # Store profile in our database and persist
    profile_dict = profile.model_dump()
    profile_dict["id"] = athlete_id
    profile_dict["memory_status"] = "processing"
    athletes_db[athlete_id] = profile_dict
    save_athletes_db(athletes_db)
    
    # Create descriptive profile entries to index in Cognee
    entries = [
        f"Athlete {profile.name} is a {profile.age}-year-old who plays {profile.sport} at a {profile.level} level.",
        f"Athlete {profile.name}'s training goals are: {profile.goals}.",
        f"Athlete {profile.name}'s training frequency is {profile.trainingFrequency}."
    ]
    
    for injury in profile.injuries:
        entries.append(
            f"Athlete {profile.name} currently has a {injury.name} injury with a pain level of {injury.painLevel}/10. "
            f"Injury notes: {injury.notes}."
        )
        
    # Queue Cognee ingestion and cognify as a background task to prevent blocking the response
    background_tasks.add_task(ingest_and_build_graph_task, athlete_id, profile.name, entries)
    
    return {
        "success": True,
        "athlete_id": athlete_id,
        "profile": profile_dict
    }

@app.get("/api/athlete/{athleteId}/status")
async def get_athlete_status(athleteId: str):
    """Retrieve the current memory graph status for a specific athlete."""
    if athleteId not in athletes_db:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    return {
        "athleteId": athleteId,
        "memory_status": athletes_db[athleteId].get("memory_status", "ready")
    }

@app.get("/api/athlete/{athleteId}/dashboard")
async def get_dashboard(athleteId: str):
    if athleteId not in athletes_db:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile = athletes_db[athleteId]
    injuries = profile.get("injuries", [])
    
    # Calculate recovery metrics
    training_frequency = profile.get("trainingFrequency", "")
    if "5" in training_frequency or "daily" in training_frequency.lower():
        training_load = "High (84% load)"
    elif "1-2" in training_frequency:
        training_load = "Low (45% load)"
    else:
        training_load = "Medium (72% load)"
        
    recovery_score = "95%"
    if injuries:
        max_pain = max([int(inj.get("painLevel", 0) or 0) for inj in injuries])
        recovery_score = f"{95 - (max_pain * 5)}%"
        
    alerts = [
        {
            "id": "alert_1",
            "type": "warning",
            "title": "High Load Soreness Potential",
            "message": f"Your training frequency ({training_frequency}) suggests joint fatigue. Perform structured mobility before workouts.",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        },
        {
            "id": "alert_2",
            "type": "info",
            "title": "Goal Focus: Recovery",
            "message": f"Focusing on '{profile.get('goals')}' - integrate 15 minutes of recovery breathing after light sessions.",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
    ]
    
    return {
        "athleteId": athleteId,
        "metrics": {
            "trainingLoad": training_load,
            "recoveryScore": recovery_score,
            "activeInjuriesCount": len(injuries)
        },
        "injuries": injuries,
        "alerts": alerts
    }

@app.get("/api/athlete/{athleteId}/timeline")
async def get_timeline(athleteId: str):
    if athleteId not in athletes_db:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile = athletes_db[athleteId]
    injuries = profile.get("injuries", [])
    today = datetime.datetime.utcnow()
    
    def offset_days(d):
        return (today + datetime.timedelta(days=d)).isoformat() + "Z"
        
    if not injuries:
        return [
            {
                "id": "t1",
                "title": "Initial Assessment & Baseline Scans",
                "description": "Completed baseline evaluations and registered training parameters.",
                "date": offset_days(-2),
                "type": "checkpoint",
                "status": "completed"
            },
            {
                "id": "t2",
                "title": "General Conditioning",
                "description": "Began target volume builder phase.",
                "date": offset_days(0),
                "type": "rehab",
                "status": "active"
            }
        ]
        
    injury_name = injuries[0].get("name", "").lower()
    
    # Custom recovery timeline based on injury location
    if "shoulder" in injury_name or "rotator" in injury_name:
        return [
            {
                "id": "t1",
                "title": "Shoulder Decompression & Rest",
                "description": "Limit overhead volume. Implement passive mobility and ice massage.",
                "date": offset_days(-5),
                "type": "checkpoint",
                "status": "completed"
            },
            {
                "id": "t2",
                "title": "Rotator Cuff Isometric Activation",
                "description": "Banded internal/external rotations. Cease pushups/pressing if pain exceeds 3/10.",
                "date": offset_days(0),
                "type": "rehab",
                "status": "active"
            },
            {
                "id": "t3",
                "title": "Scapular Retraction & Rear Delt Raises",
                "description": "Strengthen rear shoulder cuff with Scapular Y-T-W and Face Pulls.",
                "date": offset_days(6),
                "type": "rehab",
                "status": "pending"
            },
            {
                "id": "t4",
                "title": "Dynamic Loading Progressions",
                "description": "Gradually reintroduce bodyweight pushups and overhead athletic patterns.",
                "date": offset_days(14),
                "type": "milestone",
                "status": "pending"
            },
            {
                "id": "t5",
                "title": "Full Functional Release",
                "description": "Full sports training clearance after passing rotator cuff strength evaluation.",
                "date": offset_days(21),
                "type": "milestone",
                "status": "pending"
            }
        ]
    elif "acl" in injury_name or "knee" in injury_name or "tendonitis" in injury_name:
        return [
            {
                "id": "t1",
                "title": "Joint Effusion Control",
                "description": "RICE protocol. Limit high-impact running to reduce knee fluid swelling.",
                "date": offset_days(-7),
                "type": "checkpoint",
                "status": "completed"
            },
            {
                "id": "t2",
                "title": "Tendon Loading & Wall Sits",
                "description": "Start Spanish squats and slow eccentric leg extensions to restore collagen strength.",
                "date": offset_days(0),
                "type": "rehab",
                "status": "active"
            },
            {
                "id": "t3",
                "title": "Proprioception & Balance",
                "description": "Perform single-leg stability drills to restore neuromotor coordination.",
                "date": offset_days(7),
                "type": "rehab",
                "status": "pending"
            },
            {
                "id": "t4",
                "title": "Dynamic Running & Plyometrics",
                "description": "Begin controlled straight-line jogging and double-leg landings.",
                "date": offset_days(16),
                "type": "milestone",
                "status": "pending"
            },
            {
                "id": "t5",
                "title": "Return to Play Clearance",
                "description": "Full release to normal athletic training and competitive drills.",
                "date": offset_days(28),
                "type": "milestone",
                "status": "pending"
            }
        ]
    else:
        return [
            {
                "id": "t1",
                "title": "Initial Evaluation",
                "description": f"Completed diagnostic review for {injuries[0].get('name')}.",
                "date": offset_days(-3),
                "type": "checkpoint",
                "status": "completed"
            },
            {
                "id": "t2",
                "title": "Controlled Mobility Phase",
                "description": "Active mobility drills for target area to clear localized soreness.",
                "date": offset_days(0),
                "type": "rehab",
                "status": "active"
            },
            {
                "id": "t3",
                "title": "Return to Play Practice",
                "description": "Progressive strength test of adjacent joints.",
                "date": offset_days(10),
                "type": "milestone",
                "status": "pending"
            }
        ]

@app.get("/api/athlete/{athleteId}/graph")
async def get_graph(athleteId: str):
    if athleteId not in athletes_db:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile = athletes_db[athleteId]
    injuries = profile.get("injuries", [])
    
    # Match athlete injury keywords to knowledge base keys in graph_visualizer
    injury_key = "patellar_tendonitis"
    if injuries:
        name = injuries[0].get("name", "").lower()
        if "shoulder" in name or "rotator" in name:
            injury_key = "rotator_cuff_tendonitis"
        elif "acl" in name:
            injury_key = "acl_sprain"
        elif "knee" in name or "patellar" in name:
            injury_key = "patellar_tendonitis"
            
    # Generate and return nodes and edges
    graph_data = generate_graph_data(injury_key)
    return graph_data
@app.get("/api/graph/{injuryKey}")
@app.get("/graph/{injuryKey}")
async def get_graph_by_key(injuryKey: str):
    return generate_graph_data(injuryKey)

@app.get("/api/graph/{injuryKey}")
async def get_graph_by_key(injuryKey: str):
    """Fetch knowledge graph data by specific injury key."""
    return generate_graph_data(injuryKey)

@app.get("/api/athletes/list")
async def list_athletes():
    """Retrieve all stored athlete profiles and count for coach dashboards or aggregate queries."""
    return {
        "count": len(athletes_db),
        "athletes": list(athletes_db.values())
    }

@app.post("/api/chat")
async def chat(req: ChatRequest, background_tasks: BackgroundTasks):
    athlete_id = req.athleteId
    message = req.message
    
    if athlete_id not in athletes_db:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
        
    profile = athletes_db[athlete_id]
    athlete_name = profile.get("name", "Athlete")
    
    # Case A: Medical Scan / Report File Upload Check
    if "I have uploaded a medical file:" in message:
        # Extract filename using regex
        match = re.search(r'I have uploaded a medical file:\s*["\']([^"\']+)["\']', message)
        filename = match.group(1) if match else "medical_report.txt"
        
        # Decide scan details based on profile injuries (e.g. shoulder report for Rahul)
        is_shoulder = any("shoulder" in inj.get("name", "").lower() or "rotator" in inj.get("name", "").lower() for inj in profile.get("injuries", []))
        
        if is_shoulder:
            report_text = f"""
            EXAMINATION: MRI LEFT SHOULDER (GLENOHUMERAL JOINT)
            CLINICAL HISTORY: {athlete_name}, a {profile.get('age', 24)}-year-old athlete, reports sharp pain during dynamic overhead movements and pushups.
            FINDINGS:
            There is mild subacromial impingement with joint effusion.
            The rotator cuff shows signs of mild supraspinatus tendinosis and edema, but fibers remain contiguous without a full thickness tear.
            The glenoid labrum is intact. There is minor joint capsular thickening.
            IMPRESSION: Supraspinatus tendinosis (mild rotator cuff strain) with subacromial impingement.
            """
        else:
            report_text = f"""
            EXAMINATION: MRI RIGHT KNEE
            CLINICAL HISTORY: {athlete_name}, a {profile.get('age', 24)}-year-old athlete, reports knee instability after landing.
            FINDINGS:
            There is a small joint effusion. The collateral ligaments are intact.
            There is a grade 2 sprain of the anterior cruciate ligament (ACL) showing hyperintensity, but fibers remain contiguous.
            IMPRESSION: Grade 2 sprain of the ACL with mild joint effusion.
            """
            
        # Run report interpreter with fallback
        try:
            interpreted = interpret_medical_report(report_text)
        except Exception as e:
            if "GROQ_API_KEY" in str(e) or not os.getenv("GROQ_API_KEY"):
                interpreted = InterpretationResponse(
                    summary="Mild rotator cuff supraspinatus tendinosis and subacromial impingement without full thickness tear.",
                    key_findings=[
                        ReportFinding(jargon="subacromial impingement", explanation="Shoulder joint structures pinching during arm movement"),
                        ReportFinding(jargon="supraspinatus tendinosis", explanation="Inflammation and wear of the main top rotator cuff tendon")
                    ],
                    severity_level="Moderate",
                    actionable_recovery_tips=[
                        "Cease standard overhead pressing and pushups temporarily",
                        "Implement banded external rotations and scapular activations",
                        "Cool and compress the shoulder if acute soreness occurs"
                    ],
                    disclaimer="This is a mock AI interpretation. Please consult your physical therapist."
                )
            else:
                raise e
        
        # Construct and format AI response
        response_md = (
            f"### 📄 Medical Report Interpretation: **{filename}**\n\n"
            f"**AI Summary:** {interpreted.summary}\n\n"
            f"**Training Severity Impact:** `{interpreted.severity_level}`\n\n"
            f"**Key Findings Translated:**\n"
        )
        for finding in interpreted.key_findings:
            response_md += f"- **{finding.jargon}**: {finding.explanation}\n"
            
        response_md += "\n**Actionable Recovery Tips:**\n"
        for tip in interpreted.actionable_recovery_tips:
            response_md += f"- {tip}\n"
            
        response_md += f"\n_*Disclaimer: {interpreted.disclaimer}_"
        
        # Ingest interpreted findings into Cognee in background so the LLM remembers it in subsequent questions
        cognee_report_fact = f"Athlete {athlete_name}'s medical report ({filename}) interpreted findings: {interpreted.summary}. Severity level: {interpreted.severity_level}."
        background_tasks.add_task(ingest_and_build_graph_task, athlete_id, athlete_name, [cognee_report_fact])
        
        return {
            "success": True,
            "reply": response_md,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
    # Case B: Workout Ingestion Check (e.g. "Log a workout")
    is_log_entry = any(word in message.lower() for word in ["log", "workout", "completed", "soreness", "trained"])
    if is_log_entry:
        log_fact = f"On {datetime.date.today().strftime('%B %d, %Y')}, Athlete {athlete_name} logged: '{message}'."
        background_tasks.add_task(ingest_and_build_graph_task, athlete_id, athlete_name, [log_fact])
        
    # Query Cognee memory graph to get relevant context
    cognee_context = await memory_api.chat_with_memory(message, athlete_id)
    
    # Formulate memory items for response generator
    memories = [
        MemoryContextItem(key="fitness_goal", value=profile.get("goals", "")),
        MemoryContextItem(key="current_plan", value=f"Sport: {profile.get('sport', '')}, Level: {profile.get('level', '')}, Training frequency: {profile.get('trainingFrequency', '')}")
    ]
    
    injuries_str = ", ".join([f"{inj.get('name')} (pain level: {inj.get('painLevel')}/10, notes: {inj.get('notes')})" for inj in profile.get("injuries", [])])
    if injuries_str:
        memories.append(MemoryContextItem(key="recent_injury", value=injuries_str))
        
    if cognee_context and "No answer found" not in str(cognee_context):
        if isinstance(cognee_context, list):
            cognee_context_str = ", ".join([str(item) for item in cognee_context])
        else:
            cognee_context_str = str(cognee_context)
        memories.append(MemoryContextItem(key="retrieved_memory", value=cognee_context_str))
        
    # Call response generator with fallback
    try:
        copilot_query = CopilotQuery(question=message, memories=memories)
        copilot_response = generate_personalized_response(copilot_query)
        reply = copilot_response.answer
    except Exception as e:
        if "GROQ_API_KEY" in str(e) or not os.getenv("GROQ_API_KEY"):
            reply = generate_mock_copilot_response(message, memories)
        else:
            raise e
    
    return {
        "success": True,
        "reply": reply,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
