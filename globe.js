import Globe from 'https://esm.sh/globe.gl';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('globe-canvas');
  if (!container) return;

  // Since we used a canvas before, let's clear it and make sure it's a div
  container.innerHTML = '';
  // Globe.gl creates its own canvas inside the container
  
  // To avoid globe.gl appending to a canvas element, let's swap the canvas with a div
  const divContainer = document.createElement('div');
  divContainer.id = 'globe-container-div';
  divContainer.style.width = '100%';
  divContainer.style.height = '100%';
  container.parentNode.replaceChild(divContainer, container);

  const world = Globe()(divContainer)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('rgba(0,0,0,0)'); // Transparent background to blend with the app

  // Adjust sizing based on container
  const onResize = () => {
    const width = divContainer.clientWidth;
    const height = divContainer.clientHeight;
    world.width(width);
    world.height(height);
  };
  window.addEventListener('resize', onResize);
  onResize();

  // Set initial camera position and auto-rotate
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 1.5;
  world.controls().enableZoom = false; // Disable zooming so it stays as background
  world.pointOfView({ altitude: 2.0 });

  // Optional: Listen to dark mode toggle to switch textures if needed
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(() => {
        const isDark = document.body.classList.contains('dark-theme');
        world.globeImageUrl(
          isDark 
            ? 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
            : 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        );
      }, 50);
    });
  }

  // Check initial theme
  if (document.body.classList.contains('dark-theme')) {
    world.globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
  }
});
