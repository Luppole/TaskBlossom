
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
    
    function isUserFriend(userId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)/friends/$(userId));
    }
    
    function canViewProfileData(userId) {
      return isUser(userId) || hasPublicProfile(userId) || isUserFriend(userId);
    }
    
    function canViewProgressData(userId) {
      return isUser(userId) || 
        (
          exists(/databases/$(database)/documents/userSettings/$(userId)) &&
          get(/databases/$(database)/documents/userSettings/$(userId)).data.shareProgress == true && 
          (hasPublicProfile(userId) || isUserFriend(userId))
        );
    }
    
    function canViewFitnessData(userId) {
      return isUser(userId) || 
        (
          exists(/databases/$(database)/documents/userSettings/$(userId)) &&
          get(/databases/$(database)/documents/userSettings/$(userId)).data.shareFitness == true && 
          (hasPublicProfile(userId) || isUserFriend(userId))
        );
    }
    
    // Basic user data
    match /users/{userId} {
      allow read: if canViewProfileData(userId);
      allow write: if isUser(userId);
    }
    
    // User settings
    match /userSettings/{userId} {
      allow read, write: if isUser(userId);
      // Allow other users to read public profile settings if profile is public
      allow read: if hasPublicProfile(userId);
    }
    
    // Tasks
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
      // Allow friends to read workouts if sharing is enabled
      allow read: if canViewFitnessData(userId);
    }
    
    // Meals
    match /users/{userId}/meals/{mealId} {
      allow read, write: if isUser(userId);
      // Allow friends to read meals if sharing is enabled
      allow read: if canViewFitnessData(userId);
    }
    
    // Progress logs
    match /users/{userId}/progress/{logId} {
      allow read, write: if isUser(userId);
      // Allow friends to read progress logs if sharing is enabled
      allow read: if canViewProgressData(userId);
    }
    
    // Fitness goals
    match /users/{userId}/fitness/{document=**} {
      allow read, write: if isUser(userId);
      // Allow friends to read fitness goals if sharing is enabled
      allow read: if canViewFitnessData(userId);
    }
    
    // Achievements
    match /users/{userId}/achievements/{achievementId} {
      allow read, write: if isUser(userId);
      // Allow others to read achievements if profile is public
      allow read: if hasPublicProfile(userId) || isUserFriend(userId);
    }
    
    // Streaks
    match /users/{userId}/streaks/{streakId} {
      allow read, write: if isUser(userId);
      // Allow others to read streaks if profile is public
      allow read: if hasPublicProfile(userId) || isUserFriend(userId);
    }
    
    // Friend relationships
    match /users/{userId}/friends/{friendId} {
      allow read, write: if isUser(userId);
    }
    
    // Activities - these are visible to friends only
    match /users/{userId}/activities/{activityId} {
      allow read, write: if isUser(userId);
      allow read: if isAuthenticated() && isUserFriend(userId);
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
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
