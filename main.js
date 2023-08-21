import { addLoader, removeLoader } from './src/components/loader';
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}

let selectedTickets = [];
function getHomePageTemplate() {
  return `
    <div id="content">
      <img src="./src/assets/First_logo.png" alt="summer">
     <div class="title-container">
        <h1 class="event-title">Events</h1>
        <div class="filter flex flex-col">
            <input type="text" id="filter-name" placeholder="Filter by name" />
            <button id="filter-button" class="filter-btn px-4 py-2">Filter</button>
         </div>
      <div class="events flex items-center justify-center flex-wrap">
     </div>
    </div>
  `;
}

function liveSearch() {
  console.log('key up');
  const filterInput = document.querySelector('#filter-name');

  if (filterInput) {
    const searchValue = filterInput.value;

    if (searchValue != undefined) {
      const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      addEvents(filteredEvents);
    }
  }
}

export const addEvents = (events) => {
  const eventsDiv = document.querySelector('.events');
  eventsDiv.innerHTML = 'No events available';

  if (events.length) {
    eventsDiv.innerHTML = '';
    events.forEach((event) => {
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');

      const eventTitle = document.createElement('h2');
      eventTitle.textContent = event.eventName;
      eventElement.appendChild(eventTitle);

      eventsDiv.appendChild(eventElement);
    });
  }
};

function setupFilterEvents() {
  const nameFilterInput = document.querySelector('#filter-name');
  if (nameFilterInput) {
    const filterInterval = 500;
    nameFilterInput.addEventListener('keyup', () => {
      setTimeout(liveSearch, filterInterval);
    });
  }
}

function getOrdersPageTemplate() {
  return `
    <div id="content" class="white-background">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
      <div class="sort-buttons">
        <button class="btn btn-sort" id="sortAscendingBtn">Sortare-Pret-crescatoare</button>
        <button class="btn btn-sort" id="sortDescendingBtn">Sortare-Pret-descrescatoare</button>
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
    setupSortButtons(); 
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);

  setupSortButtons();
}

async function renderOrders() {
  const ordersData = await fetchOrders();
  const ordersContainer = document.querySelector('.orders');

  ordersContainer.innerHTML = '';

  for (const orderData of ordersData) {
    const orderCard = await renderOrderCard(orderData);
    ordersContainer.appendChild(orderCard);
  }
}

async function sortOrders(ascending) {
  const ordersData = await fetchOrders();
  ordersData.sort((a, b) => {
    return ascending
      ? a.totalPrice - b.totalPrice
      : b.totalPrice - a.totalPrice;
  });

  const ordersContainer = document.querySelector('.orders');
  ordersContainer.innerHTML = ''; 

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

  orders.forEach((order) => {
    order.totalPrice = parseFloat(order.totalPrice);
  });

  return orders;
}

async function placeOrder(orderData, eventsData) {
  console.log(orderData);
  orderData.CustomerId = 1;
  orderData.OrderedAt = new Date();
  const totalPrice = calculateTotalPrice(orderData, eventsData); 
  orderData.totalPrice = totalPrice;
  const url = 'https://localhost:7108/api/Order/AddOrder';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
   
    },
    body: JSON.stringify(orderData), 
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text(); 
      throw new Error(
        `Network response was not ok: ${response.status} - ${errorMessage}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function calculateTotalPrice(orderData, eventsData) {

  const event = eventsData.find((event) => event.eventId === orderData.eventId);

  if (!event) {
    return 0; 
  }

  const ticketCategory = event.ticketCategory.find(
    (category) => category.ticketCategoryID === orderData.ticketCategoryId
  );

  if (!ticketCategory) {
    return 0; 
  }

  const totalPrice = ticketCategory.price * orderData.numberOfTickets;

  return totalPrice;
}

const orderData = {
  ticketCategoryId: 1,
  eventId: 1,
  numberOfTickets: 2,
};

function renderHomePage(eventsData) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  const eventsContainer = document.querySelector('.events');
  console.log('function', fetchTicketEvents());
  fetchTicketEvents().then((data) => {
    console.log('data', data);
  });

  const eventImages = [
    'src/assets/untold_logo.png',
    'src/assets/EC_logo.png',
    'src/assets/fotbal_logo.png',
    'src/assets/vin_logo.png',
  ];

  eventsData.forEach((eventData) => {
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card');
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
              data-ticket-category="${
                isSingleCategory ? ticketCategories[0].description : ''
              }"
              data-ticket-count="0"
      >

        Buy Tickets
      </button>

      ${
        isSingleCategory
          ? `<p class='ticket-category'>${ticketCategories[0].description}</p>`
          : `<select class='ticket-category-${eventData.eventId} mb-2'>
               ${ticketCategories
                 .map(
                   (category) =>
                     `<option value="${category.ticketCategoryID}">${category.description}</option>`
                 )
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
    const ticketCategory = eventCard.querySelector(
      `.ticket-category-${eventData.eventId}`
    );

    let selectedCategory = parseInt(ticketCategories[0].ticketCategoryID);

    if (!isSingleCategory) {
      ticketCategory.addEventListener('change', (event) => {
        selectedCategory = parseInt(
          event.target.options[event.target.selectedIndex].value
        );
      });
    }

    buyButton.addEventListener('click', () => {
      const eventId = parseInt(buyButton.getAttribute('data-event-id'));
      const ticketCount = parseInt(ticketCountInput.value);

      const selectedTicket = {
        eventId: eventId,
        ticketCategoryId: selectedCategory,
        numberOfTickets: ticketCount,
      };

      selectedTickets.push(selectedTicket);

      placeOrder(selectedTicket, eventsData).then((data) => {
        // console.log('Order placed:', data);
  
        renderOrdersPage();
      });

      //console.log('Selected Tickets:', selectedTickets);
    });
  });

  eventsContainer
    .querySelectorAll('.event-card')
    .forEach((eventCard, index) => {
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
        ticketCount++;
        ticketCountInput.value = ticketCount;
      });

      const input = document.createElement('input');
      input.type = 'number';
      input.value = '0';

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.value = 0;
        }
      });
    });
}

async function deleteEventById(orderID) {
  try {
    const response = await fetch(
      `https://localhost:7108/api/Order/Delete?id=${orderID}`,
      {
        method: 'DELETE',
      }
    );

    if (response.ok) {
      return { success: true, message: 'Order deleted successfully.' };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the order.',
    };
  }
}

async function renderOrderCard(orderData) {
  const orderCard = document.createElement('tr');
  orderCard.classList.add('order-card');

  const contentMarkup = `
  <td class="order-details">${orderData.orderID}</td>
  <td class="order-details">${orderData.orderedAt}</td>
  <td class="order-details">${orderData.ticketCategory}</td>
  <td class="order-details">
      <span class="ticket-count">${orderData.numberOfTickets}</span>
      <input type="number" class="input-ticket-count" value="${orderData.numberOfTickets}" style="display: none;">
    </td>
  <td class="order-details">${orderData.totalPrice}</td>
  <td class="order-actions">
    <button class="btn btn-modify">Modify</button>
    <button class="btn btn-delete">Delete</button>
    <button class="btn btn-save" style="background-color: green;" hidden>Save</button>
    <button class="btn btn-cancel" style="background-color: red;" hidden>Cancel</button>
  </td>
`;

  orderCard.innerHTML = contentMarkup;
  const modifyButton = orderCard.querySelector('.btn-modify');
  const deleteButton = orderCard.querySelector('.btn-delete');
  const saveButton = orderCard.querySelector('.btn-save');
  const cancelButton = orderCard.querySelector('.btn-cancel');
  const ticketCountDisplay = orderCard.querySelector('.ticket-count');
  const inputTicketCount = orderCard.querySelector('.input-ticket-count');

  modifyButton.addEventListener('click', () => {
    modifyButton.style.display = 'none';
    deleteButton.style.display = 'none';
    saveButton.style.display = 'inline';
    cancelButton.style.display = 'inline';

    ticketCountDisplay.style.display = 'none';
    inputTicketCount.style.display = 'inline';
    ticketCategory.style.display = 'none';
    ticketCategorySelect.style.display = 'inline';
  });

  saveButton.addEventListener('click', () => {
    const newTicketCount = inputTicketCount.value;
    ticketCountDisplay.textContent = newTicketCount;

    modifyButton.style.display = 'inline';
    deleteButton.style.display = 'inline';
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';

    ticketCountDisplay.style.display = 'inline';
    inputTicketCount.style.display = 'none';
  });

  cancelButton.addEventListener('click', () => {
    modifyButton.style.display = 'inline';
    deleteButton.style.display = 'inline';
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';

    ticketCountDisplay.style.display = 'inline';
    inputTicketCount.style.display = 'none';
    ticketCategory.style.display = 'inline';
    ticketCategorySelect.style.display = 'none';
  });

  deleteButton.addEventListener('click', async () => {
    const result = await deleteEventById(orderData.orderID);
    if (result.success) {
      renderOrdersPage();
    } else {
      console.error('Error deleting order:', result.message);
    }
  });

  return orderCard;
}

async function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();

  const ordersData = await fetchOrders();
  const eventsData = await fetchTicketEvents();

  const ordersTable = document.createElement('table');
  ordersTable.classList.add('orders-table');

  const tableHeaderMarkup = `
    <thead>
      <tr>
        <th>${orderData.orderID}</th>
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
  console.log('OrdersData', orderData);
  for (const orderData of ordersData) {
    const orderCard = await renderOrderCard(orderData);
    tableBody.appendChild(orderCard);
  }


  for (const selectedTicket of selectedTickets) {
    const selectedTicketRow = document.createElement('tr');
    const event = eventsData.find(
      (event) => event.eventId === selectedTicket.eventId
    );
    const ticketCategory = event.ticketCategory.find(
      (category) =>
        category.ticketCategoryID === selectedTicket.ticketCategoryId
    );
    selectedTicketRow.innerHTML = `
    <td>${selectedTicket.eventId}</td>
    <td>-</td>
    <td>${ticketCategory.description}</td>
    <td>${selectedTicket.numberOfTickets}</td>
    <td>-</td>
    <td>-</td>
    `;
    tableBody.appendChild(selectedTicketRow);
  }

  ordersTable.appendChild(tableBody);
  mainContentDiv.appendChild(ordersTable);
  setupSortButtons();
}

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

document.addEventListener('DOMContentLoaded', () => {
  setupNavigationEvents();
  setupMobileMenuEvent();
  setupPopstateEvent();
  setupInitialPage();
  setupSortButtons();
});
