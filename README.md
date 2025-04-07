# Credit Card Tracker

A modern web application for managing multiple credit cards, tracking transactions, and optimizing rewards. Built with vanilla JavaScript and a beautiful, responsive UI.

## Features

### Card Management
- Add multiple credit cards with custom details
- Track card information including:
  - Card name and issuer
  - Last 4 digits
  - Expiration date
  - Credit limit
  - Custom card color
  - Reward rates for different categories

### Transaction Tracking
- Add and manage transactions for each card
- Track transaction details:
  - Date
  - Description
  - Category (Dining, Groceries, Travel, Gas, Other)
  - Amount
  - Automatically calculated rewards

### Rewards Optimization
- Calculate best card for specific purchases
- View reward rates across all cards
- Track total rewards earned
- Compare reward rates by category
- Automatic reward calculation based on card rates

### Smart Assistant
- Interactive chat bot for quick information
- Ask about:
  - Reward rates for specific categories
  - Last transactions
  - Credit limit checks
  - Best card for purchases
  - General card management help

### User Experience
- Beautiful, responsive design
- Real-time updates
- Local storage for data persistence
- Smooth animations and transitions
- Mobile-friendly interface

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/credit-card-tracker.git
```

2. Navigate to the project directory:
```bash
cd credit-card-tracker
```

3. Open `index.html` in your web browser or use a local server.

## Usage

### Adding a Card
1. Click the "Add New Card" button
2. Fill in the card details:
   - Card name
   - Issuer
   - Card type
   - Last 4 digits
   - Expiration date
   - Credit limit
   - Reward rates for different categories
3. Click "Add Card"

### Adding Transactions
1. Select a card from the sidebar
2. Click "Add Transaction"
3. Enter transaction details:
   - Date
   - Description
   - Category
   - Amount
4. Click "Add Transaction"

### Calculating Best Card
1. Enter the purchase amount
2. Select the category
3. Click "Calculate"
4. View the best card recommendation and alternative options

### Using the Chat Assistant
1. Click the chat button in the bottom right
2. Ask questions about:
   - Reward rates: "What's the reward rate for dining?"
   - Last transactions: "Show last transaction"
   - Credit limits: "Check credit limit for 5000"
   - Reward calculations: "Calculate reward for 1000 on dining"

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome Icons
- Local Storage API

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for the beautiful icons
- All contributors who help improve this project 