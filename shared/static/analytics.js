// Vercel Web Analytics Integration
// This script initializes Vercel Web Analytics on page load
(async function() {
  try {
    // Dynamically import and initialize Vercel Analytics
    const { inject } = await import('@vercel/analytics');
    inject();
  } catch (error) {
    // Silently fail if analytics cannot be loaded
    console.debug('Vercel Analytics failed to load:', error);
  }
})();
