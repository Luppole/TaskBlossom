
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
      
      // Tasks subcollection
      match /tasks/{taskId} {
        allow read, write: if isUser(userId);
      }
      
      // Categories subcollection
      match /categories/{categoryId} {
        allow read, write: if isUser(userId);
      }
      
      // Workouts subcollection
      match /workouts/{workoutId} {
        allow read, write: if isUser(userId);
      }
      
      // Meals subcollection
      match /meals/{mealId} {
        allow read, write: if isUser(userId);
      }
      
      // Progress subcollection
      match /progress/{logId} {
        allow read, write: if isUser(userId);
      }
      
      // Friends subcollection
      match /friends/{friendId} {
        allow read, write: if isUser(userId);
      }
      
      // All other subcollections
      match /{collection}/{docId} {
        allow read, write: if isUser(userId);
      }
    }
    
    // User settings
    match /userSettings/{userId} {
      allow read: if isUser(userId) || 
        (isAuthenticated() && hasPublicProfile(userId));
      allow write: if isUser(userId);
    }
    
    // Friend requests
    match /friendRequests/{requestId} {
      allow read: if isAuthenticated() && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
      allow create: if isAuthenticated() && 
        request.resource.data.senderId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
    }
  }
}
