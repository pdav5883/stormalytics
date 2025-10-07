// Navbar configuration for blr-home project
// This file allows easy customization of navbar elements

export const navbarConfig = {
  // Brand/logo configuration
  brand: {
    image: './assets/storm.svg',
    link: '/',
    alt: 'Stormalytics'
  },
  
  // Generic sections - can be dropdowns or direct links
  sections: [
    {
      type: 'link',
      label: 'Storm Verdicts',
      url: '/'
    },
    {
      type: 'link',
      label: 'The System',
      url: '/system.html'
    },
    {
      type: 'dropdown',
      label: 'More',
      items: [
        { name: 'Why <em>stormalytics</em>?', url: '/about.html' },
        { name: 'See the Code', url: 'https://github.com/pdav5883/stormalytics' },
        { name: 'Bear Loves Rocks', url: 'https://home.bearloves.rocks' }
      ]
    }
  ]
};