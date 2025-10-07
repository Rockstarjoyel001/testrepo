const API_URL = "http://localhost:5000/login"; // Your Node.js backend URL

// Function to display messages with animations
function showMessage(text, type) {
    const messageBox = document.createElement('div');
    messageBox.textContent = text;
    messageBox.style.position = "fixed";
    messageBox.style.top = "-50px";  // Start off-screen
    messageBox.style.left = "50%";
    messageBox.style.transform = "translateX(-50%)";
    messageBox.style.padding = "12px 24px";
    messageBox.style.borderRadius = "8px";
    messageBox.style.fontWeight = "bold";
    messageBox.style.fontSize = "16px";
    messageBox.style.zIndex = "1000";
    messageBox.style.boxShadow = "0px 5px 10px rgba(0, 0, 0, 0.2)";
    messageBox.style.transition = "top 0.5s ease-out, opacity 0.5s ease-in-out";

    if (type === "success") {
        messageBox.style.backgroundColor = "#28a745";
        messageBox.style.fontFamily = "'Saira', sans-serif"; // Corrected
        messageBox.style.color = "#fff";
    } else {
        messageBox.style.backgroundColor = "#dc3545";
        messageBox.style.color = "#fff";
        messageBox.style.fontFamily = "'Saira', sans-serif"; // Corrected
    }

    document.body.appendChild(messageBox);

 // Slide-in animation (faster, 10ms delay)
setTimeout(() => {
    messageBox.style.transition = "top 0.1s ease-in-out"; // Add transition for smooth slide-in
    messageBox.style.top = "50px"; // Slide-in speed adjusted by reducing time
}, 10); // Reduced delay for faster appearance

// Fade-out and remove after 4 seconds
setTimeout(() => {
    messageBox.style.transition = "opacity 0.05s ease-out"; // Smooth fade-out with 50ms
    messageBox.style.opacity = "0";
    setTimeout(() => {
        messageBox.remove();
    }, 50); // Allow for fade-out to complete before removing
}, 8000); // Fade-out starts after 4 seconds for quicker transition

}


document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        console.log("Raw response:", result);

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong");
        }

        if (result.success) {
            // Array of random success messages
            const successMessages = [
                
                "You're in! Welcome to the system! 🎉",
               
              
                "Login successful! You're ready to take on the world! 💥"
            ];

            // Pick a random message
            const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];

            // Get current time
            const currentHour = new Date().getHours();

            let greeting;

            // Determine the time of day for the greeting
            if (currentHour >= 6 && currentHour < 12) {
                greeting = "Good Morning";
            } else if (currentHour >= 12 && currentHour < 18) {
                greeting = "Good Afternoon";
            } else {
                greeting = "Good Evening";
            }

            // Display the random success message
            showMessage(`${greeting} ${result.branchName} Branch..!! ${randomMessage}`, "success");

            localStorage.setItem("username", result.username || "default_username");
            localStorage.setItem("branchName", result.branchName || "default_branch");

            setTimeout(() => {
                window.location.href = "middle.html"; // Redirect to the next page
            }, 1000);
        } else {
            // Fetch the branch name from local storage or show the default message
            const branchName = localStorage.getItem("branchName");

            const messages = branchName
              ? [
                `❌ Sorry ${branchName} Branch.. Login Failed! Please check your credentials.`,
              
                ]
              : [
                "❌ Sorry.. Login Failed! Please check your credentials.",
              
                "🕵️‍♂️ Unauthorized entry detected. Retry.",
                "🧮 The system couldn’t verify you. Try again.",
                ];
            
            // Pick a random message
            const errorMessage = messages[Math.floor(Math.random() * messages.length)];
            
            showMessage(errorMessage, "error");
            
        }
    } catch (error) {
        showMessage("⚠️ Database Connection failed: " + error.message, "error");
        console.error(error);
    }
});


// Clear login fields on page load
window.onload = function() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
};

// Rotate screen function
let isPortrait = true;
function rotateScreen() {
    const body = document.body;
    if (isPortrait) {
        body.style.transform = "rotate(90deg)";
        body.style.width = "100vh";
        body.style.height = "100vw";
        body.style.overflow = "hidden";
    } else {
        body.style.transform = "rotate(0deg)";
        body.style.width = "auto";
        body.style.height = "auto";
        body.style.overflow = "auto";
    }
    isPortrait = !isPortrait;
}

// Key press event listener
window.addEventListener('keydown', (event) => {
    console.log('Key Pressed:', event.key);
});
