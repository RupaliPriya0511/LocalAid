# LocalAid

A full-stack community help platform built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- User profiles with avatar and location
- Create, filter, and manage posts (Help, Service, Alert)
- Offer to help, real-time chat, and notifications
- Responsive, modern UI

## Tech Stack

- Frontend: React, Material-UI, Vite
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO

## Folder Structure

```
local_Aid/
  frontend/           # React frontend (Vite)
  localaid-backend/   # Node.js/Express backend
  localaid-frontend/  # (unused or legacy)
  ...
```

## Setup

### 1. Clone the repo

```sh
git clone https://github.com/yourusername/localaid.git
cd local_Aid
```

### 2. Install dependencies

```sh
cd frontend
npm install
cd ../localaid-backend
npm install
```

### 3. Environment Variables

Create a `.env` file in `localaid-backend/` with:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

**Never commit your `.env` file!**

### 4. Run the app

- **Backend:**  
  ```sh
  cd localaid-backend
  npm start
  ```
- **Frontend:**  
  ```sh
  cd ../frontend
  npm run dev
  ```

## Deployment

- Deploy backend (e.g., Render, Railway, Heroku)
- Deploy frontend (e.g., Vercel, Netlify)
- Set environment variables on your deployment platform

## Security

- `.env`, `node_modules`, and `uploads` are in `.gitignore` and must never be committed.
- Change any secrets if you ever accidentally commit them.

## License

MIT 