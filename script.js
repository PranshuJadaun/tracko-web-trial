// script.js

// Get DOM element references
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

// Add a log when script loads
console.log('TracKO website script loaded - ' + window.location.href);

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
    console.log('Auth state changed - user signed in:', user.uid);
    setupUserDoc(user);
    showDashboard(user);
  } else {
    console.log('Auth state changed - no user');
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
  console.log('Showing dashboard for user:', user.uid);
  
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
    } else {
      console.warn("No stats found for this user.");
    }
  }, error => {
    console.error("Error with onSnapshot:", error);
  });

  // Add connect extension button if it doesn't exist
  const headerButtons = document.querySelector('.header-buttons');
  console.log('Header buttons container:', headerButtons);
  
  // Remove existing button if it exists
  const existingBtn = document.getElementById('connect-extension-btn');
  if (existingBtn) {
    console.log('Removing existing connect button');
    existingBtn.remove();
  }

  console.log('Creating connect extension button');
  const connectBtn = document.createElement('button');
  connectBtn.id = 'connect-extension-btn';
  connectBtn.className = 'connect-btn';
  connectBtn.textContent = 'Connect Extension';
  
  // Add click handler directly to the button
  connectBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    console.log('Button clicked!');
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.log('No user found, please sign in first');
        alert('Please sign in first');
        return;
      }

      console.log('Getting custom token for user:', user.uid);
      // Get a custom token from your backend
      const response = await fetch('https://tracko-web-trial-g1z6.vercel.app/api/getCustomToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ uid: user.uid })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response:', responseData);
      } catch (e) {
        console.error('Failed to parse response:', e);
        console.error('Response text:', responseText);
        throw new Error('Server returned invalid JSON: ' + responseText);
      }
      
      if (!response.ok) {
        console.error('Server error:', responseData);
        throw new Error(responseData.details || responseData.error || 'Server error');
      }

      // For testing, just show the response
      console.log('Test response:', responseData);
      alert('Test successful! Check console for details.');
      return;

      // Rest of the code will be uncommented after we confirm the API is working
      /*
      const { token } = responseData;
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('Got custom token, length:', token.length);
      
      // Send the token to the extension
      const message = {
        type: 'AUTH_TOKEN',
        token: token
      };
      console.log('Sending message to extension:', message);
      window.postMessage(message, '*');
      console.log('Message sent');

      // Update button state
      this.textContent = 'Connecting...';
      this.disabled = true;

      // Listen for response from extension
      const responseHandler = (event) => {
        console.log('Received message:', event.data);
        console.log('Message origin:', event.origin);
        console.log('Current origin:', window.location.origin);
        
        if (event.origin !== window.location.origin) {
          console.log('Ignoring message from different origin');
          return;
        }
        
        if (event.data && event.data.type === 'AUTH_RESPONSE') {
          console.log('Received AUTH_RESPONSE:', event.data);
          if (event.data.success) {
            this.textContent = 'Connected ✓';
            this.classList.add('connected');
          } else {
            this.textContent = 'Connection Failed';
            this.disabled = false;
            alert('Failed to connect: ' + (event.data.error || 'Unknown error'));
          }
          window.removeEventListener('message', responseHandler);
        }
      };

      window.addEventListener('message', responseHandler);
      */
    } catch (error) {
      console.error('Error:', error);
      this.textContent = 'Connection Failed';
      this.disabled = false;
      alert('Failed to connect: ' + error.message);
    }
  });
  
  headerButtons.appendChild(connectBtn);
  console.log('Connect button added to DOM');
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

// Function to validate connection
function validateConnection() {
  console.log('Validating connection');
  const message = {
    type: 'VALIDATE_CONNECTION'
  };
  console.log('Sending validation message:', message);
  window.postMessage(message, '*');

  window.addEventListener('message', function validateResponseHandler(event) {
    console.log('Received validation response:', event.data);
    console.log('Message origin:', event.origin);
    console.log('Current window location:', window.location.href);
    
    // Verify the origin
    if (event.origin !== 'https://tracko-web-trial-g1z6.vercel.app') {
      console.log('Ignoring message from unknown origin:', event.origin);
      return;
    }

    if (event.data && event.data.type === 'VALIDATE_RESPONSE') {
      const validateBtn = document.getElementById('validate-connection-btn');
      if (event.data.success) {
        validateBtn.textContent = 'Connection Valid ✓';
        validateBtn.classList.add('valid');
      } else {
        validateBtn.textContent = 'Connection Invalid ✗';
        validateBtn.classList.add('invalid');
      }
      window.removeEventListener('message', validateResponseHandler);
    }
  });
}
