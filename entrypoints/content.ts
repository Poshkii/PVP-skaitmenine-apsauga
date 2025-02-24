export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Hello content.');

    function createButton(passwordField: HTMLInputElement) {
      // Check if the button already exists
      if (document.getElementById("password-action-button")) return;
    
      // Create the button element
      const button = document.createElement("button");
      button.id = "password-action-button"; // Give it a unique ID
      button.innerText = "?"; // Button text
      button.style.position = "absolute"; // Absolute positioning
      button.style.top = `${passwordField.getBoundingClientRect().top + window.scrollY + passwordField.offsetHeight + 5}px`;
      button.style.left = `${passwordField.getBoundingClientRect().left + window.scrollX + passwordField.offsetWidth - 32}px`;
      button.style.padding = "8px 12px";
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "4px";
      button.style.cursor = "pointer";
      button.style.zIndex = "9999"; // Make sure it's on top of other elements
    
      // Append the button to the body
      document.body.appendChild(button);
    
      // Add a click event listener (optional)
      console.log("Button created:", button);

      // Add event listener to send message to background
      button.addEventListener("click", () => {
      console.log("Button clicked, sending message to background script...");

      chrome.runtime.sendMessage({ type: "OPEN_EXTENSION_POPUP" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        } else {
          console.log("Message sent successfully:", response);
        }
      });

      // Optional: Remove button after click
      button.remove();
  });
}
    
    // Listen for focus events on password fields
    document.addEventListener("focusin", (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.type === "password") {
        console.log("Password field focused");
    
        // Add the button near the password field
        createButton(target);
      }
    });
    
    // Listen for blur events to remove the button when focus leaves
    document.addEventListener("focusout", (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.type === "password") {
        console.log("Password field blurred");
        setTimeout(() => {
          const button = document.getElementById("password-action-button");
          if (button) button.remove();
        }, 100);
      }
    });
  },
});
