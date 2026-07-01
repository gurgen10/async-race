# Async Race

## Server Repository ##
``` 
- git clone https://github.com/mikhama/async-race-api
- cd async-race-api
- npm install
- npm start

```

## Deploy URL ##

[async race url](https://async-race-eqkt.vercel.app)

## Checklist \_\_\_/400 pts

## 🚀 UI Deployment

- [X] **Deployment Platform:** Successfully deploy the UI on one of the following platforms: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or a similar service.

## ✅ Requirements to Commits and Repository

- [X] **Commit guidelines compliance:** Ensure that all commits follow the specified commit guidelines, thereby promoting a clear and consistent commit history. This includes using meaningful commit messages that accurately describe the changes made.

- [X] **Checklist included in README.md:** Include the project's checklist in the README.md file. Mark all implemented features to provide a clear overview of the project's completion status.

- [X] **Score calculation:** Use this checklist to calculate your score. Check all implemented features, then calculate your score and put it at the top of the `README.md`.

- [X] **UI Deployment link in README.md**: Place the link to the deployed UI at the top of the README.md file, alongside the calculated score.

## Basic Structure (80 points)

- [X] **Two Views (10 points):** Implement two primary views: "Garage" and "Winners".
- [X] **Garage View Content (30 points):** The "Garage" view must display:
  - [X] Name of view
  - [X] Car creation and editing panel
  - [X] Race control panel
  - [X] Garage section
- [X] **Winners View Content (10 points):** The "Winners" view should display:
  - [X] Name of view ("Winners")
  - [X] Winners table
  - [X] Pagination
- [X] **Persistent State (30 points):** Ensure the view state remains consistent when navigating between views. This includes preserving page numbers and input states. For example, page number shouldn't be reset, input controls should contain that they contained before switching, etc.

## Garage View (90 points)

- [X] **Car Creation And Editing Panel. CRUD Operations (20 points):** Enable users to create, update, and delete cars. A car has two attributes: "name" and "color". Empty and too long names should be handled. For "delete"-operation car should be deleted from "garage" table as well as from "winners".
- [X] **Color Selection (10 points):** Allow color selection from an RGB palette ([like here](https://colorspire.com/rgb-color-wheel/)), displaying the selected color on the car's image along with its name.
- [X] **Random Car Creation (20 points):** There should be a button to create random cars (100 cars per click). Name should be assembled from two random parts, for example "Tesla" + "Model S", or "Ford" + "Mustang" (At least 10 different names for each part). Color should be also generated randomly.
- [X] **Car Management Buttons (10 points):** Provide buttons near each car's image for updating its attributes or deleting it.
- [X] **Pagination (10 points):** Implement pagination for the "Garage" view, displaying 7 cars per page.
- [X] **EXTRA POINTS (20 points):**
  - [ ] **Empty Garage** Handle empty garage with user friendly message "No Cars" or something like this. Do it at your discretion.
  - [X] **Empty Garage Page** If you remove the last one car on the page, you should be moved on the previous page, to hide the empty one.

## 🏆 Winners View (50 points)

- [X] **Display Winners (15 points):** After some car wins it should be displayed at the "Winners view" table.
- [X] **Pagination for Winners (10 points):** Implement pagination for the "Winners" view, with 10 winners per page.
- [X] **Winners Table (15 points):** The table should include columns for the car's №, image, name, number of wins, and best time in seconds. If the same car wins more than once the number of wins should be incremented while best time should be saved only if it's better than the stored one.
- [X] **Sorting Functionality (10 points):** Allow users to sort the table by the number of wins and best time, in ascending or descending order.

## 🚗 Race (170 points)

- [X] **Start Engine Animation (20 points):** User clicks to the engine start button near each car -> UI is waiting for car's velocity answer -> animate the car and makes another request to drive. In case api returned 500 error car animation should be stopped.
- [X] **Stop Engine Animation (20 points):** User clicks to the engine stop button near each car -> UI is waiting for answer for stopping engine -> car returned to it's initial place.
- [X] **Responsive Animation (30 points):** Ensure car animations are fluid and responsive on screens as small as 500px.
- [X] **Start Race Button (10 points):** Start button should start the race for all cars on the current page.
- [X] **Reset Race Button (15 points):** Reset button should return all cars to their starting positions.
- [X] **Winner Announcement (5 points):** After some car finishes first user should see the message contains car's name that shows which one has won.
- [X] **Button States (20 points):** Start engine button should be disabled in case car is already in driving mode. As well as stop engine button should be disabled when car is on it's initial place.
- [X] **Actions during the race (50 points):** Control over actions during a running race. Such as, deleting or editing a car, changing a page or view. Adding new cars. You can block buttons and stop the race. The main thing is to ensure predictable operation of the application.

## 🎨 Prettier and ESLint Configuration (10 points)

- [X] **Prettier Setup (5 points):** Prettier is correctly set up with two scripts in `package.json`: `format` for auto-formatting and `ci:format` for checking issues.
- [X] **ESLint Configuration (5 points):** ESLint is configured with the [Airbnb style guide](https://www.npmjs.com/package/eslint-config-airbnb). A `lint` script in `package.json` runs ESLint checks. Configuration files should reflect strict TypeScript settings as per `tsconfig.json`.

## 🌟 Overall Code Quality. (100 points) _Skip during self-check_

- [X] **(Up to 100 points)** Discretionary points awarded by the reviewer based on overall code quality, readability
  - [X] **Modular Design** The application should be clearly divided into logical modules or layers, such as API interaction, UI rendering, and state management.
  - [X] **Function Modularization** Code should be organized into small, clearly named functions with specific purposes. Common functions moved to helper. Each function should not exceed 40 lines.
  - [X] **Code Duplication and Magic Numbers** Minimize code duplication and maintain readability by avoiding the use of magic numbers or strings throughout the codebase.
  - [X] **Readability** Clear, readable code. Understandable names of variables, functions, modules
  - [X] **Extra features** _Example for React: Custom hooks, Portals, React Router_

## 🔄 Evaluation Rules

- **[@Candidate]** The UI should be deployed to gh-pages, Netlify, or a similar service, and the link should be included in the `README.md`.
- **[@Reviewer]** You should clone the [server repository](https://github.com/mikhama/async-race-api.git) and keep the server running during the functionality review.
- **[@Reviewer]** Test task should be evaluated based on both functional and non-functional requirements.
- **[@Candidate]** Pay close attention to details in the implementation, as bugs and deviations from the requirements can impact your score.
- **[@Reviewer]** If bugs are found, the following deductions can be applied:
  - (**-30**) Major bug (implemented functionality works but breaks down after certain manipulations, with unexpected errors in the browser's console).
  - (**-10**) Minor bug (implemented functionality works but behaves inconsistently after certain manipulations, such as a button not becoming enabled after changing some state, with no errors in the browser's console).
  - **Note:** If you repeatedly press the "start engine button" then the "stop engine button" or the "start race button" then the "reset race button" and see a "404" or "429" error, this is not considered a bug.


