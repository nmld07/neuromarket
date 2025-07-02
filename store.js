document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');
    const createShopForm = document.getElementById('createShopForm');
    const shopMessage = document.getElementById('shopMessage');
    const shopsContainer = document.getElementById('shops-container');
    const noShopsMessage = document.getElementById('noShopsMessage');
    const currentViewHeading = document.getElementById('currentViewHeading');
    const createShopHeading = document.getElementById('createShopHeading');
    const myShopsLink = document.getElementById('myShopsLink');
    const mainPageLink = document.getElementById('mainPageLink'); // Ссылка на "Главная"
    const neuralNetLink = document.getElementById('neuralNetLink'); // Пока заглушка

    // Элементы для отображения деталей конкретной витрины (пока скрыты)
    const shopDetailsSection = document.getElementById('shopDetails');
    const shopDetailsName = document.getElementById('shopDetailsName');
    const shopDetailsDescription = document.getElementById('shopDetailsDescription');
    const shopDetailsLogo = document.getElementById('shopDetailsLogo');
    const shopProductsContainer = document.getElementById('shopProductsContainer');
    const backToAllShopsButton = document.getElementById('backToAllShops');


    // Переменные для хранения данных пользователя
    let currentUserId = null;
    let currentUsername = null;

    // Функция для отображения сообщений
    const showMessage = (element, message, type) => {
        element.textContent = message;
        element.className = `message ${type}`;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    };

    // Проверка статуса входа и отображение элементов
    const checkLoginStatus = () => {
        currentUsername = localStorage.getItem('username');
        currentUserId = localStorage.getItem('userId');

        if (currentUsername && currentUserId) {
            welcomeMessage.textContent = `Добро пожаловать, ${currentUsername}!`;
            logoutButton.style.display = 'inline-block';
            createShopForm.style.display = 'block'; // Показываем форму создания витрины
            createShopHeading.style.display = 'block'; // Показываем заголовок формы
            myShopsLink.style.display = 'inline-block'; // Показываем ссылку "Мои витрины"
        } else {
            welcomeMessage.textContent = 'Вы не вошли в систему.';
            logoutButton.style.display = 'none';
            createShopForm.style.display = 'none';
            createShopHeading.style.display = 'none';
            myShopsLink.style.display = 'none';

            // Если пользователь на store.html, но не авторизован, перенаправляем на index.html
            if (window.location.pathname === '/store.html') {
                window.location.href = '/'; // Перенаправляем на страницу входа/регистрации
            }
        }
    };

    // Выход из системы
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        checkLoginStatus();
        alert('Вы успешно вышли из системы.');
        window.location.href = '/'; // Перенаправляем на страницу входа
    });

    // Функция для отображения СПИСКА ВИТРИН
    const displayShops = async (isMyShops = false) => {
        shopsContainer.innerHTML = ''; // Очищаем контейнер
        noShopsMessage.textContent = 'Загрузка витрин...';
        noShopsMessage.style.display = 'block';
        shopsContainer.style.display = 'grid'; // Убедимся, что сетка витрин видна
        shopDetailsSection.style.display = 'none'; // Скрываем детали конкретной витрины
        let url = '/api/shops'; // По умолчанию - все витрины
        if (isMyShops) {
            if (!currentUserId) {
                noShopsMessage.textContent = 'Для просмотра ваших витрин необходимо войти в систему.';
                return;
            }
            url = `/api/shops/user/${currentUserId}`; // Витрины конкретного пользователя
            currentViewHeading.textContent = `Мои Витрины (${currentUsername})`;
        } else {
            currentViewHeading.textContent = 'Все Витрины на NeuroMarket';
        }

        try {
            const response = await fetch(url);
            const shops = await response.json();

            if (shops.length === 0) {
                noShopsMessage.textContent = isMyShops ? 'У вас пока нет витрин.' : 'На платформе пока нет витрин.';
            } else {
                noShopsMessage.style.display = 'none'; // Скрываем сообщение
                shops.forEach(shop => {
                    const shopCard = document.createElement('div');
                    shopCard.classList.add('shop-card');
                    shopCard.dataset.shopId = shop.id; // Сохраняем ID витрины

                    const logoUrl = shop.logo_url || 'https://via.placeholder.com/200x150?text=Логотип+Витрины';

                    shopCard.innerHTML = `
                        <img src="${logoUrl}" alt="Логотип ${shop.name}">
                        <div class="shop-card-content">
                            <h4>${shop.name}</h4>
                            <p>${shop.description || 'Без описания.'}</p>
                            <p class="owner-info">Владелец: ${shop.owner_username || 'Неизвестно'}</p>
                        </div>
                    `;
                    shopsContainer.appendChild(shopCard);

                    // Добавляем обработчик клика для перехода на детальную страницу витрины
                    shopCard.addEventListener('click', () => displayShopDetails(shop.id));
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке витрин:', error);
            noShopsMessage.textContent = 'Не удалось загрузить витрины. Попробуйте позже.';
            noShopsMessage.className = 'message error';
        }
    };

    // Функция для отображения ДЕТАЛЕЙ КОНКРЕТНОЙ ВИТРИНЫ и её товаров
    const displayShopDetails = async (shopId) => {
        shopsContainer.style.display = 'none'; // Скрываем общий список витрин
        createShopForm.style.display = 'none'; // Скрываем форму создания витрины
        createShopHeading.style.display = 'none';
        currentViewHeading.textContent = 'Загрузка витрины...';
        shopDetailsSection.style.display = 'block'; // Показываем секцию деталей витрины
        shopProductsContainer.innerHTML = '<p style="text-align: center; color: #777;">Загрузка товаров витрины...</p>'; // Сообщение о загрузке товаров

        try {
            // Получаем данные о витрине
            const shopResponse = await fetch(`/api/shops/${shopId}`);
            const shop = await shopResponse.json();

            if (shopResponse.ok) {
                shopDetailsName.textContent = shop.name;
                shopDetailsDescription.textContent = shop.description || 'Описание отсутствует.';
                shopDetailsLogo.src = shop.logo_url || 'https://via.placeholder.com/200x150?text=Логотип+Витрины';
                currentViewHeading.textContent = `Витрина: ${shop.name}`;
                backToAllShopsButton.style.display = 'inline-block'; // Показываем кнопку "Назад"

                // Теперь загружаем товары для этой витрины
                const productsResponse = await fetch(`/api/products/shop/${shopId}`);
                const products = await productsResponse.json();

                shopProductsContainer.innerHTML = ''; // Очищаем контейнер товаров
                if (products.length === 0) {
                    shopProductsContainer.innerHTML = '<p style="text-align: center; color: #777;">В этой витрине пока нет товаров.</p>';
                } else {
                    products.forEach(product => {
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');
                        const imageUrl = product.image_url || 'https://via.placeholder.com/300x200?text=Нет+изображения';
                        productCard.innerHTML = `
                            <img src="${imageUrl}" alt="${product.name}">
                            <div class="product-card-content">
                                <h4>${product.name}</h4>
                                <p>${product.description}</p>
                            </div>
                        `;
                        shopProductsContainer.appendChild(productCard);
                    });
                }
            } else {
                showMessage(shopMessage, shop.message || 'Ошибка при загрузке деталей витрины.', 'error');
                // Вернуться к общему списку, если витрина не найдена
                displayShops(false);
            }
        } catch (error) {
            console.error('Ошибка при загрузке деталей витрины или ее товаров:', error);
            showMessage(shopMessage, 'Произошла ошибка сети при загрузке витрины.', 'error');
            displayShops(false);
        }
    };


    // Обработчик формы создания витрины
    createShopForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!currentUserId) {
            showMessage(shopMessage, 'Для создания витрины необходимо войти в систему.', 'error');
            return;
        }

        const name = document.getElementById('shopName').value;
        const description = document.getElementById('shopDescription').value;
        const logo_url = document.getElementById('shopLogoUrl').value;

        try {
            const response = await fetch('/api/shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUserId, name, description, logo_url })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(shopMessage, data.message, 'success');
                createShopForm.reset(); // Очистить форму
                displayShops(true); // Обновить список МОИХ витрин
            } else {
                showMessage(shopMessage, data.message || 'Ошибка при создании витрины.', 'error');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса на создание витрины:', error);
            showMessage(shopMessage, 'Произошла ошибка сети. Попробуйте позже.', 'error');
        }
    });

    // Обработчик для ссылки "Мои витрины"
    myShopsLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayShops(true); // Загружаем только витрины текущего пользователя
        // Скрываем форму создания, если она была открыта (пользователь может передумать)
        createShopForm.style.display = 'none';
        createShopHeading.style.display = 'none';
    });

    // Обработчик для ссылки "Главная" (показывает все витрины)
    mainPageLink.addEventListener('click', (event) => {
        event.preventDefault();
        displayShops(false); // Загружаем все витрины
        // Возвращаем видимость формы создания витрины, если пользователь вошел
        checkLoginStatus();
    });

    // Обработчик для кнопки "Вернуться ко всем витринам"
    backToAllShopsButton.addEventListener('click', () => {
        displayShops(false); // Показываем все витрины
    });


    // Инициализация
    checkLoginStatus();
    displayShops(false); // Отображаем все витрины при загрузке страницы по умолчанию
});