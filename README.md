# WebSocket Chat Server

This is a WebSocket-based chat server built using Node.js and Express. It allows users to join groups, send messages, log in, sign up, and manage group memberships dynamically. The server also uses a simple database (presumably for user management and authentication) and can handle multiple groups for real-time communication.

## Features

- **Real-time messaging**: Users can send and receive messages within groups in real-time.
- **User authentication**: Users can log in with their credentials and sign up if they don't have an account.
- **Group management**: Create new groups, join existing groups, and send messages to all group members.
- **Dynamic group updates**: Once a user connects to a group, the group’s members are updated in real time.
- **Database integration**: The server integrates with a database for user management and storing group data.

## Prerequisites

Before running the server, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**

## Installation

1. Clone this repository to your local machine.

    ```bash
    git clone https://github.com/your-username/websocket-chat-server.git
    cd websocket-chat-server
    ```

2. Install the required dependencies.

    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up the database (`Database/index.js`) to handle user authentication and storage.

4. Once the setup is complete, start the server:

    ```bash
    node server.js
    ```

    The server will be listening on port `5000`.

## API Endpoints

The server uses WebSocket for communication, so no traditional HTTP routes are exposed for messaging. Here are the WebSocket message types:

### 1. **first-connect**
   - **Description**: Sent by a user when they connect to the server.
   - **Response**: If successful, the server acknowledges the connection and adds the user to the group.
   
### 2. **message**
   - **Description**: Sends a message to the group from the user.
   - **Payload**:
     ```json
     {
       "type": "message",
       "name": "UserName",
       "group": "GroupName",
       "Text": "Hello, World!"
     }
     ```
   - **Response**: Broadcasts the message to all group members.

### 3. **make_group**
   - **Description**: Creates a new group.
   - **Payload**:
     ```json
     {
       "type": "make_group",
       "group_name": "NewGroupName"
     }
     ```
   - **Response**: Adds the user to the newly created group.

### 4. **log_in**
   - **Description**: Logs in a user using their username and password.
   - **Payload**:
     ```json
     {
       "type": "log_in",
       "name": "UserName",
       "pwrd": "password"
     }
     ```
   - **Response**: If successful, the server sends back user data and group memberships.

### 5. **sign-up**
   - **Description**: Signs up a new user.
   - **Payload**:
     ```json
     {
       "type": "sign-up",
       "name": "NewUser",
       "pwrd": "password",
       "id": "unique-id"
     }
     ```
   - **Response**: Creates a new user in the database and responds with confirmation.

### 6. **get_groups**
   - **Description**: Gets a list of all active groups.
   - **Response**: Sends back a list of active groups in the server.

## WebSocket Connection Details

To connect to the server via WebSocket, clients must connect to the following WebSocket URL:

