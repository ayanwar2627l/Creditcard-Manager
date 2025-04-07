// User Authentication and Menu Handling
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const userData = JSON.parse(currentUser);
        updateUserMenu(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function updateUserMenu(user) {
    const userNameElement = document.getElementById('userName');
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'Account';
    }
}

// Initialize user authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // DOM Elements
    const addCardBtn = document.getElementById('addCardBtn');
    const addCardModal = document.getElementById('addCardModal');
    const closeModalBtn = addCardModal.querySelector('.close');
    const addCardForm = document.getElementById('addCardForm');
    const cardList = document.querySelector('.card-list');
    const totalCardsEl = document.getElementById('totalCards');
    const totalRewardsEl = document.getElementById('totalRewards');
    const noCardSelected = document.getElementById('noCardSelected');
    const cardDetail = document.getElementById('cardDetail');
    const transactionSection = document.getElementById('transactionSection');
    const transactionList = document.getElementById('transactionList');
    const noTransactions = document.getElementById('noTransactions');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const hideTransactionsBtn = document.getElementById('hideTransactionsBtn');
    const addTransactionModal = document.getElementById('addTransactionModal');
    const addTransactionForm = document.getElementById('addTransactionForm');
    const closeTransactionModalBtn = addTransactionModal.querySelector('.close');
    const calculateBtn = document.getElementById('calculateBtn');
    const calculationResult = document.getElementById('calculationResult');
    
    // Chat Bot Functionality
    const chatButton = document.getElementById('chatButton');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const chatBadge = document.querySelector('.chat-badge');
    
    // Card data
    let cards = JSON.parse(localStorage.getItem('creditCards')) || [];
    let selectedCardId = null;
    
    // Chat Bot Functions
    function sendUserMessage() {
        try {
            const message = chatInput.value.trim();
            if (message) {
                // Add user message
                addMessage(message, 'user');
                
                // Clear input
                chatInput.value = '';
                
                // Simulate bot response
                setTimeout(() => {
                    const botResponse = getBotResponse(message);
                    addMessage(botResponse, 'bot');
                }, 1000);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    function addMessage(content, type) {
        try {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    function getBotResponse(message) {
        try {
            const lowerMessage = message.toLowerCase();
            
            // Handle logout requests
            if (lowerMessage.includes('logout') || lowerMessage.includes('sign out') || lowerMessage.includes('log out')) {
                return "To log out, please click the Logout button in the top-right corner of the page. I can't log you out directly from the chat for security reasons.";
            }
            
            // Check for reward rate queries
            if (lowerMessage.includes('reward rate') || lowerMessage.includes('reward percentage')) {
                const categoryMatch = lowerMessage.match(/(dining|groceries|travel|gas|other)/);
                if (categoryMatch) {
                    const category = categoryMatch[1];
                    let response = "Here are the reward rates for " + category + " across your cards:\n";
                    
                    cards.forEach(card => {
                        const rate = card.rewards[category] || card.rewards.other;
                        response += `- ${card.name}: ${rate}%\n`;
                    });
                    
                    return response;
                }
                return "Please specify a category (dining, groceries, travel, gas, or other) to check reward rates.";
            }
            
            // Check for last transaction queries
            if (lowerMessage.includes('last transaction') || lowerMessage.includes('recent transaction')) {
                if (cards.length === 0) {
                    return "You haven't added any cards yet. Add a card to track transactions.";
                }
                
                let response = "Here are your most recent transactions:\n";
                cards.forEach(card => {
                    if (card.transactions && card.transactions.length > 0) {
                        const lastTransaction = card.transactions[0];
                        response += `\n${card.name}:\n`;
                        response += `- Date: ${new Date(lastTransaction.date).toLocaleDateString()}\n`;
                        response += `- Amount: ₹${lastTransaction.amount.toFixed(2)}\n`;
                        response += `- Category: ${capitalizeFirstLetter(lastTransaction.category)}\n`;
                        response += `- Reward: ₹${lastTransaction.reward.toFixed(2)}\n`;
                    }
                });
                
                return response;
            }
            
            // Check for credit limit queries
            if (lowerMessage.includes('credit limit') || lowerMessage.includes('limit check')) {
                const amountMatch = lowerMessage.match(/(\d+)/);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[1]);
                    let response = "Credit limit check for ₹" + amount + ":\n";
                    
                    cards.forEach(card => {
                        const remainingLimit = card.limit - getCardTotalSpending(card);
                        const canAfford = remainingLimit >= amount;
                        response += `\n${card.name}:\n`;
                        response += `- Credit Limit: ₹${card.limit.toLocaleString()}\n`;
                        response += `- Remaining: ₹${remainingLimit.toLocaleString()}\n`;
                        response += `- Status: ${canAfford ? '✅ Can afford' : '❌ Limit exceeded'}\n`;
                    });
                    
                    return response;
                }
                return "Please specify an amount to check against your credit limits.";
            }
            
            // Check for reward calculation queries
            if (lowerMessage.includes('calculate reward') || lowerMessage.includes('earn reward')) {
                const categoryMatch = lowerMessage.match(/(dining|groceries|travel|gas|other)/);
                const amountMatch = lowerMessage.match(/(\d+)/);
                
                if (categoryMatch && amountMatch) {
                    const category = categoryMatch[1];
                    const amount = parseFloat(amountMatch[1]);
                    
                    let response = `Reward calculation for ₹${amount} on ${category}:\n`;
                    let bestCard = null;
                    let bestReward = 0;
                    
                    cards.forEach(card => {
                        const rewardRate = card.rewards[category] || card.rewards.other;
                        const reward = (amount * rewardRate) / 100;
                        response += `\n${card.name}:\n`;
                        response += `- Rate: ${rewardRate}%\n`;
                        response += `- Reward: ₹${reward.toFixed(2)}\n`;
                        
                        if (reward > bestReward) {
                            bestReward = reward;
                            bestCard = card;
                        }
                    });
                    
                    if (bestCard) {
                        response += `\nBest card for this purchase: ${bestCard.name} (₹${bestReward.toFixed(2)})`;
                    }
                    
                    return response;
                }
                return "Please specify both a category and amount to calculate rewards.";
            }
            
            // Existing response patterns
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return "Hello! How can I help you with your credit cards today?";
            }
            else if (lowerMessage.includes('reward') || lowerMessage.includes('points')) {
                return "I can help you calculate the best rewards for your purchases. Just use the rewards calculator above!";
            }
            else if (lowerMessage.includes('add') || lowerMessage.includes('new card')) {
                return "To add a new card, click the 'Add New Card' button in the sidebar.";
            }
            else if (lowerMessage.includes('transaction') || lowerMessage.includes('spending')) {
                return "You can add transactions to your cards by clicking the 'Add Transaction' button in the card details.";
            }
            else if (lowerMessage.includes('help')) {
                return "I can help you with:\n- Adding new cards\n- Tracking transactions\n- Calculating rewards\n- Checking credit limits\n- Viewing recent transactions\nWhat would you like to know more about?";
            }
            else if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
                return "To delete a card or transaction, click the delete button (trash icon) next to the item you want to remove.";
            }
            else if (lowerMessage.includes('limit') || lowerMessage.includes('credit limit')) {
                return "You can set and view credit limits for each card in the card details section.";
            }
            else if (lowerMessage.includes('expiration') || lowerMessage.includes('expiry')) {
                return "Card expiration dates are displayed in the card details section.";
            }
            else {
                return "I'm here to help! You can ask me about:\n- Adding cards\n- Tracking transactions\n- Calculating rewards\n- Checking credit limits\n- Viewing recent transactions\nWhat would you like to know?";
            }
        } catch (error) {
            console.error('Error getting bot response:', error);
            return "I'm having trouble understanding. Could you please rephrase your question?";
        }
    }

    // Helper function to calculate total spending for a card
    function getCardTotalSpending(card) {
        if (!card.transactions) return 0;
        return card.transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }
    
    // Chat Bot Event Listeners
    chatButton.addEventListener('click', () => {
        try {
            chatContainer.classList.add('active');
            chatBadge.style.display = 'none';
            chatInput.focus();
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    });

    closeChat.addEventListener('click', () => {
        try {
            chatContainer.classList.remove('active');
        } catch (error) {
            console.error('Error closing chat:', error);
        }
    });

    sendMessage.addEventListener('click', sendUserMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
        if (!chatContainer.contains(e.target) && !chatButton.contains(e.target)) {
            chatContainer.classList.remove('active');
        }
    });
    
    // Initialize application
    function init() {
        renderCardList();
        updateStats();
        
        // Event listeners
        addCardBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        addCardForm.addEventListener('submit', handleAddCard);
        addTransactionBtn.addEventListener('click', openTransactionModal);
        closeTransactionModalBtn.addEventListener('click', closeTransactionModal);
        addTransactionForm.addEventListener('submit', handleAddTransaction);
        hideTransactionsBtn.addEventListener('click', hideTransactions);
        calculateBtn.addEventListener('click', calculateBestCard);
        
        // Close modals when clicking outside of them
        window.addEventListener('click', (e) => {
            if (e.target === addCardModal) {
                closeModal();
            }
            if (e.target === addTransactionModal) {
                closeTransactionModal();
            }
        });
    }
    
    // Initialize the application
    init();
    
    function openModal() {
        addCardModal.style.display = 'flex';
    }
    
    function closeModal() {
        addCardModal.style.display = 'none';
        addCardForm.reset();
    }
    
    function openTransactionModal() {
        // Set default date to today
        document.getElementById('transactionDate').valueAsDate = new Date();
        addTransactionModal.style.display = 'flex';
    }
    
    function closeTransactionModal() {
        addTransactionModal.style.display = 'none';
        addTransactionForm.reset();
    }
    
    function handleAddCard(e) {
        e.preventDefault();
        
        // Validate card name length
        const cardName = document.getElementById('cardName').value.trim();
        if (cardName.length > 50) {
            showNotification('Card name must be less than 50 characters', 'error');
            return;
        }
        
        // Validate credit limit
        const limit = parseFloat(document.getElementById('limit').value);
        if (isNaN(limit) || limit < 0) {
            showNotification('Please enter a valid credit limit', 'error');
            return;
        }
        
        // Generate a unique ID
        const id = Date.now().toString();
        
        // Collect form data
        const newCard = {
            id: id,
            name: cardName,
            issuer: document.getElementById('cardIssuer').value,
            type: document.getElementById('cardType').value,
            lastFour: document.getElementById('lastFour').value,
            expiration: document.getElementById('expiration').value,
            limit: limit,
            color: document.getElementById('cardColor').value,
            rewards: {
                dining: parseFloat(document.getElementById('diningRate').value) || 1,
                groceries: parseFloat(document.getElementById('groceriesRate').value) || 1,
                travel: parseFloat(document.getElementById('travelRate').value) || 1,
                gas: parseFloat(document.getElementById('gasRate').value) || 1,
                other: parseFloat(document.getElementById('otherRate').value) || 1
            },
            transactions: []
        };
        
        // Add card to the array
        cards.push(newCard);
        
        // Save to localStorage
        saveCards();
        
        // Update UI
        renderCardList();
        updateStats();
        selectCard(id);
        
        // Close the modal
        closeModal();
        
        // Show confirmation
        showNotification('Card added successfully!');
    }
    
    function handleAddTransaction(e) {
        e.preventDefault();
        
        if (!selectedCardId) {
            showNotification('No card selected', 'error');
            return;
        }
        
        const card = cards.find(card => card.id === selectedCardId);
        if (!card) {
            showNotification('Card not found', 'error');
            return;
        }
        
        // Validate transaction date
        const date = document.getElementById('transactionDate').value;
        const transactionDate = new Date(date);
        const today = new Date();
        if (transactionDate > today) {
            showNotification('Transaction date cannot be in the future', 'error');
            return;
        }
        
        // Validate description length
        const description = document.getElementById('transactionDescription').value.trim();
        if (description.length > 100) {
            showNotification('Description must be less than 100 characters', 'error');
            return;
        }
        
        // Validate amount
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        if (isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        // Generate a unique ID for the transaction
        const transId = Date.now().toString();
        
        // Get form values
        const category = document.getElementById('transactionCategory').value;
        
        // Calculate reward based on card's reward rate for the category
        const rewardRate = card.rewards[category] || card.rewards.other;
        const rewardAmount = (amount * rewardRate) / 100;
        
        // Create transaction object
        const transaction = {
            id: transId,
            date: date,
            description: description,
            category: category,
            amount: amount,
            reward: rewardAmount
        };
        
        // Add to card's transactions
        card.transactions.push(transaction);
        
        // Sort transactions by date (newest first)
        card.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        saveCards();
        
        // Update UI
        renderTransactions(card);
        updateStats();
        
        // Close the modal
        closeTransactionModal();
        
        // Show confirmation
        showNotification('Transaction added successfully!');
    }
    
    function renderCardList() {
        cardList.innerHTML = '';
        
        if (cards.length === 0) {
            cardList.innerHTML = '<div class="empty-state">No cards added yet</div>';
            return;
        }
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `card-item ${card.id === selectedCardId ? 'active' : ''}`;
            cardElement.style.backgroundColor = card.color;
            
            cardElement.innerHTML = `
                <div class="card-item-name">${card.name}</div>
                <div class="card-item-number">•••• ${card.lastFour}</div>
            `;
            
            cardElement.addEventListener('click', () => selectCard(card.id));
            cardList.appendChild(cardElement);
        });
    }
    
    function selectCard(cardId) {
        selectedCardId = cardId;
        renderCardList(); // Re-render to update active state
        
        const selectedCard = cards.find(card => card.id === cardId);
        
        if (selectedCard) {
            noCardSelected.classList.add('hidden');
            cardDetail.classList.remove('hidden');
            
            // Determine card brand icon
            let cardIcon;
            switch(selectedCard.type) {
                case 'visa': 
                    cardIcon = '<i class="fab fa-cc-visa"></i>';
                    break;
                case 'mastercard': 
                    cardIcon = '<i class="fab fa-cc-mastercard"></i>';
                    break;
                case 'amex': 
                    cardIcon = '<i class="fab fa-cc-amex"></i>';
                    break;
                case 'discover': 
                    cardIcon = '<i class="fab fa-cc-discover"></i>';
                    break;
                default: 
                    cardIcon = '<i class="fas fa-credit-card"></i>';
            }
            
            // Render card details
            cardDetail.innerHTML = `
                <div class="credit-card-visual" style="background-image: linear-gradient(135deg, ${selectedCard.color}, ${adjustColor(selectedCard.color, -30)})">
                    <div class="card-logo">${cardIcon}</div>
                    <div class="card-number">•••• •••• •••• ${selectedCard.lastFour}</div>
                    <div class="card-name">${selectedCard.name}</div>
                    <div class="card-expiry">Expires: ${formatExpiration(selectedCard.expiration)}</div>
                </div>
                
                <h3>Card Details</h3>
                <table class="card-details-table">
                    <tr>
                        <th>Card Issuer</th>
                        <td>${selectedCard.issuer}</td>
                    </tr>
                    <tr>
                        <th>Card Type</th>
                        <td>${selectedCard.type.charAt(0).toUpperCase() + selectedCard.type.slice(1)}</td>
                    </tr>
                    <tr>
                        <th>Credit Limit</th>
                        <td>₹${selectedCard.limit.toLocaleString()}</td>
                    </tr>
                </table>
                
                <h3>Reward Rates</h3>
                <table class="card-details-table">
                    <tr>
                        <th>Dining</th>
                        <td>${selectedCard.rewards.dining}%</td>
                    </tr>
                    <tr>
                        <th>Groceries</th>
                        <td>${selectedCard.rewards.groceries}%</td>
                    </tr>
                    <tr>
                        <th>Travel</th>
                        <td>${selectedCard.rewards.travel}%</td>
                    </tr>
                    <tr>
                        <th>Gas</th>
                        <td>${selectedCard.rewards.gas}%</td>
                    </tr>
                    <tr>
                        <th>Everything Else</th>
                        <td>${selectedCard.rewards.other}%</td>
                    </tr>
                </table>
                
                <div class="card-actions">
                    <button id="showTransactionsBtn" class="btn-primary show-transactions-btn">
                        <i class="fas fa-list-ul"></i> Show Transactions
                    </button>
                    <button class="btn-primary delete-card" data-id="${selectedCard.id}">
                        <i class="fas fa-trash"></i> Delete Card
                    </button>
                </div>
            `;
            
            // Add event listeners
            const deleteBtn = cardDetail.querySelector('.delete-card');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this card?')) {
                    deleteCard(selectedCard.id);
                }
            });
            
            const showTransactionsBtn = document.getElementById('showTransactionsBtn');
            showTransactionsBtn.addEventListener('click', () => {
                showTransactions(selectedCard);
            });

            // Hide transaction section initially
            transactionSection.classList.add('hidden');
        }
    }
    
    function showTransactions(card) {
        // Show transaction section
        transactionSection.classList.remove('hidden');
        
        // Render transactions for the selected card
        renderTransactions(card);
        
        // Scroll to transactions section
        transactionSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function hideTransactions() {
        transactionSection.classList.add('hidden');
    }
    
    function renderTransactions(card) {
        if (!card) return;
        
        if (card.transactions && card.transactions.length > 0) {
            noTransactions.classList.add('hidden');
            transactionList.classList.remove('hidden');
            
            // Clear the current list
            transactionList.innerHTML = '';
            
            // Get the last 10 transactions
            const recentTransactions = card.transactions.slice(0, 10);
            
            // Add each transaction to the list
            recentTransactions.forEach(transaction => {
                const tr = document.createElement('tr');
                
                // Format date
                const transDate = new Date(transaction.date);
                const formattedDate = transDate.toLocaleDateString();
                
                // Create category label class
                const categoryClass = transaction.category.toLowerCase();
                
                tr.innerHTML = `
                    <td class="transaction-date">${formattedDate}</td>
                    <td>${transaction.description}</td>
                    <td><span class="transaction-category ${categoryClass}">${capitalizeFirstLetter(transaction.category)}</span></td>
                    <td class="transaction-amount">₹${transaction.amount.toFixed(2)}</td>
                    <td class="transaction-reward">₹${transaction.reward.toFixed(2)}</td>
                    <td>
                        <button class="btn-action delete" onclick="event.stopPropagation(); deleteTransaction('${card.id}', '${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                transactionList.appendChild(tr);
            });
        } else {
            transactionList.classList.add('hidden');
            noTransactions.classList.remove('hidden');
        }
    }
    
    // Make deleteTransaction function available globally with error handling
    window.deleteTransaction = function(cardId, transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                const cardIndex = cards.findIndex(card => card.id === cardId);
                if (cardIndex !== -1) {
                    const transactions = cards[cardIndex].transactions;
                    const transIndex = transactions.findIndex(t => t.id === transactionId);
                    
                    if (transIndex !== -1) {
                        transactions.splice(transIndex, 1);
                        saveCards();
                        renderTransactions(cards[cardIndex]);
                        updateStats();
                        showNotification('Transaction deleted successfully!');
                    } else {
                        showNotification('Transaction not found', 'error');
                    }
                } else {
                    showNotification('Card not found', 'error');
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                showNotification('Error deleting transaction', 'error');
            }
        }
    };
    
    function deleteCard(cardId) {
        cards = cards.filter(card => card.id !== cardId);
        saveCards();
        
        // Reset selected card if the deleted one was selected
        if (selectedCardId === cardId) {
            selectedCardId = null;
            cardDetail.classList.add('hidden');
            transactionSection.classList.add('hidden');
            noCardSelected.classList.remove('hidden');
        }
        
        renderCardList();
        updateStats();
        showNotification('Card deleted successfully!');
    }
    
    function calculateBestCard() {
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        
        if (!amount || isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        if (cards.length === 0) {
            showNotification('Add a credit card first', 'error');
            return;
        }
        
        // Find the best card for this category
        let bestCard = null;
        let bestRewardRate = -1;
        
        cards.forEach(card => {
            const rewardRate = card.rewards[category] || card.rewards.other;
            if (rewardRate > bestRewardRate) {
                bestRewardRate = rewardRate;
                bestCard = card;
            }
        });
        
        // Calculate reward amount
        const rewardAmount = (amount * bestRewardRate) / 100;
        
        // Show results
        calculationResult.classList.remove('hidden');
        calculationResult.innerHTML = `
            <div class="best-card">
                <div class="best-card-icon" style="background-color: ${bestCard.color}">
                    <i class="fas fa-credit-card"></i>
                </div>
                <div>
                    <h3>Best Card: ${bestCard.name}</h3>
                    <p>Reward rate for ${category}: ${bestRewardRate}%</p>
                </div>
            </div>
            <div>
                <p>Purchase amount: ₹${amount.toFixed(2)}</p>
                <p>You'll earn: <span class="reward-amount">₹${rewardAmount.toFixed(2)}</span></p>
                <button id="makePaymentBtn" class="btn-primary">
                    <i class="fas fa-check-circle"></i> Make Payment with this Card
                </button>
            </div>
            <div class="other-options">
                <h4>Other Options:</h4>
                <ul>
                    ${renderOtherOptions(category, amount, bestCard.id)}
                </ul>
            </div>
        `;
        
        // Add event listener to the payment button
        document.getElementById('makePaymentBtn').addEventListener('click', function() {
            handlePayment(bestCard.id, category, amount, rewardAmount);
        });
        
        // Scroll to results
        calculationResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    function handlePayment(cardId, category, amount, rewardAmount) {
        const card = cards.find(card => card.id === cardId);
        if (!card) {
            showNotification('Card not found', 'error');
            return;
        }
        
        // Generate a unique ID for the transaction
        const transId = Date.now().toString();
        
        // Create transaction object with current date
        const transaction = {
            id: transId,
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            description: `Payment - ${capitalizeFirstLetter(category)}`,
            category: category,
            amount: amount,
            reward: rewardAmount
        };
        
        // Add to card's transactions
        card.transactions.push(transaction);
        
        // Sort transactions by date (newest first)
        card.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        saveCards();
        
        // Update UI
        updateStats();
        
        // If this is the currently selected card, update the transaction view
        if (selectedCardId === cardId) {
            renderTransactions(card);
            // Show the transaction section if it's hidden
            if (transactionSection.classList.contains('hidden')) {
                showTransactions(card);
            }
        } else {
            // Select this card to show the transaction
            selectCard(cardId);
            showTransactions(card);
        }
        
        // Show confirmation
        showNotification('Payment added as transaction!');
    }
    
    function renderOtherOptions(category, amount, bestCardId) {
        let otherOptionsHTML = '';
        
        // Sort cards by reward rate for this category (descending)
        const sortedCards = [...cards]
            .filter(card => card.id !== bestCardId)
            .sort((a, b) => {
                const rateA = a.rewards[category] || a.rewards.other;
                const rateB = b.rewards[category] || b.rewards.other;
                return rateB - rateA;
            });
        
        // Show top 3 alternatives
        sortedCards.slice(0, 3).forEach(card => {
            const rewardRate = card.rewards[category] || card.rewards.other;
            const rewardAmount = (amount * rewardRate) / 100;
            
            otherOptionsHTML += `
                <li>
                    <strong>${card.name}</strong> - ${rewardRate}% 
                    (₹${rewardAmount.toFixed(2)})
                    <button class="btn-small-primary pay-with-other-card" 
                        data-card-id="${card.id}" 
                        data-category="${category}" 
                        data-amount="${amount}" 
                        data-reward="${rewardAmount}">
                        <i class="fas fa-wallet"></i> Pay with this
                    </button>
                </li>
            `;
        });
        
        // Add event listeners to the newly created payment buttons after they are added to the DOM
        setTimeout(() => {
            document.querySelectorAll('.pay-with-other-card').forEach(btn => {
                btn.addEventListener('click', function() {
                    const cardId = this.getAttribute('data-card-id');
                    const category = this.getAttribute('data-category');
                    const amount = parseFloat(this.getAttribute('data-amount'));
                    const rewardAmount = parseFloat(this.getAttribute('data-reward'));
                    
                    handlePayment(cardId, category, amount, rewardAmount);
                });
            });
        }, 0);
        
        return otherOptionsHTML || '<li>No other cards available</li>';
    }
    
    function updateStats() {
        totalCardsEl.textContent = cards.length;
        
        // Calculate total rewards earned from all transactions across all cards
        let totalRewardsEarned = 0;
        
        cards.forEach(card => {
            if (card.transactions && card.transactions.length > 0) {
                card.transactions.forEach(transaction => {
                    totalRewardsEarned += transaction.reward;
                });
            }
        });
        
        // Show total rewards earned, or potential rewards if no transactions
        if (totalRewardsEarned > 0) {
            totalRewardsEl.textContent = '₹' + totalRewardsEarned.toFixed(2);
        } else {
            // For this demo, show potential rewards based on a theoretical 1000 ₹ spent
            const theoreticalSpend = 1000;
            let totalPotentialRewards = 0;
            
            if (cards.length > 0) {
                // Find best card for each category
                const categories = ['dining', 'groceries', 'travel', 'gas', 'other'];
                const spendPerCategory = theoreticalSpend / categories.length;
                
                categories.forEach(category => {
                    let bestRate = 0;
                    cards.forEach(card => {
                        const rate = card.rewards[category] || card.rewards.other;
                        if (rate > bestRate) bestRate = rate;
                    });
                    
                    totalPotentialRewards += (spendPerCategory * bestRate) / 100;
                });
            }
            
            totalRewardsEl.textContent = '₹' + totalPotentialRewards.toFixed(2) + ' (potential)';
        }
        
        // If no cards, show the no card message
        if (cards.length === 0) {
            cardDetail.classList.add('hidden');
            transactionSection.classList.add('hidden');
            noCardSelected.classList.remove('hidden');
            selectedCardId = null;
        }
    }
    
    function saveCards() {
        try {
            localStorage.setItem('creditCards', JSON.stringify(cards));
        } catch (error) {
            console.error('Error saving cards:', error);
            showNotification('Error saving cards. Please check your browser storage settings.', 'error');
        }
    }
    
    function formatExpiration(expirationDate) {
        if (!expirationDate) return 'N/A';
        const [year, month] = expirationDate.split('-');
        return `${month}/${year.slice(2)}`;
    }
    
    function adjustColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to the DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Helper function to create card visual elements
    function createCardVisual(card, isSmall = false) {
        // Get current user for card holder name
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const cardHolderName = currentUser.name || 'Card Holder';
        
        const cardTypeIcon = getCardTypeIcon(card.type);
        const expirationDate = new Date(card.expiration);
        const formattedExpiration = `${(expirationDate.getMonth() + 1).toString().padStart(2, '0')}/${expirationDate.getFullYear().toString().slice(-2)}`;
        
        let cardHTML = `
            <div class="card-visual ${isSmall ? 'small' : ''}" style="background-color: ${card.color || '#1976d2'}">
                <div class="card-header">
                    <span class="card-name">${card.name}</span>
                    <i class="${cardTypeIcon}"></i>
                </div>
                <div class="card-number">**** **** **** ${card.lastFour}</div>
                <div class="card-footer">
                    <div class="card-expiration">
                        <span class="label">Expires</span>
                        <span class="value">${formattedExpiration}</span>
                    </div>
                    <div class="card-issuer">${card.issuer}</div>
                </div>
                <div class="card-holder-name">${cardHolderName}</div>
            </div>
        `;
        
        return cardHTML;
    }
    
    // Function to render a card item in the sidebar
    function renderCardItem(card) {
        // Get current user for card holder name
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const cardHolderName = currentUser.name || 'Card Holder';
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.dataset.id = card.id;
        cardElement.style.backgroundColor = card.color || '#1976d2';
        
        if (card.id === selectedCardId) {
            cardElement.classList.add('selected');
        }
        
        const cardTypeIcon = getCardTypeIcon(card.type);
        
        cardElement.innerHTML = `
            <div class="card-item-header">
                <span class="card-name">${card.name}</span>
                <i class="${cardTypeIcon}"></i>
            </div>
            <div class="card-last-four">**** ${card.lastFour}</div>
            <div class="card-holder-name">${cardHolderName}</div>
        `;
        
        cardElement.addEventListener('click', () => {
            selectCard(card.id);
        });
        
        return cardElement;
    }
    
    // Function to update the card list in the sidebar
    function updateCardList() {
        if (!cardList) return;
        
        cardList.innerHTML = '';
        
        if (cards.length === 0) {
            cardList.innerHTML = '<p class="no-cards">No cards yet. Add your first card!</p>';
            return;
        }
        
        cards.forEach(card => {
            const cardElement = renderCardItem(card);
            cardList.appendChild(cardElement);
        });
    }
    
    // Function to display selected card details
    function displayCardDetails(card) {
        if (!cardDetail) return;
        
        // Get card visual HTML
        const cardVisualHTML = createCardVisual(card);
        
        // Calculate total spending and rewards
        const totalSpending = card.transactions ? card.transactions.reduce((sum, t) => sum + t.amount, 0) : 0;
        const totalRewards = card.transactions ? card.transactions.reduce((sum, t) => sum + t.reward, 0) : 0;
        const availableCredit = card.limit ? card.limit - totalSpending : 0;
        
        cardDetail.innerHTML = `
            ${cardVisualHTML}
            
            <div class="card-info">
                <div class="info-section">
                    <h3>Card Details</h3>
                    <div class="info-item">
                        <span class="label">Card Type:</span>
                        <span class="value">${capitalizeFirstLetter(card.type)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Credit Limit:</span>
                        <span class="value">₹${card.limit ? card.limit.toLocaleString() : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Available Credit:</span>
                        <span class="value">₹${availableCredit.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Reward Rates</h3>
                    <div class="info-item">
                        <span class="label">Dining:</span>
                        <span class="value">${card.rewards.dining}%</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Groceries:</span>
                        <span class="value">${card.rewards.groceries}%</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Travel:</span>
                        <span class="value">${card.rewards.travel}%</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Gas:</span>
                        <span class="value">${card.rewards.gas}%</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Other:</span>
                        <span class="value">${card.rewards.other}%</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Summary</h3>
                    <div class="info-item">
                        <span class="label">Total Spending:</span>
                        <span class="value">₹${totalSpending.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Total Rewards:</span>
                        <span class="value">₹${totalRewards.toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Active Transactions:</span>
                        <span class="value">${card.transactions ? card.transactions.length : 0}</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-secondary" id="showTransactionsBtn">
                        <i class="fas fa-list"></i> View Transactions
                    </button>
                    <button class="btn-danger" id="deleteCardBtn">
                        <i class="fas fa-trash"></i> Delete Card
                    </button>
                </div>
            </div>
        `;
        
        // Attach event listeners to buttons
        document.getElementById('showTransactionsBtn').addEventListener('click', () => {
            showTransactions(card);
        });
        
        document.getElementById('deleteCardBtn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the card "${card.name}"?`)) {
                deleteCard(card.id);
            }
        });
    }
});

// Add notification styles
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    background-color: #4CAF50;
    color: white;
    border-radius: 8px;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 2000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification.error {
    background-color: #f44336;
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}
`;
document.head.appendChild(style); 