// script.js

// Get DOM element references
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

// Handle Google Sign-In
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      setupUserDoc(user);
      showDashboard(user);
    })
    .catch(error => {
      console.error("Sign-in error:", error);
      alert("Sign-in failed!");
    });
});

// Handle Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
  });
});

// Listen for authentication state changes
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    setupUserDoc(user);
    showDashboard(user);
  }
});

// Create or update the user document in the "user" collection if needed
function setupUserDoc(user) {
  const userRef = db.collection("user").doc(user.uid);
  userRef.get().then(doc => {
    if (!doc.exists) {
      // If the document doesn't exist, create it with initial values.
      userRef.set({
        totalTime: 0,
        categories: {
          academic: 0,
          entertainment: 0
        }
      })
      .then(() => {
        console.log("User document created in 'user' collection.");
      })
      .catch(error => {
        console.error("Error creating user document:", error);
      });
    }
  });
}

// Display the dashboard and use a real-time listener to fetch and display data
function showDashboard(user) {
  // Hide login and display dashboard
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("user-name").textContent = user.displayName;
  
  // Set up a real-time listener for the user's document in the "user" collection.
  const userRef = db.collection("user").doc(user.uid);
  userRef.onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      const categories = data.categories || {};

      // Update the numeric displays
      document.getElementById("academic-data").textContent = categories.academic || 0;
      document.getElementById("entertainment-data").textContent = categories.entertainment || 0;
      
      // // Optionally, update additional lists if needed
      // document.getElementById("academic-list").innerHTML = `<li>academic: ${categories.academic} mins</li>`;
      // document.getElementById("entertainment-list").innerHTML = `<li>entertainment: ${categories.entertainment} mins</li>`;
    } else {
      console.warn("No stats found for this user.");
    }
  }, error => {
    console.error("Error with onSnapshot:", error);
  });
}

// Test Button: Update academic time by 10 minutes to simulate an update from your extension.
document.getElementById("update-academic-btn").addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    const userRef = db.collection("user").doc(user.uid);
    userRef.update({
      "categories.academic": firebase.firestore.FieldValue.increment(10),
      totalTime: firebase.firestore.FieldValue.increment(10)
    })
    .then(() => {
      console.log("Academic time updated by 10 mins for testing.");
    })
    .catch(error => {
      console.error("Error updating document:", error);
    });
  } else {
    alert("No user signed in!");
  }
});

// Add event listener for connect extension button
document.getElementById('connect-extension-btn').addEventListener('click', async () => {
  try {
    // Get the current user
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Please sign in first');
      return;
    }

    // Get the ID token
    const token = await user.getIdToken();
    
    // Send the token to the extension
    window.postMessage({
      type: 'AUTH_TOKEN',
      token: token
    }, '*');

    // Listen for response from extension
    window.addEventListener('message', function authResponseHandler(event) {
      if (event.data.type === 'AUTH_RESPONSE') {
        if (event.data.success) {
          alert('Successfully connected to extension!');
        } else {
          alert('Failed to connect to extension: ' + event.data.error);
        }
        window.removeEventListener('message', authResponseHandler);
      }
    });
  } catch (error) {
    console.error('Error connecting to extension:', error);
    alert('Failed to connect to extension. Please try again.');
  }
});
