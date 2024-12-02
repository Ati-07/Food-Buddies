# Food Buddies 
 
**Food Buddies** is a community-driven web application designed to minimize food waste by enabling individuals, communities, and students to share leftover food. It leverages geolocation to connect food providers with those in need, creating a sustainable and collaborative environment. 
 
## Features 
 
- **Food Sharing:** Users can post details about leftover food to share with the community. 
- **Live Location Integration:** Find and list food items based on your current location using Google Maps API. 
- **User Profiles:** Manage and track contributions through personalized profiles. 
- **Secure Authentication:** Implemented secure signup/login with role-based user access. 
- **Geospatial Data:** Backend support for location-based food listings. 
 
## Technology Stack 
 
### Frontend 
- **Languages/Frameworks:** HTML, CSS, JavaScript 
- **Google Maps API:** Integrated for live location services. 
 
### Backend 
- **Runtime Environment:** Node.js 
- **Frameworks/Libraries:** Express.js, Mongoose, JSON Web Token (JWT) for authentication. 
- **Database:** MongoDB with geospatial indexing. 
 
## File Structure 
 
### Frontend 
- **HTML Files:** Includes pages like `index.html`, `dashboard.html`, and `post_food.html`. 
- **CSS:** Custom styles for pages (e.g., `dashboard.css`, `profile.css`). 
- **JavaScript:** Logic handling (e.g., `dashboard.js`, `app.js`). 
 
### Backend 
- **Middleware:** Custom middleware for authentication (`auth.js`). 
- **Models:** MongoDB schemas for food (`Food.js`) and user management (`User.js`). 
- **Routes:** API endpoints for authentication (`auth.js`) and food operations (`food.js`). 
- **Core Files:** `index.js` as the main server file, `.env` for environment variables. 
 
For a detailed list, see the repository’s file structure. 
 
## Installation & Setup 
 
1. Clone the repository: 
   ```bash 
   git clone https://github.com/yourusername/food-buddies.git 
   cd food-buddies 
 

Install dependencies for both frontend and backend: 

bash 

Copy code 

cd frontend 
npm install 
cd ../backend 
npm install 
 

Set up environment variables: 

Create a .env file in the backend directory. 

Add the following keys: 

makefile 

Copy code 

MONGO_URI=<Your MongoDB Connection String> 
JWT_SECRET=<Your JWT Secret> 
GOOGLE_MAPS_API_KEY=< AIzaSyDmaaHcEmEzDVv_tEnxf_pZk7g4GczdkPI > 
 

Run the project: 

bash 

Copy code 

cd backend 
node index.js 
 

Access the application at http://localhost:3000. 

Usage Instructions 

Sign Up/Login: Create an account to begin sharing or accessing food. 

Post Food: Navigate to the "Post Food" page, fill in the details, and submit. 

Search Nearby Food: Use the map to find food listings near you. 

Contribution Guidelines 

Contributions are welcome! Here's how you can get involved: 

Fork the repository. 

Create a feature branch: git checkout -b feature-name. 

Commit your changes: git commit -m 'Add some feature'. 

Push to the branch: git push origin feature-name. 

Submit a pull request. 

License 

Please feel free to modify this code for educational and/or personal purposes. 

 
