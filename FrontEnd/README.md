# Getting Started

## Prerequisites

Make sure you have **[Node.js](https://nodejs.org)** installed on your machine before proceeding.

## Installation

### 1. Enable scripts (if required)

On Windows, you may need to allow script execution. Run this in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install dependencies

```bash
npm install
```

## Running the app

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Production

```bash
npm run build
npm run start
```