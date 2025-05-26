document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const screenshotButton = document.getElementById('screenshot-button');
    const messageModal = document.getElementById('message-modal');
    const messageTextarea = document.getElementById('message-text');
    const senderRadios = document.querySelectorAll('input[name="sender"]');
    const saveMessageButton = document.getElementById('save-message-button');
    const cancelButton = document.getElementById('cancel-button');

    let messages = [
        { text: "זו הזדמנות של פעם בחיים", sender: "avishai" },
        { text: "מה אתה מציע לעשות?", sender: "david" }
    ];

    let editingMessageElement = null; // To keep track of the message being edited

    function renderMessages() {
        chatArea.innerHTML = ''; // Clear current messages
        messages.forEach((msg, index) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.sender);
            messageElement.textContent = msg.text;
            messageElement.dataset.index = index; // Store index for editing
            chatArea.appendChild(messageElement);
        });
        // Scroll to bottom
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

        editingMessageElement = isEditing ? chatArea.querySelector(`.message[data-index="${index}"]`) : null;

        saveMessageButton.textContent = isEditing ? 'עדכן' : 'שלח';
        messageModal.classList.add('visible');
        messageTextarea.focus();
    }

    function hideModal() {
        messageModal.classList.remove('visible');
        messageTextarea.value = '';
        senderRadios.forEach(radio => radio.checked = false);
        editingMessageElement = null;
    }

    // Event listener for clicking on the chat area (to add message)
    chatArea.addEventListener('click', (event) => {
        // Check if the click target is NOT a message bubble
        if (!event.target.classList.contains('message')) {
            showModal(false); // Show modal for adding
        }
    });

    // Event listener for clicking on a message bubble (to edit)
    chatArea.addEventListener('click', (event) => {
        if (event.target.classList.contains('message')) {
            const index = parseInt(event.target.dataset.index, 10);
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

        if (editingMessageElement) {
            // Editing existing message
            const indexToEdit = parseInt(editingMessageElement.dataset.index, 10);
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

        html2canvas(chatArea, {
             scale: 2, // Increase scale for better quality
             useCORS: true, // Required if using images from other origins (not the case here, but good practice)
             scrollY: -window.scrollY // Capture content even if scrolled down
        }).then(canvas => {
            // Restore hidden elements
            messageModal.style.display = ''; // Restore original display

            // Create a link to download the image
            const link = document.createElement('a');
            link.download = 'whatsapp_chat.png';
            link.href = canvas.toDataURL('image/png');
            link.click(); // Programmatically click the link to trigger download
        }).catch(err => {
             // Restore hidden elements even if there's an error
            messageModal.style.display = '';
            console.error('Error capturing screenshot:', err);
            alert('אירעה שגיאה בצילום המסך.');
        });
    });


    // Initial rendering of messages
    renderMessages();
});