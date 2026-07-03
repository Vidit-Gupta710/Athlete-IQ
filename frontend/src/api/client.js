import { API_BASE_URL } from '../utils/constants';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.useRealBackend = false; 
  }

  async get(path) {
    if (!this.useRealBackend) {
      return this.handleMockGet(path);
    }
    try {
      const response = await fetch(`${this.baseUrl}${path}`);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API GET Error for ${path}:`, error);
      throw error;
    }
  }

  async post(path, body) {
    if (!this.useRealBackend) {
      return this.handleMockPost(path, body);
    }
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API POST Error for ${path}:`, error);
      throw error;
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {}
      throw new Error(errorJson.message || errorText || 'API Error');
    }
    return await response.json();
  }

  getMockDb() {
    let db = localStorage.getItem('athlete_mock_db');
    if (!db) {
      db = {
        athletes: {},
        chats: {},
        timelines: {},
        graphs: {}
      };
      localStorage.setItem('athlete_mock_db', JSON.stringify(db));
    } else {
      db = JSON.parse(db);
    }
    return db;
  }

  saveMockDb(db) {
    localStorage.setItem('athlete_mock_db', JSON.stringify(db));
  }

  sleep(ms = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleMockGet(path) {
    await this.sleep();
    const db = this.getMockDb();
    
    // Pattern: /athlete/{id}/dashboard
    let match = path.match(/^\/athlete\/([^/]+)\/dashboard$/);
    if (match) {
      const id = match[1];
      const athlete = db.athletes[id];
      if (!athlete) {
        throw new Error('Athlete profile not found');
      }
      
      const injuriesCount = athlete.injuries && athlete.injuries.length > 0 ? athlete.injuries.length : 0;
      return {
        athleteId: id,
        metrics: {
          trainingLoad: athlete.sport === 'Football' ? 'Medium (72% load)' : 'High (84% load)',
          recoveryScore: injuriesCount > 0 ? '65%' : '90%',
          activeInjuriesCount: injuriesCount
        },
        injuries: athlete.injuries || [],
        alerts: [
          {
            id: 'alert_1',
            type: 'warning',
            title: 'High Load Soreness Potential',
            message: `Your training frequency (${athlete.trainingFrequency}) suggests moderate joint fatigue. Perform structured mobility before workouts.`,
            timestamp: new Date().toISOString()
          },
          {
            id: 'alert_2',
            type: 'info',
            title: 'Goal Focus: Recovery',
            message: `Focusing on "${athlete.goals}" - integrate 15 minutes of recovery breathing after light sessions.`,
            timestamp: new Date().toISOString()
          }
        ]
      };
    }

    // Pattern: /athlete/{id}/timeline
    match = path.match(/^\/athlete\/([^/]+)\/timeline$/);
    if (match) {
      const id = match[1];
      const timelineData = db.timelines[id] || this.getSeedTimeline(id, db.athletes[id]);
      db.timelines[id] = timelineData;
      this.saveMockDb(db);
      return timelineData;
    }

    // Pattern: /athlete/{id}/graph
    match = path.match(/^\/athlete\/([^/]+)\/graph$/);
    if (match) {
      const id = match[1];
      const graphData = db.graphs[id] || this.getSeedGraph(id);
      db.graphs[id] = graphData;
      this.saveMockDb(db);
      return graphData;
    }

    throw new Error(`Mock GET path not implemented: ${path}`);
  }

  async handleMockPost(path, body) {
    await this.sleep();
    const db = this.getMockDb();

    // Pattern: /athlete/profile
    if (path === '/athlete/profile') {
      const athleteId = 'athlete_' + Math.random().toString(36).substr(2, 9);
      const newAthlete = {
        id: athleteId,
        name: body.name || 'John Doe',
        age: body.age || 24,
        sport: body.sport || 'General Athleticism',
        level: body.level || 'Intermediate',
        goals: body.goals || 'Performance Recovery',
        trainingFrequency: body.trainingFrequency || '3-4 times a week',
        injuries: body.injuries || []
      };

      db.athletes[athleteId] = newAthlete;
      this.saveMockDb(db);
      
      return {
        success: true,
        athlete_id: athleteId,
        profile: newAthlete
      };
    }

    // Pattern: /chat
    if (path === '/chat') {
      const athleteId = body.athleteId;
      const userMessage = body.message;

      if (!athleteId || !db.athletes[athleteId]) {
        throw new Error('Unauthorized or Invalid Athlete ID');
      }

      const athlete = db.athletes[athleteId];
      const aiReply = this.generateAiResponse(userMessage, athlete);

      return {
        success: true,
        reply: aiReply,
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(`Mock POST path not implemented: ${path}`);
  }

  getSeedTimeline(athleteId, athlete) {
    const today = new Date();
    const subDays = (d) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
    const addDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

    const baseTimeline = [
      {
        id: 't1',
        title: 'Initial Assessment & Baseline Scans',
        description: 'Completed baseline range of motion evaluations and registered current pain symptoms.',
        date: subDays(12),
        type: 'checkpoint',
        status: 'completed'
      },
      {
        id: 't2',
        title: 'Active Mobility & Controlled Load',
        description: 'Began progressive loading exercises and structural mobility routines to reduce joint stiffness.',
        date: subDays(4),
        type: 'rehab',
        status: 'completed'
      },
      {
        id: 't3',
        title: 'Isometric Strengthening',
        description: 'Focusing on static muscle holds under low tension. Monitor pain threshold level.',
        date: today.toISOString(),
        type: 'rehab',
        status: 'active'
      },
      {
        id: 't4',
        title: 'Dynamic Exercise Introduction',
        description: 'Starting light running, plyometrics, or sport-specific dynamic load targets.',
        date: addDays(8),
        type: 'milestone',
        status: 'pending'
      },
      {
        id: 't5',
        title: 'Full Return to Play Practice',
        description: 'Mock game simulation, agility tests and final clearance clearance benchmark checks.',
        date: addDays(20),
        type: 'milestone',
        status: 'pending'
      }
    ];
    return baseTimeline;
  }

  getSeedGraph(athleteId) {
    return {
      nodes: [
        { id: '1', label: 'Patellar Tendinitis', type: 'injury', severity: 'moderate' },
        { id: '2', label: 'Quadriceps Tightness', type: 'symptom' },
        { id: '3', label: 'Jumping Volume', type: 'trigger' },
        { id: '4', label: 'Wall Sits (Isometric)', type: 'rehab' },
        { id: '5', label: 'Poliquin Step-ups', type: 'rehab' }
      ],
      edges: [
        { source: '2', target: '1', relation: 'exacerbates' },
        { source: '3', target: '1', relation: 'triggers' },
        { source: '4', target: '1', relation: 'relieves' },
        { source: '5', target: '1', relation: 'strengthens' }
      ]
    };
  }

  generateAiResponse(message, athlete) {
    const text = message.toLowerCase();
    const name = athlete.name;
    const sport = athlete.sport;
    
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      return `Hey ${name}! How is your recovery going today with ${sport}? Send any training or pain updates, and let me know how I can coach you.`;
    }

    if (text.includes('pain') || text.includes('hurt') || text.includes('injury') || text.includes('sore')) {
      return `I hear you, ${name}. Pain is a key feedback signal. Let's make sure we track its intensity. For any acute triggers, consider cooling or compression. Do you experience joint stiffness or localized muscle soreness? Describe if it flares up during load or at rest.`;
    }

    if (text.includes('exercise') || text.includes('workout') || text.includes('stretch') || text.includes('routine')) {
      return `To support your training as a ${sport} player, structural mobilization is vital. Start with passive static stretches (20-30s hold), followed by bodyweight active activations. If there is pain above a 4/10 scale, cease the exercise immediately.`;
    }

    return `Thanks for sharing that, ${name}. As your AI copilot, I recommend tracking this closely. If you see signs of fatigue, I can suggest adjustments to training load. Should we draft recovery timelines for ${sport}?`;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
