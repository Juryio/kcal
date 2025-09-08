# Shift Calendar

A simple web application to display a calendar and populate it with events from raw text input.

## Features

-   Displays a calendar for the current month.
-   Allows pasting of raw text to create calendar events.
-   Events are saved on the server and persist across sessions.
-   The application is containerized with Docker for easy deployment.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (for running locally without Docker)
-   [Docker](https://www.docker.com/) (for running with Docker)

### Running Locally

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  Open your browser and navigate to `http://localhost:8282`.

### Running with Docker Compose

**1. Important First Step!**

Before running `docker-compose` for the first time, you **must** create an empty `events.json` file in the root of the project. This is required to ensure Docker correctly mounts a file, not a directory.

```bash
touch events.json
```

**2. Build and Run**

Now, you can build and run the application:
```bash
docker-compose up --build
```

**3. View the Application**

Open your browser and navigate to `http://localhost:8282`.

**4. Stopping the Application**

To stop the application, press `Ctrl+C` in the terminal where `docker-compose` is running, and then run:
```bash
docker-compose down
```

## How to Use

1.  Open the application in your browser.
2.  In the "Paste Raw Text" area, enter your event data in the following format:
    ```
    YYYY-MM-DD: Event Title
    ```
    For example:
    ```
    2023-10-26: Morning Shift (9am-5pm)
    2023-10-27: Vacation
    ```
3.  Click the "Populate Calendar" button. The calendar will update with your events.