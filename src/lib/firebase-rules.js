
// Copy these rules to your Firebase console at https://console.firebase.google.com/
// Navigate to Firestore Database > Rules and replace with these:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasPublicProfile(userId) {
      return exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.publicProfile == true;
    }
    
    // Basic user data
    match /users/{userId} {
      allow read: if isUser(userId);
      allow write: if isUser(userId);
      
      // Critical fix: Tasks subcollection permissions
      match /tasks/{taskId} {
        allow read, write: if isUser(userId);
      }
    }
    
    // User settings
    match /userSettings/{userId} {
      allow read, write: if isUser(userId);
    }
    
    // Tasks - Ensure this is separate from the nested rule above
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if isUser(userId);
    }

    // Categories
    match /users/{userId}/categories/{categoryId} {
      allow read, write: if isUser(userId);
    }
    
    // Workouts
    match /users/{userId}/workouts/{workoutId} {
      allow read, write: if isUser(userId);
    }
    
    // Meals
    match /users/{userId}/meals/{mealId} {
      allow read, write: if isUser(userId);
    }
    
    // Progress logs
    match /users/{userId}/progress/{logId} {
      allow read, write: if isUser(userId);
    }
    
    // Fitness goals
    match /users/{userId}/fitness/{document=**} {
      allow read, write: if isUser(userId);
    }
    
    // Achievements
    match /users/{userId}/achievements/{achievementId} {
      allow read, write: if isUser(userId);
    }
    
    // Streaks
    match /users/{userId}/streaks/{streakId} {
      allow read, write: if isUser(userId);
    }
    
    // Friend relationships
    match /users/{userId}/friends/{friendId} {
      allow read, write: if isUser(userId);
    }
    
    // Friend requests - improved rules to fix permissions issue
    match /friendRequests/{requestId} {
      allow read: if isAuthenticated() && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.senderId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
    }
    
    // Activities
    match /users/{userId}/activities/{activityId} {
      allow read, write: if isUser(userId);
    }
  }
}
