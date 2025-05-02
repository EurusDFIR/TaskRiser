
**Setup and Running Instructions**

Follow these steps to set up and run the project:

1.  **Install Node.js (LTS version):** Make sure you have the latest Long-Term Support (LTS) version of Node.js installed on your system.
2.  **Open your terminal:** Navigate to the `jwt-prototype` directory in your terminal.
3.  **Install Backend Dependencies:**
    * Change directory to the backend service: `cd backend-service-simplified`
    * Install necessary packages: `npm install`
4.  **Install API Gateway Dependencies:**
    * Go back to the root directory: `cd ../api-gateway-simplified`
    * Install necessary packages: `npm install`
5.  **Install Client Script Dependencies:**
    * Go back to the root directory: `cd ../client-script`
    * Install necessary packages: `npm install`
6.  **Create `.env` files:**
    * In both the `backend-service-simplified` and `api-gateway-simplified` directories, create a file named `.env`.
    * Add the following line to *both* `.env` files: `JWT_SECRET=DayLaBiMatSieuCapManhCuaTaskRiser!@#$` (Ensure the secret key is identical in both files).
7.  **Run the Services:** Open three separate terminal windows.
    * **Terminal 1 (Backend Service):**
        * Navigate to the backend directory: `cd backend-service-simplified`
        * Start the server: `node server.js`
    * **Terminal 2 (API Gateway):**
        * Navigate to the API gateway directory: `cd api-gateway-simplified`
        * Start the server: `node server.js`
    * **Terminal 3 (Client Script):**
        * Navigate to the client script directory: `cd client-script`
        * Run the test script: `node test_api.js`
8.  **Observe the Output:** Watch the output in all three terminals to see the flow of operations and the authentication results.