import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import authReducer from '../redux/slices/authSlice';
import cartReducer from '../redux/slices/cartSlice';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
        ...initialState.auth,
      },
      cart: {
        items: [],
        ...initialState.cart,
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

describe('Login Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test Case 1: Login Form Rendering
   * Verifies that the Login component renders all essential form elements
   */
  test('renders login form with all required fields', () => {
    renderWithProviders(<Login />);

    // Check for heading
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Check for email input
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();

    // Check for password input
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Check for login button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Check for sign up link
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  /**
   * Test Case 2: Email Input Validation
   * Tests that email input accepts and displays user input
   */
  test('updates email input when user types', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText(/email/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  /**
   * Test Case 3: Password Input Validation
   * Tests that password input accepts and displays user input
   */
  test('updates password input when user types', async () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await waitFor(() => {
      expect(passwordInput.value).toBe('password123');
    });
  });

  /**
   * Test Case 4: Password Input Type
   * Verifies that password field has type="password" for security
   */
  test('password input has correct type attribute', () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  /**
   * Test Case 5: Form Submission
   * Tests that form can be submitted with valid credentials
   */
  test('allows form submission when fields are filled', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Button should be clickable
    expect(submitButton).not.toBeDisabled();
  });
});

describe('SignUp Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test Case 1: SignUp Form Rendering
   * Verifies that the SignUp component renders all essential form elements
   */
  test('renders signup form with all required fields', () => {
    renderWithProviders(<SignUp />);

    // Check for heading
    expect(screen.getByText('Sign Up')).toBeInTheDocument();

    // Check for first name input
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();

    // Check for last name input
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();

    // Check for email input
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();

    // Check for password input
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Check for sign up button
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();

    // Check for login link
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  /**
   * Test Case 2: First Name Input
   * Tests that first name input accepts and displays user input
   */
  test('updates first name input when user types', async () => {
    renderWithProviders(<SignUp />);

    const firstNameInput = screen.getByPlaceholderText(/first name/i);

    fireEvent.change(firstNameInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(firstNameInput.value).toBe('John');
    });
  });

  /**
   * Test Case 3: Last Name Input
   * Tests that last name input accepts and displays user input
   */
  test('updates last name input when user types', async () => {
    renderWithProviders(<SignUp />);

    const lastNameInput = screen.getByPlaceholderText(/last name/i);

    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });

    await waitFor(() => {
      expect(lastNameInput.value).toBe('Doe');
    });
  });

  /**
   * Test Case 4: Email Input
   * Tests that email input accepts and displays user input
   */
  test('updates email input when user types', async () => {
    renderWithProviders(<SignUp />);

    const emailInput = screen.getByPlaceholderText(/email/i);

    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });

    await waitFor(() => {
      expect(emailInput.value).toBe('john.doe@example.com');
    });
  });

  /**
   * Test Case 5: Password Input
   * Tests that password input accepts and displays user input
   */
  test('updates password input when user types', async () => {
    renderWithProviders(<SignUp />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(passwordInput, { target: { value: 'securePassword123' } });

    await waitFor(() => {
      expect(passwordInput.value).toBe('securePassword123');
    });
  });

  /**
   * Test Case 6: Password Input Type
   * Verifies that password field has type="password" for security
   */
  test('password input has correct type attribute', () => {
    renderWithProviders(<SignUp />);

    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  /**
   * Test Case 7: Form Submission
   * Tests that form can be submitted when all required fields are filled
   */
  test('allows form submission when all fields are filled', async () => {
    renderWithProviders(<SignUp />);

    const firstNameInput = screen.getByPlaceholderText(/first name/i);
    const lastNameInput = screen.getByPlaceholderText(/last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Fill in the form
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Button should be clickable
    expect(submitButton).not.toBeDisabled();
  });

  /**
   * Test Case 8: Multiple Input Fields Update
   * Tests that all form fields can be updated simultaneously
   */
  test('updates all form inputs correctly when user fills the form', async () => {
    renderWithProviders(<SignUp />);

    const firstNameInput = screen.getByPlaceholderText(/first name/i);
    const lastNameInput = screen.getByPlaceholderText(/last name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    // Fill in all fields
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'mySecurePass456' } });

    await waitFor(() => {
      expect(firstNameInput.value).toBe('Jane');
      expect(lastNameInput.value).toBe('Smith');
      expect(emailInput.value).toBe('jane.smith@example.com');
      expect(passwordInput.value).toBe('mySecurePass456');
    });
  });
});
