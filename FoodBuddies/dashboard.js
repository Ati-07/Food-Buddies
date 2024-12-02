// Function to check if the token is expired
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return payload.exp < currentTime; // Compare expiration time with current time
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');

  // Redirect to login if the token is missing or expired
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
    return;
  }

  let allFoodListings = [];

  // Fetch and display user information
  fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'x-auth-token': token,
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById('userName').textContent = data.firstName;
      } else {
        window.location.href = 'index.html';
      }
    })
    .catch(error => console.error('Error fetching user data:', error));

  // Fetch and display all food listings (no ZIP code filter by default)
  fetch('http://localhost:5000/api/food', {
    method: 'GET',
    headers: {
      'x-auth-token': token,
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(foodListings => {
      allFoodListings = foodListings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      displayFoodListings(allFoodListings);
    })
    .catch(error => console.error('Error fetching food listings:', error));

  // Function to display food listings
  function displayFoodListings(foodListings) {
    const foodListingsContainer = document.getElementById('foodListings');
    foodListingsContainer.className = 'food-grid';
    foodListingsContainer.innerHTML = '';

    if (foodListings.length === 0) {
      foodListingsContainer.innerHTML = '<p>No food listings found.</p>';
      return;
    }

    foodListings.forEach(food => {
      const foodElement = document.createElement('div');
      foodElement.classList.add('food-post');
      foodElement.addEventListener('click', () => openFoodDetailsModal(food));

      const imageUrl = `http://localhost:5000${food.images?.[0] || '/images/default.jpg'}`;
      foodElement.innerHTML = `
        <img src="${imageUrl}" alt="${food.description}" />
        <div class="food-post-content">
          <p><strong>Name of the Product:</strong> ${food.description}</p>
          <p><strong>Type of the Product:</strong> ${food.type}</p>
          <p><strong>Date Made:</strong> ${formatDateToEST(food.dateMade)}</p>
          <p><strong>Expiration Date:</strong> ${formatDateToEST(food.expirationDate)}</p>
        </div>
      `;
      foodListingsContainer.appendChild(foodElement);
    });
  }

  // Format dates to EST
  function formatDateToEST(date) {
    const options = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  // Function to open the food details modal
  function openFoodDetailsModal(food) {
    document.getElementById('foodTitle').textContent = `Name of the Product: ${food.description || "Not specified"}`;
    document.getElementById('foodDescription').textContent = `Type of the Product: ${food.type || "Not specified"}`;
    document.getElementById('dateMade').textContent = food.dateMade
      ? formatDateToEST(food.dateMade)
      : "Not specified";
    document.getElementById('foodExpirationDate').textContent = food.expirationDate
      ? formatDateToEST(food.expirationDate)
      : "Not specified";

    // Set ingredients
    const ingredientsElement = document.getElementById('foodIngredients');
    ingredientsElement.textContent = food.ingredients?.join(', ') || "No ingredients listed";

    // Set posted by details
    const postedByElement = document.getElementById('foodPostedBy');
    postedByElement.textContent = `${food.postedBy?.firstName || "Unknown"} ${food.postedBy?.lastName || ""}`.trim();

    // Display the modal
    document.getElementById('foodDetailsModal').style.display = 'block';
  }

  // Function to close the modal
  window.closeModal = function () {
    document.getElementById('foodDetailsModal').style.display = 'none';
  };

  // Filter food by location (with ZIP code or show all if blank)
  document.getElementById('zipcodeInput').addEventListener('input', () => {
    const zipcode = document.getElementById('zipcodeInput').value.trim();
    
    // If ZIP code is empty, fetch and display all food listings
    if (!zipcode) {
      fetch('http://localhost:5000/api/food', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(allFood => {
          displayFoodListings(allFood);  // Display all food listings
        })
        .catch(error => console.error('Error fetching all food listings:', error));
    } else {
      // If ZIP code is entered, fetch filtered food listings
      fetch(`http://localhost:5000/api/food?zipcode=${zipcode}`, {
        method: 'GET',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(filteredFood => {
          displayFoodListings(filteredFood);  // Display filtered food listings
        })
        .catch(error => console.error('Error filtering food by location:', error));
    }
  });

  // Real-time search functionality
  document.getElementById('searchInput').addEventListener('input', event => {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      displayFoodListings(allFoodListings);
      return;
    }

    const filteredListings = allFoodListings.filter(food =>
      food.description.toLowerCase().includes(searchTerm)
    );

    if (filteredListings.length > 0) {
      displayFoodListings(filteredListings);
    } else {
      document.getElementById('foodListings').innerHTML = `<p>No food listings found for "${searchTerm}".</p>`;
    }
  });

  // Logout function
  window.logout = function () {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  };

  // Sort listings by post date
  document.getElementById('sortOrder').addEventListener('change', () => {
    const sortOrder = document.getElementById('sortOrder').value;
    const sortedListings = [...allFoodListings].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'new' ? dateB - dateA : dateA - dateB;
    });
    displayFoodListings(sortedListings);
  });

  // Clear feed functionality
  document.getElementById('clearFeedButton').addEventListener('click', () => {
    fetch('http://localhost:5000/api/food/clear', {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          allFoodListings = [];
          displayFoodListings(allFoodListings);
          alert('All food listings cleared.');
        } else {
          alert('Failed to clear feed.');
        }
      })
      .catch(error => console.error('Error clearing feed:', error));
  });
});
