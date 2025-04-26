
// Copy these rules to your Firebase console at https://console.firebase.google.com/
// Navigate to Firestore Database > Rules and replace with these:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own tasks
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow users to read and write their own user settings
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow other users to read public profile settings if profile is public
      allow read: if request.auth != null && 
        resource.data.publicProfile == true &&
        (resource.data.shareProgress == true || resource.data.shareFitness == true);
    }

    // Allow users to read and write their own categories
    match /users/{userId}/categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own workouts
    match /users/{userId}/workouts/{workoutId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read workouts if sharing is enabled
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.shareFitness == true;
    }
    
    // Allow users to read and write their own meals
    match /users/{userId}/meals/{mealId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read meals if sharing is enabled
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.shareFitness == true;
    }
    
    // Allow users to read and write their own progress logs
    match /users/{userId}/progress/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read progress logs if sharing is enabled
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.shareProgress == true;
    }
    
    // Allow users to read and write their own fitness goals
    match /users/{userId}/fitness/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read fitness goals if sharing is enabled
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.shareFitness == true;
    }
    
    // Allow users to read and write their own achievements
    match /users/{userId}/achievements/{achievementId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read achievements if profile is public
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.publicProfile == true;
    }
    
    // Allow users to read and write their own streaks
    match /users/{userId}/streaks/{streakId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow friends to read streaks if profile is public
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/userSettings/$(userId)) &&
        get(/databases/$(database)/documents/userSettings/$(userId)).data.publicProfile == true;
    }
    
    // Friend relationships
    match /users/{userId}/friends/{friendId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Friend requests
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.senderId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.recipientId == request.auth.uid);
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
