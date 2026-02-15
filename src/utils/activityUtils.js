import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Initialize sample activities if none exist
export const initializeSampleActivities = async () => {
  try {
    const activitiesCollection = collection(db, 'activities');
    const existingActivities = await getDocs(activitiesCollection);
    
    if (existingActivities.empty) {
      // Add sample activities
      const sampleActivities = [
        {
          title: 'New user registered',
          description: 'John Doe joined 2 hours ago',
          type: 'user',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active',
          icon: 'Users'
        },
        {
          title: 'Event started',
          description: 'Tech Hackathon began at 9:00 AM',
          type: 'event',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'active',
          icon: 'Calendar'
        },
        {
          title: 'New complaint received',
          description: 'Regarding venue facilities',
          type: 'complaint',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'pending',
          icon: 'AlertTriangle'
        },
        {
          title: 'Project submitted',
          description: 'Team Alpha submitted their final project',
          type: 'project',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          status: 'completed',
          icon: 'Trophy'
        },
        {
          title: 'Message sent',
          description: 'Notification sent to all participants',
          type: 'message',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
          status: 'active',
          icon: 'MessageSquare'
        }
      ];

      for (const activity of sampleActivities) {
        await addDoc(activitiesCollection, activity);
      }
      
      console.log('Sample activities added to database');
    } else {
      console.log(`Found ${existingActivities.size} existing activities`);
    }
  } catch (error) {
    console.error('Error initializing sample activities:', error);
  }
};