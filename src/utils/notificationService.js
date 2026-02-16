import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Function to create a notification
export const createNotification = async (recipientId, title, message, type, relatedId = null) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      title,
      message,
      type,
      relatedId,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Specific notification functions for different types of activities
export const notifyNewComplaint = async (adminIds, complaintId, complaintTitle) => {
  for (const adminId of adminIds) {
    await createNotification(
      adminId,
      'New Complaint Received',
      `A new complaint "${complaintTitle}" has been submitted.`,
      'complaint',
      complaintId
    );
  }
};

export const notifyNewLostItem = async (adminIds, itemId, itemName) => {
  for (const adminId of adminIds) {
    await createNotification(
      adminId,
      'New Lost Item Reported',
      `A new lost item "${itemName}" has been reported.`,
      'lost-item',
      itemId
    );
  }
};

export const notifyNewFoundItem = async (adminIds, itemId, itemName) => {
  for (const adminId of adminIds) {
    await createNotification(
      adminId,
      'New Found Item Reported',
      `A new found item "${itemName}" has been reported.`,
      'found-item',
      itemId
    );
  }
};

export const notifyNewVolunteer = async (adminIds, volunteerId, volunteerName) => {
  for (const adminId of adminIds) {
    await createNotification(
      adminId,
      'New Volunteer Registration',
      `${volunteerName} has registered as a volunteer.`,
      'volunteer',
      volunteerId
    );
  }
};

// Function to get all admin user IDs
export const getAdminUserIds = async () => {
  // In a real app, you would query for users with admin role
  // For now, returning an empty array - this would be populated based on your admin user identification
  return []; // This should be populated based on your admin identification logic
};