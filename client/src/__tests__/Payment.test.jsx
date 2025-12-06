import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import Payment from '../pages/Payment';
import authReducer from '../redux/slices/authSlice';
import cartReducer from '../redux/slices/cartSlice';
import ordersReducer from '../redux/slices/ordersSlice';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API calls
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      orders: ordersReducer,
    },
    preloadedState: {
      auth: {
        user: { _id: 'user123', email: 'test@example.com' },
        token: 'mock-token',
        isAuthenticated: true,
        ...initialState.auth,
      },
      cart: {
        items: [
          {
            _id: 'product1',
            name: 'Aloe Vera',
            price: 15,
            image: '/plants/aloe_vera.jpg',
            quantity: 2,
          },
        ],
        ...initialState.cart,
      },
      orders: {
        orders: [],
        ...initialState.orders,
      },
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('Payment Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test Case 1: Component Rendering
   * Verifies that the Payment component renders all essential form elements
   */
  test('renders all payment form sections correctly', () => {
    renderWithProviders(<Payment />);

    // Check for shipping address section
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('7XXXXXXX or 9XXXXXXX')).toBeInTheDocument();

    // Check for delivery options (Radio buttons)
    expect(screen.getByText(/Delivery Speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Standard Delivery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Express Delivery/i)).toBeInTheDocument();

    // Check for delivery date (Date input)
    expect(screen.getByText('Preferred Delivery Date (Optional)')).toBeInTheDocument();

    // Check for payment method section
    expect(screen.getByText(/Payment Method/i)).toBeInTheDocument();
  });

  /**
   * Test Case 2: Form Input Interaction
   * Tests user input functionality for text fields and validates state updates
   */
  test('updates form inputs when user types', async () => {
    renderWithProviders(<Payment />);

    const nameInput = screen.getByPlaceholderText('Enter full name');
    const phoneInput = screen.getByPlaceholderText('7XXXXXXX or 9XXXXXXX');

    // Simulate user typing
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '99123456' } });

    // Verify input values are updated
    await waitFor(() => {
      expect(nameInput.value).toBe('John Doe');
      expect(phoneInput.value).toBe('99123456');
    });
  });

  /**
   * Test Case 3: Radio Button Selection
   * Tests the delivery option radio buttons (Standard vs Express)
   */
  test('allows user to select delivery option via radio buttons', async () => {
    renderWithProviders(<Payment />);

    const standardRadio = screen.getByLabelText(/Standard Delivery/i);
    const expressRadio = screen.getByLabelText(/Express Delivery/i);

    // Standard should be checked by default (if set in component)
    // Click express delivery
    fireEvent.click(expressRadio);

    await waitFor(() => {
      expect(expressRadio).toBeChecked();
      expect(standardRadio).not.toBeChecked();
    });

    // Switch back to standard
    fireEvent.click(standardRadio);

    await waitFor(() => {
      expect(standardRadio).toBeChecked();
      expect(expressRadio).not.toBeChecked();
    });
  });

  /**
   * Test Case 4: Date Input Validation
   * Tests the preferred delivery date picker functionality
   */
  test('allows user to select a delivery date', async () => {
    renderWithProviders(<Payment />);

    // Get all inputs and filter by type='date'
    const allInputs = screen.getAllByRole('textbox', { hidden: true });
    const inputs = document.querySelectorAll('input[type="date"]');
    const dateInputElement = inputs[0];

    // Set a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateString = futureDate.toISOString().split('T')[0];

    fireEvent.change(dateInputElement, { target: { value: dateString } });

    await waitFor(() => {
      expect(dateInputElement.value).toBe(dateString);
    });
  });
});
