import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, Calendar, MapPin, Clock, Users, Star, Filter, Menu, X, User, LogOut, Bus, Ticket, CreditCard, Plus, Edit, Trash2 } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// With these utility functions:
const getStoredToken = () => {
  try {
    return localStorage.getItem('authToken');
    console.log("Auth Token in Header:", token);
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};
const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('Error storing token in localStorage:', error);
  }
};

const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user data from localStorage:', error);
    return null;
  }
};

const setStoredUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
    }
  } catch (error) {
    console.error('Error storing user data in localStorage:', error);
  }
};

// API utility functions
const apiCall = async (endpoint, options = {}) => {
  const token = getStoredToken(); // Changed from tokenStorage
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      const errorData = await response.text();
      throw new Error(errorData || errorMessage);
    }

    // Check content type to determine how to parse the response
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      // Parse as JSON for JSON responses
      const data = await response.json();
      return data;
    } else {
      // Return as text for plain text responses (like your cancel endpoint)
      const textData = await response.text();
      return textData;
    }

  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};


// Context for authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main App Component
const BusBookingApp = () => {
  // Replace these lines with localStorage initialization
  const [user, setUser] = useState(getStoredUser()); // Changed from userStorage
  const [token, setToken] = useState(getStoredToken()); // Changed from tokenStorage
  const [currentView, setCurrentView] = useState('home');
  const [isLoading, setIsLoading] = useState(true); // Add loading state

 const [globalSearchData, setGlobalSearchData] = useState({
    source: '',
    destination: '',
    travelDate: ''
  });
  // Decode JWT token to get user info
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  };

  // Fetch user details from backend using email
  const fetchUserDetails = async (email) => {
    try {
      console.log('Fetching user details for email:', email);

      // Use the new /me endpoint instead of /get_all_users
      const currentUser = await apiCall('/users/me');
      console.log('Fetched current user:', currentUser);

      return currentUser;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // Return null instead of creating a user with null id
      return null;
    }
  };

  // Add this new useEffect for initial authentication check
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken) {
        const userInfo = decodeToken(storedToken);
        if (userInfo && userInfo.exp * 1000 > Date.now()) {
          setToken(storedToken);

          // If we have stored user data, use it, otherwise fetch fresh data
          if (storedUser) {
            setUser(storedUser);
            console.log('User restored from storage:', storedUser);
          } else {
            try {
              const userDetails = await fetchUserDetails(userInfo.email);
              if (userDetails) {
                setUser(userDetails);
                setStoredUser(userDetails);
                console.log('User fetched and stored:', userDetails);
              } else {
                logout();
              }
            } catch (error) {
              console.error('Error fetching user details on app load:', error);
              logout();
            }
          }
        } else {
          console.log('Token expired, logging out');
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once on mount

  // Update your existing useEffect
  useEffect(() => {
    if (token && !user) {
      const userInfo = decodeToken(token);
      if (userInfo && userInfo.exp * 1000 > Date.now()) {
        fetchUserDetails(userInfo.email).then(userDetails => {
          if (userDetails) {
            setUser(userDetails);
            setStoredUser(userDetails); // Changed from userStorage
            console.log('User logged in successfully:', userDetails);
          } else {
            // If user details can't be fetched, logout
            console.error('Could not fetch user details, logging out');
            logout();
          }
        }).catch(error => {
          console.error('Error fetching user details:', error);
          logout();
        });
      } else {
        console.log('Token expired, logging out');
        logout();
      }
    }
  }, [token, user]); // Add user to dependencies

  const login = async (authToken) => {
    setStoredToken(authToken); // Changed from tokenStorage
    setToken(authToken);
    const userInfo = decodeToken(authToken);
    if (userInfo) {
      const userDetails = await fetchUserDetails(userInfo.email);
      if (userDetails) {
        setUser(userDetails);
        setStoredUser(userDetails); // Changed from userStorage
      }
    }
  };

  const logout = () => {
    setStoredToken(null); // Changed from tokenStorage = null
    setStoredUser(null); // Changed from userStorage = null
    setUser(null);
    setToken(null);
    setCurrentView('home');
  };

  // Add loading state check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
       <AuthContext.Provider value={{ user, token, login, logout }}>
         <div className="min-h-screen bg-gray-50">
           <Header currentView={currentView} setCurrentView={setCurrentView} />
           <main className="pt-16">
             {currentView === 'home' && <HomePage setCurrentView={setCurrentView} setGlobalSearchData={setGlobalSearchData} />}
             {currentView === 'search' && <SearchPage globalSearchData={globalSearchData} />}
           {currentView === 'login' && <LoginPage setCurrentView={setCurrentView} />}
          {currentView === 'register' && <RegisterPage setCurrentView={setCurrentView} />}
          {currentView === 'bookings' && <BookingsPage />}
          {currentView === 'admin' && <AdminPage />}
        </main>
      </div>
    </AuthContext.Provider>
  );
};

// Header Component
const Header = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle logo click with proper event handling
  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event bubbling
    console.log('Logo clicked - navigating to home'); // Debug log
    setCurrentView('home');
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with improved click handling */}
          <button
            type="button"
            className="flex items-center cursor-pointer bg-transparent border-none p-0 focus:outline-none hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <Bus className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">QuickBus</span>
          </button>

          <nav className="hidden md:flex space-x-8">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className={`${currentView === 'home' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 px-3 py-2 font-medium`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('search')}
              className={`${currentView === 'search' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 px-3 py-2 font-medium`}
            >
              Search Buses
            </button>
            {user && (
              <button
                type="button"
                onClick={() => setCurrentView('bookings')}
                className={`${currentView === 'bookings' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 px-3 py-2 font-medium`}
              >
                My Bookings
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setCurrentView('admin')}
                className={`${currentView === 'admin' ? 'text-blue-600' : 'text-gray-700'} hover:text-blue-600 px-3 py-2 font-medium`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-blue-600 hover:text-blue-700 px-4 py-2 font-medium"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              type="button"
              onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => { setCurrentView('search'); setIsMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Search Buses
            </button>
            {user && (
              <>
                <button
                  type="button"
                  onClick={() => { setCurrentView('bookings'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  My Bookings
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => { setCurrentView('admin'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Admin Panel
                  </button>
                )}
              </>
            )}
            <div className="border-t pt-4">
              {user ? (
                <div className="px-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{user.name}</span>
                    <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full justify-center"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }}
                    className="block w-full text-center text-blue-600 hover:text-blue-700 px-4 py-2 font-medium"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrentView('register'); setIsMenuOpen(false); }}
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
// Home Page Component
const HomePage = ({ setCurrentView, setGlobalSearchData }) => {
  const [searchData, setSearchData] = useState({
    source: '',
    destination: '',
    travelDate: ''
  });

  const handleSearch = (e) => {
     e.preventDefault();
     if (searchData.source && searchData.destination && searchData.travelDate) {
       // Pass the search data to the global state
       setGlobalSearchData(searchData);
       setCurrentView('search');
     }
   };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-pulse">
            Book Your Perfect Journey
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Fast, reliable, and comfortable bus travel across India
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  From
                </label>
                <input
                  type="text"
                  placeholder="Enter departure city"
                  value={searchData.source}
                  onChange={(e) => setSearchData({...searchData, source: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  To
                </label>
                <input
                  type="text"
                  placeholder="Enter destination city"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Travel Date
                </label>
                <input
                  type="date"
                  value={searchData.travelDate}
                  onChange={(e) => setSearchData({...searchData, travelDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium flex items-center justify-center transform hover:scale-105"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Buses
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuickBus?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best in bus travel with our premium services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Bus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Fleet</h3>
              <p className="text-gray-600">
                Travel in comfort with our modern, well-maintained buses equipped with all amenities
              </p>
            </div>

            <div className="text-center p-6 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">On-Time Service</h3>
              <p className="text-gray-600">
                Reliable schedules and punctual departures to get you to your destination on time
              </p>
            </div>

            <div className="text-center p-6 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Experience</h3>
              <p className="text-gray-600">
                Enjoy exceptional service with comfortable seating and professional staff
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-gray-300">Cities Connected</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">100+</div>
              <div className="text-gray-300">Daily Services</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">99%</div>
              <div className="text-gray-300">On-Time Performance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Page Component
const SearchPage = ({ globalSearchData }) => {
  // Initialize searchParams with globalSearchData if available
  const [searchParams, setSearchParams] = useState({
    source: globalSearchData?.source || '',
    destination: globalSearchData?.destination || '',
    travelDate: globalSearchData?.travelDate || '',
    busType: '',
    sortBy: 'DEPARTURE_TIME'
  });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchBuses = async () => {
    if (!searchParams.source || !searchParams.destination || !searchParams.travelDate) {
      setError('Please fill in all required fields');
      return;
    }


    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const searchRequest = {
        source: searchParams.source,
        destination: searchParams.destination,
        travelDate: searchParams.travelDate,
        busType: searchParams.busType || null,
        sortBy: searchParams.sortBy
      };

      const data = await apiCall('/bus/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest)
      });

      setBuses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to search buses. Please try again.');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
          if (globalSearchData?.source && globalSearchData?.destination && globalSearchData?.travelDate) {
            searchBuses();
          }
        }, [globalSearchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Buses</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              type="text"
              placeholder="Departure city"
              value={searchParams.source}
              onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              type="text"
              placeholder="Destination city"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
            <input
              type="date"
              value={searchParams.travelDate}
              onChange={(e) => setSearchParams({...searchParams, travelDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus Type</label>
            <select
              value={searchParams.busType}
              onChange={(e) => setSearchParams({...searchParams, busType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="AC_SEATER">AC Seater</option>
              <option value="NON_AC_SEATER">Non-AC Seater</option>
              <option value="AC_SLEEPER">AC Sleeper</option>
              <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
              <option value="SEMI_SLEEPER">Semi Sleeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={searchParams.sortBy}
              onChange={(e) => setSearchParams({...searchParams, sortBy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DEPARTURE_TIME">Departure Time</option>
              <option value="FARE">Fare</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={searchBuses}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Searching for buses...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {buses.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              Found {buses.length} bus{buses.length !== 1 ? 'es' : ''} for your journey
            </div>
          )}
          {buses.map((schedule) => (
            <BusCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}

      {hasSearched && buses.length === 0 && !loading && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No buses found for this route</p>
          <p className="text-gray-400 text-sm">Try searching for a different date or route</p>
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Search for buses to see available options</p>
        </div>
      )}
    </div>
  );
};

// Bus Card Component
const BusCard = ({ schedule }) => {
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book tickets');
      return;
    }

    if (!user.id) {
      alert('User ID not found. Please logout and login again.');
      return;
    }

    setBooking(true);
    try {
      await apiCall(`/bookings/book?userId=${user.id}&scheduleId=${schedule.id}&seats=${seats}`, {
        method: 'POST'
      });

      alert(`Booking confirmed! ${seats} seat(s) booked successfully.`);
      setShowBooking(false);
      schedule.availableSeats -= seats;
    } catch (err) {
      alert('Booking failed: ' + err.message);
    } finally {
      setBooking(false);
    }
  };

  const getBusTypeDisplay = (busType) => {
    const typeMap = {
      'AC_SEATER': 'AC Seater',
      'NON_AC_SEATER': 'Non-AC Seater',
      'AC_SLEEPER': 'AC Sleeper',
      'NON_AC_SLEEPER': 'Non-AC Sleeper',
      'SEMI_SLEEPER': 'Semi Sleeper'
    };
    return typeMap[busType] || busType;
  };

  const getBusTypeColor = (busType) => {
    const colorMap = {
      'AC_SEATER': 'bg-blue-100 text-blue-800',
      'NON_AC_SEATER': 'bg-gray-100 text-gray-800',
      'AC_SLEEPER': 'bg-purple-100 text-purple-800',
      'NON_AC_SLEEPER': 'bg-orange-100 text-orange-800',
      'SEMI_SLEEPER': 'bg-green-100 text-green-800'
    };
    return colorMap[busType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <Bus className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">{schedule.bus?.busName}</h3>
            <span className={`ml-3 px-3 py-1 text-sm rounded-full ${getBusTypeColor(schedule.bus?.busType)}`}>
              {getBusTypeDisplay(schedule.bus?.busType)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-semibold">{schedule.departureTime}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-semibold">{schedule.arrivalTime}</p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-semibold">{schedule.route?.source} → {schedule.route?.destination}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Available Seats</p>
                <p className="font-semibold text-green-600">{schedule.availableSeats}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{schedule.journeyDuration || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Fare per seat</p>
              <p className="text-2xl font-bold text-green-600">₹{schedule.fare}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6">
          {user ? (
            <button
              onClick={() => setShowBooking(!showBooking)}
              className="w-full lg:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={schedule.availableSeats === 0}
            >
              {schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
            </button>
          ) : (
            <button
              onClick={() => alert('Please login to book tickets')}
              className="w-full lg:w-auto bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Login to Book
            </button>
          )}
        </div>
      </div>

      {showBooking && schedule.availableSeats > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
          <h4 className="text-lg font-semibold mb-4">Book Your Seats</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Seats</label>
              <select
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(Math.min(schedule.availableSeats, 6))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} seat{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Fare</p>
              <p className="text-xl font-bold text-green-600">₹{schedule.fare * seats}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBooking}
                disabled={booking}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {booking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Login Page Component
const LoginPage = ({ setCurrentView }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    emailId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiCall('/users/login_user', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      await login(response.token);
      setCurrentView('home');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Bus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your QuickBus account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <X className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                value={formData.emailId}
                onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentView('register')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Accounts:</p>
          <p className="text-xs text-blue-700">Admin: admin@test.com / password</p>
          <p className="text-xs text-blue-700">User: user@test.com / password</p>
        </div>
      </div>
    </div>
  );
};

// Register Page Component
const RegisterPage = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({
    name: '',
    emailId: '',
    password: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      alert('Registration successful! Please login.');
      setCurrentView('login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Bus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Join QuickBus
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start booking
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <X className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                value={formData.emailId}
                onChange={(e) => setFormData({...formData, emailId: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bookings Page Component
const BookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await apiCall(`/bookings/user/${user.id}`);
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

const cancelSeats = async (bookingId, totalSeats) => {
  const seatsToCancel = prompt(
    `How many seats would you like to cancel? (Total booked: ${totalSeats})`,
    '1'
  );

  if (!seatsToCancel) return;

  const numSeats = parseInt(seatsToCancel);

  if (isNaN(numSeats) || numSeats <= 0 || numSeats > totalSeats) {
    alert('Please enter a valid number of seats');
    return;
  }

  const confirmMessage = numSeats === totalSeats
    ? `Are you sure you want to cancel the entire booking (${numSeats} seats)?`
    : `Are you sure you want to cancel ${numSeats} seat(s)? ${totalSeats - numSeats} seat(s) will remain active.`;

  if (!confirm(confirmMessage)) return;

  try {
    const response = await apiCall(`/bookings/cancel-seats/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ seatsToCancel: numSeats }),
    });

    alert(response.message || response);
    fetchBookings();
  } catch (err) {
    console.error('Cancellation error:', err);
    alert('Cancellation failed: ' + err.message);
  }
};

const cancelEntireBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel the entire booking?')) return;

  try {
    const response = await apiCall(`/bookings/cancel/${bookingId}`, {
      method: 'DELETE',
    });

    alert(response.message || response);
    fetchBookings();
  } catch (err) {
    console.error('Cancellation error:', err);
    alert('Cancellation failed: ' + err.message);
  }
};


  const getStatusColor = (status) => {
    return status === 'BOOKED' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Please login to view your bookings.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">Manage your bus reservations</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No bookings found</p>
          <p className="text-gray-400 text-sm mb-4">Book your first bus ticket to get started</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Buses
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Booking #{booking.id}
                  </h3>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {booking.status === 'BOOKED' && (
                  <div className="flex gap-2">
                    {booking.seatsBooked > 1 && (
                      <button
                        onClick={() => cancelSeats(booking.id, booking.seatsBooked)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Seats
                      </button>
                    )}

                    <button
                      onClick={() => cancelEntireBooking(booking.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel All
                    </button>
                  </div>
                )}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Bus Details</p>
                  <p className="font-semibold">{booking.schedule?.bus?.busName}</p>
                  <p className="text-sm text-gray-600">{booking.schedule?.bus?.busType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-semibold">
                    {booking.schedule?.route?.source} → {booking.schedule?.route?.destination}
                  </p>
                  <p className="text-sm text-gray-600">{booking.schedule?.route?.distance} km</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Travel Details</p>
                  <p className="font-semibold">{booking.schedule?.travelDate}</p>
                  <p className="text-sm text-gray-600">
                    {booking.schedule?.departureTime} - {booking.schedule?.arrivalTime}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Booking Info</p>
                  <p className="font-semibold">{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</p>
                  <p className="text-lg font-bold text-green-600">₹{booking.totalFare}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Booked on: {new Date(booking.bookingTime).toLocaleString()}
                </p>
                {booking.schedule?.journeyDuration && (
                  <p className="text-sm text-gray-500">
                    Journey Duration: {booking.schedule.journeyDuration}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Admin Page Component
const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [routeForm, setRouteForm] = useState({
    source: '',
    destination: '',
    distance: ''
  });

  const [busForm, setBusForm] = useState({
    busName: '',
    busNumber: '',
    busType: 'AC_SEATER',
    totalSeats: 40
  });

  const [scheduleForm, setScheduleForm] = useState({
    busId: '',
    routeId: '',
    travelDate: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    availableSeats: 40
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesData, busesData, schedulesData] = await Promise.all([
        apiCall('/bus/getAllRoute'),
        apiCall('/bus/getAllBus'),
        apiCall('/bus/getBussesSchedule')
      ]);
        const sortedRoutes = (routesData || []).sort((a, b) => {
            const sourceComparison = a.source.localeCompare(b.source);
            if (sourceComparison !== 0) return sourceComparison;
            return a.destination.localeCompare(b.destination);
          });
          const sortedBuses = (busesData || []).sort((a, b) => {
            return a.busName.localeCompare(b.busName);
          });
      setRoutes(routesData || []);
      setBuses(busesData || []);
      setSchedules(schedulesData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRoute = async (e) => {
    e.preventDefault();
    try {
      const newRoute = await apiCall('/bus/add-route', {
        method: 'POST',
        body: JSON.stringify({
          ...routeForm,
         distanceKm: parseInt(routeForm.distance)
        })
      });
      setRoutes([...routes, newRoute]);
      alert('Route added successfully');
      setRouteForm({ source: '', destination: '', distance: '' });
    } catch (err) {
      alert('Failed to add route: ' + err.message);
    }
  };

  const addBus = async (e) => {
    e.preventDefault();
    try {
      const newBus = await apiCall('/bus/add-bus', {
        method: 'POST',
        body: JSON.stringify({
          ...busForm,
          totalSeats: parseInt(busForm.totalSeats)
        })
      });
      setBuses([...buses, newBus]);
      alert('Bus added successfully');
      setBusForm({ busName: '', busNumber: '', busType: 'AC_SEATER', totalSeats: 40 });
    } catch (err) {
      alert('Failed to add bus: ' + err.message);
    }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        bus: { id: parseInt(scheduleForm.busId) },
        route: { id: parseInt(scheduleForm.routeId) },
        travelDate: scheduleForm.travelDate,
        departureTime: scheduleForm.departureTime,
        arrivalTime: scheduleForm.arrivalTime,
        fare: parseInt(scheduleForm.fare),
        availableSeats: parseInt(scheduleForm.availableSeats)
      };

      const newSchedule = await apiCall('/bus/add-schedule', {
        method: 'POST',
        body: JSON.stringify(scheduleData)
      });

      setSchedules([...schedules, newSchedule]);
      alert('Schedule added successfully');
      setScheduleForm({
        busId: '',
        routeId: '',
        travelDate: '',
        departureTime: '',
        arrivalTime: '',
        fare: '',
        availableSeats: 40
      });
    } catch (err) {
      alert('Failed to add schedule: ' + err.message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">Manage routes, buses, and schedules</p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'routes', label: 'Routes', icon: MapPin },
            { key: 'buses', label: 'Buses', icon: Bus },
            { key: 'schedules', label: 'Schedules', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      )}

      {!loading && activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add New Route
            </h2>
            <form onSubmit={addRoute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Source City</label>
                <input
                  type="text"
                  required
                  value={routeForm.source}
                  onChange={(e) => setRouteForm({...routeForm, source: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter source city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination City</label>
                <input
                  type="text"
                  required
                  value={routeForm.destination}
                  onChange={(e) => setRouteForm({...routeForm, destination: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter destination city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">distance (km)</label>

                <input
                  type="number"
                  required
                  min="1"
                  value={routeForm.distance}
                  onChange={(e) => setRouteForm({...routeForm, distance: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter distance in kilometers"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Routes ({routes.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {routes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No routes added yet</p>
              ) : (
                routes.map((route) => (
                  <div key={route.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{route.source} → {route.destination}</p>
                        <p className="text-sm text-gray-600">{route.distanceKm} km</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">ID: {route.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'buses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add New Bus
            </h2>
            <form onSubmit={addBus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bus Name</label>
                <input
                  type="text"
                  required
                  value={busForm.busName}
                  onChange={(e) => setBusForm({...busForm, busName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bus name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                <input
                  type="text"
                  required
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm({...busForm, busNumber: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bus registration number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bus Type</label>
                <select
                  value={busForm.busType}
                  onChange={(e) => setBusForm({...busForm, busType: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AC_SEATER">AC Seater</option>
                  <option value="NON_AC_SEATER">Non-AC Seater</option>
                  <option value="AC_SLEEPER">AC Sleeper</option>
                  <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                  <option value="SEMI_SLEEPER">Semi Sleeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="60"
                  value={busForm.totalSeats}
                  onChange={(e) => setBusForm({...busForm, totalSeats: parseInt(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bus
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Buses ({buses.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {buses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No buses added yet</p>
              ) : (
                buses.map((bus) => (
                  <div key={bus.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{bus.busName}</p>
                        <p className="text-sm text-gray-600">{bus.busNumber}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            {bus.busType?.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{bus.totalSeats} seats</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">ID: {bus.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add New Schedule
            </h2>
            <form onSubmit={addSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Bus</label>
                <select
                  required
                  value={scheduleForm.busId}
                  onChange={(e) => setScheduleForm({...scheduleForm, busId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.busName} ({bus.busNumber}) - {bus.busType?.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Route</label>
                <select
                  required
                  value={scheduleForm.routeId}
                  onChange={(e) => setScheduleForm({...scheduleForm, routeId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.source} → {route.destination} ({route.distance} km)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.travelDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, travelDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.departureTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, departureTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.arrivalTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, arrivalTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fare (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={scheduleForm.fare}
                    onChange={(e) => setScheduleForm({...scheduleForm, fare: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter fare amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Seats</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={scheduleForm.availableSeats}
                    onChange={(e) => setScheduleForm({...scheduleForm, availableSeats: parseInt(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Schedules ({schedules.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No schedules added yet</p>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {schedule.bus?.busName} - {schedule.route?.source} → {schedule.route?.destination}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.travelDate} | {schedule.departureTime} - {schedule.arrivalTime}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ₹{schedule.fare}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {schedule.availableSeats} seats
                          </span>
                          {schedule.journeyDuration && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {schedule.journeyDuration}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">ID: {schedule.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusBookingApp;