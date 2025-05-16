# ReckonUp

## Overview

ReckonUp is an Electron-based desktop application built using Nextron, integrating Sqllite as the database backend. The app provides an intuitive GUI for managing invoices and payment histories.

## Features

- Export all invoices to Excel
- Auto-update functionality using `electron-updater`
- Integration with sqllite for invoice-related event handling

## Installation

### Prerequisites

- Node.js (Latest LTS recommended)

### Steps to Run ReckonUp

1. Clone the repository:
   ```sh
   git clone https://github.com/NIREX-mig/reckonUp_nextron.git
   cd reckonUp_nextron
   ```

2. Install dependencies:
   ```sh
   yarn & npm install
   ```

3. Start the development server:
   ```sh
   yarn dev & npm run dev
   ```

## Build

To package the application for production:

```sh
 yarn build & npm run build
```

## Usage

- Open the app and navigate through the GUI to manage Invoices.
- Export invoices by selecting the desired dataset and clicking "Export to Excel."
- The app automatically checks for updates and installs them when available.

## Technologies Used

- [Electron](https://www.electronjs.org/)
- [Nextron](https://github.com/saltyshiomix/nextron)
- [electron-updater](https://www.npmjs.com/package/electron-updater)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Contact

For any inquiries, please reach out via [akay93796@gmail.com](mailto:akay93796@gmail.com).
