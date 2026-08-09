# Contributing to QueueWISE

First off, thank you for considering contributing to QueueWISE! It's people like you that make open-source tools such a great community.

## Code of Conduct

By participating in this project, you are expected to uphold a welcoming and inclusive environment. Please be respectful to all contributors.

## How to Contribute

### 1. Fork and Clone
Fork the repository to your own GitHub account, then clone it locally.
```bash
git clone https://github.com/your-username/QueueWISE.git
cd QueueWISE
```

### 2. Branching Strategy
Create a branch for your feature or bug fix. Use descriptive names.
- **Feature**: `feat/add-new-dashboard`
- **Bug Fix**: `fix/socket-connection-error`
- **Docs**: `docs/update-readme`

```bash
git checkout -b feat/your-feature-name
```

### 3. Making Changes
- Ensure your code follows the existing style guidelines.
- For the backend, ensure Prisma schema changes are accompanied by migrations (`npx prisma migrate dev`).
- Test your changes thoroughly locally.

### 4. Commit Standards
We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `refactor:` for code refactoring

Example: `feat: add robust rate limiting to queue generation`

### 5. Submit a Pull Request
- Push your branch to your fork.
- Open a Pull Request against the `development` branch of the main repository.
- Provide a clear description of your changes and reference any related issues.

## Development Environment Setup
Please refer to the `README.md` for full instructions on setting up the backend (Node/Prisma), frontend (React), and ML (Python) environments. Using Docker Compose is highly recommended for local testing.
