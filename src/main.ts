import "./style.css";


// singleton class to track user interactions
class SiteInteractionLogger {
  private static instance: SiteInteractionLogger;
  private logs: string[] = [];

  private constructor() {}

  public static getInstance(): SiteInteractionLogger {
    if (!SiteInteractionLogger.instance) {
      SiteInteractionLogger.instance = new SiteInteractionLogger();
    }
    return SiteInteractionLogger.instance;
  }

  public log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  public getLogs(): string[] {
    return [...this.logs];
  }
}

// Form Validation Utility
class FormValidator {
  public static validateName(name: string): boolean {
    return name.trim().length >= 2;
  }

  public static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static validatePhone(phone: string): boolean {
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }
}

// Safely query selector with null check
function safeQuerySelector<T extends Element>(selector: string): T {
  const element = document.querySelector(selector);
  if (!element) {
    const logger = SiteInteractionLogger.getInstance();
    logger.log(`Error: Element with selector ${selector} not found`);
    throw new Error(`Element with selector ${selector} not found`);
  }
  return element as T;
}

// Navigation Menu Toggle
const hamburger = safeQuerySelector<HTMLButtonElement>(
  ".page-header__toggle-nav"
);
const nav = safeQuerySelector<HTMLElement>(".page-header__nav");
const logger = SiteInteractionLogger.getInstance();

hamburger.addEventListener("click", function (e: MouseEvent) {
  e.preventDefault();

  this.classList.toggle("hamburger__click");
  if (this.classList.contains("hamburger__click")) {
    nav.classList.add("page-header__nav--show");
    logger.log("Navigation menu opened");
  } else {
    nav.classList.remove("page-header__nav--show");
    logger.log("Navigation menu closed");
  }
});

// Modal Handling
const modalOrder = safeQuerySelector<HTMLDivElement>(".modal-order");
const btnModalPromo = safeQuerySelector<HTMLButtonElement>(".promo__button");
const btnModalAdvantages = safeQuerySelector<HTMLButtonElement>(
  ".advantages__button"
);
const btnModalFooter = safeQuerySelector<HTMLButtonElement>(
  ".page-footer__order"
);
const closeOrder = safeQuerySelector<HTMLButtonElement>(".modal-order__close");
const overlay = safeQuerySelector<HTMLDivElement>(".overlay");

let removeShowTimeout: number;

// Form Submission Handler
function setupFormSubmission(formSelector: string): void {
  const form = safeQuerySelector<HTMLFormElement>(formSelector);

  form.addEventListener("submit", function (e: Event) {
    e.preventDefault();

    const nameInput = form.querySelector<HTMLInputElement>(
      'input[name="user__name"], input[name="order__name"]'
    );
    const emailInput = form.querySelector<HTMLInputElement>(
      'input[name="user__email"]'
    );
    const phoneInput = form.querySelector<HTMLInputElement>(
      'input[name="order__number"]'
    );

    if (nameInput && !FormValidator.validateName(nameInput.value)) {
      alert("Please enter a valid name (at least 2 characters)");
      return;
    }

    if (emailInput && !FormValidator.validateEmail(emailInput.value)) {
      alert("Please enter a valid email address");
      return;
    }

    if (phoneInput && !FormValidator.validatePhone(phoneInput.value)) {
      alert("Please enter a valid phone number");
      return;
    }

    // Simulate form submission
    logger.log(`Form submitted: ${formSelector}`);
    alert("Thank you for your submission!");
    form.reset();
    hideModal(modalOrder, overlay);
  });
}

function modalButtons(...buttons: HTMLButtonElement[]): void {
  buttons.forEach((btn) => {
    btn.addEventListener("click", function (evt: MouseEvent) {
      evt.preventDefault();
      logger.log(`Modal opened by: ${btn.className}`);
      workModal(modalOrder, closeOrder, overlay);
    });
  });
}

// Initial modal button binding
modalButtons(btnModalPromo, btnModalAdvantages, btnModalFooter);

// Work with Modal
function workModal(
  modal: HTMLDivElement,
  close: HTMLButtonElement,
  overlayEl: HTMLDivElement
): void {
  // Show modal and overlay
  modal.classList.remove("modal-hide");
  modal.classList.add("modal-show");
  overlayEl.classList.add("overlay-show");

  // Close modal event listeners
  const closeModalHandler = (evt: MouseEvent) => {
    evt.preventDefault();
    hideModal(modal, overlayEl);
  };

  close.addEventListener("click", closeModalHandler);
  overlayEl.addEventListener("click", closeModalHandler);

  // Close modal on ESC key
  const escapeHandler = (evt: KeyboardEvent) => {
    if (evt.key === "Escape") {
      evt.preventDefault();
      hideModal(modal, overlayEl);
      window.removeEventListener("keydown", escapeHandler);
    }
  };

  window.addEventListener("keydown", escapeHandler);
}

// Hide Modal
function hideModal(modal: HTMLDivElement, overlayEl: HTMLDivElement): void {
  clearTimeout(removeShowTimeout);

  modal.classList.add("modal-hide");
  overlayEl.classList.remove("overlay-show");

  removeShowTimeout = setTimeout(() => {
    modal.classList.remove("modal-show");
    logger.log("Modal closed");
  }, 600) as unknown as number;
}

// Page Load and Scroll Interactions
window.addEventListener("load", () => {
  const header = safeQuerySelector<HTMLHeadElement>(".page-header");
  const animationElements = document.querySelectorAll<HTMLElement>(
    ".animation-up, .animation-left, .animation-right, .animation-show"
  );

  setupFormSubmission("#сonsultation");
  setupFormSubmission("#order-form");

  scrollToY(0);

  animationAction();

  window.addEventListener("scroll", () => {
    onScroll();
    animationAction();
  });

  // Animate elements on scroll
  function animationAction(): void {
    const windowHeight = window.innerHeight;

    animationElements.forEach((element) => {
      const blockPosition = element.getBoundingClientRect().top;

      if (blockPosition < windowHeight - 10) {
        element.style.opacity = "1";
        element.style.transform = "translate(0, 0)";
      }
    });
  }

  // Header scroll effect
  function onScroll(): void {
    const pos = window.pageYOffset;
    if (pos > 72) {
      header.classList.add("page-header__scroll");
    } else {
      header.classList.remove("page-header__scroll");
    }
  }
});

// Scroll to specific Y position
function scrollToY(pos: number): void {
  window.scrollTo({
    top: pos,
    behavior: "smooth",
  });
}

// the following code was used to capture session logs and send it to a backend analytics server
window.addEventListener("beforeunload", () => {
  const logs = SiteInteractionLogger.getInstance().getLogs();
  console.log("Session Logs:", logs);
});
