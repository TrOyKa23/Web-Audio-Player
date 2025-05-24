        // Переменные для курсора
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');

        // Более отзывчивый курсор
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursor() {
            // Мгновенное обновление основного курсора
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
            
            // Плавное следование для второго курсора
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            
            cursorFollower.style.left = cursorX + 'px';
            cursorFollower.style.top = cursorY + 'px';
            
            requestAnimationFrame(updateCursor);
        }

        updateCursor();

        // Увеличение курсора при наведении на интерактивные элементы
        const interactiveElements = document.querySelectorAll('a, button, .feature-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'transparent';
            });
        });



        // Эффект ripple для кнопки
        function createRipple(event, button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Анимация появления элементов при скролле
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Наблюдение за карточками функций
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        // Изменение навигации при скролле
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });

        // Инициализация
        document.addEventListener('DOMContentLoaded', () => {
            createParticles();
        });

        // Дополнительные интерактивные эффекты
        document.addEventListener('click', (e) => {
            // Создание кликового эффекта
            const clickEffect = document.createElement('div');
            clickEffect.style.position = 'fixed';
            clickEffect.style.left = e.clientX + 'px';
            clickEffect.style.top = e.clientY + 'px';
            clickEffect.style.width = '10px';
            clickEffect.style.height = '10px';
            clickEffect.style.background = '#fff';
            clickEffect.style.borderRadius = '50%';
            clickEffect.style.pointerEvents = 'none';
            clickEffect.style.zIndex = '9999';
            clickEffect.style.animation = 'clickExpand 0.6s ease-out forwards';
            
            document.body.appendChild(clickEffect);
            
            setTimeout(() => {
                clickEffect.remove();
            }, 600);
        });

        // CSS для анимации клика
        const style = document.createElement('style');
        style.textContent = `
            @keyframes clickExpand {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(20);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
