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

1.  **Build and Run**

    Simply build and run the application using Docker Compose. The server will automatically create the necessary data file inside a Docker-managed volume.
```bash
docker-compose up --build
```

**2. View the Application**

Open your browser and navigate to `http://localhost:8282`.

**4. Stopping the Application**

To stop the application, press `Ctrl+C` in the terminal where `docker-compose` is running, and then run:
```bash
docker-compose down
```

## How to Use

1.  Open the application in your browser.
2.  In the "Paste Raw Text" area, paste your schedule. The parser is designed to be flexible, but it expects a format similar to this:

    ```
	September 2025	►
    Mo	Di	Mi	Do	Fr	Sa	So
    W
    1
    14:00
    20:00
    Work
    2
    14:00
    20:00
    Work
    ...
    ```
    The parser will automatically find the month and year. For each day, it looks for a block of text containing the day number, a start time, an end time, and a title.

3.  Click the "Populate Calendar" button. The calendar will update with the events from the text.