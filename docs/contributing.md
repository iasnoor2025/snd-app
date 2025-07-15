# Contributing Guidelines - Laravel 12 Rental Management System

## Overview

Thank you for considering contributing to the Laravel 12 Rental Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## Getting Started

### Prerequisites

1. **Required Software**
    - PHP 8.2 or higher
    - Node.js 18.x or higher
    - MySQL 8.0 or higher
    - Composer 2.x
    - Git

2. **Development Environment**
    - Follow setup instructions in `setup-guide.md`
    - Install recommended IDE extensions
    - Configure code style settings

### First Contribution

1. **Fork the Repository**
    - Visit the GitHub repository
    - Click the "Fork" button
    - Clone your fork locally

2. **Set Up Development Environment**

    ```bash
    # Clone your fork
    git clone https://github.com/your-username/rental-management.git
    cd rental-management

    # Add upstream remote
    git remote add upstream https://github.com/original/rental-management.git

    # Install dependencies
    composer install
    npm install
    ```

## Development Process

### Branch Strategy

1. **Branch Naming**
    - Feature branches: `feature/feature-name`
    - Bug fixes: `fix/bug-description`
    - Hotfixes: `hotfix/issue-description`
    - Documentation: `docs/topic-name`

2. **Working with Branches**

    ```bash
    # Create feature branch
    git checkout -b feature/your-feature

    # Keep branch updated
    git fetch upstream
    git rebase upstream/main

    # Push changes
    git push origin feature/your-feature
    ```

### Commit Guidelines

1. **Commit Message Format**

    ```
    type(scope): description

    [optional body]

    [optional footer]
    ```

2. **Types**
    - feat: New feature
    - fix: Bug fix
    - docs: Documentation changes
    - style: Code style changes
    - refactor: Code refactoring
    - test: Adding or modifying tests
    - chore: Maintenance tasks

3. **Examples**
    ```
    feat(rental): add equipment availability check
    fix(auth): resolve token expiration issue
    docs(api): update authentication documentation
    ```

## Pull Request Process

### Preparing Your PR

1. **Before Submitting**
    - Update your branch with upstream changes
    - Run all tests locally
    - Update documentation if needed
    - Follow coding standards
    - Add tests for new features

2. **PR Checklist**
    - [ ] Code follows style guidelines
    - [ ] Tests added/updated
    - [ ] Documentation updated
    - [ ] Commit messages follow guidelines
    - [ ] Branch is up to date

### Submitting a PR

1. **Create Pull Request**
    - Go to GitHub repository
    - Click "New Pull Request"
    - Select your branch
    - Fill in PR template

2. **PR Template**

    ```markdown
    ## Description

    Brief description of changes

    ## Type of Change

    - [ ] Bug fix
    - [ ] New feature
    - [ ] Breaking change
    - [ ] Documentation update

    ## How Has This Been Tested?

    Describe test cases

    ## Checklist

    - [ ] My code follows style guidelines
    - [ ] I have added tests
    - [ ] Documentation updated
    - [ ] No new warnings
    ```

### Review Process

1. **Code Review**
    - Maintainers will review your code
    - Address review comments
    - Update PR as needed
    - Request re-review when ready

2. **Approval and Merge**
    - Two approvals required
    - All checks must pass
    - Maintainer will merge
    - Delete branch after merge

## Coding Standards

### General Guidelines

1. **Code Style**
    - Follow PSR-12 for PHP
    - Use TypeScript for JavaScript
    - Follow project's ESLint rules
    - Use Prettier for formatting

2. **Best Practices**
    - Write self-documenting code
    - Keep functions small and focused
    - Use meaningful variable names
    - Add comments for complex logic

### Module Development

1. **Module Structure**

    ```
    ModuleName/
    ├── Config/
    ├── Database/
    ├── Http/
    ├── Providers/
    ├── Resources/
    ├── Routes/
    └── Tests/
    ```

2. **Component Guidelines**
    - Follow single responsibility principle
    - Use dependency injection
    - Write testable code
    - Document public APIs

## Testing Guidelines

### Writing Tests

1. **Test Structure**

    ```php
    class FeatureTest extends TestCase
    {
        protected function setUp(): void
        {
            parent::setUp();
            // Setup code
        }

        public function test_feature_works(): void
        {
            // Arrange
            // Act
            // Assert
        }
    }
    ```

2. **Test Coverage**
    - Unit tests for business logic
    - Feature tests for endpoints
    - Integration tests for services
    - Browser tests for UI

### Running Tests

1. **Local Testing**

    ```bash
    # Run all tests
    php artisan test

    # Run specific test
    php artisan test --filter=TestName

    # Run with coverage
    php artisan test --coverage
    ```

2. **CI/CD Testing**
    - Tests run on pull requests
    - Coverage reports generated
    - Performance metrics tracked
    - Security scans performed

## Documentation

### Code Documentation

1. **PHPDoc Blocks**

    ```php
    /**
     * Process a rental request.
     *
     * @param RentalRequest $request
     * @return RentalResponse
     * @throws RentalException
     */
    public function processRental(RentalRequest $request): RentalResponse
    ```

2. **README Files**
    - Module documentation
    - Setup instructions
    - Usage examples
    - API documentation

### API Documentation

1. **OpenAPI/Swagger**

    ```php
    /**
     * @OA\Post(
     *     path="/api/rentals",
     *     summary="Create rental"
     * )
     */
    ```

2. **Postman Collections**
    - API endpoints
    - Request examples
    - Response examples
    - Environment variables

## Additional Information

### Getting Help

1. **Support Channels**
    - GitHub Issues
    - Discussion Forums
    - Slack Channel
    - Email Support

2. **Resources**
    - Project Wiki
    - Documentation
    - Code Examples
    - Video Tutorials

### Recognition

1. **Contributors**
    - Listed in CONTRIBUTORS.md
    - Mentioned in release notes
    - Featured on project website

2. **Rewards**
    - Bug bounties
    - Feature rewards
    - Community recognition
    - Special access

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- Project maintainers
- Contributors
- Supporting organizations
- Open source community
