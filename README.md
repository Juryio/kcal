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
4.  Open your browser and navigate to `http://localhost:8080`.

### Running with Docker

1.  Build the Docker image:
    ```bash
    docker build -t shift-calendar .
    ```
2.  Run the Docker container:
    ```bash
    docker run -p 8080:8080 -v $(pwd)/events.json:/usr/src/app/events.json shift-calendar
    ```
3.  Open your browser and navigate to `http://localhost:8080`.

    **Note:** The `-v $(pwd)/events.json:/usr/src/app/events.json` part is optional. It mounts the `events.json` file from your local machine into the container, allowing the event data to persist even if the container is removed. You may need to create an empty `events.json` file in the root of the project first (`touch events.json`).

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