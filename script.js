let selectedFlight = null;
let selectedHotel = null;
const bookings = [];

// Load flights from local storage or initialize an empty array
let flights = JSON.parse(localStorage.getItem('flights')) || [];

const hotels = [
    { id: 'A', price: 500000 },
    { id: 'B', price: 600000 },
    { id: 'C', price: 700000 },
];

document.getElementById('flight-search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;

    if (!date) {
        alert('Please select a date before searching.');
        return;
    }

    let results = flights.filter(flight => flight.source === source && flight.destination === destination && flight.date === date);
    
    if (results.length === 0) {
        // Generate a random price between 900,000 and 1,700,000
        const randomPrice = Math.floor(Math.random() * (1700000 - 900000 + 1)) + 900000;

        // Add a new flight with the searched criteria
        const newFlight = {
            id: flights.length + 1,
            source: source,
            destination: destination,
            date: date,
            price: randomPrice
        };
        flights.push(newFlight);
        localStorage.setItem('flights', JSON.stringify(flights));
        results.push(newFlight);
    }
    
    let resultsHtml = '<h3>Flight Results:</h3>';
    if (results.length > 0) {
        resultsHtml += '<table>';
        resultsHtml += '<tr><th>Flight ID</th><th>Source</th><th>Destination</th><th>Date</th><th>Price</th><th>Seats</th><th>Action</th></tr>';
        results.forEach(flight => {
            resultsHtml += `<tr>
                                <td>${flight.id}</td>
                                <td>${flight.source}</td>
                                <td>${flight.destination}</td>
                                <td>${flight.date}</td>
                                <td>Rp ${flight.price}</td>
                                <td><input type="number" id="seats-${flight.id}" min="1" max="10" value="1"></td>
                                <td><button onclick="selectFlight(${flight.id})">Select</button></td>
                            </tr>`;
        });
        resultsHtml += '</table>';
    }
    document.getElementById('flight-results').innerHTML = resultsHtml;
});

document.getElementById('hotel-selection-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const hotelRoom = document.getElementById('hotel-room').value;
    const hotel = hotels.find(h => h.id === hotelRoom);
    
    let hotelHtml = '<h3>Hotel Results:</h3>';
    if (hotel) {
        hotelHtml += '<table>';
        hotelHtml += '<tr><th>Room</th><th>Price</th><th>Action</th></tr>';
        hotelHtml += `<tr>
                        <td>${hotel.id}</td>
                        <td>Rp ${hotel.price}</td>
                        <td><button onclick="selectHotel('${hotel.id}')">Select</button></td>
                    </tr>`;
        hotelHtml += '</table>';
    } else {
        hotelHtml += '<p>No hotels found.</p>';
    }
    document.getElementById('hotel-results').innerHTML = hotelHtml;
});

function renderBookings() {
    let bookingHtml = '<h3>Your Bookings:</h3>';
    if (bookings.length > 0) {
        bookingHtml += '<table>';
        bookingHtml += '<tr><th>Booking ID</th><th>Flight ID</th><th>Source</th><th>Destination</th><th>Date</th><th>Number of Seats</th><th>Hotel Room</th><th>Total Price</th><th>Action</th></tr>';
        bookings.forEach(booking => {
            bookingHtml += `<tr>
                                <td>${booking.id}</td>
                                <td>${booking.flight.id}</td>
                                <td>${booking.flight.source}</td>
                                <td>${booking.flight.destination}</td>
                                <td>${booking.flight.date}</td>
                                <td>${booking.seats}</td>
                                <td>${booking.hotel.id}</td>
                                <td>Rp ${booking.flight.price + booking.hotel.price}</td>
                                <td>
                                    <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
                                    <button onclick="showRescheduleForm(${booking.id})">Reschedule Booking</button>
                                </td>
                            </tr>`;
        });
        bookingHtml += '</table>';
    } else {
        bookingHtml += '<p>No bookings found.</p>';
    }
    document.getElementById('booking-list').innerHTML = bookingHtml;
}

function cancelBooking(id) {
    const confirmed = confirm(`Are you sure you want to cancel booking ID ${id}?`);
    if (confirmed) {
        if (cancelBookingById(id)) {
            alert('Booking cancelled successfully!');
            renderBookings();
        } else {
            alert('Booking ID not found.');
        }
    }
}

function showRescheduleForm(id) {
    const booking = bookings.find(b => b.id === id);
    const newDate = prompt(`Enter the new date for rescheduling booking ID ${id}:`, booking.flight.date);
    if (newDate) {
        if (rescheduleBookingById(id, newDate)) {
            alert('Booking rescheduled successfully!');
            renderBookings();
        } else {
            alert('Booking ID not found.');
        }
    }
}

function selectFlight(flightId) {
    selectedFlight = flights.find(f => f.id == flightId);
    checkAndEnableBookingButton();
}

function selectHotel(hotelId) {
    selectedHotel = hotels.find(h => h.id === hotelId);
    checkAndEnableBookingButton();
}

function checkAndEnableBookingButton() {
    if (selectedFlight && selectedHotel) {
        let bookingButton = document.getElementById('book-now-button');
        if (!bookingButton) {
            bookingButton = document.createElement('button');
            bookingButton.id = 'book-now-button';
            bookingButton.innerText = 'Book Now';
            bookingButton.addEventListener('click', bookNow);
            document.getElementById('booking-actions').appendChild(bookingButton);
        }
    }
}

function bookNow() {
    if (selectedFlight && selectedHotel) {
        const seats = document.getElementById(`seats-${selectedFlight.id}`).value;
        const booking = {
            id: bookings.length + 1,
            flight: selectedFlight,
            hotel: selectedHotel,
            seats: seats,
            rescheduled: false
        };
        addBooking(booking);
        alert('Booking successful!');
        renderBookings();
    }
}

function saveBookingsToLocalStorage() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function addBooking(booking) {
    bookings.push(booking);
    saveBookingsToLocalStorage();
    return bookings;
}

function cancelBookingById(id) {
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings.splice(index, 1);
        saveBookingsToLocalStorage();
        return true;
    }
    return false;
}

function rescheduleBookingById(id, newDate) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.flight.date = newDate;
        booking.rescheduled = true;
        saveBookingsToLocalStorage();
        return true;
    }
    return false;
}

function loadBookingsFromLocalStorage() {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
        bookings.push(...JSON.parse(storedBookings));
    }
}

// Initial load of bookings
loadBookingsFromLocalStorage();
renderBookings();
