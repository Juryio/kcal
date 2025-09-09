document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const rawTextInput = document.getElementById('raw-text');
    const populateButton = document.getElementById('populate-calendar');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const darkModeToggleButton = document.getElementById('dark-mode-toggle');

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    async function fetchEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async function saveEvents(data) {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to save events');
            }
        } catch (error) {
            console.error(error);
        }
    }

    function parseRawText(text) {
        const monthMap = {
            "january": 0, "januar": 0,
            "february": 1, "februar": 1,
            "march": 2, "märz": 2, "maerz": 2,
            "april": 3,
            "may": 4, "mai": 4,
            "june": 5, "juni": 5,
            "july": 6, "juli": 6,
            "august": 7,
            "september": 8,
            "october": 9, "oktober": 9,
            "november": 10,
            "december": 11, "dezember": 11
        };
        const monthNames = Object.keys(monthMap);
        let year, month;

        const monthYearRegex = new RegExp(`(${monthNames.join('|')})\\s+(\\d{4})`, 'i');
        const monthYearMatch = text.match(monthYearRegex);

        if (!monthYearMatch) {
            console.error("Could not determine month and year from text. Please ensure the month and year (e.g., 'September 2025') are present.");
            alert("Could not determine the month and year from the pasted text. Please make sure it's included.");
            return { monthYear: null, events: [] };
        }

        year = parseInt(monthYearMatch[2], 10);
        const monthName = monthYearMatch[1].toLowerCase();
        month = monthMap[monthName];
        const parsedMonthYear = `${year}-${String(month + 1).padStart(2, '0')}`;

        // Clean up the text to remove grid-like artifacts and get a clean list of tokens.
        const lines = text.split('\n')
            .map(line => line.replace('►', '').trim()) // Remove navigator arrows and trim whitespace
            .filter(line => !/^(Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i.test(line.trim())) // Remove day-of-week headers
            .filter(line => line.trim() !== 'W') // Remove week markers
            .filter(line => !monthYearRegex.test(line)) // Remove the line with the month/year text
            .filter(line => line); // Remove any empty lines that result from the cleaning

        const events = [];
        let currentDay = 0;
        let currentMonth = month;
        let currentYear = year;
        let firstDayFound = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (/^\d{1,2}$/.test(line)) {
                const day = parseInt(line, 10);

                if (!firstDayFound) {
                    // If this is the first day number we find and it's high (e.g., 29),
                    // it belongs to the month before the one in the header.
                    if (day > 20) {
                        currentMonth--;
                        if (currentMonth < 0) {
                            currentMonth = 11;
                            currentYear--;
                        }
                    }
                    firstDayFound = true;
                } else if (day < currentDay && currentDay > 20) {
                    // If the day number drops from high to low (e.g., 31 -> 1),
                    // we've rolled into the next month.
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                }
                currentDay = day;

                const nextLine1 = lines[i + 1];
                const nextLine2 = lines[i + 2];
                const nextLine3 = lines[i + 3];

                const timeRegex = /^\d{2}:\d{2}$/;
                if (nextLine1 && timeRegex.test(nextLine1) &&
                    nextLine2 && timeRegex.test(nextLine2) &&
                    nextLine3 && isNaN(parseInt(nextLine3, 10))) {

                    const startTime = nextLine1;
                    const endTime = nextLine2;
                    const title = nextLine3;

                    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

                    const eventData = {
                        date: date,
                        title: `${title} ${startTime}-${endTime}`
                    };

                    const nextLine4 = lines[i + 4];
                    if (nextLine4 && isNaN(parseInt(nextLine4, 10)) && !/^\d{2}:\d{2}$/.test(nextLine4)) {
                        eventData.note = nextLine4;
                        i += 4;
                    } else {
                        i += 3;
                    }

                    events.push(eventData);
                }
            }
        }
        return { monthYear: parsedMonthYear, events };
    }

    function getShiftType(event) {
        const title = event.title.toLowerCase();
        if (title.includes('holiday')) return 'holiday';

        const timeMatch = event.title.match(/(\d{2}):\d{2}/);
        if (timeMatch) {
            const startHour = parseInt(timeMatch[1], 10);
            if (startHour < 12) return 'morning';
            return 'evening';
        }

        return 'default';
    }

    async function renderCalendar(month, year) {
        const events = await fetchEvents();
        calendar.innerHTML = '';
        monthYearDisplay.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        // --- Monday Start Logic ---
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDay; i++) {
            const blankDay = document.createElement('div');
            blankDay.classList.add('day', 'blank');
            calendar.appendChild(blankDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');

            // Highlight Today
            const todayDate = new Date();
            if (i === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear()) {
                dayCell.classList.add('today');
            }

            const dateElement = document.createElement('div');
            dateElement.classList.add('date');
            dateElement.textContent = i;
            dayCell.appendChild(dateElement);

            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('events');
            dayCell.appendChild(eventsContainer);

            const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === currentDate);

            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');

                // --- Color Coding Logic ---
                const shiftType = getShiftType(event);
                eventElement.classList.add(`event-${shiftType}`);

                // Create structured content for the event block
                const timeMatch = event.title.match(/(\d{2}:\d{2}-\d{2}:\d{2})/);
                const timeText = timeMatch ? timeMatch[1] : '';
                const titleText = event.title.replace(timeText, '').trim();

                const timeElement = document.createElement('span');
                timeElement.classList.add('event-time');
                timeElement.textContent = timeText;

                eventElement.textContent = titleText;
                eventElement.prepend(timeElement);

                // --- Render Note ---
                if (event.note) {
                    const noteElement = document.createElement('div');
                    noteElement.classList.add('event-note');
                    noteElement.textContent = event.note;
                    eventElement.appendChild(noteElement);
                }

                eventsContainer.appendChild(eventElement);
            });

            calendar.appendChild(dayCell);
        }
    }

    populateButton.addEventListener('click', async () => {
        const rawText = rawTextInput.value;
        if (!rawText) return;

        const { monthYear, events: newEvents } = parseRawText(rawText);

        if (monthYear) {
            await saveEvents({ monthYear, events: newEvents });
            rawTextInput.value = ''; // Clear input
            // The parsed month might be different from the currently displayed month
            const [year, month] = monthYear.split('-').map(Number);
            currentYear = year;
            currentMonth = month - 1;
            renderCalendar(currentMonth, currentYear);
        }
    });

    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    darkModeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.removeItem('darkMode');
        }
    });

    function init() {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }
        renderCalendar(currentMonth, currentYear);
    }

    init();
});
