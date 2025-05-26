document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const screenshotButton = document.getElementById('screenshot-button');
    const messageModal = document.getElementById('message-modal');
    const messageTextarea = document.getElementById('message-text');
    const senderRadios = document.querySelectorAll('input[name="sender"]');
    const saveMessageButton = document.getElementById('save-message-button');
    const cancelButton = document.getElementById('cancel-button');

    // Map sender value to display name
    const senderDisplayNames = {
        david: 'דוד',
        avishai: 'אבישי'
    };

    let messages = [
        { text: "זו הזדמנות של פעם בחיים", sender: "avishai" },
        { text: "מה אתה מציע לעשות?", sender: "david" }
    ];

    function renderMessages() {
        chatArea.innerHTML = ''; // Clear current messages
        messages.forEach((msg, index) => {
            const messageContainer = document.createElement('div');
            messageContainer.classList.add('message-container', msg.sender);
            messageContainer.dataset.index = index; // Store index on container for editing

            const senderNameElement = document.createElement('div');
            senderNameElement.classList.add('sender-name');
            senderNameElement.textContent = senderDisplayNames[msg.sender]; // Use the display name

            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.sender); // Keep sender class on message for background color
            messageElement.textContent = msg.text;

            messageContainer.appendChild(senderNameElement);
            messageContainer.appendChild(messageElement);
            chatArea.appendChild(messageContainer);
        });
        // Scroll to bottom after rendering new messages
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function showModal(isEditing = false, msg = null, index = null) {
        messageTextarea.value = msg ? msg.text : '';
        if (msg) {
            senderRadios.forEach(radio => {
                radio.checked = radio.value === msg.sender;
            });
        } else {
             // Default to one sender or clear selection
            senderRadios.forEach(radio => radio.checked = false);
        }

        // Store the index of the message being edited
        messageModal.dataset.editingIndex = isEditing ? index : '';


        saveMessageButton.textContent = isEditing ? 'עדכן' : 'שלח';
        messageModal.classList.add('visible');
        messageTextarea.focus();
    }

    function hideModal() {
        messageModal.classList.remove('visible');
        messageTextarea.value = '';
        senderRadios.forEach(radio => radio.checked = false);
        messageModal.dataset.editingIndex = ''; // Clear editing index
    }

    // Event listener for clicking on the chat area (to add message)
    chatArea.addEventListener('click', (event) => {
        // Check if the click target is NOT inside a message-container
        if (!event.target.closest('.message-container')) {
            showModal(false); // Show modal for adding
        }
    });

    // Event listener for clicking on a message bubble or its container (to edit)
    chatArea.addEventListener('click', (event) => {
        const messageContainer = event.target.closest('.message-container');
        if (messageContainer) {
            const index = parseInt(messageContainer.dataset.index, 10);
            if (!isNaN(index) && messages[index]) {
                showModal(true, messages[index], index); // Show modal for editing
            }
        }
    });


    // Event listener for save/update button in modal
    saveMessageButton.addEventListener('click', () => {
        const text = messageTextarea.value.trim();
        const selectedSender = document.querySelector('input[name="sender"]:checked');

        if (!text || !selectedSender) {
            alert('אנא הזן הודעה ובחר שולח.');
            return;
        }

        const sender = selectedSender.value;
        const editingIndex = messageModal.dataset.editingIndex;

        if (editingIndex !== '') {
            // Editing existing message
            const indexToEdit = parseInt(editingIndex, 10);
             if (!isNaN(indexToEdit) && messages[indexToEdit]) {
                messages[indexToEdit].text = text;
                messages[indexToEdit].sender = sender; // Allow changing sender on edit
             }
        } else {
            // Adding new message
            messages.push({ text: text, sender: sender });
        }

        renderMessages();
        hideModal();
    });

    // Event listener for cancel button in modal
    cancelButton.addEventListener('click', () => {
        hideModal();
    });

     // Event listener for clicking outside the modal content to close
     messageModal.addEventListener('click', (event) => {
        if (event.target === messageModal) {
            hideModal();
        }
     });


    // Event listener for screenshot button
    screenshotButton.addEventListener('click', () => {
        // Hide elements that shouldn't be in the screenshot (like the modal if open)
        messageModal.style.display = 'none';
        screenshotButton.style.display = 'none'; // Hide the button itself

        // Select the chat area for capture - this element is scrollable
        const elementToCapture = chatArea; // Capture the chatArea div

        html2canvas(elementToCapture, { // Capture the chatArea
             scale: 2, // Increase scale for better quality
             useCORS: true, // Required if using images from other origins (not the case here, but good practice)
             scrollY: -elementToCapture.scrollTop, // Crucial: tell html2canvas about the scroll position
             scrollX: -elementToCapture.scrollLeft, // Also account for horizontal scroll if any (unlikely here)
             // Set the actual height for capture, not just the visible part
             height: elementToCapture.scrollHeight
        }).then(canvas => {
            // Restore hidden elements
            messageModal.style.display = ''; // Restore original display
            screenshotButton.style.display = ''; // Restore button display

            // Create a link to download the image
            const link = document.createElement('a');
            link.download = 'whatsapp_chat.png';
            link.href = canvas.toDataURL('image/png');
            link.click(); // Programmatically click the link to trigger download
        }).catch(err => {
             // Restore hidden elements even if there's an error
            messageModal.style.display = '';
            screenshotButton.style.display = '';
            console.error('Error capturing screenshot:', err);
            alert('אירעה שגיאה בצילום המסך.');
        });
    });


    // Initial rendering of messages
    renderMessages();
});