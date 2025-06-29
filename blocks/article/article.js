export default function decorate(block) {
  console.log('Article block processing started');
  
  // Get all rows from the table
  const rows = Array.from(block.children);
  console.log('Found rows:', rows.length);
  
  // Clear the block
  block.innerHTML = '';
  
  // In EDS, Google Docs tables might have all content in a single row
  // Let's handle both cases: single row with columns, or multiple rows
  let contentColumns = [];
  
  if (rows.length === 1) {
    // Single row case - all columns are in the first row
    console.log('Single row detected - processing columns');
    const firstRow = rows[0];
    contentColumns = Array.from(firstRow.children);
    console.log('Found columns in single row:', contentColumns.length);
  } else if (rows.length >= 2) {
    // Multiple rows case - skip header row, use second row
    console.log('Multiple rows detected - using second row');
    const contentRow = rows[1];
    contentColumns = Array.from(contentRow.children);
    console.log('Found columns in content row:', contentColumns.length);
  } else {
    console.error('No valid structure found');
    return;
  }
  
  // Create the articles grid container
  const grid = document.createElement('div');
  grid.className = 'articles-grid';
  
  // Process each column as an article
  contentColumns.forEach((column, index) => {
    console.log(`Processing column ${index + 1}`);
    console.log('Column content:', column.textContent.substring(0, 100) + '...');
    
    const card = document.createElement('div');
    card.className = 'article-card';
    
    // Extract image
    const img = column.querySelector('img');
    if (img) {
      console.log('Found image in column', index + 1);
      const cardImg = document.createElement('div');
      cardImg.className = 'article-card-image';
      const newImg = img.cloneNode(true);
      cardImg.appendChild(newImg);
      card.appendChild(cardImg);
    }
    
    // Extract title and description from text content
    const allText = column.textContent.split('\n').filter(text => text.trim());
    console.log('Text content for column', index + 1, ':', allText);
    
    let title = '';
    let description = '';
    
    // Find title and description from text content
    for (let i = 0; i < allText.length; i++) {
      const text = allText[i].trim();
      if (text && !text.startsWith('http') && !text.includes('.html') && text !== 'Article') {
        if (!title) {
          title = text;
        } else if (!description && text !== title) {
          description = text;
          break;
        }
      }
    }
    
    console.log(`Column ${index + 1} - Title: "${title}", Description: "${description}"`);
    
    // Add title
    if (title) {
      const cardTitle = document.createElement('div');
      cardTitle.className = 'article-card-title';
      cardTitle.textContent = title;
      card.appendChild(cardTitle);
    }
    
    // Add description
    if (description) {
      const cardDesc = document.createElement('div');
      cardDesc.className = 'article-card-description';
      cardDesc.textContent = description;
      card.appendChild(cardDesc);
    }
    
    // Extract link and make card clickable
    const link = column.querySelector('a');
    if (link && link.href) {
      console.log(`Column ${index + 1} - Found link: ${link.href}`);
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = link.href;
      });
    }
    
    grid.appendChild(card);
  });
  
  block.appendChild(grid);
  console.log('Article block processing completed - created', contentColumns.length, 'cards');
} 