// Default Categories and Subcategories data
// Emojis are used for modern, premium icons.

export const CATEGORIES = [
  { id: '1', name: 'Food', icon: '🍔' },
  { id: '2', name: 'Fruit', icon: '🍎' },
  { id: '3', name: 'Milk', icon: '🥛' },
  { id: '4', name: 'Petrol', icon: '⛽' },
  { id: '5', name: 'Groceries', icon: '🛒' },
  { id: '6', name: 'Shopping', icon: '🛍️' },
  { id: '7', name: 'Rent', icon: '🏠' },
  { id: '8', name: 'Internet', icon: '📶' },
  { id: '9', name: 'Electricity', icon: '⚡' },
  { id: '10', name: 'Water', icon: '💧' },
  { id: '11', name: 'Medicine', icon: '💊' },
  { id: '12', name: 'Hospital', icon: '🏥' },
  { id: '13', name: 'Travel', icon: '✈️' },
  { id: '14', name: 'Entertainment', icon: '🎬' },
  { id: '15', name: 'Education', icon: '📚' },
  { id: '16', name: 'Others', icon: '📦' },
];

export const SUBCATEGORIES = {
  Food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Others'],
  Fruit: ['Apple', 'Banana', 'Orange', 'Seasonal', 'Others'],
  Milk: ['Cow Milk', 'Buffalo Milk', 'Curd', 'Paneer', 'Others'],
  Petrol: ['Bike', 'Car', 'Diesel', 'CNG', 'Others'],
  Groceries: ['Vegetables', 'Rice', 'Wheat', 'Oil', 'Sugar', 'Spices', 'Others'],
  Shopping: ['Clothes', 'Shoes', 'Electronics', 'Accessories', 'Others'],
  Rent: ['House Rent', 'Office Rent', 'Others'],
  Internet: ['Broadband', 'Mobile Data', 'Dongle', 'Others'],
  Electricity: ['Home Electricity', 'Office Electricity', 'Others'],
  Water: ['Drinking Water', 'Utility Water', 'Others'],
  Medicine: ['Daily Medicine', 'Emergency Medicine', 'Others'],
  Hospital: ['Consultation', 'Lab Test', 'Admission', 'Others'],
  Travel: ['Bus', 'Train', 'Flight', 'Taxi', 'Metro', 'Others'],
  Entertainment: ['Movie', 'Games', 'Subscription', 'Party', 'Others'],
  Education: ['Books', 'Course Fee', 'Stationery', 'Exam Fee', 'Others'],
  Others: ['Custom', 'General', 'Gift', 'Donation', 'Taxes'],
};

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Wallet',
];
