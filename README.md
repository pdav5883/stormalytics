# Storm Grader

## TODO
- Add youtube link

A modern web application for grading and assessment, built with Bootstrap, jQuery, and Webpack.

## Overview

Storm Grader is a comprehensive grading platform designed to streamline the evaluation process for educators and institutions. It provides an intuitive interface for managing assignments, grading submissions, and tracking student progress.

## Features

- **Modern Web Interface**: Built with Bootstrap 5 for responsive design
- **Grading Workflow**: Streamlined interface for efficient grading
- **Analytics Dashboard**: Comprehensive performance metrics
- **Customizable Rubrics**: Flexible grading criteria
- **Real-time Updates**: Dynamic content loading with jQuery

## Architecture

This project follows a static site architecture suitable for deployment on AWS S3 with CloudFront:

- **Frontend**: HTML, CSS, JavaScript bundled with Webpack
- **Styling**: Bootstrap 5 with custom CSS
- **Scripts**: jQuery for DOM manipulation and AJAX
- **Build**: Webpack for bundling and optimization
- **Deployment**: AWS S3 static hosting with CloudFront CDN

## Project Structure

stormalytics/
├── src/
│   ├── scripts/
│   │   ├── shared.js      # Main JavaScript entry point
│   │   └── navonly.js     # Navigation loading script
│   ├── styles/
│   │   └── custom.css     # Custom styles and Bootstrap overrides
│   ├── images/            # Static assets
│   ├── index.html         # Home page template
│   ├── about.html         # About page template
│   ├── grading.html       # Grading interface template
│   └── nav.html           # Navigation component
├── webpack.config.js      # Webpack configuration
├── package.json           # Dependencies and scripts
├── deploy.sh             # AWS deployment script
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS CLI (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stormalytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

4. Open your browser to `http://localhost:8000`

### Building for Production

```bash
npm run build
```

This will create a `dist/` directory with optimized files ready for deployment.

## Deployment

### AWS S3 + CloudFront

1. Configure your AWS credentials:
   ```bash
   aws configure
   ```

2. Update the bucket name in `deploy.sh`

3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the contents of `dist/` to your web server
3. Configure your web server to serve static files

## Development

### Adding New Pages

1. Create a new HTML template in `src/`
2. Add a new HtmlWebpack plugin entry in `webpack.config.js`
3. Update navigation in `src/nav.html`

### Styling

- Custom styles go in `src/styles/custom.css`
- Bootstrap classes are available globally
- Use CSS custom properties for consistent theming

### Scripts

- Main JavaScript goes in `src/scripts/shared.js`
- Page-specific scripts can be added to individual HTML files
- jQuery and Bootstrap JavaScript are available globally

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
