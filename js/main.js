// ИНИЦИАЛИЗАЦИЯ
        document.addEventListener('DOMContentLoaded', function() {
            initializeAnalytics();
            initializeOrderButtons();
            initializeModals();
            initializeTimer();
        });

        // КНОПКИ ЗАКАЗА
        function initializeOrderButtons() {
            const orderButtons = document.querySelectorAll('.order-btn');
            orderButtons.forEach(button => {
                button.addEventListener('click', function() {
                    trackEvent('order_cta_click', { source: this.dataset.analytics || 'unknown' });
                    showOrderModal();
                });
            });
        }

        // МОДАЛЬНЫЕ ОКНА
        function initializeModals() {
            const closeButtons = document.querySelectorAll('.modal-close');
            closeButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const modalId = this.getAttribute('data-modal') || this.closest('.modal').id;
                    closeModal(modalId);
                });
            });

            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        e.preventDefault();
                        closeModal(modal.id);
                    }
                });
                
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('click', function(e) {
                        e.stopPropagation();
                    });
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal.active');
                    if (activeModal) {
                        closeModal(activeModal.id);
                    }
                }
            });

            const orderForm = document.getElementById('order-form');
            if (orderForm) {
                orderForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    handleOrderSubmit();
                });
            }
        }

        (function matchMainImageBackground(){
            const img = document.getElementById('hero-image');
            const visual = document.getElementById('hero-visual');
            if (!img || !visual) return;
            if (img.complete) compute(); else img.onload = compute;

            function compute(){
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const w = canvas.width = 40;
                    const h = canvas.height = 40;
                    ctx.drawImage(img, 0, 0, w, h);
                    const data = ctx.getImageData(0, 0, w, h).data;
                    let r=0,g=0,b=0,count=0;
                    for (let i=0;i<data.length;i+=4){
                        const R=data[i], G=data[i+1], B=data[i+2], A=data[i+3];
                        if (A < 128) continue;
                        r+=R; g+=G; b+=B; count++;
                    }
                    if (!count) return;
                    r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
                    const base = `rgb(${r}, ${g}, ${b})`;
                    const light = `rgba(${Math.min(r+30,255)}, ${Math.min(g+30,255)}, ${Math.min(b+30,255)}, 0.6)`;
                    const lighter = `rgba(${Math.min(r+60,255)}, ${Math.min(g+60,255)}, ${Math.min(b+60,255)}, 0.6)`;
                    visual.style.setProperty('--c1', lighter);
                    visual.style.setProperty('--c2', light);
                    visual.style.setProperty('--c3', base);
                    visual.style.setProperty('--c4', lighter);
                } catch(e) {
                    console.warn('BG auto-match failed', e);
                }
            }
        })();

        // АНАЛИТИКА
        function initializeAnalytics() {
            window.dataLayer = window.dataLayer || [];
        }
        function trackEvent(eventName, params = {}) {
            try {
                window.dataLayer.push({ event: eventName, ...params });
            } catch (_) {}
            console.log('Analytics:', eventName, params);
        }

        let lastFocusedElement = null;
        function trapFocus(container) {
            const selectors = [
                'a[href]','area[href]','input:not([disabled])','select:not([disabled])','textarea:not([disabled])',
                'button:not([disabled])','iframe','[tabindex]:not([tabindex="-1"])','[contenteditable="true"]'
            ];
            const focusable = Array.from(container.querySelectorAll(selectors.join(','))).filter(el => el.offsetParent !== null);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            first.focus();
            container.addEventListener('keydown', function(e) {
                if (e.key !== 'Tab') return;
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            });
        }

        // ПОКАЗАТЬ МОДАЛКУ ЗАКАЗА
        function showOrderModal() {
            const modal = document.getElementById('order-modal');
            if (modal) {
                lastFocusedElement = document.activeElement;
                modal.style.display = 'flex';
                document.body.classList.add('modal-open');
                
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);
                
                const firstInput = modal.querySelector('input[name="name"]');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 300);
                }
                trapFocus(modal);
                trackEvent('modal_open', { modalId: 'order-modal' });
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                        lastFocusedElement.focus();
                    }
                }, 300);
                trackEvent('modal_close', { modalId });
            }
        }

        // ОБРАБОТКА ОТПРАВКИ ЗАКАЗА
        function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.8)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = 9999;
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3500);
}

async function handleOrderSubmit() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.name || !data.phone) {
        showToast(t('orderValidation'));
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = t('orderSending');
    submitBtn.disabled = true;

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            closeModal('order-modal');
            showToast(tfmt('orderSuccess', { name: data.name, phone: data.phone }));
            form.reset();
            trackEvent && trackEvent('order_submit', { source: 'order_modal' });
        } else {
            showToast(t('orderError'));
        }
    } catch (error) {
        showToast(t('orderNetworkError'));
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

        // ТАЙМЕР ОБРАТНОГО ОТСЧЕТА
        function initializeTimer() {
            const CAMPAIGN_DEADLINE_ISO = null;
            const DEADLINE_STORAGE_KEY = 'saleDeadline';
            let deadline = null;
            if (CAMPAIGN_DEADLINE_ISO) {
                deadline = new Date(CAMPAIGN_DEADLINE_ISO).getTime();
            } else {
                const saved = localStorage.getItem(DEADLINE_STORAGE_KEY);
                const savedNum = saved ? parseInt(saved, 10) : NaN;
                if (saved && !Number.isNaN(savedNum) && savedNum > Date.now()) {
                    deadline = savedNum;
                } else {
                    deadline = Date.now() + 24 * 60 * 60 * 1000;
                    localStorage.setItem(DEADLINE_STORAGE_KEY, String(deadline));
                }
            }

            let expiredHandled = false;
            function setExpiredState() {
                if (expiredHandled) return;
                expiredHandled = true;
                document.querySelectorAll('.time-left-label').forEach(n => n.textContent = t('expiredText'));
                document.querySelectorAll('#timer, #countdown').forEach(el => el.textContent = '00:00:00');
                document.querySelectorAll('.order-btn').forEach(btn => {
                    btn.setAttribute('disabled', 'true');
                    btn.classList.add('opacity-60','cursor-not-allowed');
                    if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
                    btn.innerText = t('expiredButton');
                });
                trackEvent('campaign_expired');
            }

            function updateTimer() {
                const now = Date.now();
                const timeLeft = Math.max(0, deadline - now);
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                const timerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                document.querySelectorAll('#timer, #countdown').forEach(element => { if (element) element.textContent = timerText; });
                if (timeLeft <= 0) setExpiredState();
            }

            document.querySelectorAll('div').forEach(el => {
                if (el.textContent && (
                    el.textContent.includes('До конца акции') ||
                    el.textContent.includes('Time left until the end of the offer') ||
                    el.textContent.includes('Timp rămas până la finalul ofertei')
                )) el.classList.add('time-left-label');
            });

            updateTimer();
            setInterval(updateTimer, 1000);
        }

        console.log('✅ NEOSHOP CoolBreeze загружен успешно!');
        console.log('🚀 Новая улучшенная версия с полным функционалом!');

        // СИСТЕМА ПЕРЕВОДОВ RU/EN/RO
        const i18n = {
            ru: {
                docTitle: 'NEOSHOP CoolBreeze - Революционный вентилятор 3-в-1 ❄️',
                // Hero
                heroBadge: '🔥 СУПЕР АКЦИЯ -29% - ТОЛЬКО СЕГОДНЯ!',
                heroTitle: 'Забудьте о духоте! <span class="gradient-text">Ледяная прохлада</span> + ароматы тропиков в 1 устройстве',
                heroSubtitle: 'Революционный вентилятор CoolBreeze 3-в-1 с охлаждением льдом, ароматизацией и LED-подсветкой. Создайте идеальный микроклимат в любом помещении за считанные секунды!',
                heroCta: '🛒 Заказать со скидкой 29%',
                heroSeeHow: '▶️ Посмотреть как работает',
                timeLeft: '⏰ До конца акции осталось:',

                // Landing products header
                lpTitle: 'Товары <span class="gradient-text">из нашей линейки</span>',
                lpSubtitle: 'Подобрали для вас популярные и полезные товары по отличным ценам',

                // Main product section
                mainImgBadgeDiscount: '-29% СКИДКА',
                mainImgBadgeStock: '✅ В НАЛИЧИИ',
                mainImgBadgeHit: '🔥 ХИТ ПРОДАЖ',
                mainProductTitle: 'CoolBreeze Arctic Pro <span class="gradient-text">3-в-1</span>',
                mainProductSubtitle: 'Революционный вентилятор с охлаждением льдом, ароматизацией и LED-подсветкой',
                mainImageAlt: 'CoolBreeze Arctic Pro - Революционный вентилятор 3-в-1',
                priceSavingBadge: 'ЭКОНОМИЯ 100 MDL',
                priceExtras: '💳 Рассрочка 0% • 🚚 Бесплатная доставка • 🔄 14 дней на возврат',
                mainOrderBtn: '🛒 ЗАКАЗАТЬ СО СКИДКОЙ 29%',
                mainProductMore: '📋 Узнать больше о преимуществах',
                socialCustomers: '👥 2,847 довольных клиентов',
                socialStock: '📦 Осталось: 7 шт.',

                // Features
                featIceTitle: 'Охлаждение льдом',
                featIceDesc: 'Снижает температуру на 10-15°C за 30 секунд',
                featAromaTitle: 'Ароматизация воздуха',
                featAromaDesc: 'Встроенный диффузор для эфирных масел',
                featLedTitle: 'LED-подсветка',
                featLedDesc: '7 цветов подсветки с режимом "Ночник"',
                featUsbTitle: 'Питание от USB',
                featUsbDesc: 'Работает где угодно — от сети, USB и пауэрбанка',

                // Benefits section
                benefitsTitle: 'Почему выбирают <span class="gradient-text">CoolBreeze?</span>',
                ben1Title: 'Мгновенное охлаждение',
                ben1Text: 'Уникальная технология охлаждения льдом снижает температуру воздуха на 10-15°C всего за 30 секунд',
                ben1Badge: 'Эффективность 95%',
                ben2Title: 'Ароматерапия',
                ben2Text: 'Встроенный диффузор равномерно распределяет аромат эфирных масел по всему помещению',
                ben2Badge: '100% натурально',
                ben3Title: 'Бесшумная работа',
                ben3Text: 'Инновационный мотор работает практически бесшумно - менее 30 дБ даже на максимальной мощности',
                ben3Badge: 'Тише шепота',
                ben4Title: 'Атмосферная подсветка',
                ben4Text: '7 режимов LED-подсветки создают уютную атмосферу и могут использоваться как ночник',
                ben4Badge: '7 цветов',
                ben5Title: 'Питание от USB',
                ben5Text: 'Устройство работает от розетки, ноутбука или даже пауэрбанка — где угодно',
                ben5Badge: 'До 8 часов',
                ben6Title: 'Простое управление',
                ben6Text: 'Интуитивная панель управления с сенсорными кнопками и дистанционный пульт в комплекте',
                ben6Badge: 'Пульт в подарок',

                // How it works
                howTitle: 'Как работает <span class="gradient-text">CoolBreeze?</span>',
                howSubtitle: 'Простая настройка и использование за 3 шага. Посмотрите видео и убедитесь сами!',
                videoDemo: '▶️ Демонстрация CoolBreeze',
                videoDuration: 'Продолжительность: 1:08',
                videoTag: 'СЪЁМНАЯ РУЧКА',
                videoLive: '🔴 LIVE DEMO',
                videoReal: '✅ 100% РЕАЛЬНО',
                step1Title: 'Добавьте лёд и воду',
                step1Text: 'Наполните резервуар холодной водой и добавьте кубики льда. Объем резервуара: 750 мл',
                step2Title: 'Выберите режим',
                step2Text: 'Настройте скорость вентилятора, добавьте аромат и выберите цвет подсветки одним нажатием',
                step3Title: 'Наслаждайтесь прохладой',
                step3Text: 'Через 30 секунд почувствуйте ледяную прохладу, приятный аромат и мягкую подсветку',
                techTitle: '⚡ Технические характеристики:',
                specPower: 'Мощность:',
                specPowerVal: '10W',
                specSupply: 'Питание:',
                specSupplyVal: 'От power bank',
                specTime: 'Время работы:',
                specTimeVal: '8 часов',
                specNoise: 'Уровень шума:',
                specNoiseVal: '<30 дБ',
                specTank: 'Объем резервуара:',
                specTankVal: '750 мл',
                specSize: 'Размеры:',
                specSizeVal: '20×20×25 см',

                // Special offer (hidden block)
                specialBadge: '🔥 ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ!',
                specialTitle: 'Специальная акция <span class="gradient-text">только сегодня!</span>',
                specialSubtitle: 'Успейте купить CoolBreeze со скидкой 29% и получить ценные подарки совершенно бесплатно!',
                discountLabel: 'СКИДКА',
                economy3000: 'Экономия 3000 MDL',
                financing: '💳 Рассрочка 0% на 12 месяцев = 249 MDL/мес',
                fastOrder: '⚡ Быстрый заказ за 30 секунд',
                giftsTitle: '🎁 Подарки к заказу:',
                gift1Title: 'Пульт дистанционного управления',
                gift1Desc: 'Управляйте устройством с расстояния до 10 метров',
                gift1Cost: 'Стоимость: 990 MDL',
                gift2Title: 'Набор эфирных масел',
                gift2Desc: '5 ароматов: лаванда, эвкалипт, мята, лимон, роза',
                gift2Cost: 'Стоимость: 1490 MDL',
                gift3Title: 'Формочки для льда',
                gift3Desc: 'Специальные формы для максимального охлаждения',
                gift3Cost: 'Стоимость: 590 MDL',
                giftsTotal: 'Общая стоимость подарков:',
                giftsFreeToday: 'При заказе сегодня - БЕСПЛАТНО!',

                // Guarantee & Delivery
                guaranteeTitle: 'Ваша <span class="gradient-text">безопасность</span> - наша гарантия',
                g1Title: 'Гарантия качества',
                g1Desc: '2 года официальной гарантии от производителя',
                g1Badge: '24 месяца',
                g2Title: 'Бесплатная доставка',
                g2Desc: 'По всей Молдове курьером или в пункт выдачи',
                g2Badge: '0 MDL доставка',
                g3Title: 'Возврат 14 дней',
                g3Desc: 'Не понравился товар? Вернём деньги без вопросов',
                g3Badge: '100% возврат',
                g4Title: 'Быстрая доставка',
                g4Desc: '1-3 дня в пределах Кишинёва\n3-7 дней в регионах',
                g4Badge: '1-3 дня',
                deliveryTitle: '🚛 Способы доставки',
                d1Title: 'Курьер до двери',
                d1Desc: 'Доставка прямо до вашего дома',
                dFree: 'БЕСПЛАТНО',
                d2Title: 'Пункт выдачи',
                d2Desc: 'Более 15,000 пунктов по Молдове',
                d3Title: 'Nova Poshta',
                d3Desc: 'Доставка в любую точку или почтомат Молдовы',

                // Footer
                footerAbout: 'Революционные решения для идеального микроклимата в вашем доме',
                footerRights: '© 2024 NEOSHOP CoolBreeze. Все права защищены.',

                // Order modal
                modalOrderTitle: '🛒 Оформить заказ',
                orderSummaryName: 'CoolBreeze Arctic Pro 3-в-1',
                orderSummaryBenefit: '✅ Экономия 100 MDL',
                orderNameLabel: 'Ваше имя:',
                orderNamePlaceholder: 'Введите имя',
                orderPhoneLabel: 'Ваш телефон:',
                orderPhonePlaceholder: '+(373) 123-45-678',
                orderCityLabel: 'Город доставки:',
                orderCityPlaceholder: 'Кишинёв',
                orderManagerNote: '📞 Наш менеджер перезвонит вам в течение 5 минут для подтверждения заказа',
                modalOrderBtn: '📞 ЗАКАЗАТЬ СО СКИДКОЙ 29%',

                // Toasts / submit
                orderValidation: 'Пожалуйста, заполните обязательные поля',
                orderSending: '⏳ Отправка заказа...',
                orderSuccess: 'Спасибо за заказ, {name}! Ваш заказ принят. Наш менеджер свяжется с вами по номеру {phone} в течение 5 минут.',
                orderError: 'Ошибка при отправке. Попробуйте позже.',
                orderNetworkError: 'Ошибка сети. Попробуйте позже.',

                // Timer
                expiredText: 'Акция завершена',
                expiredButton: 'Акция завершена',

                // Landing product modal
                lpModalTitle: 'Просмотр товара',
                lpModalOrderBtn: '🛒 Оформить заказ'
            },
            en: {
                docTitle: 'NEOSHOP CoolBreeze - Revolutionary 3-in-1 Fan ❄️',
                // Hero
                heroBadge: '🔥 SUPER DEAL -29% - TODAY ONLY!',
                heroTitle: 'Forget the heat! <span class="gradient-text">Ice-cold breeze</span> + tropical aroma in 1 device',
                heroSubtitle: 'Revolutionary CoolBreeze 3-in-1: ice cooling, aroma, LED light. Create perfect microclimate in seconds!',
                heroCta: '🛒 Order with 29% OFF',
                heroSeeHow: '▶️ See how it works',
                timeLeft: '⏰ Time left until the end of the offer:',

                // Landing products header
                lpTitle: 'Products <span class="gradient-text">from our line</span>',
                lpSubtitle: 'Popular and useful products at great prices',

                // Main product section
                mainImgBadgeDiscount: '29% OFF',
                mainImgBadgeStock: '✅ IN STOCK',
                mainImgBadgeHit: '🔥 BESTSELLER',
                mainProductTitle: 'CoolBreeze Arctic Pro <span class="gradient-text">3-in-1</span>',
                mainProductSubtitle: 'Revolutionary fan with ice cooling, aroma diffuser and LED lighting',
                mainImageAlt: 'CoolBreeze Arctic Pro - Revolutionary 3-in-1 fan',
                priceSavingBadge: 'SAVE 100 MDL',
                priceExtras: '💳 0% installments • 🚚 Free delivery • 🔄 14-day returns',
                mainOrderBtn: '🛒 ORDER WITH 29% OFF',
                mainProductMore: '📋 Learn more about benefits',
                socialCustomers: '👥 2,847 happy customers',
                socialStock: '📦 Left in stock: 7 pcs',

                // Features
                featIceTitle: 'Ice cooling',
                featIceDesc: 'Lowers temperature by 10-15°C in 30 seconds',
                featAromaTitle: 'Air aromatization',
                featAromaDesc: 'Built-in diffuser for essential oils',
                featLedTitle: 'LED lighting',
                featLedDesc: '7 colors with "Night light" mode',
                featUsbTitle: 'USB powered',
                featUsbDesc: 'Works anywhere — from outlet, USB or power bank',

                // Benefits section
                benefitsTitle: 'Why choose <span class="gradient-text">CoolBreeze?</span>',
                ben1Title: 'Instant cooling',
                ben1Text: 'Unique ice cooling technology reduces air temperature by 10-15°C in just 30 seconds',
                ben1Badge: 'Efficiency 95%',
                ben2Title: 'Aromatherapy',
                ben2Text: 'Built-in diffuser evenly spreads essential oil aroma throughout the room',
                ben2Badge: '100% natural',
                ben3Title: 'Silent operation',
                ben3Text: 'Innovative motor is almost silent — under 30 dB even at max power',
                ben3Badge: 'Quieter than a whisper',
                ben4Title: 'Atmospheric lighting',
                ben4Text: '7 LED modes create a cozy atmosphere and can be used as a night light',
                ben4Badge: '7 colors',
                ben5Title: 'USB power',
                ben5Text: 'Works from outlet, laptop or even a power bank — anywhere',
                ben5Badge: 'Up to 8 hours',
                ben6Title: 'Easy control',
                ben6Text: 'Intuitive touch panel and remote control included',
                ben6Badge: 'Remote as a gift',

                // How it works
                howTitle: 'How does <span class="gradient-text">CoolBreeze</span> work?',
                howSubtitle: 'Simple setup and use in 3 steps. Watch the video and see for yourself!',
                videoDemo: '▶️ CoolBreeze Demo',
                videoDuration: 'Duration: 1:08',
                videoTag: 'DETACHABLE HANDLE',
                videoLive: '🔴 LIVE DEMO',
                videoReal: '✅ 100% REAL',
                step1Title: 'Add ice and water',
                step1Text: 'Fill the tank with cold water and add ice cubes. Tank volume: 750 ml',
                step2Title: 'Choose a mode',
                step2Text: 'Set fan speed, add aroma and choose lighting color with one tap',
                step3Title: 'Enjoy the cool',
                step3Text: 'In 30 seconds feel the icy breeze, pleasant aroma and soft light',
                techTitle: '⚡ Technical specifications:',
                specPower: 'Power:',
                specPowerVal: '10W',
                specSupply: 'Power supply:',
                specSupplyVal: 'From power bank',
                specTime: 'Operating time:',
                specTimeVal: '8 hours',
                specNoise: 'Noise level:',
                specNoiseVal: '<30 dB',
                specTank: 'Tank volume:',
                specTankVal: '750 ml',
                specSize: 'Dimensions:',
                specSizeVal: '20×20×25 cm',

                // Special offer
                specialBadge: '🔥 LIMITED OFFER!',
                specialTitle: 'Special offer <span class="gradient-text">today only!</span>',
                specialSubtitle: 'Hurry to buy CoolBreeze with 29% OFF and get valuable gifts absolutely free!',
                discountLabel: 'DISCOUNT',
                economy3000: 'Save 3000 MDL',
                financing: '💳 0% installment for 12 months = 249 MDL/mo',
                fastOrder: '⚡ Quick order in 30 seconds',
                giftsTitle: '🎁 Gifts included:',
                gift1Title: 'Remote control',
                gift1Desc: 'Control the device from up to 10 meters',
                gift1Cost: 'Value: 990 MDL',
                gift2Title: 'Essential oils set',
                gift2Desc: '5 aromas: lavender, eucalyptus, mint, lemon, rose',
                gift2Cost: 'Value: 1490 MDL',
                gift3Title: 'Ice molds',
                gift3Desc: 'Special molds for maximum cooling',
                gift3Cost: 'Value: 590 MDL',
                giftsTotal: 'Total gifts value:',
                giftsFreeToday: 'Order today - FREE!',

                // Guarantee & Delivery
                guaranteeTitle: 'Your <span class="gradient-text">safety</span> is our guarantee',
                g1Title: 'Quality guarantee',
                g1Desc: '2-year official manufacturer warranty',
                g1Badge: '24 months',
                g2Title: 'Free delivery',
                g2Desc: 'Across Moldova by courier or pickup point',
                g2Badge: '0 MDL delivery',
                g3Title: '14-day return',
                g3Desc: 'Did not like it? Money-back, no questions asked',
                g3Badge: '100% refund',
                g4Title: 'Fast delivery',
                g4Desc: '1-3 days in Chișinău\n3-7 days in regions',
                g4Badge: '1-3 days',
                deliveryTitle: '🚛 Delivery methods',
                d1Title: 'Courier to door',
                d1Desc: 'Delivery straight to your home',
                dFree: 'FREE',
                d2Title: 'Pickup point',
                d2Desc: 'Over 15,000 pickup points across Moldova',
                d3Title: 'Nova Poshta',
                d3Desc: 'Delivery anywhere or to a locker in Moldova',

                // Footer
                footerAbout: 'Revolutionary solutions for a perfect home microclimate',
                footerRights: '© 2024 NEOSHOP CoolBreeze. All rights reserved.',

                // Order modal
                modalOrderTitle: '🛒 Place an order',
                orderSummaryName: 'CoolBreeze Arctic Pro 3-in-1',
                orderSummaryBenefit: '✅ Save 100 MDL',
                orderNameLabel: 'Your name:',
                orderNamePlaceholder: 'Enter your name',
                orderPhoneLabel: 'Your phone:',
                orderPhonePlaceholder: '+(373) 123-45-678',
                orderCityLabel: 'Delivery city:',
                orderCityPlaceholder: 'Chișinău',
                orderManagerNote: '📞 Our manager will call you back within 5 minutes to confirm the order',
                modalOrderBtn: '📞 ORDER WITH 29% OFF',

                // Toasts / submit
                orderValidation: 'Please fill in the required fields',
                orderSending: '⏳ Sending order...',
                orderSuccess: 'Thank you for your order, {name}! Your order is accepted. Our manager will contact you at {phone} within 5 minutes.',
                orderError: 'Submission error. Please try later.',
                orderNetworkError: 'Network error. Please try later.',

                // Timer
                expiredText: 'Offer ended',
                expiredButton: 'Offer ended',

                // Landing product modal
                lpModalTitle: 'Product preview',
                lpModalOrderBtn: '🛒 Place order'
            },
            ro: {
                docTitle: 'NEOSHOP CoolBreeze - Ventilator revoluționar 3-în-1 ❄️',
                // Hero
                heroBadge: '🔥 SUPER OFERTĂ -29% - DOAR ASTĂZI!',
                heroTitle: 'Uită de căldură! <span class="gradient-text">Briză înghețată</span> + aromă tropicală într-un singur dispozitiv',
                heroSubtitle: 'Revoluționarul CoolBreeze 3-în-1: răcire cu gheață, aromă și iluminare LED. Creează microclimatul perfect în câteva secunde!',
                heroCta: '🛒 Comandă cu reducere 29%',
                heroSeeHow: '▶️ Vezi cum funcționează',
                timeLeft: '⏰ Timp rămas până la finalul ofertei:',

                // Landing products header
                lpTitle: 'Produse <span class="gradient-text">din gama noastră</span>',
                lpSubtitle: 'Am selectat produse populare și utile la prețuri excelente',

                // Main product section
                mainImgBadgeDiscount: 'REDUCERE 29%',
                mainImgBadgeStock: '✅ ÎN STOC',
                mainImgBadgeHit: '🔥 HIT DE VÂNZĂRI',
                mainProductTitle: 'CoolBreeze Arctic Pro <span class="gradient-text">3-în-1</span>',
                mainProductSubtitle: 'Ventilator revoluționar cu răcire cu gheață, difuzor de arome și iluminare LED',
                mainImageAlt: 'CoolBreeze Arctic Pro - Ventilator revoluționar 3-în-1',
                priceSavingBadge: 'ECONOMIE 100 MDL',
                priceExtras: '💳 Rate 0% • 🚚 Livrare gratuită • 🔄 14 zile retur',
                mainOrderBtn: '🛒 COMANDĂ CU REDUCERE 29%',
                mainProductMore: '📋 Află mai multe despre avantaje',
                socialCustomers: '👥 2.847 clienți mulțumiți',
                socialStock: '📦 Au rămas: 7 buc.',

                // Features
                featIceTitle: 'Răcire cu gheață',
                featIceDesc: 'Reduce temperatura cu 10-15°C în 30 de secunde',
                featAromaTitle: 'Aromatizarea aerului',
                featAromaDesc: 'Difuzor încorporat pentru uleiuri esențiale',
                featLedTitle: 'Iluminare LED',
                featLedDesc: '7 culori cu modul "Veioză"',
                featUsbTitle: 'Alimentare USB',
                featUsbDesc: 'Funcționează oriunde — de la priză, USB sau power bank',

                // Benefits section
                benefitsTitle: 'De ce alegi <span class="gradient-text">CoolBreeze?</span>',
                ben1Title: 'Răcire instantă',
                ben1Text: 'Tehnologia unică de răcire cu gheață scade temperatura aerului cu 10-15°C în doar 30 de secunde',
                ben1Badge: 'Eficiență 95%',
                ben2Title: 'Aromaterapie',
                ben2Text: 'Difuzorul încorporat distribuie uniform aroma uleiurilor esențiale în toată încăperea',
                ben2Badge: '100% natural',
                ben3Title: 'Funcționare silențioasă',
                ben3Text: 'Motor inovator aproape silențios — sub 30 dB chiar și la putere maximă',
                ben3Badge: 'Mai încet decât o șoaptă',
                ben4Title: 'Iluminare atmosferică',
                ben4Text: '7 moduri LED creează o atmosferă plăcută și pot fi folosite ca veioză',
                ben4Badge: '7 culori',
                ben5Title: 'Alimentare USB',
                ben5Text: 'Funcționează de la priză, laptop sau chiar power bank — oriunde',
                ben5Badge: 'Până la 8 ore',
                ben6Title: 'Control simplu',
                ben6Text: 'Panou tactil intuitiv și telecomandă inclusă',
                ben6Badge: 'Telecomandă cadou',

                // How it works
                howTitle: 'Cum funcționează <span class="gradient-text">CoolBreeze</span>?',
                howSubtitle: 'Configurare și utilizare simplă în 3 pași. Urmărește video și convinge-te!',
                videoDemo: '▶️ Demonstrație CoolBreeze',
                videoDuration: 'Durata: 1:08',
                videoTag: 'MÂNER DETAȘABIL',
                videoLive: '🔴 LIVE DEMO',
                videoReal: '✅ 100% REAL',
                step1Title: 'Adaugă gheață și apă',
                step1Text: 'Umple rezervorul cu apă rece și adaugă cuburi de gheață. Volum rezervor: 750 ml',
                step2Title: 'Alege modul',
                step2Text: 'Setează viteza ventilatorului, adaugă aromă și alege culoarea iluminării dintr-o atingere',
                step3Title: 'Bucură-te de răcoare',
                step3Text: 'În 30 de secunde simți briza rece, aroma plăcută și lumina discretă',
                techTitle: '⚡ Specificații tehnice:',
                specPower: 'Putere:',
                specPowerVal: '10W',
                specSupply: 'Alimentare:',
                specSupplyVal: 'De la power bank',
                specTime: 'Timp de funcționare:',
                specTimeVal: '8 ore',
                specNoise: 'Nivel de zgomot:',
                specNoiseVal: '<30 dB',
                specTank: 'Volum rezervor:',
                specTankVal: '750 ml',
                specSize: 'Dimensiuni:',
                specSizeVal: '20×20×25 cm',

                // Special offer
                specialBadge: '🔥 OFERTĂ LIMITATĂ!',
                specialTitle: 'Ofertă specială <span class="gradient-text">doar astăzi!</span>',
                specialSubtitle: 'Grăbește-te să cumperi CoolBreeze cu reducere 29% și primești cadouri valoroase gratuit!',
                discountLabel: 'REDUCERE',
                economy3000: 'Economisești 3000 MDL',
                financing: '💳 Rate 0% pe 12 luni = 249 MDL/lună',
                fastOrder: '⚡ Comandă rapidă în 30 de secunde',
                giftsTitle: '🎁 Cadouri incluse:',
                gift1Title: 'Telecomandă',
                gift1Desc: 'Controlează dispozitivul de la până la 10 metri',
                gift1Cost: 'Valoare: 990 MDL',
                gift2Title: 'Set uleiuri esențiale',
                gift2Desc: '5 arome: lavandă, eucalipt, mentă, lămâie, trandafir',
                gift2Cost: 'Valoare: 1490 MDL',
                gift3Title: 'Tăvițe pentru gheață',
                gift3Desc: 'Forme speciale pentru răcire maximă',
                gift3Cost: 'Valoare: 590 MDL',
                giftsTotal: 'Valoarea totală a cadourilor:',
                giftsFreeToday: 'Comandă azi - GRATUIT!',

                // Guarantee & Delivery
                guaranteeTitle: '<span class="gradient-text">Siguranța</span> ta – garanția noastră',
                g1Title: 'Garanția calității',
                g1Desc: '2 ani garanție oficială de la producător',
                g1Badge: '24 luni',
                g2Title: 'Livrare gratuită',
                g2Desc: 'În toată Moldova prin curier sau punct de ridicare',
                g2Badge: 'Livrare 0 MDL',
                g3Title: 'Retur 14 zile',
                g3Desc: 'Nu îți place produsul? Restituire fără întrebări',
                g3Badge: '100% retur',
                g4Title: 'Livrare rapidă',
                g4Desc: 'Livrare rapidă și sigură 1-3 zile în Chișinău\n3-7 zile în regiuni',
                g4Badge: '1-3 zile',
                deliveryTitle: '🚛 Metode de livrare',
                d1Title: 'Curier la ușă',
                d1Desc: 'Livrare direct la domiciliu',
                dFree: 'GRATUIT',
                d2Title: 'Punct de ridicare',
                d2Desc: 'Peste 15.000 de puncte în Moldova',
                d3Title: 'Nova Poshta',
                d3Desc: 'Livrare oriunde sau la locker în Moldova',

                // Footer
                footerAbout: 'Soluții revoluționare pentru un microclimat perfect acasă',
                footerRights: '© 2024 NEOSHOP CoolBreeze. Toate drepturile rezervate.',

                // Order modal
                modalOrderTitle: '🛒 Plasează comanda',
                orderSummaryName: 'CoolBreeze Arctic Pro 3-în-1',
                orderSummaryBenefit: '✅ Economisești 100 MDL',
                orderNameLabel: 'Numele tău:',
                orderNamePlaceholder: 'Introdu numele',
                orderPhoneLabel: 'Telefonul tău:',
                orderPhonePlaceholder: '+(373) 123-45-678',
                orderCityLabel: 'Orașul de livrare:',
                orderCityPlaceholder: 'Chișinău',
                orderManagerNote: '📞 Managerul nostru te va suna în 5 minute pentru confirmare',
                modalOrderBtn: '📞 COMANDĂ CU REDUCERE 29%',

                // Toasts / submit
                orderValidation: 'Te rugăm să completezi câmpurile obligatorii',
                orderSending: '⏳ Trimiterea comenzii...',
                orderSuccess: 'Îți mulțumim pentru comandă, {name}! Comanda a fost preluată. Managerul nostru te va contacta la {phone} în 5 minute.',
                orderError: 'Eroare la trimitere. Încearcă mai târziu.',
                orderNetworkError: 'Eroare de rețea. Încearcă mai târziu.',

                // Timer
                expiredText: 'Oferta s-a încheiat',
                expiredButton: 'Oferta s-a încheiat',

                // Landing product modal
                lpModalTitle: 'Vizualizare produs',
                lpModalOrderBtn: '🛒 Plasează comanda'
            }
        };

        // Per-product translations
        const productI18n = {
            en: {
                p1: { title: 'CoolBreeze Fan', description: 'CoolBreeze fan — powerful and stylish! Compact design, 3 speeds, silent operation. Perfect for home, office and summer leisure.', badge: 'Hit' },
                p2: { title: 'Picnic cooler bag', description: 'Cooler bag 27.5×23×46.5 cm keeps food fresh and drinks cold. Compact and stylish.', badge: 'NEW' },
                p3: { title: 'Mirate sleep mask', description: 'Sleep mask with gel insert — comfort, 100% blackout and cooling effect.', badge: '' },
                p4: { title: 'Bear night light humidifier 300 ml', description: 'Soft lighting, silent operation and aromatherapy. USB powered, 300 ml capacity.', badge: 'Top' },
                p5: { title: 'Ozone refrigerator purifier', description: 'Eliminates odors, bacteria and mold. Compact and safe.', badge: '' },
                p6: { title: 'Antigravity humidifier', description: 'Floating drops create an ideal microclimate while quietly humidifying the space.', badge: 'WOW' },
                p7: { title: 'Thermometer, hygrometer + clock HTC-1', description: 'Accurate temperature and humidity measurements. Your comfort under control!', badge: '' },
                p8: { title: 'CuteLover sunscreen SPF 50, 50ml', description: 'Lightweight non-sticky formula, water resistant and gentle care.', badge: 'SPF' },
                p9: { title: 'Aromatic diffuser 50 ml', description: 'Natural oils, delicate aromas. Different options available.', badge: 'Aroma' }
            },
            ro: {
                p1: { title: 'Ventilator CoolBreeze', description: 'Ventilator CoolBreeze — puternic și stilat! Design compact, 3 viteze, funcționare silențioasă. Ideal pentru casă, birou și vacanță.', badge: 'Hit' },
                p2: { title: 'Geantă termică pentru picnic', description: 'Geantă termică 27,5×23×46,5 cm păstrează alimentele proaspete și băuturile reci. Compactă și stilată.', badge: 'NEW' },
                p3: { title: 'Mască de somn Mirate', description: 'Mască de somn cu inserție cu gel — confort, întunecare 100% și efect de răcire.', badge: '' },
                p4: { title: 'Veioză-umidificator Ursuleț 300 ml', description: 'Iluminare blândă, funcționare silențioasă și aromaterapie. Alimentare USB, volum 300 ml.', badge: 'Top' },
                p5: { title: 'Purificator cu ozon pentru frigider', description: 'Elimină mirosurile, bacteriile și mucegaiul. Compact și sigur.', badge: '' },
                p6: { title: 'Umidificator antigravitațional', description: 'Picături plutitoare creează microclimatul ideal, umidificând silențios spațiul.', badge: 'WOW' },
                p7: { title: 'Termometru, higrometru + ceas HTC-1', description: 'Măsurători precise de temperatură și umiditate. Confortul tău sub control!', badge: '' },
                p8: { title: 'Cremă de protecție solară CuteLover SPF 50, 50ml', description: 'Formulă ușoară, fără lipici, rezistentă la apă și îngrijire blândă.', badge: 'SPF' },
                p9: { title: 'Difuzor aromatic 50 ml', description: 'Uleiuri naturale, arome delicate. Disponibile opțiuni diferite.', badge: 'Aromă' }
            }
        };

        function currentLang(){
            return localStorage.getItem('lang') || 'ru';
        }
        function t(key){
            const lang = currentLang();
            return (i18n[lang] && i18n[lang][key]) || (i18n['ru'][key] || '');
        }
        function tfmt(key, vars={}){
            let s = t(key);
            Object.entries(vars).forEach(([k,v])=>{ s = s.replaceAll(`{${k}}`, v); });
            return s;
        }

        function getProductText(product, field){
            const lang = currentLang();
            if (lang === 'ru') return product[field] || '';
            const li = productI18n[lang] && productI18n[lang][product.id];
            if (li && li[field]) return li[field];
            return product[field] || '';
        }

        function applyTranslations(){
            // Update document language
            document.documentElement.setAttribute('lang', currentLang());

            const mapping = [
                // Hero
                ['.hero-section .promo-badge', 'heroBadge'],
                ['.hero-section h1', 'heroTitle'],
                ['.hero-section p.text-xl', 'heroSubtitle'],
                ['.hero-section .order-btn[data-analytics="hero"]', 'heroCta'],
                ['.hero-section button[onclick*="how-works"]', 'heroSeeHow'],

                // Landing products header
                ['#landing-products h2', 'lpTitle'],
                ['#landing-products p.text-xl', 'lpSubtitle'],

                // Main product section badges
                ['#main-product-visual .absolute.top-4.left-4', 'mainImgBadgeDiscount'],
                ['#main-product-visual .absolute.top-4.right-4', 'mainImgBadgeStock'],
                ['#main-product-visual .absolute.bottom-4.left-4', 'mainImgBadgeHit'],
                // Main product title/subtitle
                ['.hero-grid h2', 'mainProductTitle'],
                ['.hero-grid p.text-xl', 'mainProductSubtitle'],
                // Main product features
                ['.hero-grid .space-y-4 > div:nth-child(1) h4', 'featIceTitle'],
                ['.hero-grid .space-y-4 > div:nth-child(1) p', 'featIceDesc'],
                ['.hero-grid .space-y-4 > div:nth-child(2) h4', 'featAromaTitle'],
                ['.hero-grid .space-y-4 > div:nth-child(2) p', 'featAromaDesc'],
                ['.hero-grid .space-y-4 > div:nth-child(3) h4', 'featLedTitle'],
                ['.hero-grid .space-y-4 > div:nth-child(3) p', 'featLedDesc'],
                ['.hero-grid .space-y-4 > div:nth-child(4) h4', 'featUsbTitle'],
                ['.hero-grid .space-y-4 > div:nth-child(4) p', 'featUsbDesc'],
                ['.price-block .bg-red-500', 'priceSavingBadge'],
                ['.price-block .text-sm.text-gray-600', 'priceExtras'],
                ['section.bg-white .order-btn[data-analytics="main_product"]', 'mainOrderBtn'],
                ['section.bg-white button[onclick*="benefits"]', 'mainProductMore'],
                // Social proof
                ['.flex.items-center.space-x-4.text-sm .flex.items-center.space-x-1 + div', 'socialCustomers'],
                ['.flex.items-center.space-x-4.text-sm .flex.items-center.space-x-1 + div + div', 'socialStock'],

                // Benefits header
                ['#benefits h2', 'benefitsTitle'],
                // Benefits cards
                ['#benefits .benefits-grid > div:nth-child(1) h3', 'ben1Title'],
                ['#benefits .benefits-grid > div:nth-child(1) p', 'ben1Text'],
                ['#benefits .benefits-grid > div:nth-child(1) .inline-block', 'ben1Badge'],
                ['#benefits .benefits-grid > div:nth-child(2) h3', 'ben2Title'],
                ['#benefits .benefits-grid > div:nth-child(2) p', 'ben2Text'],
                ['#benefits .benefits-grid > div:nth-child(2) .inline-block', 'ben2Badge'],
                ['#benefits .benefits-grid > div:nth-child(3) h3', 'ben3Title'],
                ['#benefits .benefits-grid > div:nth-child(3) p', 'ben3Text'],
                ['#benefits .benefits-grid > div:nth-child(3) .inline-block', 'ben3Badge'],
                ['#benefits .benefits-grid > div:nth-child(4) h3', 'ben4Title'],
                ['#benefits .benefits-grid > div:nth-child(4) p', 'ben4Text'],
                ['#benefits .benefits-grid > div:nth-child(4) .inline-block', 'ben4Badge'],
                ['#benefits .benefits-grid > div:nth-child(5) h3', 'ben5Title'],
                ['#benefits .benefits-grid > div:nth-child(5) p', 'ben5Text'],
                ['#benefits .benefits-grid > div:nth-child(5) .inline-block', 'ben5Badge'],
                ['#benefits .benefits-grid > div:nth-child(6) h3', 'ben6Title'],
                ['#benefits .benefits-grid > div:nth-child(6) p', 'ben6Text'],
                ['#benefits .benefits-grid > div:nth-child(6) .inline-block', 'ben6Badge'],

                // How it works header
                ['#how-works h2', 'howTitle'],
                ['#how-works p.text-xl', 'howSubtitle'],
                // Steps
                ['#how-works .space-y-20 > div:nth-child(1) h3', 'step1Title'],
                ['#how-works .space-y-20 > div:nth-child(1) p', 'step1Text'],
                ['#how-works .space-y-20 > div:nth-child(2) h3', 'step2Title'],
                ['#how-works .space-y-20 > div:nth-child(2) p', 'step2Text'],
                ['#how-works .space-y-20 > div:nth-child(3) h3', 'step3Title'],
                ['#how-works .space-y-20 > div:nth-child(3) p', 'step3Text'],
                // Tech specs
                ['#how-works .bg-gray-50 h4', 'techTitle'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(1) span.font-semibold', 'specPower'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(2) span.font-semibold', 'specSupply'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(3) span.font-semibold', 'specTime'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(4) span.font-semibold', 'specNoise'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(5) span.font-semibold', 'specTank'],
                ['#how-works .bg-gray-50 .grid > div:nth-child(6) span.font-semibold', 'specSize'],

                // Special offer header
                ['section.py-20.bg-gradient-to-br .inline-block.bg-red-500', 'specialBadge'],
                ['section.py-20.bg-gradient-to-br h2', 'specialTitle'],
                ['section.py-20.bg-gradient-to-br p.text-xl', 'specialSubtitle'],
                // Special offer details
                ['section.py-20.bg-gradient-to-br .text-2xl.font-bold.text-gray-900', 'discountLabel'],
                ['section.py-20.bg-gradient-to-br .text-center.mb-8 .text-gray-600', 'economy3000'],
                ['section.py-20.bg-gradient-to-br .price-block .text-center.text-sm.text-gray-600', 'financing'],
                ['section.py-20.bg-gradient-to-br .bg-gray-900 .text-sm.mb-2', 'timeLeft'],
                ['section.py-20.bg-gradient-to-br .order-btn[data-analytics="special_offer"]', 'mainOrderBtn'],
                ['section.py-20.bg-gradient-to-br .text-center.text-sm.text-gray-600', 'fastOrder'],
                ['section.py-20.bg-gradient-to-br h3', 'giftsTitle'],
                // Gifts items
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(2) h4', 'gift1Title'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(2) p', 'gift1Desc'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(2) .text-blue-600', 'gift1Cost'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(3) h4', 'gift2Title'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(3) p', 'gift2Desc'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(3) .text-purple-600', 'gift2Cost'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(4) h4', 'gift3Title'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(4) p', 'gift3Desc'],
                ['section.py-20.bg-gradient-to-br .space-y-6 > div:nth-child(4) .text-green-600', 'gift3Cost'],
                ['section.py-20.bg-gradient-to-br .text-center.p-4.bg-yellow-100 .text-lg.font-bold.text-gray-900', 'giftsTotal'],
                ['section.py-20.bg-gradient-to-br .text-center.p-4.bg-yellow-100 .text-sm.text-gray-600', 'giftsFreeToday'],

                // Guarantee & Delivery
                
                // g1
                ['.guarantee-grid .text-center:nth-child(1) h3', 'g1Title'],
                ['.guarantee-grid .text-center:nth-child(1) p', 'g1Desc'],
                ['.guarantee-grid .text-center:nth-child(1) .bg-blue-100', 'g1Badge'],
                // g2
                ['.guarantee-grid .text-center:nth-child(2) h3', 'g2Title'],
                ['.guarantee-grid .text-center:nth-child(2) p', 'g2Desc'],
                ['.guarantee-grid .text-center:nth-child(2) .bg-green-100', 'g2Badge'],
                // g3
                ['.guarantee-grid .text-center:nth-child(3) h3', 'g3Title'],
                ['.guarantee-grid .text-center:nth-child(3) p', 'g3Desc'],
                ['.guarantee-grid .text-center:nth-child(3) .bg-purple-100', 'g3Badge'],
                // g4
                ['.guarantee-grid .text-center:nth-child(4) h3', 'g4Title'],
                ['.guarantee-grid .text-center:nth-child(4) p', 'g4Desc'],
                ['.guarantee-grid .text-center:nth-child(4) .bg-yellow-100', 'g4Badge'],

                ['.bg-gray-50.p-8.rounded-2xl h3', 'deliveryTitle'],
                // Delivery items
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(1) h4', 'd1Title'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(1) p', 'd1Desc'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(1) .text-green-600', 'dFree'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(2) h4', 'd2Title'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(2) p', 'd2Desc'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(2) .text-green-600', 'dFree'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(3) h4', 'd3Title'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(3) p', 'd3Desc'],
                ['.bg-gray-50.p-8.rounded-2xl .grid .text-center:nth-child(3) .text-green-600', 'dFree'],

                // Footer
                ['footer .text-gray-400', 'footerAbout'],
                ['footer .text-gray-500', 'footerRights'],

                // Order modal
                ['#order-modal h2#order-modal-title', 'modalOrderTitle'],
                ['#order-modal #order-modal-summary .font-semibold', 'orderSummaryName'],
                ['#order-modal #order-modal-summary .text-sm.text-green-600', 'orderSummaryBenefit'],
                ['#order-modal label[for="order-name-label"]', 'orderNameLabel'], // fallback if for exists
                ['#order-modal form div:nth-child(1) label', 'orderNameLabel'],
                ['#order-modal form div:nth-child(2) label', 'orderPhoneLabel'],
                ['#order-modal form div:nth-child(3) label', 'orderCityLabel'],
                ['#order-modal .text-sm.text-gray-600.bg-green-50', 'orderManagerNote'],
                ['#order-modal button[type="submit"]', 'modalOrderBtn'],

                // Video overlays
                ['#how-works .relative.bg-gradient-to-br .absolute.bottom-4.left-4 .text-sm.font-semibold', 'videoDemo'],
                ['#how-works .relative.bg-gradient-to-br .absolute.bottom-4.left-4 .text-xs.opacity-80', 'videoDuration'],
                ['#how-works .relative.bg-gradient-to-br .absolute.bottom-4.right-4', 'videoTag'],
                ['#how-works .relative.bg-gradient-to-br .absolute.top-4.left-4', 'videoLive'],
                ['#how-works .relative.bg-gradient-to-br .absolute.top-4.right-4', 'videoReal']
            ];

            mapping.forEach(([selector, key]) => {
                const el = document.querySelector(selector);
                if (!el) return;
                const html = t(key);
                if (html.includes('<span')) el.innerHTML = html; else el.textContent = html;
                if (key === 'timeLeft') el.classList.add('time-left-label');
            });

            // Update tech spec values per language
            const specGrid = document.querySelector('#how-works .bg-gray-50 .grid');
            if (specGrid) {
                const specRows = specGrid.querySelectorAll(':scope > div');
                const map = [
                    ['specPower', 'specPowerVal'],
                    ['specSupply', 'specSupplyVal'],
                    ['specTime', 'specTimeVal'],
                    ['specNoise', 'specNoiseVal'],
                    ['specTank', 'specTankVal'],
                    ['specSize', 'specSizeVal']
                ];
                specRows.forEach((row, idx) => {
                    const labelKey = map[idx]?.[0];
                    const valueKey = map[idx]?.[1];
                    if (!labelKey || !valueKey) return;
                    const labelEl = row.querySelector('span.font-semibold');
                    if (labelEl) labelEl.textContent = t(labelKey);
                    // Replace the text after the label with localized value
                    const valueText = t(valueKey);
                    if (valueText) {
                        // Remove everything after the label and append a text node with value
                        const nodes = Array.from(row.childNodes);
                        const idxLabel = nodes.indexOf(labelEl);
                        // Clear existing nodes after label
                        for (let i = nodes.length - 1; i > idxLabel; i--) row.removeChild(nodes[i]);
                        row.appendChild(document.createTextNode(' ' + valueText));
                    }
                });
            }

            // Guarantee title (target specific section that contains .guarantee-grid)
            const guaranteeGrid = document.querySelector('.guarantee-grid');
            if (guaranteeGrid) {
                const section = guaranteeGrid.closest('section');
                const h2 = section && section.querySelector('.text-center.mb-16 h2');
                if (h2) {
                    const html = t('guaranteeTitle');
                    if (html.includes('<span')) h2.innerHTML = html; else h2.textContent = html;
                }
            }

            // Title and main image alt
            const titleEl = document.querySelector('head > title');
            if (titleEl) titleEl.textContent = t('docTitle');
            const mainImg = document.getElementById('main-product-image');
            if (mainImg) mainImg.alt = t('mainImageAlt');

            // Inputs placeholders
            const nameInput = document.querySelector('#order-modal input[name="name"]');
            if (nameInput) nameInput.placeholder = t('orderNamePlaceholder');
            const phoneInput = document.querySelector('#order-modal input[name="phone"]');
            if (phoneInput) phoneInput.placeholder = t('orderPhonePlaceholder');
            const cityInput = document.querySelector('#order-modal input[name="city"]');
            if (cityInput) cityInput.placeholder = t('orderCityPlaceholder');

            // Re-render products with translations when available
            if (typeof renderLandingProducts === 'function') {
                renderLandingProducts();
            } else {
                window.__rerenderLanding = true;
            }
        }

        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            const current = localStorage.getItem('lang') || 'ru';
            langSelect.value = current;
            applyTranslations();
            langSelect.addEventListener('change', () => {
                localStorage.setItem('lang', langSelect.value);
                applyTranslations();
            });
        } else {
            applyTranslations();
        }

        document.addEventListener("DOMContentLoaded", function () {
        const video = document.getElementById("howItWorksVideo");
        const wrapper = document.getElementById("videoWrapper");

        if (!video || !wrapper) return;

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
          trigger: wrapper,
          start: "top 80%",
          once: true,
          onEnter: () => {
            video.play().catch((err) => {
              console.warn("Автозапуск не удался:", err);
            });
          }
        });
      });