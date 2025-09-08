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

    async function saveEvents(newEvents) {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvents),
            });
            if (!response.ok) {
                throw new Error('Failed to save events');
            }
        } catch (error) {
            console.error(error);
        }
    }

    function parseRawText(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const events = [];
        const dateRegex = /^(\d{4}-\d{2}-\d{2}):\s*(.*)$/;

        lines.forEach(line => {
            const match = line.match(dateRegex);
            if (match) {
                events.push({
                    date: match[1],
                    title: match[2].trim()
                });
            }
        });
        return events;
    }

    async function renderCalendar(month, year) {
        const events = await fetchEvents();
        calendar.innerHTML = '';
        monthYearDisplay.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
                eventElement.textContent = event.title;
                eventsContainer.appendChild(eventElement);
            });

            calendar.appendChild(dayCell);
        }
    }

    populateButton.addEventListener('click', async () => {
        const rawText = rawTextInput.value;
        if (!rawText) return;

        const newEvents = parseRawText(rawText);
        if (newEvents.length > 0) {
            await saveEvents(newEvents);
            rawTextInput.value = ''; // Clear input
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
