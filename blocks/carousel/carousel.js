import { fetchPlaceholders } from '../../scripts/placeholders.js';

let placeholders = {};

async function getPlaceholder(key, defaultValue) {
  if (!placeholders || Object.keys(placeholders).length === 0) {
    placeholders = await fetchPlaceholders();
  }
  return placeholders[key] || defaultValue;
}

function getCurrentSlideIndex(block) {
  return parseInt(block.dataset.activeSlide, 10) || 0;
}

function updateActiveSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.cmp-carousel__item');
  const indicators = block.querySelectorAll('.cmp-carousel__indicator');
  
  // Remove active classes
  slides.forEach(slide => slide.classList.remove('cmp-carousel__item--active'));
  indicators.forEach(indicator => indicator.classList.remove('cmp-carousel__indicator--active'));
  
  // Add active classes
  if (slides[slideIndex]) {
    slides[slideIndex].classList.add('cmp-carousel__item--active');
  }
  if (indicators[slideIndex]) {
    indicators[slideIndex].classList.add('cmp-carousel__indicator--active');
  }
  
  // Update dataset
  block.dataset.activeSlide = slideIndex;
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.cmp-carousel__item');
  const totalSlides = slides.length;
  
  if (totalSlides === 0) return;
  
  // Handle wrap around
  if (slideIndex >= totalSlides) slideIndex = 0;
  if (slideIndex < 0) slideIndex = totalSlides - 1;
  
  updateActiveSlide(block, slideIndex);
}

function bindEvents(block) {
  // Bind indicator clicks
  const indicators = block.querySelectorAll('.cmp-carousel__indicator');
  indicators.forEach((indicator, idx) => {
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(block, idx);
    });
  });

  // Bind navigation button clicks
  const prevButton = block.querySelector('.cmp-carousel__action--previous');
  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(block, getCurrentSlideIndex(block) - 1);
    });
  }

  const nextButton = block.querySelector('.cmp-carousel__action--next');
  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(block, getCurrentSlideIndex(block) + 1);
    });
  }

  // Auto-advance slides every 5 seconds
  setInterval(() => {
    showSlide(block, getCurrentSlideIndex(block) + 1);
  }, 5000);
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('div');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-item-${slideIndex}-tabpanel`);
  slide.classList.add('cmp-carousel__item');
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-labelledby', `carousel-${carouselId}-item-${slideIndex}-tab`);
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `Slide ${slideIndex + 1} of 3`);
  
  if (slideIndex === 0) {
    slide.classList.add('cmp-carousel__item--active');
  }

  const columns = row.querySelectorAll(':scope > div');
  
  // Process each column - first column should be image, second should be content
  columns.forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-column-${colIdx}`);
    
    if (colIdx === 0) {
      // First column - image
      const picture = column.querySelector('picture');
      if (picture) {
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('cmp-teaser__image');
        imageDiv.append(picture);
        slide.append(imageDiv);
      }
    } else if (colIdx === 1) {
      // Second column - content
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('cmp-teaser__content');
      
      // Copy all content from the column
      contentDiv.innerHTML = column.innerHTML;
      
      // Ensure proper styling for headings
      const headings = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p strong, strong');
      headings.forEach(heading => {
        if (heading.tagName === 'STRONG' || (heading.tagName === 'P' && heading.querySelector('strong'))) {
          // Convert strong elements to h2 for proper styling
          const h2 = document.createElement('h2');
          h2.textContent = heading.textContent;
          heading.parentNode.replaceChild(h2, heading);
        }
      });
      
      // Ensure links have proper button styling
      const links = contentDiv.querySelectorAll('a');
      links.forEach(link => {
        link.classList.add('button');
      });
      
      slide.append(contentDiv);
    }
  });

  return slide;
}

let carouselId = 0;

export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  // Initialize placeholders
  placeholders = await fetchPlaceholders();

  // Add WKND carousel classes
  block.classList.add('cmp-carousel');
  block.setAttribute('role', 'group');
  block.setAttribute('aria-live', 'polite');
  block.setAttribute('aria-roledescription', await getPlaceholder('carousel', 'Carousel'));
  block.setAttribute('data-cmp-delay', '5000');

  // Create main container
  const container = document.createElement('div');
  container.classList.add('cmp-carousel__content');
  container.setAttribute('aria-atomic', 'false');
  container.setAttribute('aria-live', 'polite');

  // Create slides from rows
  const slides = [];
  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slides.push(slide);
    container.append(slide);
    row.remove();
  });

  // Add navigation buttons if multiple slides - FIXED with proper content
  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('cmp-carousel__actions');
    
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.classList.add('cmp-carousel__action', 'cmp-carousel__action--previous');
    prevButton.setAttribute('aria-label', 'Previous Slide');
    prevButton.innerHTML = '<span class="cmp-carousel__action-text">Previous</span>';
    
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.classList.add('cmp-carousel__action', 'cmp-carousel__action--next');
    nextButton.setAttribute('aria-label', 'Next Slide');
    nextButton.innerHTML = '<span class="cmp-carousel__action-text">Next</span>';
    
    slideNavButtons.append(prevButton, nextButton);
    block.append(slideNavButtons);
  }

  // Add container to block
  block.append(container);

  // Add slide indicators if multiple slides
  if (!isSingleSlide) {
    const slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('cmp-carousel__indicators');
    slideIndicators.setAttribute('role', 'tablist');
    slideIndicators.setAttribute('aria-label', 'Choose a slide to display');
    
    slides.forEach((slide, idx) => {
      const indicator = document.createElement('li');
      indicator.setAttribute('id', `carousel-${carouselId}-item-${idx}-tab`);
      indicator.classList.add('cmp-carousel__indicator');
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-controls', `carousel-${carouselId}-item-${idx}-tabpanel`);
      indicator.setAttribute('aria-label', `Slide ${idx + 1}`);
      indicator.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      
      if (idx === 0) {
        indicator.classList.add('cmp-carousel__indicator--active');
      }
      
      slideIndicators.append(indicator);
    });

    block.append(slideIndicators);
  }

  // Initialize carousel
  block.dataset.activeSlide = '0';
  
  if (!isSingleSlide) {
    bindEvents(block);
    // Show first slide
    setTimeout(() => showSlide(block, 0), 100);
  }
}