import { addLoader,removeLoader } from "./src/components/loader";
// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}


let selectedTickets = [];
// HTML templates
function getHomePageTemplate() {
  return `
    <div id="content">
      <img src="./src/assets/First_logo.png" alt="summer">
     <div class="title-container">
        <h1 class="event-title">Events</h1>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content" class="white-background">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
      <div class="sort-buttons">
        <button class="btn btn-sort" id="sortAscendingBtn">Sort Ascending By Price</button>
        <button class="btn btn-sort" id="sortDescendingBtn">Sort Descending By Price</button>
      </div>
      <div class="orders"></div>
    </div>
  `;
}
function setupSortButtons() {
  const sortAscendingBtn = document.getElementById('sortAscendingBtn');
  sortAscendingBtn.addEventListener('click', () => {
    sortOrders(true);
  });

  const sortDescendingBtn = document.getElementById('sortDescendingBtn');
  sortDescendingBtn.addEventListener('click', () => {
    sortOrders(false);
  });
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
    setupSortButtons(); // Adăugați această linie pentru a re-atașa evenimentele de sortare
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);

  setupSortButtons(); // Adăugați această linie pentru a atașa evenimentele de sortare inițiale

  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const eventId = button.getAttribute('data-event-id');
      const ticketCategory = button.getAttribute('data-ticket-category');
      const ticketCount = parseInt(button.getAttribute('data-ticket-count'));

      const selectedTicket = {
        eventId,
        ticketCategory,
        ticketCount
      };

      selectedTickets.push(selectedTicket);
      console.log('Selected Tickets:', selectedTickets);
    });
  });
}








async function renderOrders() {
  const ordersData = await fetchOrders();
  const ordersContainer = document.querySelector('.orders');
  
  // Golește containerul de comenzilor existente
  ordersContainer.innerHTML = '';

  // Iterează prin comenzile sortate și adaugă-le la container
  for (const orderData of ordersData) {
    const orderCard = await renderOrderCard(orderData);
    ordersContainer.appendChild(orderCard);
  }
}



async function sortOrders(ascending) {
  const ordersData = await fetchOrders();
  ordersData.sort((a, b) => {
    return ascending ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
  });

  const ordersContainer = document.querySelector('.orders');
  ordersContainer.innerHTML = ''; // Golește containerul de comenzilor

  for (const orderData of ordersData) {
    const orderCard = await renderOrderCard(orderData);
    ordersContainer.appendChild(orderCard);
  }
}






async function fetchTicketEvents() {
  const response = await fetch('https://localhost:7108/api/Event/GetAll');
  const data = await response.json();
  return data;
}
async function fetchOrders() {
  const response = await fetch('https://localhost:7108/api/Order/GetAll');
  const orders = await response.json();

  orders.forEach(order => {
    order.totalPrice = parseFloat(order.totalPrice);
  });

  return orders;

}

async function placeOrder(orderData) {

  const url = 'http://localhost:8080/createOrder'; // Replace with your actual API endpoint
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Set the appropriate content type
      // Add any additional headers if needed
    },
    body: JSON.stringify(orderData), // Convert your data to JSON
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text(); // Get the error message from the response body
      throw new Error(`Network response was not ok: ${response.status} - ${errorMessage}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {

    console.error('Fetch error:', error);
  }
}
const orderData = {
  "ticketCategoryId": 1,
  "eventId": 1,
  "numberOfTickets": 2
};
placeOrder(orderData).then(data => {
  console.log('Order placed:', data);
  // Process the response data as needed
});



 function renderHomePage(eventsData) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  const eventsContainer = document.querySelector('.events');

  console.log('function', fetchTicketEvents());
   fetchTicketEvents().then((data) =>{
    console.log('data', data);
  })

  
  const eventImages = [
    'src/assets/untold_logo.png',
    'src/assets/EC_logo.png',
    'src/assets/fotbal_logo.png',
    'src/assets/vin_logo.png',
  ];

 

  eventsData.forEach(eventData => {
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card');
    console.log('bbbbb', eventData);
    //const eventImage = eventImages[index];

    const ticketCategories = eventData.ticketCategory;
    const isSingleCategory = ticketCategories.length === 1;

 

    const contentMarkup = `
    <header>
    <h2 class="event-title text-2xl font-bold">${eventData.eventName}</h2>
  </header>
  <div class="content">
    <div class="info-column">
      <p class="description text-gray-700">${eventData.eventDescription}</p>
      <p class="description text-gray-700">${eventData.eventType}</p>
      <button class="buy-button bg-blue-500 text-white px-4 py-2 rounded mt-4" 
    data-event-id="${eventData.eventId}" 
    data-ticket-category="${isSingleCategory ? ticketCategories[0].description : ''}"
    data-ticket-count="0">Buy Tickets</button>
      ${
        isSingleCategory
          ? `<p class="ticket-category">${ticketCategories[0].description}</p>`
          : `<select class='ticket-category-${eventData.eventId} mb-2'>
               ${ticketCategories
                 .map(category => `<option value="${category.id}">${category.description}</option>`)
                 .join('')}
             </select>`
      }
    </div>
    <div class="ticket-controls mt-4">
      <button class="decrement-button">-</button>
      <button class="increment-button">+</button>
      <input type="text" class="ticket-count" value="0" readonly>
    </div>
  </div>
    `;

    eventCard.innerHTML = contentMarkup;
    eventsContainer.appendChild(eventCard);

  const buyButton = eventCard.querySelector('.buy-button');
  const ticketCountInput = eventCard.querySelector('.ticket-count');

  buyButton.addEventListener('click', () => {
    const eventId = buyButton.getAttribute('data-event-id');
    const ticketCategory = buyButton.getAttribute('data-ticket-category');

    // Obțineți numărul de bilete selectat din câmpul input
    const ticketCount = parseInt(ticketCountInput.value);

    console.log("Event ID:", eventId);
    console.log("Ticket Category:", ticketCategory);
    console.log("Ticket Count:", ticketCount);

    // Actualizați atributul data-ticket-count cu numărul de bilete selectat
    buyButton.setAttribute('data-ticket-count', ticketCount);

    // Actualizați valoarea afișată în câmpul input pentru numărul de bilete
    ticketCountInput.value = ticketCount.toString();
  });
  });



  eventsContainer.querySelectorAll('.event-card').forEach((eventCard, index) => {
    const decrementButton = eventCard.querySelector('.decrement-button');
    const incrementButton = eventCard.querySelector('.increment-button');
    const ticketCountInput = eventCard.querySelector('.ticket-count');
    
    let ticketCount = 0;
  
    decrementButton.addEventListener('click', () => {
      if (ticketCount > 0) {
        ticketCount--;
        ticketCountInput.value = ticketCount;
      }
    });


  
    incrementButton.addEventListener('click', () => {
      // Puteți adăuga aici logica pentru a verifica dacă mai sunt bilete disponibile
      // și pentru a gestiona limita de bilete
      ticketCount++;
      ticketCountInput.value = ticketCount;
    });

    const input = document.createElement('input');
    input.type='number';
    input.value='0';

    input.addEventListener('blur', ()=>{
      if(!input.value){
        input.value=0;
      }
    })

  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////



async function renderOrderCard(orderData) {
  const orderCard = document.createElement('tr');
  orderCard.classList.add('order-card');

  const contentMarkup = `
  <td class="order-details">${orderData.orderId}</td>
  <td class="order-details">${orderData.orderedAt}</td>
  <td class="order-details">${orderData.ticketCategory}</td>
  <td class="order-details">${orderData.numberOfTickets}</td>
  <td class="order-details">${orderData.totalPrice}</td>
  <td class="order-actions">
    <button class="btn btn-modify">Modify</button>
    <button class="btn btn-delete">Delete</button>
  </td>
`;

  orderCard.innerHTML = contentMarkup;
  return orderCard;
}



async function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();

  const ordersData = await fetchOrders();

  const ordersTable = document.createElement('table');
  ordersTable.classList.add('orders-table');

  const tableHeaderMarkup = `
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Date</th>
        <th>Ticket Category</th>
        <th>Number of Tickets</th>
        <th>Total Price</th>
        <th>Actions</th>
      </tr>
    </thead>
  `;
  ordersTable.innerHTML = tableHeaderMarkup;

  const tableBody = document.createElement('tbody');
  for (const orderData of ordersData) {
    const orderCard = await renderOrderCard(orderData);
    tableBody.appendChild(orderCard);
  }
  
  // Adăugați rândurile pentru biletele selectate pe pagina Home
  for (const selectedTicket of selectedTickets) {
    const selectedTicketRow = document.createElement('tr');
    selectedTicketRow.innerHTML = `
      <th>${eventData.eventId}</th>
      <th>-</th>
      <th>${eventData.ticketCategory}</th>
      <th>${eventData.ticketCount}</th>
      <th>-</th>
      <th>-</th>
    `;
    tableBody.appendChild(selectedTicketRow);
  }

  ordersTable.appendChild(tableBody);
  mainContentDiv.appendChild(ordersTable);
  
  // Atașați evenimentele de sortare după ce elementele sunt adăugate în DOM
  setupSortButtons();
}





// Render content based on URL
async function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    const eventsData = await fetchTicketEvents();
    renderHomePage(eventsData);
  } else if (url === '/orders') {
    renderOrdersPage();
  }
}


// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
setupSortButtons();