
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
    
    // Allow users to read and write their own tasks
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if isUser(userId);
    }

    // Allow users to read and write their own user settings
    match /userSettings/{userId} {
      allow read, write: if isUser(userId);
    }

    // Allow users to read and write their own categories
    match /users/{userId}/categories/{categoryId} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own workouts
    match /users/{userId}/workouts/{workoutId} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own meals
    match /users/{userId}/meals/{mealId} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own progress logs
    match /users/{userId}/progress/{logId} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own fitness goals
    match /users/{userId}/fitness/{document=**} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own achievements
    match /users/{userId}/achievements/{achievementId} {
      allow read, write: if isUser(userId);
    }
    
    // Allow users to read and write their own streaks
    match /users/{userId}/streaks/{streakId} {
      allow read, write: if isUser(userId);
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
